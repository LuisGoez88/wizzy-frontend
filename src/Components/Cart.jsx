import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, X, Plus, Minus, Trash2, 
  CreditCard, Truck, MapPinned, Phone, Building2,
  ChevronRight, AlertCircle, ShieldCheck
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

const Cart = ({ isOpen, onClose, cartItems, onUpdateCart, onCheckout }) => {
  const { user } = useAuth();
  const [datosEnvio, setDatosEnvio] = useState({
    direccion: '',
    ciudad: 'Cartagena',
    telefono: '',
    metodoPago: 'nequi',
    notas: ''
  });
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState({});
  
  // Estados para modales
  const [modalConfirmacion, setModalConfirmacion] = useState({ isOpen: false, itemId: null });
  const [modalExito, setModalExito] = useState({ isOpen: false, mensaje: '', subMensaje: '' });
  const [modalError, setModalError] = useState({ isOpen: false, mensaje: '', detalle: '' });
  const [modalInfo, setModalInfo] = useState({ isOpen: false, titulo: '', mensaje: '' });

  const ciudades = ['Cartagena', 'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Santa Marta', 'Otra'];
  const metodosPago = [
    { id: 'nequi', nombre: 'Nequi', icono: '📱' },
    { id: 'daviplata', nombre: 'Daviplata', icono: '💳' },
    { id: 'bancolombia', nombre: 'Bancolombia', icono: '🏦' },
    { id: 'efecty', nombre: 'Efecty', icono: '💰' }
  ];

  // Cargar stock de los productos en el carrito
  useEffect(() => {
    const cargarStocks = async () => {
      const stocks = {};
      for (const item of cartItems) {
        try {
          const response = await fetch(`http://localhost:8080/api/productos/${item.productoId}`);
          if (response.ok) {
            const producto = await response.json();
            stocks[item.productoId] = producto.stock;
          }
        } catch (error) {
          console.error("Error cargando stock:", error);
        }
      }
      setStockInfo(stocks);
    };
    if (cartItems.length > 0) {
      cargarStocks();
    }
  }, [cartItems]);

  useEffect(() => {
    if (user) {
      setDatosEnvio(prev => ({
        ...prev,
        direccion: user?.direccionResidencia || '',
        telefono: user?.telefono || ''
      }));
    }
  }, [user]);

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const stockDisponible = stockInfo[productoId];
    if (stockDisponible !== undefined && nuevaCantidad > stockDisponible) {
      setModalInfo({
        isOpen: true,
        titulo: 'Stock insuficiente',
        mensaje: `Solo tenemos ${stockDisponible} unidades disponibles de este producto.`
      });
      return;
    }
    
    const nuevosItems = cartItems.map(item =>
      item.productoId === productoId ? { ...item, cantidad: nuevaCantidad } : item
    );
    onUpdateCart(nuevosItems);
  };

  const eliminarProducto = (productoId) => {
    setModalConfirmacion({
      isOpen: true,
      itemId: productoId,
      titulo: 'Eliminar producto',
      mensaje: '¿Estás seguro de eliminar este producto del carrito?'
    });
  };

  const confirmarEliminar = () => {
    const nuevosItems = cartItems.filter(item => item.productoId !== modalConfirmacion.itemId);
    onUpdateCart(nuevosItems);
    setModalConfirmacion({ isOpen: false, itemId: null });
    setModalExito({
      isOpen: true,
      mensaje: 'Producto eliminado',
      subMensaje: 'El producto fue retirado de tu carrito'
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const total = subtotal;

  const handleCheckout = async () => {
    if (!user) {
      setModalInfo({
        isOpen: true,
        titulo: 'Inicia sesión',
        mensaje: 'Debes iniciar sesión para continuar con tu compra'
      });
      onClose();
      return;
    }

    if (cartItems.length === 0) {
      setModalInfo({
        isOpen: true,
        titulo: 'Carrito vacío',
        mensaje: 'Agrega productos a tu carrito antes de continuar'
      });
      return;
    }

    let hayStockInsuficiente = false;
    for (const item of cartItems) {
      const stockDisponible = stockInfo[item.productoId];
      if (stockDisponible !== undefined && item.cantidad > stockDisponible) {
        hayStockInsuficiente = true;
        setModalInfo({
          isOpen: true,
          titulo: 'Stock insuficiente',
          mensaje: `El producto "${item.titulo}" tiene stock insuficiente. Disponible: ${stockDisponible} unidades.`
        });
        break;
      }
    }
    
    if (!hayStockInsuficiente) {
      setCheckoutMode(true);
    }
  };

  const volverAlCarrito = () => {
    setCheckoutMode(false);
  };

  const confirmarCompra = async () => {
    if (!datosEnvio.direccion.trim()) {
      setModalInfo({
        isOpen: true,
        titulo: 'Dirección requerida',
        mensaje: 'Por favor ingresa tu dirección de envío'
      });
      return;
    }
    if (!datosEnvio.telefono.trim()) {
      setModalInfo({
        isOpen: true,
        titulo: 'Teléfono requerido',
        mensaje: 'Por favor ingresa tu número de teléfono de contacto'
      });
      return;
    }

    setLoading(true);

    try {
      let pedidosExitosos = 0;
      let errores = [];

      for (const item of cartItems) {
        const stockResponse = await fetch(`http://localhost:8080/api/productos/${item.productoId}`);
        if (stockResponse.ok) {
          const producto = await stockResponse.json();
          if (producto.stock < item.cantidad) {
            errores.push(`${item.titulo}: Stock insuficiente (disponible: ${producto.stock})`);
            continue;
          }
        }
        
        const response = await fetch(`http://localhost:8080/api/productos/${item.productoId}/comprar?cantidad=${item.cantidad}&clienteId=${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          pedidosExitosos++;
        } else {
          const error = await response.text();
          errores.push(`${item.titulo}: ${error}`);
        }
      }

      if (pedidosExitosos > 0) {
        setModalExito({
          isOpen: true,
          mensaje: '¡Compra exitosa!',
          subMensaje: `Se procesaron ${pedidosExitosos} producto(s) correctamente`
        });
        onUpdateCart([]);
        setCheckoutMode(false);
        if (onCheckout) onCheckout();
      } else {
        setModalError({
          isOpen: true,
          mensaje: 'Error en la compra',
          detalle: errores.join(", ")
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModalError({
        isOpen: true,
        mensaje: 'Error de conexión',
        detalle: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <ModalConfirmacion
        isOpen={modalConfirmacion.isOpen}
        onClose={() => setModalConfirmacion({ isOpen: false, itemId: null })}
        onConfirm={confirmarEliminar}
        titulo="Eliminar producto"
        mensaje={modalConfirmacion.mensaje || "¿Estás seguro de eliminar este producto del carrito?"}
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

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in duration-300 flex flex-col">
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 text-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider opacity-80">
                {checkoutMode ? 'Checkout' : 'Mi Carrito'}
              </p>
              <h3 className="text-lg font-black mt-1">
                {checkoutMode ? 'Completar compra' : `${cartItems.length} producto(s)`}
              </h3>
            </div>
            <Tooltip text="Cerrar carrito">
              <button onClick={onClose} className="text-white/80 hover:text-white active:scale-90">
                <X size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!checkoutMode ? (
            cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={64} className="mx-auto text-slate-300 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Tu carrito está vacío
                </p>
                <Tooltip text="Volver a la tienda">
                  <button
                    onClick={onClose}
                    className="mt-6 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition active:scale-95"
                  >
                    Seguir comprando
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const stockDisponible = stockInfo[item.productoId];
                  const stockInsuficiente = stockDisponible !== undefined && item.cantidad > stockDisponible;
                  
                  return (
                    <div key={item.productoId} className={`flex gap-3 pb-4 border-b ${stockInsuficiente ? 'border-red-200 bg-red-50/30 p-2 rounded-xl' : 'border-slate-100'}`}>
                      <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.imagen} alt={item.titulo} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-tighter">{item.titulo}</h4>
                        <p className="text-[10px] font-bold text-purple-600 mt-1">{item.precio.toLocaleString('es-CO')}</p>
                        {stockInsuficiente && (
                          <p className="text-[8px] font-black text-red-500 mt-1">
                            ⚠️ Stock insuficiente (disponible: {stockDisponible})
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg">
                            <Tooltip text="Disminuir cantidad">
                              <button
                                onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-purple-100 rounded-lg transition active:scale-90"
                              >
                                <Minus size={10} />
                              </button>
                            </Tooltip>
                            <span className={`text-[10px] font-black w-6 text-center ${stockInsuficiente ? 'text-red-500' : ''}`}>
                              {item.cantidad}
                            </span>
                            <Tooltip text="Aumentar cantidad">
                              <button
                                onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-purple-100 rounded-lg transition active:scale-90"
                              >
                                <Plus size={10} />
                              </button>
                            </Tooltip>
                          </div>
                          <Tooltip text="Eliminar producto">
                            <button
                              onClick={() => eliminarProducto(item.productoId)}
                              className="text-slate-400 hover:text-red-500 transition active:scale-90"
                            >
                              <Trash2 size={14} />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-[11px] ${stockInsuficiente ? 'text-red-500' : 'text-slate-800'}`}>
                          ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-slate-50 rounded-2xl p-4 mt-4">
                  <div className="flex justify-between text-[10px] mb-2">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold">${subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] mb-2">
                    <span className="text-slate-500">Envío</span>
                    <span className="font-bold text-emerald-600">Gratis</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                    <span className="font-black text-slate-800 text-sm">Total</span>
                    <span className="font-black text-purple-600 text-lg">${total.toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[8px] text-slate-400">
                  <ShieldCheck size={10} className="text-emerald-500" />
                  <span>Pago 100% seguro</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span>Datos encriptados</span>
                </div>

                <Tooltip text="Proceder al pago y finalizar compra">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-purple-700 transition flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <CreditCard size={14} /> Proceder al pago
                  </button>
                </Tooltip>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <Tooltip text="Volver al carrito">
                <button
                  onClick={volverAlCarrito}
                  className="flex items-center gap-1 text-[9px] font-black text-purple-600 mb-2 hover:gap-2 transition-all"
                >
                  <ChevronRight size={12} className="rotate-180" /> Volver al carrito
                </button>
              </Tooltip>

              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                  <MapPinned size={10} /> Dirección de envío *
                </label>
                <Tooltip text="Ingresa tu dirección completa">
                  <input
                    type="text"
                    value={datosEnvio.direccion}
                    onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                    placeholder="Calle, número, barrio"
                    className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </Tooltip>
              </div>

              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                  <Building2 size={10} /> Ciudad
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
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                  <Phone size={10} /> Teléfono de contacto *
                </label>
                <Tooltip text="Número de contacto para el envío">
                  <input
                    type="tel"
                    value={datosEnvio.telefono}
                    onChange={(e) => setDatosEnvio({ ...datosEnvio, telefono: e.target.value })}
                    placeholder="Ej: 3001234567"
                    className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </Tooltip>
              </div>

              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                  <CreditCard size={10} /> Método de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {metodosPago.map(mp => (
                    <Tooltip key={mp.id} text={`Pagar con ${mp.nombre}`}>
                      <button
                        type="button"
                        onClick={() => setDatosEnvio({ ...datosEnvio, metodoPago: mp.id })}
                        className={`p-2.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                          datosEnvio.metodoPago === mp.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
                        }`}
                      >
                        <span>{mp.icono}</span> {mp.nombre}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  rows="2"
                  value={datosEnvio.notas}
                  onChange={(e) => setDatosEnvio({ ...datosEnvio, notas: e.target.value })}
                  placeholder="Ej: Entregar en horario de 9am a 6pm..."
                  className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold">${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Envío</span>
                  <span className="font-bold text-emerald-600">Gratis</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                  <span className="font-black text-slate-800 text-sm">Total</span>
                  <span className="font-black text-purple-600 text-lg">${total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-2.5 flex items-center gap-2">
                <Truck size={12} className="text-amber-600" />
                <p className="text-[7px] text-amber-700 font-black uppercase">Envío gratis • 3-5 días hábiles</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[8px] text-slate-400">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span>Pago seguro con Wizzy Protect</span>
              </div>

              <Tooltip text="Confirmar compra y realizar pago">
                <button
                  onClick={confirmarCompra}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-purple-700 transition flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <CreditCard size={12} /> Confirmar compra (${total.toLocaleString('es-CO')})
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Cart;