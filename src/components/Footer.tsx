import React from 'react';
import { Store, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Store className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold">Valle Markets</span>
            </div>
            <p className="text-gray-400 mb-4">
              Conectamos PyMEs locales con compradores en Vallenar y la región, 
              fortaleciendo el comercio local y apoyando el crecimiento económico.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/productos" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Productos
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Iniciar Sesión
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Registrarse
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-400">vallemarkets@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-400">+569 9 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-400">Vallenar, Chile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Valle Markets. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;