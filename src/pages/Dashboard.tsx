import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  FolderPlus,
  ArrowRight,
  Eye,
  Edit3,
  Check,
  Search,
  Download,
  Plus,
  Trash2,
  Save,
  Map,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  User,
  FileText,
  Mail,
  Loader2,
  LogOut,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { InventoryItem, Disponibilidad, Plaza, TipoSoporte } from '../types';
import { apiClient } from '../utils/apiClient';
import { initAuth, googleSignIn, logout } from '../utils/firebaseAuth';
import { generateMediaKitPdf } from '../utils/pdfGenerator';
import { User as FirebaseUser } from 'firebase/auth';

export default function Dashboard() {
  const { items, updateStatus, updateDetails } = useInventory();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: editId } = useParams();

  // Local state for registered media kits
  const [mediakits, setMediakits] = useState<any[]>([]);
  const [loadingMK, setLoadingMK] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Google Auth & Integration state for dashboard
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Slides export states
  const [exportingKitId, setExportingKitId] = useState<any>(null);
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null);
  const [exportSuccessKitId, setExportSuccessKitId] = useState<any>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Gmail send states
  const [emailFormKitId, setEmailFormKitId] = useState<any>(null);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('Propuesta de Medios OOH - Grupo Comunicarte');
  const [customMessage, setCustomMessage] = useState(
    'Hola,\n\nAdjunto la selección de soportes publicitarios OOH que considero ideales para tu próxima campaña. Podés ver los detalles de cada uno y su ubicación en el mapa interactivo.'
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState(false);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  // Subscribe to Firebase Auth State for Google Integrations in Dashboard
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setExportError(null);
    setEmailSendError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMessage = err?.message || String(err);
      if (errorMessage.includes('popup-closed-by-user') || errorMessage.includes('cancelled-popup-request')) {
        setExportError(
          'La ventana de inicio de sesión se cerró o fue bloqueada por el navegador. Si estás usando la vista previa de AI Studio, ábrela en una pestaña nueva usando el botón arriba a la derecha e intenta de nuevo.'
        );
      } else {
        setExportError('Error al autenticar con Google. Intenta de nuevo.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Helper to resolve InventoryItem list from comma-separated string
  const getSoportesForKit = (soportesIdsStr: string) => {
    if (!soportesIdsStr) return [];
    const ids = soportesIdsStr.split(',').map(id => id.trim()).filter(Boolean);
    return items.filter(item => ids.includes(item.canonical_id));
  };

  // Handler for Export to Google Slides
  const handleExportToSlides = async (mk: any) => {
    setExportingKitId(mk.id);
    setExportSuccessUrl(null);
    setExportSuccessKitId(null);
    setExportError(null);

    try {
      const kitSoportes = getSoportesForKit(mk.soportes_ids);
      if (kitSoportes.length === 0) {
        throw new Error('No hay soportes asignados a este Media Kit.');
      }

      const response = await fetch('/api/slides/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: mk.name,
          client_name: mk.client_name,
          notes: mk.notes,
          soportes: kitSoportes,
        }),
      });

      const resJson = await response.json();

      if (response.ok && resJson.status === 'success') {
        setExportSuccessUrl(resJson.url);
        setExportSuccessKitId(mk.id);
      } else {
        throw new Error(resJson.message || 'Error al exportar a Google Slides');
      }
    } catch (err: any) {
      console.error('Failed to export to Slides:', err);
      setExportError(err.message || 'No se pudo crear la presentación en Google Slides.');
    } finally {
      setExportingKitId(null);
    }
  };

  const generateEmailHtml = (kitName: string, kitSoportes: InventoryItem[]) => {
    const supportsListHtml = kitSoportes
      .map((item) => {
        const imageUrl = item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
        const address = 'address' in item ? item.address : 'Circuito móvil';
        const typeLabel = item.tipo_soporte === 'led_movil' ? 'LED Móvil' : item.tipo_soporte === 'led' ? 'Pantalla LED' : 'Tradicional';
        const cityLabel = item.ciudad === 'mendoza' ? 'Gran Mendoza' : 'Buenos Aires';
        const measures = item.technical?.measures || item.characteristics || '';

        return `
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 16px 0; vertical-align: top; width: 80px;">
              <img src="${imageUrl}" alt="${item.name}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; display: block;" />
            </td>
            <td style="padding: 16px 0 16px 16px; vertical-align: top; font-family: sans-serif; color: #1E293B;">
              <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 2px;">
                ${typeLabel} · ${cityLabel}
              </div>
              <div style="font-size: 14px; font-weight: bold; color: #0F172A; margin-bottom: 4px;">
                ${item.name} (${item.canonical_id})
              </div>
              <div style="font-size: 12px; color: #64748B; margin-bottom: 2px;">
                📍 ${address}
              </div>
              \${measures ? \`<div style="font-size: 12px; font-weight: 500; color: #0F172A;">📐 Medidas: \${measures}</div>\` : ''}
            </td>
          </tr>
        `;
      })
      .join('');

    const formattedCustomMessage = customMessage.replace(/\n/g, '<br />');

    return `
      <div style="background-color: #F8FAFC; padding: 40px 20px; font-family: sans-serif; line-height: 1.5; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; bg-color: #FFFFFF; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <div style="background-color: #0F172A; padding: 32px 24px; text-align: center; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.025em;">GRUPO COMUNICARTE</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Propuesta de Medios OOH & Cobertura</p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 14px; color: #334155; margin-top: 0;">\${formattedCustomMessage}</p>
            
            <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A; margin: 24px 0 12px 0; border-bottom: 2px solid #0F172A; padding-bottom: 6px;">
              Soportes Seleccionados (\${kitSoportes.length})
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                \${supportsListHtml}
              </tbody>
            </table>
            
            <!-- CTA Link -->
            <div style="margin-top: 32px; text-align: center;">
              <a href="https://grupocomunicarte.com.ar" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; padding: 12px 28px; font-weight: bold; font-size: 13px; text-decoration: none; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Ver en el Mapa de Cobertura
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F1F5F9; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B;">
            <p style="margin: 0 0 4px 0; font-weight: bold; color: #475569;">Grupo Comunicarte S.A.</p>
            <p style="margin: 0;">Este email fue enviado de forma segura y autorizada desde tu panel OOH comercial.</p>
          </div>
        </div>
      </div>
    `;
  };

  const handleSendEmail = async (mk: any) => {
    if (!recipient.trim()) {
      setEmailSendError('Por favor ingresa un email de destino.');
      return;
    }

    setIsSendingEmail(true);
    setEmailSendError(null);
    setShowConfirmSend(false);

    try {
      const kitSoportes = getSoportesForKit(mk.soportes_ids);
      const mailBody = generateEmailHtml(mk.name, kitSoportes);
      
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          body: mailBody,
        }),
      });

      const resJson = await response.json();

      if (response.ok && resJson.status === 'success') {
        setEmailSendSuccess(true);
        setTimeout(() => {
          setEmailSendSuccess(false);
          setRecipient('');
          setEmailFormKitId(null);
        }, 4000);
      } else {
        throw new Error(resJson.message || 'Error en respuesta de envío');
      }
    } catch (err: any) {
      console.error('Failed to send email:', err);
      setEmailSendError(err.message || 'No se pudo enviar el correo de propuesta.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Load Media Kits on Mount
  useEffect(() => {
    const fetchMK = async () => {
      setLoadingMK(true);
      try {
        const res = await apiClient.getMediaKits();
        if (res.status === 'success' && res.data) {
          setMediakits(res.data);
        }
      } catch (err) {
        console.warn('API getMediaKits failed, using localStorage fallback');
        try {
          const saved = localStorage.getItem('gc_saved_mediakits');
          if (saved) setMediakits(JSON.parse(saved));
        } catch {
          // ignore
        }
      } finally {
        setLoadingMK(false);
      }
    };
    fetchMK();
  }, [location.pathname]);

  // Determine current view based on path
  const currentPath = location.pathname;
  const isOverview = currentPath === '/dashboard';
  const isSoportes = currentPath === '/dashboard/soportes';
  const isEdit = currentPath.includes('/edit') && editId;
  const isMediaKits = currentPath === '/dashboard/mediakits';
  const isMediaKitsNuevo = currentPath === '/dashboard/mediakits/nuevo';

  // Active Support item for the editor view
  const editItem = useMemo(() => {
    if (!editId) return null;
    return items.find((item) => item.canonical_id === editId) || null;
  }, [items, editId]);

  // States for Edit Form
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    description: '',
    characteristics: '',
    disponibilidad: 'disponible' as Disponibilidad
  });

  // Sync edit form with active item
  useEffect(() => {
    if (editItem) {
      setEditForm({
        name: editItem.name || '',
        address: 'address' in editItem ? editItem.address || '' : '',
        lat: String('lat' in editItem ? editItem.lat || '' : ''),
        lng: String('lng' in editItem ? editItem.lng || '' : ''),
        description: editItem.description || '',
        characteristics: editItem.characteristics || '',
        disponibilidad: editItem.disponibilidad || 'disponible'
      });
    }
  }, [editItem]);

  // States for Filter/Search (Soportes list view)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlaza, setFilterPlaza] = useState<Plaza | 'todos'>('todos');
  const [filterTipo, setFilterTipo] = useState<TipoSoporte | 'todos'>('todos');
  const [filterDisponibilidad, setFilterDisponibilidad] = useState<Disponibilidad | 'todos'>('todos');

  // Compute merged items with dynamic availability calculations
  const effectiveItems = useMemo(() => {
    return items;
  }, [items]);

  // Metrics
  const totalCount = effectiveItems.length;
  const disponiblesCount = effectiveItems.filter((it) => (it.disponibilidad ?? 'disponible') === 'disponible').length;
  const reservadosCount = effectiveItems.filter((it) => it.disponibilidad === 'reservado').length;
  const inactivosCount = effectiveItems.filter((it) => it.disponibilidad === 'inactivo').length;
  const occupancyRate = totalCount > 0 ? Math.round((reservadosCount / totalCount) * 100) : 0;

  // Filtered List for General Table
  const filteredItems = useMemo(() => {
    return effectiveItems.filter((item) => {
      if (filterPlaza !== 'todos' && item.ciudad !== filterPlaza) return false;
      if (filterTipo !== 'todos' && item.tipo_soporte !== filterTipo) return false;

      const disp = item.disponibilidad ?? 'disponible';
      if (filterDisponibilidad !== 'todos' && disp !== filterDisponibilidad) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchId = item.canonical_id.toLowerCase().includes(q);
        const matchAddress = ('address' in item && item.address?.toLowerCase().includes(q)) || false;
        if (!matchName && !matchId && !matchAddress) return false;
      }

      return true;
    });
  }, [effectiveItems, filterPlaza, filterTipo, filterDisponibilidad, searchQuery]);

  // Handle support updates save
  const handleSaveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    const dataToSave = {
      name: editForm.name,
      address: editForm.address,
      lat: parseFloat(editForm.lat) || null,
      lng: parseFloat(editForm.lng) || null,
      description: editForm.description,
      characteristics: editForm.characteristics,
      disponibilidad: editForm.disponibilidad
    };

    const success = await updateDetails(editId, dataToSave);
    if (success) {
      setSaveToast(`Soporte ${editId} guardado con éxito en la base de datos de Neon.`);
      setTimeout(() => setSaveToast(null), 3000);
      navigate('/dashboard/soportes');
    } else {
      setSaveToast('Error al actualizar soporte.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // States for New Media Kit Form
  const [mkForm, setMkForm] = useState({
    name: '',
    clientName: '',
    notes: '',
    selectedIds: [] as string[]
  });

  const handleCreateMediaKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mkForm.name.trim()) return;

    const newKitId = 'mk-' + Math.random().toString(36).substr(2, 9);
    const newKit = {
      id: newKitId,
      name: mkForm.name,
      client_name: mkForm.clientName,
      soportes_ids: mkForm.selectedIds.join(','),
      notes: mkForm.notes,
      created_at: new Date().toISOString()
    };

    try {
      const res = await apiClient.createMediaKit(newKit);
      if (res.status === 'success') {
        setMediakits(prev => [res.data || newKit, ...prev]);
        setSaveToast('¡Media Kit corporativo registrado con éxito en Neon!');
        setTimeout(() => setSaveToast(null), 3000);
        setMkForm({ name: '', clientName: '', notes: '', selectedIds: [] });
        navigate('/dashboard/mediakits');
      }
    } catch (err) {
      console.warn('API createMediaKit failed, falling back to localStorage');
      const updatedList = [newKit, ...mediakits];
      setMediakits(updatedList);
      localStorage.setItem('gc_saved_mediakits', JSON.stringify(updatedList));
      setSaveToast('¡Media Kit registrado con éxito en almacenamiento local!');
      setTimeout(() => setSaveToast(null), 3000);
      setMkForm({ name: '', clientName: '', notes: '', selectedIds: [] });
      navigate('/dashboard/mediakits');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID Canónico', 'Nombre', 'Plaza', 'Tipo', 'Estado', 'Medidas', 'Dirección'];
    const rows = filteredItems.map((it) => [
      it.canonical_id,
      `"${it.name.replace(/"/g, '""')}"`,
      it.ciudad === 'mendoza' ? 'Gran Mendoza' : 'Buenos Aires',
      it.tipo_soporte,
      it.disponibilidad ?? 'disponible',
      `"${(it.technical?.measures || it.characteristics || '').replace(/"/g, '""')}"`,
      `"${('address' in it ? it.address : '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario-comunicarte-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-grow w-full bg-[#F9F9F9] min-h-[calc(100vh-80px)] flex flex-col md:flex-row">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-3 text-xs font-bold animate-fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Sidebar Navigation Component */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 shrink-0 flex flex-col">
        <div className="p-5 border-b border-gray-100 hidden md:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black tracking-wider uppercase text-gray-400">Grupo Comunicarte</span>
          </div>
          <span className="text-sm font-bold text-gray-900 mt-1 block">Portal de Gestión OOH</span>
        </div>

        <nav className="p-4 space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar w-full md:w-auto shrink-0 md:grow" aria-label="Navegación administrativa">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap md:w-full ${
              isOverview ? 'bg-gray-950 text-white shadow-xs' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Panel de Control
          </Link>

          <Link
            to="/dashboard/soportes"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap md:w-full ${
              isSoportes || isEdit ? 'bg-gray-950 text-white shadow-xs' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Layers className="w-4 h-4" />
            Tabla de Soportes
          </Link>

          <Link
            to="/dashboard/mediakits"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap md:w-full ${
              isMediaKits ? 'bg-gray-950 text-white shadow-xs' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Media Kits ({mediakits.length})
          </Link>

          <Link
            to="/dashboard/mediakits/nuevo"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap md:w-full ${
              isMediaKitsNuevo ? 'bg-gray-950 text-white shadow-xs' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            Nuevo Media Kit
          </Link>

          <div className="hidden md:block my-4 border-t border-gray-100" />

          <Link
            to="/inventario"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-black transition whitespace-nowrap"
          >
            <Map className="w-4 h-4 text-emerald-500" />
            Ver Mapa Público
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto">
        {/* VIEW 1: OVERVIEW PANEL */}
        {isOverview && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operaciones Activas en Mendoza y Buenos Aires
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">Panel de Control</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Sincronización en tiempo real con Neon PostgreSQL.</p>
            </div>

            {/* Metric Blocks */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Soportes</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-gray-950">{totalCount}</span>
                  <span className="text-xs text-gray-400 font-medium">unidades</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Disponibles</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-emerald-600">{disponiblesCount}</span>
                  <span className="text-xs text-emerald-700 font-bold">
                    {totalCount > 0 ? Math.round((disponiblesCount / totalCount) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Reservados</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-amber-600">{reservadosCount}</span>
                  <span className="text-xs text-amber-700 font-bold">{occupancyRate}%</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tasa de Ocupación</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-indigo-600">{occupancyRate}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
                </div>
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Accesos Rápidos Administrativos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/dashboard/soportes"
                    className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-xl bg-gray-100 text-gray-900">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-950 block">Ver Tabla de Inventario</span>
                      <span className="text-[11px] text-gray-500 mt-1 block">Modifica ubicaciones, estados y ficha técnica.</span>
                    </div>
                  </Link>

                  <Link
                    to="/dashboard/mediakits/nuevo"
                    className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Crear Media Kit</span>
                      <span className="text-[11px] text-emerald-700 mt-1 block">Genera propuestas de pauta para marcas.</span>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200/60 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Tu base de datos está gestionada dinámicamente con Neon Serverless.</span>
                  </div>
                  <Link to="/inventario" className="font-bold text-gray-900 hover:underline flex items-center gap-0.5">
                    Ir al mapa <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 mb-4">Últimos Media Kits Generados</h2>
                  <div className="space-y-3.5">
                    {mediakits.length === 0 ? (
                      <span className="text-xs text-gray-400 block text-center py-6">No hay propuestas creadas recientemente.</span>
                    ) : (
                      mediakits.slice(0, 3).map((mk) => (
                        <div key={mk.id} className="flex items-start justify-between text-xs">
                          <div>
                            <span className="font-bold text-gray-900 block truncate max-w-[180px]">{mk.name}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{mk.client_name || 'Cliente Particular'}</span>
                          </div>
                          <span className="text-[10px] bg-gray-100 font-bold px-2 py-0.5 rounded-md shrink-0">
                            {mk.soportes_ids ? mk.soportes_ids.split(',').length : 0} soportes
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Link
                  to="/dashboard/mediakits"
                  className="mt-6 w-full py-2 border border-gray-200 rounded-xl text-center text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Ver todos los Media Kits
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SOPORTES GENERAL TABLE */}
        {isSoportes && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">Tabla de Soportes Publicitarios</h1>
                <p className="text-xs text-gray-500 mt-1">Inventario oficial sincronizado. Haz clic en Editar para cambiar coordenadas o disponibilidad.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar soporte, código, calle..."
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterPlaza}
                  onChange={(e) => setFilterPlaza(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="todos">Todas las Plazas</option>
                  <option value="mendoza">Gran Mendoza</option>
                  <option value="buenos-aires">Buenos Aires</option>
                </select>

                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="todos">Todos los Tipos</option>
                  <option value="led">Pantalla LED</option>
                  <option value="tradicional">Estático</option>
                  <option value="led_movil">LED Móvil</option>
                </select>

                <select
                  value={filterDisponibilidad}
                  onChange={(e) => setFilterDisponibilidad(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="disponible">Disponibles</option>
                  <option value="reservado">Reservados</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Nombre / Ubicación</th>
                      <th className="py-3 px-4">Plaza</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Coordenadas</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">No se encontraron soportes en la búsqueda.</td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.canonical_id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-gray-900">{item.canonical_id}</td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="font-bold text-gray-950 block">{item.name}</span>
                            <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                              {'address' in item ? item.address : 'Ruta del camión'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-gray-100 text-gray-700 uppercase">
                              {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-gray-100 text-gray-800">
                              {item.tipo_soporte === 'led' ? 'LED' : item.tipo_soporte === 'led_movil' ? 'Móvil' : 'Estático'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                            {('lat' in item && item.lat !== null && item.lat !== undefined) ? (
                              `${Number(item.lat).toFixed(5)}, ${('lng' in item && item.lng !== null && item.lng !== undefined) ? Number(item.lng).toFixed(5) : ''}`
                            ) : 'Móvil / Ruta'}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.disponibilidad === 'disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {item.disponibilidad || 'disponible'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link
                              to={`/dashboard/soportes/${item.canonical_id}/edit`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-50/50 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Editar
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-3.5 bg-gray-50 border-t border-gray-100 text-gray-500 text-[11px] font-medium">
                Soportes activos listados: {filteredItems.length} de {totalCount}.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: FORMULARIO DE EDICIÓN CONEXIÓN NEON */}
        {isEdit && editItem && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <Link to="/dashboard/soportes" className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1 mb-3">
                Volver a la tabla
              </Link>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">Editar Soporte</h1>
              <p className="text-xs text-gray-500 mt-1">ID Canónico: <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">{editId}</span></p>
            </div>

            <form onSubmit={handleSaveSupport} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="supportName" className="block text-xs font-bold text-gray-700 mb-1">Nombre Comercial del Cartel</label>
                  <input
                    id="supportName"
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="supportAddress" className="block text-xs font-bold text-gray-700 mb-1">Dirección Física / Calle</label>
                  <input
                    id="supportAddress"
                    type="text"
                    required
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="supportLat" className="block text-xs font-bold text-gray-700 mb-1">Latitud (Coordenadas)</label>
                    <input
                      id="supportLat"
                      type="text"
                      required
                      value={editForm.lat}
                      onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="supportLng" className="block text-xs font-bold text-gray-700 mb-1">Longitud (Coordenadas)</label>
                    <input
                      id="supportLng"
                      type="text"
                      required
                      value={editForm.lng}
                      onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="supportStatus" className="block text-xs font-bold text-gray-700 mb-1">Estado de Ocupación</label>
                  <select
                    id="supportStatus"
                    value={editForm.disponibilidad}
                    onChange={(e) => setEditForm({ ...editForm, disponibilidad: e.target.value as Disponibilidad })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-gray-50/50"
                  >
                    <option value="disponible">🟢 Disponible (Listo para Pautar)</option>
                    <option value="reservado">🔴 Reservado (Ocupado temporalmente)</option>
                    <option value="inactivo">⚪ Inactivo (Mantenimiento / Desactivado)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="supportDesc" className="block text-xs font-bold text-gray-700 mb-1">Descripción Comercial</label>
                  <textarea
                    id="supportDesc"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="supportCharacteristics" className="block text-xs font-bold text-gray-700 mb-1">Características y Dimensiones técnicas</label>
                  <input
                    id="supportCharacteristics"
                    type="text"
                    value={editForm.characteristics}
                    onChange={(e) => setEditForm({ ...editForm, characteristics: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                <Link to="/dashboard/soportes" className="px-4 py-2 text-gray-500 font-bold hover:text-black">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gray-950 text-white font-bold hover:bg-gray-800 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  Guardar en Neon DB
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 4: GALERÍA DE MEDIA KITS */}
        {isMediaKits && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">Galería de Media Kits</h1>
                <p className="text-xs text-gray-500 mt-1">Propuestas y ofertas comerciales activas registradas para clientes de Grupo Comunicarte.</p>
              </div>

              <Link
                to="/dashboard/mediakits/nuevo"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 transition shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                Nuevo Media Kit
              </Link>
            </div>

            {loadingMK ? (
              <div className="py-20 text-center text-xs text-gray-400">Consultando base de datos de Neon...</div>
            ) : mediakits.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h2 className="text-sm font-bold text-gray-900">No hay Media Kits registrados</h2>
                <p className="text-xs text-gray-500 mt-1.5">Comienza a agrupar soportes publicitarios para campañas creando tu primera propuesta de pauta.</p>
                <Link to="/dashboard/mediakits/nuevo" className="mt-5 inline-block px-4 py-2 bg-gray-950 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition">
                  Crear Propuesta
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediakits.map((mk) => {
                  const soportesCount = mk.soportes_ids ? String(mk.soportes_ids).split(',').filter(Boolean).length : 0;
                  return (
                    <div key={mk.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between hover:border-gray-300 transition shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                          <span className="text-[10px] font-mono text-gray-400">ID: {mk.id}</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-md uppercase">
                            Activo
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-950 leading-tight">{mk.name}</h3>
                        <div className="mt-3.5 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">Cliente:</span>
                            <span className="text-gray-900">{mk.client_name || 'Particular / Directo'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Layers className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">Soportes:</span>
                            <span className="text-indigo-600 font-bold">{soportesCount} unidades</span>
                          </div>
                          {mk.notes && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-gray-50 text-[11px] text-gray-500 leading-relaxed border border-gray-100">
                              {mk.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACCIONES DE EXPORTACIÓN & INTEGRACIÓN */}
                      <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Export to PDF */}
                          <button
                            type="button"
                            onClick={() => {
                              const kitSoportes = getSoportesForKit(mk.soportes_ids);
                              generateMediaKitPdf(kitSoportes);
                            }}
                            className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-500" />
                            <span>Descargar PDF</span>
                          </button>

                          {/* Export to Google Slides */}
                          {needsAuth ? (
                            <button
                              type="button"
                              onClick={handleGoogleLogin}
                              disabled={isLoggingIn}
                              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-[11px] font-bold text-amber-800 transition cursor-pointer"
                            >
                              {isLoggingIn ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span>Conectar Slides</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleExportToSlides(mk)}
                              disabled={exportingKitId === mk.id}
                              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 text-[11px] font-bold text-indigo-700 transition disabled:opacity-50 cursor-pointer"
                            >
                              {exportingKitId === mk.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                              )}
                              <span>Exportar Slides</span>
                            </button>
                          )}
                        </div>

                        {/* Action triggers: Email */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (emailFormKitId === mk.id) {
                                setEmailFormKitId(null);
                              } else {
                                setEmailFormKitId(mk.id);
                                setEmailSendSuccess(false);
                                setEmailSendError(null);
                                setRecipient('');
                                setSubject(`Propuesta de Medios OOH - ${mk.name}`);
                              }
                            }}
                            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-950 text-white hover:bg-gray-800 text-[11px] font-bold transition cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Enviar por Gmail</span>
                          </button>

                          {!needsAuth && currentUser && (
                            <button
                              type="button"
                              onClick={handleGoogleLogout}
                              className="px-2.5 h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 transition"
                              title="Desconectar cuenta Google"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Google Slides success banner */}
                        {exportSuccessKitId === mk.id && exportSuccessUrl && (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2 text-center animate-fadeIn">
                            <p className="text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ¡Presentación creada con éxito!
                            </p>
                            <a
                              href={exportSuccessUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[10px] text-white font-bold transition shadow-3xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Abrir Google Slides
                            </a>
                          </div>
                        )}

                        {/* Export Error Banner */}
                        {exportError && exportingKitId === mk.id && (
                          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-[11px] text-red-700 flex items-start gap-1.5 animate-fadeIn">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <span>{exportError}</span>
                          </div>
                        )}

                        {/* Expandable Gmail Sender Form */}
                        {emailFormKitId === mk.id && (
                          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-3 animate-fadeIn text-xs">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                              <span className="font-bold text-gray-800 text-[10px] uppercase tracking-wider">Email de propuesta</span>
                              {needsAuth ? (
                                <button
                                  type="button"
                                  onClick={handleGoogleLogin}
                                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                                >
                                  Conectar Google
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                  Desde: {currentUser?.email}
                                </span>
                              )}
                            </div>

                            {needsAuth ? (
                              <div className="text-center py-2 space-y-2">
                                <p className="text-[10px] text-gray-500 leading-normal">
                                  Debes conectar tu cuenta Google para enviar el correo directamente vía Gmail.
                                </p>
                                <button
                                  type="button"
                                  onClick={handleGoogleLogin}
                                  disabled={isLoggingIn}
                                  className="h-8 inline-flex items-center justify-center gap-1 px-3 rounded-lg bg-white border border-gray-200 text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition"
                                >
                                  {isLoggingIn ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                                  <span>Conectar con Google</span>
                                </button>
                              </div>
                            ) : emailSendSuccess ? (
                              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-center text-emerald-800 animate-fadeIn space-y-1">
                                <p className="font-bold text-[11px] flex items-center justify-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  Propuesta enviada
                                </p>
                                <p className="text-[9px] text-emerald-600">Se despachó desde tu correo personal.</p>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <div>
                                  <label htmlFor={`to-${mk.id}`} className="block text-[10px] font-bold text-gray-500 mb-0.5">Destinatario</label>
                                  <input
                                    id={`to-${mk.id}`}
                                    type="email"
                                    placeholder="cliente@empresa.com"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 bg-white rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-black"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`subj-${mk.id}`} className="block text-[10px] font-bold text-gray-500 mb-0.5">Asunto</label>
                                  <input
                                    id={`subj-${mk.id}`}
                                    type="text"
                                    placeholder="Asunto"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 bg-white rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-black font-semibold"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`msg-${mk.id}`} className="block text-[10px] font-bold text-gray-500 mb-0.5">Mensaje</label>
                                  <textarea
                                    id={`msg-${mk.id}`}
                                    rows={3}
                                    placeholder="Escribe una breve introducción..."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 bg-white rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-black leading-normal"
                                  />
                                </div>

                                {emailSendError && (
                                  <div className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                    <span>{emailSendError}</span>
                                  </div>
                                )}

                                {showConfirmSend ? (
                                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                                    <p className="text-[10px] text-amber-950 font-bold leading-normal">
                                      ¿Confirmas enviar esta propuesta a {recipient}?
                                    </p>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleSendEmail(mk)}
                                        disabled={isSendingEmail}
                                        className="flex-1 h-7 rounded-md bg-gray-900 text-white text-[9px] font-bold hover:bg-black transition flex items-center justify-center gap-1"
                                      >
                                        {isSendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                        <span>Confirmar</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setShowConfirmSend(false)}
                                        className="px-2 h-7 rounded-md border border-gray-200 bg-white text-[9px] font-bold text-gray-700 hover:bg-gray-50"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!recipient.trim()) {
                                        setEmailSendError('Ingresa un destinatario válido.');
                                        return;
                                      }
                                      setEmailSendError(null);
                                      setShowConfirmSend(true);
                                    }}
                                    className="w-full h-8 inline-flex items-center justify-center gap-1 rounded-lg bg-gray-900 text-white hover:bg-black text-[11px] font-bold transition shadow-2xs"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Enviar Propuesta</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {mk.created_at ? new Date(mk.created_at).toLocaleDateString() : 'Reciente'}
                        </span>
                        <Link to="/contacto" className="font-bold text-gray-900 hover:underline flex items-center gap-0.5">
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: CREAR NUEVO MEDIA KIT INTERACTIVO */}
        {isMediaKitsNuevo && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">Generar Nuevo Media Kit</h1>
              <p className="text-xs text-gray-500 mt-1">Integra soportes OOH de Mendoza o Buenos Aires seleccionados en una propuesta formal.</p>
            </div>

            <form onSubmit={handleCreateMediaKit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="mkName" className="block text-xs font-bold text-gray-700 mb-1">Nombre Comercial de la Propuesta</label>
                  <input
                    id="mkName"
                    type="text"
                    required
                    placeholder="Ej: Campaña DOOH Primavera - Lanzamiento"
                    value={mkForm.name}
                    onChange={(e) => setMkForm({ ...mkForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="mkClient" className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Marca / Cliente</label>
                  <input
                    id="mkClient"
                    type="text"
                    required
                    placeholder="Ej: Cervecería Quilmes S.A."
                    value={mkForm.clientName}
                    onChange={(e) => setMkForm({ ...mkForm, clientName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="mkNotes" className="block text-xs font-bold text-gray-700 mb-1">Notas y Consideraciones comerciales</label>
                  <textarea
                    id="mkNotes"
                    rows={3}
                    placeholder="Notas sobre exclusividad, frecuencia de pauta o montajes especiales."
                    value={mkForm.notes}
                    onChange={(e) => setMkForm({ ...mkForm, notes: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50"
                  />
                </div>

                {/* Interactive Supports Selector Checklist */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Soportes OOH a incluir en el Kit ({mkForm.selectedIds.length})</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
                    {items.map((item) => {
                      const isChecked = mkForm.selectedIds.includes(item.canonical_id);
                      return (
                        <label key={item.canonical_id} className="flex items-start gap-2.5 text-xs text-gray-700 p-1 rounded-md hover:bg-white cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setMkForm({ ...mkForm, selectedIds: mkForm.selectedIds.filter(id => id !== item.canonical_id) });
                              } else {
                                setMkForm({ ...mkForm, selectedIds: [...mkForm.selectedIds, item.canonical_id] });
                              }
                            }}
                            className="mt-0.5 rounded text-gray-950 focus:ring-0"
                          />
                          <div>
                            <span className="font-bold text-gray-950">{item.name}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">ID: {item.canonical_id} | {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                <Link to="/dashboard/mediakits" className="px-4 py-2 text-gray-500 font-bold hover:text-black">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={!mkForm.name || mkForm.selectedIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gray-950 text-white font-bold hover:bg-gray-800 transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
                  Registrar Media Kit
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
