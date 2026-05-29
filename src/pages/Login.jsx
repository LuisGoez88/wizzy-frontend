import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowLeft, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Normalización de roles con Opción B
        const rawRole = data.role || data.rol || 'CLIENTE';
        const tipoVendedor = data.tipoVendedor || null;
        
        // Para el frontend, convertimos VENDEDOR + tipoVendedor en un role compuesto
        let finalRole = rawRole.toUpperCase();
        if (finalRole === 'VENDEDOR' && tipoVendedor) {
          finalRole = tipoVendedor.toUpperCase(); // "PRODUCTOS" o "EXPERIENCIAS"
        }

        // Guardamos en el contexto
        login({ 
          ...data, 
          role: finalRole,
          rolOriginal: rawRole,
          tipoVendedor: tipoVendedor
        });
        
        // Persistencia
        localStorage.setItem('userRole', finalRole);
        localStorage.setItem('userName', data.nombre || '');
        localStorage.setItem('userId', data.id || '');
        localStorage.setItem('tipoVendedor', tipoVendedor || '');

        // Redirección basada en el role compuesto
        switch (finalRole) {
          case 'PRODUCTOS':
            navigate('/panel-vendedor-productos');
            break;
          case 'EXPERIENCIAS':
            navigate('/panel-vendedor-experiencias');
            break;
          case 'ADMIN':
            navigate('/dashboard-productos');
            break;
          case 'CLIENTE':
            navigate('/panel-cliente');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(data.mensaje || "Credenciales no válidas.");
      }
    } catch (error) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-[40px] bg-white p-10 shadow-2xl border border-slate-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-3xl font-black text-violet-700 mb-2">
            <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
              <ShoppingBag size={24} />
            </div>
            <span className="tracking-tighter italic">Wizzy</span>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tu Pasaporte a Cartagena</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs font-bold border border-red-100 text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
              <input
                type="email"
                placeholder="ejemplo@wizzy.com"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 pl-12 text-sm outline-none focus:border-violet-200 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 pl-12 text-sm outline-none focus:border-violet-200 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 🆕 LINK DE OLVIDÉ MI CONTRASEÑA */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-[8px] font-black text-slate-400 hover:text-purple-600 transition">
  ¿Olvidaste tu contraseña?
</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-violet-600 p-4 font-black text-white text-xs uppercase tracking-widest shadow-xl shadow-violet-200 transition-all hover:bg-violet-700 active:scale-95 disabled:bg-slate-300 mt-4"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-50">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors">
            <ArrowLeft size={14} /> Volver al Marketplace
          </Link>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ¿No tienes tienda? <Link to="/register" className="text-violet-600 hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;