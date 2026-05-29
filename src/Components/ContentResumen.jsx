import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Users, ArrowUpRight, Clock } from 'lucide-react';

const ContentResumen = () => {
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS PARA DATOS REALES ---
  const [metricas, setMetricas] = useState({
    ventasTotales: 4250000,
    pedidosNuevos: 18,
    visitasHoy: 142,
    rendimiento: 12
  });

  const [dataGrafica, setDataGrafica] = useState([
    { dia: 'Lun', total: 400000 },
    { dia: 'Mar', total: 300000 },
    { dia: 'Mie', total: 900000 },
    { dia: 'Jue', total: 500000 },
    { dia: 'Vie', total: 700000 },
    { dia: 'Sab', total: 1200000 },
    { dia: 'Dom', total: 800000 },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Cuando tu backend esté listo, descomenta esto:
        // const response = await fetch('http://localhost:8080/api/dashboard/resumen');
        // const data = await response.json();
        // setMetricas(data.stats);
        // setDataGrafica(data.chart);
        console.log("Wizzy Engine: Sincronizando datos...");
      } catch (error) {
        console.error("Error en el motor de datos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER DE BIENVENIDA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Performance Global</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizado con el mercado de Cartagena</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black uppercase tracking-widest">Servidor Online</span>
        </div>
      </div>

      {/* TARJETAS DE INDICADORES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-violet-100 hover:-translate-y-1">
          <div className="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-4">
            <DollarSign size={20} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ingresos Totales</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            ${metricas.ventasTotales.toLocaleString('es-CO')}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1">
          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <ShoppingBag size={20} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pedidos Activos</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metricas.pedidosNuevos}</h3>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <Users size={20} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Alcance Web</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metricas.visitasHoy}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl text-white transition-all hover:shadow-slate-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <span className="bg-emerald-500 text-[8px] font-black px-2 py-1 rounded-lg uppercase">
                +{metricas.rendimiento}%
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status de Marca</p>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Escalando</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform">
            <TrendingUp size={120} />
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: GRÁFICA + ACTIVIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRÁFICA SEMANAL */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Flujo de Caja</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Gráfica de rendimiento semanal</p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGrafica}>
                <defs>
                  <linearGradient id="colorWizzy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="dia" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                    padding: '16px' 
                  }}
                  itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#7c3aed' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value) => [`$${value.toLocaleString('es-CO')}`, 'Ingresos']}
                  cursor={{ stroke: '#7c3aed', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#7c3aed" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorWizzy)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
            <Clock size={16} className="text-violet-600" /> Actividad Reciente
          </h4>
          <div className="space-y-6 flex-1">
            {[
              { t: 'Venta', desc: 'Tenis Wizzy Max', p: '+$210.000', h: 'Hace 5 min' },
              { t: 'Stock', desc: 'Gorra Pro agotada', p: 'Aviso', h: 'Hace 2 horas' },
              { t: 'Venta', desc: 'Camiseta Wizzy', p: '+$52.500', h: 'Ayer' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    <ArrowUpRight size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase">{item.desc}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.h}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-900">{item.p}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 bg-slate-50 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:bg-slate-900 hover:text-white transition-all tracking-widest">
            Ver Todo el Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentResumen;