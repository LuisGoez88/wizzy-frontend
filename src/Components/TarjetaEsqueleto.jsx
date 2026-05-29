import React from 'react';

const TarjetaEsqueleto = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Imagen esqueleto */}
      <div className="relative aspect-square bg-slate-200">
        <div className="absolute top-3 left-3 w-16 h-5 bg-slate-300 rounded-full" />
      </div>
      
      {/* Contenido esqueleto */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Título esqueleto */}
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-slate-200 rounded-full w-full" />
          <div className="h-3 bg-slate-200 rounded-full w-3/4" />
        </div>
        
        {/* Precio esqueleto */}
        <div className="bg-slate-100 p-3 rounded-2xl mb-3">
          <div className="h-2 bg-slate-200 rounded-full w-1/3 mb-2" />
          <div className="h-6 bg-slate-200 rounded-full w-1/2 mb-2" />
          <div className="h-2 bg-slate-200 rounded-full w-2/3" />
        </div>
        
        {/* Botón esqueleto */}
        <div className="w-full h-8 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
};

export default TarjetaEsqueleto;