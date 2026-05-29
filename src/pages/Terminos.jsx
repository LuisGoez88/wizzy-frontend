import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, FileText, CheckCircle, Clock, RefreshCw, Users, Lock, CreditCard, MessageCircle } from 'lucide-react';

const Terminos = () => {
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-3xl p-8 md:p-10 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Términos y Condiciones</h1>
              <p className="text-[9px] opacity-80 mt-1">Última actualización: Mayo 2026</p>
            </div>
          </div>
          <p className="text-[10px] opacity-80 leading-relaxed">
            Al utilizar la plataforma Wizzy, aceptas cumplir con estos términos. Te recomendamos leerlos detenidamente antes de realizar cualquier compra.
          </p>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6">
          
          {/* Sección 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <ShieldCheck size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">1. Aceptación de los Términos</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Al acceder y utilizar la plataforma Wizzy, aceptas estar sujeto a estos Términos y Condiciones, 
              así como a todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos 
              términos, te pedimos que no utilices nuestra plataforma.
            </p>
          </div>

          {/* Sección 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">2. Registro y Cuenta</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-3">
              Para realizar compras en Wizzy, debes crear una cuenta proporcionando información verídica y actualizada.
            </p>
            <ul className="space-y-2 text-[9px] text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Debes ser mayor de 18 años para registrarte como vendedor.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Eres responsable de mantener la confidencialidad de tu contraseña.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Wizzy se reserva el derecho de suspender cuentas con actividad sospechosa.</span>
              </li>
            </ul>
          </div>

          {/* Sección 3 - Compras */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">3. Proceso de Compra</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-3">
              Al realizar una compra en Wizzy, aceptas lo siguiente:
            </p>
            <ul className="space-y-2 text-[9px] text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Los precios están expresados en Pesos Colombianos (COP).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>El envío es gratuito en toda Colombia para todos los productos físicos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Los tiempos de entrega son de 3 a 5 días hábiles después de la confirmación del pago.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Recibirás un comprobante de compra por correo electrónico y WhatsApp.</span>
              </li>
            </ul>
          </div>

          {/* Sección 4 - Impulso */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <RefreshCw size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">4. Programa Impulso Wizzy</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-3">
              El programa Impulso Wizzy permite acumular saldo en tus compras para canjearlo en experiencias.
            </p>
            <ul className="space-y-2 text-[9px] text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Ganas entre 10% y 20% de cashback en cada compra de productos físicos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>El saldo Impulso puede ser utilizado únicamente en experiencias (yates, tours, hospedajes).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>El saldo Impulso no es reembolsable en efectivo.</span>
              </li>
            </ul>
          </div>

          {/* Sección 5 - Responsabilidad */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Lock size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">5. Limitación de Responsabilidad</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Wizzy actúa como intermediario entre compradores y vendedores. No somos responsables por la calidad 
              de los productos ofrecidos por vendedores externos. Sin embargo, garantizamos la seguridad de tus pagos 
              y la protección de tus datos personales.
            </p>
          </div>

          {/* Sección 6 - Propiedad Intelectual */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">6. Propiedad Intelectual</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Todo el contenido de Wizzy (logos, diseños, textos, imágenes) es propiedad exclusiva de Wizzy y está 
              protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción sin autorización previa.
            </p>
          </div>

          {/* Sección 7 - Modificaciones */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-purple-600" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">7. Modificaciones de los Términos</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Wizzy se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán 
              notificados a través de la plataforma y se considerarán aceptados al continuar usando el servicio.
            </p>
          </div>

          {/* Sección 8 - Contacto */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter">8. Contacto</h2>
            </div>
            <p className="text-[10px] text-slate-600 mb-3">
              Si tienes preguntas sobre estos términos, puedes contactarnos a través de:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:soporte@wizzy.com" 
                className="text-[9px] font-black text-purple-600 hover:text-purple-700 transition"
              >
                📧 soporte@wizzy.com
              </a>
              <a 
                href="https://wa.me/573000000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-black text-purple-600 hover:text-purple-700 transition"
              >
                💬 WhatsApp: +57 300 000 0000
              </a>
            </div>
          </div>
        </div>

        {/* Footer de términos */}
        <div className="mt-8 text-center">
          <p className="text-[8px] text-slate-400">
            Wizzy Marketplace SAS • NIT: 901.234.567-8 • Cartagena, Colombia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terminos;