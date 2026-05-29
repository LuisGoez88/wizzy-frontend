import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, Truck, CheckCircle, Clock, 
  ChevronRight, Search, Filter, X, 
  MapPin, User, Smartphone, Box, ExternalLink
} from 'lucide-react';

const ContentPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  
  const VENDEDOR_ID = localStorage.getItem('userId') || 1;

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/vendedor/${VENDEDOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      } else {
        // Datos Mock robustos para desarrollo y consistencia visual
        setPedidos([
          { 
            id: "ORD-7721", cliente: "Juan Perez", fecha: "2024-05-15", total: 155000, 
            estado: "PENDIENTE", items: 2, telefono: "3001234567", direccion: "Calle 10 #5-20, Cartagena",
            productos: [{nombre: "Camiseta Wizzy", cant: 1, precio: 52500}, {nombre: "Gorra Pro", cant: 1, precio: 102500}]
          },
          { 
            id: "ORD-7722", cliente: "Maria Lopez", fecha: "2024-05-14", total: 85000, 
            estado: "ENVIADO", items: 1, telefono: "3109876543", direccion: "Av. Santander Edf. Mar",
            productos: [{nombre: "Bolso Urbano", cant: 1, precio: 85000}]
          },
          { 
            id: "ORD-7723", cliente: "Carlos Ruiz", fecha: "2024-05-14", total: 420000, 
            estado: "ENTREGADO", items: 3, telefono: "3150001122", direccion: "Bocagrande Carrera 3",
            productos: [{nombre: "Tenis Wizzy Max", cant: 2, precio: 210000}]
          },
        ]);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (response.ok) {
        setPedidoSeleccionado(null);
        cargarPedidos();
      }
    } catch (error) { 
      // Fallback local para UI fluida
      setPedidos(prev => prev.map(p => p.id === pedidoId ? {...p, estado: nuevoEstado} : p));
      setPedidoSeleccionado(null);
    }
  };

  const getStatusStyle = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ENVIADO': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'ENTREGADO': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const pedidosFiltrados = pedidos.filter(p => 
  String(p.id).toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
  p.cliente.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Centro de Despachos</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Control logístico y seguimiento de ventas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={16} />
            <input 
              type="text" 
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              placeholder="BUSCAR ORDEN O CLIENTE..." 
              className="bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-violet-50 w-72 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* TABLA DE ÓRDENES */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
              <tr>
                <th className="px-8 py-6">Referencia</th>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Estado</th>
                <th className="px-8 py-6">Total Venta</th>
                <th className="px-8 py-6 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-black text-violet-600 text-[11px] bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100">#{pedido.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 uppercase text-[11px]">{pedido.cliente}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{pedido.fecha}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${getStatusStyle(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-800 text-[11px]">
                    ${pedido.total.toLocaleString('es-CO')}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-violet-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                      >
                        Gestionar <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pedidosFiltrados.length === 0 && (
            <div className="p-24 text-center">
              <Clock className="mx-auto text-slate-100 mb-4 animate-pulse" size={64} />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No se encontraron registros</p>
            </div>
          )}
        </div>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-violet-600 p-8 rounded-[40px] text-white shadow-xl shadow-violet-100 group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest mb-1">Pendientes de Envío</p>
            <h4 className="text-3xl font-black italic uppercase tracking-tighter">
              {pedidos.filter(p => p.estado === 'PENDIENTE').length.toString().padStart(2, '0')}
            </h4>
          </div>
          <Truck size={60} className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">En Tránsito</p>
            <h4 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
              {pedidos.filter(p => p.estado === 'ENVIADO').length}
            </h4>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle size={28} />
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-center shadow-xl shadow-slate-200 border-b-4 border-violet-500">
          <p className="text-[9px] font-black uppercase opacity-60 tracking-widest mb-1">Ventas Totales</p>
          <h4 className="text-2xl font-black italic uppercase tracking-tighter">
            ${pedidos.reduce((acc, p) => acc + p.total, 0).toLocaleString('es-CO')}
          </h4>
        </div>
      </div>

      {/* DETALLE DEL PEDIDO (PORTAL) */}
      {pedidoSeleccionado && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setPedidoSeleccionado(null)} />
          <div className="relative bg-white w-full max-w-3xl rounded-[40px] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-4">
                <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full italic shadow-lg">#{pedidoSeleccionado.id}</span>
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] italic">Hoja de Ruta / Cliente</h3>
              </div>
              <button onClick={() => setPedidoSeleccionado(null)} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-red-500 hover:rotate-90 transition-all"><X size={20} /></button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-5">Destinatario</h5>
                  <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-4 text-slate-700">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-violet-600"><User size={18} /></div>
                      <span className="text-xs font-black uppercase truncate">{pedidoSeleccionado.cliente}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-700">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-violet-600"><Smartphone size={18} /></div>
                      <span className="text-xs font-black">{pedidoSeleccionado.telefono}</span>
                    </div>
                    <div className="flex items-start gap-4 text-slate-700">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-violet-600 flex-shrink-0"><MapPin size={18} /></div>
                      <span className="text-xs font-black uppercase leading-relaxed">{pedidoSeleccionado.direccion}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Actualizar Logística</h5>
                  <div className="flex gap-3">
                    {pedidoSeleccionado.estado === 'PENDIENTE' && (
                      <button 
                        onClick={() => actualizarEstado(pedidoSeleccionado.id, 'ENVIADO')}
                        className="flex-1 bg-violet-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-900 transition-all shadow-lg shadow-violet-100 flex items-center justify-center gap-2"
                      >
                        <Truck size={14} /> Despachar Ahora
                      </button>
                    )}
                    {pedidoSeleccionado.estado === 'ENVIADO' && (
                      <button 
                        onClick={() => actualizarEstado(pedidoSeleccionado.id, 'ENTREGADO')}
                        className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14} /> Confirmar Entrega
                      </button>
                    )}
                    <button className="bg-slate-100 text-slate-400 p-4 rounded-2xl hover:bg-slate-200 transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-5">Resumen de Compra</h5>
                <div className="bg-slate-900 rounded-[35px] p-8 flex-1 text-white relative overflow-hidden group">
                  <div className="relative z-10 space-y-4">
                    {pedidoSeleccionado.productos?.map((prod, idx) => (
                      <div key={idx} className="flex justify-between items-start border-b border-white/10 pb-4 last:border-0">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-violet-400">{prod.nombre}</span>
                          <span className="text-[9px] font-bold opacity-60 uppercase">CANT: {prod.cant}</span>
                        </div>
                        <span className="text-[11px] font-black italic">${prod.precio.toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-8 border-t border-white/20 relative z-10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black uppercase opacity-40">Subtotal</span>
                      <span className="text-[11px] font-bold opacity-60">${(pedidoSeleccionado.total * 0.9).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black uppercase opacity-40">Envío Wizzy</span>
                      <span className="text-[11px] font-bold text-emerald-400">GRATIS</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase italic tracking-widest text-violet-400">Total Neto</span>
                      <span className="text-2xl font-black italic">${pedidoSeleccionado.total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                  <Package className="absolute -left-10 -bottom-10 text-white/5 rotate-12" size={200} />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ContentPedidos;