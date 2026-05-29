// services/networkService.js

let listeners = [];
let isOnline = navigator.onLine;
let retryInterval = null;

// Verificar estado actual
export const isNetworkOnline = () => isOnline;

// Suscribirse a cambios de red
export const onNetworkChange = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

// Notificar cambios
const notifyListeners = (online) => {
  listeners.forEach(callback => callback(online));
};

// Monitorear cambios de conexión
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    notifyListeners(true);
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
    notifyListeners(false);
  });
}

// Cola de peticiones pendientes (offline)
let pendingRequests = [];

export const addToPendingQueue = (request) => {
  pendingRequests.push({
    ...request,
    timestamp: Date.now(),
    retries: 0
  });
  // Guardar en localStorage para persistencia
  localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
};

export const getPendingQueue = () => {
  const saved = localStorage.getItem('pendingRequests');
  if (saved) {
    pendingRequests = JSON.parse(saved);
  }
  return pendingRequests;
};

export const clearPendingQueue = () => {
  pendingRequests = [];
  localStorage.removeItem('pendingRequests');
};

// Reintentar peticiones pendientes
export const retryPendingRequests = async () => {
  if (!isOnline) return;
  
  const requests = getPendingQueue();
  if (requests.length === 0) return;
  
  console.log(`🔄 Reintentando ${requests.length} peticiones pendientes...`);
  
  for (const req of requests) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      if (response.ok && req.onSuccess) {
        req.onSuccess(await response.json());
      }
    } catch (error) {
      console.error(`❌ Error reintentando ${req.url}:`, error);
    }
  }
  
  clearPendingQueue();
};

// Iniciar reintento automático
export const startRetryInterval = () => {
  if (retryInterval) return;
  retryInterval = setInterval(() => {
    if (isOnline) {
      retryPendingRequests();
    }
  }, 30000); // Cada 30 segundos
};

// Fetch con manejo de errores y cola offline
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      
      // Si es error de red, esperar antes de reintentar
      if (error.name === 'TypeError' || error.name === 'AbortError') {
        console.log(`⚠️ Error de red, reintento ${i + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};