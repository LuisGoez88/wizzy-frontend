// hooks/useUnsavedChanges.js
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useUnsavedChanges = (hasUnsavedChanges, onConfirm = null) => {
  const navigate = useNavigate();

  // Bloquear cierre de pestaña / recarga de página
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Función para verificar si puede salir
  const checkAndLeave = useCallback((callback) => {
    if (hasUnsavedChanges) {
      if (onConfirm) {
        onConfirm(() => {
          if (callback) callback();
        });
      } else {
        const confirmMessage = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir? Los cambios se perderán.';
        if (window.confirm(confirmMessage)) {
          if (callback) callback();
        }
      }
    } else {
      if (callback) callback();
    }
  }, [hasUnsavedChanges, onConfirm]);

  return { checkAndLeave, hasUnsavedChanges };
};