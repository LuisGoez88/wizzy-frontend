import React from 'react';
import TarjetaEsqueleto from './TarjetaEsqueleto';

const CuadriculaEsqueleto = ({ cantidad = 10, columnas = 5 }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${columnas} gap-6`}>
      {Array(cantidad).fill(0).map((_, index) => (
        <TarjetaEsqueleto key={index} />
      ))}
    </div>
  );
};

export default CuadriculaEsqueleto;