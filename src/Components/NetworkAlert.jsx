// components/NetworkAlert.jsx
import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { isNetworkOnline, onNetworkChange, retryPendingRequests } from '../services/networkService';

const NetworkAlert = ({ onRetry }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineDuration, setOfflineDuration] = useState(0);

  useEffect(() => {
    // Estado inicial
    setIsOnline(isNetworkOnline());
    
    // Suscribirse a cambios
    const unsubscribe = onNetworkChange((online) => {
      setIsOnline(online);
      if (online) {
        // Reconectado
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 5000);
        // Reintentar peticiones
        retryPendingRequests();
        if (onRetry) onRetry();
      } else {
        // Desconectado
        setIsVisible(true);
        setOfflineDuration(0);
      }
    });
    
    // Intervalo para contar tiempo offline
    const interval = setInterval(() => {
      if (!isNetworkOnline()) {
        setOfflineDuration(prev => prev + 1);
      }
    }, 1000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [onRetry]);

  const handleRetry = async () => {
    setIsReconnecting(true);
    if (isNetworkOnline()) {
      await retryPendingRequests();
      if (onRetry) onRetry();
      setIsVisible(false);
    } else {
      // Intentar detectar conexión
      try {
        const response = await fetch('http://localhost:8080/api/productos/tienda', {
          method: 'HEAD',
          cache: 'no-cache',
          timeout: 5000
        });
        if (response.ok) {
          await retryPendingRequests();
          if (onRetry) onRetry();
          setIsVisible(false);
        }
      } catch (error) {
        console.error('No hay conexión aún');
      }
    }
    setIsReconnecting(false);
  };

  if (!isVisible) return null;

  const minutes = Math.floor(offlineDuration / 60);
  const seconds = offlineDuration % 60;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:min-w-[320px] z-[10001] animate-in slide-in-from-bottom-5 duration-300 ${
      isOnline ? 'slide-out-to-bottom' : ''
    }`}>
      <div className={`rounded-2xl p-4 shadow-xl border ${
        isOnline 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOnline ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            {isOnline ? (
              <Wifi size={16} className="text-emerald-600" />
            ) : (
              <WifiOff size={16} className="text-red-600" />
            )}
          </div>
          
          <div className="flex-1">
            <p className={`text-[10px] font-black uppercase tracking-wider ${
              isOnline ? 'text-emerald-700' : 'text-red-700'
            }`}>
              {isOnline ? '✓ Conexión restablecida' : '⚠️ Problema de conexión'}
            </p>
            <p className="text-[9px] text-slate-600 mt-0.5">
              {isOnline 
                ? 'La conexión se ha restablecido correctamente.'
                : `No se pudo conectar con el servidor. ${offlineDuration > 0 ? `(${minutes > 0 ? `${minutes}m ` : ''}${seconds}s sin conexión)` : 'Verifica tu internet.'}`
              }
            </p>
            {!isOnline && (
              <p className="text-[8px] text-slate-500 mt-1">
                Las acciones se guardarán y se sincronizarán automáticamente.
              </p>
            )}
          </div>
          
          <button
            onClick={handleRetry}
            disabled={isReconnecting}
            className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition active:scale-95 flex items-center gap-1 ${
              isOnline 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <RefreshCw size={10} className={isReconnecting ? 'animate-spin' : ''} />
            {isOnline ? 'Aceptar' : isReconnecting ? 'Reconectando...' : 'Reintentar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkAlert;