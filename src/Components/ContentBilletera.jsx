import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, Gift, Coffee, Anchor, 
  ShoppingBag, Star, Clock, Zap, Crown, 
  ChevronRight, Sparkles, Ticket, MapPin, X,
  CheckCircle2, ArrowUpRight, CreditCard, Users,
  Calendar, DollarSign, BarChart3, Download, History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ContentBilletera = () => {
  const { user } = useAuth();
  const role = user?.role || 'CLIENTE';
  
  // Estados generales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('nequi');
  const [loading, setLoading] = useState(false);
  
  // Estados según rol
  const [saldoImpulso, setSaldoImpulso] = useState(1240500);
  const [saldoVentas, setSaldoVentas] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [beneficiosDisponibles, setBeneficiosDisponibles] = useState([]);
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState(null);
  const [totalVentasMes, setTotalVentasMes] = useState(0);
  const [porcentajeCrecimiento, setPorcentajeCrecimiento] = useState(12);
  const [totalRetirado, setTotalRetirado] = useState(0);
  const [comision, setComision] = useState(0);

  const VENDEDOR_ID = user?.id || localStorage.getItem('userId') || 1;

  // Cargar datos según el rol
  useEffect(() => {
    if (!user) return;
    
    if (role === 'CLIENTE') {
      setSaldoImpulso(user.saldoImpulso || 1240500);
      cargarHistorialCliente();
      cargarBeneficiosCliente(user.nivel || 'SILVER');
    } else if (role === 'EXPERIENCIAS') {
      cargarBalanceExperiencias();
      cargarHistorialVendedor();
    } else if (role === 'PRODUCTOS') {
      cargarBalanceProductos();
      cargarHistorialVendedor();
    }
  }, [user, role]);

  // ==================== CLIENTE ====================
  const cargarHistorialCliente = () => {
    setHistorial([
      { id: 1, concepto: "Compra Gafas Pro", monto: 50000, tipo: "GANANCIA", fecha: "Hoy, 2:15 PM", detalle: "Cashback 10% por tu compra" },
      { id: 2, concepto: "Reserva Yate Cholón", monto: 120000, tipo: "GANANCIA", fecha: "Ayer", detalle: "Cashback 15% nivel ORO" },
      { id: 3, concepto: "Canje Café Wizzy", monto: 15000, tipo: "CANJE", fecha: "18 Abr", detalle: "Beneficio canjeado" },
      { id: 4, concepto: "Compra Combo Essentials", monto: 75000, tipo: "GANANCIA", fecha: "15 Abr", detalle: "Cashback por combo" },
    ]);
  };

  const cargarBeneficiosCliente = (nivel) => {
    const beneficiosPorNivel = {
      SILVER: [
        { id: 1, titulo: "Café Wizzy", descripcion: "Café especial en nuestro partner", costo: 15000, icono: Coffee },
        { id: 2, titulo: "Descuento 10%", descripcion: "En tu próxima compra", costo: 25000, icono: ShoppingBag },
      ],
      ORO: [
        { id: 1, titulo: "Café Wizzy", descripcion: "Café especial", costo: 15000, icono: Coffee },
        { id: 2, titulo: "Descuento 15%", descripcion: "En tu próxima compra", costo: 25000, icono: ShoppingBag },
        { id: 3, titulo: "Cóctel de Bienvenida", descripcion: "En cualquier yate", costo: 45000, icono: Sparkles },
        { id: 4, titulo: "Upgrade Habitación", descripcion: "En hoteles partners", costo: 120000, icono: Crown },
      ],
      BLACK: [
        { id: 1, titulo: "Café Wizzy", descripcion: "Café especial", costo: 15000, icono: Coffee },
        { id: 2, titulo: "Descuento 25%", descripcion: "En tu próxima compra", costo: 25000, icono: ShoppingBag },
        { id: 3, titulo: "Cóctel de Bienvenida", descripcion: "En cualquier yate", costo: 45000, icono: Sparkles },
        { id: 4, titulo: "Upgrade Habitación", descripcion: "En hoteles partners", costo: 120000, icono: Crown },
        { id: 5, titulo: "Atardecer VIP Gratis", descripcion: "Experiencia en yate", costo: 140000, icono: Anchor },
      ]
    };
    setBeneficiosDisponibles(beneficiosPorNivel[nivel] || beneficiosPorNivel.SILVER);
  };

  // ==================== VENDEDOR EXPERIENCIAS ====================
  const cargarBalanceExperiencias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/vendedor-acciones/experiencias/${VENDEDOR_ID}/balance`);
      if (response.ok) {
        const data = await response.json();
        setSaldoVentas(data.saldoDisponible || 0);
        setTotalVentasMes(data.ventasMes || 0);
        setTotalRetirado(data.totalRetirado || 0);
        setComision(data.comision || 0);
        setPorcentajeCrecimiento(data.porcentajeCrecimiento || 12);
      } else {
        // Datos de ejemplo si falla la conexión
        setSaldoVentas(3250000);
        setTotalVentasMes(2450000);
        setTotalRetirado(1500000);
        setComision(375000);
      }
    } catch (error) {
      console.error("Error cargando balance:", error);
      setSaldoVentas(3250000);
      setTotalVentasMes(2450000);
      setTotalRetirado(1500000);
      setComision(375000);
    } finally {
      setLoading(false);
    }
  };

  // ==================== VENDEDOR PRODUCTOS ====================
  const cargarBalanceProductos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/vendedor-acciones/productos/${VENDEDOR_ID}/balance`);
      if (response.ok) {
        const data = await response.json();
        setSaldoVentas(data.saldoDisponible || 0);
        setTotalVentasMes(data.ventasMes || 0);
        setTotalRetirado(data.totalRetirado || 0);
        setComision(data.comision || 0);
        setPorcentajeCrecimiento(data.porcentajeCrecimiento || 12);
      } else {
        setSaldoVentas(712500);
        setTotalVentasMes(712500);
        setTotalRetirado(1500000);
        setComision(71250);
      }
    } catch (error) {
      console.error("Error cargando balance:", error);
      setSaldoVentas(712500);
      setTotalVentasMes(712500);
      setTotalRetirado(1500000);
      setComision(71250);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorialVendedor = () => {
    const isExperiencias = role === 'EXPERIENCIAS';
    if (isExperiencias) {
      setHistorial([
        { id: 1, tipo: 'Reserva', detalle: 'Yate Azimut - Grupo 10 personas', monto: 3500000, fecha: 'Hoy, 10:00 AM', estado: 'Confirmado', clientes: 10 },
        { id: 2, tipo: 'Retiro', detalle: 'Transferencia Bancaria', monto: 2000000, fecha: 'Ayer', estado: 'Pendiente' },
        { id: 3, tipo: 'Reserva', detalle: 'Atardecer Galeón - 6 personas', monto: 840000, fecha: '17 Abr', estado: 'Completado', clientes: 6 },
      ]);
    } else {
      setHistorial([
        { id: 1, tipo: 'Venta', detalle: 'Tenis Wizzy Max (ORD-7721)', monto: 210000, fecha: 'Hoy, 2:15 PM', estado: 'Completado' },
        { id: 2, tipo: 'Retiro', detalle: 'Transferencia Bancaria - Nequi', monto: 500000, fecha: 'Ayer', estado: 'Pendiente' },
        { id: 3, tipo: 'Venta', detalle: 'Camiseta Wizzy (ORD-7715)', monto: 52500, fecha: '18 Abr', estado: 'Completado' },
        { id: 4, tipo: 'Venta', detalle: 'Gafas Ray-Ban (ORD-7700)', monto: 450000, fecha: '15 Abr', estado: 'Completado' },
      ]);
    }
  };

  // ==================== FUNCIONES COMPARTIDAS ====================
  const solicitarRetiro = (e) => {
    e.preventDefault();
    if (parseFloat(monto) > saldoVentas) {
      alert("Saldo insuficiente");
      return;
    }
    setStep(2);
  };

  const canjearBeneficio = (beneficio) => {
    if (saldoImpulso >= beneficio.costo) {
      setBeneficioSeleccionado(beneficio);
      setIsModalOpen(true);
      setStep(1);
    } else {
      alert(`Saldo insuficiente. Te faltan $${(beneficio.costo - saldoImpulso).toLocaleString('es-CO')}`);
    }
  };

  const confirmarCanje = () => {
    if (!beneficioSeleccionado) return;
    setSaldoImpulso(prev => prev - beneficioSeleccionado.costo);
    const nuevoHistorial = {
      id: Date.now(),
      concepto: `Canje: ${beneficioSeleccionado.titulo}`,
      monto: beneficioSeleccionado.costo,
      tipo: "CANJE",
      fecha: "Justo ahora",
      detalle: "Beneficio canjeado exitosamente"
    };
    setHistorial([nuevoHistorial, ...historial]);
    setStep(2);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBeneficioSeleccionado(null);
    setStep(1);
    setMonto('');
  };

  const formatCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  // ==================== RENDER CLIENTE ====================
  if (role === 'CLIENTE') {
    const nivel = user?.nivel || 'SILVER';
    const progresoNivel = nivel === 'SILVER' 
      ? Math.min((saldoImpulso / 500000) * 100, 100)
      : nivel === 'ORO'
      ? Math.min((saldoImpulso / 2000000) * 100, 100)
      : 100;
    const siguienteNivel = nivel === 'SILVER' ? 'ORO' : nivel === 'ORO' ? 'BLACK' : 'MAX';
    const montoFaltante = nivel === 'SILVER' ? 500000 - saldoImpulso : nivel === 'ORO' ? 2000000 - saldoImpulso : 0;

    return (
      <div className="space-y-6 p-4 md:p-6">
        {/* Modal Canje */}
        {isModalOpen && beneficioSeleccionado && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                <X size={20} />
              </button>
              {step === 1 ? (
                <div className="p-6">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Gift size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Canjear Beneficio</h3>
                  <p className="text-xs font-semibold text-center text-gray-500 mb-2">{beneficioSeleccionado.titulo}</p>
                  <p className="text-[10px] text-center text-gray-400 mb-4">{beneficioSeleccionado.descripcion}</p>
                  <div className="bg-purple-50 p-4 rounded-2xl my-4">
                    <div className="flex justify-between text-sm">
                      <span>Costo</span>
                      <span className="font-bold text-purple-600">{formatCOP(beneficioSeleccionado.costo)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2 pt-2 border-t border-purple-100">
                      <span>Tu saldo</span>
                      <span className="font-bold">{formatCOP(saldoImpulso)}</span>
                    </div>
                  </div>
                  <button onClick={confirmarCanje} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition">
                    Confirmar Canje
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">¡Beneficio Canjeado!</h3>
                  <p className="text-sm text-gray-500 mb-6">Has canjeado {beneficioSeleccionado.titulo}</p>
                  <button onClick={closeModal} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-900 transition">
                    Entendido
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Cliente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-3xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Billetera de Impulso</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-2">{formatCOP(saldoImpulso)}</h2>
            <p className="text-purple-200 text-[10px] font-semibold">Próxima meta: Atardecer en Yate VIP</p>
            <div className="mt-5">
              <div className="flex justify-between text-[9px] font-semibold text-purple-200 mb-1">
                <span>Progreso para {siguienteNivel}</span>
                <span>{Math.round(progresoNivel)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progresoNivel}%` }} />
              </div>
              {montoFaltante > 0 && (
                <p className="text-[8px] text-purple-200 mt-2">Te faltan {formatCOP(montoFaltante)} para subir de nivel</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Gift size={22} />
            </div>
            <p className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">Próximo beneficio</p>
            <p className="text-sm font-black text-purple-700 mt-2">Descuento 15%</p>
            <p className="text-[8px] text-slate-400 mt-1">Te faltan {formatCOP(250000)} para lograrlo</p>
          </div>
        </div>

        {/* Beneficios */}
        <div>
          <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <Star size={16} className="text-purple-500" /> Beneficios {nivel}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {beneficiosDisponibles.map((beneficio) => {
              const Icon = beneficio.icono;
              const disponible = saldoImpulso >= beneficio.costo;
              return (
                <button
                  key={beneficio.id}
                  onClick={() => canjearBeneficio(beneficio)}
                  disabled={!disponible}
                  className={`bg-white border rounded-2xl p-4 text-left transition-all ${
                    disponible ? 'border-gray-100 hover:shadow-md hover:border-purple-200 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                    disponible ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-[11px]">{beneficio.titulo}</h4>
                  <p className="text-[8px] text-gray-400 mt-1">{beneficio.descripcion}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[8px] font-bold ${disponible ? 'text-purple-600' : 'text-gray-400'}`}>
                      {formatCOP(beneficio.costo)}
                    </span>
                    <ChevronRight size={12} className={disponible ? 'text-purple-500' : 'text-gray-300'} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Historial Cliente */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <History size={14} className="text-purple-600" /> ¿Cómo gané este saldo?
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {historial.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      item.tipo === 'GANANCIA' ? 'bg-green-100 text-green-500' : 'bg-amber-100 text-amber-500'
                    }`}>
                      {item.tipo === 'GANANCIA' ? <TrendingUp size={14} /> : <Gift size={14} />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">{item.concepto}</p>
                      <p className="text-[8px] text-gray-400">{item.detalle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${item.tipo === 'GANANCIA' ? 'text-green-500' : 'text-amber-500'}`}>
                      {item.tipo === 'GANANCIA' ? '+' : '-'} {formatCOP(item.monto)}
                    </p>
                    <p className="text-[7px] text-gray-400">{item.fecha}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER VENDEDOR (PRODUCTOS o EXPERIENCIAS) ====================
  const isExperiencias = role === 'EXPERIENCIAS';
  const totalVentas = historial
    .filter(h => h.tipo === (isExperiencias ? 'Reserva' : 'Venta'))
    .reduce((sum, h) => sum + (h.monto || 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Modal Retiro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            {step === 1 ? (
              <form onSubmit={solicitarRetiro} className="p-6">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight size={28} />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-1">Solicitar Retiro</h3>
                <p className="text-[9px] font-semibold text-center text-gray-400 mb-6">El dinero llegará en 24h</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 block mb-1">Monto a retirar</label>
                    <input type="number" required placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)}
                      className="w-full bg-gray-50 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-200" />
                    <p className="text-[8px] text-gray-400 mt-1">Disponible: {formatCOP(saldoVentas)}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 block mb-1">Cuenta destino</label>
                    <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} 
                      className="w-full bg-gray-50 rounded-xl p-3 text-sm font-bold outline-none">
                      <option value="nequi">Nequi</option>
                      <option value="bancolombia">Bancolombia</option>
                      <option value="daviplata">Daviplata</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition">
                    Confirmar Transferencia
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">¡Solicitud Enviada!</h3>
                <p className="text-sm text-gray-500 mb-6">Estamos procesando tu retiro de {formatCOP(parseFloat(monto) || 0)}</p>
                <button onClick={closeModal} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-900 transition">
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Vendedor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-gradient-to-br from-purple-700 to-purple-900 p-6 rounded-3xl text-white">
          <p className="text-[9px] font-bold uppercase tracking-wider opacity-70 mb-1">Saldo disponible para retiro</p>
          <h2 className="text-4xl font-bold mb-5">{formatCOP(saldoVentas)}</h2>
          <div className="flex gap-3">
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-purple-700 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase hover:bg-gray-100 transition">
              Solicitar Retiro
            </button>
            <button className="bg-purple-600/50 backdrop-blur-sm border border-purple-500/30 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase hover:bg-purple-600 transition">
              Configurar Cuenta
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isExperiencias ? 'bg-purple-100 text-purple-600' : 'bg-purple-100 text-purple-600'}`}>
            {isExperiencias ? <Calendar size={22} /> : <ShoppingBag size={22} />}
          </div>
          <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">{isExperiencias ? 'Reservas (Mes)' : 'Ventas Totales (Mes)'}</p>
          <p className="text-2xl font-bold text-gray-800">{formatCOP(totalVentasMes)}</p>
          <p className="text-[8px] font-semibold text-green-500 mt-1">+{porcentajeCrecimiento}% vs mes anterior</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <DollarSign size={16} className="text-purple-600 mb-1" />
          <p className="text-[8px] font-bold text-gray-800">Comisión</p>
          <p className="text-[9px] font-bold text-purple-600">{isExperiencias ? '15%' : '10%'}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <BarChart3 size={16} className="text-green-600 mb-1" />
          <p className="text-[8px] font-bold text-gray-800">Total Retirado</p>
          <p className="text-[9px] font-bold text-green-600">{formatCOP(totalRetirado)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <Download size={16} className="text-amber-600 mb-1" />
          <p className="text-[8px] font-bold text-gray-800">Próximo Pago</p>
          <p className="text-[9px] font-bold text-amber-600">28/mes</p>
        </div>
      </div>

      {/* Historial Vendedor */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <History size={14} className="text-purple-600" /> {isExperiencias ? 'Actividad de Reservas' : 'Actividad de Ventas'}
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {historial.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  item.tipo === (isExperiencias ? 'Reserva' : 'Venta') ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.tipo === (isExperiencias ? 'Reserva' : 'Venta') ? <ShoppingBag size={14} /> : <CreditCard size={14} />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-800">{item.detalle}</p>
                  <p className="text-[7px] text-gray-400">{item.fecha}</p>
                  {item.clientes && <p className="text-[7px] text-purple-500">{item.clientes} personas</p>}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${item.tipo !== 'Retiro' ? 'text-green-500' : 'text-gray-700'}`}>
                  {item.tipo !== 'Retiro' ? '+' : '-'} {formatCOP(item.monto)}
                </p>
                <span className={`text-[7px] font-bold px-2 py-0.5 rounded-full ${item.estado === 'Completado' || item.estado === 'Confirmado' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {item.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentBilletera;