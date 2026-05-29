import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, Users, CheckCircle, Clock, X, 
  QrCode, MessageCircle, Search, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ContentReservasExperiencias = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const VENDEDOR_ID = localStorage.getItem('userId') || 1;

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarReservas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/reservas/vendedor/${VENDEDOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        setReservas(Array.isArray(data) ? data : reservasEjemplo);
      } else {
        setReservas(reservasEjemplo);
      }
    } catch (error) {
      console.error("Error cargando reservas:", error);
      setReservas(reservasEjemplo);
    } finally {
      setLoading(false);
    }
  };

  const reservasEjemplo = [
    { id: 1, experiencia: "Yate Azimut Día Completo", cliente: "María González", fecha: "2026-05-15", personas: 6, total: 3500000, estado: "CONFIRMADA", qrCode: "WIZ-YATE-001", checkIn: false },
    { id: 2, experiencia: "Atardecer en Galeón", cliente: "Carlos López", fecha: "2026-05-16", personas: 2, total: 280000, estado: "PENDIENTE", qrCode: "WIZ-ATAR-002", checkIn: false },
    { id: 3, experiencia: "Pasadía Islas del Rosario", cliente: "Ana Martínez", fecha: "2026-05-20", personas: 4, total: 1000000, estado: "CONFIRMADA", qrCode: "WIZ-PASA-003", checkIn: false },
  ];

  const actualizarCheckIn = async (reservaId, estado) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reservas/${reservaId}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn: estado })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMensaje({ tipo: 'success', texto: data.mensaje || (estado ? '✅ Check-in realizado' : '❌ Check-in cancelado') });
        setReservas(prev => prev.map(r => 
          r.id === reservaId ? { ...r, checkIn: estado } : r
        ));
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al actualizar check-in' });
      }
    } catch (error) {
      console.error("Error actualizando check-in", error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión al actualizar check-in' });
      setReservas(prev => prev.map(r => 
        r.id === reservaId ? { ...r, checkIn: estado } : r
      ));
    }
  };

  const getEstadoBadge = (estado, checkIn) => {
    if (checkIn) return { text: 'CHECK-IN REALIZADO', color: 'bg-emerald-100 text-emerald-700' };
    if (estado === 'CONFIRMADA') return { text: 'CONFIRMADA', color: 'bg-emerald-100 text-emerald-700' };
    if (estado === 'PENDIENTE') return { text: 'PENDIENTE', color: 'bg-amber-100 text-amber-700' };
    if (estado === 'CANCELADA') return { text: 'CANCELADA', color: 'bg-red-100 text-red-700' };
    return { text: estado, color: 'bg-slate-100 text-slate-700' };
  };

  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const reservasFiltradas = reservas.filter(r => {
    if (filtroEstado !== 'TODOS' && r.estado !== filtroEstado) return false;
    if (busqueda && !r.cliente.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const reservasHoy = reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length;
  const reservasPendientes = reservas.filter(r => r.estado === 'PENDIENTE').length;
  const checkInsHoy = reservas.filter(r => r.checkIn === true).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-purple-600 text-sm font-black uppercase tracking-wider">
          Cargando reservas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      
      {mensaje && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right-4 ${
          mensaje.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <p className="text-[10px] font-black uppercase tracking-wider">{mensaje.texto}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Gestión de Reservas
          </h2>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Control de reservas de tus experiencias
          </p>
        </div>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-[10px] font-bold w-40 md:w-56 outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-white">
          <Calendar size={18} className="mb-2 opacity-80" />
          <p className="text-[8px] font-black uppercase tracking-wider opacity-70">Reservas Hoy</p>
          <p className="text-2xl font-black">{reservasHoy}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <Clock size={18} className="text-amber-500 mb-2" />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Pendientes</p>
          <p className="text-2xl font-black text-slate-800">{reservasPendientes}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <CheckCircle size={18} className="text-emerald-500 mb-2" />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Check-ins Hoy</p>
          <p className="text-2xl font-black text-slate-800">{checkInsHoy}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <Users size={18} className="text-purple-500 mb-2" />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total Reservas</p>
          <p className="text-2xl font-black text-slate-800">{reservas.length}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['TODOS', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA'].map((estado) => (
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

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[8px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-4 py-4">Cliente</th>
                <th className="px-4 py-4">Experiencia</th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4">Personas</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Check-in</th>
                <th className="px-4 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reservasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      No hay reservas para mostrar
                    </p>
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map((res) => {
                  const badge = getEstadoBadge(res.estado, res.checkIn);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-black text-slate-800 text-[10px]">{res.cliente}</p>
                          <p className="text-[8px] font-mono text-slate-400">{res.qrCode}</p>
                        </div>
                       </td>
                      <td className="px-4 py-4 text-[10px] font-bold text-slate-600">{res.experiencia}</td>
                      <td className="px-4 py-4 text-[9px] font-bold text-slate-500">{formatFecha(res.fecha)}</td>
                      <td className="px-4 py-4 text-[10px] font-black text-slate-700">{res.personas}</td>
                      <td className="px-4 py-4 text-[10px] font-black text-purple-600">{formatCOP(res.total)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase ${badge.color}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {res.checkIn ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span className="text-[7px] font-black text-emerald-600">REALIZADO</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => actualizarCheckIn(res.id, true)}
                            className="text-[8px] font-black bg-slate-100 px-3 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            Marcar
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button 
                          onClick={() => window.open(`https://wa.me/573000000000?text=Hola%20${encodeURIComponent(res.cliente)}%2C%20tu%20reserva%20en%20${encodeURIComponent(res.experiencia)}%20está%20confirmada`, '_blank')}
                          className="p-1.5 bg-slate-100 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <MessageCircle size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reservaSeleccionada && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReservaSeleccionada(null)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
            <button onClick={() => setReservaSeleccionada(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
              <X size={20} />
            </button>
            <div className="text-center">
              <QrCode size={48} className="mx-auto text-purple-600 mb-4" />
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter">{reservaSeleccionada.experiencia}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{reservaSeleccionada.cliente}</p>
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                <div className="flex justify-between text-[9px]">
                  <span>Fecha:</span>
                  <span className="font-black">{formatFecha(reservaSeleccionada.fecha)}</span>
                </div>
                <div className="flex justify-between text-[9px] mt-2">
                  <span>Personas:</span>
                  <span className="font-black">{reservaSeleccionada.personas}</span>
                </div>
                <div className="flex justify-between text-[9px] mt-2">
                  <span>Total:</span>
                  <span className="font-black text-purple-600">{formatCOP(reservaSeleccionada.total)}</span>
                </div>
              </div>
              <button 
                onClick={() => window.open(`https://wa.me/573000000000?text=Hola%20${encodeURIComponent(reservaSeleccionada.cliente)}`, '_blank')}
                className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} /> Contactar Cliente
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ContentReservasExperiencias;