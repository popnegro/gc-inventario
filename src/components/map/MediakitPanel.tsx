import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Check, FileText } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useSelection } from '../../context/SelectionContext';
import { generateMediaKitPdf } from '../../utils/pdfGenerator';

interface MediakitPanelProps {
  selectedItems: InventoryItem[];
  onClose: () => void;
}

export function MediakitPanel({ selectedItems, onClose }: MediakitPanelProps) {
  const { removeSelected } = useSelection();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-end md:items-start justify-end p-0 md:p-4" role="presentation">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <aside
        className="relative w-full md:w-[460px] max-h-screen md:max-h-[92vh] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mediakit-panel-title"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 bg-white shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Planificador B2B</p>
            <h2 id="mediakit-panel-title" className="mt-0.5 text-xl font-black text-gray-950 tracking-tight">Tu Media Kit OOH</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus-visible:outline-hidden transition" aria-label="Cerrar Media Kit">
            <X className="h-4 w-4 text-slate-700" aria-hidden="true" />
          </button>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Summary */}
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800" aria-live="polite">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-gray-950 px-2 text-xs text-white font-mono">{selectedItems.length}</span>
            {selectedItems.length === 1 ? 'soporte publicitario seleccionado' : 'soportes publicitarios seleccionados'}
          </div>

          {/* Export PDF Button */}
          {selectedItems.length > 0 && (
            <button
              type="button"
              onClick={() => generateMediaKitPdf(selectedItems)}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>Exportar Selección a PDF</span>
            </button>
          )}

          {/* Items selection */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {selectedItems.map((item) => (
              <div key={item.canonical_id} className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/75 p-2.5 hover:bg-gray-50 transition">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.canonical_id} · {item.tipo_soporte === 'led_movil' ? 'LED Móvil' : item.tipo_soporte}</p>
                </div>
                <button type="button" onClick={() => removeSelected(item.canonical_id)} className="px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition" aria-label={`Quitar ${item.name}`}>Quitar</button>
              </div>
            ))}
            {selectedItems.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                No tienes soportes seleccionados. Agrega soportes desde el mapa para armar la propuesta.
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <footer className="p-5 border-t border-gray-100 bg-white flex flex-col gap-2 shrink-0">
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              to="/contacto?origen=mediakit"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-2xs text-center"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Solicitar Presupuesto
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-gray-200 px-5 text-xs font-bold text-gray-900 hover:bg-gray-50 transition"
            >
              Seguir seleccionando
            </button>
          </div>
        </footer>
      </aside>
    </div>,
    document.body
  );
}
