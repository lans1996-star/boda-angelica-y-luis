import React, { useState, useEffect, useRef } from 'react';

// === CONFIGURACIÓN DE TU GOOGLE SHEET ===
// Pega aquí tu URL de Google Apps Script (termina en /exec)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrudVHATWv497DPLQPUPHThFUfbTCgyup2gtOYafvPgFFG5Oo1YiFNZY2Vb_-weQZK/exec';

const DEFAULT_ITINERARIO = [
  { hora: '17:00 HRS', evento: 'Ceremonia Religiosa', descripcion: 'Parroquia del Sagrado Corazón', icono: 'iglesia' },
  { hora: '19:30 HRS', evento: 'Recepción & Cóctel', descripcion: 'Bienvenida con música de cuerdas', icono: 'coctel' },
  { hora: '21:00 HRS', evento: 'Cena & Brindis', descripcion: 'Nuestro primer brindis como esposos', icono: 'cena' },
  { hora: '22:30 HRS', evento: '¡A Bailar!', descripcion: 'Apertura de pista y celebración', icono: 'baile' }
];

const DEFAULT_HOTELES = [
  {
    nombre: 'Fiesta Inn Los Mochis',
    distancia: 'Zona Dorada • A 10 min de la recepción',
    telefono: '668 816 0900',
    codigo: 'BODA-AYL',
    mapa: 'https://maps.google.com/?q=Fiesta+Inn+Los+Mochis'
  },
  {
    nombre: 'Best Western Plus Los Mochis',
    distancia: 'Centro • Excelente ubicación y confort',
    telefono: '668 818 1111',
    codigo: '',
    mapa: 'https://maps.google.com/?q=Best+Western+Plus+Los+Mochis'
  },
  {
    nombre: 'Hotel Santa Anita',
    distancia: 'Centro Histórico • Tradición y hospitalidad',
    telefono: '668 818 7046',
    codigo: '',
    mapa: 'https://maps.google.com/?q=Hotel+Santa+Anita+Los+Mochis'
  }
];

const DEFAULT_GALERIA = [
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    caption: 'Nuestra historia comienza aquí'
  },
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
    caption: 'Rumbo al altar'
  },
  {
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
    caption: 'Para toda la vida'
  }
];

// Fechas con Zona Horaria de Los Mochis, Sinaloa (-07:00 MST) para exactitud global
const DEFAULT_CONFIG = {
  fechaBodaTexto: '13 de Marzo de 2027',
  fechaBodaISO: '2027-03-13T17:00:00-07:00',
  fechaLimite: '2027-02-13T23:59:59-07:00',
  ciudadEvento: 'Los Mochis, Sinaloa',
  frase: 'A veces lo que empieza como una locura se convierte en lo mejor de tu vida.',
  subtituloPadres: 'Con la bendición de Dios y el amor de nuestros padres',
  padresNovia1: 'Nombre Mamá de Angélica',
  padresNovia2: 'Nombre Papá de Angélica',
  padresNovio1: 'Maria Luisa Sedano Ruiz',
  padresNovio2: 'Jose Luis Norzagaray Alvarado',
  lugarCeremonia: 'Parroquia del Sagrado Corazón',
  horaCeremonia: '17:00 hrs',
  direccionCeremonia: 'Centro, Los Mochis, Sinaloa',
  mapaCeremonia: 'https://maps.google.com/?q=Parroquia+del+Sagrado+Corazon+Los+Mochis',
  lugarRecepcion: 'Salón de Eventos',
  horaRecepcion: '19:30 hrs',
  direccionRecepcion: 'Los Mochis, Sinaloa',
  mapaRecepcion: 'https://maps.google.com/?q=Los+Mochis+Sinaloa',
  vestimentaTitulo: 'FORMAL / ETIQUETA RIGUROSA',
  vestimentaNota: 'El color blanco y tonos marfil quedan reservados exclusivamente para la novia.',
  notaNinos: 'Adoramos a sus pequeños, pero hemos diseñado esta velada exclusivamente para adultos.',
  mostrarRegalos: 'true',
  mesaRegalos: 'Liverpool — Evento #51012027',
  linkMesaRegalos: 'https://mesaderegalos.liverpool.com.mx',
  cuentaBancaria: 'BBVA • CLABE: 0123 4567 8901 2345 67 • A nombre de Luis Ángel Norzagaray',
  mostrarGaleria: 'false',
  tituloGaleria: 'Nosotros',
  subtituloGaleria: 'Momentos que nos trajeron hasta aquí',
  mostrarHoteles: 'true',
  tituloHoteles: 'Sugerencias de Hospedaje',
  subtituloHoteles: 'Para quienes nos acompañan de fuera de la ciudad, hemos seleccionado estas opciones:',
  hashtag: '#AngelicaYLuisAngel',
  musicaUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  itinerarioJson: JSON.stringify(DEFAULT_ITINERARIO),
  galeriaJson: JSON.stringify(DEFAULT_GALERIA),
  hotelesJson: JSON.stringify(DEFAULT_HOTELES)
};

// Datos exclusivos para Modo Demostración (Cada invitación independiente tiene su propio ID de grupo)
const DEMO_INVITADOS = [
  { id: 'demo_1', fila: 2, familia: 'Familia Norzagaray', nombre: 'Luis Enrique Norzagaray', pases: 2, pasesConfirmados: 0, estado: 'Pendiente', actualizadoPor: '' },
  { id: 'demo_2', fila: 3, familia: 'Familia Norzagaray', nombre: 'José Luis Norzagaray', pases: 2, pasesConfirmados: 0, estado: 'Pendiente', actualizadoPor: '' },
  { id: 'demo_3', fila: 4, familia: 'Invitación Jaime García', nombre: 'Jaime García', pases: 2, pasesConfirmados: 2, estado: 'Confirmado', actualizadoPor: 'Jaime García' },
  { id: 'demo_4', fila: 5, familia: 'Invitación Fer', nombre: 'Fer', pases: 2, pasesConfirmados: 0, estado: 'Pendiente', actualizadoPor: '' }
];

// Formateador dinámico de fechas en español para que el RSVP y el sobre siempre coincidan con la config
const formatearFechaEspanol = (isoString) => {
  if (!isoString) return '13 de Febrero de 2027';
  const fecha = new Date(isoString);
  if (isNaN(fecha.getTime())) return isoString;
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mazatlan'
  });
};

const formatearFechaCortaPuntos = (isoString) => {
  if (!isoString) return '13 · MARZO · 2027';
  const fecha = new Date(isoString);
  if (isNaN(fecha.getTime())) return '13 · MARZO · 2027';
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = fecha.toLocaleDateString('es-MX', { month: 'long', timeZone: 'America/Mazatlan' }).toUpperCase();
  const anio = fecha.getFullYear();
  return `${dia} · ${mes} · ${anio}`;
};

// === FUNCIONES DE BÚSQUEDA INTELIGENTE (SIN ACENTOS + TOLERANCIA A ERRORES) ===
const normalizarTexto = (str = '') =>
  str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const distanciaLevenshtein = (a = '', b = '') => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + costo);
    }
  }
  return dp[m][n];
};

const calcularSimilitud = (busqueda, objetivo) => {
  const b = normalizarTexto(busqueda);
  const o = normalizarTexto(objetivo);
  if (!b || !o) return 0;
  if (o === b) return 1;
  if (o.includes(b) || b.includes(o)) return 0.92;
  const maxLen = Math.max(b.length, o.length);
  const simGlobal = 1 - distanciaLevenshtein(b, o) / maxLen;
  const palabrasB = b.split(' ');
  const palabrasO = o.split(' ');
  let sumaPalabras = 0;
  palabrasB.forEach(pb => {
    let mejor = 0;
    palabrasO.forEach(po => {
      const s = 1 - distanciaLevenshtein(pb, po) / Math.max(pb.length, po.length);
      if (s > mejor) mejor = s;
    });
    sumaPalabras += mejor;
  });
  return Math.max(simGlobal, sumaPalabras / palabrasB.length);
};

// Compresor de imágenes en el navegador
const comprimirImagenBase64 = (file, maxWidth = 1100, quality = 0.78) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Iconos vectoriales elegantes de trazo fino (Reemplazan todos los emojis decorativos)
const IconoOrnamento = ({ tipo, size = 28, color = "#9e8266" }) => {
  switch (tipo) {
    case 'iglesia':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M10 4h4M12 6L5 12v10h14V12L12 6z" />
          <path d="M9 22v-5a3 3 0 0 1 6 0v5" />
        </svg>
      );
    case 'coctel':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 22h8M12 15v7M12 15l8-11H4l8 11z" />
          <path d="M6.5 7.5h11" />
        </svg>
      );
    case 'cena':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      );
    case 'anillos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="14" r="6" />
          <circle cx="15" cy="14" r="6" />
          <path d="M12 4l2 2-2 2-2-2 2-2z" />
        </svg>
      );
    case 'hotel':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 22V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16" />
          <path d="M1 22h22M10 22v-4a2 2 0 0 1 4 0v4" />
          <path d="M7 8h2M15 8h2M7 12h2M15 12h2" />
        </svg>
      );
    case 'regalo':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      );
    case 'sobre':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case 'telefono':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'candado':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'musicaOn':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      );
    case 'musicaOff':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      );
    case 'baile':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
  }
};

const DivisorFloral = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '28px auto', maxWidth: '240px', opacity: 0.8 }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #b59b80)' }} />
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9e8266" strokeWidth="1" style={{ margin: '0 12px' }}>
      <path d="M12 2C13.5 7 17 10.5 22 12C17 13.5 13.5 17 12 22C10.5 17 7 13.5 2 12C7 10.5 10.5 7 12 2Z" />
    </svg>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #b59b80, transparent)' }} />
  </div>
);

const ToggleSwitch = ({ activo, onChange, label, descripcion }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', backgroundColor: activo ? '#f4fbf7' : '#fcfbf9', borderRadius: '14px', border: `1px solid ${activo ? '#c3e6cb' : '#e8e1da'}`, marginBottom: '20px', gap: '15px' }}>
    <div>
      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#3d352e', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span>{label}</span>
        <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', backgroundColor: activo ? '#27ae60' : '#95a5a6', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {activo ? 'Visible en la invitación' : 'Oculta'}
        </span>
      </div>
      {descripcion && <p style={{ margin: '5px 0 0', fontSize: '0.84rem', color: '#5c5248' }}>{descripcion}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!activo)}
      style={{
        width: '58px', height: '32px', borderRadius: '30px', border: 'none', cursor: 'pointer',
        backgroundColor: activo ? '#27ae60' : '#ccc', position: 'relative', transition: 'background-color 0.3s ease', flexShrink: 0
      }}
    >
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fff',
        position: 'absolute', top: '4px', left: activo ? '30px' : '4px',
        transition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }} />
    </button>
  </div>
);

