import React, { useState, useEffect } from 'react';
import { Package, Truck, Wallet, TrendingUp, Bell, Search, HelpCircle, X, Camera, Plus } from 'lucide-react';

const DashboardProductos = () => {
  // --- ESTADOS ---
  const [productos, setProductos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para el nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagenUrl: ''
  });

  // --- LÓGICA DE DATOS ---
  
  // 1. Obtener productos del Backend
  const fetchProductos = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/productos');
      if (!response.ok) throw new Error("Error en la respuesta");
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // 2. Manejar el guardado del producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Aseguramos que precio y stock sean números para Spring Boot
    const productoAEnviar = {
      ...nuevoProducto,
      precio: parseFloat(nuevoProducto.precio),
      stock: parseInt(nuevoProducto.stock)
    };

    try {
      const response = await fetch('http://localhost:8080/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoAEnviar)
      });

      if (response.ok) {
        setIsModalOpen(false); // Cerramos el modal
        setNuevoProducto({ nombre: '', descripcion: '', precio: '', stock: '', imagenUrl: '' }); // Limpiamos
        await fetchProductos(); // Recargamos la lista
      } else {
        alert("Error al guardar el producto en el servidor.");
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="text-2xl font-black text-violet-700 italic tracking-tighter uppercase">Wizzy</div>
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-violet-50 text-violet-700 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
            <Package size={18} /> Inventario
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
            <Truck size={18} /> Pedidos
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
            <Wallet size={18} /> Billetera
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-slate-100 p-4 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-300" size={18} />
            <input type="text" placeholder="Buscar en inventario..." className="w-full bg-slate-100/50 border-none rounded-full py-2.5 pl-10 text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-all" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-violet-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg shadow-violet-200">LG</div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Fila superior: Billetera y Analítica */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Saldo por Liquidar</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">$1.240.500</h3>
              <button className="mt-6 w-full bg-slate-900 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 transition-all shadow-xl shadow-slate-200">Solicitar Retiro</button>
            </div>
            <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Rendimiento Mensual</p>
                <h3 className="text-2xl font-black text-slate-900">Crecimiento del <span className="text-emerald-500">+12%</span></h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Cartagena - Sector Tecnología</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-500">
                <TrendingUp size={40} />
              </div>
            </div>
          </div>

          {/* Inventario Pro */}
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Inventario Pro</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Gestiona tus productos en Wizzy</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-violet-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 flex items-center gap-2"
              >
                <Plus size={14} /> Nuevo Producto
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-5">Producto</th>
                    <th className="px-8 py-5 text-center">Precio</th>
                    <th className="px-8 py-5 text-center">Stock</th>
                    <th className="px-8 py-5 text-center">Estado</th>
                    <th className="px-8 py-5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productos.length > 0 ? productos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6 flex items-center gap-4">
                        <img src={prod.imagenUrl || 'https://via.placeholder.com/80'} alt={prod.nombre} className="w-14 h-14 rounded-2xl object-cover bg-slate-100 shadow-sm transition-transform group-hover:scale-105" />
                        <div>
                          <p className="font-black text-sm text-slate-800 uppercase tracking-tight">{prod.nombre}</p>
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-1 w-48">{prod.descripcion}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="font-black text-slate-900 text-sm">${prod.precio.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${prod.stock <= 5 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
                          {prod.stock} UNID {prod.stock <= 5 && '⚠️'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center">
                          <div className="w-10 h-5 bg-violet-600 rounded-full relative shadow-inner">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-violet-600 transition-colors">Editar</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Package size={48} />
                          <p className="text-xs font-black uppercase tracking-[0.2em]">No hay productos en estantería</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL DE CREACIÓN (Corregido para máxima visibilidad) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Overlay oscuro */}
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">Publicar en Wizzy</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Nuevo ítem de inventario</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-xl text-slate-400 hover:text-red-500 shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Comercial</label>
                <input required type="text" placeholder="Ej: Camisa Lino Blanca" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-100 transition-all placeholder:text-slate-300" 
                  value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción para el cliente</label>
                <textarea required rows="3" placeholder="Detalles, talla, material..." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-4 focus:ring-violet-100 transition-all resize-none placeholder:text-slate-300"
                  value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Precio Unitario ($)</label>
                  <input required type="number" placeholder="0.00" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black outline-none focus:ring-4 focus:ring-violet-100 transition-all"
                    value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Disponible</label>
                  <input required type="number" placeholder="Cant." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black outline-none focus:ring-4 focus:ring-violet-100 transition-all"
                    value={nuevoProducto.stock} onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enlace de Imagen (URL)</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Camera className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input type="text" placeholder="https://mi-imagen.jpg" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      value={nuevoProducto.imagenUrl} onChange={(e) => setNuevoProducto({...nuevoProducto, imagenUrl: e.target.value})} />
                  </div>
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 overflow-hidden">
                    {nuevoProducto.imagenUrl ? <img src={nuevoProducto.imagenUrl} className="w-full h-full object-cover" /> : <Package size={20} />}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-5 rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-violet-200 hover:bg-violet-700 active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:shadow-none mt-4">
                {loading ? 'Sincronizando con Servidor...' : 'Publicar Producto Ahora'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón de Soporte */}
      <button className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl hover:scale-110 hover:bg-violet-600 transition-all z-40">
        <HelpCircle size={24} />
      </button>
    </div>
  );
};

export default DashboardProductos;