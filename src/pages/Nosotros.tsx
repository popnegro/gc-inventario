import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Building2,
  Users,
  Wrench,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Nosotros() {
  return (
    <div className="flex-1 bg-[#F9F9F9] py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Trayectoria & Liderazgo
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Más de 20 años comunicando en la vía pública
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            Grupo Comunicarte es una empresa mendocina referente en la gestión, instalación y explotación
            publicitaria de espacios de vía pública (OOH & DOOH) en la región de Cuyo y el país.
          </p>
        </div>

        {/* 1. Visión y Pilares */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
              Infraestructura propia y tecnología de última generación
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              No tercerizamos los procesos clave. Contamos con equipamiento propio de grúas e
              hidroelevadores, personal técnico especializado y laboratorio para el ensamblado y
              mantenimiento de módulos LED de alta luminosidad.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Esto nos permite garantizar tiempos de respuesta inmediatos ante cualquier eventualidad
              técnica, cambio de creatividades en menos de 2 horas y una disponibilidad de pantalla
              superior al 99.8%.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <span className="text-2xl font-black text-gray-950 block">+20</span>
                <span className="text-xs text-gray-500 font-medium">Años de experiencia en Cuyo</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <span className="text-2xl font-black text-emerald-600 block">100%</span>
                <span className="text-xs text-gray-500 font-medium">Equipamiento y cuadrillas propias</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm aspect-[4/3]">
            <img
              src="/images/store-10.jpg"
              alt="Instalaciones y equipo de Grupo Comunicarte"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Compromiso de Calidad
                </span>
                <p className="text-sm font-semibold mt-1">
                  Estructuras homologadas y certificadas según normativas municipales y de vialidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Compromisos con las Marcas */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xs mb-16">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Nuestros Valores
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
              Cómo trabajamos cada campaña
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-950">Transparencia & Certificación</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cada campaña cuenta con su correspondiente reporte fotográfico de certificación de
                montaje en el caso de lonas, y registro de logs de emisión auditados en pantallas LED.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-950">Innovación Digital Continua</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Incorporamos constantemente nuevas pantallas de pixel pitch fino P6 y P8 con sensores de
                ajuste lumínico automático según la hora del día y condiciones climáticas.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-950">Atención Personalizada</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Acompañamos a agencias de publicidad, centrales de medios y departamentos de marketing
                desde el boceto inicial de circuito hasta el análisis post-campaña.
              </p>
            </div>
          </div>
        </div>

        {/* 3. CTA */}
        <div className="bg-gray-950 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black">Planificá tu próxima campaña con Grupo Comunicarte</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl">
            Comprobá la ubicación de cada soporte en nuestro mapa interactivo o solicitá una reunión con
            nuestro equipo directivo y comercial.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/inventario"
              className="px-5 py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 transition"
            >
              Explorar el Inventario OOH
            </Link>
            <Link
              to="/contacto"
              className="px-5 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition border border-white/15"
            >
              Hablemos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
