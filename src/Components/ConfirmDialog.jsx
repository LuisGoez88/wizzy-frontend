// components/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, titulo, mensaje, confirmText = 'Salir', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-white" />
              <h3 className="text-white font-black text-sm uppercase tracking-wider">{titulo || 'Cambios sin guardar'}</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-[10px] text-slate-600 mb-6">
            {mensaje || 'Tienes cambios sin guardar. Si sales, perderás todos los cambios no guardados.'}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 rounded-xl text-[9px] font-black text-slate-600 hover:bg-slate-200 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase hover:bg-amber-600 transition"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;