export default function InvitacionBoda() {
  const [sobreAbierto, setSobreAbierto] = useState(false);
  const [animandoSobre, setAnimandoSobre] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [itinerario, setItinerario] = useState(DEFAULT_ITINERARIO);
  const [galeria, setGaleria] = useState(DEFAULT_GALERIA);
  const [hoteles, setHoteles] = useState(DEFAULT_HOTELES);
  const [fotoLightbox, setFotoLightbox] = useState(null);
  
  // Lista de invitados (Solo se puebla en Modo Demo o cuando el Admin inicia sesión con su clave)
  const [invitadosAdmin, setInvitadosAdmin] = useState([]);
  const [conectadoSheet, setConectadoSheet] = useState(false);

  // Estado de animación progresiva de la Línea de Tiempo
  const timelineRef = useRef(null);
  const rsvpSectionRef = useRef(null);
  const [progresoTimeline, setProgresoTimeline] = useState(0);
  
  // Audio
  const [reproduciendo, setReproduciendo] = useState(false);
  const audioRef = useRef(null);

  // Estados RSVP y Búsqueda Inteligente
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [sugerenciasNombres, setSugerenciasNombres] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [datosFamilia, setDatosFamilia] = useState({ idFamilia: '', miembros: [], modificadoPor: null, usuarioBuscando: '', idUsuarioBuscando: '' });
  const [modoSeleccion, setModoSeleccion] = useState('personalizado');
  const [copiadoExito, setCopiadoExito] = useState(false);
  
  // Contadores
  const [countdownBoda, setCountdownBoda] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [countdownRsvp, setCountdownRsvp] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  // Estados Admin (Autenticación real en el servidor)
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [adminTab, setAdminTab] = useState('invitados');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [nuevoInvitado, setNuevoInvitado] = useState({ familia: '', nombre: '', pases: 2, estado: 'Pendiente' });
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');
  const [nuevaFotoCaption, setNuevaFotoCaption] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const isUrlValida = Boolean(SCRIPT_URL && SCRIPT_URL.startsWith('https://script.google.com'));

  const mostrarGaleriaActiva = config.mostrarGaleria === true || config.mostrarGaleria === 'true';
  const mostrarRegalosActivo = config.mostrarRegalos !== false && config.mostrarRegalos !== 'false';
  const mostrarHotelesActivo = config.mostrarHoteles !== false && config.mostrarHoteles !== 'false';

  // Al iniciar: Si hay URL válida carga SOLO la configuración pública (protegiendo la lista de invitados)
  useEffect(() => {
    if (isUrlValida) {
      fetchPublicConfig();
    } else {
      setInvitadosAdmin(DEMO_INVITADOS);
    }
  }, [isUrlValida]);

  useEffect(() => {
    if (config.itinerarioJson) {
      try {
        const parsed = JSON.parse(config.itinerarioJson);
        if (Array.isArray(parsed)) setItinerario(parsed);
      } catch (e) {}
    }
  }, [config.itinerarioJson]);

  useEffect(() => {
    if (config.galeriaJson) {
      try {
        const parsed = JSON.parse(config.galeriaJson);
        if (Array.isArray(parsed)) setGaleria(parsed);
      } catch (e) {}
    }
  }, [config.galeriaJson]);

  useEffect(() => {
    if (config.hotelesJson) {
      try {
        const parsed = JSON.parse(config.hotelesJson);
        if (Array.isArray(parsed)) setHoteles(parsed);
      } catch (e) {}
    }
  }, [config.hotelesJson]);

  const fetchPublicConfig = async () => {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'get_public_config' })
      });
      const result = await response.json();
      if (result.success && result.config) {
        setConfig(prev => ({ ...prev, ...result.config }));
        setConectadoSheet(true);
      }
    } catch (error) {
      console.warn("Error conectando con Google Sheets.");
    }
  };

  // Relojes en tiempo real con Zona Horaria de Sinaloa (-07:00)
  useEffect(() => {
    const strBoda = config.fechaBodaISO || '2027-03-13T17:00:00-07:00';
    const strLimite = config.fechaLimite || '2027-02-13T23:59:59-07:00';

    const asegurarZonaHoraria = (str) => {
      if (!str) return new Date().getTime();
      const tieneOffset = /([+-]\d{2}:\d{2}|Z)$/.test(str.trim());
      return new Date(tieneOffset ? str.trim() : `${str.trim()}-07:00`).getTime();
    };

    const fechaBoda = asegurarZonaHoraria(strBoda);
    const fechaLimite = asegurarZonaHoraria(strLimite);
    
    const calcularTiempo = (futura) => {
      const distancia = futura - new Date().getTime();
      if (isNaN(distancia) || distancia < 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
      return {
        dias: Math.floor(distancia / (1000 * 60 * 60 * 24)),
        horas: Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((distancia % (1000 * 60)) / 1000)
      };
    };

    setCountdownBoda(calcularTiempo(fechaBoda));
    setCountdownRsvp(calcularTiempo(fechaLimite));

    const intervalo = setInterval(() => {
      setCountdownBoda(calcularTiempo(fechaBoda));
      setCountdownRsvp(calcularTiempo(fechaLimite));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [config.fechaLimite, config.fechaBodaISO]);

  // Observador para animaciones al hacer scroll
  useEffect(() => {
    if (isAdmin || !sobreAbierto) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -45px 0px' });
    
    document.querySelectorAll('.reveal-up, .reveal-scale, .timeline-step-item').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sobreAbierto, isAdmin, step, itinerario, galeria, hoteles, mostrarGaleriaActiva, mostrarRegalosActivo, mostrarHotelesActivo]);

  // Línea dorada progresiva al hacer scroll
  useEffect(() => {
    if (isAdmin || !sobreAbierto) return;
    const actualizarLineaScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const alturaVentana = window.innerHeight;
      const puntoInicio = alturaVentana * 0.72;
      const recorrido = puntoInicio - rect.top;
      const porcentaje = Math.max(0, Math.min(100, (recorrido / Math.max(rect.height, 1)) * 100));
      setProgresoTimeline(porcentaje);
    };

    window.addEventListener('scroll', actualizarLineaScroll, { passive: true });
    actualizarLineaScroll();
    return () => window.removeEventListener('scroll', actualizarLineaScroll);
  }, [sobreAbierto, isAdmin, itinerario]);

  const handleAbrirInvitacion = () => {
    setAnimandoSobre(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.45;
      audioRef.current.play().then(() => setReproduciendo(true)).catch(() => {});
    }
    setTimeout(() => {
      setSobreAbierto(true);
    }, 850);
  };

  const irAConfirmarAsistencia = () => {
    rsvpSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleMusica = () => {
    if (!audioRef.current) return;
    if (reproduciendo) {
      audioRef.current.pause();
      setReproduciendo(false);
    } else {
      audioRef.current.play().then(() => setReproduciendo(true)).catch(() => {});
    }
  };

  const copiarCuenta = () => {
    navigator.clipboard?.writeText(config.cuentaBancaria);
    setCopiadoExito(true);
    setTimeout(() => setCopiadoExito(false), 2500);
  };

  // === BÚSQUEDA INTELIGENTE DE INVITADOS (EN EL SERVIDOR PARA PROTEGER LA LISTA) ===
  const ejecutarBusquedaInteligente = async (textoABuscar) => {
    const query = textoABuscar.trim();
    if (!query) return;

    setIsLoading(true);
    setMensaje(null);
    setSugerenciasNombres([]);

    // Si estamos conectados a Google Sheets, la búsqueda se hace 100% en el servidor
    if (isUrlValida) {
      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ action: 'buscar_rsvp', nombre: query })
        });
        const result = await response.json();
        if (result.success) {
          const miembrosPreparados = result.familia.map(m => ({
            ...m,
            pasesConfirmados: m.estado === 'Confirmado' ? (Number(m.pasesConfirmados) || Number(m.pases) || 1) : (Number(m.pases) || 1)
          }));
          setDatosFamilia({
            idFamilia: result.idFamilia || result.familia[0]?.familia || 'Invitación',
            miembros: miembrosPreparados,
            modificadoPor: result.modificadoPor,
            usuarioBuscando: result.usuarioBuscando,
            idUsuarioBuscando: result.idUsuarioBuscando
          });
          setModoSeleccion('personalizado');
          setStep(2);
        } else {
          if (result.sugerencias && result.sugerencias.length > 0) {
            setSugerenciasNombres(result.sugerencias);
          }
          setMensaje({ texto: result.message, tipo: result.sugerencias?.length ? 'warning' : 'error' });
        }
      } catch (error) {
        setMensaje({ texto: 'Error de conexión con el servidor. Verifica tu conexión a internet.', tipo: 'error' });
      }
      setIsLoading(false);
      return;
    }

    // MODO DEMOSTRACIÓN LOCAL (Solo cuando SCRIPT_URL aún no ha sido configurada)
    const queryNorm = normalizarTexto(query);
    const exacto = invitadosAdmin.find(i => normalizarTexto(i.nombre) === queryNorm);

    if (exacto) {
      const fam = invitadosAdmin
        .filter(i => i.familia === exacto.familia)
        .map(m => ({
          ...m,
          pasesConfirmados: m.estado === 'Confirmado' ? (Number(m.pasesConfirmados) || Number(m.pases) || 1) : (Number(m.pases) || 1)
        }));
      const modPor = fam.find(i => i.actualizadoPor)?.actualizadoPor || null;
      setDatosFamilia({
        idFamilia: exacto.familia,
        miembros: fam,
        modificadoPor: modPor,
        usuarioBuscando: exacto.nombre,
        idUsuarioBuscando: exacto.id
      });
      setModoSeleccion('personalizado');
      setStep(2);
      setIsLoading(false);
      return;
    }

    const puntuados = invitadosAdmin
      .map(inv => ({ inv, score: calcularSimilitud(queryNorm, inv.nombre) }))
      .filter(item => item.score >= 0.52)
      .sort((a, b) => b.score - a.score);

    if (puntuados.length > 0) {
      setSugerenciasNombres(puntuados.slice(0, 3).map(p => p.inv.nombre));
      setMensaje({
        texto: 'No encontramos coincidencia exacta, pero encontramos nombres muy parecidos:',
        tipo: 'warning'
      });
    } else {
      setMensaje({
        texto: 'Modo Prueba: Escribe "Luis Enrique", "Jose Luis", "Jaime Garcia" o "Fer" para probar el flujo.',
        tipo: 'error'
      });
    }
    setIsLoading(false);
  };

  const buscarInvitado = (e) => {
    e.preventDefault();
    ejecutarBusquedaInteligente(nombreBusqueda);
  };

  const seleccionarSugerencia = (nombreSugerido) => {
    setNombreBusqueda(nombreSugerido);
    ejecutarBusquedaInteligente(nombreSugerido);
  };

  // Botones rápidos corregidos: "Sólo por mí" ya NO cancela a los miembros que ya habían confirmado
  const aplicarAccionRapida = (accion) => {
    setModoSeleccion(accion);
    const nuevaFamilia = datosFamilia.miembros.map(m => {
      if (accion === 'todos') {
        return { ...m, estado: 'Confirmado', pasesConfirmados: Number(m.pases) || 1 };
      }
      if (accion === 'ninguno') {
        return { ...m, estado: 'No asistirá', pasesConfirmados: 0 };
      }
      if (accion === 'solo_yo') {
        const esQuienBusca = m.id
          ? m.id === datosFamilia.idUsuarioBuscando
          : normalizarTexto(m.nombre) === normalizarTexto(datosFamilia.usuarioBuscando);
        if (esQuienBusca) {
          return { ...m, estado: 'Confirmado', pasesConfirmados: Number(m.pases) || 1 };
        }
        // Conserva intacto el estado previo de los demás integrantes
        return { ...m };
      }
      return { ...m };
    });
    setDatosFamilia(prev => ({ ...prev, miembros: nuevaFamilia }));
  };

  const cambiarEstadoMiembro = (index, nuevoEstado) => {
    setModoSeleccion('personalizado');
    const nuevaFamilia = [...datosFamilia.miembros];
    const pasesMax = Number(nuevaFamilia[index].pases) || 1;
    nuevaFamilia[index] = {
      ...nuevaFamilia[index],
      estado: nuevoEstado,
      pasesConfirmados: nuevoEstado === 'Confirmado' ? (nuevaFamilia[index].pasesConfirmados || pasesMax) : 0
    };
    setDatosFamilia(prev => ({ ...prev, miembros: nuevaFamilia }));
  };

  const cambiarPasesConfirmadosMiembro = (index, cantidad) => {
    const nuevaFamilia = [...datosFamilia.miembros];
    nuevaFamilia[index] = {
      ...nuevaFamilia[index],
      estado: 'Confirmado',
      pasesConfirmados: Number(cantidad)
    };
    setDatosFamilia(prev => ({ ...prev, miembros: nuevaFamilia }));
  };

  // Guardado seguro: Primero espera confirmación del servidor y muestra errores también en el Paso 2
  const guardarConfirmacion = async () => {
    const hayPendientes = datosFamilia.miembros.every(m => m.estado === 'Pendiente');
    if (hayPendientes) {
      setMensaje({ texto: 'Por favor selecciona si asistirán o no antes de guardar.', tipo: 'error' });
      return;
    }

    setIsLoading(true);
    setMensaje(null);

    if (!isUrlValida) {
      // Actualización por ID único en modo demostración
      const nuevosInv = invitadosAdmin.map(inv => {
        const modificado = datosFamilia.miembros.find(m => m.id === inv.id || m.fila === inv.fila);
        return modificado
          ? { ...inv, estado: modificado.estado, pasesConfirmados: modificado.pasesConfirmados, actualizadoPor: datosFamilia.usuarioBuscando }
          : inv;
      });
      setInvitadosAdmin(nuevosInv);
      setStep(1);
      setNombreBusqueda('');
      setSugerenciasNombres([]);
      setMensaje({
        texto: '¡Vista previa probada con éxito! (Recuerda pegar tu SCRIPT_URL antes de enviarla por WhatsApp para que se guarde en tu Google Sheet).',
        tipo: 'success'
      });
      setIsLoading(false);
      return;
    }

    try {
      const payload = JSON.stringify({
        familia: datosFamilia.miembros,
        usuarioBuscando: datosFamilia.usuarioBuscando
      });
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'guardar_rsvp', payload })
      });
      const result = await response.json();

      if (result.success) {
        setStep(1);
        setNombreBusqueda('');
        setSugerenciasNombres([]);
        setMensaje({ texto: result.message, tipo: 'success' });
      } else {
        setMensaje({ texto: result.message || 'No se pudo guardar tu confirmación. Intenta nuevamente.', tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: 'Error de conexión al guardar. Por favor revisa tu internet e intenta de nuevo.', tipo: 'error' });
    }
    setIsLoading(false);
  };

  // === AUTENTICACIÓN Y FUNCIONES ADMIN (VALIDADAS EN EL SERVIDOR) ===
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setIsLoading(true);
    setErrorLogin('');

    if (!isUrlValida) {
      // En modo vista previa sin servidor permite abrir el panel para conocerlo
      setAdminKey(passwordInput);
      setIsAdmin(true);
      setMostrarModalLogin(false);
      setPasswordInput('');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'admin_login_and_get_data',
          adminKey: passwordInput
        })
      });
      const result = await response.json();
      if (result.success) {
        setAdminKey(passwordInput);
        setConfig(prev => ({ ...prev, ...result.config }));
        setInvitadosAdmin(result.invitados || []);
        setConectadoSheet(true);
        setIsAdmin(true);
        setMostrarModalLogin(false);
        setPasswordInput('');
      } else {
        setErrorLogin(result.message || 'Clave incorrecta.');
      }
    } catch (err) {
      setErrorLogin('No se pudo conectar con Google Sheets para verificar tu clave.');
    }
    setIsLoading(false);
  };

  // Actualizaciones inmutables de estado (Sin mutar objetos anidados)
  const actualizarPasoItinerario = (index, campo, valor) => {
    const copia = itinerario.map((item, idx) => idx === index ? { ...item, [campo]: valor } : item);
    setItinerario(copia);
    setConfig(prev => ({ ...prev, itinerarioJson: JSON.stringify(copia) }));
  };

  const agregarPasoItinerario = () => {
    const copia = [...itinerario, { hora: '23:00 HRS', evento: 'Nuevo Momento', descripcion: 'Descripción breve', icono: 'anillos' }];
    setItinerario(copia);
    setConfig(prev => ({ ...prev, itinerarioJson: JSON.stringify(copia) }));
  };

  const eliminarPasoItinerario = (index) => {
    const copia = itinerario.filter((_, idx) => idx !== index);
    setItinerario(copia);
    setConfig(prev => ({ ...prev, itinerarioJson: JSON.stringify(copia) }));
  };

  const moverPasoItinerario = (index, direccion) => {
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= itinerario.length) return;
    const copia = [...itinerario];
    const temp = { ...copia[index] };
    copia[index] = { ...copia[nuevoIndex] };
    copia[nuevoIndex] = temp;
    setItinerario(copia);
    setConfig(prev => ({ ...prev, itinerarioJson: JSON.stringify(copia) }));
  };

  // Hoteles inmutables
  const actualizarHotel = (index, campo, valor) => {
    const copia = hoteles.map((item, idx) => idx === index ? { ...item, [campo]: valor } : item);
    setHoteles(copia);
    setConfig(prev => ({ ...prev, hotelesJson: JSON.stringify(copia) }));
  };

  const agregarHotel = () => {
    const copia = [
      ...hoteles,
      { nombre: 'Nuevo Hotel', distancia: 'A 10 min del evento', telefono: '668 000 0000', codigo: '', mapa: 'https://maps.google.com' }
    ];
    setHoteles(copia);
    setConfig(prev => ({ ...prev, hotelesJson: JSON.stringify(copia) }));
  };

  const eliminarHotel = (index) => {
    const copia = hoteles.filter((_, idx) => idx !== index);
    setHoteles(copia);
    setConfig(prev => ({ ...prev, hotelesJson: JSON.stringify(copia) }));
  };

  // Subida de fotos directo a Google Drive (Guarda solo la URL ligera en Google Sheets)
  const handleSubirArchivosGaleria = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSubiendoFoto(true);
    try {
      const nuevasFotos = [];
      for (const file of files) {
        const base64 = await comprimirImagenBase64(file, 1100, 0.78);
        if (isUrlValida) {
          const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              action: 'upload_photo_drive',
              adminKey,
              filename: file.name,
              base64
            })
          });
          const res = await response.json();
          if (res.success && res.url) {
            nuevasFotos.push({ url: res.url, caption: '' });
          } else {
            alert('Error subiendo imagen a Drive: ' + (res.message || 'Verifica permisos de DriveApp'));
          }
        } else {
          nuevasFotos.push({ url: base64, caption: '' });
        }
      }
      if (nuevasFotos.length > 0) {
        const actualizada = [...galeria, ...nuevasFotos];
        setGaleria(actualizada);
        setConfig(prev => ({ ...prev, galeriaJson: JSON.stringify(actualizada) }));
      }
    } catch (err) {
      alert('No se pudo procesar o subir una de las imágenes seleccionadas.');
    }
    setSubiendoFoto(false);
    e.target.value = '';
  };

  const agregarFotoPorUrl = () => {
    if (!nuevaFotoUrl.trim()) return alert('Ingresa el enlace de la fotografía.');
    const actualizada = [...galeria, { url: nuevaFotoUrl.trim(), caption: nuevaFotoCaption.trim() }];
    setGaleria(actualizada);
    setConfig(prev => ({ ...prev, galeriaJson: JSON.stringify(actualizada) }));
    setNuevaFotoUrl('');
    setNuevaFotoCaption('');
  };

  const actualizarCaptionFoto = (index, texto) => {
    const copia = galeria.map((item, idx) => idx === index ? { ...item, caption: texto } : item);
    setGaleria(copia);
    setConfig(prev => ({ ...prev, galeriaJson: JSON.stringify(copia) }));
  };

  const eliminarFotoGaleria = (index) => {
    const copia = galeria.filter((_, idx) => idx !== index);
    setGaleria(copia);
    setConfig(prev => ({ ...prev, galeriaJson: JSON.stringify(copia) }));
  };

  const moverFotoGaleria = (index, direccion) => {
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= galeria.length) return;
    const copia = [...galeria];
    const temp = { ...copia[index] };
    copia[index] = { ...copia[nuevoIndex] };
    copia[nuevoIndex] = temp;
    setGaleria(copia);
    setConfig(prev => ({ ...prev, galeriaJson: JSON.stringify(copia) }));
  };

  const guardarConfiguracionAdmin = async () => {
    const payloadConfig = {
      ...config,
      itinerarioJson: JSON.stringify(itinerario),
      galeriaJson: JSON.stringify(galeria),
      hotelesJson: JSON.stringify(hoteles)
    };
    if (!isUrlValida) return alert('Modo Vista Previa: Cambios aplicados localmente. Conecta tu URL de Apps Script para respaldarlos en Google Sheets.');
    setIsLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'save_config',
          adminKey,
          payload: JSON.stringify(payloadConfig)
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('¡Cambios guardados en tu Google Sheet con éxito!');
      } else {
        alert('No se pudo guardar: ' + (result.message || 'Error desconocido'));
      }
    } catch (e) {
      alert('Error de red al guardar la configuración.');
    }
    setIsLoading(false);
  };

  const guardarInvitadoAdmin = async () => {
    if (!nuevoInvitado.nombre.trim() || !nuevoInvitado.familia.trim()) {
      return alert("Escribe el Grupo Familiar (o código de invitación) y el Nombre del invitado.");
    }
    if (!isUrlValida) {
      setInvitadosAdmin([
        ...invitadosAdmin,
        { ...nuevoInvitado, id: 'demo_' + Date.now(), fila: Date.now(), pasesConfirmados: 0 }
      ]);
      setNuevoInvitado({ familia: '', nombre: '', pases: 2, estado: 'Pendiente' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'save_guest_admin',
          adminKey,
          payload: JSON.stringify(nuevoInvitado)
        })
      });
      const result = await response.json();
      if (result.success) {
        setInvitadosAdmin(result.invitados || []);
        setNuevoInvitado({ familia: '', nombre: '', pases: 2, estado: 'Pendiente' });
      } else {
        alert('Error guardando invitado: ' + (result.message || ''));
      }
    } catch (e) {
      alert('Error de conexión guardando invitado.');
    }
    setIsLoading(false);
  };

  const eliminarInvitado = async (fila) => {
    if (!window.confirm("¿Eliminar a este invitado de la lista?")) return;
    if (!isUrlValida) {
      setInvitadosAdmin(invitadosAdmin.filter(i => i.fila !== fila));
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'delete_guest', adminKey, fila })
      });
      const result = await response.json();
      if (result.success) {
        setInvitadosAdmin(result.invitados || []);
      } else {
        alert('No se pudo eliminar: ' + (result.message || ''));
      }
    } catch (e) {
      alert('Error al eliminar invitado.');
    }
    setIsLoading(false);
  };

  // Estadísticas exactas basadas en pasesConfirmados reales
  const totalConfirmados = invitadosAdmin
    .filter(i => i.estado === 'Confirmado')
    .reduce((acc, i) => acc + (Number(i.pasesConfirmados) || Number(i.pases) || 1), 0);
  const totalPendientes = invitadosAdmin
    .filter(i => i.estado === 'Pendiente')
    .reduce((acc, i) => acc + (Number(i.pases) || 1), 0);
  const totalCancelados = invitadosAdmin
    .filter(i => i.estado === 'No asistirá')
    .reduce((acc, i) => acc + (Number(i.pases) || 1), 0);
  const totalPasesFamilia = datosFamilia.miembros.reduce((acc, m) => acc + (Number(m.pases) || 1), 0);

  const camposConfigEditables = [
    { key: 'fechaBodaTexto', label: 'Fecha Principal (Texto visible)' },
    { key: 'fechaBodaISO', label: 'Fecha/Hora Boda ISO (Ej: 2027-03-13T17:00:00-07:00)' },
    { key: 'fechaLimite', label: 'Fecha Límite RSVP ISO (Ej: 2027-02-13T23:59:59-07:00)' },
    { key: 'ciudadEvento', label: 'Ciudad del Evento' },
    { key: 'frase', label: 'Frase Romántica Principal' },
    { key: 'padresNovia1', label: 'Madre de la Novia' },
    { key: 'padresNovia2', label: 'Padre de la Novia' },
    { key: 'padresNovio1', label: 'Madre del Novio' },
    { key: 'padresNovio2', label: 'Padre del Novio' },
    { key: 'lugarCeremonia', label: 'Lugar de Ceremonia Religiosa' },
    { key: 'horaCeremonia', label: 'Hora de Ceremonia' },
    { key: 'direccionCeremonia', label: 'Dirección de la Iglesia' },
    { key: 'mapaCeremonia', label: 'Enlace Google Maps (Iglesia)' },
    { key: 'lugarRecepcion', label: 'Lugar de la Recepción' },
    { key: 'horaRecepcion', label: 'Hora de la Recepción' },
    { key: 'direccionRecepcion', label: 'Dirección del Salón' },
    { key: 'mapaRecepcion', label: 'Enlace Google Maps (Salón)' },
    { key: 'vestimentaTitulo', label: 'Código de Vestimenta' },
    { key: 'vestimentaNota', label: 'Nota de Vestimenta' },
    { key: 'notaNinos', label: 'Mensaje sobre Niños / Sólo Adultos' },
    { key: 'hashtag', label: 'Hashtag de la Boda' },
    { key: 'musicaUrl', label: 'URL de Música de Fondo (.mp3)' }
  ];

  // === VISTA PANEL DE ADMINISTRACIÓN (NOVIOS) ===
  if (isAdmin) {
    const invitadosFiltrados = invitadosAdmin.filter(i => filtroEstado === 'Todos' ? true : i.estado === filtroEstado);

    return (
      <div style={{ padding: '30px 20px', fontFamily: "'Montserrat', sans-serif", maxWidth: '1060px', margin: '0 auto', color: '#333', backgroundColor: '#faf8f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #e8e1da', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#6e5b4b', fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem' }}>Panel de Novios — Angélica & Luis Ángel</h2>
            <span style={{ fontSize: '0.82rem', color: conectadoSheet ? '#27ae60' : '#d35400', fontWeight: '600' }}>
              {conectadoSheet ? '● Conectado y autenticado con Google Drive' : '● Modo Demostración (Falta configurar SCRIPT_URL)'}
            </span>
          </div>
          <button onClick={() => setIsAdmin(false)} style={{ padding: '10px 24px', background: '#6e5b4b', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            ← Volver a la Invitación
          </button>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', textAlign: 'center', borderBottom: '4px solid #27ae60', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#27ae60' }}>{totalConfirmados}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#555' }}>Asistentes Confirmados</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', textAlign: 'center', borderBottom: '4px solid #f39c12', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#f39c12' }}>{totalPendientes}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#555' }}>Pases Pendientes</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', textAlign: 'center', borderBottom: '4px solid #c0392b', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#c0392b' }}>{totalCancelados}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#555' }}>Pases Rechazados</div>
          </div>
        </div>
        
        {/* Pestañas del Admin */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {[
            { id: 'invitados', label: 'Invitados y Familias' },
            { id: 'itinerario', label: 'Línea de Tiempo' },
            { id: 'hoteles', label: `Hospedaje (${mostrarHotelesActivo ? 'ON' : 'OFF'})` },
            { id: 'galeria', label: `Galería (${mostrarGaleriaActiva ? 'ON' : 'OFF'})` },
            { id: 'regalos', label: `Regalos (${mostrarRegalosActivo ? 'ON' : 'OFF'})` },
            { id: 'config', label: 'Textos Generales' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              style={{
                padding: '11px 18px',
                background: adminTab === tab.id ? '#8c7662' : '#e8e1da',
                color: adminTab === tab.id ? 'white' : '#5a493c',
                border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PESTAÑA: HOSPEDAJE */}
        {adminTab === 'hoteles' && (
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <ToggleSwitch
              activo={mostrarHotelesActivo}
              onChange={(val) => setConfig({ ...config, mostrarHoteles: String(val) })}
              label="Sección de Sugerencias de Hospedaje"
              descripcion="Muestra opciones de hoteles recomendados para los invitados que viajan desde fuera de la ciudad."
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>Título de la Sección</label>
                <input type="text" value={config.tituloHoteles || ''} onChange={e => setConfig({ ...config, tituloHoteles: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>Mensaje para Invitados Foráneos</label>
                <input type="text" value={config.subtituloHoteles || ''} onChange={e => setConfig({ ...config, subtituloHoteles: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#6e5b4b' }}>Hoteles Recomendados ({hoteles.length})</h4>
              <button type="button" onClick={agregarHotel} style={{ padding: '9px 18px', background: '#f3ede6', color: '#6e5b4b', border: '1px solid #d5c8bb', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                + Agregar Hotel
              </button>
            </div>

            {hoteles.map((h, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', padding: '18px', backgroundColor: '#fcfbf9', borderRadius: '12px', border: '1px solid #e8e1da', marginBottom: '14px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#555', display: 'block', marginBottom: '4px' }}>Nombre del Hotel</label>
                  <input type="text" value={h.nombre} onChange={e => actualizarHotel(idx, 'nombre', e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: '600' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#555', display: 'block', marginBottom: '4px' }}>Zona / Distancia</label>
                  <input type="text" value={h.distancia} onChange={e => actualizarHotel(idx, 'distancia', e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#555', display: 'block', marginBottom: '4px' }}>Teléfono</label>
                  <input type="text" value={h.telefono} onChange={e => actualizarHotel(idx, 'telefono', e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#555', display: 'block', marginBottom: '4px' }}>Código Convenio (Opcional)</label>
                  <input type="text" placeholder="Ej: BODA-AYL" value={h.codigo || ''} onChange={e => actualizarHotel(idx, 'codigo', e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#555', display: 'block', marginBottom: '4px' }}>Enlace Google Maps</label>
                  <input type="text" value={h.mapa} onChange={e => actualizarHotel(idx, 'mapa', e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button type="button" onClick={() => eliminarHotel(idx)} style={{ padding: '9px 14px', background: '#fdedec', color: '#c0392b', border: '1px solid #f5b7b1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <button onClick={guardarConfiguracionAdmin} disabled={isLoading} style={{ marginTop: '15px', padding: '14px 32px', background: '#8c7662', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoading ? 'Guardando...' : 'Guardar Hoteles'}
            </button>
          </div>
        )}

        {/* PESTAÑA: GALERÍA DE FOTOS (GUARDA ARCHIVOS EN GOOGLE DRIVE) */}
        {adminTab === 'galeria' && (
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <ToggleSwitch
              activo={mostrarGaleriaActiva}
              onChange={(val) => setConfig({ ...config, mostrarGaleria: String(val) })}
              label="Sección de Galería Fotográfica"
              descripcion="Mantén esta opción apagada mientras no se hayan tomado la sesión de fotos. Cuando las subas, se guardarán directamente en una carpeta de tu Google Drive."
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>Título de la Galería</label>
                <input type="text" value={config.tituloGaleria || ''} onChange={e => setConfig({ ...config, tituloGaleria: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>Subtítulo de la Galería</label>
                <input type="text" value={config.subtituloGaleria || ''} onChange={e => setConfig({ ...config, subtituloGaleria: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div style={{ border: '2px dashed #cbb9a4', borderRadius: '14px', padding: '24px', textAlign: 'center', backgroundColor: '#fcfbf9' }}>
                <h4 style={{ margin: '0 0 6px', color: '#5a493c' }}>Subir Fotos a tu Google Drive</h4>
                <p style={{ fontSize: '0.8rem', color: '#5c5248', margin: '0 0 15px' }}>
                  Las imágenes se suben a la carpeta "Fotos Boda Angelica y Luis" en tu Drive y guardan solo su link ligero.
                </p>
                <label style={{ display: 'inline-block', padding: '11px 22px', backgroundColor: '#8c7662', color: '#fff', borderRadius: '25px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
                  {subiendoFoto ? 'Subiendo a Google Drive...' : '+ Seleccionar Fotos'}
                  <input type="file" accept="image/*" multiple onChange={handleSubirArchivosGaleria} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ border: '1px solid #e8e1da', borderRadius: '14px', padding: '22px', backgroundColor: '#fcfbf9' }}>
                <h4 style={{ margin: '0 0 10px', color: '#5a493c' }}>O agregar mediante enlace directo (URL)</h4>
                <input
                  type="text"
                  placeholder="Pega aquí el link de la imagen (https://...)"
                  value={nuevaFotoUrl}
                  onChange={e => setNuevaFotoUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}
                />
                <input
                  type="text"
                  placeholder="Pie de foto opcional (Ej: Nuestro compromiso)"
                  value={nuevaFotoCaption}
                  onChange={e => setNuevaFotoCaption(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px' }}
                />
                <button type="button" onClick={agregarFotoPorUrl} style={{ padding: '10px 20px', backgroundColor: '#6e5b4b', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
                  + Añadir por URL
                </button>
              </div>
            </div>

            <h4 style={{ margin: '0 0 15px', color: '#5a493c' }}>Fotos en la Galería ({galeria.length})</h4>
            {galeria.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No hay fotos cargadas todavía.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {galeria.map((foto, idx) => (
                  <div key={idx} style={{ border: '1px solid #e8e1da', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fcfbf9', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#eee' }}>
                      <img src={foto.url} alt={foto.caption || `Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Pie de foto opcional..."
                        value={foto.caption || ''}
                        onChange={e => actualizarCaptionFoto(idx, e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', marginTop: 'auto' }}>
                        <div>
                          <button type="button" onClick={() => moverFotoGaleria(idx, -1)} style={{ padding: '5px 9px', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer', marginRight: '4px' }}>←</button>
                          <button type="button" onClick={() => moverFotoGaleria(idx, 1)} style={{ padding: '5px 9px', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>→</button>
                        </div>
                        <button type="button" onClick={() => eliminarFotoGaleria(idx)} style={{ padding: '5px 10px', border: '1px solid #f5b7b1', background: '#fdedec', color: '#c0392b', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={guardarConfiguracionAdmin} disabled={isLoading} style={{ marginTop: '25px', padding: '14px 32px', background: '#8c7662', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoading ? 'Guardando...' : 'Guardar Configuración de Galería'}
            </button>
          </div>
        )}

        {/* PESTAÑA: MESA DE REGALOS */}
        {adminTab === 'regalos' && (
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <ToggleSwitch
              activo={mostrarRegalosActivo}
              onChange={(val) => setConfig({ ...config, mostrarRegalos: String(val) })}
              label="Sección de Mesa de Regalos y Lluvia de Sobres"
              descripcion="Puedes encender o apagar esta sección en cualquier momento para mostrarla u ocultarla en la invitación."
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxWidth: '680px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.82rem', marginBottom: '6px', color: '#555' }}>
                  Tienda y Número de Evento (Ej: Liverpool — Evento #51012027)
                </label>
                <input
                  type="text"
                  value={config.mesaRegalos || ''}
                  onChange={e => setConfig({ ...config, mesaRegalos: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.82rem', marginBottom: '6px', color: '#555' }}>
                  Enlace Web a la Mesa de Regalos
                </label>
                <input
                  type="text"
                  value={config.linkMesaRegalos || ''}
                  onChange={e => setConfig({ ...config, linkMesaRegalos: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.82rem', marginBottom: '6px', color: '#555' }}>
                  Datos Bancarios / Lluvia de Sobres (Deja vacío si prefieres no mostrar CLABE pública)
                </label>
                <input
                  type="text"
                  value={config.cuentaBancaria || ''}
                  onChange={e => setConfig({ ...config, cuentaBancaria: e.target.value })}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <button onClick={guardarConfiguracionAdmin} disabled={isLoading} style={{ marginTop: '25px', padding: '14px 32px', background: '#8c7662', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoading ? 'Guardando...' : 'Guardar Configuración de Regalos'}
            </button>
          </div>
        )}

        {/* PESTAÑA: LÍNEA DE TIEMPO */}
        {adminTab === 'itinerario' && (
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#6e5b4b' }}>Personalizar Línea de Tiempo</h3>
                <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#5c5248' }}>Agrega, ordena o modifica cada actividad del programa de tu boda.</p>
              </div>
              <button onClick={agregarPasoItinerario} style={{ padding: '10px 18px', background: '#f3ede6', color: '#6e5b4b', border: '1px solid #d5c8bb', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                + Añadir Momento
              </button>
            </div>

            {itinerario.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', alignItems: 'center', padding: '15px', background: '#fcfbf9', borderRadius: '12px', border: '1px solid #eee', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#555', display: 'block', marginBottom: '4px' }}>Hora</label>
                  <input type="text" value={item.hora} onChange={e => actualizarPasoItinerario(idx, 'hora', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: '600' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#555', display: 'block', marginBottom: '4px' }}>Título del Evento</label>
                  <input type="text" value={item.evento} onChange={e => actualizarPasoItinerario(idx, 'evento', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#555', display: 'block', marginBottom: '4px' }}>Subtítulo o Detalle</label>
                  <input type="text" value={item.descripcion || ''} onChange={e => actualizarPasoItinerario(idx, 'descripcion', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#555', display: 'block', marginBottom: '4px' }}>Ícono</label>
                  <select value={item.icono} onChange={e => actualizarPasoItinerario(idx, 'icono', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                    <option value="iglesia">Iglesia</option>
                    <option value="anillos">Anillos</option>
                    <option value="coctel">Cóctel</option>
                    <option value="cena">Cena / Brindis</option>
                    <option value="baile">Fiesta / Baile</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '5px', paddingTop: '16px', justifyContent: 'flex-end' }}>
                  <button onClick={() => moverPasoItinerario(idx, -1)} title="Subir" style={{ padding: '7px 10px', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>↑</button>
                  <button onClick={() => moverPasoItinerario(idx, 1)} title="Bajar" style={{ padding: '7px 10px', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>↓</button>
                  <button onClick={() => eliminarPasoItinerario(idx)} title="Eliminar" style={{ padding: '7px 10px', border: '1px solid #f5b7b1', background: '#fdedec', color: '#c0392b', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))}

            <button onClick={guardarConfiguracionAdmin} disabled={isLoading} style={{ marginTop: '20px', padding: '14px 32px', background: '#8c7662', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoading ? 'Guardando...' : 'Guardar Línea de Tiempo'}
            </button>
          </div>
        )}

        {/* PESTAÑA: TEXTOS GENERALES */}
        {adminTab === 'config' && (
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#6e5b4b' }}>Editar Información General</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {camposConfigEditables.map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.8rem', marginBottom: '6px', color: '#555' }}>
                    {label}
                  </label>
                  <input 
                    type="text"
                    value={config[key] || ''} 
                    onChange={(e) => setConfig({...config, [key]: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                </div>
              ))}
            </div>
            <button onClick={guardarConfiguracionAdmin} disabled={isLoading} style={{ marginTop: '25px', padding: '14px 32px', background: '#8c7662', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoading ? 'Guardando...' : 'Guardar Todos los Cambios'}
            </button>
          </div>
        )}

        {/* PESTAÑA: LISTA DE INVITADOS Y FAMILIAS */}
        {adminTab === 'invitados' && (
          <div>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
              <h3 style={{ marginTop: 0, color: '#6e5b4b' }}>Agregar Invitado o Familia</h3>
              <p style={{ fontSize: '0.82rem', color: '#5c5248', marginTop: '-8px', marginBottom: '15px' }}>
                Importante: Usa un mismo <strong>Grupo Familiar</strong> solo para personas que comparten la misma invitación (ej. "Familia Norzagaray Sedano"). Para amigos individuales usa un grupo único por persona (ej. "Invitación Jaime García").
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Grupo / Familia (Ej: Familia Sedano)" value={nuevoInvitado.familia} onChange={e => setNuevoInvitado({...nuevoInvitado, familia: e.target.value})} style={{ flex: 1, minWidth: '180px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <input type="text" placeholder="Nombre y Apellido" value={nuevoInvitado.nombre} onChange={e => setNuevoInvitado({...nuevoInvitado, nombre: e.target.value})} style={{ flex: 2, minWidth: '220px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <input type="number" min="1" max="15" placeholder="Pases" value={nuevoInvitado.pases} onChange={e => setNuevoInvitado({...nuevoInvitado, pases: Number(e.target.value)})} style={{ width: '90px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <button onClick={guardarInvitadoAdmin} disabled={isLoading} style={{ padding: '12px 25px', background: '#8c7662', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Agregar</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0 }}>Invitados Registrados ({invitadosFiltrados.length})</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Todos', 'Confirmado', 'Pendiente', 'No asistirá'].map(est => (
                  <button key={est} onClick={() => setFiltroEstado(est)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #ccc', background: filtroEstado === est ? '#6e5b4b' : 'white', color: filtroEstado === est ? 'white' : '#555', cursor: 'pointer', fontSize: '0.8rem' }}>
                    {est}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f5f0eb', color: '#5a493c' }}>
                    <th style={{ padding: '14px' }}>Grupo / Familia</th>
                    <th style={{ padding: '14px' }}>Nombre Completo</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Confirmados / Asignados</th>
                    <th style={{ padding: '14px' }}>Estado</th>
                    <th style={{ padding: '14px' }}>Actualizado por</th>
                    <th style={{ padding: '14px', textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {invitadosFiltrados.map((inv) => (
                    <tr key={inv.id || inv.fila} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '14px', fontWeight: '600', color: '#8c7662' }}>{inv.familia}</td>
                      <td style={{ padding: '14px' }}>{inv.nombre}</td>
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: '600' }}>
                        {inv.estado === 'Confirmado' ? `${inv.pasesConfirmados ?? inv.pases} de ${inv.pases}` : `0 de ${inv.pases}`}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold', background: inv.estado === 'Confirmado' ? '#eafaf1' : inv.estado === 'No asistirá' ? '#fdedec' : '#fef9e7', color: inv.estado === 'Confirmado' ? '#1e8449' : inv.estado === 'No asistirá' ? '#922b21' : '#b7950b' }}>
                          {inv.estado}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: '#666', fontSize: '0.85rem' }}>{inv.actualizadoPor || '-'}</td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button onClick={() => eliminarInvitado(inv.fila)} style={{ padding: '6px 12px', background: '#fbeee6', color: '#c0392b', border: '1px solid #f5b7b1', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === VISTA PÚBLICA DE LA INVITACIÓN ===
  return (
    <>
      <audio ref={audioRef} src={config.musicaUrl} loop preload="auto" />

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background-color: #fbf9f6; color: #3d352e; }
        
        .reveal-up {
          opacity: 0;
          transform: translateY(45px);
          transition: opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-scale {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-scale.visible {
          opacity: 1;
          transform: scale(1);
        }

        /* Animación progresiva y capas corregidas en la Línea de Tiempo */
        .timeline-step-item {
          position: relative;
          z-index: 5;
          opacity: 0;
          transform: translateY(45px);
          transition: opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1), transform 0.95s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .timeline-step-item.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .timeline-node {
          position: relative;
          z-index: 6;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 1.5px solid #d5c4b0;
          box-shadow: 0 0 0 6px #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transform: scale(0.65);
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.6s ease, box-shadow 0.6s ease;
        }
        .timeline-step-item.visible .timeline-node {
          transform: scale(1);
          border-color: #9e8266;
          background-color: #ffffff;
          box-shadow: 0 0 0 6px #ffffff, 0 0 0 11px rgba(176, 148, 117, 0.16), 0 10px 25px rgba(90, 73, 60, 0.1);
        }
        .timeline-card {
          background-color: #fbf9f6;
          padding: 22px 26px;
          border-radius: 18px;
          border: 1px solid #efe7dc;
          flex: 1;
          transform: translateX(25px);
          transition: transform 0.95s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, background-color 0.5s ease;
        }
        .timeline-step-item.visible .timeline-card {
          transform: translateX(0);
          background-color: #ffffff;
          box-shadow: 0 14px 35px rgba(90, 73, 60, 0.06);
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        
        @keyframes shimmerSeal {
          0% { box-shadow: 0 0 0 0 rgba(176, 148, 117, 0.5), 0 10px 25px rgba(90, 73, 60, 0.25); }
          70% { box-shadow: 0 0 0 18px rgba(176, 148, 117, 0), 0 10px 25px rgba(90, 73, 60, 0.25); }
          100% { box-shadow: 0 0 0 0 rgba(176, 148, 117, 0), 0 10px 25px rgba(90, 73, 60, 0.25); }
        }

        .btn-gold {
          background: linear-gradient(135deg, #9e8266 0%, #7d6349 100%);
          color: #fff;
          padding: 15px 36px;
          min-height: 48px;
          border: none;
          border-radius: 40px;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          font-size: 0.78rem;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.35s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(140, 118, 98, 0.22);
        }
        .btn-gold:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(140, 118, 98, 0.35);
          background: linear-gradient(135deg, #ab8f73 0%, #6e563e 100%);
        }

        .btn-outline-gold {
          background: rgba(255, 255, 255, 0.75);
          color: #6e5b4b;
          padding: 12px 28px;
          min-height: 44px;
          border: 1px solid #cbb9a4;
          border-radius: 40px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.74rem;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-outline-gold:hover {
          background: #f3ece4;
          border-color: #9e8266;
        }

        .luxury-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid #ebe3d8;
          border-radius: 22px;
          padding: 45px 30px;
          box-shadow: 0 18px 45px rgba(90, 73, 60, 0.05);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .luxury-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 55px rgba(90, 73, 60, 0.09);
        }

        .photo-frame {
          overflow: hidden;
          border-radius: 180px 180px 18px 18px;
          border: 1px solid #dfd3c3;
          padding: 8px;
          background: #fff;
          box-shadow: 0 15px 35px rgba(90, 73, 60, 0.07);
          cursor: pointer;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .photo-frame:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 45px rgba(90, 73, 60, 0.14);
        }
        .photo-frame img {
          width: 100%;
          height: 330px;
          object-fit: cover;
          border-radius: 172px 172px 12px 12px;
          display: block;
          transition: transform 0.7s ease;
        }
        .photo-frame:hover img {
          transform: scale(1.05);
        }
      `}</style>

      {/* AVISO SUTIL SI AÚN ESTÁ EN MODO DEMOSTRACIÓN SIN BACKEND */}
      {!isUrlValida && sobreAbierto && (
        <div style={{ backgroundColor: '#fff8e6', color: '#7d5a00', fontSize: '0.78rem', textAlign: 'center', padding: '8px 15px', borderBottom: '1px solid #ffeeba' }}>
          Modo Demostración Activo — Pega tu URL de Google Apps Script en <code>SCRIPT_URL</code> antes de compartir por WhatsApp.
        </div>
      )}

      {/* BOTÓN FLOTANTE DE MÚSICA CON ÍCONO VECTORIAL */}
      {sobreAbierto && (
        <button
          onClick={toggleMusica}
          aria-label={reproduciendo ? "Pausar música" : "Reproducir música"}
          title={reproduciendo ? "Pausar música" : "Reproducir música"}
          style={{
            position: 'fixed', bottom: '22px', right: '22px', zIndex: 900,
            width: '50px', height: '50px', borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.94)', border: '1px solid #d5c4b0',
            boxShadow: '0 8px 25px rgba(0,0,0,0.12)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <IconoOrnamento tipo={reproduciendo ? 'musicaOn' : 'musicaOff'} size={22} color="#7d6349" />
        </button>
      )}

      {/* SOBRE DE APERTURA INTERACTIVO CON SELLO DE CERA */}
      {!sobreAbierto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'radial-gradient(circle at center, #f6f1eb 0%, #e2d7c9 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', padding: '20px',
          transition: 'opacity 0.85s ease, transform 0.85s cubic-bezier(0.65, 0, 0.35, 1)',
          opacity: animandoSobre ? 0 : 1,
          transform: animandoSobre ? 'scale(1.08) translateY(-40px)' : 'scale(1) translateY(0)',
          pointerEvents: animandoSobre ? 'none' : 'auto'
        }}>
          <div style={{
            border: '1px solid #cbb9a4', padding: '55px 35px', borderRadius: '220px 220px 24px 24px',
            backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)',
            maxWidth: '370px', width: '100%', boxShadow: '0 25px 60px rgba(90, 73, 60, 0.1)'
          }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.72rem', color: '#7d6349', marginBottom: '18px', fontWeight: 500 }}>
              Nuestra Boda
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.1rem', color: '#5a493c', margin: '0', fontWeight: 400, lineHeight: 1.08 }}>
              Angélica <br/>
              <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.2rem', color: '#b09475' }}>&</span> <br/>
              Luis Ángel
            </h1>
            
            <DivisorFloral />

            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', letterSpacing: '3px', color: '#6e5b4b', marginBottom: '35px', fontWeight: 500 }}>
              {formatearFechaCortaPuntos(config.fechaBodaISO)}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={handleAbrirInvitacion}
                style={{
                  width: '88px', height: '88px', borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #c8ad8d, #8c6f52 70%, #69513a 100%)',
                  border: '3px double #e8d8c5', color: '#fff', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600,
                  letterSpacing: '2px', animation: 'shimmerSeal 2.2s infinite'
                }}
              >
                <span>A&L</span>
              </button>
              <span style={{ marginTop: '16px', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#6e5b4b', fontWeight: 600 }}>
                Toca el sello para abrir
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CUERPO PRINCIPAL DE LA INVITACIÓN */}
      <div style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a423b', backgroundColor: '#fbf9f6', overflowX: 'hidden' }}>
        
        {/* 1. PORTADA ARQUITECTÓNICA CON ACCESO DIRECTO A RSVP */}
        <div style={{
          minHeight: '95vh', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '50px 20px',
          background: 'linear-gradient(180deg, #e7dfd6 0%, #f5efe8 65%, #fbf9f6 100%)',
          position: 'relative'
        }}>
          <div style={{
            border: '1px solid #c9b7a2', padding: '8px', borderRadius: '280px 280px 12px 12px',
            maxWidth: '480px', width: '94%', boxShadow: '0 25px 65px rgba(90, 73, 60, 0.07)'
          }}>
            <div style={{
              border: '1px solid #dfd3c3', padding: '65px 25px 50px', borderRadius: '272px 272px 8px 8px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(6px)'
            }}>
              <p style={{ letterSpacing: '5px', textTransform: 'uppercase', fontSize: '0.76rem', color: '#7d6349', marginBottom: '22px', fontWeight: 600 }}>
                ¡Nos Casamos!
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3.2rem, 8vw, 4.7rem)', color: '#5a493c', margin: '0', fontWeight: 400, lineHeight: 1.02 }}>
                Angélica
              </h1>
              <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.8rem', color: '#b09475', margin: '6px 0' }}>
                &
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3.2rem, 8vw, 4.7rem)', color: '#5a493c', margin: '0', fontWeight: 400, lineHeight: 1.02 }}>
                Luis Ángel
              </h1>

              <DivisorFloral />

              <p style={{ letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.92rem', color: '#5a493c', fontWeight: 600, margin: '0' }}>
                {config.fechaBodaTexto}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#7d6349', marginTop: '8px', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 500 }}>
                {config.ciudadEvento}
              </p>

              <div style={{ marginTop: '32px' }}>
                <button type="button" onClick={irAConfirmarAsistencia} className="btn-outline-gold">
                  Confirmar Asistencia
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '36px', animation: 'floatSlow 2.8s infinite ease-in-out', color: '#7d6349', fontSize: '0.74rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 500 }}>
            Desliza para ver los detalles ↓
          </div>
        </div>

        {/* 2. FRASE Y BENDICIÓN DE PADRES */}
        <div className="reveal-up" style={{ padding: '85px 20px', textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.65rem, 4vw, 2.15rem)', fontStyle: 'italic', color: '#5a493c', maxWidth: '620px', margin: '0 auto 30px', lineHeight: 1.45 }}>
            “{config.frase}”
          </p>
          
          <DivisorFloral />

          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#7d6349', margin: '45px 0 35px', fontWeight: 600 }}>
            {config.subtituloPadres}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
            <div className="luxury-card" style={{ padding: '35px 20px' }}>
              <p style={{ fontSize: '0.74rem', color: '#8c7258', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', fontWeight: 600 }}>Padres de la Novia</p>
              <p style={{ margin: '8px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: '#3d352e' }}>{config.padresNovia1}</p>
              <p style={{ margin: '8px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: '#3d352e' }}>{config.padresNovia2}</p>
            </div>
            <div className="luxury-card" style={{ padding: '35px 20px' }}>
              <p style={{ fontSize: '0.74rem', color: '#8c7258', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', fontWeight: 600 }}>Padres del Novio</p>
              <p style={{ margin: '8px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: '#3d352e' }}>{config.padresNovio1}</p>
              <p style={{ margin: '8px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: '#3d352e' }}>{config.padresNovio2}</p>
            </div>
          </div>
        </div>

        {/* 3. CUENTA REGRESIVA PARA EL GRAN DÍA */}
        <div className="reveal-scale" style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(180deg, #f3ece4 0%, #ebe1d5 100%)', borderTop: '1px solid #e2d5c6', borderBottom: '1px solid #e2d5c6' }}>
          <p style={{ letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.76rem', color: '#7d6349', marginBottom: '8px', fontWeight: 600 }}>Reserva la Fecha</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem', color: '#5a493c', margin: '0 0 35px', fontWeight: 400 }}>Cada segundo cuenta</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', maxWidth: '540px', margin: '0 auto 30px' }}>
            {[
              { val: countdownBoda.dias, label: 'Días' },
              { val: countdownBoda.horas, label: 'Horas' },
              { val: countdownBoda.minutos, label: 'Minutos' },
              { val: countdownBoda.segundos, label: 'Segundos' }
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.92)', width: '105px', padding: '22px 10px', borderRadius: '18px', border: '1px solid #e2d5c6', boxShadow: '0 10px 25px rgba(90,73,60,0.05)' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Cormorant Garamond', serif", color: '#5a493c', fontWeight: 600, lineHeight: 1 }}>{item.val}</div>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#7d6349', marginTop: '10px', fontWeight: 600 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.1rem', color: '#6e563e', margin: '10px 0 0' }}>Para el mejor día de nuestras vidas</p>
        </div>

        {/* 4. DÓNDE Y CUÁNDO */}
        <div className="reveal-up" style={{ padding: '90px 20px', textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.76rem', color: '#8c7258', fontWeight: 600 }}>Ubicaciones</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.1rem', color: '#5a493c', margin: '5px 0 15px', fontWeight: 400 }}>Dónde y Cuándo</h2>
          <DivisorFloral />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '30px', marginTop: '40px' }}>
            <div className="luxury-card">
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f6f1eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #e5d9c9' }}>
                <IconoOrnamento tipo="iglesia" />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.1rem', color: '#5a493c', margin: '0 0 12px', fontWeight: 600 }}>Ceremonia Religiosa</h3>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#3d352e', margin: '6px 0' }}>{config.lugarCeremonia}</p>
              <p style={{ fontSize: '0.92rem', color: '#8c7258', fontWeight: 600, letterSpacing: '1px', margin: '8px 0' }}>{config.horaCeremonia}</p>
              <p style={{ fontSize: '0.88rem', color: '#5c5248', margin: '8px 0 28px', lineHeight: 1.5 }}>{config.direccionCeremonia}</p>
              <a href={config.mapaCeremonia} target="_blank" rel="noreferrer" className="btn-gold">Ver Ubicación</a>
            </div>

            <div className="luxury-card">
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f6f1eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #e5d9c9' }}>
                <IconoOrnamento tipo="coctel" />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.1rem', color: '#5a493c', margin: '0 0 12px', fontWeight: 600 }}>Recepción</h3>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#3d352e', margin: '6px 0' }}>{config.lugarRecepcion}</p>
              <p style={{ fontSize: '0.92rem', color: '#8c7258', fontWeight: 600, letterSpacing: '1px', margin: '8px 0' }}>{config.horaRecepcion}</p>
              <p style={{ fontSize: '0.88rem', color: '#5c5248', margin: '8px 0 28px', lineHeight: 1.5 }}>{config.direccionRecepcion}</p>
              <a href={config.mapaRecepcion} target="_blank" rel="noreferrer" className="btn-gold">Ver Ubicación</a>
            </div>
          </div>
        </div>

        {/* 5. LÍNEA DE TIEMPO CON ANIMACIÓN PROGRESIVA Y CORTE LIMPIO EN ÍCONOS */}
        <div style={{ padding: '90px 20px', backgroundColor: '#ffffff', textAlign: 'center', borderTop: '1px solid #f0eae1', borderBottom: '1px solid #f0eae1' }}>
          <div className="reveal-up">
            <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.76rem', color: '#8c7258', fontWeight: 600 }}>Programa del Gran Día</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.1rem', color: '#5a493c', margin: '5px 0 15px', fontWeight: 400 }}>Línea de Tiempo</h2>
            <DivisorFloral />
          </div>
          
          <div ref={timelineRef} style={{ maxWidth: '560px', margin: '50px auto 0', position: 'relative', padding: '10px 0' }}>
            <div style={{ position: 'absolute', left: '29px', top: '35px', bottom: '35px', width: '2px', backgroundColor: '#efe7dc', zIndex: 1 }} />
            
            <div style={{
              position: 'absolute', left: '29px', top: '35px', width: '2px',
              height: `calc(${progresoTimeline}% - 35px)`,
              maxHeight: 'calc(100% - 70px)',
              background: 'linear-gradient(180deg, #b09475 0%, #8c7662 85%, #d5c4b0 100%)',
              boxShadow: '0 0 10px rgba(158, 130, 102, 0.45)',
              transition: 'height 0.15s ease-out',
              zIndex: 2
            }} />

            {itinerario.map((item, idx) => (
              <div
                key={idx}
                className="timeline-step-item"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '24px',
                  marginBottom: idx === itinerario.length - 1 ? '10px' : '42px',
                  textAlign: 'left',
                  transitionDelay: `${idx * 90}ms`
                }}
              >
                <div className="timeline-node">
                  <IconoOrnamento tipo={item.icono} />
                </div>
                <div className="timeline-card">
                  <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, color: '#7d6349', letterSpacing: '2px', textTransform: 'uppercase', backgroundColor: '#f6f1eb', padding: '4px 12px', borderRadius: '20px', marginBottom: '6px' }}>
                    {item.hora}
                  </span>
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', color: '#3d352e', margin: '4px 0', fontWeight: 600 }}>
                    {item.evento}
                  </h4>
                  {item.descripcion && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#5c5248', lineHeight: 1.5 }}>{item.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. GALERÍA FOTOGRÁFICA CONDICIONAL */}
        {mostrarGaleriaActiva && galeria.length > 0 && (
          <div className="reveal-up" style={{ padding: '90px 20px', textAlign: 'center', maxWidth: '960px', margin: '0 auto' }}>
            <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.76rem', color: '#8c7258', fontWeight: 600 }}>
              {config.subtituloGaleria || 'Momentos que nos trajeron hasta aquí'}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.1rem', color: '#5a493c', margin: '5px 0 15px', fontWeight: 400 }}>
              {config.tituloGaleria || 'Nuestra Galería'}
            </h2>
            <DivisorFloral />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px', marginTop: '45px' }}>
              {galeria.map((foto, idx) => (
                <div key={idx} className="photo-frame" onClick={() => setFotoLightbox(foto)}>
                  <img src={foto.url} alt={foto.caption || `Foto ${idx + 1}`} />
                  {foto.caption && (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontStyle: 'italic', color: '#5a493c', margin: '12px 6px 6px' }}>
                      {foto.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CÓDIGO DE VESTIMENTA Y MESA DE REGALOS (CON ICONOS VECTORIALES) */}
        <div className="reveal-up" style={{ padding: '90px 20px', backgroundColor: '#f5efe8', textAlign: 'center' }}>
          <div style={{
            maxWidth: mostrarRegalosActivo ? '840px' : '480px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: mostrarRegalosActivo ? 'repeat(auto-fit, minmax(290px, 1fr))' : '1fr',
            gap: '30px'
          }}>
            <div className="luxury-card">
              <p style={{ fontSize: '0.74rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#8c7258', margin: '0 0 8px', fontWeight: 600 }}>Dress Code</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.3rem', color: '#5a493c', margin: '0 0 15px', fontWeight: 400 }}>Código de Vestimenta</h3>
              <p style={{ letterSpacing: '2.5px', fontWeight: 600, color: '#7d6349', fontSize: '0.94rem', margin: '15px 0' }}>{config.vestimentaTitulo}</p>
              <p style={{ fontSize: '0.88rem', color: '#5c5248', lineHeight: 1.65 }}>
                {config.vestimentaNota}
              </p>
              <DivisorFloral />
              <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#5a493c', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
                Evento Exclusivo para Adultos
              </p>
              <p style={{ fontSize: '0.86rem', color: '#5c5248', margin: 0, lineHeight: 1.55 }}>
                {config.notaNinos}
              </p>
            </div>

            {mostrarRegalosActivo && (
              <div className="luxury-card">
                <p style={{ fontSize: '0.74rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#8c7258', margin: '0 0 8px', fontWeight: 600 }}>Detalles</p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.3rem', color: '#5a493c', margin: '0 0 15px', fontWeight: 400 }}>Mesa de Regalos</h3>
                <p style={{ fontSize: '0.88rem', color: '#5c5248', lineHeight: 1.6, marginBottom: '22px' }}>
                  Su presencia es nuestro mejor regalo, pero si desean tener un detalle con nosotros:
                </p>
                
                {config.mesaRegalos && (
                  <div style={{ backgroundColor: '#fbf9f6', padding: '18px', borderRadius: '14px', border: '1px solid #e8dfd3', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#5a493c' }}>
                      <IconoOrnamento tipo="regalo" size={20} />
                      <span>{config.mesaRegalos}</span>
                    </div>
                    {config.linkMesaRegalos && (
                      <a href={config.linkMesaRegalos} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.8rem', color: '#7d6349', textDecoration: 'underline', fontWeight: 600 }}>
                        Ir a la Mesa de Regalos →
                      </a>
                    )}
                  </div>
                )}

                {config.cuentaBancaria && (
                  <div style={{ backgroundColor: '#fbf9f6', padding: '18px', borderRadius: '14px', border: '1px solid #e8dfd3' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#5a493c' }}>
                      <IconoOrnamento tipo="sobre" size={20} />
                      <span>Lluvia de Sobres / Transferencia</span>
                    </div>
                    <p style={{ margin: '8px 0 12px', fontSize: '0.84rem', color: '#5c5248', lineHeight: 1.45 }}>{config.cuentaBancaria}</p>
                    <button onClick={copiarCuenta} style={{ padding: '8px 18px', minHeight: '38px', borderRadius: '20px', border: '1px solid #cbb9a4', background: '#fff', color: '#5a493c', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                      {copiadoExito ? '✓ Datos Copiados' : 'Copiar Datos Bancarios'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 8. SUGERENCIAS DE HOSPEDAJE PARA INVITADOS FORÁNEOS */}
        {mostrarHotelesActivo && hoteles.length > 0 && (
          <div className="reveal-up" style={{ padding: '90px 20px', backgroundColor: '#ffffff', textAlign: 'center', borderBottom: '1px solid #f0eae1' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.76rem', color: '#8c7258', fontWeight: 600 }}>Para nuestros invitados foráneos</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.1rem', color: '#5a493c', margin: '5px 0 12px', fontWeight: 400 }}>
                {config.tituloHoteles || 'Sugerencias de Hospedaje'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#5c5248', maxWidth: '560px', margin: '0 auto 10px', lineHeight: 1.6 }}>
                {config.subtituloHoteles}
              </p>
              <DivisorFloral />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '26px', marginTop: '40px' }}>
                {hoteles.map((hotel, idx) => (
                  <div key={idx} className="luxury-card" style={{ padding: '35px 24px', backgroundColor: '#fbf9f6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #e2d5c6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <IconoOrnamento tipo="hotel" />
                      </div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.85rem', color: '#5a493c', margin: '0 0 8px', fontWeight: 600 }}>
                        {hotel.nombre}
                      </h3>
                      {hotel.distancia && (
                        <p style={{ fontSize: '0.86rem', color: '#5c5248', margin: '0 0 14px', lineHeight: 1.5 }}>{hotel.distancia}</p>
                      )}
                      {hotel.telefono && (
                        <p style={{ fontSize: '0.86rem', color: '#4a423b', margin: '8px 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <IconoOrnamento tipo="telefono" size={16} />
                          <a href={`tel:${hotel.telefono.replace(/\s+/g, '')}`} style={{ color: '#4a423b', textDecoration: 'none' }}>{hotel.telefono}</a>
                        </p>
                      )}
                      {hotel.codigo && (
                        <div style={{ display: 'inline-block', marginTop: '8px', padding: '5px 14px', backgroundColor: '#f3ece4', border: '1px dashed #b59b80', borderRadius: '20px', fontSize: '0.78rem', color: '#6e5b4b', fontWeight: 600 }}>
                          Código de convenio: {hotel.codigo}
                        </div>
                      )}
                    </div>

                    {hotel.mapa && (
                      <div style={{ marginTop: '22px' }}>
                        <a href={hotel.mapa} target="_blank" rel="noreferrer" className="btn-gold" style={{ padding: '12px 26px', fontSize: '0.74rem' }}>
                          Ver en Mapa
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. CONFIRMACIÓN DE ASISTENCIA CON CANTIDAD DE PASES Y FECHA DINÁMICA */}
        <div ref={rsvpSectionRef} className="reveal-up" style={{ padding: '95px 20px', maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.76rem', color: '#8c7258', fontWeight: 600 }}>R.S.V.P.</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.2rem', color: '#5a493c', margin: '5px 0 12px', fontWeight: 400 }}>Confirma tu Asistencia</h2>
          <DivisorFloral />
          
          <div style={{ backgroundColor: '#f3ece4', padding: '20px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2d5c6' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#5a493c' }}>
              Favor de confirmar antes del <strong>{formatearFechaEspanol(config.fechaLimite)}</strong>:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontWeight: 600, color: '#7d6349', fontSize: '0.95rem' }}>
              <span>{countdownRsvp.dias} Días</span> •
              <span>{countdownRsvp.horas} Hrs</span> •
              <span>{countdownRsvp.minutos} Min</span> •
              <span>{countdownRsvp.segundos} Seg</span>
            </div>
          </div>

          <div className="luxury-card" style={{ padding: '40px 28px' }}>
            {step === 1 && (
              <form onSubmit={buscarInvitado}>
                <p style={{ fontSize: '0.9rem', color: '#5c5248', marginBottom: '22px', lineHeight: 1.6 }}>
                  Ingresa tu nombre y apellido para buscar tu invitación personalizada y visualizar los pases reservados para ti o tu familia.
                </p>
                <input 
                  type="text" 
                  placeholder="Escribe tu nombre y apellido" 
                  value={nombreBusqueda}
                  onChange={(e) => {
                    setNombreBusqueda(e.target.value);
                    if (sugerenciasNombres.length > 0) setSugerenciasNombres([]);
                  }}
                  style={{ width: '100%', padding: '16px', marginBottom: '20px', borderRadius: '12px', border: '1px solid #d5c4b0', backgroundColor: '#fbf9f6', fontFamily: 'inherit', textAlign: 'center', fontSize: '1rem', outline: 'none' }}
                  required
                />
                <button type="submit" disabled={isLoading} className="btn-gold" style={{ width: '100%' }}>
                  {isLoading ? 'Buscando Invitación...' : 'Buscar mi Invitación'}
                </button>
              </form>
            )}

            {step === 1 && sugerenciasNombres.length > 0 && (
              <div style={{ marginTop: '22px', padding: '18px', borderRadius: '14px', backgroundColor: '#fdfaf5', border: '1px solid #e2d5c6' }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: '#5a493c', fontWeight: 600 }}>
                  ¿Quisiste decir alguno de estos nombres? Tócalo para seleccionarlo:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sugerenciasNombres.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => seleccionarSugerencia(sug)}
                      style={{
                        padding: '13px 16px', borderRadius: '10px', border: '1px solid #cbb9a4',
                        backgroundColor: '#fff', color: '#5a493c', cursor: 'pointer',
                        fontWeight: '600', fontSize: '0.92rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>{sug}</span>
                      <span style={{ fontSize: '0.8rem', color: '#8c7258' }}>Seleccionar →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '18px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#8c7258', fontWeight: 600 }}>
                    {datosFamilia.idFamilia}
                  </span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', color: '#3d352e', margin: '6px 0' }}>
                    Hola, {datosFamilia.usuarioBuscando}
                  </h3>
                  <div style={{ display: 'inline-block', backgroundColor: '#f3ece4', color: '#5a493c', padding: '6px 18px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginTop: '6px' }}>
                    Total asignado al grupo: {totalPasesFamilia} {totalPasesFamilia === 1 ? 'Pase' : 'Pases'}
                  </div>
                </div>

                {datosFamilia.modificadoPor && (
                  <div style={{ padding: '14px', backgroundColor: '#fff8e6', color: '#7d5a00', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', border: '1px solid #ffeeba', lineHeight: 1.5 }}>
                    <strong>Nota familiar:</strong> Otro integrante de tu grupo (<strong>{datosFamilia.modificadoPor}</strong>) ya había registrado respuestas en esta invitación. Puedes revisar o actualizar tu asistencia a continuación.
                  </div>
                )}

                {datosFamilia.miembros.length > 1 && (
                  <div style={{ marginBottom: '22px' }}>
                    <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#5c5248', marginBottom: '10px', textAlign: 'center' }}>
                      Acciones rápidas de confirmación:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button type="button" onClick={() => aplicarAccionRapida('todos')} style={{ padding: '11px', minHeight: '44px', borderRadius: '10px', border: '1px solid #8c7662', background: modoSeleccion === 'todos' ? '#8c7662' : 'white', color: modoSeleccion === 'todos' ? 'white' : '#6e5b4b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        ✓ Confirmar a todos
                      </button>
                      <button type="button" onClick={() => aplicarAccionRapida('solo_yo')} style={{ padding: '11px', minHeight: '44px', borderRadius: '10px', border: '1px solid #8c7662', background: modoSeleccion === 'solo_yo' ? '#8c7662' : 'white', color: modoSeleccion === 'solo_yo' ? 'white' : '#6e5b4b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        Confirmarme sólo a mí
                      </button>
                    </div>
                    <button type="button" onClick={() => aplicarAccionRapida('ninguno')} style={{ width: '100%', marginTop: '8px', padding: '10px', minHeight: '42px', borderRadius: '10px', border: '1px solid #d98880', background: modoSeleccion === 'ninguno' ? '#c0392b' : 'white', color: modoSeleccion === 'ninguno' ? 'white' : '#c0392b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                      ✕ Retirar confirmación / Ninguno podrá asistir
                    </button>
                  </div>
                )}

                {datosFamilia.miembros.map((miembro, index) => {
                  const maxPases = Number(miembro.pases) || 1;
                  return (
                    <div key={miembro.id || miembro.fila || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0eae1', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.96rem', color: '#3d352e' }}>{miembro.nombre}</div>
                        <span style={{ fontSize: '0.78rem', color: '#8c7258', fontWeight: 600 }}>
                          Hasta {maxPases} {maxPases === 1 ? 'pase asignado' : 'pases asignados'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select 
                          value={miembro.estado} 
                          onChange={(e) => cambiarEstadoMiembro(index, e.target.value)}
                          style={{ padding: '10px 14px', minHeight: '42px', borderRadius: '10px', border: '1px solid #d5c4b0', backgroundColor: miembro.estado === 'Confirmado' ? '#eafaf1' : miembro.estado === 'No asistirá' ? '#fdedec' : '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmado">Sí asistirá</option>
                          <option value="No asistirá">No asistirá</option>
                        </select>

                        {/* Selector de cuántos pases usará cuando tiene más de 1 pase asignado */}
                        {miembro.estado === 'Confirmado' && maxPases > 1 && (
                          <select
                            value={miembro.pasesConfirmados || maxPases}
                            onChange={(e) => cambiarPasesConfirmadosMiembro(index, e.target.value)}
                            style={{ padding: '10px 12px', minHeight: '42px', borderRadius: '10px', border: '1px solid #8c7662', backgroundColor: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.84rem', color: '#5a493c' }}
                          >
                            {Array.from({ length: maxPases }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>
                                {num} de {maxPases} pases
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Mensaje de error visible dentro del mismo Paso 2 por si falla la conexión */}
                {mensaje && (
                  <div style={{ marginTop: '18px', padding: '14px', borderRadius: '12px', backgroundColor: '#fdedec', color: '#922b21', fontSize: '0.86rem', border: '1px solid #fadbd8', textAlign: 'center' }}>
                    {mensaje.texto}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                  <button type="button" onClick={() => { setStep(1); setMensaje(null); }} style={{ flex: 1, padding: '14px', minHeight: '48px', backgroundColor: '#efeae4', color: '#5a493c', border: 'none', borderRadius: '30px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    Regresar
                  </button>
                  <button type="button" onClick={guardarConfirmacion} disabled={isLoading} className="btn-gold" style={{ flex: 2 }}>
                    {isLoading ? 'Guardando...' : 'Guardar Confirmación'}
                  </button>
                </div>
              </div>
            )}

            {mensaje && step === 1 && sugerenciasNombres.length === 0 && (
              <div style={{ marginTop: '22px', padding: '15px', borderRadius: '12px', backgroundColor: mensaje.tipo === 'success' ? '#eafaf1' : '#fdedec', color: mensaje.tipo === 'success' ? '#1e8449' : '#922b21', fontSize: '0.88rem', border: `1px solid ${mensaje.tipo === 'success' ? '#d4efdf' : '#fadbd8'}` }}>
                {mensaje.texto}
              </div>
            )}
          </div>
        </div>

        {/* 10. FOOTER CON CANDADO VECTORIAL DISCRETO */}
        <div style={{ backgroundColor: '#5a493c', color: '#f6f1eb', padding: '75px 20px 35px', textAlign: 'center' }}>
          <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.74rem', opacity: 0.85, marginBottom: '10px' }}>Comparte cada momento</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.6rem', margin: '0 0 15px', fontWeight: 400, color: '#e8d8c5' }}>{config.hashtag}</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.88, maxWidth: '420px', margin: '0 auto 50px', lineHeight: 1.6 }}>
            Gracias por acompañarnos en el inicio de nuestra vida juntos.
          </p>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => { setMostrarModalLogin(true); setErrorLogin(''); }}
              aria-label="Acceso Novios"
              title="Acceso Novios"
              style={{
                background: 'transparent', border: 'none', opacity: 0.4,
                cursor: 'pointer', padding: '10px'
              }}
            >
              <IconoOrnamento tipo="candado" size={18} color="#e8d8c5" />
            </button>
          </div>
        </div>

        {/* LIGHTBOX DE GALERÍA */}
        {fotoLightbox && (
          <div
            onClick={() => setFotoLightbox(null)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(25, 20, 16, 0.88)', backdropFilter: 'blur(6px)',
              zIndex: 9800, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out'
            }}
          >
            <img
              src={fotoLightbox.url}
              alt={fotoLightbox.caption || 'Fotografía'}
              style={{ maxWidth: '92vw', maxHeight: '80vh', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.2)' }}
            />
            {fotoLightbox.caption && (
              <p style={{ color: '#f6f1eb', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontStyle: 'italic', marginTop: '16px' }}>
                {fotoLightbox.caption}
              </p>
            )}
          </div>
        )}

        {/* MODAL DISCRETO PARA ACCESO NOVIOS (VALIDADO EN EL SERVIDOR) */}
        {mostrarModalLogin && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(35, 28, 22, 0.65)', backdropFilter: 'blur(4px)',
            zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#fbf9f6', padding: '35px 28px', borderRadius: '20px',
              maxWidth: '360px', width: '100%', textAlign: 'center', border: '1px solid #dfd3c3',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', color: '#5a493c', margin: '0 0 8px' }}>
                Acceso Novios
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#5c5248', marginBottom: '20px' }}>
                Ingresa tu clave privada para administrar la invitación.
              </p>
              <form onSubmit={handleAdminLogin}>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbb9a4',
                    textAlign: 'center', fontSize: '1rem', marginBottom: '12px', backgroundColor: '#fff'
                  }}
                />
                {errorLogin && (
                  <p style={{ color: '#c0392b', fontSize: '0.82rem', margin: '0 0 12px', fontWeight: 500 }}>{errorLogin}</p>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setMostrarModalLogin(false); setPasswordInput(''); setErrorLogin(''); }}
                    style={{ flex: 1, padding: '12px', borderRadius: '25px', border: 'none', background: '#e8e1da', color: '#5a493c', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" disabled={isLoading} className="btn-gold" style={{ flex: 1, padding: '12px' }}>
                    {isLoading ? 'Verificando...' : 'Entrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}