import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Layers,
  Truck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Eye,
  Maximize,
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useSelection } from '../context/SelectionContext';

export default function Soportes() {
  const [activeTab, setActiveTab] = useState<'led' | 'tradicional' | 'led_movil'>('led');
  const { items } = useInventory();
  const { isSelected, toggleSelect } = useSelection();

  // Filter items for the selected family
  const familyItems = items.filter((it) => it.tipo_soporte === activeTab);

  return (
    <div className="flex-1 bg-[#F9F9F9] py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Catálogo Técnico de Soportes
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Nuestros formatos de vía pública
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            Conocé las especificaciones técnicas, dimensiones, frecuencias de salida y ventajas
            comerciales de cada uno de los soportes de Grupo Comunicarte.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('led')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'led'
                ? 'bg-gray-950 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Monitor className="w-4 h-4 text-indigo-400" />
            Pantallas LED Digitales ({items.filter((i) => i.tipo_soporte === 'led').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tradicional')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'tradicional'
                ? 'bg-gray-950 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-400" />
            Monocolumnas & Estáticos ({items.filter((i) => i.tipo_soporte === 'tradicional').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('led_movil')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'led_movil'
                ? 'bg-gray-950 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            Camión LED Móvil ({items.filter((i) => i.tipo_soporte === 'led_movil').length})
          </button>
        </div>

        {/* Tab 1: Pantallas LED Digitales */}
        {activeTab === 'led' && (
          <div className="mt-8 space-y-10">
            {/* Overview Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Digital Out-of-Home (DOOH)
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                  Pantallas LED de Ultra Brillo en Cruces Estratégicos
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Las pantallas digitales permiten a las marcas comunicar con dinamismo mediante spots de
                  video o imágenes de alta definición. Al no requerir impresión ni montajes físicos, podés
                  actualizar tus promociones, precios o mensajes de campaña en tiempo récord.
                </p>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Clock className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">Spots de 10 seg</span>
                    <span className="text-[11px] text-gray-500">Loop continúo garantizado</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Zap className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">960 Salidas/día</span>
                    <span className="text-[11px] text-gray-500">Frecuencia cada 90 seg</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Eye className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">Resolución P8/P10</span>
                    <span className="text-[11px] text-gray-500">Tecnología antibrillo solar</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-indigo-950">Especificaciones Técnicas</h3>
                  <ul className="mt-3 space-y-2 text-xs text-indigo-900">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Formatos: MP4, MOV, JPG, PNG
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Aspect Ratio: 16:9 / 2:1 / Panorámico
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Horario de encendido: 06:00 a 01:00 hs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Certificación de emisión en tiempo real
                    </li>
                  </ul>
                </div>
                <Link
                  to="/inventario"
                  className="mt-6 w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold text-center hover:bg-indigo-700 transition"
                >
                  Ver todas en el Mapa
                </Link>
              </div>
            </div>

            {/* List of LED Supports */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ubicaciones Disponibles de Pantallas LED</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyItems.map((item) => {
                  const selected = isSelected(item.canonical_id);
                  return (
                    <div
                      key={item.canonical_id}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                          <img
                            src={item.imageUrls?.[0] || '/images/store-1.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/80 text-white backdrop-blur-xs">
                              {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-base font-bold text-gray-950">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {'address' in item ? item.address : item.characteristics}
                          </p>
                          <p className="text-xs text-gray-600 mt-2.5 line-clamp-2">{item.description}</p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-4">
                        <span className="text-xs font-bold text-gray-500">
                          {item.technical?.measures || item.characteristics}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSelect(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {selected ? '✓ En Media Kit' : '+ Sumar a Media Kit'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Monocolumnas y Estáticos */}
        {activeTab === 'tradicional' && (
          <div className="mt-8 space-y-10">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Out-of-Home Monumental
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                  Monocolumnas & Cartelería Estática de Gran Formato
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Ideales para posicionamiento institucional de marca a mediano y largo plazo. Nuestras
                  monocolumnas están emplazadas sobre los accesos neurálgicos y autopistas de ingreso a la
                  ciudad, garantizando una exposición exclusiva y continua las 24 horas del día.
                </p>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Maximize className="w-4 h-4 text-slate-800 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">Hasta 13x7 metros</span>
                    <span className="text-[11px] text-gray-500">Estructuras monumentales</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Zap className="w-4 h-4 text-slate-800 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">Iluminación Nocturna</span>
                    <span className="text-[11px] text-gray-500">Reflectores LED de alta potencia</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Layers className="w-4 h-4 text-slate-800 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">Doble Cara</span>
                    <span className="text-[11px] text-gray-500">Ingreso y egreso de ciudad</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Servicios Incluidos</h3>
                  <ul className="mt-3 space-y-2 text-xs text-slate-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                      Impresión en lona front de alta densidad
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                      Montaje y tensado profesional
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                      Mantenimiento y limpieza periódica
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                      Seguro de responsabilidad civil en vía pública
                    </li>
                  </ul>
                </div>
                <Link
                  to="/inventario"
                  className="mt-6 w-full py-2.5 px-4 bg-gray-950 text-white rounded-xl text-xs font-bold text-center hover:bg-gray-800 transition"
                >
                  Ver estáticos en el Mapa
                </Link>
              </div>
            </div>

            {/* List of Traditional Supports */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ubicaciones de Cartelería Tradicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyItems.map((item) => {
                  const selected = isSelected(item.canonical_id);
                  return (
                    <div
                      key={item.canonical_id}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                          <img
                            src={item.imageUrls?.[0] || '/images/store-2.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/80 text-white backdrop-blur-xs">
                              {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-base font-bold text-gray-950">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {'address' in item ? item.address : item.characteristics}
                          </p>
                          <p className="text-xs text-gray-600 mt-2.5 line-clamp-2">{item.description}</p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-4">
                        <span className="text-xs font-bold text-gray-500">
                          {item.technical?.measures || item.characteristics}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSelect(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {selected ? '✓ En Media Kit' : '+ Sumar a Media Kit'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Camión LED Móvil */}
        {activeTab === 'led_movil' && (
          <div className="mt-8 space-y-10">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Dispositivo Móvil Interactivo
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                  Camión LED Móvil para Cobertura 360° en Calle
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Llevá tu campaña a los puntos exactos donde se congrega tu público: centros comerciales,
                  avenidas gastronómicas, recitales, partidos de fútbol o ferias provinciales. Equipado con
                  pantallas LED en ambos laterales y compuerta trasera, además de sistema de audio exterior.
                </p>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Truck className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">Recorrido Dinámico</span>
                    <span className="text-[11px] text-gray-500">Circuitos de 4 a 6 hs diarias</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Zap className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">3 Pantallas LED</span>
                    <span className="text-[11px] text-gray-500">Laterales + Trasera P6</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <MapPin className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">Trazado GPS</span>
                    <span className="text-[11px] text-gray-500">Ruta auditable en mapa</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/60 rounded-2xl p-6 border border-amber-200/80 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-950">Ideal Para:</h3>
                  <ul className="mt-3 space-y-2 text-xs text-amber-900">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      Lanzamientos de productos y aperturas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      Campañas políticas y comunicados masivos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      Eventos deportivos y fiestas de la Vendimia
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                      Promociones de temporada o fines de semana
                    </li>
                  </ul>
                </div>
                <Link
                  to="/inventario"
                  className="mt-6 w-full py-2.5 px-4 bg-amber-700 text-white rounded-xl text-xs font-bold text-center hover:bg-amber-800 transition"
                >
                  Ver trazado de ruta en el Mapa
                </Link>
              </div>
            </div>

            {/* List of Mobile Routes */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rutas y Circuitos del Camión LED</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {familyItems.map((item) => {
                  const selected = isSelected(item.canonical_id);
                  return (
                    <div
                      key={item.canonical_id}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                          <img
                            src={item.imageUrls?.[0] || '/images/store-4.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                              Ruta Móvil Activa
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-base font-bold text-gray-950">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-amber-600" /> {item.characteristics}
                          </p>
                          <p className="text-xs text-gray-600 mt-2.5">{item.description}</p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-4">
                        <Link
                          to="/inventario"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          Ver waypoints en mapa <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSelect(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {selected ? '✓ En Media Kit' : '+ Sumar a Media Kit'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
