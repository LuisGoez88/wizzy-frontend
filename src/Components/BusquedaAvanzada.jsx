// components/BusquedaAvanzada.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Star, DollarSign, Tag, SlidersHorizontal } from 'lucide-react';

const BusquedaAvanzada = ({ onResultados, loading, setLoading, searchTerm, setSearchTerm, onBuscar }) => {
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    categoria: '',
    precioMin: '',
    precioMax: '',
    ordenarPor: '',
    tipo: 'TODOS'
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/productos/tienda');
      if (response.ok) {
        const data = await response.json();
        const cats = [...new Set(data.map(p => p.categoria).filter(c => c))];
        setCategorias(cats);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscarAvanzado = async () => {
    if (setLoading) setLoading(true);
    try {
      const requestBody = {
        search: searchTerm || null,
        categoria: filtros.categoria || null,
        precioMin: filtros.precioMin ? parseFloat(filtros.precioMin) : null,
        precioMax: filtros.precioMax ? parseFloat(filtros.precioMax) : null,
        ordenarPor: filtros.ordenarPor || null,
        tipo: filtros.tipo,
        page: 0,
        size: 12
      };
      
      const response = await fetch('http://localhost:8080/api/productos/busqueda-avanzada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (onResultados) onResultados(data);
      }
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
    } finally {
      if (setLoading) setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoria: '',
      precioMin: '',
      precioMax: '',
      ordenarPor: '',
      tipo: 'TODOS'
    });
    if (onBuscar) onBuscar();
  };

  const ordenamientos = [
    { value: '', label: 'Relevancia' },
    { value: 'precio_asc', label: 'Precio: menor a mayor' },
    { value: 'precio_desc', label: 'Precio: mayor a menor' }
  ];

  return (
    <div className="w-full">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscarAvanzado()}
            placeholder="Buscar productos o experiencias..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-medium outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>
        
        <button
          onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
          className={`px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            filtrosAbiertos 
              ? 'bg-purple-600 text-white' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="text-[9px] font-black uppercase">Filtros</span>
          <ChevronDown size={14} className={`transition-transform ${filtrosAbiertos ? 'rotate-180' : ''}`} />
        </button>
        
        <button
          onClick={handleBuscarAvanzado}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition"
        >
          Buscar
        </button>
      </div>

      {/* Panel de filtros avanzados */}
      {filtrosAbiertos && (
        <div className="mt-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de producto */}
            <div>
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                Tipo
              </label>
              <select
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
                className="w-full p-2.5 bg-slate-50 rounded-xl text-[9px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="TODOS">Todos</option>
                <option value="PRODUCTOS">📦 Productos</option>
                <option value="EXPERIENCIAS">✨ Experiencias</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                Categoría
              </label>
              <select
                name="categoria"
                value={filtros.categoria}
                onChange={handleFiltroChange}
                className="w-full p-2.5 bg-slate-50 rounded-xl text-[9px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="">Todas</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                Precio mínimo ($)
              </label>
              <input
                type="number"
                name="precioMin"
                value={filtros.precioMin}
                onChange={handleFiltroChange}
                placeholder="0"
                className="w-full p-2.5 bg-slate-50 rounded-xl text-[9px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                Precio máximo ($)
              </label>
              <input
                type="number"
                name="precioMax"
                value={filtros.precioMax}
                onChange={handleFiltroChange}
                placeholder="Ilimitado"
                className="w-full p-2.5 bg-slate-50 rounded-xl text-[9px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>

          {/* Ordenamiento y acciones */}
          <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
                Ordenar por:
              </label>
              <select
                name="ordenarPor"
                value={filtros.ordenarPor}
                onChange={handleFiltroChange}
                className="p-2 bg-slate-50 rounded-xl text-[8px] font-medium outline-none focus:ring-2 focus:ring-purple-200"
              >
                {ordenamientos.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-slate-100 rounded-xl text-[8px] font-black uppercase text-slate-600 hover:bg-slate-200 transition"
              >
                Limpiar filtros
              </button>
              <button
                onClick={handleBuscarAvanzado}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[8px] font-black uppercase hover:bg-purple-700 transition"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusquedaAvanzada;