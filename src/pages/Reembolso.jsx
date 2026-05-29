import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Clock, Calendar, AlertCircle, CheckCircle, CreditCard, MessageCircle, ShieldCheck, Truck, Package } from 'lucide-react';

const Reembolso = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Botón volver */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-wider">Volver a la tienda</span>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-8 md:p-10 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <RefreshCw size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Política de Reembolso</h1>
              <p className="text-[9px] opacity-80 mt-1">Última actualización: Mayo 2026</p>
            </div>
          </div>
          <p className="text-[10px] opacity-80 leading-relaxed">
            En Wizzy nos importa tu satisfacción. A continuación, te explicamos nuestras políticas de reembolso 
            para productos físicos y experiencias.
          </p>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6">
          
          {/* Resumen rápido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
              <Package size={24} className="mx-auto text-purple-600 mb-2" />
              <p className="text-[8px] font-black text-slate-400 uppercase">Productos Físicos</p>
              <p className="text-[11px] font-black text-slate-800">30 días</p>
              <p className="text-[7px] text-slate-500">Para cambio o devolución</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
              <Calendar size={24} className="mx-auto text-amber-600 mb-2" />
              <p className="text-[8px] font-black text-slate-400 uppercase">Experiencias</p>
              <p className="text-[11px] font-black text-slate-800">48 horas</p>
              <p className="text-[7px] text-slate-500">Mínimo de anticipación</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
              <CreditCard size={24} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-[8px] font-black text-slate-400 uppercase">Procesamiento</p>
              <p className="text-[11px] font-black text-slate-800">5-10 días</p>
              <p class="text-[7px] text-slate-500">Hábiles para reembolso</p>
            </div>
          </div>

          {/* Sección 1 - Productos físicos */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Package size={16} className="text-emerald-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">1. Reembolsos para Productos Físicos</h2>
            </div>
            
            <div className="space-y-3">
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-[9px] font-black text-emerald-700 uppercase flex items-center gap-2">
                  <CheckCircle size={12} /> Plazo de 30 días
                </p>
                <p className="text-[9px] text-slate-600 mt-1">
                  Tienes 30 días calendario a partir de la fecha de recepción del producto para solicitar un reembolso o cambio.
                </p>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-[9px] font-black text-amber-700 uppercase flex items-center gap-2">
                  <AlertCircle size={12} /> Condiciones
                </p>
                <ul className="space-y-1 mt-2">
                  <li className="text-[8px] text-slate-600 flex items-start gap-2">
                    <span>•</span> El producto debe estar en su empaque original sin abrir.
                  </li>
                  <li className="text-[8px] text-slate-600 flex items-start gap-2">
                    <span>•</span> No se aceptan devoluciones de productos en mal estado o usados.
                  </li>
                  <li className="text-[8px] text-slate-600 flex items-start gap-2">
                    <span>•</span> El costo de envío para la devolución corre por cuenta del comprador.
                  </li>
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-[9px] font-black text-purple-700 uppercase flex items-center gap-2">
                  <RefreshCw size={12} /> Proceso de Reembolso
                </p>
                <p className="text-[8px] text-slate-600 mt-1">
                  1. Contacta a soporte a través de WhatsApp o correo electrónico.<br/>
                  2. Envía el producto a nuestra bodega en Cartagena.<br/>
                  3. Una vez verificado, procesamos el reembolso en 5-10 días hábiles.
                </p>
              </div>
            </div>
          </div>

          {/* Sección 2 - Experiencias */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar size={16} className="text-amber-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">2. Cancelaciones de Experiencias</h2>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <Clock size={20} className="mx-auto text-emerald-600 mb-1" />
                  <p className="text-[10px] font-black text-emerald-700">+48 horas</p>
                  <p className="text-[8px] text-slate-600">Reembolso 100%</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <Clock size={20} className="mx-auto text-amber-600 mb-1" />
                  <p className="text-[10px] font-black text-amber-700">24-48 horas</p>
                  <p className="text-[8px] text-slate-600">Reembolso 50%</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <Clock size={20} className="mx-auto text-red-600 mb-1" />
                  <p className="text-[10px] font-black text-red-700">-24 horas</p>
                  <p className="text-[8px] text-slate-600">Sin reembolso</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[9px] font-black text-slate-700 uppercase flex items-center gap-2">
                  <AlertCircle size={12} /> Excepciones
                </p>
                <p className="text-[8px] text-slate-600 mt-1">
                  En caso de cancelación por mal clima o fuerza mayor (confirmado por el vendedor), 
                  se ofrecerá reagendación sin costo o reembolso del 100%.
                </p>
              </div>
            </div>
          </div>

          {/* Sección 3 - Planes grupales */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">3. Cancelación de Planes Grupales</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-3">
              Para planes grupales (parches), aplican las mismas políticas que para experiencias individuales, con las siguientes consideraciones:
            </p>
            <ul className="space-y-2 text-[9px] text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Solo el líder del grupo puede solicitar la cancelación del plan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Los reembolsos se calculan según la fecha de cancelación vs la fecha de la experiencia.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Cada miembro recibirá su reembolso individualmente al método de pago registrado.</span>
              </li>
            </ul>
          </div>

          {/* Sección 4 - Productos defectuosos */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle size={16} className="text-red-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">4. Productos Defectuosos o Dañados</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-3">
              Si recibes un producto en mal estado o defectuoso, contáctanos dentro de las primeras 48 horas:
            </p>
            <ul className="space-y-2 text-[9px] text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Envía evidencia (fotos o videos) del producto y el empaque.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Te reembolsaremos el 100% del valor o enviaremos un reemplazo sin costo adicional.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>El costo de envío para la devolución será cubierto por Wizzy.</span>
              </li>
            </ul>
          </div>

          {/* Sección 5 - Impulso */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <RefreshCw size={16} className="text-emerald-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">5. Reembolso de Saldo Impulso</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              El saldo Impulso acumulado en compras no es reembolsable en efectivo. Solo puede ser utilizado 
              para canjear experiencias dentro de la plataforma Wizzy. En caso de cancelación de una experiencia 
              pagada con saldo Impulso, el saldo se devuelve a tu billetera Impulso (no como dinero en efectivo).
            </p>
          </div>

          {/* Sección 6 - Contacto */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">6. ¿Cómo solicitar un reembolso?</h2>
            </div>
            <p className="text-[10px] text-slate-600 mb-3">
              Para solicitar un reembolso, contáctanos a través de cualquiera de estos canales:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:reembolsos@wizzy.com" 
                className="flex-1 bg-white text-center py-2.5 rounded-xl text-[9px] font-black text-purple-600 hover:bg-purple-50 transition border border-purple-200"
              >
                📧 reembolsos@wizzy.com
              </a>
              <a 
                href="https://wa.me/573000000000?text=Hola%20Wizzy%2C%20necesito%20solicitar%20un%20reembolso" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-purple-600 text-white text-center py-2.5 rounded-xl text-[9px] font-black hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={12} /> WhatsApp: +57 300 000 0000
              </a>
            </div>
            <p className="text-[7px] text-slate-400 text-center mt-4">
              * Los reembolsos se procesan en un plazo de 5 a 10 días hábiles después de la aprobación.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="text-[8px] text-slate-400">Compra protegida por Wizzy Protect</span>
            <Truck size={14} className="text-purple-600" />
            <span className="text-[8px] text-slate-400">Envío gratis en Colombia</span>
          </div>
          <p className="text-[8px] text-slate-400">
            Wizzy Marketplace SAS • NIT: 901.234.567-8 • Cartagena, Colombia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reembolso;