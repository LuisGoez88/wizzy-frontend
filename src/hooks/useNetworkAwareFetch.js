// hooks/useNetworkAwareFetch.js
import { useState, useCallback } from 'react';
import { isNetworkOnline, addToPendingQueue, fetchWithRetry } from '../services/networkService';

export const useNetworkAwareFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}, onSuccess, onError) => {
    setLoading(true);
    setError(null);

    // Si no hay conexión, guardar en cola
    if (!isNetworkOnline()) {
      addToPendingQueue({
        url,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body,
        onSuccess,
        onError
      });
      
      setError({
        message: 'Sin conexión a internet. La acción se guardó y se procesará automáticamente.',
        isOffline: true
      });
      setLoading(false);
      
      if (onError) onError('OFFLINE');
      return null;
    }

    try {
      const data = await fetchWithRetry(url, options);
      setLoading(false);
      if (onSuccess) onSuccess(data);
      return data;
    } catch (err) {
      const errorMsg = {
        message: err.message,
        status: err.status,
        isOffline: err.name === 'TypeError'
      };
      setError(errorMsg);
      setLoading(false);
      if (onError) onError(errorMsg);
      return null;
    }
  }, []);

  return { request, loading, error };
};