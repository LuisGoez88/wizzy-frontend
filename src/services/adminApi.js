// services/adminApi.js
// Servicio exclusivo para el panel de administrador

// 🔥 Detecta automáticamente si es local o producción
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : 'https://api-wizzy.onrender.com/api';

console.log('🔍 [WIZZY] API_BASE_URL:', API_BASE_URL);

// Obtener el token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-User-Id': user.id || ''
  };
};

// Manejo de errores de red
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
    throw new Error(error.mensaje || error.error || `Error ${response.status}`);
  }
  return response.json();
};

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== GESTIÓN DE USUARIOS ====================
export const getUsuarios = async (role = null, search = '') => {
  try {
    let url = `${API_BASE_URL}/admin/usuarios`;
    const params = new URLSearchParams();
    if (role && role !== 'TODOS') params.append('role', role);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    throw error;
  }
};

export const cambiarRolUsuario = async (usuarioId, nuevoRol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/usuarios/${usuarioId}/rol`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rol: nuevoRol })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error changing user role:', error);
    throw error;
  }
};

export const eliminarUsuario = async (usuarioId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/usuarios/${usuarioId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ==================== VENDEDORES PENDIENTES ====================
export const getVendedoresPendientes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendedores/pendientes`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    throw error;
  }
};

export const aprobarVendedor = async (vendedorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendedores/${vendedorId}/aprobar`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error approving vendor:', error);
    throw error;
  }
};

export const rechazarVendedor = async (vendedorId, motivo = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendedores/${vendedorId}/rechazar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ motivo })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    throw error;
  }
};

// ==================== GESTIÓN DE PRODUCTOS ====================
export const getProductos = async (tipo = null, search = '') => {
  try {
    let url = `${API_BASE_URL}/admin/productos`;
    const params = new URLSearchParams();
    if (tipo && tipo !== 'TODOS') params.append('tipo', tipo);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching productos:', error);
    throw error;
  }
};

export const eliminarProducto = async (productoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/productos/${productoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const toggleProductoActivo = async (productoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/productos/${productoId}/toggle-activo`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error;
  }
};