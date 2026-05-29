import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, Truck, CheckCircle, Clock, 
  X, MapPin, Calendar, Eye, ChevronRight,
  ShoppingBag, AlertCircle, Search, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ContentPedidosCliente = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);
  
  // Estados para calificación desde Mis Compras
  const [modalCalificacion, setModalCalificacion] = useState(false);
  const [productoACalificar, setProductoACalificar] = useState(null);
  const [calificacionEstrellas, setCalificacionEstrellas] = useState(5);
  const [calificacionComentario, setCalificacionComentario] = useState('');
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);

  useEffect(() => {
    cargarMisPedidos();
  }, []);

  const cargarMisPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = user?.id || localStorage.getItem('userId');
      console.log("Cargando pedidos para usuario:", userId);
      
      const response = await fetch(`http://localhost:8080/api/pedidos/cliente/${userId}`);
      console.log("Respuesta del servidor:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Datos recibidos:", data);
        
        if (Array.isArray(data) && data.length > 0) {
          const pedidosTransformados = data.map(pedido => ({
            id: pedido.id || pedido.numeroPedido,
            fecha: pedido.fechaPedido ? pedido.fechaPedido.split('T')[0] : new Date().toISOString().split('T')[0],
            total: pedido.totalPago || pedido.total || 0,
            estado: pedido.estado || 'PENDIENTE',
            items: pedido.cantidad || 1,
            tracking: pedido.numeroGuia || null,
            productoId: pedido.producto?.id,
            productos: pedido.producto ? [{
              id: pedido.producto.id,
              nombre: pedido.producto.titulo || 'Producto',
              cantidad: pedido.cantidad || 1,
              precio: pedido.producto.precioPublico || 0,
              imagen: pedido.producto.imagenesUrls?.[0] || 'https://images.unsplash.com/photo-1583394838336-acd977736f90'
            }] : [],
            direccion: pedido.direccionEnvio || 'Dirección no especificada',
            telefono: pedido.telefonoContacto || user?.telefono || '',
            metodoPago: pedido.metodoPago || 'No especificado',
            seguimiento: generarSeguimientoPorEstado(pedido.estado)
          }));
          setPedidos(pedidosTransformados);
        } else {
          console.log("No hay pedidos reales, usando datos de ejemplo");
          setPedidos(pedidosEjemplo);
        }
      } else {
        console.log("Error en respuesta, usando datos de ejemplo");
        setPedidos(pedidosEjemplo);
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setError(error.message);
      setPedidos(pedidosEjemplo);
    } finally {
      setLoading(false);
    }
  };

  // Enviar calificación desde Mis Compras
  const enviarCalificacionDesdePedido = async () => {
    if (!calificacionComentario.trim()) {
      alert("Por favor escribe un comentario");
      return;
    }

    setEnviandoCalificacion(true);
    try {
      const response = await fetch(`http://localhost:8080/api/calificaciones/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoId: productoACalificar.id,
          usuarioId: user?.id,
          estrellas: calificacionEstrellas,
          comentario: calificacionComentario
        })
      });

      if (response.ok) {
        alert("✅ ¡Gracias por calificar este producto!");
        setModalCalificacion(false);
        setProductoACalificar(null);
        setCalificacionEstrellas(5);
        setCalificacionComentario('');
      } else {
        const error = await response.json();
        alert(error.error || "Error al enviar calificación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setEnviandoCalificacion(false);
    }
  };

  const generarSeguimientoPorEstado = (estado) => {
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];
    
    const pasos = [
      { estado: "Pedido Confirmado", fecha: fechaStr, completado: true }
    ];
    
    if (estado === 'PENDIENTE') {
      pasos.push({ estado: "Preparando Paquete", fecha: null, completado: false });
      pasos.push({ estado: "En Camino", fecha: null, completado: false });
      pasos.push({ estado: "Entregado", fecha: null, completado: false });
    } else if (estado === 'ENVIADO') {
      pasos.push({ estado: "Preparando Paquete", fecha: fechaStr, completado: true });
      pasos.push({ estado: "En Camino", fecha: fechaStr, completado: true });
      pasos.push({ estado: "Entregado", fecha: null, completado: false });
    } else if (estado === 'ENTREGADO') {
      pasos.push({ estado: "Preparando Paquete", fecha: fechaStr, completado: true });
      pasos.push({ estado: "En Camino", fecha: fechaStr, completado: true });
      pasos.push({ estado: "Entregado", fecha: fechaStr, completado: true });
    } else {
      pasos.push({ estado: "Preparando Paquete", fecha: null, completado: false });
      pasos.push({ estado: "En Camino", fecha: null, completado: false });
      pasos.push({ estado: "Entregado", fecha: null, completado: false });
    }
    
    return pasos;
  };

  const pedidosEjemplo = [
    { 
      id: "ORD-7721", fecha: "2026-05-15", total: 155000, 
      estado: "ENTREGADO", items: 2, tracking: "WZ-123456789",
      productos: [
        { id: 1, nombre: "Camiseta Wizzy", cantidad: 1, precio: 52500, imagen: "https://images.unsplash.com/photo-1583394838336-acd977736f90" },
        { id: 2, nombre: "Gorra Pro", cantidad: 1, precio: 102500, imagen: "https://images.unsplash.com/photo-1583394838336-acd977736f90" }
      ],
      direccion: "Calle 10 #5-20, Cartagena",
      telefono: "3001234567",
      metodoPago: "Nequi",
      seguimiento: [
        { estado: "Pedido Confirmado", fecha: "2026-05-15 14:30", completado: true },
        { estado: "Preparando Paquete", fecha: "2026-05-16 09:00", completado: true },
        { estado: "En Camino", fecha: "2026-05-17 08:00", completado: true },
        { estado: "Entregado", fecha: "2026-05-18 11:30", completado: true }
      ]
    },
    { 
      id: "ORD-7725", fecha: "2026-05-20", total: 350000, 
      estado: "ENVIADO", items: 1, tracking: "WZ-987654321",
      productos: [
        { id: 3, nombre: "Tenis Wizzy Max", cantidad: 1, precio: 350000, imagen: "https://images.unsplash.com/photo-1583394838336-acd977736f90" }
      ],
      direccion: "Bocagrande Carrera 3 #8-12, Cartagena",
      telefono: "3109876543",
      metodoPago: "Bancolombia",
      seguimiento: [
        { estado: "Pedido Confirmado", fecha: "2026-05-20 10:15", completado: true },
        { estado: "Preparando Paquete", fecha: "2026-05-21 11:00", completado: true },
        { estado: "En Camino", fecha: "2026-05-22 07:30", completado: false },
        { estado: "Entregado", fecha: null, completado: false }
      ]
    },
    { 
      id: "ORD-7730", fecha: "2026-05-25", total: 89000, 
      estado: "PENDIENTE", items: 2, tracking: null,
      productos: [
        { id: 4, nombre: "Café Wizzy", cantidad: 2, precio: 25000, imagen: "https://images.unsplash.com/photo-1583394838336-acd977736f90" },
        { id: 5, nombre: "Termo Wizzy", cantidad: 1, precio: 39000, imagen: "https://images.unsplash.com/photo-1583394838336-acd977736f90" }
      ],
      direccion: "Castillo Grande, Cartagena",
      telefono: "3150001122",
      metodoPago: "Daviplata",
      seguimiento: [
        { estado: "Pedido Confirmado", fecha: "2026-05-25 16:20", completado: true },
        { estado: "Preparando Paquete", fecha: null, completado: false },
        { estado: "En Camino", fecha: null, completado: false },
        { estado: "Entregado", fecha: null, completado: false }
      ]
    }
  ];

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return { text: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'ENVIADO': return { text: 'En Camino', color: 'bg-blue-100 text-blue-700', icon: Truck };
      case 'ENTREGADO': return { text: 'Entregado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
      default: return { text: estado, color: 'bg-slate-100 text-slate-700', icon: Package };
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroEstado !== 'TODOS' && p.estado !== filtroEstado) return false;
    if (busqueda && !p.id.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalPedidos = pedidos.length;
  const pedidosEntregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;
  const pedidosEnCamino = pedidos.filter(p => p.estado === 'ENVIADO').length;
  const totalGastado = pedidos.reduce((sum, p) => sum + p.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-purple-600 text-sm font-black uppercase tracking-wider">
          Cargando tus compras...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Mis Compras
          </h2>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Historial de pedidos y seguimiento
          </p>
        </div>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar orden..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-[10px] font-bold w-40 md:w-56 outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-[8px] font-black text-slate-400 uppercase">Total</p>
          <p className="text-lg font-black text-purple-600">{totalPedidos}</p>
          <p className="text-[7px] text-slate-400">pedidos</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-[8px] font-black text-slate-400 uppercase">Entregados</p>
          <p className="text-lg font-black text-emerald-600">{pedidosEntregados}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-[8px] font-black text-slate-400 uppercase">En Camino</p>
          <p className="text-lg font-black text-blue-600">{pedidosEnCamino}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-[8px] font-black text-slate-400 uppercase">Gastado</p>
          <p className="text-sm font-black text-purple-600">{formatCOP(totalGastado)}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['TODOS', 'PENDIENTE', 'ENVIADO', 'ENTREGADO'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all whitespace-nowrap ${
              filtroEstado === estado 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-100 text-slate-500 hover:bg-purple-100'
            }`}
          >
            {estado === 'TODOS' ? 'Todos' : estado}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            No tienes compras realizadas aún
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition"
          >
            Ir a la tienda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => {
            const badge = getEstadoBadge(pedido.estado);
            const Icon = badge.icon;
            const productoPrincipal = pedido.productos?.[0];
            
            return (
              <div key={pedido.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="font-black text-purple-600 text-[11px] bg-purple-50 px-3 py-1 rounded-full">
                        #{pedido.id}
                      </span>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase ${badge.color}`}>
                        <Icon size={10} /> {badge.text}
                      </span>
                      {pedido.tracking && (
                        <span className="text-[8px] font-mono text-slate-400">Tracking: {pedido.tracking}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[9px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {formatFecha(pedido.fecha)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={10} /> {pedido.items} producto(s)
                      </span>
                    </div>
                    <p className="font-black text-slate-800 text-sm mt-2">
                      Total: {formatCOP(pedido.total)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPedidoSeleccionado(pedido)}
                      className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[8px] font-black uppercase hover:bg-purple-600 transition-all"
                    >
                      <Eye size={12} /> Ver Detalle
                    </button>
                  </div>
                </div>

                {/* 🆕 Botón de calificación en color MORADO */}
                {pedido.estado === 'ENTREGADO' && productoPrincipal && (
                  <button
                    onClick={() => {
                      setProductoACalificar({
                        id: productoPrincipal.id,
                        titulo: productoPrincipal.nombre,
                        pedidoId: pedido.id
                      });
                      setModalCalificacion(true);
                    }}
                    className="mt-3 w-full text-[8px] font-black bg-purple-600 text-white px-3 py-2 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Star size={12} /> Calificar este producto
                  </button>
                )}

                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="flex justify-between text-[7px] font-black text-slate-400 mb-1">
                    <span>Confirmado</span>
                    <span>Preparando</span>
                    <span>En Camino</span>
                    <span>Entregado</span>
                  </div>
                  <div className="flex gap-1">
                    {pedido.seguimiento?.map((step, idx) => (
                      <div key={idx} className={`flex-1 h-1 rounded-full ${step.completado ? 'bg-purple-600' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALLE PEDIDO */}
      {pedidoSeleccionado && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPedidoSeleccionado(null)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            <div className="sticky top-0 bg-white z-10 p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Orden</p>
                <p className="font-black text-slate-800 text-sm">#{pedidoSeleccionado.id}</p>
              </div>
              <button onClick={() => setPedidoSeleccionado(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Estado del pedido</p>
                  {pedidoSeleccionado.tracking && (
                    <p className="text-[8px] font-mono text-purple-600">Tracking: {pedidoSeleccionado.tracking}</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  {pedidoSeleccionado.seguimiento?.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completado ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step.completado ? <CheckCircle size={12} /> : <Clock size={12} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[10px] font-bold ${step.completado ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.estado}
                        </p>
                        {step.fecha && (
                          <p className="text-[8px] text-slate-400">{formatFecha(step.fecha)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShoppingBag size={12} /> Productos
                </h4>
                <div className="space-y-3">
                  {pedidoSeleccionado.productos?.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="font-black text-slate-800 text-[11px] uppercase">{prod.nombre}</p>
                        <p className="text-[8px] text-slate-400">Cantidad: {prod.cantidad}</p>
                      </div>
                      <p className="font-black text-slate-800 text-[11px]">{formatCOP(prod.precio)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-purple-600" />
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Dirección de envío</p>
                </div>
                <p className="text-[10px] text-slate-700">{pedidoSeleccionado.direccion}</p>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Teléfono de contacto</p>
                  <p className="text-[10px] font-bold text-slate-700">{pedidoSeleccionado.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Método de pago</p>
                  <p className="text-[10px] font-bold text-slate-700">{pedidoSeleccionado.metodoPago || 'No especificado'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Subtotal</span>
                  <span className="text-[11px] font-bold text-slate-700">{formatCOP(pedidoSeleccionado.total)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-slate-500">Envío</span>
                  <span className="text-[11px] font-bold text-emerald-600">Gratis</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-black text-slate-800 uppercase">Total</span>
                  <span className="text-lg font-black text-purple-600">{formatCOP(pedidoSeleccionado.total)}</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-3">
                <AlertCircle size={16} className="text-amber-600" />
                <p className="text-[8px] text-amber-700 flex-1">
                  ¿Problemas con tu pedido? Contáctanos al WhatsApp Wizzy
                </p>
                <button 
                  onClick={() => window.open(`https://wa.me/573000000000?text=Hola%20Wizzy%2C%20tengo%20un%20problema%20con%20mi%20pedido%20%23${pedidoSeleccionado.id}`, '_blank')}
                  className="text-[8px] font-black text-amber-700 uppercase hover:text-amber-800"
                >
                  Ayuda
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL CALIFICACIÓN DESDE MIS COMPRAS */}
      {modalCalificacion && productoACalificar && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalCalificacion(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 text-white rounded-t-3xl">
              <h3 className="text-lg font-black">Calificar producto</h3>
              <p className="text-[9px] opacity-80">{productoACalificar.titulo}</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="text-center">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Tu calificación
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <button
                      key={estrella}
                      type="button"
                      onClick={() => setCalificacionEstrellas(estrella)}
                      className="cursor-pointer hover:scale-110 transition"
                    >
                      <Star
                        size={32}
                        className={`${estrella <= calificacionEstrellas ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Tu comentario
                </label>
                <textarea
                  rows="4"
                  value={calificacionComentario}
                  onChange={(e) => setCalificacionComentario(e.target.value)}
                  placeholder="Cuéntanos qué te pareció este producto..."
                  className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalCalificacion(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[9px] uppercase hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarCalificacionDesdePedido}
                  disabled={enviandoCalificacion}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-black text-[9px] uppercase hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  {enviandoCalificacion ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    'Enviar calificación'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPedidosCliente;