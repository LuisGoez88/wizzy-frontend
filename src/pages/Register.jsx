import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, Map, Box, ArrowRight, MapPin, Sparkles, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const codigoReferidoUrl = searchParams.get('ref');
  
  const [role, setRole] = useState('CLIENTE'); 
  const [loading, setLoading] = useState(false);
  const [codigoReferidoManual, setCodigoReferidoManual] = useState('');
  const [codigoError, setCodigoError] = useState(null);
  const [codigoValido, setCodigoValido] = useState(null);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', 
    email: '', 
    whatsapp: '', 
    password: '',
    ciudad: '', 
    ubicacionServicio: '', 
    tipoServicio: ''
  });

  useEffect(() => {
    if (codigoReferidoUrl) {
      setCodigoReferidoManual(codigoReferidoUrl);
      verificarCodigo(codigoReferidoUrl);
    }
  }, [codigoReferidoUrl]);

  const verificarCodigo = async (codigo) => {
    if (!codigo || codigo.length < 5) return;
    
    setVerificandoCodigo(true);
    setCodigoError(null);
    setCodigoValido(null);
    
    try {
      // Verificar si el código existe (llamada a un endpoint de verificación)
      const response = await fetch(`http://localhost:8080/api/referidos/verificar/${codigo}`);
      if (response.ok) {
        const data = await response.json();
        if (data.valido) {
          setCodigoValido(true);
          setCodigoError(null);
        } else {
          setCodigoValido(false);
          setCodigoError("Código de referido inválido. Puedes continuar sin él.");
        }
      } else {
        setCodigoValido(false);
        setCodigoError("Código de referido inválido. Puedes continuar sin él.");
      }
    } catch (error) {
      console.error("Error verificando código:", error);
      setCodigoValido(false);
      setCodigoError("Error verificando código. Puedes continuar sin él.");
    } finally {
      setVerificandoCodigo(false);
    }
  };

  const handleCodigoChange = (e) => {
    const valor = e.target.value.toUpperCase();
    setCodigoReferidoManual(valor);
    if (valor.length >= 5) {
      verificarCodigo(valor);
    } else {
      setCodigoError(null);
      setCodigoValido(null);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const autoLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        const rawRole = data.role || 'CLIENTE';
        const tipoVendedor = data.tipoVendedor || null;
        let finalRole = rawRole.toUpperCase();
        if (finalRole === 'VENDEDOR' && tipoVendedor) {
          finalRole = tipoVendedor.toUpperCase();
        }

        login({ 
          ...data, 
          role: finalRole,
          tipoVendedor: tipoVendedor
        });
        
        localStorage.setItem('userRole', finalRole);
        localStorage.setItem('userName', data.nombre || '');
        localStorage.setItem('userId', data.id || '');
        localStorage.setItem('tipoVendedor', tipoVendedor || '');
        localStorage.setItem('token', data.token);

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
      }
    } catch (error) {
      console.error('Error en auto-login:', error);
      navigate('/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const usuarioData = {
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      whatsapp: formData.whatsapp, 
      telefono: formData.whatsapp,
      role: role === 'CLIENTE' ? 'CLIENTE' : 'VENDEDOR', 
      tipoVendedor: role !== 'CLIENTE' ? role : null,
      nombreNegocio: role !== 'CLIENTE' ? `Negocio de ${formData.nombre}` : "Cliente Wizzy",
      cedula: formData.whatsapp,
      direccionResidencia: formData.ciudad || formData.ubicacionServicio || "Cartagena, CO",
      saldoImpulso: 10000.0,
      whatsappContacto: formData.whatsapp 
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/registro', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
        },
        body: JSON.stringify(usuarioData)
      });

      const data = await response.json();

      if (response.ok) {
        // 🆕 ACREDITAR BONO DE BIENVENIDA INMEDIATAMENTE
        try {
          await fetch(`http://localhost:8080/api/referidos/verificar/${data.id}`, {
            method: 'POST'
          });
          console.log('✅ Bono de bienvenida de $10.000 acreditado');
        } catch (bonoError) {
          console.error('Error acreditando bono:', bonoError);
        }

        // Procesar referido si existe y es válido
        const codigoFinal = codigoReferidoManual || codigoReferidoUrl;
        if (codigoFinal && codigoValido === true) {
          try {
            await fetch('http://localhost:8080/api/referidos/procesar-registro', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                codigoReferido: codigoFinal,
                nuevoUsuarioId: data.id
              })
            });
            console.log('✅ Código de referido aplicado');
          } catch (refError) {
            console.error('Error al procesar referido:', refError);
          }
        }
        
        // Iniciar sesión automáticamente
        await autoLogin(formData.email, formData.password);
      } else {
        alert(`Error: ${data.mensaje || "Error en el servidor."}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor de Wizzy.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24 pb-12 font-sans">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Únete a <span className="text-violet-600">Wizzy</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              Marketplace Nacional de Experiencias y Retail
            </p>
            
            {/* 🆕 Mensaje de código válido */}
            {codigoValido === true && (
              <div className="mt-3 bg-emerald-50 rounded-xl p-2 border border-emerald-200">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <p className="text-[8px] font-black text-emerald-700 uppercase tracking-wider">
                    ✅ ¡Código de referido válido! Recibirás $10.000 en incentivos.
                  </p>
                </div>
              </div>
            )}
            
            {/* 🆕 Mensaje de código inválido */}
            {codigoError && codigoValido === false && (
              <div className="mt-3 bg-amber-50 rounded-xl p-2 border border-amber-200">
                <div className="flex items-center gap-2 justify-center">
                  <AlertCircle size={14} className="text-amber-600" />
                  <p className="text-[8px] font-black text-amber-700 uppercase tracking-wider">
                    ⚠️ {codigoError}
                  </p>
                </div>
              </div>
            )}

            {(codigoReferidoUrl && !codigoError) && (
              <div className="mt-3 bg-purple-50 rounded-xl p-2 border border-purple-200">
                <p className="text-[8px] font-black text-purple-700 uppercase tracking-wider">
                  🎉 ¡Has sido invitado por un amigo! Recibirás $10.000 en incentivos.
                </p>
              </div>
            )}
          </div>

          {/* Campo de código de referido */}
          <div className="mb-4">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Gift size={10} /> Código de referido (opcional)
            </label>
            <div className="relative">
              <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                name="codigoReferido"
                value={codigoReferidoManual}
                onChange={handleCodigoChange}
                placeholder="Ej: WIZ-7F3E2D"
                className={`w-full bg-slate-50 border rounded-2xl py-3 pl-12 pr-4 text-[12px] font-medium uppercase outline-none focus:ring-2 transition ${
                  codigoValido === true 
                    ? 'border-emerald-300 focus:ring-emerald-200' 
                    : codigoError 
                      ? 'border-amber-300 focus:ring-amber-200'
                      : 'border-slate-200 focus:ring-violet-200'
                }`}
              />
              {verificandoCodigo && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-600 border-t-transparent"></div>
                </div>
              )}
              {codigoValido === true && !verificandoCodigo && (
                <CheckCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600" />
              )}
            </div>
            <p className="text-[6px] text-slate-400 mt-1">
              {codigoValido === true 
                ? "✅ Código válido. Recibirás $10.000 en incentivos al registrarte."
                : "¿Tienes un código de invitación? ¡Ingrésalo aquí!"}
            </p>
          </div>

          <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
            {[
              { id: 'CLIENTE', icon: <User size={16} />, label: 'Usuarios' },
              { id: 'PRODUCTOS', icon: <Box size={16} />, label: 'Productos' },
              { id: 'EXPERIENCIAS', icon: <Map size={16} />, label: 'Experiencias' }
            ].map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => setRole(tipo.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 ${
                  role === tipo.id 
                  ? 'bg-white text-violet-700 shadow-md ring-1 ring-slate-200 scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tipo.icon}
                <span className="text-[8px] font-black uppercase tracking-tighter">{tipo.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" name="nombre" placeholder="Nombre Completo" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-violet-200" onChange={handleInputChange} required />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" name="email" placeholder="Correo Electrónico" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-violet-200" onChange={handleInputChange} required />
            </div>

            {role === 'PRODUCTOS' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" size={18} />
                  <input type="text" name="ciudad" placeholder="Ciudad de despacho" className="w-full bg-violet-50/50 border border-violet-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase placeholder:text-violet-400 outline-none" onChange={handleInputChange} required />
                </div>
              </div>
            )}

            {role === 'EXPERIENCIAS' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input type="text" name="ubicacionServicio" placeholder="Ubicación del Servicio" className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase placeholder:text-emerald-400 outline-none" onChange={handleInputChange} required />
                </div>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <select name="tipoServicio" className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase text-slate-500 appearance-none outline-none" onChange={handleInputChange} required>
                    <option value="">Tipo de Experiencia</option>
                    <option value="NAUTICA">Náutica / Yates</option>
                    <option value="ESTANCIA">Chalets / Hospedaje</option>
                    <option value="TOUR">Tours / Pasadías</option>
                    <option value="GASTRO">Gastronomía / Eventos</option>
                  </select>
                </div>
              </div>
            )}

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="tel" name="whatsapp" placeholder="WhatsApp / Teléfono" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-violet-200" onChange={handleInputChange} required />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" name="password" placeholder="Contraseña" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold uppercase placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-violet-200" onChange={handleInputChange} required />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:bg-slate-300"
            >
              {loading ? 'Procesando...' : `Registrar ${role === 'CLIENTE' ? 'Usuario' : 'Perfil'}`} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              ¿Ya tienes una cuenta?{' '}
              <button type="button" onClick={() => navigate('/login')} className="text-violet-600 hover:underline">Inicia Sesión</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}