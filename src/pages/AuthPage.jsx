import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Ship, ShoppingBag } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('COMPRADOR'); // Rol por defecto
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Simulación de endpoint: aquí conectarías con tu /api/usuarios/login o register
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      // Lógica de redirección basada en el ROL
      if (role === 'VENDEDOR') {
        // Si vende yates o productos, tú decides a qué dashboard enviarlo
        // Por ahora lo enviamos al de productos como base
        navigate('/dashboard-productos');
      } else {
        navigate('/'); // Comprador vuelve a la Home
      }
      
      // Nota: Aquí guardarías el token o el usuario en un Context o LocalStorage
      localStorage.setItem('userRole', role);
      
    } catch (error) {
      console.error("Error en la autenticación", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white">
        
        {/* Lado Izquierdo: Visual & Branding */}
        <div className="md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 blur-[100px]"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black italic text-violet-400 mb-2">Wizzy</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Marketplace de Experiencias & Retail</p>
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl font-black leading-tight mb-6">Conecta con lo mejor de <span className="text-violet-500">Cartagena.</span></h2>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                 <Ship size={18} className="text-violet-400" />
                 <span className="text-xs font-bold uppercase">Yates</span>
               </div>
               <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                 <ShoppingBag size={18} className="text-emerald-400" />
                 <span className="text-xs font-bold uppercase">Tech</span>
               </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="md:w-1/2 p-12 bg-white">
          <div className="max-w-md mx-auto">
            <div className="flex gap-8 mb-10 border-b border-slate-100">
              <button 
                onClick={() => setIsLogin(true)}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${isLogin ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-300'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${!isLogin ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-300'}`}
              >
                Registro
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 focus:ring-violet-200" placeholder="Ej. Luis Goez" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input type="email" required className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 focus:ring-violet-200" placeholder="nombre@wizzy.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input type="password" required className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm outline-none focus:ring-2 focus:ring-violet-200" placeholder="••••••••" />
                </div>
              </div>

              {/* Selector de Rol Dinámico */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">¿Qué quieres hacer en Wizzy?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole('COMPRADOR')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'COMPRADOR' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 text-slate-400'}`}
                  >
                    <ShoppingBag size={20} />
                    <span className="text-[10px] font-black uppercase">Quiero Comprar</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('VENDEDOR')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'VENDEDOR' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 text-slate-400'}`}
                  >
                    <Ship size={20} />
                    <span className="text-[10px] font-black uppercase">Quiero Vender</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-violet-600 transition-all shadow-xl shadow-slate-200">
                {isLogin ? 'Entrar a Wizzy' : 'Crear Cuenta'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;