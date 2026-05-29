import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ShoppingBag, Search, Anchor, MapPin, Star, Clock, Sparkles, User, Heart, CreditCard, Truck, CheckCircle, X, Phone, MapPinned, FileText, Building2, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, ShieldCheck, Lock, Award, Menu, WifiOff } from 'lucide-react';
import { useAuth } from './context/AuthContext'; 
import imageYate from './assets/yate.png';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './Components/DashboardLayout';
import ContentProductos from './Components/ContentProductos';
import ContentExperiencias from './Components/ContentExperiencias';
import Cart from './Components/Cart';
import DetalleProducto from './Components/DetalleProducto';
import CuadriculaEsqueleto from './Components/CuadriculaEsqueleto';
import ModalExito from './Components/Modales/ModalExito';
import ModalError from './Components/Modales/ModalError';
import ModalInfo from './Components/Modales/ModalInfo';
import Terminos from './pages/Terminos';
import Reembolso from './pages/Reembolso';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BusquedaAvanzada from "./Components/BusquedaAvanzada";


import PanelCliente from './Components/panels/PanelCliente';
import PanelVendedorProductos from './Components/panels/PanelVendedorProductos';
import PanelVendedorExperiencias from './Components/panels/PanelVendedorExperiencias';


import ForgotPasswordCode from './pages/ForgotPasswordCode';

const NetworkAlert = ({ isVisible, onRetry }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:min-w-[320px] z-[10001] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <WifiOff size={16} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Problema de conexión</p>
            <p className="text-[9px] text-slate-600 mt-0.5">No se pudo conectar con el servidor. Verifica tu conexión a internet.</p>
          </div>
          <button
            onClick={onRetry}
            className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[8px] font-black uppercase hover:bg-red-700 transition active:scale-95"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
};

// PROTECCIÓN DE RUTAS BLINDADA
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-black text-purple-600 animate-pulse">CARGANDO WIZZY...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;
  const userTipoVendedor = user.tipoVendedor;

  if (allowedRole === 'CLIENTE') {
    if (userRole !== 'CLIENTE') return <Navigate to="/" replace />;
    return children;
  }

  if (allowedRole === 'PRODUCTOS') {
    const esVendedorProductos = userRole === 'PRODUCTOS' || (userRole === 'VENDEDOR' && userTipoVendedor === 'PRODUCTOS');
    if (!esVendedorProductos && userRole !== 'ADMIN') return <Navigate to="/" replace />;
    return children;
  }

  if (allowedRole === 'EXPERIENCIAS') {
    const esVendedorExperiencias = userRole === 'EXPERIENCIAS' || (userRole === 'VENDEDOR' && userTipoVendedor === 'EXPERIENCIAS');
    if (!esVendedorExperiencias && userRole !== 'ADMIN') return <Navigate to="/" replace />;
    return children;
  }

  if (allowedRole === 'ADMIN') {
    if (userRole !== 'ADMIN') return <Navigate to="/" replace />;
    return children;
  }

  return children;
};

