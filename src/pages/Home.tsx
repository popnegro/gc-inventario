import { Link } from 'react-router-dom';
import {
  MapPin,
  Monitor,
  Truck,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useSelection } from '../context/SelectionContext';

export default function Home() {
  const { items } = useInventory();
  const { isSelected, toggleSelect } = useSelection();

  // Pick 3 high-impact featured supports
  const featured = items.filter((it) => it.isFeatured).slice(0, 3);

  return (
    <div className="flex-1 bg-[#F9F9F9] flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-gray-200 py-16 sm:py-24">
        {/* Subtle grid backdrop pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Publicidad Exterior & Pantallas LED · Gran Mendoza y Buenos Aires
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.1]">
              Conectamos tu marca con millones de personas en movimiento.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl font-normal">
              Líderes en vía pública (OOH y DOOH). Pantallas LED monumentales, cartelería de gran formato
              en accesos clave y dispositivos móviles de alta definición. Planificá, geolocalizá y armá tu
              Media Kit en tiempo real.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/inventario"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gray-950 text-white text-sm font-bold shadow-lg shadow-gray-950/15 hover:bg-gray-800 transition active:scale-95"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                Explorar Inventario en Mapa
              </Link>
              <Link
                to="/soportes"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition active:scale-95"
              >
                Tipos de Soportes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Key Performance Indicators (KPIs) */}
          <div className="mt-14 pt-10 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-gray-200/60">
              <span className="text-2xl sm:text-3xl font-black text-gray-950 block">+4.5M</span>
              <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                Impactos visuales mensuales
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-gray-200/60">
              <span className="text-2xl sm:text-3xl font-black text-gray-950 block">35+</span>
              <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                Ubicaciones estratégicas
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-gray-200/60">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">99.8%</span>
              <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                Uptime pantallas LED
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-gray-200/60">
              <span className="text-2xl sm:text-3xl font-black text-gray-950 block">2 Plazas</span>
              <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                Mendoza & Buenos Aires
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE PILLARS OF OUR NETWORK */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Nuestra Red OOH & DOOH
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-950 mt-1">
              Soluciones para cada objetivo de campaña
            </h2>
          </div>
          <Link
            to="/soportes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition"
          >
            Ver especificaciones técnicas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: LED */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-6">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-950">Pantallas LED Digitales (DOOH)</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                Ubicadas en los cruces semafóricos y esquinas icónicas de mayor tiempo de permanencia.
                Resolución P8/P10 de alto contraste con actualización dinámica de contenidos en segundos.
              </p>
              <ul className="mt-6 space-y-2 text-xs font-medium text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Loops continuos de 960 salidas diarias
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Spots de 10 segundos con video o animación
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Control de emisión y reportes auditados
                </li>
              </ul>
            </div>
            <Link
              to="/inventario"
              className="mt-8 pt-4 border-t border-gray-100 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900"
            >
              Ver pantallas en el mapa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Tradicionales */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-950">Monocolumnas & Cartelería Estática</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                Presencia imponente y fija las 24 horas del día en las autopistas, accesos principales
                y avenidas radiales de Mendoza y Buenos Aires. Formatos 8x4m, 12x4m y 13x7m.
              </p>
              <ul className="mt-6 space-y-2 text-xs font-medium text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Iluminación LED frontal y backlight nocturno
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Doble cara (hacia centro e ingresos)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Lona front de alta durabilidad
                </li>
              </ul>
            </div>
            <Link
              to="/inventario"
              className="mt-8 pt-4 border-t border-gray-100 inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-black"
            >
              Ver cartelería en el mapa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Camión LED Móvil */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-950">Camión LED Móvil</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                Publicidad itinerante y flexible. Rutas programadas por zonas comerciales, eventos
                masivos, fiestas provinciales y centros gastronómicos con sonido exterior sincronizado.
              </p>
              <ul className="mt-6 space-y-2 text-xs font-medium text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Circuito móvil de 4 a 6 horas diarias
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Pantallas laterales y trasera de ultra-brillo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Geolocalización GPS en tiempo real
                </li>
              </ul>
            </div>
            <Link
              to="/inventario"
              className="mt-8 pt-4 border-t border-gray-100 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950"
            >
              Ver recorrido en el mapa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE OF ICONIC SUPPORTS */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Ubicaciones Icónicas
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                Puntos neurálgicos de alto tráfico
              </h2>
            </div>
            <Link
              to="/inventario"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition"
            >
              Ver las 35+ ubicaciones en el mapa <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((item) => {
              const selected = isSelected(item.canonical_id);
              return (
                <div
                  key={item.canonical_id}
                  className="group rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-xs hover:shadow-md transition flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrls?.[0] || '/images/store-1.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs">
                        {item.tipo_soporte === 'led'
                          ? 'Pantalla LED'
                          : item.tipo_soporte === 'led_movil'
                          ? 'LED Móvil'
                          : 'Estático'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        {item.ciudad === 'mendoza' ? 'Gran Mendoza' : 'Buenos Aires'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-950 group-hover:text-emerald-700 transition">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{'address' in item ? item.address : item.characteristics}</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gray-500">
                        {item.technical?.measures || item.characteristics}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSelect(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          selected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {selected ? '✓ En Media Kit' : '+ Sumar a Media Kit'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE GRUPO COMUNICARTE */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Diferencial Competitivo
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 mt-1">
            Garantía de impacto y transparencia
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Respaldamos cada inversión publicitaria con tecnología de punta y certificación de pauta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <Zap className="w-6 h-6 text-amber-500 mb-3" />
            <h4 className="text-base font-bold text-gray-900">Ubicaciones de Máxima Permanencia</h4>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Seleccionamos cruces de semáforos, rotondas y accesos de desaceleración donde el ojo del
              conductor y peatón permanece expuesto a tu marca por más de 45 segundos por pasada.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <TrendingUp className="w-6 h-6 text-emerald-600 mb-3" />
            <h4 className="text-base font-bold text-gray-900">Métricas & Estimación de Alcance</h4>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Datos basados en conteos de flujo vehicular y peatonal para calcular impactos reales
              mensuales y optimizar tu costo por mil contactos (CPM).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-blue-600 mb-3" />
            <h4 className="text-base font-bold text-gray-900">Auditoría Fotográfica & Monitoreo</h4>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Fotografías de certificación al inicio de cada campaña y sistema de monitoreo remoto
              de uptime 24/7 en todas nuestras pantallas digitales.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="bg-gray-950 text-white py-16 sm:py-20 border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Armá tu propuesta personalizada
          </span>
          <h2 className="text-2xl sm:text-4xl font-black mt-2 tracking-tight">
            ¿Listo para llevar tu marca a la vía pública?
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Explorá el mapa interactivo, seleccioná los soportes que mejor se adapten a tu audiencia y
            generá tu Media Kit comercial con tarifas y especificaciones en un solo paso.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/inventario"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              Ver Mapa & Armar Media Kit
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition active:scale-95 backdrop-blur-xs border border-white/10"
            >
              Contactar a un Asesor Comercial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
