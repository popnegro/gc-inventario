import React, { useState, useEffect, useRef } from 'react';
import { Compass, X, MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { Coordinates } from '../types';

interface SearchBarProps {
  onSelectLocation: (coords: Coordinates, addressLabel: string) => void;
  onClearLocation?: () => void;
  searchLabel: string;
  setSearchLabel: (label: string) => void;
  onLocateMe?: () => void;
  isLocating?: boolean;
  userCoords?: Coordinates | null;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const ARGENTINA_LOCATIONS = [
  { name: 'Km 0 Mendoza', label: 'San Martín y Peatonal Sarmiento, Mendoza', coords: { lat: -32.8903, lng: -68.8415 } },
  { name: 'Chacras de Coria', label: 'Chacras de Coria, Luján de Cuyo, Mendoza', coords: { lat: -32.9820, lng: -68.8750 } },
  { name: 'Palmares Open Mall', label: 'Palmares Open Mall, Godoy Cruz, Mendoza', coords: { lat: -32.9550, lng: -68.8550 } },
  { name: 'Acceso Este', label: 'Acceso Este, Guaymallén, Mendoza', coords: { lat: -32.8985, lng: -68.8052 } },
  { name: 'Obelisco CABA', label: 'Obelisco, Buenos Aires', coords: { lat: -34.6037, lng: -58.3816 } },
  { name: 'Palermo CABA', label: 'Palermo, Buenos Aires', coords: { lat: -34.5889, lng: -58.4306 } },
  { name: 'Caballito CABA', label: 'Caballito, Buenos Aires', coords: { lat: -34.6242, lng: -58.4414 } },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  onClearLocation,
  searchLabel,
  setSearchLabel,
  onLocateMe,
  isLocating = false,
  userCoords,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Nominatim API Query
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Query OpenStreetMap Nominatim for locations, biased toward Argentina
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query + ', Argentina'
          )}&limit=5&addressdetails=1`
        );
        if (response.ok) {
          const data: NominatimResult[] = await response.json();
          setSuggestions(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.error('Error fetching suggestions from Nominatim:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (item: NominatimResult) => {
    const coords: Coordinates = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };
    
    // Clean up display name (e.g. shorten very long OSM descriptions)
    const parts = item.display_name.split(',');
    const shortLabel = parts.slice(0, 3).join(',').trim();

    setSearchLabel(shortLabel);
    onSelectLocation(coords, shortLabel);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSearchLabel('');
    if (onClearLocation) {
      onClearLocation();
    }
  };

  return (
    <div className="w-full space-y-2 relative" ref={dropdownRef}>
      {/* Search Input Row */}
      {!searchLabel && (
        <div className="w-full flex items-center gap-1.5 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar dirección o zona (ej. Godoy Cruz, Belgrano)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-slate-400/50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onLocateMe && (
            <button
              type="button"
              onClick={onLocateMe}
              disabled={isLocating}
              className={`w-[42px] h-[42px] min-w-[42px] flex items-center justify-center rounded-xl transition-all shadow-xs shrink-0 cursor-pointer ${
                userCoords
                  ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                  : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-850 hover:shadow-md'
              }`}
              title="Mi ubicación"
              aria-label="Mi ubicación"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 shrink-0" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Floating Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && !searchLabel && (
        <div className="absolute left-0 right-0 top-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {suggestions.map((item, index) => (
            <button
              key={`${item.place_id || 'suggest'}_${index}`}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full text-left px-4 py-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-2.5 transition text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="truncate">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular Location Chips */}
      {!searchLabel && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none">
          {ARGENTINA_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => {
                setSearchLabel(loc.name);
                onSelectLocation(loc.coords, loc.name);
              }}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-slate-700/60"
            >
              <MapPin className="w-2.5 h-2.5 opacity-70" />
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Selected Location Badge */}
      {searchLabel && (
        <div className="flex items-center justify-between px-3 py-2 bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/90 dark:border-blue-800/80 rounded-xl text-xs text-blue-950 dark:text-blue-100 shadow-2xs">
          <div className="flex items-center gap-2 truncate min-w-0 mr-2">
            <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-xs text-blue-950 dark:text-blue-100 truncate">
              {searchLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 border border-blue-200 dark:border-blue-800/60 rounded-md transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            title="Cambiar ubicación"
          >
            <X className="w-3 h-3" />
            <span>Cambiar</span>
          </button>
        </div>
      )}
    </div>
  );
};
