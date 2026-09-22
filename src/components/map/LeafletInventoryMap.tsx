import React, { useEffect, useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { InventoryItem, LocationRecord, Coordinates, isMobileRoute, getDisponibilidad } from '../../types';
import { useSelection } from '../../context/SelectionContext';
import { Layers, MapPin, Navigation, ZoomIn, ZoomOut, Check, Plus, Eye, Monitor, Truck, Crosshair } from 'lucide-react';

interface LeafletInventoryMapProps {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem) => void;
  userCoords: Coordinates | null;
  searchCoords: Coordinates | null;
  searchLabel?: string;
  onOpenDetail?: (item: InventoryItem) => void;
}

const MENDOZA_CENTER: Coordinates = { lat: -32.8908, lng: -68.8458 };
const BUENOS_AIRES_CENTER: Coordinates = { lat: -34.6037, lng: -58.4200 };

// Custom marker icons using Leaflet DivIcons styled with Tailwind CSS
const getMarkerIcon = (item: InventoryItem, isSelected: boolean, isActive: boolean) => {
  const disp = getDisponibilidad(item);
  const isReserved = disp === 'reservado';
  const isLed = item.tipo_soporte === 'led';
  const isMobile = item.tipo_soporte === 'led_movil';

  let bgColor = 'bg-slate-900 text-white';
  if (isLed) {
    bgColor = 'bg-indigo-600 text-white';
  } else if (isMobile) {
    bgColor = 'bg-amber-500 text-white';
  }

  if (isSelected) {
    bgColor = 'bg-emerald-600 text-white ring-4 ring-emerald-300';
  }

  const activeClass = isActive ? 'scale-125 z-[1000]' : 'hover:scale-110 z-[200]';

  const iconHtml = `
    <div class="relative cursor-pointer transition-transform duration-200 ${activeClass}">
      <div class="flex items-center justify-center w-9 h-9 rounded-xl shadow-xl ${bgColor} ring-2 ring-white">
        ${
          isMobile
            ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>'
            : isLed
            ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16v10H4z"/><path d="M12 14v7"/><path d="M8 21h8"/></svg>'
        }
      </div>
      ${
        isReserved
          ? '<span class="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white shadow-sm animate-pulse"></span>'
          : '<span class="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>'
      }
      ${
        isSelected
          ? '<div class="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-black shadow-xs">✓</div>'
          : ''
      }
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'leaflet-custom-divicon-wrapper',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -14],
  });
};

const getUserLocationIcon = () => {
  const iconHtml = `
    <div class="relative flex items-center justify-center">
      <div class="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center animate-ping absolute"></div>
      <div class="w-4.5 h-4.5 rounded-full bg-blue-600 border-2 border-white shadow-md z-10"></div>
    </div>
  `;
  return L.divIcon({
    html: iconHtml,
    className: 'leaflet-custom-divicon-wrapper',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getSearchLocationIcon = () => {
  const iconHtml = `
    <div class="relative flex items-center justify-center">
      <div class="w-9 h-9 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center animate-ping absolute"></div>
      <div class="text-red-600 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 filter drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      </div>
    </div>
  `;
  return L.divIcon({
    html: iconHtml,
    className: 'leaflet-custom-divicon-wrapper',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Map controller to listen to events, fits bounds and programmatically pans
function MapController({
  items,
  selectedItem,
  userCoords,
  searchCoords,
  setMapInstance,
}: {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  userCoords: Coordinates | null;
  searchCoords: Coordinates | null;
  setMapInstance: (map: L.Map) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);

  // Adjust view to centered selected element
  useEffect(() => {
    if (!selectedItem || !map) return;

    let lat = 0;
    let lng = 0;

    if ('lat' in selectedItem && selectedItem.lat !== null && selectedItem.lng !== null) {
      lat = selectedItem.lat;
      lng = selectedItem.lng;
    } else if (isMobileRoute(selectedItem) && selectedItem.waypoints?.length) {
      const pt = selectedItem.waypoints[0];
      if (pt.lat !== null && pt.lng !== null) {
        lat = pt.lat;
        lng = pt.lng;
      }
    }

    if (lat && lng) {
      map.setView([lat, lng], 14, { animate: true });
    }
  }, [selectedItem, map]);

  // Fits bounds initially and dynamically
  const fitAllBounds = useCallback(() => {
    if (!map || items.length === 0) return;
    const latLngs: L.LatLngExpression[] = [];

    items.forEach((item) => {
      if ('lat' in item && item.lat !== null && item.lng !== null) {
        latLngs.push([item.lat, item.lng]);
      } else if (isMobileRoute(item) && item.routePath?.length) {
        item.routePath.forEach(([lLat, lLng]) => {
          latLngs.push([lLat, lLng]);
        });
      }
    });

    if (searchCoords) {
      latLngs.push([searchCoords.lat, searchCoords.lng]);
    }

    if (userCoords) {
      latLngs.push([userCoords.lat, userCoords.lng]);
    }

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [items, searchCoords, userCoords, map]);

  useEffect(() => {
    fitAllBounds();
  }, [items, searchCoords, userCoords]);

  // Watch for container resize to ensure tiles render seamlessly
  useEffect(() => {
    if (!map) return;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const mapEl = map.getContainer();
    if (mapEl) {
      observer.observe(mapEl);
    }
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export function LeafletInventoryMap({
  items,
  selectedItem,
  onSelectItem,
  userCoords,
  searchCoords,
  searchLabel,
  onOpenDetail,
}: LeafletInventoryMapProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const { isSelected, toggleSelect } = useSelection();

  const [visibleLayers, setVisibleLayers] = useState({
    tradicional: true,
    led: true,
    led_movil: true,
  });

  const toggleLayer = (layer: 'tradicional' | 'led' | 'led_movil') => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const toggleMapType = () => {
    setMapType((prev) => (prev === 'roadmap' ? 'satellite' : 'roadmap'));
  };

  const handleCenterCity = (city: 'mendoza' | 'buenos-aires') => {
    if (!mapInstance) return;
    const target = city === 'mendoza' ? MENDOZA_CENTER : BUENOS_AIRES_CENTER;
    mapInstance.setView([target.lat, target.lng], 12, { animate: true });
  };

  // Helper to determine the center of the MapContainer initially
  const getInitialCenter = (): L.LatLngExpression => {
    const hasBsAs = items.some((i) => i.ciudad === 'buenos-aires');
    const hasMendoza = items.some((i) => i.ciudad === 'mendoza');
    if (hasBsAs && !hasMendoza) return [BUENOS_AIRES_CENTER.lat, BUENOS_AIRES_CENTER.lng];
    return [MENDOZA_CENTER.lat, MENDOZA_CENTER.lng];
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-gray-100">
      {/* Map Element using react-leaflet */}
      <MapContainer
        center={getInitialCenter()}
        zoom={12}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full z-0"
      >
        <MapController
          items={items}
          selectedItem={selectedItem}
          userCoords={userCoords}
          searchCoords={searchCoords}
          setMapInstance={setMapInstance}
        />

        {/* Dynamic Tile Layer switching between OpenStreetMap and Esri Satelital */}
        {mapType === 'roadmap' ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}

        {/* User GPS Location marker */}
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={getUserLocationIcon()}>
            <Popup className="custom-leaflet-popup-container">
              <div className="p-1.5 text-xs font-semibold text-slate-800">
                📍 Tu ubicación actual
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search Coordinates Marker */}
        {searchCoords && (
          <Marker position={[searchCoords.lat, searchCoords.lng]} icon={getSearchLocationIcon()}>
            <Popup className="custom-leaflet-popup-container">
              <div className="p-1.5 text-xs text-slate-800">
                <span className="font-bold block">📍 Lugar buscado:</span>
                <span className="text-gray-500 mt-0.5 block">{searchLabel || 'Ubicación seleccionada'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* OOH items Map Pins */}
        {items.map((item) => {
          if (!visibleLayers[item.tipo_soporte]) return null;
          const selected = isSelected(item.canonical_id);
          const active = selectedItem?.canonical_id === item.canonical_id;
          const disp = getDisponibilidad(item);

          let itemLat = 0;
          let itemLng = 0;

          if ('lat' in item && item.lat !== null && item.lng !== null) {
            itemLat = item.lat;
            itemLng = item.lng;
          } else if (isMobileRoute(item) && item.waypoints?.length) {
            const firstWp = item.waypoints[0];
            if (firstWp.lat !== null && firstWp.lng !== null) {
              itemLat = firstWp.lat;
              itemLng = firstWp.lng;
            }
          }

          if (!itemLat || !itemLng) return null;

          const imageUrl = item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
          const address = 'address' in item ? item.address : item.ciudad === 'mendoza' ? 'Gran Mendoza' : 'Buenos Aires';
          const tipoLabel = item.tipo_soporte === 'led_movil' ? 'LED Móvil' : item.tipo_soporte === 'led' ? 'Pantalla LED' : 'Tradicional';

          return (
            <React.Fragment key={item.canonical_id}>
              {/* Draw Route Paths for Mobile screens */}
              {isMobileRoute(item) && item.routePath && item.routePath.length > 0 && (
                <>
                  <Polyline
                    positions={item.routePath as L.LatLngExpression[]}
                    pathOptions={{
                      color: active ? '#f59e0b' : '#fbbf24',
                      weight: active ? 8 : 4,
                      opacity: active ? 0.45 : 0.25,
                    }}
                  />
                  <Polyline
                    positions={item.routePath as L.LatLngExpression[]}
                    pathOptions={{
                      color: active ? '#d97706' : '#eab308',
                      weight: active ? 3.5 : 2,
                      opacity: 0.9,
                      dashArray: active ? '10, 10' : '6, 12',
                    }}
                  />
                </>
              )}

              {/* Pin marker */}
              <Marker
                position={[itemLat, itemLng]}
                icon={getMarkerIcon(item, selected, active)}
                eventHandlers={{
                  click: () => onSelectItem(item),
                }}
              >
                <Popup className="custom-leaflet-popup-container" maxWidth={280}>
                  <div className="p-1 max-w-[280px] font-sans text-slate-900" style={{ minWidth: '210px' }}>
                    <div className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider ${
                        disp === 'disponible' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {disp === 'disponible' ? 'Disponible' : 'Reservado'}
                      </span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-white">
                        {tipoLabel}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-tight mb-1">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mb-2">📍 {address}</p>

                    {item.technical?.measures && (
                      <p className="text-[10px] font-medium text-slate-600 mb-2">📐 Medidas: {item.technical.measures}</p>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item);
                        }}
                        className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-md text-white transition-all duration-200 active:scale-95 ${
                          selected ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-950 hover:bg-slate-800'
                        }`}
                      >
                        {selected ? '✓ En Media Kit' : '+ Agregar'}
                      </button>
                      {onOpenDetail && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetail(item);
                          }}
                          className="py-1 px-2 text-[11px] font-bold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          Detalles
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* FLOATING MAP CONTROL PANELS (Road/Satellite, City Center and Filter toggles) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        {/* Map Type toggle (Roadmap vs Satellite) */}
        <button
          type="button"
          onClick={toggleMapType}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-black rounded-xl shadow-lg hover:bg-slate-50 border border-slate-200/50 transition"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>{mapType === 'roadmap' ? 'Ver Satelital' : 'Ver Mapa Vial'}</span>
        </button>

        {/* Quick Plaza Centering links */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-lg border border-slate-200/50">
          <button
            type="button"
            onClick={() => handleCenterCity('mendoza')}
            className="px-2.5 py-1 text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
          >
            Mendoza
          </button>
          <div className="w-px h-3 bg-slate-200" />
          <button
            type="button"
            onClick={() => handleCenterCity('buenos-aires')}
            className="px-2.5 py-1 text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
          >
            Bs. As.
          </button>
        </div>
      </div>

      {/* Floating Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => mapInstance?.zoomIn()}
          className="w-8.5 h-8.5 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-lg flex items-center justify-center hover:bg-slate-50 hover:text-slate-950 transition"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => mapInstance?.zoomOut()}
          className="w-8.5 h-8.5 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-lg flex items-center justify-center hover:bg-slate-50 hover:text-slate-950 transition"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Map Active Layers Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200/50 flex flex-col gap-2 max-w-[200px]">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capas OOH</h5>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleLayer('led')}
            className={`flex items-center justify-between text-left text-[11px] font-bold w-full transition ${
              visibleLayers.led ? 'text-slate-900' : 'text-slate-400 line-through'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600 flex-shrink-0" />
              LED Fijo
            </span>
            {visibleLayers.led && <Check className="w-3 h-3 text-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('tradicional')}
            className={`flex items-center justify-between text-left text-[11px] font-bold w-full transition ${
              visibleLayers.tradicional ? 'text-slate-900' : 'text-slate-400 line-through'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-900 flex-shrink-0" />
              Estáticos
            </span>
            {visibleLayers.tradicional && <Check className="w-3 h-3 text-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('led_movil')}
            className={`flex items-center justify-between text-left text-[11px] font-bold w-full transition ${
              visibleLayers.led_movil ? 'text-slate-900' : 'text-slate-400 line-through'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 flex-shrink-0" />
              LED Móvil
            </span>
            {visibleLayers.led_movil && <Check className="w-3 h-3 text-emerald-500" />}
          </button>
        </div>
      </div>
    </div>
  );
}
