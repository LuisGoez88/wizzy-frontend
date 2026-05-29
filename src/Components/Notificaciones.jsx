// components/Notificaciones.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, X, Trash2, CheckCheck } from 'lucide-react';

const Notificaciones = ({ usuarioId }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    try {
      const response = await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data);
        const noLeidasCount = data.filter(n => !n.leido).length;
        setNoLeidas(noLeidasCount);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setCargando(false);
    }
  }, [usuarioId]);

  const cargarNoLeidas = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}/no-leidas`);
      if (response.ok) {
        const data = await response.json();
        setNoLeidas(data.count);
      }
    } catch (error) {
      console.error('Error cargando contador:', error);
    }
  }, [usuarioId]);

  const marcarComoLeida = async (notificacionId) => {
    try {
      await fetch(`http://localhost:8080/api/notificaciones/${notificacionId}/leer`, {
        method: 'PATCH'
      });
      setNotificaciones(prev => prev.map(n => 
        n.id === notificacionId ? { ...n, leido: true } : n
      ));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}/leer-todas`, {
        method: 'PATCH'
      });
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error('Error marcando todas:', error);
    }
  };

  const limpiarTodas = async () => {
    if (!window.confirm('¿Eliminar todas las notificaciones?')) return;
    try {
      await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}/limpiar`, {
        method: 'DELETE'
      });
      setNotificaciones([]);
      setNoLeidas(0);
    } catch (error) {
      console.error('Error limpiando notificaciones:', error);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return 'Hace unos segundos';
    if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (usuarioId) {
      cargarNotificaciones();
      cargarNoLeidas();
      const interval = setInterval(() => {
        cargarNoLeidas();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [usuarioId, cargarNotificaciones, cargarNoLeidas]);

  useEffect(() => {
    if (abierto) {
      cargarNotificaciones();
    }
  }, [abierto, cargarNotificaciones]);

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
              Notificaciones
              {noLeidas > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                  {noLeidas} nueva{noLeidas !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              {notificaciones.length > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  className="text-[8px] font-black text-purple-600 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Marcar todas
                </button>
              )}
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando ? (
              <div className="p-8 text-center">
                <div className="animate-pulse text-purple-600 text-[10px]">Cargando...</div>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[9px] text-slate-400">No hay notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ${!notif.leido ? 'bg-purple-50/30' : ''}`}
                  onClick={() => marcarComoLeida(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.leido ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                        <CheckCircle size={14} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-[10px] font-bold ${!notif.leido ? 'text-slate-800' : 'text-slate-500'}`}>
                        {notif.mensaje}
                      </p>
                      <p className="text-[8px] text-slate-400 mt-1">
                        {formatFecha(notif.fecha)}
                      </p>
                    </div>
                    {!notif.leido && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                onClick={limpiarTodas}
                className="w-full text-[8px] font-black text-red-500 uppercase tracking-wider hover:text-red-600 transition flex items-center justify-center gap-1"
              >
                <Trash2 size={10} /> Limpiar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notificaciones;