// Datos estáticos
const dataWizzyEstatico = {
  combos: [
    { id: 1, tag: "Tech", titulo: "Kit Nómada: Teclado Logitech + Stand MacBook", precioMercado: "380.000", imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400" },
    { id: 2, tag: "Summer", titulo: "Combo Island: Gafas Ray-Ban + Toalla Secado Rápido", precioMercado: "450.000", imagen: "https://images.unsplash.com/photo-1511499767390-91f19760b0ac?q=80&w=400" },
    { id: 3, tag: "Audio", titulo: "Power Pack: AirPods Pro + Estuche Silicona", precioMercado: "950.000", imagen: "https://images.unsplash.com/photo-1588423770574-910ae27755a7?q=80&w=400" },
    { id: 4, tag: "Gamer", titulo: "Bundle Pro: Mouse Razer + Pad XL Wizzy", precioMercado: "320.000", imagen: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400" },
    { id: 5, tag: "Moda", titulo: "Sunset Look: Camisa Lino + Sombrero Aguadeño", precioMercado: "280.000", imagen: "https://images.unsplash.com/photo-1598454444233-9dc334394ed3?q=80&w=400" }
  ],
  individuales: [
    { id: 11, tag: "Ram", titulo: "Memoria RAM Corsair 16GB DDR4", precioMercado: "240.000", imagen: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=400" },
    { id: 12, tag: "Acc", titulo: "Cargador Apple 20W Original", precioMercado: "95.000", imagen: "https://images.unsplash.com/photo-1619143020341-9257a3ba7254?q=80&w=400" },
    { id: 13, tag: "Moda", titulo: "Short de Baño Secado Rápido", precioMercado: "75.000", imagen: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=400" },
    { id: 14, tag: "Audio", titulo: "Audífonos Bluetooth In-Ear", precioMercado: "120.000", imagen: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400" }
  ]
};

const experienciasWizzy = [
  { id: 101, tag: "Noche", titulo: "Atardecer en Galeón Bucanero con Open Bar", precio: "140.000", imagen: "https://images.unsplash.com/photo-1544918877-460635b6d13e?q=80&w=400", duracion: "2h", rating: "4.9" },
  { id: 110, tag: "Luxury", titulo: "Yate Azimut Día Completo", precio: "3.500.000", imagen: "https://images.unsplash.com/photo-1567896836466-70853b79878d?q=80&w=400", duracion: "8h", rating: "5.0" }
];

// Componente de Paginación reutilizable
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, itemsLength }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-16 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
          Mostrando <span className="text-purple-600 font-black">{startItem}</span> - <span className="text-purple-600 font-black">{endItem}</span> de <span className="text-purple-600 font-black">{totalItems}</span> productos
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl transition-all ${
              currentPage === 1
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white border border-slate-200 text-purple-600 hover:bg-purple-50 hover:border-purple-200'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          
          {getPageNumbers().map((page, idx) => (
            <button
              key={idx}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`min-w-[36px] h-9 rounded-xl text-[10px] font-black transition-all ${
                page === currentPage
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                  : page === '...'
                  ? 'text-slate-400 cursor-default'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200'
              }`}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl transition-all ${
              currentPage === totalPages
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white border border-slate-200 text-purple-600 hover:bg-purple-50 hover:border-purple-200'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente WizzyCard con corazón, carrito y enlace a detalle
const WizzyCard = React.memo(({ tag, titulo, precioMercado, imagen, esCombo, productoId, onToggleWishlist, estaEnWishlist, onAgregarAlCarrito }) => {
  const numPrecio = typeof precioMercado === 'string' 
    ? parseInt(precioMercado.replace(/\./g, '')) 
    : (precioMercado || 0);

  const impulsoValue = Math.round(numPrecio * 0.10);
  const precioCombo = numPrecio + 70000 + 45000;
  const imgSrc = imagen?.startsWith('http') ? imagen : (imagen ? `http://localhost:8080/uploads/${imagen}` : "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400");

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleWishlist) {
      onToggleWishlist(productoId, titulo, numPrecio);
    }
  };

  const handleAgregarAlCarritoClick = (e) => {
    e.stopPropagation();
    if (onAgregarAlCarrito) {
      onAgregarAlCarrito(productoId, titulo, esCombo ? precioCombo : numPrecio, imgSrc);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all overflow-hidden flex flex-col h-full group relative">
      <button 
        onClick={handleWishlistClick}
        className="absolute top-2 right-2 z-20 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm cursor-pointer"
        title={estaEnWishlist ? "Eliminar de favoritos" : "Agregar a favoritos"}
      >
        <Heart 
          size={16} 
          className={estaEnWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400 transition-colors'}
        />
      </button>
      
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <div className={`absolute top-3 left-3 z-10 text-white text-[9px] font-black px-2 py-1 rounded uppercase ${esCombo ? 'bg-purple-600' : 'bg-slate-700'}`}>{tag}</div>
        <img src={imgSrc} alt={titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/producto/${productoId}`}>
          <h3 className="text-[11px] font-bold text-slate-700 mb-3 h-8 leading-tight uppercase hover:text-purple-600 transition-colors line-clamp-2">
            {titulo || "Producto sin nombre"}
          </h3>
        </Link>
        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 mt-auto mb-3">
          <span className="text-[10px] font-black text-purple-600 uppercase">{esCombo ? 'Combo Essentials' : 'Impulso WIZZY'}</span>
          <span className="text-xl font-black text-purple-700 block leading-none my-1">
            ${(esCombo ? precioCombo : numPrecio).toLocaleString('es-CO')}
          </span>
          <span className="text-[10px] font-bold text-purple-500 mt-0.5">{esCombo ? 'Incluye Atardecer 🛥️' : `Ganas +$${impulsoValue.toLocaleString('es-CO')} de Impulso ⛵`}</span>
        </div>
        <button 
          onClick={handleAgregarAlCarritoClick}
          className="w-full py-2 bg-purple-600 text-white text-[10px] font-bold rounded-xl uppercase hover:bg-purple-700 transition-colors"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
});

const ExperienceCard = ({ item }) => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all group border border-slate-100">
    <div className="relative h-48 overflow-hidden">
      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
        <MapPin size={10} /> {item.tag}
      </div>
      <img src={item.imagen} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
    </div>
    <div className="p-5">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs"><Star size={12} fill="currentColor" /> {item.rating}</div>
        <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase"><Clock size={12} /> {item.duracion}</div>
      </div>
      <h3 className="text-sm font-black text-slate-800 leading-tight mb-4 h-10 overflow-hidden uppercase tracking-tighter">{item.titulo}</h3>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Desde</p><p className="text-lg font-black text-purple-600">${item.precio}</p></div>
        <button className="bg-slate-900 text-white p-2.5 rounded-2xl hover:bg-purple-600 transition-colors shadow-lg"><Anchor size={18} /></button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("productos"); 
  const [productosAPI, setProductosAPI] = useState([]); 
  const [experienciasAPI, setExperienciasAPI] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 🆕 Estados para manejo de errores de red
  const [networkError, setNetworkError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // 🆕 Estado para menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados para modales
  const [modalExito, setModalExito] = useState({ isOpen: false, mensaje: '', subMensaje: '' });
  const [modalError, setModalError] = useState({ isOpen: false, mensaje: '', detalle: '' });
  const [modalInfo, setModalInfo] = useState({ isOpen: false, titulo: '', mensaje: '' });

  // Estado para skeletons/loaders
  const [cargandoProductos, setCargandoProductos] = useState(true);

  // Estados para filtros
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [filtroPrecio, setFiltroPrecio] = useState('TODOS');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados para paginación
  const [currentPageCombos, setCurrentPageCombos] = useState(1);
  const [currentPageIndividuales, setCurrentPageIndividuales] = useState(1);
  const itemsPerPage = 10;

  const categorias = ['MODA', 'TECNOLOGIA', 'HOGAR', 'SERVICIOS'];
  const rangosPrecio = [
    { id: 'TODOS', label: 'Todos', min: 0, max: Infinity },
    { id: '0-100', label: 'Hasta $100.000', min: 0, max: 100000 },
    { id: '100-500', label: '$100.000 - $500.000', min: 100000, max: 500000 },
    { id: '500-1000', label: '$500.000 - $1.000.000', min: 500000, max: 1000000 },
    { id: '1000+', label: 'Más de $1.000.000', min: 1000000, max: Infinity }
  ];

  // Estados para el carrito
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('wizzy_carrito');
    if (carritoGuardado) {
      try {
        const items = JSON.parse(carritoGuardado);
        setCartItems(items);
      } catch (e) {
        console.error("Error cargando carrito:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wizzy_carrito', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    setCurrentPageCombos(1);
    setCurrentPageIndividuales(1);
  }, [searchTerm, filtroCategoria, filtroPrecio, productosAPI]);

  // Estados para el modal de compra
  const [modalCompra, setModalCompra] = useState({
    abierto: false,
    productoId: null,
    productoTitulo: '',
    precio: 0,
    cantidad: 1,
    cargando: false,
    exito: false,
    pedidoId: null
  });

  // Datos de envío
  const [datosEnvio, setDatosEnvio] = useState({
    direccion: '',
    ciudad: 'Cartagena',
    telefono: '',
    metodoPago: 'nequi',
    notas: ''
  });

  const ciudades = ['Cartagena', 'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Santa Marta', 'Otra'];
  const metodosPago = [
    { id: 'nequi', nombre: 'Nequi', icono: '📱' },
    { id: 'daviplata', nombre: 'Daviplata', icono: '💳' },
    { id: 'bancolombia', nombre: 'Bancolombia', icono: '🏦' },
    { id: 'efecty', nombre: 'Efecty', icono: '💰' }
  ];

  // 🆕 Función para reintentar conexión
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setNetworkError(false);
    await cargarDatos();
    setIsRetrying(false);
  };

  // Verificar stock antes de agregar al carrito
  const verificarYAgregarAlCarrito = async (productoId, titulo, precio, imagen) => {
    if (!user) {
      setModalInfo({
        isOpen: true,
        titulo: "Inicia sesión",
        mensaje: "Debes iniciar sesión para agregar productos al carrito"
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/productos/${productoId}`);
      if (response.ok) {
        const producto = await response.json();
        if (producto.stock < 1) {
          setModalInfo({
            isOpen: true,
            titulo: "Sin stock",
            mensaje: `Lo sentimos, "${titulo}" no tiene stock disponible.`
          });
          return;
        }
        
        setCartItems(prev => {
          const existe = prev.find(item => item.productoId === productoId);
          if (existe) {
            if (producto.stock < existe.cantidad + 1) {
              setModalInfo({
                isOpen: true,
                titulo: "Stock insuficiente",
                mensaje: `Stock insuficiente para "${titulo}". Disponible: ${producto.stock}`
              });
              return prev;
            }
            return prev.map(item =>
              item.productoId === productoId
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            );
          }
          return [...prev, { productoId, titulo, precio, cantidad: 1, imagen }];
        });
        setModalExito({
          isOpen: true,
          mensaje: "¡Producto agregado!",
          subMensaje: `${titulo} ha sido agregado al carrito`
        });
      }
    } catch (error) {
      console.error("Error verificando stock:", error);
      setNetworkError(true);
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: "No se pudo conectar con el servidor. Verifica tu conexión a internet."
      });
    }
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setCartOpen(false);
  };

  const cargarWishlist = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:8080/api/deseos/usuario/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const ids = new Set(data.map(item => item.productoId));
        setWishlistIds(ids);
      }
    } catch (error) {
      console.error("Error cargando wishlist:", error);
      setNetworkError(true);
    }
  }, [user]);

  useEffect(() => {
    cargarWishlist();
  }, [cargarWishlist]);

  const toggleWishlist = useCallback(async (productoId, titulo, precio) => {
    if (!user) {
      setModalInfo({
        isOpen: true,
        titulo: "Inicia sesión",
        mensaje: "Debes iniciar sesión para guardar productos en tu lista de deseos"
      });
      return;
    }

    const estaEnWishlist = wishlistIds.has(productoId);
    
    if (estaEnWishlist) {
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productoId);
        return newSet;
      });
    } else {
      setWishlistIds(prev => new Set(prev).add(productoId));
    }
    
    if (estaEnWishlist) {
      try {
        await fetch(`http://localhost:8080/api/deseos/usuario/${user.id}/producto/${productoId}`, {
          method: 'DELETE'
        });
        setModalExito({
          isOpen: true,
          mensaje: "Producto eliminado",
          subMensaje: "Se eliminó de tu lista de deseos"
        });
      } catch (error) {
        console.error("Error eliminando de wishlist:", error);
        setWishlistIds(prev => new Set(prev).add(productoId));
        setNetworkError(true);
        setModalError({
          isOpen: true,
          mensaje: "Error de conexión",
          detalle: "No se pudo conectar con el servidor"
        });
      }
    } else {
      try {
        await fetch(`http://localhost:8080/api/deseos/agregar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: user.id,
            productoId: productoId
          })
        });
        setModalExito({
          isOpen: true,
          mensaje: "¡Agregado a favoritos!",
          subMensaje: "Producto guardado en tu lista de deseos"
        });
      } catch (error) {
        console.error("Error agregando a wishlist:", error);
        setWishlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productoId);
          return newSet;
        });
        setNetworkError(true);
        setModalError({
          isOpen: true,
          mensaje: "Error de conexión",
          detalle: "No se pudo conectar con el servidor"
        });
      }
    }
  }, [user, wishlistIds]);

  const handleComprar = async (productoId, titulo, precio) => {
    if (!user) {
      setModalInfo({
        isOpen: true,
        titulo: "Inicia sesión",
        mensaje: "Debes iniciar sesión para comprar"
      });
      navigate('/login');
      return;
    }

    setModalCompra({
      abierto: true,
      productoId,
      productoTitulo: titulo,
      precio,
      cantidad: 1,
      cargando: false,
      exito: false,
      pedidoId: null
    });
    
    setDatosEnvio({
      direccion: user?.direccionResidencia || '',
      ciudad: 'Cartagena',
      telefono: user?.telefono || '',
      metodoPago: 'nequi',
      notas: ''
    });
  };

  const confirmarCompra = async () => {
    if (!datosEnvio.direccion.trim()) {
      setModalInfo({
        isOpen: true,
        titulo: "Dirección requerida",
        mensaje: "Por favor ingresa tu dirección de envío"
      });
      return;
    }
    if (!datosEnvio.telefono.trim()) {
      setModalInfo({
        isOpen: true,
        titulo: "Teléfono requerido",
        mensaje: "Por favor ingresa tu número de teléfono"
      });
      return;
    }

    setModalCompra(prev => ({ ...prev, cargando: true }));
    
    try {
      const response = await fetch(`http://localhost:8080/api/productos/${modalCompra.productoId}/comprar?cantidad=${modalCompra.cantidad}&clienteId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setModalCompra(prev => ({ 
          ...prev, 
          cargando: false, 
          exito: true, 
          pedidoId: data.id 
        }));
      } else {
        const error = await response.text();
        setModalError({
          isOpen: true,
          mensaje: "Error en la compra",
          detalle: error
        });
        setModalCompra(prev => ({ ...prev, abierto: false, cargando: false }));
      }
    } catch (error) {
      console.error("Error:", error);
      setNetworkError(true);
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: "No se pudo conectar con el servidor"
      });
      setModalCompra(prev => ({ ...prev, abierto: false, cargando: false }));
    }
  };

  const cerrarModalCompra = () => {
    setModalCompra({
      abierto: false,
      productoId: null,
      productoTitulo: '',
      precio: 0,
      cantidad: 1,
      cargando: false,
      exito: false,
      pedidoId: null
    });
    setDatosEnvio({
      direccion: '',
      ciudad: 'Cartagena',
      telefono: '',
      metodoPago: 'nequi',
      notas: ''
    });
  };

  const cargarDatos = async () => {
    setCargandoProductos(true);
    setNetworkError(false);
    
    try {
      const tiendaRes = await fetch('http://localhost:8080/api/productos/tienda');
      if (tiendaRes.ok) {
        const data = await tiendaRes.json();
        setProductosAPI(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const expRes = await fetch('http://localhost:8080/api/productos/experiencias');
      if (expRes.ok) {
        const data = await expRes.json();
        setExperienciasAPI(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log("Error API:", err);
      setNetworkError(true);
    } finally {
      setCargandoProductos(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const filtroPorCategoria = (item) => {
    if (filtroCategoria === 'TODOS') return true;
    const categoriaItem = item.categoria || item.tag?.toUpperCase();
    return categoriaItem === filtroCategoria;
  };

  const filtroPorRangoPrecio = (item) => {
    if (filtroPrecio === 'TODOS') return true;
    const precio = typeof item.precioMercado === 'number' 
      ? item.precioMercado 
      : parseInt(String(item.precioMercado).replace(/\./g, ''));
    const rango = rangosPrecio.find(r => r.id === filtroPrecio);
    if (!rango) return true;
    return precio >= rango.min && precio <= rango.max;
  };

  const filteredData = useMemo(() => {
    const filter = (arr) => arr.filter(item => 
      (item.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tag || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const productosNuevosMapeados = productosAPI.map(p => ({ 
      id: p.id,
      productoId: p.id,
      tag: p.categoria || "Nuevo", 
      titulo: p.titulo, 
      precioMercado: p.precioPublico || 0, 
      categoria: p.categoria,
      imagen: (p.imagenesUrls && p.imagenesUrls.length > 0) ? p.imagenesUrls[0] : null 
    }));

    const experienciasNuevasMapeadas = experienciasAPI.map(e => ({
      id: `exp-${e.id}`,
      tag: e.categoria || "Plan",
      titulo: e.titulo,
      precio: (e.precioPublico || 0).toLocaleString('es-CO'),
      precioMercado: e.precioPublico || 0,
      categoria: e.categoria,
      imagen: (e.imagenesUrls && e.imagenesUrls.length > 0) ? e.imagenesUrls[0] : "https://via.placeholder.com/400",
      duracion: "Consultar",
      rating: "5.0"
    }));

    const todosLosIndividuales = [...productosNuevosMapeados, ...dataWizzyEstatico.individuales.map(p => ({ ...p, productoId: p.id, categoria: p.tag }))];
    const todasLasExperiencias = [...experienciasNuevasMapeadas, ...experienciasWizzy];

    const combosFiltrados = dataWizzyEstatico.combos
      .map(c => ({ ...c, productoId: c.id, categoria: c.tag }))
      .filter(item => filtroPorCategoria(item) && filtroPorRangoPrecio(item));
    
    const individualesFiltrados = todosLosIndividuales
      .filter(item => filtroPorCategoria(item) && filtroPorRangoPrecio(item));
    
    const experienciasFiltradas = todasLasExperiencias
      .filter(item => filtroPorCategoria(item) && filtroPorRangoPrecio(item));

    return {
      combos: filter(combosFiltrados),
      individuales: filter(individualesFiltrados),
      experiencias: filter(experienciasFiltradas)
    };
  }, [searchTerm, productosAPI, experienciasAPI, filtroCategoria, filtroPrecio]);

  const paginatedCombos = useMemo(() => {
    const start = (currentPageCombos - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.combos.slice(start, end);
  }, [filteredData.combos, currentPageCombos]);

  const paginatedIndividuales = useMemo(() => {
    const start = (currentPageIndividuales - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.individuales.slice(start, end);
  }, [filteredData.individuales, currentPageIndividuales]);

  const totalPagesCombos = Math.ceil(filteredData.combos.length / itemsPerPage);
  const totalPagesIndividuales = Math.ceil(filteredData.individuales.length / itemsPerPage);

  useEffect(() => {
    if (location.pathname === '/' && location.state?.fromView) {
      setView(location.state.fromView);
    }
  }, [location]);

  const handleViewChange = (targetView) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { fromView: targetView } });
    } else {
      setView(targetView);
      window.scrollTo(0, 0);
    }
    setMobileMenuOpen(false);
  };

  const isDashboard = location.pathname.includes('/panel-') || location.pathname.includes('/dashboard-');

  const getDashboardRoute = () => {
    if (!user) return '/login';
    const userRole = user.role;
    const userTipoVendedor = user.tipoVendedor;
    if (userRole === 'CLIENTE') return '/panel-cliente';
    if (userRole === 'PRODUCTOS') return '/panel-vendedor-productos';
    if (userRole === 'EXPERIENCIAS') return '/panel-vendedor-experiencias';
    if (userRole === 'VENDEDOR' && userTipoVendedor === 'PRODUCTOS') return '/panel-vendedor-productos';
    if (userRole === 'VENDEDOR' && userTipoVendedor === 'EXPERIENCIAS') return '/panel-vendedor-experiencias';
    if (userRole === 'ADMIN') return '/dashboard-productos';
    return '/';
  };

  const rangoSeleccionado = rangosPrecio.find(r => r.id === filtroPrecio);

  return (
    <div className="bg-slate-50 min-h-screen">
  {/* 🆕 Alerta de error de red */}
  <NetworkAlert onRetry={() => {
    // Recargar datos importantes cuando se recupera la conexión
    window.location.reload();
  }} />

      {/* Modales globales */}
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

      {/* MODAL DEL CARRITO */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateCart={setCartItems}
        onCheckout={handleCheckoutSuccess}
      />

      {/* MODAL DE COMPRA PREMIUM */}
      {modalCompra.abierto && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cerrarModalCompra} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            
            {!modalCompra.exito ? (
              <>
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white sticky top-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Checkout Wizzy</p>
                      <h3 className="text-xl font-black mt-1">Confirmar compra</h3>
                    </div>
                    <button onClick={cerrarModalCompra} className="text-white/80 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <ShoppingBag size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{modalCompra.productoTitulo}</p>
                      <p className="text-[10px] text-slate-500">Producto físico</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setModalCompra(prev => ({ ...prev, cantidad: Math.max(1, prev.cantidad - 1) }))}
                        className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-black hover:bg-purple-100 transition"
                      >
                        -
                      </button>
                      <span className="text-xl font-black text-slate-800 w-12 text-center">{modalCompra.cantidad}</span>
                      <button 
                        onClick={() => setModalCompra(prev => ({ ...prev, cantidad: prev.cantidad + 1 }))}
                        className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-black hover:bg-purple-100 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <MapPinned size={12} /> Dirección de envío *
                    </label>
                    <input
                      type="text"
                      value={datosEnvio.direccion}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                      placeholder="Calle, número, barrio"
                      className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <Building2 size={12} /> Ciudad
                    </label>
                    <select
                      value={datosEnvio.ciudad}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, ciudad: e.target.value })}
                      className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      {ciudades.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <Phone size={12} /> Teléfono de contacto *
                    </label>
                    <input
                      type="tel"
                      value={datosEnvio.telefono}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, telefono: e.target.value })}
                      placeholder="Ej: 3001234567"
                      className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <CreditCard size={12} /> Método de pago
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {metodosPago.map(mp => (
                        <button
                          key={mp.id}
                          type="button"
                          onClick={() => setDatosEnvio({ ...datosEnvio, metodoPago: mp.id })}
                          className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                            datosEnvio.metodoPago === mp.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
                          }`}
                        >
                          <span>{mp.icono}</span> {mp.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <FileText size={12} /> Notas adicionales (opcional)
                    </label>
                    <textarea
                      rows="2"
                      value={datosEnvio.notas}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, notas: e.target.value })}
                      placeholder="Ej: Entregar en horario de 9am a 6pm, timbre principal..."
                      className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-bold text-slate-700">${(modalCompra.precio * modalCompra.cantidad).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Envío</span>
                      <span className="font-bold text-emerald-600">Gratis</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="font-black text-slate-800 text-sm">Total</span>
                      <span className="font-black text-purple-600 text-lg">${(modalCompra.precio * modalCompra.cantidad).toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2">
                    <Truck size={14} className="text-amber-600" />
                    <p className="text-[8px] text-amber-700 font-black uppercase">Envío gratis en toda Colombia • 3-5 días hábiles</p>
                  </div>

                  <button
                    onClick={confirmarCompra}
                    disabled={modalCompra.cargando}
                    className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    {modalCompra.cargando ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CreditCard size={14} /> Confirmar y Pagar
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black">¡Compra Exitosa!</h3>
                  <p className="text-[10px] opacity-80 mt-1">Pedido #{modalCompra.pedidoId}</p>
                </div>
                
                <div className="p-6 text-center">
                  <p className="text-[11px] text-slate-600 mb-6">
                    Tu pedido ha sido registrado. Recibirás notificaciones sobre el estado de tu envío en tu WhatsApp y correo.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={cerrarModalCompra}
                      className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-black text-[9px] uppercase hover:bg-slate-900 transition"
                    >
                      Seguir Comprando
                    </button>
                    <button
                      onClick={() => {
                        cerrarModalCompra();
                        navigate('/panel-cliente');
                      }}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-black text-[9px] uppercase hover:bg-purple-700 transition"
                    >
                      Ver Mis Compras
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!isDashboard && (
        <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 backdrop-blur-md bg-white/90">
          <nav className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-black text-purple-700 cursor-pointer flex-shrink-0" onClick={() => handleViewChange("productos")}>
              <div className="bg-purple-100 p-1.5 rounded-lg text-purple-600"><ShoppingBag size={18} className="md:w-5 md:h-5" /></div>
              <span className="tracking-tighter">Wizzy</span>
            </div>

            <div className="hidden md:block flex-grow max-w-md mx-8">
  <BusquedaAvanzada 
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    onResultados={(data) => {
      // Manejar resultados de búsqueda avanzada
      console.log('Resultados:', data);
    }}
    onBuscar={() => {
      // También buscar cuando se limpian filtros
      cargarDatos();
    }}
  />
</div>

            <div className="hidden md:flex items-center gap-6 lg:gap-10 ml-auto mr-8">
              <button onClick={() => handleViewChange("productos")} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-purple-600 ${view === 'productos' && location.pathname === '/' ? 'text-purple-700 underline underline-offset-8 decoration-2' : 'text-slate-400'}`}>Productos</button>
              <button onClick={() => handleViewChange("experiencias")} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-purple-600 flex items-center gap-2 ${view === 'experiencias' && location.pathname === '/' ? 'text-purple-700 underline underline-offset-8 decoration-2' : 'text-slate-400'}`}>Experiencias <Sparkles size={12} /></button>
              {!user && (
                <Link to="/register" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-purple-600">Vender</Link>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="md:hidden relative bg-slate-100 p-2 rounded-full hover:bg-purple-100 transition"
              >
                <Filter size={16} className="text-purple-600" />
                {(filtroCategoria !== 'TODOS' || filtroPrecio !== 'TODOS') && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-slate-100 p-2 rounded-full hover:bg-purple-100 transition"
              >
                <ShoppingBag size={18} className="md:w-5 md:h-5 text-purple-600" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {cartItems.length > 9 ? '9+' : cartItems.length}
                  </span>
                )}
              </button>
              
              {user ? (
                <Link to={getDashboardRoute()} className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-xs font-black text-purple-700 hover:bg-purple-50 transition-all">
                  <User size={16} /> {user.nombre?.split(' ')[0] || 'Mi Cuenta'}
                </Link>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-purple-600">Entrar</Link>
                  <Link to="/register" className="bg-purple-600 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95">Unirme</Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-slate-100 p-2 rounded-full hover:bg-purple-100 transition"
              >
                <Menu size={20} className="text-purple-600" />
              </button>
            </div>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-50 py-4 px-4 animate-fade-in">
              <div className="flex flex-col gap-4">
                <div className="relative flex items-center bg-slate-100 rounded-full px-4 py-2">
                  <Search size={16} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar productos..." 
                    className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-slate-600" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
                
                <button 
                  onClick={() => handleViewChange("productos")} 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] py-2 text-left ${view === 'productos' && location.pathname === '/' ? 'text-purple-700' : 'text-slate-500'}`}
                >
                  Productos
                </button>
                <button 
                  onClick={() => handleViewChange("experiencias")} 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] py-2 text-left flex items-center gap-2 ${view === 'experiencias' && location.pathname === '/' ? 'text-purple-700' : 'text-slate-500'}`}
                >
                  Experiencias <Sparkles size={14} />
                </button>
                
                {user ? (
                  <Link 
                    to={getDashboardRoute()} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl text-xs font-black text-purple-700"
                  >
                    <User size={16} /> {user.nombre?.split(' ')[0] || 'Mi Cuenta'}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center text-xs font-bold text-slate-600 bg-slate-100 py-2.5 rounded-xl"
                    >
                      Entrar
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center bg-purple-600 text-white py-2.5 rounded-xl text-xs font-bold"
                    >
                      Unirme
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center text-[9px] font-black text-slate-400 py-1"
                    >
                      Vender en Wizzy
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {mostrarFiltros && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-40 py-4 px-4 md:px-6">
              <div className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-purple-600" />
                  <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-wider">Filtrar por:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase">Categoría</span>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="bg-slate-100 rounded-full px-3 py-1.5 text-[8px] md:text-[9px] font-black text-slate-700 outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="TODOS">Todos</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase">Precio</span>
                  <select
                    value={filtroPrecio}
                    onChange={(e) => setFiltroPrecio(e.target.value)}
                    className="bg-slate-100 rounded-full px-3 py-1.5 text-[8px] md:text-[9px] font-black text-slate-700 outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    {rangosPrecio.map(rango => (
                      <option key={rango.id} value={rango.id}>{rango.label}</option>
                    ))}
                  </select>
                </div>

                {(filtroCategoria !== 'TODOS' || filtroPrecio !== 'TODOS') && (
                  <button
                    onClick={() => {
                      setFiltroCategoria('TODOS');
                      setFiltroPrecio('TODOS');
                    }}
                    className="text-[7px] md:text-[8px] font-black text-purple-600 underline hover:text-purple-700"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      <main className={!isDashboard ? "pt-16 md:pt-20" : ""}>
        <Routes>
          <Route path="/" element={
            <>
              {view === "productos" ? (
                <div className="animate-in fade-in duration-700">
                  <section className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 z-10" />
                    <img src={imageYate} className="absolute inset-0 w-full h-full object-cover scale-105" alt="Yate Cartagena" />
                    <div className="relative z-20 text-center text-white px-4 md:px-6">
                      <h1 className="text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-black mb-4 md:mb-6 tracking-tighter leading-none">
                        Tu Pasaporte a <br /> Cartagena.
                      </h1>
                      <p className="text-xs md:text-base lg:text-xl font-bold opacity-90 mb-6 md:mb-10 max-w-2xl mx-auto uppercase tracking-[0.2em] md:tracking-[0.3em]">
                        Compra hoy, vive la experiencia mañana.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                        <a href="#tienda" className="w-full sm:w-auto bg-white text-purple-700 px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase tracking-tighter shadow-2xl hover:bg-purple-50 transition-all hover:scale-105 text-center text-xs md:text-sm">Explorar Tienda</a>
                        <button onClick={() => {setView("experiencias"); window.scrollTo(0,0)}} className="w-full sm:w-auto bg-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase tracking-tighter shadow-2xl hover:bg-purple-700 border-2 border-purple-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2 text-xs md:text-sm">Experiencias <Sparkles size={16} className="md:w-[18px]" /></button>
                      </div>
                    </div>
                  </section>
                  
                  {(filtroCategoria !== 'TODOS' || filtroPrecio !== 'TODOS') && (
                    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4">
                      <div className="flex items-center gap-2 text-[8px] text-slate-500">
                        <span>Filtros activos:</span>
                        {filtroCategoria !== 'TODOS' && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{filtroCategoria}</span>
                        )}
                        {filtroPrecio !== 'TODOS' && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{rangoSeleccionado?.label}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div id="tienda" className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-20">
                    <div className="mb-16 md:mb-24">
                      <div className="flex items-end justify-between mb-8 md:mb-12 border-l-4 md:border-l-8 border-purple-600 pl-4 md:pl-6">
                        <div>
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter">Wizzy <span className="text-purple-600">Essentials</span></h2>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Incluyen pase automático para experiencias en yate</p>
                        </div>
                      </div>
                      
                      {cargandoProductos && !networkError ? (
                        <CuadriculaEsqueleto cantidad={10} columnas={5} />
                      ) : networkError ? (
                        <div className="text-center py-20">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <WifiOff size={28} className="text-red-500" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No se pudieron cargar los productos</p>
                          <button 
                            onClick={handleRetryConnection}
                            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition"
                          >
                            Reintentar
                          </button>
                        </div>
                      ) : filteredData.combos.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-[10px] text-slate-400">No hay productos que coincidan con los filtros</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {paginatedCombos.map(prod => (
                              <WizzyCard 
                                key={prod.id} 
                                {...prod} 
                                esCombo={true} 
                                productoId={prod.id}
                                onToggleWishlist={toggleWishlist}
                                estaEnWishlist={wishlistIds.has(prod.id)}
                                onAgregarAlCarrito={verificarYAgregarAlCarrito}
                              />
                            ))}
                          </div>
                          <Pagination 
                            currentPage={currentPageCombos}
                            totalPages={totalPagesCombos}
                            onPageChange={setCurrentPageCombos}
                            totalItems={filteredData.combos.length}
                            itemsPerPage={itemsPerPage}
                            itemsLength={paginatedCombos.length}
                          />
                        </>
                      )}
                    </div>

                    <div>
                      <div className="flex items-end justify-between mb-8 md:mb-12 border-l-4 md:border-l-8 border-purple-400 pl-4 md:pl-6">
                        <div>
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter">IMPULSO <span className="text-slate-400">WIZZY</span></h2>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Suma saldo para tus próximos planes VIP</p>
                        </div>
                      </div>
                      
                      {cargandoProductos && !networkError ? (
                        <CuadriculaEsqueleto cantidad={10} columnas={5} />
                      ) : networkError ? (
                        <div className="text-center py-20">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <WifiOff size={28} className="text-red-500" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No se pudieron cargar los productos</p>
                        </div>
                      ) : filteredData.individuales.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-[10px] text-slate-400">No hay productos que coincidan con los filtros</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {paginatedIndividuales.map(prod => (
                              <WizzyCard 
                                key={prod.id} 
                                {...prod} 
                                esCombo={false} 
                                productoId={prod.id}
                                onToggleWishlist={toggleWishlist}
                                estaEnWishlist={wishlistIds.has(prod.id)}
                                onAgregarAlCarrito={verificarYAgregarAlCarrito}
                              />
                            ))}
                          </div>
                          <Pagination 
                            currentPage={currentPageIndividuales}
                            totalPages={totalPagesIndividuales}
                            onPageChange={setCurrentPageIndividuales}
                            totalItems={filteredData.individuales.length}
                            itemsPerPage={itemsPerPage}
                            itemsLength={paginatedIndividuales.length}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
                    <div className="border-l-[6px] md:border-l-[12px] border-purple-600 pl-6 md:pl-8">
                      <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">Cartagena <br /><span className="text-purple-600">VIP Experiences</span></h2>
                      <p className="text-slate-500 font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-[8px] md:text-xs mt-3 md:mt-4">Reserva directamente los mejores planes de la ciudad</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
                    {filteredData.experiencias.map(exp => <ExperienceCard key={exp.id} item={exp} />)}
                  </div>
                </div>
              )}
            </>
          } />
          
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/reembolso" element={<Reembolso />} />
          
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/panel-cliente" element={
            <ProtectedRoute allowedRole="CLIENTE">
              <DashboardLayout role="CLIENTE" user={user} />
            </ProtectedRoute>
          } />

          <Route path="/panel-vendedor-productos" element={
            <ProtectedRoute allowedRole="PRODUCTOS">
              <DashboardLayout role="PRODUCTOS" user={user} />
            </ProtectedRoute>
          } />

          <Route path="/panel-vendedor-experiencias" element={
            <ProtectedRoute allowedRole="EXPERIENCIAS">
              <DashboardLayout role="EXPERIENCIAS" user={user} />
            </ProtectedRoute>
          } />

          <Route path="/dashboard-productos" element={
            <ProtectedRoute allowedRole="ADMIN">
              <DashboardLayout role="ADMIN" user={user} />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPasswordCode />} />

        </Routes>
      </main>

      {!isDashboard && (
        <footer className="bg-white border-t border-slate-100 py-10 md:py-12 mt-16 md:mt-20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 mb-6 md:mb-8">
              <div className="flex items-center gap-2 text-xl font-black text-slate-300">
                <ShoppingBag size={20} /> <span>Wizzy 2026</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <Link to="/terminos" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition">Términos</Link>
                <Link to="/reembolso" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition">Reembolsos</Link>
                <Link to="#" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition">Privacidad</Link>
                <Link to="#" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition">Soporte</Link>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-1.5 md:gap-2 text-[7px] md:text-[8px] text-slate-400">
                <ShieldCheck size={10} className="md:w-3 md:h-3 text-emerald-500" />
                <span>Compra 100% segura</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-[7px] md:text-[8px] text-slate-400">
                <Lock size={10} className="md:w-3 md:h-3 text-purple-500" />
                <span>Datos protegidos</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-[7px] md:text-[8px] text-slate-400">
                <Award size={10} className="md:w-3 md:h-3 text-amber-500" />
                <span>Wizzy Protect</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-[7px] md:text-[8px] text-slate-400">
                <Truck size={10} className="md:w-3 md:h-3 text-emerald-500" />
                <span>Envío gratis</span>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-[6px] md:text-[7px] text-slate-300">
                © 2026 Wizzy Marketplace SAS - Todos los derechos reservados
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;