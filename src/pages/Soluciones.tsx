import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Award,
  Users,
} from 'lucide-react';

export default function Soluciones() {
  const circuits = [
    {
      title: 'Circuito Gran Mendoza Prime',
      tag: 'Mayor Cobertura Urbana',
      description:
        'Concentrado en los ejes peatonales, financieros y comerciales más transitados de la Ciudad de Mendoza: Km 0, Peatonal Sarmiento, Av. San Martín y Av. Arístides Villanueva.',
      metrics: 'Más de 1.8M de impactos mensuales',
      features: ['Pantallas LED P8 km 0', 'Alta afluencia de peatones y vehículos', 'Visibilidad noche y día'],
    },
    {
      title: 'Corredor Autopistas & Accesos Radiales',
      tag: 'Alto Tráfico Vehicular',
      description:
        'Impacto masivo en los principales nudos viales de conexión metropolitana: Acceso Este, Acceso Sur, Carril Rodríguez Peña y Corredor del Oeste.',
      metrics: 'Más de 2.2M de impactos mensuales',
      features: ['Monocolumnas monumentales 13x7m', 'Pantallas LED monumentales 14x6m', 'Conexión con Guaymallén, Maipú y Godoy Cruz'],
    },
    {
      title: 'Ruta del Vino & Zona Residencial Premium',
      tag: 'Afinidad ABC1 & Turismo',
      description:
        'Soportes ubicados estratégicamente sobre Ruta Panamericana, rotondas de Palmares Open Mall, Chacras de Coria y Luján de Cuyo.',
      metrics: 'Más de 950k impactos mensuales',
      features: ['Público de alto poder adquisitivo', 'Fuerte exposición turística y enoturismo', 'Top sites de gran impacto estético'],
    },
    {
      title: 'Plaza Buenos Aires (CABA & Conexión Nacional)',
      tag: 'Alcance Federal',
      description:
        'Ubicaciones seleccionadas en Ciudad de Buenos Aires para marcas regionales que buscan proyección nacional o empresas del centro del país con interés en Cuyo.',
      metrics: 'Formatos a medida según campaña',
      features: ['Pantallas digitales en esquinas de alto flujo', 'Circuitos sincronizados interprovinciales', 'Coordinación unificada de campaña'],
    },
  ];

  return (
    <div className="flex-1 bg-[#F9F9F9] py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Estrategia & Planificación OOH
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Soluciones integrales de comunicación exterior
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            Diseñamos circuitos que optimizan tu inversión publicitaria. Ya sea para un lanzamiento
            masivo en toda la provincia o para una presencia institucional exclusiva, tenemos el
            recorrido adecuado para tu marca.
          </p>
        </div>

        {/* 1. Circuitos Estratégicos */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">Circuitos Georreferenciados</h2>
            <Link
              to="/inventario"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              Explorarlos en el mapa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circuits.map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xs flex flex-col justify-between hover:border-gray-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {c.tag}
                    </span>
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> {c.metrics}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-950 mt-1">{c.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">{c.description}</p>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Puntos Fuertes:
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-700">
                      {c.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to="/inventario"
                    className="text-xs font-bold text-gray-900 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Ver soportes de este circuito <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/contacto"
                    className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-bold transition"
                  >
                    Cotizar circuito
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Modelos de Campaña */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xs mb-16">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Modalidades de Contratación
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
              Adaptados a los tiempos de tu estrategia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-950">Campañas Tácticas DOOH</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pautas de 7, 14 o 30 días en pantallas LED digitales. Ideal para promociones del mes,
                liquidaciones, eventos con fecha fija o rotación de múltiples piezas creativas.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-950">Presencia Institucional Anual</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Contratos semestrales o anuales con exclusividad de posición en las mejores monocolumnas.
                Afianza el liderazgo de marca y garantiza presencia constante ante tus clientes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-950">Activaciones BTL con Camión LED</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Contratación por días o fin de semana. Rutas personalizadas con paradas estratégicas en
                puntos de venta, centros deportivos o festivales de gran concentración de gente.
              </p>
            </div>
          </div>
        </div>

        {/* 3. CTA */}
        <div className="bg-gray-950 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black">¿Querés que armemos un circuito a la medida de tu marca?</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl">
            Comentanos tu público objetivo y fechas de campaña. Nuestro equipo de planificación OOH te
            enviará una propuesta de cobertura y presupuesto en menos de 24 horas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/inventario"
              className="px-5 py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 transition"
            >
              Explorar Soportes en el Mapa
            </Link>
            <Link
              to="/contacto"
              className="px-5 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition border border-white/15"
            >
              Contactar Asesor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
