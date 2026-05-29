import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Truck, ShieldCheck, ArrowLeft, Minus, Plus, MessageCircle, ChevronLeft, ChevronRight, X, AlertCircle, Loader2, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ModalConfirmacion from './Modales/ModalConfirmacion';
import ModalExito from './Modales/ModalExito';
import ModalError from './Modales/ModalError';
import ModalInfo from './Modales/ModalInfo';
import ComprarRegaloExperienciaModal from './ComprarRegaloExperienciaModal';

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

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [enWishlist, setEnWishlist] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [stockReal, setStockReal] = useState(0);

  // 🆕 Estado para modal de compra como regalo
  const [showModalRegalo, setShowModalRegalo] = useState(false);

  // Estados para el carrusel de imágenes
  const [imagenActual, setImagenActual] = useState(0);
  const [modalImagenAbierto, setModalImagenAbierto] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Ref para el contenedor del carrusel
  const carruselRef = useRef(null);

  // Estados para calificaciones
  const [calificaciones, setCalificaciones] = useState([]);
  const [promedio, setPromedio] = useState(0);
  const [totalCalificaciones, setTotalCalificaciones] = useState(0);
  const [puedeCalificar, setPuedeCalificar] = useState(false);
  const [yaCalifico, setYaCalifico] = useState(false);
  const [modalCalificacion, setModalCalificacion] = useState(false);
  const [nuevaCalificacion, setNuevaCalificacion] = useState({ estrellas: 5, comentario: '' });
  const [enviando, setEnviando] = useState(false);

  // Estados para modales
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, action: null, mensaje: '' });
  const [modalExito, setModalExito] = useState({ isOpen: false, mensaje: '', subMensaje: '' });
  const [modalError, setModalError] = useState({ isOpen: false, mensaje: '', detalle: '' });
  const [modalInfo, setModalInfo] = useState({ isOpen: false, titulo: '', mensaje: '' });

  // Configuración para touch swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && tieneMultiplesImagenes) {
      siguienteImagen();
    }
    if (isRightSwipe && tieneMultiplesImagenes) {
      anteriorImagen();
    }
  };

  useEffect(() => {
    cargarProducto();
    cargarCalificaciones();
    if (user) {
      verificarWishlist();
      verificarPuedeCalificar();
    }
  }, [id, user]);

  const cargarProducto = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/productos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProducto(data);
        setStockReal(data.stock || 0);
        setImagenActual(0);
        setCargandoImagen(true);
        
        if (data.stock < 1) {
          setCantidad(0);
        } else if (data.stock < cantidad) {
          setCantidad(data.stock);
        }
      } else {
        setModalError({
          isOpen: true,
          mensaje: "Producto no encontrado",
          detalle: "No se pudo cargar la información del producto"
        });
      }
    } catch (error) {
      console.error("Error cargando producto:", error);
      setModalError({
        isOpen: true,
        mensaje: "Error de conexión",
        detalle: error.message
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarCalificaciones = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/calificaciones/producto/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCalificaciones(data.calificaciones || []);
        setPromedio(data.promedio || 0);
        setTotalCalificaciones(data.total || 0);
      }
    } catch (error) {
      console.error("Error cargando calificaciones:", error);
    }
  };

  const verificarWishlist = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/deseos/usuario/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const existe = data.some(item => item.productoId === parseInt(id));
        setEnWishlist(existe);
      }
    } catch (error) {
      console.error("Error verificando wishlist:", error);
    }
  };

  const verificarPuedeCalificar = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:8080/api/calificaciones/verificar/${id}/usuario/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPuedeCalificar(data.puedeCalificar);
        setYaCalifico(data.yaCalifico);
      }
    } catch (error) {
      console.error("Error verificando calificación:", error);
    }
  };

  const enviarCalificacion = async () => {
    if (!nuevaCalificacion.comentario.trim()) {
      setModalInfo({
        isOpen: true,
        titulo: "Comentario requerido",
        mensaje: "Por favor escribe un comentario para tu calificación"
      });
      return;
    }

    setEnviando(true);
    try {
      const response = await fetch(`http://localhost:8080/api/calificaciones/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoId: parseInt(id),
          usuarioId: user.id,
          estrellas: nuevaCalificacion.estrellas,
          comentario: nuevaCalificacion.comentario
        })
      });

      if (response.ok) {
        setModalExito({
          isOpen: true,
          mensaje: "¡Gracias por calificar!",
          subMensaje: "Tu opinión es muy importante para nosotros"
        });
        setModalCalificacion(false);
        setNuevaCalificacion({ estrellas: 5, comentario: '' });
        cargarCalificaciones();
        verificarPuedeCalificar();
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: "Error al enviar calificación",
          detalle: error.error
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
      setEnviando(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      setModalInfo({
        isOpen: true,
        titulo: "Inicia sesión",
        mensaje: "Debes iniciar sesión para guardar productos en favoritos"
      });
      navigate('/login');
      return;
    }

    setProcesando(true);
    try {
      if (enWishlist) {
        await fetch(`http://localhost:8080/api/deseos/usuario/${user.id}/producto/${id}`, {
          method: 'DELETE'
        });
        setEnWishlist(false);
        setModalExito({
          isOpen: true,
          mensaje: "Producto eliminado",
          subMensaje: "Se eliminó de tu lista de deseos"
        });
      } else {
        await fetch(`http://localhost:8080/api/deseos/agregar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: user.id, productoId: parseInt(id) })
        });
        setEnWishlist(true);
        setModalExito({
          isOpen: true,
          mensaje: "¡Agregado a favoritos!",
          subMensaje: "Producto guardado en tu lista de deseos"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModalError({
        isOpen: true,
        mensaje: "Error al procesar",
        detalle: error.message
      });
    } finally {
      setProcesando(false);
    }
  };

  const aumentarCantidad = () => {
    if (producto && cantidad < stockReal) {
      setCantidad(cantidad + 1);
    } else if (producto && cantidad >= stockReal) {
      setModalInfo({
        isOpen: true,
        titulo: "Stock límite alcanzado",
        mensaje: `Solo hay ${stockReal} unidades disponibles de este producto.`
      });
    }
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const agregarAlCarrito = () => {
    if (!user) {
      setModalInfo({
        isOpen: true,
        titulo: "Inicia sesión",
        mensaje: "Debes iniciar sesión para agregar productos al carrito"
      });
      navigate('/login');
      return;
    }

    if (stockReal < cantidad) {
      setModalInfo({
        isOpen: true,
        titulo: "Stock insuficiente",
        mensaje: `Solo hay ${stockReal} unidades disponibles de este producto.`
      });
      return;
    }

    if (stockReal === 0) {
      setModalInfo({
        isOpen: true,
        titulo: "Producto agotado",
        mensaje: "Lo sentimos, este producto no tiene stock disponible."
      });
      return;
    }

    const carritoActual = JSON.parse(localStorage.getItem('wizzy_carrito') || '[]');
    const existe = carritoActual.find(item => item.productoId === producto.id);
    
    if (existe) {
      const nuevaCantidad = existe.cantidad + cantidad;
      if (nuevaCantidad > stockReal) {
        setModalInfo({
          isOpen: true,
          titulo: "Stock insuficiente",
          mensaje: `No puedes agregar más de ${stockReal} unidades en total. Ya tienes ${existe.cantidad} en el carrito.`
        });
        return;
      }
      const nuevoCarrito = carritoActual.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      );
      localStorage.setItem('wizzy_carrito', JSON.stringify(nuevoCarrito));
    } else {
      const nuevoItem = {
        productoId: producto.id,
        titulo: producto.titulo,
        precio: producto.precioPublico,
        cantidad: cantidad,
        imagen: producto.imagenesUrls?.[0] || 'https://images.unsplash.com/photo-1583394838336-acd977736f90'
      };
      carritoActual.push(nuevoItem);
      localStorage.setItem('wizzy_carrito', JSON.stringify(carritoActual));
    }
    
    setModalExito({
      isOpen: true,
      mensaje: "¡Agregado al carrito!",
      subMensaje: `${cantidad} x ${producto.titulo} ha sido agregado`
    });
    window.dispatchEvent(new Event('storage'));
  };

  // Funciones para el carrusel
  const imagenes = producto?.imagenesUrls || [];
  const tieneMultiplesImagenes = imagenes.length > 1;

  const siguienteImagen = () => {
    if (imagenes.length > 0) {
      setCargandoImagen(true);
      setImagenActual((prev) => (prev + 1) % imagenes.length);
    }
  };

  const anteriorImagen = () => {
    if (imagenes.length > 0) {
      setCargandoImagen(true);
      setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);
    }
  };

  const abrirModalImagen = (index) => {
    setImagenActual(index);
    setModalImagenAbierto(true);
  };

  const renderEstrellas = (valor, interactivo = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <button
            key={estrella}
            type="button"
            onClick={() => interactivo && onChange && onChange(estrella)}
            className={interactivo ? 'cursor-pointer hover:scale-110 transition active:scale-90' : ''}
          >
            <Star
              size={interactivo ? 28 : 16}
              className={`${estrella <= valor ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-purple-600 text-sm font-black uppercase tracking-wider">
          Cargando producto...
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Producto no encontrado</p>
        <Tooltip text="Volver a la tienda">
          <button onClick={() => navigate('/')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl active:scale-95">
            Volver a la tienda
          </button>
        </Tooltip>
      </div>
    );
  }

  const valorImpulso = Math.round(producto.precioPublico * 0.10);
  const mostrarBotonCalificar = puedeCalificar && !yaCalifico;
  const productoAgotado = stockReal === 0;
  const stockLimitado = stockReal > 0 && stockReal < 5;
  const esExperiencia = producto.esExperiencia === true;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
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

      {/* 🆕 Modal para comprar como regalo (solo experiencias) */}
      {esExperiencia && (
        <ComprarRegaloExperienciaModal
          isOpen={showModalRegalo}
          onClose={() => setShowModalRegalo(false)}
          experiencia={producto}
          usuarioId={user?.id}
          onCompraExitosa={() => {
            setModalExito({
              isOpen: true,
              mensaje: '¡Regalo comprado!',
              subMensaje: 'El código de regalo ha sido generado. Compártelo con el destinatario.'
            });
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-6">
        <Tooltip text="Volver a la tienda">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition mb-6 active:scale-95"
          >
            <ArrowLeft size={18} /> Volver a la tienda
          </button>
        </Tooltip>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* GALERÍA DE IMÁGENES CON CARRUSEL MEJORADO */}
          <div className="space-y-3">
            <div 
              ref={carruselRef}
              className="relative bg-white rounded-3xl overflow-hidden shadow-lg"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {cargandoImagen && (
                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                  <Loader2 size={32} className="animate-spin text-purple-600" />
                </div>
              )}
              
              {imagenes.length > 0 ? (
                <Tooltip text="Ver en pantalla completa">
                  <img
                    src={imagenes[imagenActual]}
                    alt={`${producto.titulo} - Imagen ${imagenActual + 1}`}
                    className={`w-full h-full object-cover aspect-square cursor-pointer hover:scale-105 transition-transform duration-300 ${cargandoImagen ? 'opacity-0' : 'opacity-100'}`}
                    onClick={() => abrirModalImagen(imagenActual)}
                    onLoad={() => setCargandoImagen(false)}
                  />
                </Tooltip>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1583394838336-acd977736f90"
                  alt={producto.titulo}
                  className="w-full h-full object-cover aspect-square"
                  onLoad={() => setCargandoImagen(false)}
                />
              )}
              
              {tieneMultiplesImagenes && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full">
                  {imagenActual + 1} / {imagenes.length}
                </div>
              )}
              
              {tieneMultiplesImagenes && (
                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[7px] font-black px-2 py-1 rounded-full md:hidden">
                  👆 Desliza
                </div>
              )}
            </div>

            {tieneMultiplesImagenes && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {imagenes.map((img, idx) => (
                  <Tooltip key={idx} text={`Ver imagen ${idx + 1}`}>
                    <button
                      onClick={() => {
                        setCargandoImagen(true);
                        setImagenActual(idx);
                      }}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === imagenActual ? 'border-purple-600 ring-2 ring-purple-200' : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  </Tooltip>
                ))}
              </div>
            )}

            {tieneMultiplesImagenes && (
              <>
                <Tooltip text="Imagen anterior">
                  <button
                    onClick={anteriorImagen}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 md:p-2 rounded-full shadow-lg hover:bg-white transition-all active:scale-90"
                    style={{ marginTop: '-80px' }}
                  >
                    <ChevronLeft size={18} className="md:w-5 md:h-5 text-slate-700" />
                  </button>
                </Tooltip>
                <Tooltip text="Siguiente imagen">
                  <button
                    onClick={siguienteImagen}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 md:p-2 rounded-full shadow-lg hover:bg-white transition-all active:scale-90"
                    style={{ marginTop: '-80px' }}
                  >
                    <ChevronRight size={18} className="md:w-5 md:h-5 text-slate-700" />
                  </button>
                </Tooltip>
              </>
            )}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter">
                {producto.titulo}
              </h1>
              <Tooltip text={enWishlist ? "Eliminar de favoritos" : "Agregar a favoritos"}>
                <button
                  onClick={toggleWishlist}
                  disabled={procesando}
                  className="p-2 bg-slate-100 rounded-full hover:bg-red-50 transition active:scale-90"
                >
                  <Heart size={24} className={enWishlist ? 'text-red-500 fill-red-500' : 'text-slate-400'} />
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-purple-600 bg-purple-100 px-2 py-1 rounded-full uppercase">
                {producto.categoria}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              {renderEstrellas(Math.round(promedio))}
              <span className="text-[10px] font-black text-slate-500">
                {promedio.toFixed(1)} ({totalCalificaciones} {totalCalificaciones === 1 ? 'calificación' : 'calificaciones'})
              </span>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-black text-purple-600">
                ${producto.precioPublico?.toLocaleString('es-CO')}
              </p>
              <p className="text-[10px] text-emerald-600 mt-1">
                ✨ Ganas +${valorImpulso.toLocaleString('es-CO')} de Impulso
              </p>
            </div>

            {productoAgotado ? (
              <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-600 p-2 rounded-xl">
                <AlertCircle size={14} />
                <span className="text-[9px] font-black uppercase">Producto agotado</span>
              </div>
            ) : stockLimitado ? (
              <div className="mt-3 flex items-center gap-2 bg-amber-50 text-amber-600 p-2 rounded-xl">
                <AlertCircle size={14} />
                <span className="text-[9px] font-black uppercase">¡Últimas {stockReal} unidades!</span>
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <Truck size={14} className="text-emerald-600" />
                <span className="font-black">Envío gratis en toda Colombia</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <ShieldCheck size={14} className="text-purple-600" />
                <span className="font-black">Compra segura • Wizzy garantiza</span>
              </div>
            </div>

            {producto.descripcion && (
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Descripción</p>
                <p className="text-[10px] text-slate-600 leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            <div className="mt-6">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <Tooltip text="Disminuir cantidad">
                  <button
                    onClick={disminuirCantidad}
                    disabled={productoAgotado}
                    className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-black hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                  >
                    <Minus size={14} />
                  </button>
                </Tooltip>
                <span className="text-xl font-black text-slate-800 w-12 text-center">{productoAgotado ? 0 : cantidad}</span>
                <Tooltip text="Aumentar cantidad">
                  <button
                    onClick={aumentarCantidad}
                    disabled={productoAgotado}
                    className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-black hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                  >
                    <Plus size={14} />
                  </button>
                </Tooltip>
                <span className="text-[9px] text-slate-400 ml-4">
                  Stock disponible: {stockReal} unidades
                </span>
              </div>
            </div>

            {/* 🆕 BOTONES DE COMPRA - Normal y Regalo */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Tooltip text={productoAgotado ? "Producto no disponible" : "Agregar al carrito"}>
                <button
                  onClick={agregarAlCarrito}
                  disabled={productoAgotado}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-[0.98] ${
                    productoAgotado 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <ShoppingBag size={16} /> 
                  {productoAgotado 
                    ? 'Producto agotado' 
                    : `Agregar al carrito • ${(producto.precioPublico * cantidad).toLocaleString('es-CO')}`
                  }
                </button>
              </Tooltip>

              {/* 🆕 Botón "Comprar como regalo" - SOLO para experiencias */}
              {esExperiencia && !productoAgotado && (
                <Tooltip text="Comprar esta experiencia como regalo para otra persona">
                  <button
                    onClick={() => setShowModalRegalo(true)}
                    className="flex-1 bg-amber-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-amber-600 transition flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Gift size={16} /> Comprar como regalo
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN DE CALIFICACIONES */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
              <Star size={20} className="text-amber-500" />
              Opiniones de clientes
            </h2>
            {mostrarBotonCalificar && (
              <Tooltip text="Calificar este producto">
                <button
                  onClick={() => setModalCalificacion(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition active:scale-95"
                >
                  Calificar este producto
                </button>
              </Tooltip>
            )}
            {yaCalifico && (
              <span className="text-[9px] text-emerald-600 font-black uppercase">✓ Ya calificaste este producto</span>
            )}
          </div>

          {calificaciones.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <MessageCircle size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Aún no hay opiniones para este producto
              </p>
              {mostrarBotonCalificar && (
                <Tooltip text="Sé el primero en calificar">
                  <button
                    onClick={() => setModalCalificacion(true)}
                    className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition active:scale-95"
                  >
                    Sé el primero en calificar
                  </button>
                </Tooltip>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {calificaciones.map((cal) => (
                <div key={cal.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderEstrellas(cal.estrellas)}
                        <span className="text-[9px] font-bold text-slate-500">({cal.estrellas})</span>
                      </div>
                      <p className="text-[9px] text-slate-600 font-bold">{cal.usuarioNombre}</p>
                      <p className="text-[8px] text-slate-400">{formatFecha(cal.fecha)}</p>
                    </div>
                  </div>
                  {cal.comentario && (
                    <p className="text-[10px] text-slate-700 mt-3 pt-3 border-t border-slate-50 leading-relaxed">
                      "{cal.comentario}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA VER IMAGEN EN GRANDE */}
      {modalImagenAbierto && imagenes.length > 0 && (
        <div className="fixed inset-0 z-[20000] bg-black/95 flex items-center justify-center p-2 md:p-4" onClick={() => setModalImagenAbierto(false)}>
          <Tooltip text="Cerrar">
            <button
              onClick={() => setModalImagenAbierto(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition active:scale-90"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </Tooltip>
          
          {tieneMultiplesImagenes && (
            <>
              <Tooltip text="Imagen anterior">
                <button
                  onClick={(e) => { e.stopPropagation(); anteriorImagen(); setCargandoImagen(true); }}
                  className="absolute left-2 md:left-4 text-white bg-white/20 p-2 md:p-3 rounded-full hover:bg-white/30 transition active:scale-90"
                >
                  <ChevronLeft size={20} className="md:w-7 md:h-7" />
                </button>
              </Tooltip>
              
              <Tooltip text="Siguiente imagen">
                <button
                  onClick={(e) => { e.stopPropagation(); siguienteImagen(); setCargandoImagen(true); }}
                  className="absolute right-2 md:right-4 text-white bg-white/20 p-2 md:p-3 rounded-full hover:bg-white/30 transition active:scale-90"
                >
                  <ChevronRight size={20} className="md:w-7 md:h-7" />
                </button>
              </Tooltip>
            </>
          )}
          
          {cargandoImagen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={40} className="animate-spin text-white" />
            </div>
          )}
          
          <img
            src={imagenes[imagenActual]}
            alt={`${producto.titulo} - Gran tamaño`}
            className={`max-w-full max-h-[90vh] object-contain ${cargandoImagen ? 'opacity-0' : 'opacity-100'}`}
            onClick={(e) => e.stopPropagation()}
            onLoad={() => setCargandoImagen(false)}
          />
          
          {tieneMultiplesImagenes && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] md:text-xs font-black px-3 md:px-4 py-1 md:py-2 rounded-full">
              {imagenActual + 1} / {imagenes.length}
            </div>
          )}
        </div>
      )}

      {/* MODAL PARA CALIFICAR */}
      {modalCalificacion && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalCalificacion(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 text-white rounded-t-3xl">
              <h3 className="text-lg font-black">Calificar producto</h3>
              <p className="text-[9px] opacity-80">{producto.titulo}</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="text-center">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Tu calificación
                </label>
                <div className="flex justify-center gap-2">
                  {renderEstrellas(nuevaCalificacion.estrellas, true, (valor) =>
                    setNuevaCalificacion({ ...nuevaCalificacion, estrellas: valor })
                  )}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Tu comentario
                </label>
                <textarea
                  rows="4"
                  value={nuevaCalificacion.comentario}
                  onChange={(e) => setNuevaCalificacion({ ...nuevaCalificacion, comentario: e.target.value })}
                  placeholder="Cuéntanos qué te pareció este producto..."
                  className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="flex gap-3">
                <Tooltip text="Cancelar calificación">
                  <button
                    onClick={() => setModalCalificacion(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[9px] uppercase hover:bg-slate-200 transition active:scale-95"
                  >
                    Cancelar
                  </button>
                </Tooltip>
                <Tooltip text="Enviar mi calificación">
                  <button
                    onClick={enviarCalificacion}
                    disabled={enviando}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-black text-[9px] uppercase hover:bg-purple-700 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    {enviando ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      'Enviar calificación'
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleProducto;