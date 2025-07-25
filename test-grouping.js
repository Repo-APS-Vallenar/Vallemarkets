// Script de prueba para algoritmo de agrupación de productos

// Función para normalizar nombres de productos
const normalizeProductName = (name) => {
  return name
    .toLowerCase()
    .trim()
    // Normalizar abreviaciones comunes PRIMERO
    .replace(/\b(\d+)\s*(ml|mililitros?)\b/g, '$1ml')
    .replace(/\b(\d+)\s*(lt?|litros?)\b/g, '$1litro')
    .replace(/\b(\d+)\s*(gr|gramos?)\b/g, '$1gr')
    .replace(/\b(\d+)\s*(kg|kilogramos?)\b/g, '$1kg')
    // Normalizar "1l" a "1litro" específicamente
    .replace(/\b(\d+)l\b/g, '$1litro')
    .replace(/\b(coca-cola|cocacola)\b/g, 'coca cola')
    .replace(/\b(yogur|yogurt)\b/g, 'yogurt')
    // Remover artículos y preposiciones comunes
    .replace(/\b(el|la|los|las|un|una|de|del|al|y|o|con|sin|por|para)\b/g, '')
    // Remover palabras descriptivas que no afectan la identidad del producto
    .replace(/\b(entera|descremada|semidescremada|light|diet)\b/g, '')
    // Remover caracteres especiales y normalizar espacios
    .replace(/[^\w\sáéíóúñ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Función para extraer palabras clave (ignorando palabras comunes)
const getKeyWords = (str) => {
  const commonWords = new Set([
    'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'o', 'con', 'sin', 
    'por', 'para', 'en', 'al', 'del', 'ml', 'gr', 'kg', 'lt', 'mg', 'cm', 'mm',
    'pack', 'unidad', 'unidades', 'pieza', 'piezas', 'extra', 'premium', 'especial',
    'fresco', 'frescos', 'fresca', 'frescas', 'natural', 'sin', 'azucar', 'azúcar',
    'entera', 'descremada', 'semidescremada', 'light', 'diet', 'tipo', 'marca'
  ]);
  
  return str
    .split(' ')
    .filter(word => word.length > 1 && !commonWords.has(word))
    .map(word => word.replace(/[^a-záéíóúñ0-9]/g, ''))
    .filter(word => word.length > 0);
};

// Función para calcular distancia de Levenshtein
const levenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Función avanzada para calcular similitud
const calculateAdvancedSimilarity = (str1, str2) => {
  const words1 = getKeyWords(str1);
  const words2 = getKeyWords(str2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let exactMatches = 0;
  let partialMatches = 0;
  
  words1.forEach(word1 => {
    if (words2.includes(word1)) {
      exactMatches++;
    } else {
      const hasPartialMatch = words2.some(word2 => 
        (word1.length > 3 && word2.includes(word1.substring(0, 4))) ||
        (word2.length > 3 && word1.includes(word2.substring(0, 4))) ||
        levenshteinDistance(word1, word2) <= 2
      );
      if (hasPartialMatch) {
        partialMatches++;
      }
    }
  });
  
  const totalWords = Math.max(words1.length, words2.length);
  const exactScore = (exactMatches / totalWords) * 1.0;
  const partialScore = (partialMatches / totalWords) * 0.5;
  
  return Math.min(exactScore + partialScore, 1.0);
};

// Ejemplos de prueba
const testCases = [
  { producto1: "Huevos docena", producto2: "Docena de huevos" },
  { producto1: "Leche 1L", producto2: "Leche 1 litro" },
  { producto1: "Leche 1L", producto2: "Leche entera 1 litro" },
  { producto1: "Pan integral", producto2: "Pan de molde integral" },
  { producto1: "Aceite de oliva", producto2: "Aceite oliva extra virgen" },
  { producto1: "Coca Cola 500ml", producto2: "Coca-Cola 500 ml" },
  { producto1: "Cerveza Corona", producto2: "Corona Extra" },
  { producto1: "Yogurt natural", producto2: "Yogur natural sin azúcar" },
  { producto1: "Arroz blanco", producto2: "Arroz grano largo" },
];

console.log("🧪 PRUEBAS DEL ALGORITMO DE AGRUPACIÓN");
console.log("=====================================");

testCases.forEach(({ producto1, producto2 }, index) => {
  const normalized1 = normalizeProductName(producto1);
  const normalized2 = normalizeProductName(producto2);
  const similarity = calculateAdvancedSimilarity(normalized1, normalized2);
  const shouldGroup = similarity > 0.5;
  
  console.log(`\n${index + 1}. "${producto1}" vs "${producto2}"`);
  console.log(`   Normalizado: "${normalized1}" vs "${normalized2}"`);
  console.log(`   Palabras clave: [${getKeyWords(normalized1).join(', ')}] vs [${getKeyWords(normalized2).join(', ')}]`);
  console.log(`   Similitud: ${(similarity * 100).toFixed(1)}%`);
  console.log(`   ${shouldGroup ? '✅ SE AGRUPARÍAN' : '❌ NO SE AGRUPARÍAN'}`);
});

// Función para probar agrupación completa
const testGrouping = (products) => {
  console.log("\n🔍 PRUEBA DE AGRUPACIÓN COMPLETA");
  console.log("================================");
  
  const groups = {};
  
  products.forEach(product => {
    const normalizedName = normalizeProductName(product);
    
    let groupKey = normalizedName;
    let bestMatch = '';
    let highestSimilarity = 0;
    
    const existingKeys = Object.keys(groups);
    for (const key of existingKeys) {
      const similarity = calculateAdvancedSimilarity(normalizedName, key);
      if (similarity > highestSimilarity && similarity > 0.5) {
        highestSimilarity = similarity;
        bestMatch = key;
      }
    }
    
    if (bestMatch && highestSimilarity > 0.5) {
      groupKey = bestMatch;
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(product);
  });
  
  console.log("\nResultado de agrupación:");
  Object.entries(groups).forEach(([groupName, products], index) => {
    console.log(`\nGrupo ${index + 1}: "${groupName}"`);
    products.forEach(product => console.log(`  - ${product}`));
  });
};

// Prueba con lista de productos
const productosPrueba = [
  "Huevos docena",
  "Docena de huevos frescos",
  "Leche 1L",
  "Leche entera 1 litro", 
  "Pan integral",
  "Pan de molde integral",
  "Coca Cola 500ml",
  "Coca-Cola 500 ml",
  "Cerveza Corona",
  "Corona Extra cerveza",
  "Aceite de oliva",
  "Aceite oliva virgen"
];

testGrouping(productosPrueba);
