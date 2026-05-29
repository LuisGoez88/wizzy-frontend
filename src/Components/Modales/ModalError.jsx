import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';

const ModalError = ({ isOpen, onClose, mensaje, detalle = null }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-3xl text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-black">¡Oops!</h3>
          <p className="text-[9px] opacity-80 mt-1">{mensaje}</p>
        </div>
        
        <div className="p-6">
          {detalle && (
            <div className="bg-red-50 rounded-xl p-3 mb-4">
              <p className="text-[8px] font-mono text-red-600 break-all">{detalle}</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-red-700 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalError;