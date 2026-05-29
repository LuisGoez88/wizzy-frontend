import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Package, Calendar, DollarSign, 
  Star, BarChart3, PieChart, Loader2, Zap
} from 'lucide-react';

const AnalyticsDashboard = ({ vendedorId, tipoVendedor = 'PRODUCTOS' }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    ventasPorDia: {},
    ventasPorMes: {},
    topProductos: [],
    ingresosPorTipo: { productos: 0, experiencias: 0 },
    totalVentas: 0,
    pedidosEnPeriodo: 0
  });
  const [rango, setRango] = useState('SEMANA');
  const [error, setError] = useState(null);

  const rangos = [
    { value: 'SEMANA', label: 'Última semana' },
    { value: 'MES', label: 'Último mes' },
    { value: 'TRIMESTRE', label: 'Último trimestre' },
    { value: 'ANUAL', label: 'Último año' },
  ];

  useEffect(() => {
    cargarAnalytics();
  }, [vendedorId, rango]);

  const cargarAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8080/api/dashboard/vendedor/${vendedorId}/analytics?rango=${rango}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        setData({
          ventasPorDia: result.ventasPorDia || {},
          ventasPorMes: result.ventasPorMes || {},
          topProductos: result.topProductos || [],
          ingresosPorTipo: result.ingresosPorTipo || { productos: 0, experiencias: 0 },
          totalVentas: result.totalVentas || 0,
          pedidosEnPeriodo: result.pedidosEnPeriodo || 0
        });
      } else {
        setError(`Error ${response.status}: No se pudieron cargar los datos`);
      }
    } catch (error) {
      console.error("Error cargando analytics:", error);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const formatCOP = (valor) => {
    if (valor === undefined || valor === null) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-purple-600" />
        <span className="ml-3 text-sm font-black text-slate-500">Cargando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-sm font-black mb-4">{error}</p>
        <button onClick={cargarAnalytics} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-black">
          Reintentar
        </button>
      </div>
    );
  }

  const diasSemana = Object.entries(data.ventasPorDia);
  const valoresDia = diasSemana.map(([, monto]) => monto);
  const maxVentaDia = valoresDia.length > 0 ? Math.max(...valoresDia, 1) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
            <BarChart3 size={22} className="text-purple-600" />
            Wizzy Analytics
          </h2>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            {tipoVendedor === 'PRODUCTOS' ? 'Rendimiento de ventas de productos' : 'Rendimiento de reservas de experiencias'}
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {rangos.map(r => (
            <button
              key={r.value}
              onClick={() => setRango(r.value)}
              className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase transition-all ${
                rango === r.value 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-purple-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-5 text-white">
          <DollarSign size={22} className="mb-3 opacity-80" />
          <p className="text-[8px] font-black uppercase tracking-wider opacity-70">Ventas Totales</p>
          <p className="text-2xl font-black mt-1">{formatCOP(data.totalVentas)}</p>
          <p className="text-[8px] opacity-70 mt-1">{data.pedidosEnPeriodo} transacciones</p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <Package size={22} className="text-emerald-500 mb-3" />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Producto más vendido</p>
          <p className="text-sm font-black text-slate-800 mt-1 truncate">
            {data.topProductos.length > 0 ? data.topProductos[0].nombre : 'Sin datos'}
          </p>
          <p className="text-[9px] font-bold text-emerald-600 mt-1">
            {data.topProductos.length > 0 ? `${data.topProductos[0].cantidad} unidades` : ''}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <PieChart size={22} className="text-amber-500 mb-3" />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Ingresos por tipo</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[9px]">
              <span className="font-bold text-slate-600">Productos:</span>
              <span className="font-black text-purple-600">{formatCOP(data.ingresosPorTipo?.productos)}</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="font-bold text-slate-600">Experiencias:</span>
              <span className="font-black text-purple-600">{formatCOP(data.ingresosPorTipo?.experiencias)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ventas por día */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <h3 className="font-black text-slate-800 text-xs uppercase tracking-tighter mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-purple-600" />
          Ventas por día
        </h3>
        <div className="space-y-3">
          {diasSemana.length === 0 ? (
            <p className="text-[9px] text-slate-400 text-center py-4">No hay datos de ventas en este período</p>
          ) : (
            diasSemana.map(([dia, monto]) => {
              const porcentaje = (monto / maxVentaDia) * 100;
              return (
                <div key={dia}>
                  <div className="flex justify-between text-[9px] font-bold mb-1">
                    <span className="text-slate-600 uppercase">{dia}</span>
                    <span className="text-purple-600">{formatCOP(monto)}</span>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Top 5 productos */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <h3 className="font-black text-slate-800 text-xs uppercase tracking-tighter mb-4 flex items-center gap-2">
          <Star size={14} className="text-amber-500" />
          Top 5 productos más vendidos
        </h3>
        <div className="space-y-3">
          {data.topProductos.length === 0 ? (
            <p className="text-[9px] text-slate-400 text-center py-4">No hay ventas en este período</p>
          ) : (
            data.topProductos.map((producto, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-black">
                    {idx + 1}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{producto.nombre}</span>
                </div>
                <span className="text-[9px] font-black text-purple-600">{producto.cantidad} unidades</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <Zap size={18} className="text-purple-600" />
          <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-tighter">Insights Wizzy</h4>
        </div>
        <div className="space-y-2">
          {data.topProductos.length > 0 ? (
            <p className="text-[9px] text-slate-600">
              🔥 Tu producto más vendido es <span className="font-black text-purple-600">{data.topProductos[0].nombre}</span> con {data.topProductos[0].cantidad} unidades.
            </p>
          ) : (
            <p className="text-[9px] text-slate-600">📊 Realiza tus primeras ventas para ver insights personalizados.</p>
          )}
          {data.ingresosPorTipo?.experiencias > data.ingresosPorTipo?.productos && (
            <p className="text-[9px] text-slate-600">🛥️ Las experiencias generan más ingresos que los productos físicos.</p>
          )}
          {data.ingresosPorTipo?.productos > data.ingresosPorTipo?.experiencias && (
            <p className="text-[9px] text-slate-600">📦 Los productos físicos generan más ingresos que las experiencias.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;