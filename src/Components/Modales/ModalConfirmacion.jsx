import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje, confirmText = "Confirmar", cancelText = "Cancelar", variant = "danger" }) => {
  if (!isOpen) return null;

  const variantColors = {
    danger: { bg: 'bg-red-50', border: 'border-red-200', button: 'bg-red-600 hover:bg-red-700', icon: 'text-red-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', button: 'bg-amber-600 hover:bg-amber-700', icon: 'text-amber-500' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', button: 'bg-emerald-600 hover:bg-emerald-700', icon: 'text-emerald-500' }
  };

  const colors = variantColors[variant] || variantColors.danger;

  return createPortal(
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <div className={`${colors.bg} rounded-t-3xl p-5 border-b ${colors.border}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${colors.button.split(' ')[0]} rounded-xl flex items-center justify-center`}>
                <AlertTriangle size={20} className="text-white" />
              </div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter">{titulo}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-[10px] text-slate-600 leading-relaxed">{mensaje}</p>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-slate-200 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 ${colors.button} text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-2`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalConfirmacion;