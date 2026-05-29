// Components/AdminSidebar.jsx
import React from 'react';
import { 
  LayoutDashboard, Users, UserCheck, Package, BarChart3,
  Settings, LogOut, ShoppingBag, ShieldCheck, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ seccionActiva, setSeccionActiva, onCerrarSesion }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', titulo: 'Dashboard', icono: LayoutDashboard, descripcion: 'Visión general' },
    { id: 'usuarios', titulo: 'Usuarios', icono: Users, descripcion: 'Gestionar usuarios' },
    { id: 'vendedores', titulo: 'Vendedores', icono: UserCheck, descripcion: 'Aprobar vendedores' },
    { id: 'productos', titulo: 'Productos', icono: Package, descripcion: 'Gestionar productos' },
    { id: 'reportes', titulo: 'Reportes', icono: BarChart3, descripcion: 'Estadísticas avanzadas' }
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20 h-screen">
      {/* Logo - fijo arriba */}
      <div className="flex-shrink-0 p-8 flex items-center gap-3 text-purple-700 font-black text-2xl tracking-tighter border-b border-slate-100">
        <div className="bg-purple-100 p-2 rounded-xl">
          <ShieldCheck size={24} className="text-purple-600" />
        </div>
        <div>
          <span>Wizzy Admin</span>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Panel de Control
          </p>
        </div>
      </div>

      {/* Información del admin */}
      <div className="flex-shrink-0 p-6 bg-purple-50/30 mx-4 mt-4 rounded-2xl border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Eye size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">
              Administrador
            </p>
            <p className="text-[10px] font-bold text-purple-700">
              {user?.nombre?.split(' ')[0] || 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Menú de navegación - scrollable si es necesario */}
      <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icono = item.icono;
          const isActive = seccionActiva === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setSeccionActiva(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-purple-600'
              }`}
            >
              <Icono size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-600'} />
              <div className="flex-1 text-left">
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  isActive ? 'text-white' : 'text-slate-600'
                }`}>
                  {item.titulo}
                </p>
                <p className={`text-[7px] font-bold uppercase tracking-wider mt-0.5 ${
                  isActive ? 'text-white/70' : 'text-slate-400'
                }`}>
                  {item.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer - siempre visible abajo */}
      <div className="flex-shrink-0 p-6 border-t border-slate-100">
        <div className="bg-slate-50 p-4 rounded-2xl mb-4">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Soporte Wizzy
          </p>
          <p className="text-[7px] text-slate-500 mb-3">
            ¿Necesitas ayuda con el panel?
          </p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-xl text-[8px] font-black uppercase tracking-wider hover:bg-purple-700 transition">
            Contactar Soporte
          </button>
        </div>
        
        {/* 🔥 BOTÓN DE CERRAR SESIÓN - AHORA VISIBLE */}
        <button
          onClick={onCerrarSesion}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;