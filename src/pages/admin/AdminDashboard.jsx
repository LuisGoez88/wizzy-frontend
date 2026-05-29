// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Store, Package, Ticket, DollarSign, TrendingUp, 
  Award, ShoppingBag, Eye, CheckCircle, Clock, AlertCircle,
  TrendingDown, Calendar, Star, Zap
} from 'lucide-react';
import { getDashboardStats } from '../../services/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-2">Error al cargar</p>
          <p className="text-[9px] text-slate-400">{error}</p>
          <button 
            onClick={cargarEstadisticas}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tarjetas = [
    {
      titulo: 'Usuarios Totales',
      valor: stats?.totalUsuarios?.toLocaleString() || '0',
      icono: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      titulo: 'Vendedores',
      valor: stats?.totalVendedores?.toLocaleString() || '0',
      icono: Store,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      titulo: 'Clientes',
      valor: stats?.totalClientes?.toLocaleString() || '0',
      icono: Users,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      titulo: 'Productos',
      valor: stats?.totalProductos?.toLocaleString() || '0',
      icono: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      titulo: 'Experiencias',
      valor: stats?.totalExperiencias?.toLocaleString() || '0',
      icono: Ticket,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      titulo: 'Ventas Totales',
      valor: `$${stats?.ventasTotales?.toLocaleString() || '0'}`,
      icono: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      titulo: 'Ganancias Wizzy',
      valor: `$${stats?.gananciasPlataforma?.toLocaleString() || '0'}`,
      icono: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      titulo: 'Vendedores Pendientes',
      valor: stats?.vendedoresPendientes?.toLocaleString() || '0',
      icono: Clock,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Panel de Administración
        </h1>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
          Visión general de la plataforma Wizzy
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetas.map((card, idx) => {
          const Icono = card.icono;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icono size={18} className={card.textColor} />
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-wider">
                  {card.titulo.split(' ').pop()}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-800">{card.valor}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                {card.titulo}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gráfica de ventas por mes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-purple-600" />
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Ventas por Mes
              </h3>
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          
          {stats?.ventasPorMes && stats.ventasPorMes.length > 0 ? (
            <div className="space-y-3">
              {stats.ventasPorMes.map((mes, idx) => {
                const maxVenta = Math.max(...stats.ventasPorMes.map(m => m.ventas));
                const porcentaje = (mes.ventas / maxVenta) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[8px]">
                      <span className="font-bold text-slate-500 uppercase">{mes.mes}</span>
                      <span className="font-black text-purple-600">${mes.ventas.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[9px] text-slate-400 text-center py-8">No hay datos de ventas disponibles</p>
          )}
        </div>

        {/* Top Vendedores */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Top Vendedores
              </h3>
            </div>
            <Star size={16} className="text-yellow-400" />
          </div>
          
          {stats?.topVendedores && stats.topVendedores.length > 0 ? (
            <div className="space-y-4">
              {stats.topVendedores.map((vendedor, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                      idx === 1 ? 'bg-slate-100 text-slate-500' :
                      idx === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-50 text-purple-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">{vendedor.nombre}</p>
                      <p className="text-[7px] text-slate-400 uppercase tracking-wider">
                        {vendedor.productosVendidos} productos vendidos
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-emerald-600">
                    ${vendedor.ventas?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[9px] text-slate-400 text-center py-8">No hay datos de vendedores disponibles</p>
          )}
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag size={18} className="text-purple-600" />
          <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
            Productos Más Vendidos
          </h3>
        </div>
        
        {stats?.productosMasVendidos && stats.productosMasVendidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-[8px] font-black text-slate-400 uppercase tracking-wider">#</th>
                  <th className="text-left py-2 text-[8px] font-black text-slate-400 uppercase tracking-wider">Producto</th>
                  <th className="text-right py-2 text-[8px] font-black text-slate-400 uppercase tracking-wider">Cantidad</th>
                  <th className="text-right py-2 text-[8px] font-black text-slate-400 uppercase tracking-wider">Total Ventas</th>
                </tr>
              </thead>
              <tbody>
                {stats.productosMasVendidos.slice(0, 5).map((producto, idx) => (
                  <tr key={idx} className="border-b border-slate-50">
                    <td className="py-3 text-[10px] font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 text-[10px] font-bold text-slate-700">{producto.nombre}</td>
                    <td className="py-3 text-[10px] font-bold text-slate-600 text-right">{producto.cantidadVendida}</td>
                    <td className="py-3 text-[10px] font-black text-purple-600 text-right">
                      ${producto.totalVentas?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[9px] text-slate-400 text-center py-8">No hay datos de productos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;