// pages/ForgotPasswordCode.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, MessageCircle, ArrowLeft, CheckCircle, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';

const ForgotPasswordCode = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [metodo, setMetodo] = useState('email');
  const [step, setStep] = useState(1); // 1: email, 2: codigo, 3: nueva pass
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const solicitarCodigo = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/solicitar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, metodo })
      });
      
      const data = await response.json();
      
      if (data.success !== false) {
        setStep(2);
      } else {
        setError(data.error || 'Error al enviar el código');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();
    if (!codigo || codigo.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nuevaPassword: '' })
      });
      
      const data = await response.json();
      
      if (data.success !== false) {
        setStep(3);
      } else {
        setError(data.error || 'Código inválido');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetearPassword = async (e) => {
    e.preventDefault();
    
    if (!nuevaPassword || nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (nuevaPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nuevaPassword })
      });
      
      const data = await response.json();
      
      if (data.success !== false) {
        setSuccess(true);
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

  if (success) {
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

        {step === 1 && (
          <>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Recuperar contraseña</h1>
            <p className="text-[10px] text-slate-500 mb-8">
              Ingresa tu correo electrónico y te enviaremos un código de verificación
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" />
                <p className="text-[9px] text-red-600 font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={solicitarCodigo} className="space-y-6">
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

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Recibir código por
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMetodo('email')}
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition flex items-center justify-center gap-2 ${
                      metodo === 'email'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Mail size={14} /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodo('whatsapp')}
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition flex items-center justify-center gap-2 ${
                      metodo === 'whatsapp'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Enviar código'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Verifica tu código</h1>
            <p className="text-[10px] text-slate-500 mb-8">
              Ingresa el código de 6 dígitos que enviamos a <span className="font-black text-purple-600">{email}</span>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" />
                <p className="text-[9px] text-red-600 font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={verificarCodigo} className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-mono font-black tracking-widest bg-slate-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-200"
                  maxLength={6}
                  required
                />
                <p className="text-[7px] text-slate-400 mt-2 text-center">
                  Revisa tu {metodo === 'email' ? 'correo' : 'WhatsApp'} (también revisa la consola del backend)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Verificar código'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
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

            <form onSubmit={resetearPassword} className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
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
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link to="/login" className="text-[9px] text-slate-500 hover:text-purple-600 transition flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordCode;