import React, { useState, useEffect } from 'react';

const HomeContent = () => {
  const [productos, setProductos] = useState([]);
  const [errorLocal, setErrorLocal] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/productos/tienda')
      .then(res => {
        if (!res.ok) throw new Error("Error en respuesta: " + res.status);
        return res.json();
      })
      .then(data => {
        console.log("Datos recibidos:", data);
        // En tu JSON vi que los productos reales tienen ID 10, 11 y 12
        const validos = data.filter(p => p.precioPublico > 0);
        setProductos(validos);
      })
      .catch(err => {
        console.error("Error Fetch:", err);
        setErrorLocal(err.message);
      });
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-black mb-6 uppercase">Tienda Wizzy</h1>
      
      {/* 🚨 CAJA DE DIAGNÓSTICO */}
      {errorLocal && (
        <div className="bg-red-100 border-2 border-red-500 p-4 mb-4 text-red-700">
          <strong>ERROR DE CONEXIÓN:</strong> {errorLocal} <br/>
          <small>Revisa si el Backend está encendido en el puerto 8080.</small>
        </div>
      )}

      {productos.length === 0 && !errorLocal && (
        <div className="bg-yellow-100 border-2 border-yellow-500 p-4">
          <strong>Backend conectado pero...</strong> la lista está vacía. <br/>
          Esto significa que Java envió <code>[]</code> o todos los productos tienen precio 0.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {productos.map(p => (
          <div key={p.id} className="border p-4 rounded-3xl shadow-lg">
            <img 
              src={p.imagenesUrls?.[0] || 'https://via.placeholder.com/150'} 
              className="w-full h-40 object-cover rounded-2xl mb-2" 
            />
            <h3 className="font-bold">{p.titulo}</h3>
            <p className="text-violet-600 font-black">${p.precioPublico}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeContent;