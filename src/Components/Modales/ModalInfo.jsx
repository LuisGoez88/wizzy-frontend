import React from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

const ModalInfo = ({ isOpen, onClose, titulo, mensaje }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-3xl text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-black">{titulo}</h3>
        </div>
        
        <div className="p-6">
          <p className="text-[10px] text-slate-600 text-center">{mensaje}</p>
          
          <button
            onClick={onClose}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-blue-700 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalInfo;