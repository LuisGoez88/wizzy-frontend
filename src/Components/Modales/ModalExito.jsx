import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X } from 'lucide-react';

const ModalExito = ({ isOpen, onClose, mensaje, subMensaje = null, onAction = null, actionText = null }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white rounded-t-3xl text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-black">{mensaje}</h3>
          {subMensaje && <p className="text-[9px] opacity-80 mt-1">{subMensaje}</p>}
        </div>
        
        <div className="p-6">
          {onAction && actionText ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-slate-200 transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={onAction}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition-all"
              >
                {actionText}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition-all"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalExito;