import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useInventory } from '../hooks/useInventory';
import { useSelection } from '../context/SelectionContext';
import { Plaza, TipoSoporte, Disponibilidad, InventoryItem, Coordinates, isMobileRoute, getDisponibilidad } from '../types';
import { SupportCard } from '../components/inventory/SupportCard';
import { InventoryFilterBar } from '../components/inventory/InventoryFilterBar';
import { LeafletInventoryMap } from '../components/map/LeafletInventoryMap';
import { StickySelectionBar } from '../components/map/StickySelectionBar';
import { MediakitPanel } from '../components/map/MediakitPanel';
import { SupportDetailModal } from '../components/inventory/SupportDetailModal';
import { calculateDistance } from '../utils/distance';
import { Map, List, AlertCircle, Loader2, Sparkles, SlidersHorizontal, CheckCircle2, Columns } from 'lucide-react';

export default function Inventario() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: allItems, loading, error, refetch } = useInventory();
  const { selectedCount, getSelectedItems } = useSelection();

  // URL query parameters synchronization
  const plazaParam = searchParams.get('plaza') as Plaza | 'todos' | null;
  const tipoParam = searchParams.get('tipo') as TipoSoporte | 'todos' | null;
  const dispParam = searchParams.get('disponibilidad') as Disponibilidad | 'todos' | null;
  const soporteParam = searchParams.get('soporte');
  const queryParam = searchParams.get('q') ?? '';

  // Filter States
  const [selectedPlaza, setSelectedPlaza] = useState<Plaza | 'todos'>(plazaParam || 'todos');
  const [selectedTipo, setSelectedTipo] = useState<TipoSoporte | 'todos'>(tipoParam || 'todos');
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState<Disponibilidad | 'todos'>(dispParam || 'todos');
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);

  // Proximity & Geolocation State
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Active selection & modal states
  const [selectedSupport, setSelectedSupport] = useState<InventoryItem | null>(null);
  const [detailedItem, setDetailedItem] = useState<InventoryItem | null>(null);
  const [isMediakitOpen, setIsMediakitOpen] = useState<boolean>(false);

  // Active view tab: 'map' (full map) or 'list' (full list grid) for desktop & mobile
  const [viewTab, setViewTab] = useState<'map' | 'list'>('map');

  // Handle URL sync
  useEffect(() => {
    if (soporteParam && allItems.length > 0) {
      const found = allItems.find((it) => it.canonical_id === soporteParam);
      if (found) {
        setSelectedSupport(found);
      }
    }
  }, [soporteParam, allItems]);

  // Request browser GPS position
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en este navegador.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error or dismissed:', err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const handleClearUserCoords = useCallback(() => {
    setUserCoords(null);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedPlaza('todos');
    setSelectedTipo('todos');
    setSelectedDisponibilidad('todos');
    setSearchQuery('');
    setUserCoords(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Filter & rank items by proximity and criteria
  const filteredAndRankedItems = useMemo(() => {
    let result = allItems.filter((item) => {
      // Plaza filter
      if (selectedPlaza !== 'todos' && item.ciudad !== selectedPlaza) {
        return false;
      }
      // Tipo filter
      if (selectedTipo !== 'todos' && item.tipo_soporte !== selectedTipo) {
        return false;
      }
      // Disponibilidad filter
      const disp = getDisponibilidad(item);
      if (selectedDisponibilidad !== 'todos' && disp !== selectedDisponibilidad) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const address = 'address' in item ? item.address.toLowerCase() : '';
        const name = item.name.toLowerCase();
        const desc = item.description ? item.description.toLowerCase() : '';
        const characteristics = item.characteristics ? item.characteristics.toLowerCase() : '';
        const matches =
          name.includes(q) ||
          address.includes(q) ||
          desc.includes(q) ||
          characteristics.includes(q) ||
          item.canonical_id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    // If user coordinates exist, sort by proximity
    if (userCoords) {
      result = [...result].sort((a, b) => {
        const getCoord = (it: InventoryItem): Coordinates | null => {
          if ('lat' in it && it.lat !== null && it.lng !== null) return { lat: it.lat, lng: it.lng };
          if (isMobileRoute(it) && it.waypoints?.[0]?.lat) {
            return { lat: it.waypoints[0].lat!, lng: it.waypoints[0].lng! };
          }
          return null;
        };

        const ca = getCoord(a);
        const cb = getCoord(b);
        if (!ca) return 1;
        if (!cb) return -1;
        return calculateDistance(userCoords, ca) - calculateDistance(userCoords, cb);
      });
    }

    return result;
  }, [allItems, selectedPlaza, selectedTipo, selectedDisponibilidad, searchQuery, userCoords]);

  // Calculate distance label for a given item
  const getItemDistanceLabel = useCallback(
    (item: InventoryItem): string | null => {
      if (!userCoords) return null;
      let target: Coordinates | null = null;
      if ('lat' in item && item.lat !== null && item.lng !== null) {
        target = { lat: item.lat, lng: item.lng };
      } else if (isMobileRoute(item) && item.waypoints?.[0]?.lat) {
        target = { lat: item.waypoints[0].lat!, lng: item.waypoints[0].lng! };
      }
      if (!target) return null;
      const km = calculateDistance(userCoords, target);
      if (km < 1) {
        return `A ${Math.round(km * 1000)} m`;
      }
      return `A ${km.toFixed(1)} km`;
    },
    [userCoords]
  );

  const selectedMediaKitItems = useMemo(
    () => getSelectedItems(allItems),
    [getSelectedItems, allItems, selectedCount]
  );

  const hasActiveFilters =
    selectedPlaza !== 'todos' ||
    selectedTipo !== 'todos' ||
    selectedDisponibilidad !== 'todos' ||
    searchQuery.trim().length > 0 ||
    userCoords !== null;

  return (
    <div className="relative w-full flex-1 flex flex-col bg-[#F9F9F9] overflow-hidden">
      {/* Integrated Header Bar: Horizontal Filters & View Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex-1">
          <InventoryFilterBar
            selectedPlaza={selectedPlaza}
            onSelectPlaza={setSelectedPlaza}
            selectedTipo={selectedTipo}
            onSelectTipo={setSelectedTipo}
            selectedDisponibilidad={selectedDisponibilidad}
            onSelectDisponibilidad={setSelectedDisponibilidad}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
            hasActiveUserCoords={userCoords !== null}
            onClearUserCoords={handleClearUserCoords}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalCount={filteredAndRankedItems.length}
          />
        </div>

        {/* Tabbed Navigation Segmented Control for Map vs List */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl shrink-0 self-start xl:self-center">
          <button
            type="button"
            onClick={() => setViewTab('map')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewTab === 'map'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Mapa
          </button>
          <button
            type="button"
            onClick={() => setViewTab('list')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewTab === 'list'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista ({filteredAndRankedItems.length})
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full h-[calc(100vh-120px)] relative overflow-hidden flex flex-col">
        {viewTab === 'list' ? (
          /* UNIFIED LIST / GRID VIEW (Desktop & Mobile) */
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Mobile Scrollable Card List (only displayed on mobile) */}
            <div className="md:hidden flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 bg-white border-b border-gray-200/80 flex items-center justify-between text-xs text-gray-500 shrink-0">
                <span className="font-semibold text-gray-800">
                  {filteredAndRankedItems.length} {filteredAndRankedItems.length === 1 ? 'soporte' : 'soportes'}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Cargando...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <p className="font-bold">Error al cargar inventario</p>
                    <button type="button" onClick={refetch} className="underline mt-1">Reintentar</button>
                  </div>
                ) : filteredAndRankedItems.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-500">No hay soportes coincidentes.</div>
                ) : (
                  filteredAndRankedItems.map((item) => (
                    <div
                      key={item.canonical_id}
                      onClick={() => {
                        setSelectedSupport(item);
                        setViewTab('map');
                      }}
                      className="cursor-pointer"
                    >
                      <SupportCard
                        item={item}
                        variant="catalog"
                        selectable={true}
                        distanceLabel={getItemDistanceLabel(item)}
                        isFocused={selectedSupport?.canonical_id === item.canonical_id}
                        onSelectOnMap={(it) => {
                          setSelectedSupport(it);
                          setViewTab('map');
                        }}
                        onOpenDetail={(it) => setDetailedItem(it)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Desktop Grid View */}
            <section className="hidden md:flex flex-1 flex-col h-full bg-gray-50/30 overflow-hidden">
              {/* Results Summary Header */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0 shadow-2xs">
                <span className="font-bold text-gray-800 text-sm">
                  {filteredAndRankedItems.length}{' '}
                  {filteredAndRankedItems.length === 1 ? 'soporte disponible' : 'soportes disponibles'}
                </span>
                {userCoords ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Ordenados por cercanía a ti
                  </span>
                ) : (
                  <span className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">
                    {selectedPlaza === 'mendoza'
                      ? 'Gran Mendoza'
                      : selectedPlaza === 'buenos-aires'
                      ? 'Buenos Aires'
                      : 'Catálogo de Soportes'}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin text-black mb-3" />
                    <p className="text-sm font-semibold text-gray-600">Cargando catálogo publicitario...</p>
                  </div>
                ) : error ? (
                  <div className="max-w-md mx-auto p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <p className="font-bold">No se pudo cargar el inventario</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                    <button type="button" onClick={refetch} className="mt-3 text-xs font-bold underline">Reintentar</button>
                  </div>
                ) : filteredAndRankedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <SlidersHorizontal className="w-10 h-10 text-gray-300 mb-3" />
                    <h3 className="text-base font-bold text-gray-900">No encontramos soportes</h3>
                    <p className="text-xs text-gray-400 mt-1">Intenta restablecer o modificar los criterios de búsqueda.</p>
                    <button type="button" onClick={handleResetFilters} className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl">Restablecer filtros</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndRankedItems.map((item) => (
                      <div key={item.canonical_id} className="h-full">
                        <SupportCard
                          item={item}
                          variant="catalog"
                          selectable={true}
                          distanceLabel={getItemDistanceLabel(item)}
                          isFocused={selectedSupport?.canonical_id === item.canonical_id}
                          onSelectOnMap={(it) => {
                            setSelectedSupport(it);
                            setViewTab('map');
                          }}
                          onOpenDetail={(it) => setDetailedItem(it)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* UNIFIED MAP VIEW (Desktop & Mobile) */
          <main className="flex-1 h-full w-full relative overflow-hidden">
            <LeafletInventoryMap
              items={filteredAndRankedItems}
              selectedItem={selectedSupport}
              onSelectItem={(it) => setSelectedSupport(it)}
              userCoords={userCoords}
              searchCoords={null}
              searchLabel={searchQuery || undefined}
              onOpenDetail={(it) => setDetailedItem(it)}
            />

            {/* Floating Mobile button when inside map view */}
            <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
              <button
                type="button"
                onClick={() => setViewTab('list')}
                className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-full shadow-2xl hover:bg-slate-900 transition active:scale-95"
              >
                <List className="w-3.5 h-3.5" />
                Ver Lista
              </button>
            </div>
          </main>
        )}
      </div>

      {/* Persistent Media Kit Sticky Bar */}
      <StickySelectionBar
        onOpenMediakit={() => setIsMediakitOpen(true)}
        currentPlaza={selectedPlaza}
        inventoryItems={allItems}
      />

      {/* Media Kit Drawer / Panel */}
      {isMediakitOpen && (
        <MediakitPanel
          selectedItems={selectedMediaKitItems}
          onClose={() => setIsMediakitOpen(false)}
        />
      )}

      {/* Support Detail Modal */}
      <AnimatePresence>
        {detailedItem && (
          <SupportDetailModal
            item={detailedItem}
            onClose={() => setDetailedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
