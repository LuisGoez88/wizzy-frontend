// components/ReferidosPanel.jsx
import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Gift, TrendingUp, Crown, Share2 } from 'lucide-react';

const ReferidosPanel = ({ usuarioId }) => {
  const [codigo, setCodigo] = useState('');
  const [link, setLink] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [listaReferidos, setListaReferidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuarioId) {
      cargarCodigo();
      cargarEstadisticas();
      cargarListaReferidos();
    }
  }, [usuarioId]);

  const cargarCodigo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/referidos/codigo/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setCodigo(data.codigo);
        setLink(data.link);
      }
    } catch (error) {
      console.error('Error cargando código:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/referidos/estadisticas/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarListaReferidos = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/referidos/lista/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setListaReferidos(data);
      }
    } catch (error) {
      console.error('Error cargando lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartirWhatsApp = () => {
    const mensaje = `¡Únete a Wizzy con mi código de referido! 🎉\n\nUsa mi código: ${codigo}\n\nRegístrate aquí: ${link}\n\nAl registrarte, recibirás $10.000 en incentivos para canjear en experiencias increíbles en Cartagena. ¡No te lo pierdas!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'DIAMANTE': return 'from-purple-400 to-purple-600';
      case 'ORO': return 'from-amber-500 to-yellow-600';
      case 'PLATA': return 'from-gray-400 to-gray-500';
      default: return 'from-purple-600 to-purple-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tarjeta de código de referido */}
      <div className={`bg-gradient-to-r ${getNivelColor(estadisticas?.nivelActual)} rounded-xl p-5 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 size={18} />
            <h3 className="font-black text-xs uppercase tracking-wider">Código de referido</h3>
          </div>
          {estadisticas && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
              <Crown size={10} />
              <span className="text-[8px] font-black">{estadisticas.nivelActual}</span>
            </div>
          )}
        </div>
        
        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <p className="text-[7px] font-black uppercase tracking-wider opacity-80 mb-1">Tu código único</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black tracking-wider font-mono">{codigo}</span>
            <button
              onClick={copiarLink}
              className="bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition flex items-center gap-1"
            >
              {copiado ? <Check size={14} /> : <Copy size={14} />}
              <span className="text-[7px] font-black">{copiado ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copiarLink}
            className="flex-1 bg-white text-purple-600 py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-purple-50 transition flex items-center justify-center gap-1"
          >
            <Copy size={10} /> Copiar link
          </button>
          <button
            onClick={compartirWhatsApp}
            className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-green-700 transition flex items-center justify-center gap-1"
          >
            <Share2 size={10} /> Compartir
          </button>
        </div>
      </div>

      {/* Estadísticas de referidos */}
      {estadisticas && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-1">
              <Users size={12} className="text-purple-500" />
              <p className="text-[7px] font-black text-slate-400 uppercase">Total referidos</p>
            </div>
            <p className="text-xl font-black text-slate-800">{estadisticas.totalReferidos}</p>
            <p className="text-[6px] text-slate-400">
              {estadisticas.completados} completaron compra
            </p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-1">
              <Gift size={12} className="text-purple-500" />
              <p className="text-[7px] font-black text-slate-400 uppercase">Beneficio actual</p>
            </div>
            <p className="text-xl font-black text-slate-800">+{estadisticas.beneficioActual}%</p>
            {estadisticas.proximoNivel && (
              <p className="text-[6px] text-slate-400">
                Faltan {estadisticas.referidosFaltantes} para {estadisticas.proximoNivel}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lista de referidos */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="p-3 border-b border-slate-100">
          <h4 className="font-black text-slate-800 text-[9px] uppercase tracking-wider flex items-center gap-1">
            <Users size={12} /> Mis referidos ({listaReferidos.length})
          </h4>
        </div>
        
        <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
          {listaReferidos.length === 0 ? (
            <div className="p-6 text-center">
              <Users size={24} className="mx-auto text-slate-200 mb-1" />
              <p className="text-[8px] text-slate-400">Aún no tienes referidos</p>
              <p className="text-[6px] text-slate-300 mt-0.5">Comparte tu código para ganar incentivos</p>
            </div>
          ) : (
            listaReferidos.map((ref) => (
              <div key={ref.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-800">{ref.nombre}</p>
                  <p className="text-[6px] text-slate-400">{ref.email}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[7px] font-black uppercase ${
                    ref.estado === 'COMPLETO' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {ref.estado === 'COMPLETO' ? '✓ Completado' : '⏳ Pendiente'}
                  </p>
                  {ref.incentivoGanado > 0 && (
                    <p className="text-[6px] text-emerald-600 font-black">
                      +${ref.incentivoGanado.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferidosPanel;