import React from 'react';
import { Plaza, TipoSoporte, Disponibilidad } from '../../types';
import { Search, X, RotateCcw, Crosshair } from 'lucide-react';

interface InventoryFilterBarProps {
  selectedPlaza: Plaza | 'todos';
  onSelectPlaza: (plaza: Plaza | 'todos') => void;
  selectedTipo: TipoSoporte | 'todos';
  onSelectTipo: (tipo: TipoSoporte | 'todos') => void;
  selectedDisponibilidad: Disponibilidad | 'todos';
  onSelectDisponibilidad: (disp: Disponibilidad | 'todos') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  hasActiveUserCoords: boolean;
  onClearUserCoords: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
}

export function InventoryFilterBar({
  selectedPlaza,
  onSelectPlaza,
  selectedTipo,
  onSelectTipo,
  selectedDisponibilidad,
  onSelectDisponibilidad,
  searchQuery,
  onSearchChange,
  onLocateMe,
  isLocating,
  hasActiveUserCoords,
  onClearUserCoords,
  onResetFilters,
  hasActiveFilters,
}: InventoryFilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white border-b border-gray-200 shrink-0">
      {/* Filter Control Group */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Plaza Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plaza:</span>
          <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
            <button
              type="button"
              onClick={() => onSelectPlaza('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                selectedPlaza === 'todos'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => onSelectPlaza('mendoza')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                selectedPlaza === 'mendoza'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Mendoza
            </button>
            <button
              type="button"
              onClick={() => onSelectPlaza('buenos-aires')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                selectedPlaza === 'buenos-aires'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Bs. As.
            </button>
          </div>
        </div>

        <div className="hidden md:block w-px h-5 bg-gray-200" />

        {/* Tipo Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tipo:</span>
          <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
            <button
              type="button"
              onClick={() => onSelectTipo('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                selectedTipo === 'todos'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => onSelectTipo('led')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                selectedTipo === 'led'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
              LED
            </button>
            <button
              type="button"
              onClick={() => onSelectTipo('tradicional')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                selectedTipo === 'tradicional'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Estáticos
            </button>
            <button
              type="button"
              onClick={() => onSelectTipo('led_movil')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                selectedTipo === 'led_movil'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              <span className="w-1 h-1 rounded-full bg-amber-500"></span>
              Móvil
            </button>
          </div>
        </div>

        <div className="hidden md:block w-px h-5 bg-gray-200" />

        {/* Solo Disponibles */}
        <button
          type="button"
          onClick={() =>
            onSelectDisponibilidad(selectedDisponibilidad === 'disponible' ? 'todos' : 'disponible')
          }
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border ${
            selectedDisponibilidad === 'disponible'
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-2xs'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${selectedDisponibilidad === 'disponible' ? 'bg-white' : 'bg-emerald-500'}`}></span>
          Solo Disponibles
        </button>

        {/* GPS location button */}
        <button
          type="button"
          onClick={hasActiveUserCoords ? onClearUserCoords : onLocateMe}
          disabled={isLocating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
            hasActiveUserCoords
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-blue-500' : hasActiveUserCoords ? 'text-blue-500' : 'text-gray-400'}`} />
          <span>{isLocating ? 'Ubicando...' : 'Cerca de mí'}</span>
          {hasActiveUserCoords && <X className="w-3 h-3 text-blue-500" />}
        </button>
      </div>

      {/* Search Input & Reset Group */}
      <div className="flex items-center gap-2 flex-1 lg:max-w-xs xl:max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por avenida o zona..."
            className="w-full pl-9 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs text-gray-900 placeholder:text-gray-400 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 p-1.5 rounded-xl transition"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
