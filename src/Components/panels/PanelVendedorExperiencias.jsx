import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Edit3, Save, Lock, Loader2, X, MessageCircle, Phone, MapPin, Anchor, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ContentExperiencias from '../ContentExperiencias';

const PanelVendedorExperiencias = () => {
  const { user, updateUser } = useAuth();
  
  // 🆕 Estados para editar perfil
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilForm, setPerfilForm] = useState({
    nombre: '',
    telefono: '',
    whatsapp: '',
    direccion: '',
    nombreNegocio: '',
    descripcionTienda: '',
    whatsappContacto: '',
    metodoPagoRetiro: '',
    cuentaRetiro: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: ''
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Cargar datos del perfil
  useEffect(() => {
    if (user) {
      cargarPerfilVendedor(user.id);
    }
  }, [user]);

  // 🆕 Cargar perfil completo del vendedor de experiencias
  const cargarPerfilVendedor = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`);
      if (res.ok) {
        const data = await res.json();
        setPerfilForm({
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          whatsapp: data.whatsapp || '',
          direccion: data.direccion || '',
          nombreNegocio: data.nombreNegocio || '',
          descripcionTienda: data.descripcionTienda || '',
          whatsappContacto: data.whatsappContacto || '',
          metodoPagoRetiro: data.metodoPagoRetiro || '',
          cuentaRetiro: data.cuentaRetiro || ''
        });
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  };

  // 🆕 Guardar cambios del perfil
  const guardarPerfil = async (e) => {
    e.preventDefault();
    setEditandoPerfil(true);
    setMensajeExito('');
    
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${user.id}/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: perfilForm.nombre,
          telefono: perfilForm.telefono,
          whatsapp: perfilForm.whatsapp,
          direccion: perfilForm.direccion,
          nombreNegocio: perfilForm.nombreNegocio,
          descripcionTienda: perfilForm.descripcionTienda,
          whatsappContacto: perfilForm.whatsappContacto,
          metodoPagoRetiro: perfilForm.metodoPagoRetiro,
          cuentaRetiro: perfilForm.cuentaRetiro
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMensajeExito(data.mensaje || "✅ Perfil actualizado exitosamente");
        if (updateUser) {
          updateUser({
            ...user,
            nombre: perfilForm.nombre,
            telefono: perfilForm.telefono,
            whatsapp: perfilForm.whatsapp,
            direccionResidencia: perfilForm.direccion,
            nombreNegocio: perfilForm.nombreNegocio,
            descripcionTienda: perfilForm.descripcionTienda,
            whatsappContacto: perfilForm.whatsappContacto
          });
        }
        setTimeout(() => setMensajeExito(''), 3000);
      } else {
        const error = await response.json();
        alert(error.error || "Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Error de conexión al actualizar perfil");
    } finally {
      setEditandoPerfil(false);
    }
  };

  // 🆕 Cambiar contraseña
  const cambiarPassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.passwordNueva !== passwordForm.passwordConfirm) {
      alert("❌ Las contraseñas nuevas no coinciden");
      return;
    }
    
    if (passwordForm.passwordNueva.length < 6) {
      alert("❌ La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    setCambiandoPassword(true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordActual: passwordForm.passwordActual,
          passwordNueva: passwordForm.passwordNueva
        })
      });
      
      if (response.ok) {
        alert("✅ Contraseña actualizada exitosamente");
        setPasswordForm({
          passwordActual: '',
          passwordNueva: '',
          passwordConfirm: ''
        });
      } else {
        const error = await response.json();
        alert(error.error || "Error al cambiar contraseña");
      }
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      alert("Error de conexión al cambiar contraseña");
    } finally {
      setCambiandoPassword(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* MODAL EDITAR PERFIL */}
      {showModalEditar && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModalEditar(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter flex items-center gap-2">
                <Anchor size={16} className="text-purple-600" /> Editar Perfil de Vendedor de Experiencias
              </h3>
              <button onClick={() => setShowModalEditar(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              {mensajeExito && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">{mensajeExito}</p>
                </div>
              )}
              
              {/* Formulario de datos personales */}
              <form onSubmit={guardarPerfil} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <User size={10} /> Nombre completo
                  </label>
                  <input
                    type="text"
                    value={perfilForm.nombre}
                    onChange={(e) => setPerfilForm({...perfilForm, nombre: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <Anchor size={10} /> Nombre del Negocio
                  </label>
                  <input
                    type="text"
                    value={perfilForm.nombreNegocio}
                    onChange={(e) => setPerfilForm({...perfilForm, nombreNegocio: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <MessageCircle size={10} /> Descripción de la Experiencia
                  </label>
                  <textarea
                    rows="3"
                    value={perfilForm.descripcionTienda}
                    onChange={(e) => setPerfilForm({...perfilForm, descripcionTienda: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Describe tus experiencias, qué ofreces, detalles del tour, etc."
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <Phone size={10} /> Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={perfilForm.telefono}
                    onChange={(e) => setPerfilForm({...perfilForm, telefono: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <MessageCircle size={10} /> WhatsApp de Contacto
                  </label>
                  <input
                    type="tel"
                    value={perfilForm.whatsappContacto}
                    onChange={(e) => setPerfilForm({...perfilForm, whatsappContacto: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <MapPin size={10} /> Dirección / Punto de Encuentro
                  </label>
                  <input
                    type="text"
                    value={perfilForm.direccion}
                    onChange={(e) => setPerfilForm({...perfilForm, direccion: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Muelle, puerto o punto de encuentro"
                  />
                </div>
                
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CreditCard size={10} /> Configuración de Retiros
                  </p>
                  
                  <div className="mb-3">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Método de Pago para Retiros
                    </label>
                    <select
                      value={perfilForm.metodoPagoRetiro}
                      onChange={(e) => setPerfilForm({...perfilForm, metodoPagoRetiro: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="">Seleccionar método</option>
                      <option value="nequi">Nequi</option>
                      <option value="daviplata">Daviplata</option>
                      <option value="bancolombia">Bancolombia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Número de Cuenta / Celular
                    </label>
                    <input
                      type="text"
                      value={perfilForm.cuentaRetiro}
                      onChange={(e) => setPerfilForm({...perfilForm, cuentaRetiro: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="Número de celular o cuenta bancaria"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={editandoPerfil}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  {editandoPerfil ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editandoPerfil ? "Guardando..." : "Guardar Cambios"}
                </button>
              </form>
              
              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[8px]">
                  <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">Cambiar Contraseña</span>
                </div>
              </div>
              
              {/* Formulario de cambio de contraseña */}
              <form onSubmit={cambiarPassword} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <Lock size={10} /> Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={passwordForm.passwordActual}
                    onChange={(e) => setPasswordForm({...passwordForm, passwordActual: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <Lock size={10} /> Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.passwordNueva}
                    onChange={(e) => setPasswordForm({...passwordForm, passwordNueva: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    required
                    minLength={6}
                  />
                  <p className="text-[7px] text-slate-400 mt-1">Mínimo 6 caracteres</p>
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <Lock size={10} /> Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordForm.passwordConfirm}
                    onChange={(e) => setPasswordForm({...passwordForm, passwordConfirm: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={cambiandoPassword}
                  className="w-full bg-slate-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {cambiandoPassword ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
                  {cambiandoPassword ? "Cambiando..." : "Cambiar Contraseña"}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
            Gestión de <span className="text-violet-600">Experiencias</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Administra tus servicios, tours y alquileres
          </p>
        </div>
        <button 
          onClick={() => setShowModalEditar(true)} 
          className="bg-white border border-purple-200 text-purple-700 px-5 py-2.5 rounded-2xl font-black text-[9px] uppercase tracking-wider hover:bg-purple-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <Edit3 size={14}/> Editar Perfil
        </button>
      </div>
      <ContentExperiencias />
    </div>
  );
};

export default PanelVendedorExperiencias;