// pages/admin/AdminUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, User, Mail, Phone, Shield, MoreVertical, 
  Edit, Trash2, X, CheckCircle, AlertCircle, Users,
  Filter, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { getUsuarios, cambiarRolUsuario, eliminarUsuario } from '../../services/adminApi';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    cargarUsuarios();
  }, [filtroRol]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios(filtroRol, search);
      setUsuarios(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    cargarUsuarios();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      cargarUsuarios();
    }
  };

  const handleCambiarRol = async (usuario, nuevoRol) => {
    try {
      await cambiarRolUsuario(usuario.id, nuevoRol);
      await cargarUsuarios();
      setModalAbierto(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEliminarUsuario = async (usuario) => {
    if (!window.confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;
    
    try {
      await eliminarUsuario(usuario.id);
      await cargarUsuarios();
      setModalConfirmacion(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      'ADMIN': { color: 'bg-red-100 text-red-700', label: 'Admin' },
      'CLIENTE': { color: 'bg-blue-100 text-blue-700', label: 'Cliente' },
      'PRODUCTOS': { color: 'bg-purple-100 text-purple-700', label: 'Vendedor Productos' },
      'EXPERIENCIAS': { color: 'bg-emerald-100 text-emerald-700', label: 'Vendedor Experiencias' }
    };
    const r = roles[role] || { color: 'bg-gray-100 text-gray-700', label: role };
    return <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${r.color}`}>{r.label}</span>;
  };

  // Paginación
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);
  const paginatedUsuarios = usuarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Gestión de Usuarios
          </h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 rounded-full px-4 py-2">
            <p className="text-[9px] font-black text-purple-700">
              Total: {usuarios.length} usuarios
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="CLIENTE">Clientes</option>
              <option value="PRODUCTOS">Vendedores Productos</option>
              <option value="EXPERIENCIAS">Vendedores Experiencias</option>
              <option value="ADMIN">Administradores</option>
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

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent"></div>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-20">
            <Users size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-[10px] text-slate-400">No se encontraron usuarios</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-[8px] font-black text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th className="text-left p-4 text-[8px] font-black text-slate-500 uppercase tracking-wider">Contacto</th>
                    <th className="text-left p-4 text-[8px] font-black text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="text-left p-4 text-[8px] font-black text-slate-500 uppercase tracking-wider">Saldo Impulso</th>
                    <th className="text-left p-4 text-[8px] font-black text-slate-500 uppercase tracking-wider">Nivel</th>
                    <th className="text-center p-4 text-[8px] font-black text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-800">{usuario.nombre}</p>
                            <p className="text-[7px] text-slate-400">{usuario.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-[9px] font-bold text-slate-600 flex items-center gap-1">
                          <Phone size={10} /> {usuario.whatsapp || 'No registrado'}
                        </p>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(usuario.role)}
                      </td>
                      <td className="p-4">
                        <p className="text-[10px] font-black text-emerald-600">
                          ${usuario.saldoImpulso?.toLocaleString() || '0'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star size={10} className="text-yellow-400" />
                          <p className="text-[9px] font-bold text-slate-600">{usuario.nivel || 'SILVER'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setUsuarioSeleccionado(usuario);
                              setModalAbierto(true);
                            }}
                            className="p-2 bg-slate-100 rounded-lg hover:bg-purple-100 transition"
                            title="Cambiar rol"
                          >
                            <Shield size={14} className="text-purple-600" />
                          </button>
                          <button
                            onClick={() => handleEliminarUsuario(usuario)}
                            className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100">
                <p className="text-[8px] text-slate-400">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, usuarios.length)} de {usuarios.length}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-slate-50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 py-1 text-[9px] font-bold text-purple-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-slate-50 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal cambiar rol */}
      {modalAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalAbierto(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-black text-sm uppercase">Cambiar Rol</h3>
                <button onClick={() => setModalAbierto(false)} className="text-white/80">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[10px] text-slate-600 mb-4">
                Usuario: <span className="font-black text-purple-700">{usuarioSeleccionado.nombre}</span>
              </p>
              <div className="space-y-2">
                {['CLIENTE', 'PRODUCTOS', 'EXPERIENCIAS', 'ADMIN'].map((rol) => (
                  <button
                    key={rol}
                    onClick={() => handleCambiarRol(usuarioSeleccionado, rol)}
                    className={`w-full p-3 rounded-xl text-[9px] font-black uppercase transition-all ${
                      usuarioSeleccionado.role === rol
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
                    }`}
                  >
                    {rol === 'CLIENTE' ? 'Cliente' :
                     rol === 'PRODUCTOS' ? 'Vendedor de Productos' :
                     rol === 'EXPERIENCIAS' ? 'Vendedor de Experiencias' :
                     'Administrador'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;