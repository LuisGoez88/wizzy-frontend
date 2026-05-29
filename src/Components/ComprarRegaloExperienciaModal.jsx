// components/ComprarRegaloExperienciaModal.jsx
import React, { useState } from 'react';
import { Gift, Mail, MessageCircle, Loader2, X, CheckCircle } from 'lucide-react';

const ComprarRegaloExperienciaModal = ({ isOpen, onClose, experiencia, usuarioId, onCompraExitosa }) => {
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [codigoRegalo, setCodigoRegalo] = useState(null);
  const [exito, setExito] = useState(false);

  const handleComprarRegalo = async () => {
    if (!emailDestinatario.trim()) {
      setError('Ingresa el email del destinatario');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const url = `http://localhost:8080/api/productos/${experiencia.id}/comprar-regalo?cantidad=1&compradorId=${usuarioId}&emailDestinatario=${encodeURIComponent(emailDestinatario)}&mensajePersonalizado=${encodeURIComponent(mensajePersonalizado)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setCodigoRegalo(data.codigoRegalo);
        setExito(true);
        if (onCompraExitosa) onCompraExitosa();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al comprar el regalo');
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
            <h3 className="text-white font-black text-lg">¡Regalo comprado!</h3>
          </div>
          <div className="p-6 text-center">
            <p className="text-[10px] text-slate-600 mb-4">
              El código de regalo ha sido generado. Compártelo con el destinatario.
            </p>
            <div className="bg-slate-100 rounded-xl p-3 mb-4">
              <code className="text-sm font-mono font-bold text-purple-600">{codigoRegalo}</code>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(codigoRegalo)}
              className="w-full bg-purple-600 text-white py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition mb-2"
            >
              Copiar código
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gift size={20} className="text-white" />
              <h3 className="text-white font-black text-sm uppercase">Comprar como regalo</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-[8px] font-black text-purple-500 uppercase">Experiencia</p>
            <p className="font-black text-slate-800 text-sm">{experiencia.titulo}</p>
            <p className="text-[10px] font-bold text-purple-600 mt-1">${experiencia.precioPublico?.toLocaleString()}</p>
          </div>

          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase flex items-center gap-1">
              <Mail size={10} /> Email del destinatario *
            </label>
            <input
              type="email"
              value={emailDestinatario}
              onChange={(e) => setEmailDestinatario(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 rounded-xl text-[10px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="amigo@ejemplo.com"
              required
            />
            <p className="text-[6px] text-slate-400 mt-0.5">Si ya tiene cuenta Wizzy, recibirá notificación</p>
          </div>

          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase flex items-center gap-1">
              <MessageCircle size={10} /> Mensaje personalizado (opcional)
            </label>
            <textarea
              rows="3"
              value={mensajePersonalizado}
              onChange={(e) => setMensajePersonalizado(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 rounded-xl text-[9px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="¡Feliz aniversario! Disfruta esta experiencia increíble..."
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-xl text-[8px] font-black text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleComprarRegalo}
            disabled={enviando}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            {enviando ? <Loader2 className="animate-spin" size={14} /> : <Gift size={14} />}
            {enviando ? 'Procesando...' : `Comprar regalo ($${experiencia.precioPublico?.toLocaleString()})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComprarRegaloExperienciaModal;