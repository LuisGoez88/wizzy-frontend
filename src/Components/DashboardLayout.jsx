import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Calendar, Wallet, 
  Settings, LogOut, Bell, ShoppingBag, User,
  MessageCircle, ShieldCheck, MapPin, Users,
  Heart, Ticket, Star, ArrowLeft, X, CheckCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Importamos los contenidos
import ContentResumen from './ContentResumen'; 
import ContentProductos from './ContentProductos'; 
import ContentPedidos from './ContentPedidos';
import ContentPedidosCliente from './ContentPedidosCliente';
import ContentBilletera from './ContentBilletera'; 
import ContentExperiencias from './ContentExperiencias';
import ContentReservasExperiencias from './ContentReservasExperiencias';
import AnalyticsDashboard from './AnalyticsDashboard';
import PanelCliente from './panels/PanelCliente.jsx';

import Notificaciones from './Notificaciones';
import SaldoIncentivos from './SaldoIncentivos';

import AdminSidebar from './AdminSidebar';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsuarios from '../pages/admin/AdminUsuarios';
import AdminVendedores from '../pages/admin/AdminVendedores';
import AdminProductos from '../pages/admin/AdminProductos';
import AdminReportes from '../pages/admin/AdminReportes';

const DashboardLayout = ({ role = 'CLIENTE', user = {} }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);
  
  // 🆕 DETECTAR SI ES ADMIN
  const esAdmin = role === 'ADMIN';
  
  // Determinar el tipo real de vendedor si aplica
  const esVendedorProductos = role === 'PRODUCTOS' || (role === 'VENDEDOR' && user?.tipoVendedor === 'PRODUCTOS');
  const esVendedorExperiencias = role === 'EXPERIENCIAS' || (role === 'VENDEDOR' && user?.tipoVendedor === 'EXPERIENCIAS');
  const esCliente = role === 'CLIENTE';
  
  // Estado inicial según el tipo
  const [seccionActiva, setSeccionActiva] = useState(() => {
    // 🆕 Si es admin, mostrar dashboard por defecto
    if (esAdmin) return 'dashboard';
    if (esCliente) return 'Mi Panel';
    if (esVendedorProductos) return 'Inventario';
    if (esVendedorExperiencias) return 'Mis Experiencias';
    return 'Resumen';
  });

  // Obtener ID del usuario actual
  const usuarioId = user?.id || localStorage.getItem('userId');

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    if (!usuarioId) return;
    setCargandoNotificaciones(true);
    try {
      const response = await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data);
        const noLeidas = data.filter(n => !n.leido).length;
        setNotificacionesNoLeidas(noLeidas);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setCargandoNotificaciones(false);
    }
  };

  // Marcar notificación como leída
  const marcarComoLeida = async (notificacionId) => {
    try {
      await fetch(`http://localhost:8080/api/notificaciones/${notificacionId}/leer`, {
        method: 'PATCH'
      });
      setNotificaciones(prev => prev.map(n => 
        n.id === notificacionId ? { ...n, leido: true } : n
      ));
      setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando notificación:", error);
    }
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    if (!usuarioId) return;
    try {
      await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}/leer-todas`, {
        method: 'PATCH'
      });
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
      setNotificacionesNoLeidas(0);
    } catch (error) {
      console.error("Error marcando todas:", error);
    }
  };

  // Limpiar todas las notificaciones
  const limpiarNotificaciones = async () => {
    if (!usuarioId) return;
    if (!window.confirm("¿Eliminar todas las notificaciones?")) return;
    try {
      await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}/limpiar`, {
        method: 'DELETE'
      });
      setNotificaciones([]);
      setNotificacionesNoLeidas(0);
    } catch (error) {
      console.error("Error limpiando notificaciones:", error);
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [usuarioId]);

  const abrirSoporte = () => {
    let mensaje = "Hola Wizzy, necesito ayuda.";
    if (esAdmin) mensaje = "Hola Wizzy, necesito ayuda con el panel de administración.";
    if (esCliente) mensaje = "Hola Wizzy, necesito ayuda con mis puntos o un plan grupal.";
    if (esVendedorExperiencias) mensaje = "Hola Wizzy, ayuda con mi panel de Experiencias.";
    if (esVendedorProductos) mensaje = "Hola Wizzy, ayuda con mi panel de Productos.";
    
    window.open(`https://wa.me/573000000000?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // 🆕 RENDERIZAR CONTENIDO PARA ADMIN
  const renderAdminContent = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'usuarios':
        return <AdminUsuarios />;
      case 'vendedores':
        return <AdminVendedores />;
      case 'productos':
        return <AdminProductos />;
      case 'reportes':
        return <AdminReportes />;
      case 'Billetera':
        return <ContentBilletera />;
      case 'Ajustes':
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Settings className="text-purple-600" /> Configuración de Administrador
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-[25px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Administrador</p>
                    <p className="font-bold text-slate-800">{user?.nombre || localStorage.getItem('userName') || 'Admin Wizzy'}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[25px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="font-bold text-slate-800">{user?.email || 'admin@wizzy.com'}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-purple-50 rounded-[25px] border border-purple-100">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Rol</p>
                    <div className="flex items-center gap-2 text-purple-700 font-bold uppercase text-[10px]">
                      <ShieldCheck size={18} /> Administrador de Plataforma
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  // RENDERIZAR CONTENIDO PARA NO ADMIN (CLIENTE/VENDEDOR)
  const renderContent = () => {
    switch (seccionActiva) {
      // ==================== PANEL CLIENTE ====================
      case 'Mi Panel': 
        return <PanelCliente />;
      case 'Mis Compras': 
        if (esCliente) return <ContentPedidosCliente />;
        return <ContentPedidos />;
      
      // ==================== PANEL VENDEDOR PRODUCTOS ====================
      case 'Inventario': 
        return <ContentProductos />;
      case 'Pedidos': 
        return <ContentPedidos />;
      
      // ==================== PANEL VENDEDOR EXPERIENCIAS ====================
      case 'Mis Experiencias': 
        return <ContentExperiencias />;
      case 'Reservas': 
        return <ContentReservasExperiencias />;
      
      // ==================== ANALYTICS (AMBOS VENDEDORES) ====================
      case 'Analytics': 
        return <AnalyticsDashboard vendedorId={usuarioId} tipoVendedor={role} />;
      
      // ==================== COMPARTIDOS ====================
      case 'Billetera': 
        return <ContentBilletera />;
      case 'Ajustes': 
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Settings className="text-purple-600" /> Mi Perfil Wizzy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-[25px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                    <p className="font-bold text-slate-800">{localStorage.getItem('userName') || 'Usuario Wizzy'}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-purple-50 rounded-[25px] border border-purple-100">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Estado de Cuenta</p>
                    <div className="flex items-center gap-2 text-purple-700 font-bold uppercase text-[10px]">
                      <ShieldCheck size={18} /> 
                      {esCliente && 'Miembro Verificado'}
                      {esVendedorProductos && 'Vendedor Premium'}
                      {esVendedorExperiencias && 'Partner Gold'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default: 
        if (esCliente) return <PanelCliente />;
        if (esVendedorProductos) return <ContentProductos />;
        if (esVendedorExperiencias) return <ContentExperiencias />;
        return <ContentResumen />;
    }
  };

  const getHeaderText = () => {
    if (esAdmin) return 'Administrador';
    if (esCliente) return 'Cliente VIP';
    if (esVendedorProductos) return 'Vendedor de Productos';
    if (esVendedorExperiencias) return 'Vendedor de Experiencias';
    return 'Dashboard';
  };

  const getHeaderSubtext = () => {
    if (esAdmin) {
      const subtexts = {
        'dashboard': 'Visión general',
        'usuarios': 'Gestionar usuarios',
        'vendedores': 'Aprobar vendedores',
        'productos': 'Gestionar productos',
        'reportes': 'Estadísticas avanzadas',
        'Billetera': 'Transacciones',
        'Ajustes': 'Configuración'
      };
      return subtexts[seccionActiva] || seccionActiva;
    }
    return seccionActiva;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return 'Hace unos segundos';
    if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
    return `Hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
  };

  // 🆕 SI ES ADMIN, USA EL SIDEBAR DE ADMIN
  if (esAdmin) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <AdminSidebar 
          seccionActiva={seccionActiva}
          setSeccionActiva={setSeccionActiva}
          onCerrarSesion={() => logout()}
        />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10">
            <div>
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Administrador / {getHeaderSubtext()}
              </h1>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Panel de control de la plataforma Wizzy
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* 🆕 SALDO DE INCENTIVOS */}
              <SaldoIncentivos usuarioId={usuarioId} />

              <div className="relative">
                <button 
                  onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                  className="relative text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
                >
                  <Bell size={20} />
                  {notificacionesNoLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1">
                      {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                    </span>
                  )}
                </button>

                {mostrarNotificaciones && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                      <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                        Notificaciones
                        {notificacionesNoLeidas > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                            {notificacionesNoLeidas} nueva{notificacionesNoLeidas !== 1 ? 's' : ''}
                          </span>
                        )}
                      </h3>
                      <div className="flex gap-2">
                        {notificaciones.length > 0 && (
                          <button 
                            onClick={marcarTodasComoLeidas}
                            className="text-[8px] font-black text-purple-600 hover:underline"
                          >
                            Marcar todas
                          </button>
                        )}
                        <button 
                          onClick={() => setMostrarNotificaciones(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {cargandoNotificaciones ? (
                        <div className="p-8 text-center">
                          <div className="animate-pulse text-purple-600 text-[10px]">Cargando...</div>
                        </div>
                      ) : notificaciones.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-[9px] text-slate-400">No hay notificaciones</p>
                        </div>
                      ) : (
                        notificaciones.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ${!notif.leido ? 'bg-purple-50/30' : ''}`}
                            onClick={() => marcarComoLeida(notif.id)}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.leido ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <CheckCircle size={14} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className={`text-[10px] font-bold ${!notif.leido ? 'text-slate-800' : 'text-slate-500'}`}>
                                  {notif.mensaje}
                                </p>
                                <p className="text-[8px] text-slate-400 mt-1">
                                  {formatFecha(notif.fecha)}
                                </p>
                              </div>
                              {!notif.leido && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notificaciones.length > 0 && (
                      <div className="p-3 border-t border-slate-100 bg-slate-50">
                        <button 
                          onClick={limpiarNotificaciones}
                          className="w-full text-[8px] font-black text-red-500 uppercase tracking-wider hover:text-red-600 transition"
                        >
                          Limpiar todas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-800 uppercase">
                    {user?.nombre?.split(' ')[0] || localStorage.getItem('userName')?.split(' ')[0] || 'Admin'}
                  </p>
                  <p className="text-[8px] font-bold text-purple-500 uppercase tracking-tighter">
                    Administrador
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto p-10 bg-[#FBFBFF]">
            {renderAdminContent()}
          </section>
        </main>
      </div>
    );
  }

  // RENDER PARA CLIENTES Y VENDEDORES (CÓDIGO ORIGINAL)
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20">
        <div className="p-8 flex items-center gap-3 text-purple-700 font-black text-2xl tracking-tighter">
          <ShoppingBag size={28} className="text-purple-600" />
          Wizzy <span className="text-[10px] not-italic text-slate-400 uppercase tracking-widest font-bold ml-1">
            {esCliente && 'Cliente VIP'}
            {esVendedorProductos && 'Vendedor'}
            {esVendedorExperiencias && 'Experiencias'}
          </span>
        </div>

        <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
          {esCliente && (
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] bg-slate-900 text-white shadow-lg hover:bg-purple-600 transition-all mb-6"
            >
              <ArrowLeft size={20}/> Volver a la Tienda
            </button>
          )}

          {esCliente && (
            <>
              <button onClick={() => setSeccionActiva('Mi Panel')}
                className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Mi Panel' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                <LayoutDashboard size={20}/> Mi Panel
              </button>
              <button onClick={() => setSeccionActiva('Mis Compras')}
                className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Mis Compras' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Ticket size={20}/> Mis Compras
              </button>
            </>
          )}

          {esVendedorProductos && (
            <>
              <button onClick={() => setSeccionActiva('Inventario')}
                className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Inventario' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Package size={20}/> Inventario
              </button>
              <button onClick={() => setSeccionActiva('Pedidos')}
                className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Pedidos' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                <ShoppingBag size={20}/> Pedidos
              </button>
            </>
          )}

          {esVendedorExperiencias && (
            <>
              <button onClick={() => setSeccionActiva('Mis Experiencias')}
                className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Mis Experiencias' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                <MapPin size={20}/> Mis Experiencias
              </button>
              <button onClick={() => setSeccionActiva('Reservas')}
                className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Reservas' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Calendar size={20}/> Reservas
              </button>
            </>
          )}

          {/* BOTÓN DE ANALYTICS - Para ambos vendedores */}
          {(esVendedorProductos || esVendedorExperiencias) && (
            <button onClick={() => setSeccionActiva('Analytics')}
              className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Analytics' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
              <BarChart3 size={20}/> Wizzy Analytics
            </button>
          )}

          <button onClick={() => setSeccionActiva('Billetera')}
            className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Billetera' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Wallet size={20}/> Billetera
          </button>

          <button onClick={() => setSeccionActiva('Ajustes')}
            className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${seccionActiva === 'Ajustes' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Settings size={20}/> Ajustes
          </button>
        </nav>

        <div className="p-8 space-y-4">
          <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100">
             <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">Wizzy Soporte</p>
             <button onClick={abrirSoporte}
               className="text-[10px] font-black text-purple-600 uppercase hover:underline flex items-center gap-2">
               <MessageCircle size={14} /> WhatsApp VIP
             </button>
          </div>
          <button onClick={() => logout()}
            className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase text-red-400 hover:bg-red-50 rounded-[20px] transition-all">
            <LogOut size={20}/> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10">
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {getHeaderText()} / {seccionActiva}
            </h1>
            <div className="flex items-center gap-6">
              {/* 🆕 SALDO DE INCENTIVOS */}
              <SaldoIncentivos usuarioId={usuarioId} />

              <div className="relative">
                <button 
                  onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                  className="relative text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
                >
                  <Bell size={20} />
                  {notificacionesNoLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1">
                      {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                    </span>
                  )}
                </button>

                {mostrarNotificaciones && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                      <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                        Notificaciones
                        {notificacionesNoLeidas > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                            {notificacionesNoLeidas} nueva{notificacionesNoLeidas !== 1 ? 's' : ''}
                          </span>
                        )}
                      </h3>
                      <div className="flex gap-2">
                        {notificaciones.length > 0 && (
                          <button 
                            onClick={marcarTodasComoLeidas}
                            className="text-[8px] font-black text-purple-600 hover:underline"
                          >
                            Marcar todas
                          </button>
                        )}
                        <button 
                          onClick={() => setMostrarNotificaciones(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {cargandoNotificaciones ? (
                        <div className="p-8 text-center">
                          <div className="animate-pulse text-purple-600 text-[10px]">Cargando...</div>
                        </div>
                      ) : notificaciones.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-[9px] text-slate-400">No hay notificaciones</p>
                        </div>
                      ) : (
                        notificaciones.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ${!notif.leido ? 'bg-purple-50/30' : ''}`}
                            onClick={() => marcarComoLeida(notif.id)}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.leido ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <CheckCircle size={14} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className={`text-[10px] font-bold ${!notif.leido ? 'text-slate-800' : 'text-slate-500'}`}>
                                  {notif.mensaje}
                                </p>
                                <p className="text-[8px] text-slate-400 mt-1">
                                  {formatFecha(notif.fecha)}
                                </p>
                              </div>
                              {!notif.leido && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notificaciones.length > 0 && (
                      <div className="p-3 border-t border-slate-100 bg-slate-50">
                        <button 
                          onClick={limpiarNotificaciones}
                          className="w-full text-[8px] font-black text-red-500 uppercase tracking-wider hover:text-red-600 transition"
                        >
                          Limpiar todas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-800 uppercase">
                    {localStorage.getItem('userName')?.split(' ')[0] || 'Usuario'}
                  </p>
                  <p className="text-[8px] font-bold text-purple-500 uppercase tracking-tighter">
                    {esCliente && 'Cliente Wizzy'}
                    {esVendedorProductos && 'Vendedor Premium'}
                    {esVendedorExperiencias && 'Partner Gold'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <User size={20} />
                </div>
              </div>
            </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 bg-[#FBFBFF]">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;