import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wallet, Users, Target, Crown, MessageCircle, 
  Plus, Copy, Anchor, Zap, Clock, CheckCircle,
  Share2, QrCode, CreditCard, TrendingUp, Gift,
  History, ChevronRight, Star, Coffee, Ship, Sun, Heart,
  Loader2, X, Calendar as CalendarIcon, Trash2, User, Mail, Phone, MapPin, Edit3, Save, Lock, AlertTriangle, Ticket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ModalConfirmacion from '../Modales/ModalConfirmacion';
import ModalExito from '../Modales/ModalExito';
import ModalError from '../Modales/ModalError';
import ModalInfo from '../Modales/ModalInfo';
import ReferidosPanel from '../ReferidosPanel';
import RegalarIncentivosModal from '../RegalarIncentivosModal';
import CanjearRegaloModal from '../CanjearRegaloModal';




// 🆕 Componente Tooltip personalizado
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 px-2 py-1 text-[8px] font-black text-white bg-gray-900 rounded-md whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-1">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

const PanelCliente = () => {
  const { user, updateUser } = useAuth(); 
  
  const [usuario, setUsuario] = useState({
    nombre: user?.nombre || 'Explorador Wizzy',
    saldoImpulso: user?.saldoImpulso || 1240500,
    nivel: user?.nivel || 'SILVER',
    metaNombre: 'Atardecer en Yate VIP',
    metaValor: 1200000,
    documento: user?.documento || '',
  });

  const [misPlanes, setMisPlanes] = useState([]);
  const [historialSaldo, setHistorialSaldo] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [cargandoWishlist, setCargandoWishlist] = useState(false);
  
  // Estado para feedback de copiar
  const [copiandoIndex, setCopiandoIndex] = useState(null);
  
  // Estado para detectar cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalPerfilForm, setOriginalPerfilForm] = useState({
    nombre: '',
    telefono: '',
    whatsapp: '',
    direccion: ''
  });
  
  // Estados para el modal de crear plan
  const [showModalPlan, setShowModalPlan] = useState(false);
  const [experienciasDisponibles, setExperienciasDisponibles] = useState([]);
  const [nuevoPlan, setNuevoPlan] = useState({
    experienciaId: '',
    numPersonas: 2,
    fecha: '',
    hora: '',
    comentario: ''
  });

  // 🆕 Estados para unirse a plan grupal
  const [showModalUnirse, setShowModalUnirse] = useState(false);
  const [codigoParaUnirse, setCodigoParaUnirse] = useState('');
  const [unirseLoading, setUnirseLoading] = useState(false);

  // 🆕 Estados para modales de regalos
  const [showModalRegalarIncentivos, setShowModalRegalarIncentivos] = useState(false);
  const [showModalCanjearRegalo, setShowModalCanjearRegalo] = useState(false);

  // Estados para editar perfil
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilForm, setPerfilForm] = useState({
    nombre: '',
    telefono: '',
    whatsapp: '',
    direccion: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: ''
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados para modal de cancelación
  const [showModalCancelar, setShowModalCancelar] = useState(false);
  const [planACancelar, setPlanACancelar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [cancelandoPlan, setCancelandoPlan] = useState(false);

  // Estados para modales globales
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, action: null, mensaje: '' });
  const [modalExito, setModalExito] = useState({ isOpen: false, mensaje: '', subMensaje: '' });
  const [modalError, setModalError] = useState({ isOpen: false, mensaje: '', detalle: '' });
  const [modalInfo, setModalInfo] = useState({ isOpen: false, titulo: '', mensaje: '' });

  // Función para verificar si hay cambios sin guardar
  const checkUnsavedChanges = () => {
    return (
      perfilForm.nombre !== originalPerfilForm.nombre ||
      perfilForm.telefono !== originalPerfilForm.telefono ||
      perfilForm.whatsapp !== originalPerfilForm.whatsapp ||
      perfilForm.direccion !== originalPerfilForm.direccion
    );
  };

  // Efecto para detectar cambios en el formulario
  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges());
  }, [perfilForm]);

  // Efecto para manejar el evento beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (showModalEditar && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showModalEditar, hasUnsavedChanges]);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setUsuario(prev => ({
        ...prev,
        nombre: user.nombre,
        saldoImpulso: user.saldoImpulso || 1240500,
        nivel: user.nivel || 'SILVER',
        documento: user.documento || ''
      }));
      cargarPerfilUsuario(user.id);
      cargarHistorialSaldo(user.id);
      cargarReservas(user.id);
      cargarWishlistReal(user.id);
      cargarExperienciasDisponibles();
      cargarPlanesGrupales();
    }
  }, [user]);

  // Validar formato de WhatsApp
  const validarWhatsApp = (whatsapp) => {
    const numeroLimpio = whatsapp.replace(/\D/g, '');
    return numeroLimpio.length >= 10 && numeroLimpio.length <= 13;
  };

  // Validar formato de teléfono
  const validarTelefono = (telefono) => {
    const numeroLimpio = telefono.replace(/\D/g, '');
    return numeroLimpio.length >= 7 && numeroLimpio.length <= 13;
  };

  const cargarPerfilUsuario = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/perfil`);
      if (res.ok) {
        const data = await res.json();
        const nuevosDatos = {
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          whatsapp: data.whatsapp || '',
          direccion: data.direccion || ''
        };
        setPerfilForm(nuevosDatos);
        setOriginalPerfilForm(nuevosDatos);
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  };

  const cargarSaldo = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:8080/api/incentivos/saldo/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUsuario(prev => ({ ...prev, saldoImpulso: data.saldo || 0 }));
      }
    } catch (error) {
      console.error("Error cargando saldo:", error);
    }
  };

  const cargarPlanesGrupales = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:8080/api/planes-grupales/usuario/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMisPlanes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando planes", error);
    }
  };

  useEffect(() => {
    cargarPlanesGrupales();
  }, [user]);

  const cargarHistorialSaldo = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${userId}/historial-saldo`);
      if (res.ok) {
        const data = await res.json();
        setHistorialSaldo(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando historial", error);
    }
  };

  const cargarReservas = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/reservas/usuario/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMisReservas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando reservas", error);
    }
  };

  const cargarWishlistReal = async (userId) => {
    setCargandoWishlist(true);
    try {
      const res = await fetch(`http://localhost:8080/api/deseos/usuario/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setWishlist(Array.isArray(data) ? data : []);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error cargando wishlist real:", error);
      setWishlist([]);
    } finally {
      setCargandoWishlist(false);
    }
  };

  const agregarAWishlist = async (productoId, titulo, precio, imagen) => {
    if (!user?.id) {
      setModalInfo({
        isOpen: true,
        titulo: 'Inicia sesión',
        mensaje: 'Debes iniciar sesión para guardar productos en favoritos'
      });
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8080/api/deseos/agregar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: user.id,
          productoId: productoId
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setModalExito({
          isOpen: true,
          mensaje: '¡Agregado a favoritos!',
          subMensaje: data.mensaje || "Producto guardado en tu lista de deseos"
        });
        cargarWishlistReal(user.id);
      } else {
        const error = await res.json();
        setModalError({
          isOpen: true,
          mensaje: 'Error al agregar',
          detalle: error.error || "No se pudo agregar a favoritos"
        });
      }
    } catch (error) {
      console.error("Error agregando a wishlist:", error);
      setModalError({
        isOpen: true,
        mensaje: 'Error de conexión',
        detalle: error.message
      });
    }
  };

  const eliminarDeWishlist = async (deseoId, productoId) => {
    setModalConfirm({
      isOpen: true,
      action: async () => {
        try {
          const url = `http://localhost:8080/api/deseos/usuario/${user.id}/producto/${productoId}`;
          const res = await fetch(url, { method: 'DELETE' });
          
          if (res.ok) {
            setModalExito({
              isOpen: true,
              mensaje: 'Producto eliminado',
              subMensaje: 'Se eliminó de tu lista de deseos'
            });
            cargarWishlistReal(user.id);
          } else {
            setModalError({
              isOpen: true,
              mensaje: 'Error al eliminar',
              detalle: "No se pudo eliminar de favoritos"
            });
          }
        } catch (error) {
          setModalError({
            isOpen: true,
            mensaje: 'Error de conexión',
            detalle: error.message
          });
        }
        setModalConfirm({ isOpen: false, action: null, mensaje: '' });
      },
      mensaje: '¿Eliminar este producto de tu lista de deseos?'
    });
  };

  const cargarExperienciasDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/productos/experiencias');
      if (response.ok) {
        const data = await response.json();
        setExperienciasDisponibles(data);
      }
    } catch (error) {
      console.error("Error cargando experiencias", error);
    }
  };

  const crearPlanGrupal = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/planes-grupales/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liderId: user?.id,
          experienciaId: parseInt(nuevoPlan.experienciaId),
          numPersonas: nuevoPlan.numPersonas,
          fecha: nuevoPlan.fecha,
          hora: nuevoPlan.hora,
          comentario: nuevoPlan.comentario
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCodigoGenerado(data.codigoGrupo);
        setMisPlanes([data, ...misPlanes]);
        setShowModalPlan(false);
        setNuevoPlan({ experienciaId: '', numPersonas: 2, fecha: '', hora: '', comentario: '' });
        setTimeout(() => setCodigoGenerado(null), 5000);
        setModalExito({
          isOpen: true,
          mensaje: '¡Plan creado!',
          subMensaje: `Código: ${data.codigoGrupo}`
        });
        cargarPlanesGrupales();
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: 'Error al crear el plan',
          detalle: error.error
        });
      }
    } catch (error) {
      console.error("Error al crear plan:", error);
      setModalError({
        isOpen: true,
        mensaje: 'Error de conexión',
        detalle: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Función para unirse a un plan grupal
  const unirseAPlan = async (e) => {
    e.preventDefault();
    if (!codigoParaUnirse.trim()) {
      setModalError({
        isOpen: true,
        mensaje: 'Código requerido',
        detalle: 'Por favor ingresa el código del plan grupal'
      });
      return;
    }
    
    setUnirseLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/planes-grupales/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoGrupo: codigoParaUnirse.toUpperCase(),
          usuarioId: user?.id
        })
      });
      
      if (response.ok) {
        setShowModalUnirse(false);
        setCodigoParaUnirse('');
        setModalExito({
          isOpen: true,
          mensaje: '¡Te has unido al plan!',
          subMensaje: 'Ya eres parte del plan grupal. El líder recibirá tu solicitud.'
        });
        cargarPlanesGrupales();
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: 'Error al unirse',
          detalle: error.error || 'Código inválido o plan completo'
        });
      }
    } catch (error) {
      console.error("Error al unirse:", error);
      setModalError({
        isOpen: true,
        mensaje: 'Error de conexión',
        detalle: error.message
      });
    } finally {
      setUnirseLoading(false);
    }
  };

  const abrirModalCancelar = (plan) => {
    setPlanACancelar(plan);
    setMotivoCancelacion('');
    setShowModalCancelar(true);
  };

  const confirmarCancelacion = async () => {
    if (!planACancelar) return;
    
    setCancelandoPlan(true);
    try {
      const response = await fetch(`http://localhost:8080/api/planes-grupales/${planACancelar.id}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: motivoCancelacion || "Cancelado por el usuario" })
      });
      
      if (response.ok) {
        setShowModalCancelar(false);
        setPlanACancelar(null);
        cargarPlanesGrupales();
        setModalExito({
          isOpen: true,
          mensaje: 'Plan cancelado',
          subMensaje: 'Tu plan ha sido cancelado exitosamente'
        });
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: 'Error al cancelar',
          detalle: error.error
        });
      }
    } catch (error) {
      console.error("Error cancelando plan:", error);
      setModalError({
        isOpen: true,
        mensaje: 'Error de conexión',
        detalle: error.message
      });
    } finally {
      setCancelandoPlan(false);
    }
  };

  // Copiar código con feedback visual
  const copiarCodigoConFeedback = async (codigo, index) => {
    if (!codigo) return;
    await navigator.clipboard.writeText(codigo);
    setCopiandoIndex(index);
    setTimeout(() => setCopiandoIndex(null), 2000);
  };

  const copiarCodigo = (codigo) => {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo);
    setModalExito({
      isOpen: true,
      mensaje: 'Código copiado',
      subMensaje: `El código ${codigo} fue copiado al portapapeles`
    });
  };

  const compartirCodigo = (codigo) => {
    if (!codigo) return;
    if (navigator.share) {
      navigator.share({
        title: 'Invitación Wizzy',
        text: `¡Únete a mi plan grupal! Código: ${codigo}`,
        url: window.location.origin,
      });
    } else {
      copiarCodigo(codigo);
    }
  };

  
  const [codigoReferido, setCodigoReferido] = useState('');
   const cargarCodigoReferido = async () => {
    if (!user?.id) return;
      try {
    const response = await fetch(`http://localhost:8080/api/referidos/codigo/${user.id}`);
    if (response.ok) {
      const data = await response.json();
      setCodigoReferido(data.codigo);
    }
  } catch (error) {
    console.error("Error cargando código de referido:", error);
  }
};



  // Guardar perfil con validaciones
  const guardarPerfil = async (e) => {
    e.preventDefault();
    
    if (!perfilForm.nombre.trim()) {
      setModalError({
        isOpen: true,
        mensaje: 'Nombre requerido',
        detalle: 'Por favor ingresa tu nombre completo'
      });
      return;
    }
    
    if (!perfilForm.whatsapp.trim()) {
      setModalError({
        isOpen: true,
        mensaje: 'WhatsApp requerido',
        detalle: 'El número de WhatsApp es obligatorio'
      });
      return;
    }
    
    if (!validarWhatsApp(perfilForm.whatsapp)) {
      setModalError({
        isOpen: true,
        mensaje: 'WhatsApp inválido',
        detalle: 'Ingresa un número de WhatsApp válido (mínimo 10 dígitos)'
      });
      return;
    }
    
    if (perfilForm.telefono && !validarTelefono(perfilForm.telefono)) {
      setModalError({
        isOpen: true,
        mensaje: 'Teléfono inválido',
        detalle: 'Ingresa un número de teléfono válido'
      });
      return;
    }
    
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
          direccion: perfilForm.direccion
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMensajeExito(data.mensaje || "✅ Perfil actualizado exitosamente");
        setOriginalPerfilForm({ ...perfilForm });
        if (updateUser) {
          updateUser({
            ...user,
            nombre: perfilForm.nombre,
            telefono: perfilForm.telefono,
            whatsapp: perfilForm.whatsapp,
            direccionResidencia: perfilForm.direccion
          });
        }
        setUsuario(prev => ({
          ...prev,
          nombre: perfilForm.nombre
        }));
        setTimeout(() => setMensajeExito(''), 3000);
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: 'Error al actualizar perfil',
          detalle: error.error
        });
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setModalError({
        isOpen: true,
        mensaje: 'Error de conexión',
        detalle: error.message
      });
    } finally {
      setEditandoPerfil(false);
    }
  };

  // Cerrar modal de editar con verificación de cambios
  const cerrarModalEditar = () => {
    if (hasUnsavedChanges) {
      setModalConfirm({
        isOpen: true,
        action: () => {
          setShowModalEditar(false);
          setHasUnsavedChanges(false);
        },
        mensaje: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar? Los cambios se perderán.'
      });
    } else {
      setShowModalEditar(false);
    }
  };

  // Cambiar contraseña con validaciones mejoradas
  const cambiarPassword = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.passwordActual) {
      setModalError({
        isOpen: true,
        mensaje: 'Contraseña actual requerida',
        detalle: 'Por favor ingresa tu contraseña actual'
      });
      return;
    }
    
    if (!passwordForm.passwordNueva) {
      setModalError({
        isOpen: true,
        mensaje: 'Nueva contraseña requerida',
        detalle: 'Por favor ingresa una nueva contraseña'
      });
      return;
    }
    
    if (passwordForm.passwordNueva !== passwordForm.passwordConfirm) {
      setModalError({
        isOpen: true,
        mensaje: 'Las contraseñas no coinciden',
        detalle: 'La nueva contraseña y su confirmación deben ser iguales'
      });
      return;
    }
    
    if (passwordForm.passwordNueva.length < 6) {
      setModalError({
        isOpen: true,
        mensaje: 'Contraseña demasiado corta',
        detalle: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
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
        setModalExito({
          isOpen: true,
          mensaje: 'Contraseña actualizada',
          subMensaje: 'Tu contraseña ha sido cambiada exitosamente'
        });
        setPasswordForm({
          passwordActual: '',
          passwordNueva: '',
          passwordConfirm: ''
        });
      } else {
        const error = await response.json();
        setModalError({
          isOpen: true,
          mensaje: 'Error al cambiar contraseña',
          detalle: error.error
        });
      }
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setModalError({
        isOpen: true,
        mensaje: 'Error de conexión',
        detalle: error.message
      });
    } finally {
      setCambiandoPassword(false);
    }
  };

  const pagarRestante = () => {
    const faltante = usuario.metaValor - usuario.saldoImpulso;
    if (faltante <= 0) {
      setModalExito({
        isOpen: true,
        mensaje: '¡Meta alcanzada!',
        subMensaje: '¡Ya alcanzaste tu meta! Puedes canjear tu beneficio.'
      });
      return;
    }
    setModalInfo({
      isOpen: true,
      titulo: 'Pago faltante',
      mensaje: `Se abrirá la pasarela de pagos para completar tu experiencia. Faltante: $${faltante.toLocaleString('es-CO')}`
    });
  };

  const abonarPlan = (plan) => {
    const abono = prompt(`¿Cuánto deseas abonar?\nValor total: ${formatCOP(plan.valorPorPersona)}\nAbono mínimo: $10,000`);
    if (abono && parseFloat(abono) >= 10000) {
      setModalExito({
        isOpen: true,
        mensaje: 'Abono registrado',
        subMensaje: `Abono de $${parseFloat(abono).toLocaleString('es-CO')} registrado. Saldo pendiente: $${(plan.valorPorPersona - parseFloat(abono)).toLocaleString('es-CO')}`
      });
    } else if (abono && parseFloat(abono) < 10000) {
      setModalError({
        isOpen: true,
        mensaje: 'Abono mínimo no alcanzado',
        detalle: 'El abono mínimo es de $10,000'
      });
    }
  };

  const pagarPlanTotal = (plan) => {
    setModalInfo({
      isOpen: true,
      titulo: 'Pago total',
      mensaje: `Se abrirá la pasarela de pagos para completar tu reserva. Total: ${formatCOP(plan.valorPorPersona)}`
    });
  };

  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNivelInfo = () => {
    const niveles = {
      SILVER: { bg: 'bg-purple-400', texto: 'Plata', next: 'ORO', beneficio: '10% Cashback' },
      ORO: { bg: 'bg-purple-600', texto: 'Oro', next: 'BLACK', beneficio: '15% Cashback + Prioridad' },
      BLACK: { bg: 'bg-purple-800', texto: 'Black', next: 'MAX', beneficio: '25% Cashback + Concierge 24/7' }
    };
    return niveles[usuario.nivel] || niveles.SILVER;
  };

  const nivelInfo = getNivelInfo();
  const progresoNivel = usuario.nivel === 'SILVER' 
    ? Math.min((usuario.saldoImpulso / 500000) * 100, 100)
    : usuario.nivel === 'ORO'
    ? Math.min((usuario.saldoImpulso / 2000000) * 100, 100)
    : 100;

  const experienciaSeleccionada = experienciasDisponibles.find(e => e.id == nuevoPlan.experienciaId);
  const totalParche = experienciaSeleccionada ? experienciaSeleccionada.precioPublico * nuevoPlan.numPersonas : 0;
  const faltanteMeta = usuario.metaValor - usuario.saldoImpulso;

  const getPoliticaReembolso = () => {
    if (!planACancelar?.fecha) {
      return {
        titulo: "Política de Reembolso",
        mensaje: "Al cancelar tu plan, se aplicará la política de reembolso vigente."
      };
    }
    
    const fechaExperiencia = new Date(planACancelar.fecha);
    const ahora = new Date();
    const horasDiff = (fechaExperiencia - ahora) / (1000 * 60 * 60);
    
    if (horasDiff > 48) {
      return {
        titulo: "✅ Reembolso 100%",
        mensaje: "Cancelas con más de 48 horas de anticipación. Recibirás el reembolso total.",
        porcentaje: 100
      };
    } else if (horasDiff >= 24) {
      return {
        titulo: "⚠️ Reembolso 50%",
        mensaje: "Cancelas entre 24-48 horas antes. Recibirás el 50% del valor.",
        porcentaje: 50
      };
    } else {
      return {
        titulo: "❌ Sin reembolso",
        mensaje: "Cancelas con menos de 24 horas. No hay reembolso disponible.",
        porcentaje: 0
      };
    }
  };

  const politica = getPoliticaReembolso();

  return (
    <div className="p-4 md:p-6 pb-24 lg:pb-6 space-y-6 animate-fade-in">
      
      {/* Modales globales */}
      <ModalConfirmacion
        isOpen={modalConfirm.isOpen}
        onClose={() => setModalConfirm({ isOpen: false, action: null, mensaje: '' })}
        onConfirm={() => modalConfirm.action && modalConfirm.action()}
        titulo="Confirmar acción"
        mensaje={modalConfirm.mensaje}
      />
      
      <ModalExito
        isOpen={modalExito.isOpen}
        onClose={() => setModalExito({ isOpen: false, mensaje: '', subMensaje: '' })}
        mensaje={modalExito.mensaje}
        subMensaje={modalExito.subMensaje}
      />
      
      <ModalError
        isOpen={modalError.isOpen}
        onClose={() => setModalError({ isOpen: false, mensaje: '', detalle: '' })}
        mensaje={modalError.mensaje}
        detalle={modalError.detalle}
      />
      
      <ModalInfo
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, titulo: '', mensaje: '' })}
        titulo={modalInfo.titulo}
        mensaje={modalInfo.mensaje}
      />

      {/* MODAL CANCELAR PLAN - PREMIUM */}
      {showModalCancelar && planACancelar && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModalCancelar(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" /> Cancelar Plan Grupal
              </h3>
              <button onClick={() => setShowModalCancelar(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">¿Cancelar {planACancelar.experiencia?.titulo || 'este plan'}?</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider">Código: {planACancelar.codigoGrupo}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-500">Valor pagado:</span>
                  <span className="font-black text-slate-800">{formatCOP(planACancelar.valorPorPersona)}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-500">Fecha de la experiencia:</span>
                  <span className="font-black text-slate-800">{planACancelar.fecha ? formatFecha(planACancelar.fecha) : 'Por definir'}</span>
                </div>
              </div>
              
              <div className={`rounded-xl p-4 border-2 ${
                politica.porcentaje === 100 ? 'bg-emerald-50 border-emerald-200' :
                politica.porcentaje === 50 ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <p className="font-black text-[10px] uppercase tracking-wider mb-2">{politica.titulo}</p>
                <p className="text-[9px] text-slate-600">{politica.mensaje}</p>
                {politica.porcentaje > 0 && (
                  <p className="text-[11px] font-black mt-2 text-emerald-600">
                    Reembolso: {formatCOP(planACancelar.valorPorPersona * (politica.porcentaje / 100))}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Motivo de cancelación (opcional)
                </label>
                <textarea
                  rows="3"
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  placeholder="Cuéntanos por qué cancelas..."
                  className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModalCancelar(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95"
                >
                  Volver atrás
                </button>
                <button
                  onClick={confirmarCancelacion}
                  disabled={cancelandoPlan}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {cancelandoPlan ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                  {cancelandoPlan ? "Cancelando..." : "Sí, cancelar plan"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL EDITAR PERFIL - con confirmación de cierre */}
      {showModalEditar && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cerrarModalEditar} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter flex items-center gap-2">
                <User size={16} className="text-purple-600" /> Editar Perfil
              </h3>
              <button onClick={cerrarModalEditar} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              {mensajeExito && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">{mensajeExito}</p>
                </div>
              )}
              
              <form onSubmit={guardarPerfil} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <User size={10} /> Nombre completo *
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
                    <Phone size={10} /> Teléfono
                  </label>
                  <input
                    type="tel"
                    value={perfilForm.telefono}
                    onChange={(e) => setPerfilForm({...perfilForm, telefono: e.target.value})}
                    placeholder="Ej: 3001234567"
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <p className="text-[6px] text-slate-400 mt-0.5">Opcional</p>
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <MessageCircle size={10} /> WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={perfilForm.whatsapp}
                    onChange={(e) => setPerfilForm({...perfilForm, whatsapp: e.target.value})}
                    placeholder="Ej: 3001234567"
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                  <p className="text-[6px] text-slate-400 mt-0.5">Mínimo 10 dígitos</p>
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <MapPin size={10} /> Dirección de residencia
                  </label>
                  <input
                    type="text"
                    value={perfilForm.direccion}
                    onChange={(e) => setPerfilForm({...perfilForm, direccion: e.target.value})}
                    placeholder="Calle, número, ciudad"
                    className="w-full bg-slate-50 rounded-xl p-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
    <Gift size={10} /> Mi código de referido
  </label>
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={user?.codigoReferido || codigoReferido || 'Cargando...'}
      readOnly
      className="flex-1 bg-slate-100 rounded-xl p-3 text-[10px] font-mono font-bold uppercase outline-none"
    />
    <button
      onClick={() => {
        const codigo = user?.codigoReferido || codigoReferido;
        if (codigo) {
          navigator.clipboard.writeText(codigo);
          setModalExito({
            isOpen: true,
            mensaje: 'Código copiado',
            subMensaje: `El código ${codigo} fue copiado al portapapeles`
          });
        }
      }}
      className="px-4 py-3 bg-purple-100 text-purple-700 rounded-xl text-[8px] font-black uppercase hover:bg-purple-200 transition"
    >
      Copiar
    </button>
  </div>
  <p className="text-[6px] text-slate-400 mt-0.5">Comparte este código y gana incentivos cuando tus amigos se registren</p>
</div>

                
                <button
                  type="submit"
                  disabled={editandoPerfil}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {editandoPerfil ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editandoPerfil ? "Guardando..." : "Guardar Cambios"}
                </button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[8px]">
                  <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">Cambiar Contraseña</span>
                </div>
              </div>
              
              <form onSubmit={cambiarPassword} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-2">
                    <Lock size={10} /> Contraseña Actual *
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
                    <Lock size={10} /> Nueva Contraseña *
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
                    <Lock size={10} /> Confirmar Nueva Contraseña *
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
                  className="w-full bg-slate-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
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

      {/* 🆕 MODAL UNIRSE A PLAN GRUPAL */}
      {showModalUnirse && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModalUnirse(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-5 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-white" />
                  <h3 className="text-white font-black text-sm uppercase tracking-tighter">Unirse a Parche</h3>
                </div>
                <button onClick={() => setShowModalUnirse(false)} className="text-white/80 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={unirseAPlan} className="p-6 space-y-5">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Código del plan grupal
                </label>
                <input
                  type="text"
                  placeholder="Ej: WIZ-SQ-ABCDEF"
                  value={codigoParaUnirse}
                  onChange={(e) => setCodigoParaUnirse(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 rounded-xl p-3 text-[12px] font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
                <p className="text-[7px] text-slate-400 mt-1">
                  Ingresa el código que te compartió el líder del plan
                </p>
              </div>
              
              <button
                type="submit"
                disabled={unirseLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {unirseLoading ? <Loader2 className="animate-spin" size={14} /> : <Users size={14} />}
                {unirseLoading ? "Uniéndose..." : "Unirse al Parche"}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 🆕 MODAL REGALAR INCENTIVOS */}
      <RegalarIncentivosModal
        isOpen={showModalRegalarIncentivos}
        onClose={() => setShowModalRegalarIncentivos(false)}
        usuarioId={user?.id}
        saldoActual={usuario.saldoImpulso}
        onRegaloExitoso={(monto) => {
          setUsuario(prev => ({ ...prev, saldoImpulso: prev.saldoImpulso - monto }));
          setModalExito({
            isOpen: true,
            mensaje: '¡Incentivos regalados!',
            subMensaje: `Has regalado $${monto.toLocaleString()} exitosamente`
          });
        }}
      />

      {/* 🆕 MODAL CANJEAR REGALO */}
      <CanjearRegaloModal
        isOpen={showModalCanjearRegalo}
        onClose={() => setShowModalCanjearRegalo(false)}
        usuarioId={user?.id}
        onCanjeExitoso={() => {
          cargarSaldo();
          setModalExito({
            isOpen: true,
            mensaje: '¡Regalo canjeado!',
            subMensaje: 'Ahora puedes ver tu experiencia en "Mis Reservas"'
          });
        }}
      />

      {/* MODAL CREAR PLAN GRUPAL */}
      {showModalPlan && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModalPlan(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter flex items-center gap-2">
                <Users size={16} className="text-purple-600" /> Armar Parche Wizzy
              </h3>
              <button onClick={() => setShowModalPlan(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={crearPlanGrupal} className="p-5 space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  ¿Qué experiencia quieres?
                </label>
                <select
                  required
                  value={nuevoPlan.experienciaId}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, experienciaId: e.target.value})}
                  className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">Selecciona una experiencia</option>
                  {experienciasDisponibles.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.titulo} - ${exp.precioPublico?.toLocaleString('es-CO')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  ¿Cuántas personas?
                </label>
                <input
                  type="number"
                  required
                  min="2"
                  max="50"
                  value={nuevoPlan.numPersonas}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, numPersonas: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoPlan.fecha}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, fecha: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Hora
                  </label>
                  <select
                    required
                    value={nuevoPlan.hora}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, hora: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="">Seleccionar</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Comentario o requisitos especiales
                </label>
                <textarea
                  rows="2"
                  value={nuevoPlan.comentario}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, comentario: e.target.value})}
                  placeholder="Ej: Alguien es alérgico, necesitamos transporte, etc."
                  className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              
              {experienciaSeleccionada && (
                <div className="bg-purple-50 p-3 rounded-xl space-y-1">
                  <p className="text-[9px] font-black text-purple-600 uppercase tracking-wider">Resumen del Parche</p>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600">Valor por persona:</span>
                    <span className="font-black text-purple-700">{formatCOP(experienciaSeleccionada.precioPublico)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600">Número de personas:</span>
                    <span className="font-black">{nuevoPlan.numPersonas}</span>
                  </div>
                  <div className="flex justify-between text-[10px] pt-1 border-t border-purple-200 mt-1">
                    <span className="font-black text-purple-800">Total del parche:</span>
                    <span className="font-black text-purple-700 text-sm">{formatCOP(totalParche)}</span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : 'Crear Parche y Generar Código'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 🆕 SECCIÓN DE INCENTIVOS Y REFERIDOS */}
      <div className="bg-purple-50/30 rounded-2xl p-5 border border-purple-100">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-4 flex items-center gap-2">
          <Gift size={16} className="text-amber-500" />
          Mis Incentivos y Referidos
        </h2>
        <ReferidosPanel usuarioId={user?.id} />
      </div>

      {/* HEADER BIENVENIDA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">
            HOLA, {usuario.nombre?.split(' ')[0] || 'Usuario'} <span className="text-purple-600">⚡</span>
          </h1>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Miembro Wizzy {nivelInfo.texto} • Cliente Verificado
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Tooltip text="Editar mi información personal">
            <button 
              onClick={() => setShowModalEditar(true)} 
              className="bg-white border border-purple-200 text-purple-700 px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-black text-[8px] md:text-[9px] uppercase tracking-wider hover:bg-purple-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Edit3 size={14}/> Editar Perfil
            </button>
          </Tooltip>

          <Tooltip text="Regalar incentivos a otro usuario">
            <button 
              onClick={() => setShowModalRegalarIncentivos(true)} 
              className="bg-amber-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-black text-[8px] md:text-[9px] uppercase tracking-wider hover:bg-amber-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Gift size={14}/> Regalar Incentivos
            </button>
          </Tooltip>

          <Tooltip text="Canjear un código de regalo">
            <button 
              onClick={() => setShowModalCanjearRegalo(true)} 
              className="bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-black text-[8px] md:text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Ticket size={14}/> Canjear Regalo
            </button>
          </Tooltip>

          <Tooltip text="Unirse a un plan grupal existente">
            <button 
              onClick={() => setShowModalUnirse(true)} 
              className="bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-black text-[8px] md:text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Users size={14}/> Unirse a Parche
            </button>
          </Tooltip>

          <Tooltip text="Crear un plan grupal con amigos">
            <button 
              onClick={() => setShowModalPlan(true)} 
              className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-black text-[8px] md:text-[9px] uppercase tracking-wider hover:bg-purple-600 transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <Plus size={14}/> Armar Parche
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ALERTA DE CÓDIGO GENERADO */}
      {codigoGenerado && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 md:p-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-purple-600" size={20} md:w-6 md:h-6 />
              <div>
                <p className="font-black text-purple-800 text-xs md:text-sm uppercase tracking-tighter">¡Plan Creado!</p>
                <p className="text-[8px] md:text-[9px] text-purple-600">Comparte este código con tus amigos</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <code className="bg-white px-2 md:px-3 py-1.5 md:py-2 rounded-xl font-mono font-bold text-xs md:text-sm text-slate-800 border border-purple-200">
                {codigoGenerado}
              </code>
              <Tooltip text="Copiar código al portapapeles">
                <button onClick={() => copiarCodigo(codigoGenerado)} className="bg-purple-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase hover:bg-purple-700 transition active:scale-95">
                  Copiar
                </button>
              </Tooltip>
              <Tooltip text="Compartir en redes sociales">
                <button onClick={() => compartirCodigo(codigoGenerado)} className="bg-slate-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase hover:bg-slate-900 transition active:scale-95">
                  <Share2 size={14} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Grid principal - responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        
        {/* BILLETERA DE IMPULSO */}
        <div className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white relative overflow-hidden shadow-xl">
          <Zap className="absolute -right-4 -top-4 text-white/10 w-32 h-32 md:w-40 md:h-40" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet size={14} className="md:w-4 md:h-4" />
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">Billetera de Impulso</span>
              </div>
              <button 
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-white/70 hover:text-white flex items-center gap-1"
              >
                <History size={10} className="md:w-3 md:h-3" /> Historial
              </button>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter">
              {formatCOP(usuario.saldoImpulso)}
            </h2>
            <p className="text-purple-100 text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <Target size={10} className="md:w-3 md:h-3" /> Próxima meta: {usuario.metaNombre}
            </p>

            <div className="mt-5 md:mt-8 space-y-2">
              <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-wider text-purple-200">
                <span>Progreso para {nivelInfo.next}</span>
                <span>{Math.round(progresoNivel)}%</span>
              </div>
              <div className="h-2 md:h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${progresoNivel}%` }}
                />
              </div>
            </div>

            <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-3">
              <div className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${nivelInfo.bg} text-white`}>
                <Crown size={10} className="md:w-3 md:h-3" /> {nivelInfo.texto} Member
              </div>
              <span className="text-[7px] md:text-[8px] text-purple-200 uppercase tracking-wider">
                Beneficio: {nivelInfo.beneficio}
              </span>
            </div>

            {faltanteMeta > 0 && (
              <button 
                onClick={pagarRestante}
                className="mt-5 w-full bg-emerald-500 text-white py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <CreditCard size={12} /> Pagar restante (${faltanteMeta.toLocaleString('es-CO')})
              </button>
            )}
          </div>
        </div>

        {/* WIZZY CONCIERGE VIP - CHAT */}
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl md:rounded-3xl p-5 md:p-6 text-white relative overflow-hidden shadow-xl cursor-pointer hover:scale-[1.02] transition-transform"
             onClick={() => window.open('https://wa.me/573000000000?text=Hola%20Wizzy%2C%20soy%20cliente%20VIP%20y%20necesito%20ayuda', '_blank')}>
          <div className="absolute -right-6 -top-6 w-24 h-24 md:w-32 md:h-32 rounded-full bg-purple-500/20 blur-3xl" />
          <MessageCircle className="text-purple-300 mb-3 md:mb-4" size={20} md:w-6 md:h-6 />
          <div className="relative z-10">
            <p className="text-[7px] md:text-[8px] font-black uppercase tracking-wider text-purple-300/80">Wizzy Concierge</p>
            <p className="font-black text-sm md:text-base mt-1">Chat VIP 24/7</p>
            <p className="text-[9px] md:text-[10px] text-purple-200 mt-2">Asistencia prioritaria</p>
            <div className="flex justify-between items-end mt-4 md:mt-6">
              <p className="text-[7px] md:text-[8px] text-purple-300 uppercase">Tiempo de respuesta: &lt; 2min</p>
              <MessageCircle size={14} className="md:w-4 md:h-4 text-purple-300" />
            </div>
          </div>
        </div>

      </div>

      {/* HISTORIAL DE SALDO */}
      {mostrarHistorial && (
        <div className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-4 md:p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <History size={12} className="md:w-3.5 md:h-3.5" /> Historial de Impulso
            </h3>
            <button onClick={() => setMostrarHistorial(false)} className="text-[7px] md:text-[8px] text-slate-400">Cerrar</button>
          </div>
          <div className="space-y-3">
            {historialSaldo.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${item.tipo === 'INGRESO' ? 'bg-purple-100' : 'bg-red-100'}`}>
                    {item.tipo === 'INGRESO' ? <TrendingUp size={14} className="text-purple-600" /> : <Gift size={14} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800">{item.concepto}</p>
                    <p className="text-[8px] text-slate-400">{formatFecha(item.fecha)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black ${item.tipo === 'INGRESO' ? 'text-purple-600' : 'text-red-500'}`}>
                  {item.tipo === 'INGRESO' ? '+' : '-'} {formatCOP(item.monto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MIS RESERVAS CON QR */}
      <div className="space-y-4">
        <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider ml-2 flex items-center gap-2">
          <Anchor size={10} className="md:w-3 md:h-3" /> Mis Reservas Activas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {misReservas.length === 0 ? (
            <div className="col-span-full py-10 md:py-12 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <Ship size={32} className="md:w-10 md:h-10 mb-3 opacity-20" />
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">No tienes reservas activas aún</p>
            </div>
          ) : (
            misReservas.map((reserva) => (
              <div key={reserva.id} className="bg-white border border-slate-100 p-4 md:p-5 rounded-2xl md:rounded-3xl hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-purple-50 rounded-xl">
                      <QrCode size={14} className="md:w-4 md:h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase text-xs md:text-sm tracking-tighter">{reserva.titulo}</h4>
                      <p className="text-[8px] md:text-[9px] text-slate-400">{formatFecha(reserva.fecha)} • {reserva.personas} personas</p>
                    </div>
                  </div>
                  <span className={`text-[7px] md:text-[8px] font-black px-2 py-1 rounded-full uppercase ${reserva.estado === 'CONFIRMADA' ? 'bg-purple-100 text-purple-700' : 'bg-purple-50 text-purple-500'}`}>
                    {reserva.estado}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 md:p-3 mt-3 flex items-center justify-between">
                  <code className="text-[8px] md:text-[10px] font-mono font-bold text-slate-600">{reserva.qrCode || `WIZ-${reserva.id}`}</code>
                  <Tooltip text="Copiar código QR">
                    <button onClick={() => copiarCodigo(reserva.qrCode)} className="text-[7px] md:text-[8px] font-black text-purple-600 uppercase tracking-wider hover:underline active:scale-95">
                      Copiar QR
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MIS PLANES GRUPALES - grid responsiva */}
      <div className="space-y-4">
        <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider ml-2 flex items-center gap-2">
          <Users size={10} className="md:w-3 md:h-3" /> Mis Planes Grupales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {misPlanes.length === 0 ? (
            <div className="col-span-full py-10 md:py-12 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <Anchor size={32} className="md:w-10 md:h-10 mb-3 opacity-20" />
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">No tienes planes activos aún</p>
            </div>
          ) : (
            misPlanes.map((plan, idx) => (
              <div key={plan.id} className="bg-white border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-3xl hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 md:p-3 bg-purple-50 text-purple-600 rounded-xl md:rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Users size={16} className="md:w-5 md:h-5" />
                  </div>
                  <span className="bg-purple-50 text-purple-600 text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 rounded-full uppercase">
                    {plan.estado || 'ACTIVO'}
                  </span>
                </div>
                <h4 className="font-black text-slate-800 uppercase tracking-tighter text-xs md:text-sm mb-1">
                  {plan.experiencia?.titulo || 'Plan Grupal'}
                </h4>
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-500 mb-3 md:mb-4">
                  <Clock size={10} className="md:w-3 md:h-3" /> {plan.codigoGrupo || `WIZ-${plan.id}`}
                </div>
                <div className="flex items-center justify-between text-[8px] md:text-[9px] text-slate-500 mb-3">
                  <span>Confirmados: {plan.confirmados || 0}/10</span>
                  <span>Pendientes: {plan.pendientes || 0}</span>
                </div>
                <div className="pt-3 md:pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase">Valor Persona</p>
                      <p className="text-xs md:text-sm font-black text-slate-900">{formatCOP(plan.valorPorPersona)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Tooltip text="Copiar código de invitación">
                        <button 
                          onClick={() => copiarCodigoConFeedback(plan.codigoGrupo, idx)}
                          className={`p-1.5 md:p-2 rounded-xl transition-all active:scale-90 ${
                            copiandoIndex === idx 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-50 text-slate-400 hover:text-purple-600'
                          }`}
                          title="Copiar código"
                        >
                          {copiandoIndex === idx ? <CheckCircle size={14} className="md:w-4 md:h-4" /> : <Copy size={14} className="md:w-4 md:h-4" />}
                        </button>
                      </Tooltip>
                      <Tooltip text="Compartir en redes sociales">
                        <button 
                          onClick={() => compartirCodigo(plan.codigoGrupo)}
                          className="p-1.5 md:p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-purple-600 transition-colors active:scale-90"
                          title="Compartir"
                        >
                          <Share2 size={14} className="md:w-4 md:h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button 
                      onClick={() => abonarPlan(plan)}
                      className="flex-1 text-[7px] font-black bg-amber-600 text-white px-2 py-1.5 rounded-xl hover:bg-amber-700 transition-all active:scale-95"
                    >
                      Abonar
                    </button>
                    <button 
                      onClick={() => pagarPlanTotal(plan)}
                      className="flex-1 text-[7px] font-black bg-emerald-600 text-white px-2 py-1.5 rounded-xl hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      Pagar todo
                    </button>
                    {plan.estado === 'ACTIVO' && (
                      <Tooltip text="Cancelar plan grupal">
                        <button 
                          onClick={() => abrirModalCancelar(plan)}
                          className="flex-1 text-[7px] font-black bg-red-600 text-white px-2 py-1.5 rounded-xl hover:bg-red-700 transition-all active:scale-95"
                        >
                          Cancelar
                        </button>
                      </Tooltip>
                    )}
                    {plan.estado === 'CANCELADO' && (
                      <div className="flex-1 text-[7px] font-black bg-slate-300 text-slate-600 px-2 py-1.5 rounded-xl text-center">
                        Cancelado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* WISHLIST PREMIUM */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider ml-2 flex items-center gap-2">
            <Star size={10} className="md:w-3 md:h-3" /> Lista de Deseos Premium
          </h3>
          {cargandoWishlist && (
            <Loader2 size={14} className="animate-spin text-purple-600" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.length === 0 ? (
            <div className="col-span-full py-10 md:py-12 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <Heart size={32} className="md:w-10 md:h-10 mb-3 opacity-20" />
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">No tienes productos favoritos aún</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-4 bg-purple-600 text-white px-5 md:px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition active:scale-95"
              >
                Explorar tienda
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative h-28 md:h-32 overflow-hidden">
                  <img src={item.imagen} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Tooltip text="Eliminar de favoritos">
                      <button 
                        onClick={() => eliminarDeWishlist(item.id, item.productoId)}
                        className="p-1 md:p-1.5 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors active:scale-90"
                        title="Eliminar de favoritos"
                      >
                        <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h4 className="font-black text-slate-800 text-[10px] md:text-xs uppercase tracking-tighter">{item.titulo}</h4>
                  <div className="flex justify-between items-center mt-2 md:mt-3">
                    <p className="text-[9px] md:text-[10px] font-black text-purple-600">{formatCOP(item.precio)}</p>
                    <Tooltip text="Ver producto y comprar">
                      <button 
                        onClick={() => window.location.href = `/producto/${item.productoId}`}
                        className="text-[7px] md:text-[8px] font-black text-white bg-slate-800 px-2 md:px-3 py-1 md:py-1.5 rounded-xl uppercase hover:bg-purple-600 transition-colors active:scale-95"
                      >
                        Comprar
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CONCIERGE 24/7 */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-purple-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center">
              <MessageCircle size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-tighter">Wizzy Concierge 24/7</h3>
              <p className="text-[9px] md:text-[10px] text-slate-500">¿Necesitas ayuda? Estamos aquí para ti.</p>
            </div>
          </div>
          <a 
            href="https://wa.me/573000000000?text=Hola%20Wizzy%2C%20necesito%20ayuda%20con%20mi%20reserva%20VIP" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-purple-600 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <MessageCircle size={12} className="md:w-3.5 md:h-3.5" /> Hablar con un experto
          </a>
        </div>
      </div>

    </div>
  );
};

export default PanelCliente;