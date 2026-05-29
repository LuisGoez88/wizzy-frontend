// components/RegalarIncentivosModal.jsx
import React, { useState } from 'react';
import { Gift, Search, User, Mail, X, Loader2 } from 'lucide-react';

const RegalarIncentivosModal = ({ isOpen, onClose, usuarioId, saldoActual, onRegaloExitoso }) => {
  const [monto, setMonto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const buscarUsuarios = async () => {
    if (busqueda.length < 2) return;
    setBuscando(true);
    try {
      const response = await fetch(`http://localhost:8080/api/incentivos/usuarios/buscar?termino=${busqueda}`);
      if (response.ok) {
        const data = await response.json();
        setUsuariosEncontrados(data.filter(u => u.id !== usuarioId));
      }
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    } finally {
      setBuscando(false);
    }
  };

  const handleRegalar = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    if (parseFloat(monto) > saldoActual) {
      setError(`Saldo insuficiente. Tienes $${saldoActual.toLocaleString()}`);
      return;
    }
    if (!usuarioSeleccionado) {
      setError('Selecciona un usuario para regalar');
      return;
    }

    setEnviando(true);
    try {
      const response = await fetch('http://localhost:8080/api/incentivos/regalar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remitenteId: usuarioId,
          destinatarioId: usuarioSeleccionado.id,
          monto: parseFloat(monto),
          mensaje: mensaje
        })
      });

      if (response.ok) {
        if (onRegaloExitoso) onRegaloExitoso(parseFloat(monto));
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al regalar incentivos');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gift size={20} className="text-white" />
              <h3 className="text-white font-black text-sm uppercase">Regalar Incentivos</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-purple-50 rounded-xl p-3 flex justify-between">
            <span className="text-[9px] font-black text-purple-600">Tu saldo disponible:</span>
            <span className="text-[11px] font-black text-purple-700">${saldoActual.toLocaleString()}</span>
          </div>

          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase">Monto a regalar *</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Ej: 50000"
              />
            </div>
          </div>

          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase">Buscar destinatario *</label>
            <div className="flex gap-2 mt-1">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-[10px] font-medium outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="Nombre o email"
                />
              </div>
              <button
                onClick={buscarUsuarios}
                className="px-4 py-2.5 bg-amber-100 text-amber-700 rounded-xl text-[8px] font-black uppercase hover:bg-amber-200 transition"
              >
                Buscar
              </button>
            </div>

            {buscando && <Loader2 size={14} className="animate-spin text-amber-500 mt-2" />}

            {usuariosEncontrados.length > 0 && (
              <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {usuariosEncontrados.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setUsuarioSeleccionado(u)}
                    className={`w-full p-3 text-left flex items-center gap-3 hover:bg-slate-50 transition ${
                      usuarioSeleccionado?.id === u.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                    }`}
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-800">{u.nombre}</p>
                      <p className="text-[7px] text-slate-400">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase">Mensaje (opcional)</label>
            <textarea
              rows="2"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 rounded-xl text-[9px] font-medium outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Ej: ¡Feliz cumpleaños! Disfruta esta experiencia en Wizzy"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-xl text-[8px] font-black text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleRegalar}
            disabled={enviando}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-amber-600 transition flex items-center justify-center gap-2"
          >
            {enviando ? <Loader2 className="animate-spin" size={14} /> : <Gift size={14} />}
            {enviando ? 'Regalando...' : `Regalar $${parseFloat(monto || 0).toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegalarIncentivosModal;