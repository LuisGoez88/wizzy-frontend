// pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success !== false) {
        setEnviado(true);
      } else {
        setError(data.error || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Revisa tu correo</h2>
          <p className="text-[10px] text-slate-500 mb-6">
            Hemos enviado un link de recuperación a <span className="font-black text-purple-600">{email}</span>
          </p>
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <p className="text-[8px] text-amber-700 font-black uppercase tracking-wider">
              📧 Modo desarrollo
            </p>
            <p className="text-[9px] text-amber-600 mt-1">
              Revisa la consola del backend para ver el token de recuperación
            </p>
          </div>
          <Link to="/login" className="text-[10px] font-black text-purple-600 hover:underline">
            Volver al inicio de sesión
          </Link>
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

        <h1 className="text-2xl font-black text-slate-800 mb-2">¿Olvidaste tu contraseña?</h1>
        <p className="text-[10px] text-slate-500 mb-8">
          Ingresa tu correo electrónico y te enviaremos un link para restablecerla
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
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
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
            {loading ? 'Enviando...' : 'Enviar link de recuperación'}
          </button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-[9px] text-slate-500 hover:text-purple-600 transition">
            <ArrowLeft size={12} /> Volver al inicio de sesión
          </Link>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[7px] text-slate-400 text-center">
            Si no recibes el correo, revisa tu carpeta de spam o contacta a soporte
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;