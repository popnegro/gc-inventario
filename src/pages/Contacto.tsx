import React from 'react';
import { Mail, MapPin, Phone, ArrowLeft, Send } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { useInventory } from '../hooks/useInventory';

export default function Contacto() {
  const [searchParams] = useSearchParams();
  const isMediaKit = searchParams.get('origen') === 'mediakit';
  const { selectedCount, getSelectedItems } = useSelection();
  const { items } = useInventory();
  const selectedItems = getSelectedItems(items);

  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex-1 bg-[#F9F9F9] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/inventario"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inventario OOH
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              {isMediaKit ? 'Propuesta Comercial Media Kit' : 'Contacto Comercial'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 mt-1">
              {isMediaKit ? 'Solicitá la cotización de tu selección' : 'Comunicate con Grupo Comunicarte'}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Te enviamos disponibilidad en tiempo real, tarifas y especificaciones técnicas de circuito.
            </p>

            {selectedCount > 0 && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">
                  {selectedCount} {selectedCount === 1 ? 'soporte incluido' : 'soportes incluidos'} en tu propuesta
                </span>
                <span className="text-emerald-700 font-medium truncate max-w-xs">
                  {selectedItems.map((s) => s.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">¡Solicitud recibida!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Nuestro equipo comercial se contactará a la brevedad con la propuesta formal.
                  </p>
                  <Link
                    to="/inventario"
                    className="inline-block mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition"
                  >
                    Seguir explorando inventario
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Nombre y Apellido *</label>
                      <input
                        required
                        type="text"
                        placeholder="Tu nombre"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Empresa / Agencia</label>
                      <input
                        type="text"
                        placeholder="Nombre de empresa"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Email corporativo *</label>
                      <input
                        required
                        type="email"
                        placeholder="nombre@empresa.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Teléfono / WhatsApp *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+54 9 261 ..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Mensaje o comentarios de campaña</label>
                    <textarea
                      rows={3}
                      placeholder="Fechas tentativas, objetivo de campaña, requerimientos especiales..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Enviar solicitud de cotización
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4 text-xs text-gray-600 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Oficinas Comerciales</h4>
                <p className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> Mendoza · Gran Mendoza
                </p>
                <p className="flex items-center gap-1.5 text-gray-600 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> Ciudad Autónoma de Buenos Aires
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-1">Contacto Directo</h4>
                <p className="flex items-center gap-1.5 text-gray-600">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> contacto@grupocomunicarte.com.ar
                </p>
                <p className="flex items-center gap-1.5 text-gray-600 mt-1">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> +54 9 261 400-0000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
