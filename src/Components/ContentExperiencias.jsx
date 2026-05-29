import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, Anchor, MapPin, X, Plus, UploadCloud, Loader2, 
  Trash2, Bed, Palmtree, Utensils, QrCode, Users, Clock,
  CheckCircle, XCircle, Eye, Phone, MessageCircle, Printer,
  Filter, Search, ChevronLeft, ChevronRight, DollarSign,
  Zap, Award, ShieldCheck, Copy, AlertCircle, Edit3, Lock, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ModalConfirmacion from './Modales/ModalConfirmacion';
import ModalExito from './Modales/ModalExito';
import ModalError from './Modales/ModalError';
import ModalInfo from './Modales/ModalInfo';

// 🆕 Componente Tooltip personalizado
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 px-2 py-1 text-[8px] font-black text-white bg-gray-900 rounded-md whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-1">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

const ContentExperiencias = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarioOpen, setIsCalendarioOpen] = useState(false);
  const [isManifiestoOpen, setIsManifiestoOpen] = useState(false);
  const [isEscannerOpen, setIsEscannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [experiencias, setExperiencias] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [fileMultiple, setFileMultiple] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState(null);
  
  // Estados para el calendario dinámico
  const [fechasBloqueadas, setFechasBloqueadas] = useState(new Set());
  const [experienciaSeleccionadaCalendario, setExperienciaSeleccionadaCalendario] = useState(null);
  const [cargandoFechas, setCargandoFechas] = useState(false);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [fechaBloqueo, setFechaBloqueo] = useState('');
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  
  // Estados para modales
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, experienciaId: null, mensaje: '' });
  const [modalExito, setModalExito] = useState({ isOpen: false, mensaje: '', subMensaje: '' });
  const [modalError, setModalError] = useState({ isOpen: false, mensaje: '', detalle: '' });
  const [modalInfo, setModalInfo] = useState({ isOpen: false, titulo: '', mensaje: '' });
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const scanInputRef = useRef(null);

  const VENDEDOR_ID = localStorage.getItem('userId') || 1;

  const [nuevaExp, setNuevaExp] = useState({
    id: null,
    titulo: '',
    precioBase: '',
    capacidad: '',
    categoria: 'NAUTICA',
    descripcion: '',
    duracion: '4',
    incluye: '',
    horarios: '09:00,12:00,15:00'
  });

  const categoriasExp = [
    { value: 'NAUTICA', label: '⚓ Náutica (Yates y Botes)', icon: Anchor },
    { value: 'PASADIA', label: '🏖️ Pasadía (Playa o Piscina)', icon: Palmtree },
    { value: 'HOSPEDAJE', label: '🏨 Hospedaje (Casa o Hotel)', icon: Bed },
    { value: 'RESTAURANTE', label: '🍽️ Gastronomía / Cena', icon: Utensils }
  ];

  useEffect(() => {
    cargarExperiencias();
    cargarReservas();
  }, []);

  useEffect(() => {
    if (isCalendarioOpen && experiencias.length > 0) {
      cargarTodasFechasBloqueadas();
    }
  }, [isCalendarioOpen, experiencias]);

  const cargarExperiencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/productos/vendedor/${VENDEDOR_ID}`);
      
      if (response.ok) {
        const data = await response.json();
        const soloExp = Array.isArray(data) 
          ? data.filter(p => ['NAUTICA', 'YATES', 'PASADIA', 'HOSPEDAJE', 'RESTAURANTE'].includes(p.categoria)) 
          : [];
        setExperiencias(soloExp);
      } else {
        setExperiencias(experienciasEjemplo);
      }
    } catch (error) {
      console.error("Error cargando experiencias:", error);
      setError("Error de conexión: " + error.message);
      setExperiencias(experienciasEjemplo);
    } finally {
      setLoading(false);
    }
  };

  const cargarReservas = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reservas/vendedor/${VENDEDOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        setReservas(Array.isArray(data) ? data : reservasEjemplo);
      } else {
        setReservas(reservasEjemplo);
      }
    } catch (error) {
      console.error("Error cargando reservas:", error);
      setReservas(reservasEjemplo);
    }
  };

  const cargarTodasFechasBloqueadas = async () => {
    setCargandoFechas(true);
    try {
      const response = await fetch(`http://localhost:8080/api/calendario/vendedor/${VENDEDOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        const fechasSet = new Set(data.fechas?.map(f => f.fecha) || []);
        setFechasBloqueadas(fechasSet);
      }
    } catch (error) {
      console.error("Error cargando fechas bloqueadas:", error);
    } finally {
      setCargandoFechas(false);
    }
  };

  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFileMultiple(files);
      const nuevasPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(nuevasPreviews);
    }
  };

  const eliminarImagenNueva = (index) => {
    const nuevasPreviews = [...previews];
    const nuevosFiles = [...fileMultiple];
    URL.revokeObjectURL(nuevasPreviews[index]);
    nuevasPreviews.splice(index, 1);
    nuevosFiles.splice(index, 1);
    setPreviews(nuevasPreviews);
    setFileMultiple(nuevosFiles);
  };

  const eliminarImagenExistente = (index) => {
    const nuevasExistentes = [...imagenesExistentes];
    nuevasExistentes.splice(index, 1);
    setImagenesExistentes(nuevasExistentes);
  };

  const validarExperiencia = () => {
    if (!nuevaExp.titulo.trim()) {
      setModalError({
        isOpen: true,
        mensaje: 'Título requerido',
        detalle: 'Por favor ingresa el nombre de la experiencia'
      });
      return false;
    }
    
    if (!nuevaExp.precioBase || parseFloat(nuevaExp.precioBase) <= 0) {
      setModalError({
        isOpen: true,
        mensaje: 'Precio inválido',
        detalle: 'El precio debe ser mayor a 0'
      });
      return false;
    }
    
    if (!nuevaExp.capacidad || parseInt(nuevaExp.capacidad) < 1) {
      setModalError({
        isOpen: true,
        mensaje: 'Cupos inválidos',
        detalle: 'La capacidad debe ser al menos 1 persona'
      });
      return false;
    }
    
    if (!nuevaExp.categoria) {
      setModalError({
        isOpen: true,
        mensaje: 'Categoría requerida',
        detalle: 'Por favor selecciona una categoría'
      });
      return false;
    }
    
    if (!nuevaExp.descripcion.trim()) {
      setModalError({
        isOpen: true,
        mensaje: 'Descripción requerida',
        detalle: 'Por favor describe la experiencia'
      });
      return false;
    }
    
    return true;
  };

  const bloquearFechaHandler = async (fecha, experienciaId, motivo) => {
    if (!experienciaId) {
      setModalInfo({
        isOpen: true,
        titulo: "Selecciona una experiencia",
        mensaje: "Primero debes seleccionar una experiencia para bloquear fechas"
      });
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/calendario/bloquear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fecha, 
          experienciaId, 
          motivo: motivo || "Bloqueado por vendedor" 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        await cargarTodasFechasBloqueadas();
        setFechaBloqueo('');
        setMotivoBloqueo('');
        setModalExito({
          isOpen: true,
          mensaje: "Fecha bloqueada",
          subMensaje: result.mensaje || `La fecha ${fecha} ha sido bloqueada exitosamente`
        });
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: "Error al bloquear fecha",
          detalle: error.error
        });
      }
    } catch (error) {
      console.error("Error bloqueando fecha:", error);
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: error.message
      });
    }
  };

  const desbloquearFechaHandler = async (fecha, experienciaId) => {
    if (!experienciaId) return;
    
    try {
      const response = await fetch('http://localhost:8080/api/calendario/desbloquear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha, experienciaId })
      });
      
      if (response.ok) {
        const result = await response.json();
        await cargarTodasFechasBloqueadas();
        setModalExito({
          isOpen: true,
          mensaje: "Fecha desbloqueada",
          subMensaje: result.mensaje || `La fecha ${fecha} ha sido desbloqueada exitosamente`
        });
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: "Error al desbloquear fecha",
          detalle: error.error
        });
      }
    } catch (error) {
      console.error("Error desbloqueando fecha:", error);
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: error.message
      });
    }
  };

  const obtenerDiasDelMes = (anio, mes) => {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();
    const inicio = diaInicioSemana === 0 ? 6 : diaInicioSemana - 1;
    
    const dias = [];
    const fechaAnterior = new Date(anio, mes, 0);
    const diasMesAnterior = fechaAnterior.getDate();
    for (let i = inicio - 1; i >= 0; i--) {
      dias.push({
        fecha: new Date(anio, mes - 1, diasMesAnterior - i),
        esMesActual: false,
        dia: diasMesAnterior - i
      });
    }
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push({
        fecha: new Date(anio, mes, i),
        esMesActual: true,
        dia: i
      });
    }
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({
        fecha: new Date(anio, mes + 1, i),
        esMesActual: false,
        dia: i
      });
    }
    return dias;
  };

  const diasCalendario = obtenerDiasDelMes(anioActual, mesActual);
  const nombreMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const experienciasEjemplo = [
    { id: 1, titulo: "Yate Azimut Día Completo", precioPublico: 3500000, stock: 10, categoria: "NAUTICA", imagenesUrls: [], duracion: "8h", incluye: "Bebidas, Almuerzo, Tripulación", horarios: "09:00,12:00" },
    { id: 2, titulo: "Atardecer en Galeón", precioPublico: 140000, stock: 30, categoria: "NAUTICA", imagenesUrls: [], duracion: "2h", incluye: "Open Bar, Música", horarios: "17:00" },
    { id: 3, titulo: "Pasadía Islas del Rosario", precioPublico: 250000, stock: 20, categoria: "PASADIA", imagenesUrls: [], duracion: "10h", incluye: "Transporte, Almuerzo", horarios: "07:00" },
  ];

  const reservasEjemplo = [
    { id: 1, experiencia: "Yate Azimut", cliente: "María González", fecha: "2026-05-15", personas: 6, total: 3500000, estado: "CONFIRMADA", qrCode: "WIZ-YATE-001", checkIn: false },
    { id: 2, experiencia: "Atardecer Galeón", cliente: "Carlos López", fecha: "2026-05-16", personas: 2, total: 280000, estado: "PENDIENTE", qrCode: "WIZ-ATAR-002", checkIn: false },
    { id: 3, experiencia: "Pasadía Islas", cliente: "Ana Martínez", fecha: "2026-05-20", personas: 4, total: 1000000, estado: "CONFIRMADA", qrCode: "WIZ-PASA-003", checkIn: false },
  ];

  const handleVideoChange = (e) => {
    const selectedVideo = e.target.files[0];
    if (selectedVideo) {
      setVideoFile(selectedVideo);
      setModalExito({
        isOpen: true,
        mensaje: "Video listo",
        subMensaje: `Video ${selectedVideo.name} listo para subir`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarExperiencia()) return;
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titulo', nuevaExp.titulo);
      formData.append('precioBase', parseFloat(nuevaExp.precioBase));
      formData.append('stock', parseInt(nuevaExp.capacidad));
      formData.append('categoria', nuevaExp.categoria);
      formData.append('descripcion', nuevaExp.descripcion);
      formData.append('duracion', nuevaExp.duracion);
      formData.append('incluye', nuevaExp.incluye);
      formData.append('horarios', nuevaExp.horarios);
      
      if (fileMultiple.length > 0) {
        fileMultiple.forEach(file => {
          formData.append('archivos', file);
        });
      }
      
      if (imagenesExistentes.length > 0) {
        formData.append('imagenesExistentes', imagenesExistentes.join(','));
      }
      
      if (videoFile) formData.append('video', videoFile);

      const url = nuevaExp.id 
        ? `http://localhost:8080/api/productos/${nuevaExp.id}`
        : `http://localhost:8080/api/productos/vendedor/${VENDEDOR_ID}`;
      
      const response = await fetch(url, {
        method: nuevaExp.id ? 'PUT' : 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setIsModalOpen(false);
        resetForm();
        cargarExperiencias();
        setModalExito({
          isOpen: true,
          mensaje: nuevaExp.id ? "Experiencia actualizada" : "¡Experiencia publicada!",
          subMensaje: `${nuevaExp.titulo} ha sido ${nuevaExp.id ? 'actualizada' : 'publicada'} exitosamente`
        });
      } else {
        const error = await response.text();
        setModalError({
          isOpen: true,
          mensaje: "Error al guardar",
          detalle: error
        });
      }
    } catch (error) {
      console.error("Error en submit:", error);
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNuevaExp({
      id: null, titulo: '', precioBase: '', capacidad: '', categoria: 'NAUTICA',
      descripcion: '', duracion: '4', incluye: '', horarios: '09:00,12:00,15:00'
    });
    setFileMultiple([]);
    setPreviews([]);
    setImagenesExistentes([]);
    setVideoFile(null);
  };

  const abrirEdicion = (exp) => {
    setNuevaExp({
      id: exp.id, titulo: exp.titulo, precioBase: exp.precioPublico,
      capacidad: exp.stock, categoria: exp.categoria, descripcion: exp.descripcion || '',
      duracion: exp.duracion || '4', incluye: exp.incluye || '', horarios: exp.horarios || '09:00,12:00'
    });
    setImagenesExistentes(exp.imagenesUrls || []);
    setPreviews([]);
    setFileMultiple([]);
    setIsModalOpen(true);
  };

  const eliminarExperiencia = async (id) => {
    setModalConfirm({
      isOpen: true,
      experienciaId: id,
      mensaje: "¿Estás seguro de eliminar esta experiencia? Esta acción no se puede deshacer."
    });
  };

  const confirmarEliminar = async () => {
    const id = modalConfirm.experienciaId;
    try {
      await fetch(`http://localhost:8080/api/productos/${id}`, { method: 'DELETE' });
      cargarExperiencias();
      setModalExito({
        isOpen: true,
        mensaje: "Experiencia eliminada",
        subMensaje: "La experiencia ha sido eliminada exitosamente"
      });
    } catch (error) { 
      setModalError({
        isOpen: true,
        mensaje: "Error al eliminar",
        detalle: error.message
      });
    }
    setModalConfirm({ isOpen: false, experienciaId: null, mensaje: '' });
  };

  const actualizarCheckIn = async (reservaId, estado) => {
    try {
      await fetch(`http://localhost:8080/api/reservas/${reservaId}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn: estado })
      });
      cargarReservas();
      setModalExito({
        isOpen: true,
        mensaje: estado ? "Check-in realizado" : "Check-in cancelado",
        subMensaje: estado ? "El check-in ha sido registrado exitosamente" : "El check-in ha sido cancelado"
      });
    } catch (error) { 
      console.error("Error actualizando check-in");
      setModalError({
        isOpen: true,
        mensaje: "Error al actualizar",
        detalle: error.message
      });
    }
  };

  const procesarScan = (e) => {
    e.preventDefault();
    const qrCode = scanInputRef.current?.value;
    if (!qrCode) return;
    
    const reserva = reservas.find(r => r.qrCode === qrCode);
    if (reserva) {
      setScanResult(reserva);
      if (!reserva.checkIn) {
        actualizarCheckIn(reserva.id, true);
      } else {
        setModalInfo({
          isOpen: true,
          titulo: "Check-in ya realizado",
          mensaje: `${reserva.cliente} ya realizó check-in previamente`
        });
      }
    } else {
      setScanResult(null);
      setModalError({
        isOpen: true,
        mensaje: "Código QR no válido",
        detalle: "No se encontró ninguna reserva con ese código"
      });
    }
  };

  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getEstadoBadge = (estado, checkIn) => {
    if (checkIn) return { text: 'CHECK-IN REALIZADO', color: 'emerald' };
    if (estado === 'CONFIRMADA') return { text: 'CONFIRMADA', color: 'emerald' };
    if (estado === 'PENDIENTE') return { text: 'PENDIENTE', color: 'amber' };
    if (estado === 'CANCELADA') return { text: 'CANCELADA', color: 'red' };
    return { text: estado, color: 'slate' };
  };

  const reservasHoy = reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length;
  const reservasPendientes = reservas.filter(r => r.estado === 'PENDIENTE').length;
  const checkInsHoy = reservas.filter(r => r.checkIn === true).length;

  const todasLasImagenes = [...imagenesExistentes, ...previews];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-purple-600 text-sm font-black uppercase tracking-wider">
          Cargando experiencias...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Modales globales */}
      <ModalConfirmacion
        isOpen={modalConfirm.isOpen}
        onClose={() => setModalConfirm({ isOpen: false, experienciaId: null, mensaje: '' })}
        onConfirm={confirmarEliminar}
        titulo="Eliminar experiencia"
        mensaje={modalConfirm.mensaje}
        confirmText="Eliminar"
        variant="danger"
      />
      
      <ModalExito
        isOpen={modalExito.isOpen}
        onClose={() => setModalExito({ isOpen: false, mensaje: '', subMensaje: '' })}
        mensaje={modalExito.mensaje}
        subMensaje={modalExito.subMensaje}
      />
      
      <ModalError
        isOpen={modalError.isOpen}
        onClose={() => setModalError({ isOpen: false, mensaje: '', detalle: '' })}
        mensaje={modalError.mensaje}
        detalle={modalError.detalle}
      />
      
      <ModalInfo
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, titulo: '', mensaje: '' })}
        titulo={modalInfo.titulo}
        mensaje={modalInfo.mensaje}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-center">
          <p className="text-[10px] font-black uppercase">{error}</p>
          <button onClick={cargarExperiencias} className="mt-2 text-purple-600 underline">Reintentar</button>
        </div>
      )}

      {/* Tarjetas superiores - responsivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-[28px] p-4 md:p-6 text-white">
          <Calendar size={24} className="md:w-7 md:h-7 mb-3 opacity-80" />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-70">Reservas Hoy</p>
          <p className="text-2xl md:text-3xl font-black mt-1">{reservasHoy}</p>
        </div>
        <div className="bg-white rounded-[28px] p-4 md:p-6 border border-slate-100 shadow-sm">
          <Users size={20} className="md:w-6 md:h-6 text-amber-500 mb-3" />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Pendientes</p>
          <p className="text-xl md:text-2xl font-black text-slate-800 mt-1">{reservasPendientes}</p>
        </div>
        <div className="bg-white rounded-[28px] p-4 md:p-6 border border-slate-100 shadow-sm">
          <CheckCircle size={20} className="md:w-6 md:h-6 text-emerald-500 mb-3" />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Check-ins Hoy</p>
          <p className="text-xl md:text-2xl font-black text-slate-800 mt-1">{checkInsHoy}</p>
        </div>
        <div className="bg-white rounded-[28px] p-4 md:p-6 border border-slate-100 shadow-sm">
          <Anchor size={20} className="md:w-6 md:h-6 text-purple-500 mb-3" />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Experiencias Activas</p>
          <p className="text-xl md:text-2xl font-black text-slate-800 mt-1">{experiencias.length}</p>
        </div>
      </div>

      {/* Botones de acción - responsivos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        <Tooltip text="Crear nueva experiencia">
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white p-3 md:p-4 rounded-2xl text-[8px] md:text-[9px] font-black uppercase hover:bg-purple-700 transition-all flex items-center justify-center gap-2 active:scale-95">
            <Plus size={14} /> <span className="hidden sm:inline">Nueva</span> Experiencia
          </button>
        </Tooltip>
        <Tooltip text="Gestionar disponibilidad en calendario">
          <button onClick={() => setIsCalendarioOpen(true)} className="bg-slate-800 text-white p-3 md:p-4 rounded-2xl text-[8px] md:text-[9px] font-black uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95">
            <Calendar size={14} /> <span className="hidden sm:inline">Calendario</span>
          </button>
        </Tooltip>
        <Tooltip text="Escanear código QR de clientes">
          <button onClick={() => setIsEscannerOpen(true)} className="bg-emerald-600 text-white p-3 md:p-4 rounded-2xl text-[8px] md:text-[9px] font-black uppercase hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95">
            <QrCode size={14} /> <span className="hidden sm:inline">Escáner</span>
          </button>
        </Tooltip>
        <Tooltip text="Ver galería de experiencias">
          <button onClick={() => setMostrarGaleria(!mostrarGaleria)} className="bg-amber-600 text-white p-3 md:p-4 rounded-2xl text-[8px] md:text-[9px] font-black uppercase hover:bg-amber-700 transition-all flex items-center justify-center gap-2 active:scale-95">
            <Eye size={14} /> <span className="hidden sm:inline">{mostrarGaleria ? 'Ocultar' : 'Ver'}</span>
          </button>
        </Tooltip>
      </div>

      {mostrarGaleria && (
        <div className="bg-white rounded-[32px] p-4 md:p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-tighter flex items-center gap-2">
              <Eye size={14} /> Galería de Experiencias (Reels)
            </h3>
            <Tooltip text="Subir video promocional">
              <button 
                onClick={() => videoInputRef.current?.click()}
                className="bg-slate-100 text-slate-700 px-3 md:px-4 py-2 rounded-xl text-[8px] font-black uppercase hover:bg-purple-100 transition-all flex items-center gap-1 active:scale-95"
              >
                <UploadCloud size={12} /> <span className="hidden sm:inline">Subir Video</span>
              </button>
            </Tooltip>
          </div>
          <input type="file" ref={videoInputRef} accept="video/*" hidden onChange={handleVideoChange} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {experiencias.map((exp, idx) => (
              <div key={exp.id} className="relative bg-slate-100 rounded-2xl overflow-hidden aspect-[9/16] group cursor-pointer">
                <img src={exp.imagenesUrls?.[0] || 'https://via.placeholder.com/300x500'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={24} className="md:w-7 md:h-7 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:p-3">
                  <p className="text-white text-[7px] md:text-[8px] font-black uppercase truncate">{exp.titulo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de experiencias */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-tighter">Mis Experiencias</h3>
          <span className="text-[8px] text-slate-400">{experiencias.length} publicadas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {experiencias.length === 0 ? (
            <div className="col-span-full text-center py-12 md:py-16 border-2 border-dashed border-slate-200 rounded-3xl">
              <Anchor size={40} className="md:w-12 md:h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                No tienes experiencias publicadas aún
              </p>
              <Tooltip text="Crear tu primera experiencia">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-purple-600 text-white px-5 md:px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition active:scale-95"
                >
                  Crear mi primera experiencia
                </button>
              </Tooltip>
            </div>
          ) : (
            experiencias.map((exp) => {
              const Icon = categoriasExp.find(c => c.value === exp.categoria)?.icon || Anchor;
              return (
                <div key={exp.id} className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all">
                  <div className="h-40 md:h-44 bg-slate-100 relative">
                    <img src={exp.imagenesUrls?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 md:px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                      <Icon size={10} className="text-purple-600" />
                      <span className="text-[7px] md:text-[8px] font-black text-purple-600 uppercase">{exp.categoria}</span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Tooltip text="Editar experiencia">
                        <button onClick={() => abrirEdicion(exp)} className="bg-white/90 p-1.5 rounded-full hover:bg-purple-600 hover:text-white transition-colors active:scale-90">
                          <Edit3 size={12} />
                        </button>
                      </Tooltip>
                      <Tooltip text="Eliminar experiencia">
                        <button onClick={() => eliminarExperiencia(exp.id)} className="bg-white/90 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-colors active:scale-90">
                          <Trash2 size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-black text-slate-800 uppercase text-xs md:text-sm mb-2 truncate">{exp.titulo}</h3>
                    <div className="flex items-center gap-3 text-[8px] md:text-[9px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Clock size={10} /> {exp.duracion || '4h'}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {exp.stock} cupos</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                      <div>
                        <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-wider">Desde</p>
                        <p className="text-base md:text-lg font-black text-slate-900">{formatCOP(exp.precioPublico || 0)}</p>
                      </div>
                      <Tooltip text="Ver manifiesto de pasajeros">
                        <button 
                          onClick={() => setIsManifiestoOpen(true)}
                          className="bg-slate-100 text-slate-700 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[7px] md:text-[8px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Users size={10} /> <span className="hidden sm:inline">Manifiesto</span>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tabla de manifiesto - con scroll horizontal */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-tighter flex items-center gap-2">
            <Users size={14} className="text-purple-600" /> Control de Manifiesto
          </h3>
          <Tooltip text="Ver todas las reservas">
            <button onClick={() => setIsManifiestoOpen(true)} className="text-[8px] md:text-[9px] font-black text-purple-600 uppercase hover:underline active:scale-95">
              Ver todas las reservas
            </button>
          </Tooltip>
        </div>
        
        {/* Contenedor con scroll horizontal */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="bg-slate-50/50 text-[7px] md:text-[8px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">Cliente</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Experiencia</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Fecha</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Personas</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Estado</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reservas.slice(0, 5).map((res) => {
                const badge = getEstadoBadge(res.estado, res.checkIn);
                return (
                  <tr key={res.id} className="hover:bg-slate-50/50">
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div>
                        <p className="font-black text-slate-800 text-[9px] md:text-[10px]">{res.cliente}</p>
                        <p className="text-[7px] md:text-[8px] text-slate-400">{res.qrCode}</p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-bold text-slate-600">{res.experiencia}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-[8px] md:text-[9px] font-bold text-slate-500">{formatFecha(res.fecha)}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-slate-700">{res.personas} pers</td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className={`px-1.5 md:px-2 py-1 rounded-lg text-[6px] md:text-[7px] font-black uppercase bg-${badge.color}-100 text-${badge.color}-700`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      {res.checkIn ? (
                        <CheckCircle size={14} className="md:w-4 md:h-4 text-emerald-500" />
                      ) : (
                        <Tooltip text="Marcar check-in del cliente">
                          <button 
                            onClick={() => actualizarCheckIn(res.id, true)}
                            className="text-[7px] md:text-[8px] font-black bg-slate-100 px-2 md:px-3 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                          >
                            Marcar
                          </button>
                        </Tooltip>
                      )}
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR/EDITAR EXPERIENCIA - ya es responsivo */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] flex items-center gap-2">
                <ImageIcon size={14} className="text-purple-600" />
                {nuevaExp.id ? 'Editar Experiencia' : 'Nueva Experiencia'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Categoría *</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none"
                    value={nuevaExp.categoria}
                    onChange={(e) => setNuevaExp({...nuevaExp, categoria: e.target.value})}
                  >
                    {categoriasExp.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Galería de Imágenes</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="h-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-purple-300 transition"
                  >
                    <UploadCloud size={14} className="text-slate-400" />
                    <span className="text-[8px] ml-2 text-slate-500">Subir múltiples fotos</span>
                  </div>
                  <input type="file" ref={fileInputRef} multiple accept="image/*" hidden onChange={handleMultipleFilesChange} />
                </div>
              </div>

              {todasLasImagenes.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <label className="text-[8px] font-black uppercase text-slate-400 mb-2 block">Galería ({todasLasImagenes.length} imágenes)</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {imagenesExistentes.map((img, idx) => (
                      <div key={`exist-${idx}`} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm group">
                        <img src={img} alt={`Existente ${idx + 1}`} className="w-full h-full object-cover" />
                        <Tooltip text="Eliminar imagen">
                          <button
                            type="button"
                            onClick={() => eliminarImagenExistente(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition active:scale-90"
                          >
                            <X size={12} />
                          </button>
                        </Tooltip>
                      </div>
                    ))}
                    {previews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-purple-300 shadow-sm group">
                        <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <Tooltip text="Eliminar imagen nueva">
                          <button
                            type="button"
                            onClick={() => eliminarImagenNueva(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition active:scale-90"
                          >
                            <X size={12} />
                          </button>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                  <p className="text-[7px] text-slate-400 mt-2">💡 Las imágenes existentes se mantendrán. Puedes agregar nuevas o eliminar existentes.</p>
                </div>
              )}

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400">Título *</label>
                <input required type="text" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold" value={nuevaExp.titulo} onChange={(e) => setNuevaExp({...nuevaExp, titulo: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Precio *</label>
                  <input required type="number" min="1" step="1" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black" value={nuevaExp.precioBase} onChange={(e) => setNuevaExp({...nuevaExp, precioBase: e.target.value})} />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Cupos *</label>
                  <input required type="number" min="1" step="1" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black" value={nuevaExp.capacidad} onChange={(e) => setNuevaExp({...nuevaExp, capacidad: e.target.value})} />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Duración (h)</label>
                  <input type="number" min="1" step="1" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black" value={nuevaExp.duracion} onChange={(e) => setNuevaExp({...nuevaExp, duracion: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400">Incluye</label>
                <textarea rows="2" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold" placeholder="Bebidas, Almuerzo, Transporte..." value={nuevaExp.incluye} onChange={(e) => setNuevaExp({...nuevaExp, incluye: e.target.value})} />
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400">Horarios disponibles</label>
                <input type="text" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold" placeholder="09:00,12:00,15:00" value={nuevaExp.horarios} onChange={(e) => setNuevaExp({...nuevaExp, horarios: e.target.value})} />
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400">Descripción completa *</label>
                <textarea rows="3" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold" placeholder="Describe la experiencia..." value={nuevaExp.descripcion} onChange={(e) => setNuevaExp({...nuevaExp, descripcion: e.target.value})} required />
              </div>
              
              <Tooltip text={nuevaExp.id ? "Guardar cambios" : "Publicar experiencia"}>
                <button disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] hover:bg-purple-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" size={14} /> : (nuevaExp.id ? 'Actualizar' : 'Publicar Experiencia')}
                </button>
              </Tooltip>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ESCÁNER QR */}
      {isEscannerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEscannerOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-6 md:p-8 text-center">
            <QrCode size={40} className="md:w-12 md:h-12 mx-auto text-purple-600 mb-4" />
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-tighter">Escáner Wizzy</h3>
            <p className="text-[9px] text-slate-500 mt-2 mb-6">Ingresa o escanea el código QR del cliente</p>
            <form onSubmit={procesarScan}>
              <input 
                ref={scanInputRef}
                type="text" 
                placeholder="Código QR (ej: WIZ-YATE-001)"
                className="w-full bg-slate-50 rounded-2xl p-4 text-center text-[10px] font-mono font-black outline-none focus:ring-2 focus:ring-purple-200"
              />
              <Tooltip text="Validar código QR">
                <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-2xl font-black text-[9px] uppercase mt-4 hover:bg-purple-700 transition-all active:scale-95">
                  Validar Check-in
                </button>
              </Tooltip>
            </form>
            {scanResult && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-2xl">
                <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                <p className="font-black text-slate-800 text-[10px]">{scanResult.cliente}</p>
                <p className="text-[8px] text-slate-500">{scanResult.experiencia} - {formatFecha(scanResult.fecha)}</p>
                <p className="text-[8px] font-black text-emerald-600 mt-2 uppercase">Check-in realizado ✓</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* MODAL CALENDARIO MAESTRO - responsivo (stack en móvil) */}
      {isCalendarioOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCalendarioOpen(false)} />
          <div className="relative bg-white w-full max-w-5xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="sticky top-0 bg-white z-10 p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar size={16} className="md:w-5 md:h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm md:text-base uppercase tracking-tighter">Calendario Maestro</h3>
                  <p className="text-[7px] md:text-[8px] text-slate-400">Gestiona la disponibilidad de tus experiencias</p>
                </div>
              </div>
              <button onClick={() => setIsCalendarioOpen(false)} className="w-7 h-7 md:w-8 md:h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                <X size={14} className="md:w-4 md:h-4 text-slate-500 hover:text-red-500" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              {/* Panel izquierdo - formulario */}
              <div className="md:w-80 bg-slate-50 p-4 md:p-5 border-b md:border-b-0 md:border-r border-slate-100">
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-tighter mb-4 flex items-center gap-2">
                  <Lock size={14} className="text-purple-600" /> Bloquear fecha
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Experiencia *
                    </label>
                    <select
                      value={experienciaSeleccionadaCalendario || ''}
                      onChange={(e) => setExperienciaSeleccionadaCalendario(parseInt(e.target.value))}
                      className="w-full bg-white rounded-xl p-2.5 text-[9px] md:text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200 border border-slate-200"
                    >
                      <option value="">Selecciona una experiencia</option>
                      {experiencias.map(exp => (
                        <option key={exp.id} value={exp.id}>{exp.titulo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Fecha a bloquear *
                    </label>
                    <input
                      type="date"
                      value={fechaBloqueo}
                      onChange={(e) => setFechaBloqueo(e.target.value)}
                      className="w-full bg-white rounded-xl p-2.5 text-[9px] md:text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200 border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Motivo (opcional)
                    </label>
                    <textarea
                      rows="2"
                      value={motivoBloqueo}
                      onChange={(e) => setMotivoBloqueo(e.target.value)}
                      className="w-full bg-white rounded-xl p-2.5 text-[9px] md:text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200 border border-slate-200"
                      placeholder="Ej: Mantenimiento..."
                    />
                  </div>

                  <Tooltip text="Bloquear esta fecha en el calendario">
                    <button
                      onClick={() => {
                        if (!experienciaSeleccionadaCalendario) {
                          setModalInfo({
                            isOpen: true,
                            titulo: "Selecciona una experiencia",
                            mensaje: "Primero debes seleccionar una experiencia"
                          });
                          return;
                        }
                        if (!fechaBloqueo) {
                          setModalInfo({
                            isOpen: true,
                            titulo: "Selecciona una fecha",
                            mensaje: "Debes seleccionar una fecha para bloquear"
                          });
                          return;
                        }
                        bloquearFechaHandler(fechaBloqueo, experienciaSeleccionadaCalendario, motivoBloqueo || "Bloqueado por vendedor");
                        setFechaBloqueo('');
                        setMotivoBloqueo('');
                      }}
                      className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Lock size={12} /> Bloquear esta fecha
                    </button>
                  </Tooltip>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-3 text-[7px] md:text-[8px] text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-200 rounded" /><span>Disponible</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded" /><span>Bloqueado</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-100 ring-1 ring-purple-400 rounded" /><span>Hoy</span></div>
                  </div>
                </div>
              </div>

              {/* Panel derecho - calendario */}
              <div className="flex-1 p-4 md:p-5 overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <button onClick={() => { if (mesActual === 0) { setMesActual(11); setAnioActual(anioActual - 1); } else { setMesActual(mesActual - 1); } }} className="w-7 h-7 md:w-8 md:h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors active:scale-90">
                    <ChevronLeft size={14} className="md:w-4 md:h-4 text-slate-600" />
                  </button>
                  <h4 className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-tighter">{nombreMeses[mesActual]} {anioActual}</h4>
                  <button onClick={() => { if (mesActual === 11) { setMesActual(0); setAnioActual(anioActual + 1); } else { setMesActual(mesActual + 1); } }} className="w-7 h-7 md:w-8 md:h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors active:scale-90">
                    <ChevronRight size={14} className="md:w-4 md:h-4 text-slate-600" />
                  </button>
                </div>

                {cargandoFechas ? (
                  <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-purple-600" /></div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center text-[7px] md:text-[9px] font-black text-slate-400 uppercase py-2">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                      {diasCalendario.map((dia, idx) => {
                        const fechaStr = `${dia.fecha.getFullYear()}-${String(dia.fecha.getMonth() + 1).padStart(2, '0')}-${String(dia.dia).padStart(2, '0')}`;
                        const estaBloqueada = fechasBloqueadas.has(fechaStr);
                        const esHoy = dia.fecha.toDateString() === new Date().toDateString();
                        return (
                          <div key={idx} onClick={() => {
                            if (!dia.esMesActual) return;
                            if (!experienciaSeleccionadaCalendario) {
                              setModalInfo({
                                isOpen: true,
                                titulo: "Selecciona una experiencia",
                                mensaje: "Primero selecciona una experiencia en el panel izquierdo"
                              });
                              return;
                            }
                            if (estaBloqueada) {
                              if (window.confirm(`¿Desbloquear el ${dia.dia} de ${nombreMeses[mesActual]}?`)) {
                                desbloquearFechaHandler(fechaStr, experienciaSeleccionadaCalendario);
                              }
                            } else {
                              if (window.confirm(`¿Bloquear el ${dia.dia} de ${nombreMeses[mesActual]}?`)) {
                                const motivo = prompt("Motivo del bloqueo (opcional):", "Bloqueado por vendedor");
                                bloquearFechaHandler(fechaStr, experienciaSeleccionadaCalendario, motivo || "Bloqueado por vendedor");
                              }
                            }
                          }} className={`aspect-square rounded-lg md:rounded-xl flex flex-col items-center justify-center p-0.5 md:p-1 transition-all cursor-pointer ${!dia.esMesActual ? 'bg-slate-50 opacity-40 cursor-not-allowed' : 'hover:bg-purple-50'} ${estaBloqueada ? 'bg-red-50 border border-red-300' : 'bg-white border border-slate-100'} ${esHoy && dia.esMesActual ? 'ring-1 md:ring-2 ring-purple-400' : ''}`}>
                            <span className={`text-[11px] md:text-sm font-black ${estaBloqueada ? 'text-red-500' : 'text-slate-700'}`}>{dia.dia}</span>
                            {estaBloqueada && <span className="text-[5px] md:text-[7px] font-black text-red-400 mt-0.5">BLOQ</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                <p className="text-[7px] md:text-[8px] text-slate-400 text-center mt-5">💡 Haz clic en una fecha para bloquearla o desbloquearla</p>
                {!experienciaSeleccionadaCalendario && <p className="text-[7px] md:text-[8px] text-amber-600 text-center mt-2">⚠️ Selecciona una experiencia en el panel izquierdo para comenzar</p>}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL MANIFIESTO COMPLETO - responsivo */}
      {isManifiestoOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsManifiestoOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[80vh] rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-50 sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-tighter flex items-center gap-2">
                <Users size={14} /> Control de Manifiesto - Pasajeros
              </h3>
              <button onClick={() => setIsManifiestoOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-4 md:p-6 max-h-[calc(80vh-80px)]">
              <div className="space-y-4">
                {reservas.map((res) => {
                  const badge = getEstadoBadge(res.estado, res.checkIn);
                  return (
                    <div key={res.id} className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-100">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-slate-800 text-sm">{res.cliente}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[6px] md:text-[7px] font-black uppercase bg-${badge.color}-100 text-${badge.color}-700`}>{badge.text}</span>
                          </div>
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-600">{res.experiencia}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-[8px] md:text-[9px] text-slate-500">
                            <span>{formatFecha(res.fecha)}</span>
                            <span>{res.personas} personas</span>
                            <span>{res.qrCode}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!res.checkIn && res.estado === 'CONFIRMADA' && (
                            <Tooltip text="Marcar check-in del pasajero">
                              <button onClick={() => actualizarCheckIn(res.id, true)} className="bg-emerald-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[7px] md:text-[8px] font-black uppercase hover:bg-emerald-700 transition-all flex items-center gap-1 active:scale-95">
                                <CheckCircle size={10} /> <span className="hidden sm:inline">Check-in</span>
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip text="Contactar por WhatsApp">
                            <button onClick={() => window.open(`https://wa.me/573000000000?text=Hola%20${encodeURIComponent(res.cliente)}`, '_blank')} className="bg-slate-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[7px] md:text-[8px] font-black uppercase hover:bg-purple-600 transition-all flex items-center gap-1 active:scale-95">
                              <MessageCircle size={10} /> <span className="hidden sm:inline">Chat</span>
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const Play = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="white" stroke="none" className={className}>
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
  </svg>
);

export default ContentExperiencias;