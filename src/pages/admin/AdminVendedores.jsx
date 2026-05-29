// pages/admin/AdminVendedores.jsx
import React, { useState, useEffect } from 'react';
import {
  Store, UserCheck, UserX, Eye, Phone, Mail, MapPin,
  Building2, FileText, CheckCircle, XCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getVendedoresPendientes, aprobarVendedor, rechazarVendedor } from '../../services/adminApi';

const AdminVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalRechazo, setModalRechazo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    cargarVendedores();
  }, []);

  const cargarVendedores = async () => {
    setLoading(true);
    try {
      const data = await getVendedoresPendientes();
      setVendedores(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (vendedor) => {
    if (!window.confirm(`¿Aprobar a ${vendedor.nombre} como vendedor?`)) return;
    try {
      await aprobarVendedor(vendedor.id);
      await cargarVendedores();
      setModalDetalle(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRechazar = async (vendedor, motivo) => {
    try {
      await rechazarVendedor(vendedor.id, motivo);
      await cargarVendedores();
      setModalRechazo(null);
      setModalDetalle(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredVendedores = vendedores.filter(v =>
    v.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.nombreNegocio?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVendedores.length / itemsPerPage);
  const paginatedVendedores = filteredVendedores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Solicitudes de Vendedores
          </h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            Revisa y aprueba nuevos vendedores en la plataforma
          </p>
        </div>
        <div className="bg-amber-100 rounded-full px-4 py-2">
          <p className="text-[9px] font-black text-amber-700">
            Pendientes: {vendedores.length}
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o negocio..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      {/* Lista de vendedores */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent"></div>
        </div>
      ) : filteredVendedores.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-slate-100">
          <Store size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-[10px] text-slate-400">No hay solicitudes de vendedores pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedVendedores.map((vendedor) => (
            <div
              key={vendedor.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className={`p-4 ${
                vendedor.tipoVendedor === 'PRODUCTOS' ? 'bg-purple-50' : 'bg-emerald-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Store size={22} className={vendedor.tipoVendedor === 'PRODUCTOS' ? 'text-purple-600' : 'text-emerald-600'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-slate-800">{vendedor.nombreNegocio || vendedor.nombre}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                      {vendedor.tipoVendedor === 'PRODUCTOS' ? 'Vendedor de Productos' : 'Vendedor de Experiencias'}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalDetalle(vendedor)}
                    className="px-3 py-2 bg-white rounded-xl text-[8px] font-black text-purple-600 hover:bg-purple-100 transition"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-[9px] text-slate-600">
                  <UserCheck size={12} className="text-slate-400" />
                  <span className="font-bold">{vendedor.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-600">
                  <Mail size={12} className="text-slate-400" />
                  <span>{vendedor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-600">
                  <Phone size={12} className="text-slate-400" />
                  <span>{vendedor.whatsapp}</span>
                </div>
              </div>
              
              <div className="flex border-t border-slate-100">
                <button
                  onClick={() => handleAprobar(vendedor)}
                  className="flex-1 py-3 text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={12} /> Aprobar
                </button>
                <button
                  onClick={() => setModalRechazo(vendedor)}
                  className="flex-1 py-3 text-[9px] font-black uppercase text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={12} /> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-white rounded-xl border border-slate-100 disabled:opacity-50"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-4 py-1 text-[9px] font-bold text-purple-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-white rounded-xl border border-slate-100 disabled:opacity-50"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      {modalDetalle && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalDetalle(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-black text-sm uppercase">Detalles del Vendedor</h3>
                <button onClick={() => setModalDetalle(null)} className="text-white/80">
                  <XCircle size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 size={22} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-800">{modalDetalle.nombreNegocio || 'Sin negocio'}</p>
                  <p className="text-[8px] text-slate-400">{modalDetalle.tipoVendedor === 'PRODUCTOS' ? 'Productos' : 'Experiencias'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Nombre completo</p>
                  <p className="text-[10px] font-bold text-slate-700">{modalDetalle.nombre}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Email</p>
                  <p className="text-[10px] font-bold text-slate-700">{modalDetalle.email}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">WhatsApp</p>
                  <p className="text-[10px] font-bold text-slate-700">{modalDetalle.whatsapp}</p>
                </div>
                {modalDetalle.cedula && (
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Cédula</p>
                    <p className="text-[10px] font-bold text-slate-700">{modalDetalle.cedula}</p>
                  </div>
                )}
                {modalDetalle.direccionResidencia && (
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <MapPin size={10} /> Dirección
                    </p>
                    <p className="text-[10px] font-bold text-slate-700">{modalDetalle.direccionResidencia}</p>
                  </div>
                )}
                {modalDetalle.descripcionTienda && (
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <FileText size={10} /> Descripción de la tienda
                    </p>
                    <p className="text-[9px] text-slate-600 mt-1">{modalDetalle.descripcionTienda}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleAprobar(modalDetalle)}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} /> Aprobar
                </button>
                <button
                  onClick={() => {
                    setModalDetalle(null);
                    setModalRechazo(modalDetalle);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={14} /> Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rechazo con motivo */}
      {modalRechazo && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalRechazo(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-t-2xl">
              <h3 className="text-white font-black text-sm uppercase">Rechazar Solicitud</h3>
            </div>
            <div className="p-6">
              <p className="text-[10px] text-slate-600 mb-4">
                ¿Estás seguro de rechazar a <span className="font-black text-red-600">{modalRechazo.nombre}</span>?
              </p>
              <textarea
                placeholder="Motivo del rechazo (opcional)..."
                id="motivoRechazo"
                className="w-full p-3 bg-slate-50 rounded-xl text-[9px] font-bold outline-none focus:ring-2 focus:ring-red-200 mb-4"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setModalRechazo(null)}
                  className="flex-1 py-3 bg-slate-100 rounded-xl text-[9px] font-black text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const motivo = document.getElementById('motivoRechazo').value;
                    handleRechazar(modalRechazo, motivo);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-red-700 transition"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendedores;