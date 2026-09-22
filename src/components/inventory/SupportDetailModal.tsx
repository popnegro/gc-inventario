import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem, isMobileRoute, getDisponibilidad } from '../../types';
import { useSelection } from '../../context/SelectionContext';
import { X, MapPin, Monitor, Check, Plus, ExternalLink, Calendar, Layers, ShieldCheck, Mail } from 'lucide-react';

interface SupportDetailModalProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export function SupportDetailModal({ item, onClose }: SupportDetailModalProps) {
  const { isSelected, toggleSelect } = useSelection();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const selected = isSelected(item.canonical_id);
  const disp = getDisponibilidad(item);
  const isReserved = disp === 'reservado';
  const address = 'address' in item ? item.address : item.ciudad;
  const isLed = item.tipo_soporte === 'led';
  const isLedMovil = item.tipo_soporte === 'led_movil';
  const imageUrl = item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card with spring motion */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {/* Header Media */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-900 shrink-0">
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white shadow-lg transition"
            aria-label="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                disp === 'disponible' ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            >
              {disp === 'disponible' ? 'Disponible' : 'Reservado'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-md shadow-md">
              {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
            </span>
          </div>

          {/* Bottom Title inside image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                {isLedMovil ? 'Camión LED Móvil' : isLed ? 'Pantalla Digital LED' : 'Soporte Tradicional'}
              </span>
              <span className="text-xs text-slate-300">· {item.canonical_id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-md">{item.name}</h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-300" />
              {address}
            </p>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Description */}
          {item.description && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Descripción de la posición</h3>
              <p className="text-sm leading-relaxed text-slate-700">{item.description}</p>
            </div>
          )}

          {/* Technical Specs Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {item.technical?.measures && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400">Medidas</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{item.technical.measures}</p>
                </div>
              )}
              {item.technical?.monthly_impacts && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400">Impactos Estimados</p>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    +{Number(item.technical.monthly_impacts).toLocaleString('es-AR')} / mes
                  </p>
                </div>
              )}
              {item.technical?.format && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400">Formato</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{item.technical.format}</p>
                </div>
              )}
              {item.technical?.daily_frequency && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400">Frecuencia</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{item.technical.daily_frequency}</p>
                </div>
              )}
              {item.technical?.spot_duration_seconds && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400">Duración Spot</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{item.technical.spot_duration_seconds} segundos</p>
                </div>
              )}
              {item.characteristics && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                  <p className="text-[11px] font-semibold text-slate-400">Características</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{item.characteristics}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reserved notice if applicable */}
          {isReserved && item.availableFrom && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Posición actualmente con reserva</p>
                <p className="text-amber-800">Fecha estimada de disponibilidad: {item.availableFrom}</p>
              </div>
            </div>
          )}

          {/* External Map Link */}
          {'mapa_url' in item && item.mapa_url && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                Ver coordenadas exactas en Google Maps
              </span>
              <a
                href={item.mapa_url}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-black hover:underline flex items-center gap-1"
              >
                Abrir enlace <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => toggleSelect(item)}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${
              selected
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-black text-white hover:bg-slate-800'
            }`}
          >
            {selected ? (
              <>
                <Check className="w-4 h-4" /> Seleccionado en tu Media Kit
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Agregar a mi selección OOH
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
