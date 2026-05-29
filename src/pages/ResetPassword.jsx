// pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [tokenValido, setTokenValido] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValido(false);
      setError('Token de recuperación no válido');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword: password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        setExito(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValido) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Token inválido</h2>
          <p className="text-[10px] text-slate-500 mb-6">
            El link de recuperación no es válido o ha expirado.
          </p>
          <Link to="/forgot-password" className="text-[10px] font-black text-purple-600 hover:underline">
            Solicitar nuevo link
          </Link>
        </div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">¡Contraseña actualizada!</h2>
          <p className="text-[10px] text-slate-500 mb-6">
            Tu contraseña ha sido restablecida exitosamente.
          </p>
          <p className="text-[8px] text-slate-400">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-purple-100 p-2 rounded-lg">
            <ShoppingBag size={20} className="text-purple-600" />
          </div>
          <span className="text-xl font-black text-purple-700 tracking-tighter">Wizzy</span>
        </div>

        <h1 className="text-2xl font-black text-slate-800 mb-2">Nueva contraseña</h1>
        <p className="text-[10px] text-slate-500 mb-8">
          Ingresa tu nueva contraseña
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            <p className="text-[9px] text-red-600 font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Restablecer contraseña'}
          </button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-[9px] text-slate-500 hover:text-purple-600 transition">
            Volver al inicio de sesión
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;