// components/ImageUploader.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ImageUploader = ({ imagenesIniciales = [], onImagenesChange, maxImages = 10 }) => {
  const [imagenes, setImagenes] = useState(imagenesIniciales.map(url => ({ url, uploaded: true, progress: 100 })));
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const subirImagen = async (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('archivo', file);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:8080/api/upload/temp', true);
      
      // Barra de progreso
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setImagenes(prev => prev.map(img => 
            img.file === file ? { ...img, progress: percentComplete } : img
          ));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.response);
          resolve(data.url);
        } else {
          reject(new Error('Error al subir la imagen'));
        }
      };
      
      xhr.onerror = () => reject(new Error('Error de conexión'));
      xhr.send(formData);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = files.slice(0, maxImages - imagenes.length);
    
    if (nuevosArchivos.length === 0) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSubiendo(true);
    setError(null);

    // Agregar imágenes en estado "subiendo"
    const nuevasImagenesTemp = nuevosArchivos.map(file => ({
      file,
      url: URL.createObjectURL(file),
      progress: 0,
      uploading: true,
      error: false
    }));
    
    setImagenes(prev => [...prev, ...nuevasImagenesTemp]);

    // Subir cada imagen
    for (const img of nuevasImagenesTemp) {
      try {
        const url = await subirImagen(img.file);
        setImagenes(prev => prev.map(im => 
          im.file === img.file ? { ...im, url, uploaded: true, progress: 100, uploading: false } : im
        ));
      } catch (err) {
        setImagenes(prev => prev.map(im => 
          im.file === img.file ? { ...im, error: true, uploading: false } : im
        ));
        setError(`Error al subir ${img.file.name}`);
      }
    }

    setSubiendo(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const eliminarImagen = (index) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    setImagenes(nuevasImagenes);
    const urls = nuevasImagenes.filter(img => img.uploaded).map(img => img.url);
    if (onImagenesChange) onImagenesChange(urls);
  };

  const handleEliminarTodo = () => {
    setImagenes([]);
    if (onImagenesChange) onImagenesChange([]);
  };

  // Notificar cambios al padre
  React.useEffect(() => {
    const urls = imagenes.filter(img => img.uploaded).map(img => img.url);
    if (onImagenesChange) onImagenesChange(urls);
  }, [imagenes]);

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          subiendo ? 'border-purple-200 bg-purple-50' : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={subiendo}
        />
        <div className="flex flex-col items-center gap-2">
          {subiendo ? (
            <Loader2 size={32} className="text-purple-600 animate-spin" />
          ) : (
            <Upload size={32} className="text-slate-400" />
          )}
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {subiendo ? 'Subiendo imágenes...' : 'Haz clic para subir imágenes'}
          </p>
          <p className="text-[8px] text-slate-400">
            {imagenes.length} / {maxImages} imágenes
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-[8px] text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* Grid de imágenes con barras de progreso */}
      {imagenes.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {imagenes.map((img, idx) => (
            <div key={idx} className="relative group">
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                {img.uploaded ? (
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                    <ImageIcon size={24} className="text-slate-300 mb-2" />
                    <span className="text-[7px] text-slate-400">{Math.round(img.progress)}%</span>
                  </div>
                )}
                
                {/* Barra de progreso (solo mientras sube) */}
                {!img.uploaded && !img.error && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${img.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Indicador de error */}
                {img.error && (
                  <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                )}
                
                {/* Botón eliminar */}
                <button
                  onClick={() => eliminarImagen(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                  disabled={img.uploading}
                >
                  <X size={12} />
                </button>
                
                {/* Estado de completado */}
                {img.uploaded && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-full p-0.5">
                    <CheckCircle size={10} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón eliminar todo */}
      {imagenes.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleEliminarTodo}
            className="text-[8px] font-black text-red-500 hover:text-red-600 transition flex items-center gap-1"
          >
            <X size={12} /> Eliminar todas
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;