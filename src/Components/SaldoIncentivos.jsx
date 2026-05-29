// components/SaldoIncentivos.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Coins, ChevronDown } from 'lucide-react';

const SaldoIncentivos = ({ usuarioId }) => {
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDetalle, setShowDetalle] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (usuarioId) {
      cargarSaldo();
      cargarHistorial();
    }
  }, [usuarioId]);

  const cargarSaldo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/incentivos/saldo/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setSaldo(data.saldo || 0);
      }
    } catch (error) {
      console.error('Error cargando saldo:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/incentivos/historial/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setHistorial(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const getTipoIcono = (tipo) => {
    switch (tipo) {
      case 'BIENVENIDA': return '🎉';
      case 'REFERIDO': return '👥';
      case 'CASHBACK': return '💰';
      case 'REDENCION': return '🎟️';
      case 'REGALO_ENVIADO': return '🎁';
      case 'REGALO_RECIBIDO': return '🎁';
      default: return '⭐';
    }
  };

  const getTipoColor = (tipo) => {
    if (tipo === 'REDENCION' || tipo === 'REGALO_ENVIADO') return 'text-red-500';
    return 'text-emerald-500';
  };

  const handleVerHistorial = () => {
    setShowDetalle(false);
    // Navegar a la sección de incentivos en el panel cliente
    navigate('/panel-cliente', { state: { tab: 'incentivos' } });
  };

  if (loading) {
    return (
      <div className="bg-purple-50 rounded-full px-4 py-2 animate-pulse">
        <span className="text-[9px] font-black text-purple-700">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetalle(!showDetalle)}
        className="bg-purple-50 hover:bg-purple-100 rounded-full px-4 py-2 transition-all flex items-center gap-2 border border-purple-200"
      >
        <Gift size={14} className="text-purple-600" />
        <span className="text-[9px] font-black text-purple-700 uppercase">
          Incentivos
        </span>
        <span className="text-[11px] font-black text-purple-800">
          ${saldo.toLocaleString('es-CO')}
        </span>
        <ChevronDown size={12} className={`text-purple-500 transition-transform ${showDetalle ? 'rotate-180' : ''}`} />
      </button>

      {showDetalle && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black uppercase tracking-wider opacity-80">Tu saldo Wizzy</p>
                <p className="text-2xl font-black">${saldo.toLocaleString('es-CO')}</p>
              </div>
              <Coins size={28} className="opacity-80" />
            </div>
            <p className="text-[8px] mt-2 opacity-80">
              ✨ Usa tus incentivos en experiencias. ¡No caducan!
            </p>
          </div>

          <div className="p-4">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-3">
              Últimos movimientos
            </h4>
            {historial.length === 0 ? (
              <p className="text-[8px] text-slate-400 text-center py-4">
                No hay movimientos recientes
              </p>
            ) : (
              <div className="space-y-2">
                {historial.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px]">{getTipoIcono(item.tipo)}</span>
                      <div>
                        <p className="text-[9px] font-bold text-slate-700">{item.descripcion}</p>
                        <p className="text-[7px] text-slate-400">
                          {new Date(item.fechaCreacion).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-[9px] font-black ${getTipoColor(item.tipo)}`}>
                      {item.monto > 0 ? `+$${item.monto.toLocaleString()}` : `-$${Math.abs(item.monto).toLocaleString()}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleVerHistorial}
              className="w-full text-[8px] font-black text-purple-600 uppercase tracking-wider hover:text-purple-700 transition"
            >
              Ver historial completo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaldoIncentivos;