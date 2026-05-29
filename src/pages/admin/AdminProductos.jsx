// pages/admin/AdminProductos.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, Search, Trash2, Eye, EyeOff,
  ChevronLeft, ChevronRight, Image as ImageIcon,
  DollarSign, Tag, Store, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { getProductos, eliminarProducto, toggleProductoActivo } from '../../services/adminApi';

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOcultar, setModalOcultar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [modalExito, setModalExito] = useState(null);
  const [modalError, setModalError] = useState(null);
  const itemsPerPage = 12;

  useEffect(() => {
    cargarProductos();
  }, [filtroTipo]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await getProductos(filtroTipo, search);
      setProductos(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error:', error);
      setModalError({ mensaje: 'Error al cargar productos', detalle: error.message });
      setTimeout(() => setModalError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    cargarProductos();
  };

  // 🆕 Ocultar/Publicar producto
  const handleToggleActivo = async (producto) => {
    try {
      await toggleProductoActivo(producto.id);
      await cargarProductos();
      setModalOcultar(null);
      setModalExito({ 
        mensaje: producto.activo ? 'Producto ocultado' : 'Producto publicado',
        detalle: `${producto.titulo} ahora está ${producto.activo ? 'oculto' : 'visible'} en la tienda`
      });
      setTimeout(() => setModalExito(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setModalError({ mensaje: 'Error al cambiar estado', detalle: error.message });
      setTimeout(() => setModalError(null), 3000);
    }
  };

  // 🆕 Eliminar producto (con manejo de errores)
  const handleEliminar = async (producto) => {
    try {
      await eliminarProducto(producto.id);
      await cargarProductos();
      setModalEliminar(null);
      setModalExito({ 
        mensaje: 'Producto eliminado', 
        detalle: `${producto.titulo} ha sido eliminado permanentemente`
      });
      setTimeout(() => setModalExito(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      // Si tiene pedidos asociados, mostrar mensaje claro
      if (error.message && error.message.includes('foreign key')) {
        setModalError({ 
          mensaje: 'No se puede eliminar', 
          detalle: 'Este producto tiene pedidos asociados. Solo puede ocultarlo.' 
        });
      } else {
        setModalError({ mensaje: 'Error al eliminar', detalle: error.message });
      }
      setModalEliminar(null);
      setTimeout(() => setModalError(null), 3000);
    }
  };

  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const paginatedProductos = productos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Modales de notificación */}
      {modalExito && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-600" />
            <div>
              <p className="text-[10px] font-black text-emerald-700">{modalExito.mensaje}</p>
              <p className="text-[8px] text-emerald-600">{modalExito.detalle}</p>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <AlertCircle size={18} className="text-red-600" />
            <div>
              <p className="text-[10px] font-black text-red-700">{modalError.mensaje}</p>
              <p className="text-[8px] text-red-600">{modalError.detalle}</p>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Modal para confirmar OCULTAR/PUBLICAR */}
      {modalOcultar && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOcultar(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className={`bg-gradient-to-r p-5 rounded-t-2xl ${modalOcultar.activo ? 'from-amber-600 to-amber-700' : 'from-emerald-600 to-emerald-700'}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-white font-black text-sm uppercase">
                  {modalOcultar.activo ? 'Ocultar producto' : 'Publicar producto'}
                </h3>
                <button onClick={() => setModalOcultar(null)} className="text-white/80">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${modalOcultar.activo ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  {modalOcultar.activo ? <EyeOff size={22} className="text-amber-600" /> : <Eye size={22} className="text-emerald-600" />}
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-800">{modalOcultar.titulo}</p>
                  <p className="text-[8px] text-slate-500">Esta acción se puede revertir</p>
                </div>
              </div>
              <p className="text-[9px] text-slate-600 mb-6">
                ¿Estás seguro de {modalOcultar.activo ? 'ocultar' : 'publicar'} 
                <span className={`font-black ${modalOcultar.activo ? 'text-amber-600' : 'text-emerald-600'}`}> "{modalOcultar.titulo}"</span>?
                {modalOcultar.activo ? ' El producto no será visible en la tienda.' : ' El producto será visible para los clientes.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOcultar(null)}
                  className="flex-1 py-3 bg-slate-100 rounded-xl text-[9px] font-black text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleToggleActivo(modalOcultar)}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition text-white ${modalOcultar.activo ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {modalOcultar.activo ? 'Ocultar' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Modal para confirmar ELIMINAR */}
      {modalEliminar && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalEliminar(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-black text-sm uppercase">Confirmar eliminación</h3>
                <button onClick={() => setModalEliminar(null)} className="text-white/80">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={22} className="text-red-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-800">{modalEliminar.titulo}</p>
                  <p className="text-[8px] text-slate-500">Esta acción NO se puede deshacer</p>
                </div>
              </div>
              <p className="text-[9px] text-slate-600 mb-6">
                ¿Estás seguro de eliminar <span className="font-black text-red-600">"{modalEliminar.titulo}"</span>?
                {modalEliminar.esExperiencia ? ' Esta experiencia será eliminada permanentemente.' : ' Este producto será eliminado permanentemente.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalEliminar(null)}
                  className="flex-1 py-3 bg-slate-100 rounded-xl text-[9px] font-black text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEliminar(modalEliminar)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Gestión de Productos
          </h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            Administra todos los productos y experiencias de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 rounded-full px-4 py-2">
            <p className="text-[9px] font-black text-purple-700">
              Total: {productos.length} {filtroTipo === 'EXPERIENCIAS' ? 'experiencias' : 'productos'}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="TODOS">Todos</option>
              <option value="PRODUCTOS">📦 Productos</option>
              <option value="EXPERIENCIAS">✨ Experiencias</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent"></div>
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-slate-100">
          <Package size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-[10px] text-slate-400">No se encontraron productos</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedProductos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Imagen */}
                <div className="relative h-40 bg-slate-100">
                  {producto.imagenPrincipal ? (
                    <img
                      src={producto.imagenPrincipal.startsWith('http') ? producto.imagenPrincipal : `http://localhost:8080/uploads/${producto.imagenPrincipal}`}
                      alt={producto.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Sin+imagen'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-300" />
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                    producto.activo
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase bg-white/90 text-slate-700">
                    {producto.esExperiencia ? '✨ Experiencia' : '📦 Producto'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-[11px] font-black text-slate-800 line-clamp-2 mb-2">
                    {producto.titulo}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={10} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase">{producto.categoria || 'Sin categoría'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Store size={10} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-500 truncate">{producto.nombreVendedor}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-purple-600" />
                      <span className="text-[11px] font-black text-purple-600">
                        ${producto.precioPublico?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[8px] font-bold text-slate-400">
                      Stock: {producto.stock || 0}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* 🆕 Botón Ocultar/Publicar - Abre modal de confirmación */}
                    <button
                      onClick={() => setModalOcultar(producto)}
                      className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase transition flex items-center justify-center gap-1 ${
                        producto.activo
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {producto.activo ? <EyeOff size={10} /> : <Eye size={10} />}
                      {producto.activo ? 'Ocultar' : 'Publicar'}
                    </button>
                    {/* 🆕 Botón Eliminar - Abre modal de confirmación */}
                    <button
                      onClick={() => setModalEliminar(producto)}
                      className="flex-1 py-2 bg-red-100 text-red-700 rounded-xl text-[8px] font-black uppercase transition hover:bg-red-200 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={10} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white rounded-xl border border-slate-100 disabled:opacity-50 hover:bg-slate-50 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-4 py-1 text-[9px] font-bold text-purple-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white rounded-xl border border-slate-100 disabled:opacity-50 hover:bg-slate-50 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProductos;