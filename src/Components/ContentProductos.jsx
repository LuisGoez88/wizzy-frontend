import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip } from 'recharts';
import { 
  Package, TrendingUp, Wallet, X, Plus, 
  UploadCloud, Loader2, Trash2, Edit3, Banknote, AlertCircle,
  BarChart3, Download, MessageCircle, ShieldCheck, Calculator,
  Copy, CheckCircle2, Filter, Search, ChevronDown, Printer,
  Send, DollarSign, Zap, Award, Users, Eye, Clock, Star, Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ModalConfirmacion from './Modales/ModalConfirmacion';
import ModalExito from './Modales/ModalExito';
import ModalError from './Modales/ModalError';
import ModalInfo from './Modales/ModalInfo';
import ImageUploader from '../components/ImageUploader';
import ConfirmDialog from './ConfirmDialog';

// Componente Tooltip personalizado
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

const ContentProductos = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRetiroModalOpen, setIsRetiroModalOpen] = useState(false);
  const [isOrdenesModalOpen, setIsOrdenesModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isVerificacionModalOpen, setIsVerificacionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [fileMultiple, setFileMultiple] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificacionStatus, setVerificacionStatus] = useState({
    rut: false,
    camaraComercio: false,
    cuentaBancaria: false
  });
  const [showCalculador, setShowCalculador] = useState(false);
  const [cashbackSugerido, setCashbackSugerido] = useState(10);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  // Estado para detectar cambios sin guardar en el formulario de producto
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalProductoData, setOriginalProductoData] = useState(null);

  // Estados para modales
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, productoId: null, mensaje: '' });
  const [modalExito, setModalExito] = useState({ isOpen: false, mensaje: '', subMensaje: '' });
  const [modalError, setModalError] = useState({ isOpen: false, mensaje: '', detalle: '' });
  const [modalInfo, setModalInfo] = useState({ isOpen: false, titulo: '', mensaje: '' });

  // 🆕 Estado para el diálogo de confirmación de cambios sin guardar
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState(null);

  // Datos simulados para gráficas
  const dataTendencia = [
    { name: 'Lun', ventas: 30 }, { name: 'Mar', ventas: 45 }, { name: 'Mié', ventas: 35 },
    { name: 'Jue', ventas: 60 }, { name: 'Vie', ventas: 40 }, { name: 'Sáb', ventas: 70 }, { name: 'Dom', ventas: 90 }
  ];

  const dataMensual = [
    { name: 'Ene', ventas: 120 }, { name: 'Feb', ventas: 150 }, { name: 'Mar', ventas: 180 },
    { name: 'Abr', ventas: 220 }, { name: 'May', ventas: 200 }, { name: 'Jun', ventas: 250 }
  ];

  const VENDEDOR_ID = localStorage.getItem('userId') || 19;

  const [nuevoProducto, setNuevoProducto] = useState({
    id: null, titulo: '', precio: '', stock: '', categoria: 'MODA', cashback: 10, descripcion: ''
  });

  const COMISIONES = {
    'MODA': 0.10, 'TECNOLOGIA': 0.15, 'HOGAR': 0.12, 'SERVICIOS': 0.08
  };

  // Función para verificar cambios en el formulario
  const checkUnsavedChanges = () => {
    if (!originalProductoData) return false;
    
    return (
      nuevoProducto.titulo !== originalProductoData.titulo ||
      nuevoProducto.precio !== originalProductoData.precio ||
      nuevoProducto.stock !== originalProductoData.stock ||
      nuevoProducto.categoria !== originalProductoData.categoria ||
      nuevoProducto.cashback !== originalProductoData.cashback ||
      nuevoProducto.descripcion !== originalProductoData.descripcion ||
      fileMultiple.length > 0 ||
      JSON.stringify(imagenesExistentes) !== JSON.stringify(originalProductoData.imagenesExistentes) ||
      previews.length > 0
    );
  };

  // Efecto para detectar cambios
  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges());
  }, [nuevoProducto, fileMultiple, imagenesExistentes, previews]);

  // Efecto para manejar el evento beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isModalOpen && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModalOpen, hasUnsavedChanges]);

  useEffect(() => {
    cargarProductos();
    cargarSaldo();
    cargarOrdenes();
    cargarVerificacionStatus();
  }, []);

  const cargarSaldo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/vendedores/${VENDEDOR_ID}/balance`);
      if (response.ok) {
        const data = await response.json();
        setSaldo(data.totalPendiente || 0);
      } else { setSaldo(1240500); }
    } catch (error) { setSaldo(1240500); }
  };

  const cargarProductos = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/productos/vendedor/${VENDEDOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        const soloFisicos = Array.isArray(data) 
          ? data.filter(p => !['YATES', 'NAUTICA', 'EXPERIENCIAS', 'PASADIA', 'HOSPEDAJE'].includes(p.categoria)) 
          : [];
        setProductos(soloFisicos);
      }
    } catch (error) { console.error("Error cargando productos:", error); }
  };

  const cargarOrdenes = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/vendedor/${VENDEDOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        setOrdenes(Array.isArray(data) ? data : ordenesEjemplo);
      } else {
        setOrdenes(ordenesEjemplo);
      }
    } catch (error) {
      setOrdenes(ordenesEjemplo);
    }
  };

  const ordenesEjemplo = [
    { id: 1, cliente: "María González", producto: "Tenis Wizzy Max", cantidad: 1, total: 210000, estado: "PAGADO", fecha: "Hoy", direccion: "Calle 123, Cartagena" },
    { id: 2, cliente: "Carlos López", producto: "Camiseta Wizzy", cantidad: 2, total: 105000, estado: "ENVIADO", fecha: "Ayer", direccion: "Carrera 45, Bogotá" },
    { id: 3, cliente: "Ana Martínez", producto: "Gafas Ray-Ban", cantidad: 1, total: 450000, estado: "ENTREGADO", fecha: "18 Abr", direccion: "Av. Principal, Medellín" },
    { id: 4, cliente: "Pedro Sánchez", producto: "Memoria RAM", cantidad: 1, total: 240000, estado: "PENDIENTE", fecha: "17 Abr", direccion: "Calle 78, Cali" },
  ];

  const cargarVerificacionStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/vendedores/${VENDEDOR_ID}/verificacion`);
      if (response.ok) {
        const data = await response.json();
        setVerificacionStatus(data);
      }
    } catch (error) {
      setVerificacionStatus({ rut: true, camaraComercio: false, cuentaBancaria: true });
    }
  };

  // Función para manejar cambio de imágenes desde ImageUploader
  const handleImagenesChange = (urls) => {
    const urlsExistentes = urls.filter(url => imagenesExistentes.includes(url));
    const nuevasUrls = urls.filter(url => !imagenesExistentes.includes(url));
    
    setImagenesExistentes(urlsExistentes);
    
    if (nuevasUrls.length > 0) {
      setPreviews(prev => [...prev, ...nuevasUrls]);
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

  const validarProducto = () => {
    if (!nuevoProducto.titulo.trim()) {
      setModalError({
        isOpen: true,
        mensaje: 'Título requerido',
        detalle: 'Por favor ingresa el nombre del producto'
      });
      return false;
    }
    
    if (!nuevoProducto.precio || parseFloat(nuevoProducto.precio) <= 0) {
      setModalError({
        isOpen: true,
        mensaje: 'Precio inválido',
        detalle: 'El precio debe ser mayor a 0'
      });
      return false;
    }
    
    if (!nuevoProducto.stock || parseInt(nuevoProducto.stock) < 0) {
      setModalError({
        isOpen: true,
        mensaje: 'Stock inválido',
        detalle: 'El stock no puede ser negativo'
      });
      return false;
    }
    
    if (!nuevoProducto.categoria) {
      setModalError({
        isOpen: true,
        mensaje: 'Categoría requerida',
        detalle: 'Por favor selecciona una categoría'
      });
      return false;
    }
    
    return true;
  };

  // Abrir modal de edición guardando el estado original
  const abrirEdicion = (prod) => {
    const prodData = {
      id: prod.id, titulo: prod.titulo, precio: prod.precioBase, 
      stock: prod.stock, categoria: prod.categoria, cashback: prod.cashback || 10,
      descripcion: prod.descripcion || '',
      imagenesExistentes: prod.imagenesUrls || []
    };
    
    setOriginalProductoData(prodData);
    setNuevoProducto({
      id: prod.id, titulo: prod.titulo, precio: prod.precioBase, 
      stock: prod.stock, categoria: prod.categoria, cashback: prod.cashback || 10,
      descripcion: prod.descripcion || ''
    });
    setImagenesExistentes(prod.imagenesUrls || []);
    setPreviews([]);
    setFileMultiple([]);
    setIsModalOpen(true);
  };

  // Abrir modal de creación
  const abrirCreacion = () => {
    const emptyData = {
      id: null, titulo: '', precio: '', stock: '', categoria: 'MODA', cashback: 10, descripcion: '',
      imagenesExistentes: []
    };
    setOriginalProductoData(emptyData);
    resetForm();
    setIsModalOpen(true);
  };

  // Cerrar modal con verificación de cambios
  const cerrarModal = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
      setPendingCloseAction(() => () => {
        setIsModalOpen(false);
        setHasUnsavedChanges(false);
        setOriginalProductoData(null);
        resetForm();
        setShowConfirmDialog(false);
      });
    } else {
      setIsModalOpen(false);
      setOriginalProductoData(null);
      resetForm();
    }
  };

  const handleConfirmClose = () => {
    if (pendingCloseAction) {
      pendingCloseAction();
    }
    setShowConfirmDialog(false);
    setPendingCloseAction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarProducto()) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titulo', nuevoProducto.titulo);
      formData.append('precioBase', parseFloat(nuevoProducto.precio));
      formData.append('stock', parseInt(nuevoProducto.stock));
      formData.append('categoria', nuevoProducto.categoria);
      
      if (nuevoProducto.descripcion) {
        formData.append('descripcion', nuevoProducto.descripcion);
      }
      
      if (fileMultiple.length > 0) {
        fileMultiple.forEach(file => {
          formData.append('archivos', file);
        });
      }
      
      if (imagenesExistentes.length > 0) {
        formData.append('imagenesExistentes', imagenesExistentes.join(','));
      }

      const url = nuevoProducto.id 
        ? `http://localhost:8080/api/productos/${nuevoProducto.id}`
        : `http://localhost:8080/api/productos/vendedor/${VENDEDOR_ID}`;
      
      const response = await fetch(url, { 
        method: nuevoProducto.id ? 'PUT' : 'POST', 
        body: formData 
      });

      if (response.ok) {
        setIsModalOpen(false);
        setOriginalProductoData(null);
        resetForm();
        cargarProductos();
        setModalExito({
          isOpen: true,
          mensaje: nuevoProducto.id ? "Producto actualizado" : "Producto creado",
          subMensaje: `${nuevoProducto.titulo} ha sido ${nuevoProducto.id ? 'actualizado' : 'publicado'} exitosamente`
        });
      } else {
        const errorText = await response.text();
        setModalError({
          isOpen: true,
          mensaje: "Error al guardar",
          detalle: errorText
        });
      }
    } catch (error) { 
      console.error("Error:", error);
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: error.message
      });
    } finally { 
      setLoading(false); 
    }
  };

  const handleCargaMasiva = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setLoading(true);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('archivos', files[i]);
    }
    formData.append('vendedorId', VENDEDOR_ID);
    
    try {
      const response = await fetch('http://localhost:8080/api/productos/carga-masiva', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        setModalExito({
          isOpen: true,
          mensaje: "Carga masiva exitosa",
          subMensaje: `${files.length} productos cargados exitosamente`
        });
        cargarProductos();
      } else {
        setModalError({
          isOpen: true,
          mensaje: "Error en carga masiva",
          detalle: "Ocurrió un error al cargar los productos"
        });
      }
    } catch (error) {
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: error.message
      });
    } finally {
      setLoading(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const eliminarProducto = async (id) => {
    setModalConfirm({
      isOpen: true,
      productoId: id,
      mensaje: "¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
    });
  };

  const confirmarEliminar = async () => {
    const id = modalConfirm.productoId;
    try {
      const response = await fetch(`http://localhost:8080/api/productos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        cargarProductos();
        setModalExito({
          isOpen: true,
          mensaje: "Producto eliminado",
          subMensaje: "El producto ha sido eliminado exitosamente"
        });
      } else {
        setModalError({
          isOpen: true,
          mensaje: "Error al eliminar",
          detalle: "No se pudo eliminar el producto"
        });
      }
    } catch (error) {
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: error.message
      });
    }
    setModalConfirm({ isOpen: false, productoId: null, mensaje: '' });
  };

  const resetForm = () => {
    setNuevoProducto({ id: null, titulo: '', precio: '', stock: '', categoria: 'MODA', cashback: 10, descripcion: '' });
    setFileMultiple([]);
    setPreviews([]);
    setImagenesExistentes([]);
  };

  const getPrecioFinal = () => {
    const p = parseFloat(nuevoProducto.precio) || 0;
    const com = COMISIONES[nuevoProducto.categoria] || 0;
    return Math.round(p * (1 + com));
  };

  const actualizarEstadoOrden = async (ordenId, nuevoEstado) => {
    try {
      await fetch(`http://localhost:8080/api/ordenes/${ordenId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      cargarOrdenes();
      setModalExito({
        isOpen: true,
        mensaje: "Estado actualizado",
        subMensaje: `La orden ahora está en estado: ${nuevoEstado}`
      });
    } catch (error) {
      console.error("Error actualizando orden");
      setModalError({
        isOpen: true,
        mensaje: "Error al actualizar",
        detalle: "No se pudo actualizar el estado de la orden"
      });
    }
  };

  const imprimirEtiqueta = (orden) => {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <head><title>Etiqueta Envío - Wizzy</title></head>
        <body style="font-family: monospace; padding: 20px;">
          <h1>WIZZY - ETIQUETA DE ENVÍO</h1>
          <p><strong>Orden:</strong> #${orden.id}</p>
          <p><strong>Cliente:</strong> ${orden.cliente}</p>
          <p><strong>Producto:</strong> ${orden.producto}</p>
          <p><strong>Cantidad:</strong> ${orden.cantidad}</p>
          <p><strong>Dirección:</strong> ${orden.direccion}</p>
          <p><strong>Fecha:</strong> ${orden.fecha}</p>
          <hr/>
          <p style="font-size: 12px;">Gracias por comprar en Wizzy</p>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  };

  const abrirChat = (cliente) => {
    window.open(`https://wa.me/573000000000?text=Hola%20${encodeURIComponent(cliente)}%2C%20soy%20el%20vendedor%20de%20Wizzy`, '_blank');
  };

  const getNivelVerificacion = () => {
    const count = Object.values(verificacionStatus).filter(v => v === true).length;
    if (count === 3) return { nivel: 'VERIFICADO', color: 'emerald', badge: 'Verificado Gold' };
    if (count >= 2) return { nivel: 'EN_PROCESO', color: 'amber', badge: 'En Verificación' };
    return { nivel: 'PENDIENTE', color: 'red', badge: 'Documentación Pendiente' };
  };

  const nivelVerificacion = getNivelVerificacion();

  const productosFiltrados = productos.filter(prod => {
    if (filtroCategoria !== 'TODOS' && prod.categoria !== filtroCategoria) return false;
    if (searchTerm && !prod.titulo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalVentasMes = ordenes.reduce((sum, o) => o.estado === 'PAGADO' || o.estado === 'ENTREGADO' ? sum + o.total : sum, 0);
  const totalVentasMesAnterior = 1850000;
  const porcentajeCrecimiento = ((totalVentasMes - totalVentasMesAnterior) / totalVentasMesAnterior * 100).toFixed(0);

  const todasLasImagenes = [...imagenesExistentes, ...previews];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Modales globales */}
      <ModalConfirmacion
        isOpen={modalConfirm.isOpen}
        onClose={() => setModalConfirm({ isOpen: false, productoId: null, mensaje: '' })}
        onConfirm={confirmarEliminar}
        titulo="Eliminar producto"
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

      {/* Diálogo de confirmación para cambios sin guardar */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmClose}
        titulo="Cambios sin guardar"
        mensaje="Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Los cambios se perderán."
        confirmText="Salir sin guardar"
        cancelText="Cancelar"
      />

      {/* BANNER VERIFICACIÓN */}
      <div className={`bg-${nivelVerificacion.color}-50 border border-${nivelVerificacion.color}-200 rounded-[28px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <ShieldCheck size={28} className={`text-${nivelVerificacion.color}-500 flex-shrink-0`} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estado de Verificación</p>
            <p className={`font-black text-${nivelVerificacion.color}-700 text-sm uppercase tracking-tighter`}>{nivelVerificacion.badge}</p>
          </div>
        </div>
        <Tooltip text="Completar verificación de documentos">
          <button 
            onClick={() => setIsVerificacionModalOpen(true)}
            className={`bg-${nivelVerificacion.color}-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-${nivelVerificacion.color}-700 transition-all active:scale-95 w-full sm:w-auto`}
          >
            {nivelVerificacion.nivel === 'VERIFICADO' ? 'Ver Documentos' : 'Completar Verificación'}
          </button>
        </Tooltip>
      </div>

      {/* SECCIÓN DE TARJETAS SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={14} className="text-violet-500" />
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Fondos Disponibles</p>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">${saldo.toLocaleString('es-CO')}</h3>
            <Tooltip text="Solicitar retiro de fondos">
              <button 
                onClick={() => setIsRetiroModalOpen(true)}
                className="mt-4 w-full bg-slate-900 text-white py-2 md:py-3 rounded-xl text-[8px] md:text-[9px] font-black uppercase hover:bg-violet-600 transition-all active:scale-95"
              >
                Solicitar Retiro
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Ventas del Mes</p>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800">${totalVentasMes.toLocaleString('es-CO')}</h3>
          <p className={`text-[7px] md:text-[8px] font-black mt-1 ${porcentajeCrecimiento >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {porcentajeCrecimiento >= 0 ? '+' : ''}{porcentajeCrecimiento}% vs mes anterior
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-violet-500" />
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">Productos Activos</p>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800">{productos.length}</h3>
          <Tooltip text="Ver órdenes y pedidos">
            <button 
              onClick={() => setIsOrdenesModalOpen(true)}
              className="mt-4 w-full bg-slate-100 text-slate-700 py-2 md:py-2.5 rounded-xl text-[7px] md:text-[8px] font-black uppercase hover:bg-violet-100 transition-all active:scale-95"
            >
              Ver Órdenes ({ordenes.filter(o => o.estado === 'PENDIENTE').length} pendientes)
            </button>
          </Tooltip>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-4 md:p-6 rounded-[32px] text-white cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsAnalyticsModalOpen(true)}>
          <BarChart3 size={20} className="md:w-6 md:h-6 mb-2 opacity-80" />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-80">Wizzy Analytics</p>
          <h3 className="text-base md:text-lg font-black mt-1">Ver Dashboard</h3>
          <p className="text-[7px] md:text-[8px] opacity-70 mt-2">Productos más deseados • Rendimiento</p>
        </div>
      </div>

      {/* CALCULADOR DE IMPULSO */}
      {showCalculador && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[28px] p-4 md:p-6 border border-amber-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Calculator size={20} className="text-amber-600" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-tighter">Calculador de Impulso</h3>
            </div>
            <button onClick={() => setShowCalculador(false)} className="text-slate-400"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase">Precio del Producto</label>
              <input 
                type="number" 
                className="w-full bg-white rounded-xl p-2 md:p-3 text-sm font-black mt-1 border border-amber-200"
                placeholder="Ej: 100000"
                onChange={(e) => {
                  const precio = parseFloat(e.target.value) || 0;
                  const sugerido = Math.round(precio * 0.10);
                  setCashbackSugerido(sugerido);
                }}
              />
            </div>
            <div>
              <label className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase">Cashback a Ofrecer</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="w-full bg-white rounded-xl p-2 md:p-3 text-sm font-black mt-1 border border-amber-200"
                  value={cashbackSugerido}
                  onChange={(e) => setCashbackSugerido(parseFloat(e.target.value) || 0)}
                />
                <span className="text-xs font-black">COP</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[9px] md:text-[10px] font-black text-slate-600">Sugerencia Wizzy:</p>
              <p className="text-amber-700 font-black text-sm">10% del precio es competitivo</p>
            </div>
          </div>
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['TODOS', 'MODA', 'TECNOLOGIA', 'HOGAR', 'SERVICIOS'].map(cat => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase transition-all active:scale-95 ${
                filtroCategoria === cat 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-violet-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 md:gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              className="pl-8 pr-3 py-1.5 md:py-2 bg-slate-100 rounded-full text-[9px] md:text-[10px] font-bold w-32 md:w-48 focus:outline-none focus:ring-2 focus:ring-violet-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tooltip text="Calculadora de Impulso Wizzy">
            <button 
              onClick={() => setShowCalculador(!showCalculador)}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-amber-100 text-amber-700 rounded-full text-[8px] md:text-[9px] font-black uppercase hover:bg-amber-200 transition-all flex items-center gap-1 active:scale-95"
            >
              <Calculator size={12} /> Calculador
            </button>
          </Tooltip>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS - CON SCROLL HORIZONTAL */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs italic flex items-center gap-2">
            <Package size={16} className="text-violet-600" /> Inventario Físico
          </h4>
          <div className="flex gap-2 md:gap-3">
            <Tooltip text="Cargar múltiples productos a la vez">
              <button 
                onClick={() => csvInputRef.current?.click()}
                className="bg-slate-100 text-slate-700 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase hover:bg-slate-200 transition-all flex items-center gap-1 md:gap-2 active:scale-95"
              >
                <UploadCloud size={14} /> <span className="hidden sm:inline">Carga Masiva</span>
              </button>
            </Tooltip>
            <Tooltip text="Agregar nuevo producto">
              <button 
                onClick={abrirCreacion}
                className="bg-violet-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase hover:bg-slate-900 transition-all flex items-center gap-1 md:gap-2 active:scale-95"
              >
                <Plus size={14} /> <span className="hidden sm:inline">Agregar Item</span>
              </button>
            </Tooltip>
          </div>
        </div>
        <input type="file" ref={csvInputRef} multiple accept="image/*" hidden onChange={handleCargaMasiva} />

        {/* Contenedor con scroll horizontal para móvil */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] md:min-w-full text-left">
            <thead className="bg-slate-50/50 text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-[0.15em]">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">Producto</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Categoría</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Precio</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Cashback</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Stock</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productosFiltrados.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={prod.imagenesUrls?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt={prod.titulo} />
                      </div>
                      <span className="font-black text-slate-800 text-[9px] md:text-[10px] uppercase max-w-[120px] md:max-w-[200px] truncate">{prod.titulo}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 md:px-2 py-1 rounded-full">{prod.categoria}</span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-slate-600 text-[9px] md:text-[10px]">
                    ${(prod.precioPublico || 0).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className="text-[8px] md:text-[9px] font-black text-emerald-600">+${(prod.cashback || 0).toLocaleString('es-CO')}</span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`px-1.5 md:px-2 py-1 rounded-lg text-[7px] md:text-[8px] font-black ${prod.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {prod.stock} unds
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                      <Tooltip text="Editar producto">
                        <button onClick={() => abrirEdicion(prod)} className="text-slate-300 hover:text-violet-600 transition-colors active:scale-90"><Edit3 size={14} /></button>
                      </Tooltip>
                      <Tooltip text="Eliminar producto">
                        <button onClick={() => eliminarProducto(prod.id)} className="text-slate-300 hover:text-red-500 transition-colors active:scale-90"><Trash2 size={14} /></button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productosFiltrados.length === 0 && (
            <div className="p-10 md:p-20 text-center">
              <Package className="mx-auto text-slate-200 mb-3" size={40} />
              <p className="text-[9px] font-black text-slate-400 uppercase">No hay productos</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL REGISTRO/EDICIÓN CON IMAGEUPLOADER INTEGRADO */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={cerrarModal} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl animate-in zoom-in duration-300 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[9px] italic flex items-center gap-2">
                <ImageIcon size={14} className="text-violet-600" />
                {nuevoProducto.id ? 'Editar Producto' : 'Nuevo Item'}
              </h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              {hasUnsavedChanges && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
                  <p className="text-[8px] font-black text-amber-600 uppercase tracking-wider">⚠️ Tienes cambios sin guardar</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Categoría *</label>
                  <select className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none" value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}>
                    <option value="MODA">Moda</option>
                    <option value="TECNOLOGIA">Tech</option>
                    <option value="HOGAR">Hogar</option>
                    <option value="SERVICIOS">Servicios</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Galería de Imágenes</label>
                  <ImageUploader
                    imagenesIniciales={todasLasImagenes}
                    onImagenesChange={handleImagenesChange}
                    maxImages={10}
                  />
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400">Nombre *</label>
                <input required type="text" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 ring-violet-100" value={nuevoProducto.titulo} onChange={(e) => setNuevoProducto({...nuevoProducto, titulo: e.target.value})} />
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400">Descripción</label>
                <textarea rows="3" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 ring-violet-100" value={nuevoProducto.descripcion || ''} onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} placeholder="Describe tu producto..." />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Precio *</label>
                  <input required type="number" min="1" step="1" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Stock *</label>
                  <input required type="number" min="0" step="1" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black" value={nuevoProducto.stock} onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value})} />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400">Cashback %</label>
                  <input type="number" min="0" max="50" className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-black" value={nuevoProducto.cashback} onChange={(e) => setNuevoProducto({...nuevoProducto, cashback: e.target.value})} />
                </div>
              </div>

              <div className="bg-violet-50 p-3 rounded-xl flex justify-between items-center">
                <span className="text-[8px] font-black text-violet-400 uppercase">Precio Público:</span>
                <span className="font-black text-violet-600 text-[10px]">${getPrecioFinal().toLocaleString('es-CO')}</span>
              </div>

              <Tooltip text={nuevoProducto.id ? "Guardar cambios" : "Publicar producto"}>
                <button disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] hover:bg-violet-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" size={14} /> : (nuevoProducto.id ? 'Actualizar' : 'Publicar')}
                </button>
              </Tooltip>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ÓRDENES */}
      {isOrdenesModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOrdenesModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[80vh] rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[10px] italic flex items-center gap-2">
                <Package size={16} /> Gestión de Órdenes
              </h3>
              <button onClick={() => setIsOrdenesModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-4 md:p-6 max-h-[calc(80vh-80px)]">
              <div className="space-y-4">
                {ordenes.map((orden) => (
                  <div key={orden.id} className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Orden #{orden.id}</p>
                        <p className="font-black text-slate-800 text-sm">{orden.cliente}</p>
                        <p className="text-[10px] text-slate-500">{orden.producto} x{orden.cantidad}</p>
                        <p className="text-[9px] text-slate-400 mt-1 break-words max-w-[250px]">{orden.direccion}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-black text-violet-600">${orden.total.toLocaleString('es-CO')}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase mt-2 ${
                          orden.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' :
                          orden.estado === 'ENVIADO' ? 'bg-blue-100 text-blue-700' :
                          orden.estado === 'ENTREGADO' ? 'bg-slate-100 text-slate-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {orden.estado}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3 mt-4 pt-4 border-t border-slate-200">
                      <Tooltip text="Cambiar estado de la orden">
                        <select 
                          onChange={(e) => actualizarEstadoOrden(orden.id, e.target.value)}
                          className="text-[8px] font-black bg-white border border-slate-200 rounded-xl px-2 md:px-3 py-1.5 md:py-2"
                          defaultValue={orden.estado}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="PAGADO">Pagado</option>
                          <option value="ENVIADO">Enviado</option>
                          <option value="ENTREGADO">Entregado</option>
                        </select>
                      </Tooltip>
                      <Tooltip text="Imprimir etiqueta de envío">
                        <button onClick={() => imprimirEtiqueta(orden)} className="text-[8px] font-black bg-slate-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl hover:bg-violet-600 transition-all flex items-center gap-1 active:scale-95">
                          <Printer size={10} /> <span className="hidden sm:inline">Etiqueta</span>
                        </button>
                      </Tooltip>
                      <Tooltip text="Contactar con el cliente">
                        <button onClick={() => abrirChat(orden.cliente)} className="text-[8px] font-black bg-emerald-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-1 active:scale-95">
                          <MessageCircle size={10} /> <span className="hidden sm:inline">Chat</span>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ANALYTICS */}
      {isAnalyticsModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAnalyticsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[10px] italic">Wizzy Analytics</h3>
              <button onClick={() => setIsAnalyticsModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Ventas Semanales</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={dataTendencia}>
                      <Area type="monotone" dataKey="ventas" stroke="#7c3aed" fill="#7c3aed20" />
                      <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                      <RechartsTooltip />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Ventas Mensuales</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dataMensual}>
                      <Bar dataKey="ventas" fill="#7c3aed" radius={[8,8,0,0]} />
                      <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                      <RechartsTooltip />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-6 md:mt-8 p-4 md:p-5 bg-slate-50 rounded-2xl">
                <h4 className="font-black text-slate-800 text-[10px] uppercase mb-3 flex items-center gap-2">
                  <Star size={12} /> Productos más Deseados (Wishlist)
                </h4>
                <div className="space-y-2">
                  {productos.slice(0, 5).map((p, idx) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-600">{idx + 1}. {p.titulo}</span>
                      <span className="text-[8px] md:text-[9px] font-black text-violet-600">{Math.floor(Math.random() * 50) + 10} deseos</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL VERIFICACIÓN */}
      {isVerificacionModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsVerificacionModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-50">
              <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[10px] italic">Verificación Wizzy</h3>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className={`p-4 rounded-xl flex justify-between items-center ${verificacionStatus.rut ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className={verificacionStatus.rut ? 'text-emerald-500' : 'text-slate-400'} />
                  <div>
                    <p className="font-black text-[10px] uppercase">RUT</p>
                    <p className="text-[8px] text-slate-400">Documento Tributario</p>
                  </div>
                </div>
                {verificacionStatus.rut ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Tooltip text="Subir documento RUT"><button className="text-[8px] font-black text-violet-600">Subir</button></Tooltip>}
              </div>
              <div className={`p-4 rounded-xl flex justify-between items-center ${verificacionStatus.camaraComercio ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <Award size={20} className={verificacionStatus.camaraComercio ? 'text-emerald-500' : 'text-slate-400'} />
                  <div>
                    <p className="font-black text-[10px] uppercase">Cámara de Comercio</p>
                    <p className="text-[8px] text-slate-400">Certificado de Existencia</p>
                  </div>
                </div>
                {verificacionStatus.camaraComercio ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Tooltip text="Subir certificado"><button className="text-[8px] font-black text-violet-600">Subir</button></Tooltip>}
              </div>
              <div className={`p-4 rounded-xl flex justify-between items-center ${verificacionStatus.cuentaBancaria ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <Banknote size={20} className={verificacionStatus.cuentaBancaria ? 'text-emerald-500' : 'text-slate-400'} />
                  <div>
                    <p className="font-black text-[10px] uppercase">Cuenta Bancaria</p>
                    <p className="text-[8px] text-slate-400">Para retiros</p>
                  </div>
                </div>
                {verificacionStatus.cuentaBancaria ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Tooltip text="Configurar cuenta"><button className="text-[8px] font-black text-violet-600">Configurar</button></Tooltip>}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL RETIRO */}
      {isRetiroModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRetiroModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[40px] p-6 md:p-8 shadow-2xl text-center">
            <Banknote size={40} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Retiro de Fondos</h3>
            <p className="text-[9px] text-slate-400 font-bold mt-2 mb-6">Disponible: ${saldo.toLocaleString('es-CO')}</p>
            <form onSubmit={(e) => { e.preventDefault(); setIsRetiroModalOpen(false); setModalExito({ isOpen: true, mensaje: "Solicitud enviada", subMensaje: "Tu solicitud de retiro será procesada en 24-48 horas" }); }} className="space-y-4">
              <input required type="number" min="10000" placeholder="Monto a retirar" className="w-full bg-slate-50 rounded-2xl p-3 md:p-4 text-[10px] font-bold outline-none text-center" />
              <select className="w-full bg-slate-50 rounded-2xl p-3 md:p-4 text-[10px] font-bold outline-none text-center">
                <option>Nequi</option>
                <option>Daviplata</option>
                <option>Bancolombia</option>
              </select>
              <input required type="text" placeholder="Número de cuenta / Celular" className="w-full bg-slate-50 rounded-2xl p-3 md:p-4 text-[10px] font-bold outline-none text-center" />
              <Tooltip text="Confirmar solicitud de retiro">
                <button className="w-full bg-slate-900 text-white py-3 md:py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] hover:bg-violet-600 transition-all active:scale-95">
                  Confirmar Retiro
                </button>
              </Tooltip>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default ContentProductos;