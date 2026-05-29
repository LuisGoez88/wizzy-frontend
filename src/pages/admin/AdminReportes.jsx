// pages/admin/AdminReportes.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, TrendingUp, TrendingDown,
  Users, DollarSign, Package, Calendar, Filter,
  ChevronLeft, ChevronRight, Printer, FileText
} from 'lucide-react';
import { getDashboardStats } from '../../services/adminApi';

const AdminReportes = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('6');

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    if (!stats?.ventasPorMes) return;
    
    let csv = 'Mes,Ventas\n';
    stats.ventasPorMes.forEach(mes => {
      csv += `${mes.mes},${mes.ventas}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_wizzy_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Reportes y Estadísticas
          </h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            Análisis detallado del rendimiento de la plataforma
          </p>
        </div>
        <button
          onClick={exportarCSV}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition flex items-center gap-2"
        >
          <Download size={14} /> Exportar Reporte
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Users size={16} className="text-blue-500" />
            <TrendingUp size={12} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{stats?.totalUsuarios?.toLocaleString() || '0'}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Usuarios Registrados</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Package size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{stats?.totalProductos?.toLocaleString() || '0'}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Productos Activos</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={16} className="text-emerald-500" />
            <TrendingUp size={12} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">${stats?.ventasTotales?.toLocaleString() || '0'}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Ventas Totales</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">${stats?.gananciasPlataforma?.toLocaleString() || '0'}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Ganancias Wizzy</p>
        </div>
      </div>

      {/* Gráfica de ventas */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-purple-600" />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Evolución de Ventas
            </h3>
          </div>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 rounded-lg text-[8px] font-bold"
          >
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Últimos 12 meses</option>
          </select>
        </div>
        
        {stats?.ventasPorMes && stats.ventasPorMes.length > 0 ? (
          <div className="space-y-3">
            {stats.ventasPorMes.slice(0, parseInt(periodo)).map((mes, idx) => {
              const maxVenta = Math.max(...stats.ventasPorMes.map(m => m.ventas));
              const porcentaje = (mes.ventas / maxVenta) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[8px]">
                    <span className="font-bold text-slate-500 uppercase">{mes.mes}</span>
                    <span className="font-black text-purple-600">${mes.ventas.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 flex items-center justify-end px-2"
                      style={{ width: `${porcentaje}%` }}
                    >
                      <span className="text-[6px] font-black text-white">{Math.round(porcentaje)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[9px] text-slate-400 text-center py-8">No hay datos de ventas disponibles</p>
        )}
      </div>

      {/* Top vendedores y productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            Top Vendedores
          </h3>
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
                      <p className="text-[9px] font-bold text-slate-700">{vendedor.nombre}</p>
                      <p className="text-[7px] text-slate-400">{vendedor.productosVendidos} productos vendidos</p>
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-emerald-600">
                    ${vendedor.ventas?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[9px] text-slate-400 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Package size={16} className="text-purple-500" />
            Productos Más Vendidos
          </h3>
          {stats?.productosMasVendidos && stats.productosMasVendidos.length > 0 ? (
            <div className="space-y-3">
              {stats.productosMasVendidos.slice(0, 5).map((producto, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[8px] font-bold text-slate-400 w-5">{idx + 1}</span>
                    <p className="text-[9px] font-bold text-slate-700 flex-1 truncate">{producto.nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-purple-600">{producto.cantidadVendida} uds</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[9px] text-slate-400 text-center py-8">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportes;