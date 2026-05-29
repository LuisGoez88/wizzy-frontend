// components/CanjearRegaloModal.jsx
import React, { useState } from 'react';
import { Gift, Ticket, Loader2, X, CheckCircle } from 'lucide-react';

const CanjearRegaloModal = ({ isOpen, onClose, usuarioId, onCanjeExitoso }) => {
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [experienciaCanjeada, setExperienciaCanjeada] = useState('');
  const [qrCode, setQrCode] = useState('');

  const handleCanjear = async () => {
    if (!codigo.trim()) {
      setError('Ingresa el código de regalo');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/productos/canjear-regalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoRegalo: codigo.toUpperCase(),
          destinatarioId: usuarioId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExperienciaCanjeada(data.experiencia);
        setQrCode(data.qrCode);
        setExito(true);
        if (onCanjeExitoso) onCanjeExitoso();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Código inválido o ya canjeado');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  if (exito) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-5 rounded-t-2xl text-center">
            <CheckCircle size={48} className="text-white mx-auto mb-2" />
            <h3 className="text-white font-black text-lg">¡Regalo canjeado!</h3>
          </div>
          <div className="p-6 text-center">
            <p className="text-[10px] text-slate-600 mb-2">
              Has canjeado <span className="font-black text-purple-600">{experienciaCanjeada}</span>
            </p>
            <div className="bg-slate-100 rounded-xl p-3 mb-4">
              <p className="text-[8px] text-slate-500 mb-1">Código QR de reserva:</p>
              <code className="text-xs font-mono font-bold text-purple-600">{qrCode}</code>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(qrCode)}
              className="w-full bg-purple-600 text-white py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition mb-2"
            >
              Copiar código QR
            </button>
            <button onClick={onClose} className="text-[8px] text-slate-400 hover:text-slate-600">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Ticket size={20} className="text-white" />
              <h3 className="text-white font-black text-sm uppercase">Canjear regalo</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase">Código de regalo *</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="w-full mt-1 p-3 bg-slate-50 rounded-xl text-[10px] font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej: GIFT-ABCD1234"
            />
            <p className="text-[6px] text-slate-400 mt-0.5">Ingresa el código que te compartió quien te regaló la experiencia</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-xl text-[8px] font-black text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleCanjear}
            disabled={enviando}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            {enviando ? <Loader2 className="animate-spin" size={14} /> : <Gift size={14} />}
            {enviando ? 'Canjeando...' : 'Canjear regalo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanjearRegaloModal;