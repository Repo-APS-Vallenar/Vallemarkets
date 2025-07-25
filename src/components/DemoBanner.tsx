import React from 'react';
import { WifiOff } from 'lucide-react';

interface DemoBannerProps {
  isBackendConnected: boolean;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ isBackendConnected }) => {
  if (isBackendConnected) {
    return null; // No mostrar banner si el backend está conectado
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Modo Demostración:</strong> El backend no está disponible. 
            Estás viendo datos de prueba. Las funciones de IA y el carrito están disponibles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
