import React, { useState, useEffect } from 'react';
import { Calendar, Anchor, MessageCircle, Star, MapPin, Bell, HelpCircle, X, Camera, Plus } from 'lucide-react';

const DashboardExperiencias = () => {
  // --- ESTADOS ---
  const [experiencias, setExperiencias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nuevaExp, setNuevaExp] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    ubicacion: '',
    puntoEncuentro: '',
    imagenUrl: ''
  });

  // --- FETCH DATA ---
  const fetchExperiencias = async () => {
    try {
      // Ajusta la URL a tu endpoint de experiencias
      const response = await fetch('http://localhost:8080/api/experiencias');
      const data = await response.json();
      setExperiencias(data);
    } catch (error) {
      console.error("Error al cargar experiencias:", error);
    }
  };

  useEffect(() => {
    fetchExperiencias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/experiencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaExp)
      });
      if (response.ok) {
        setIsModalOpen(false);
        setNuevaExp({ titulo: '', descripcion: '', precio: '', ubicacion: '', puntoEncuentro: '', imagenUrl: '' });
        fetchExperiencias();
      }
    } catch (error) {
      console.error("Error guardando experiencia:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div className="text-2xl font-black text-violet-400 italic">Wizzy</div>
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-violet-600 rounded-xl font-bold text-sm">
            <Calendar size={20} /> Agenda
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 rounded-xl font-bold text-sm transition-all">
            <Anchor size={20} /> Mi Flota
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 rounded-xl font-bold text-sm transition-all">
            <Star size={20} /> Reseñas
          </button>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Gestión de Experiencias</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-violet-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Plus size={14} /> Nueva Experiencia
            </button>
            <Bell size={20} className="text-slate-400" />
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs">E</div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 text-slate-800 h-[400px] flex flex-col justify-center items-center">
              <Calendar size={48} className="text-slate-100 mb-4" />
              <p className="font-bold text-slate-300 uppercase text-[10px] tracking-widest">Calendario de Reservas</p>
            </div>
            
            <div className="space-y-6">
              {/* Card de Próximo Abordaje Dinámica */}
              {experiencias.length > 0 ? (
                <div className="bg-violet-600 p-6 rounded-[32px] shadow-lg shadow-violet-200 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Activa ahora</p>
                  <h4 className="text-xl font-black mb-1">{experiencias[0].titulo}</h4>
                  <p className="text-sm opacity-80">{experiencias[0].puntoEncuentro}</p>
                  <button className="w-full bg-white/20 mt-6 py-3 rounded-2xl text-[10px] font-black uppercase">Ver Detalles</button>
                </div>
              ) : (
                <div className="bg-slate-200 p-8 rounded-[32px] text-center border-2 border-dashed border-slate-300">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-tighter">Sin experiencias activas</p>
                </div>
              )}

              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Punto de Encuentro</p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <MapPin size={16} className="text-violet-500" /> 
                  {experiencias.length > 0 ? experiencias[0].ubicacion : 'Por definir'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Lista de Experiencias</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiencias.map((exp, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={exp.imagenUrl || 'https://via.placeholder.com/60'} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{exp.titulo}</p>
                      <p className="text-xs text-violet-600 font-black">${exp.precio}</p>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </main>

      {/* --- MODAL CREAR EXPERIENCIA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 flex justify-between items-center border-b border-slate-50">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Nueva Experiencia</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <input required placeholder="Título (ej: Tour Yate 45')" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-200"
                value={nuevaExp.titulo} onChange={(e) => setNuevaExp({...nuevaExp, titulo: e.target.value})} />
              <textarea placeholder="Descripción detallada..." className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-200"
                value={nuevaExp.descripcion} onChange={(e) => setNuevaExp({...nuevaExp, descripcion: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Precio ($)" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-200"
                  value={nuevaExp.precio} onChange={(e) => setNuevaExp({...nuevaExp, precio: e.target.value})} />
                <input placeholder="Ubicación" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-200"
                  value={nuevaExp.ubicacion} onChange={(e) => setNuevaExp({...nuevaExp, ubicacion: e.target.value})} />
              </div>
              <input placeholder="Punto de Encuentro (ej: Muelle de Manga)" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-200"
                value={nuevaExp.puntoEncuentro} onChange={(e) => setNuevaExp({...nuevaExp, puntoEncuentro: e.target.value})} />
              <input placeholder="URL Imagen" className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-200"
                value={nuevaExp.imagenUrl} onChange={(e) => setNuevaExp({...nuevaExp, imagenUrl: e.target.value})} />
              
              <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-violet-600 transition-all">
                {loading ? 'PUBLICANDO...' : 'LANZAR EXPERIENCIA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardExperiencias;