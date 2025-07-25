/**
 * Utilidades para formatear moneda en pesos chilenos (CLP)
 */

export const formatCLP = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatCLPWithDecimals = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Función para parsear precio desde string a número
export const parseCLPToNumber = (clpString: string): number => {
  // Remover símbolo de peso, puntos y espacios
  const cleanString = clpString.replace(/[$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanString) || 0;
};

// Función para formatear números grandes de forma abreviada
export const formatCLPShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCLP(amount);
};
