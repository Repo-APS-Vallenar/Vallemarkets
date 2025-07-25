// Script de prueba para algoritmo universal de agrupación

// Función universal para normalizar nombres de productos
const normalizeProductName = (name) => {
  return name
    .toLowerCase()
    .trim()
    // Normalizar unidades de medida comunes
    .replace(/\b(\d+)\s*(ml|mililitros?|cc)\b/g, '$1ml')
    .replace(/\b(\d+)\s*(lt?|litros?)\b/g, '$1litro')
    .replace(/\b(\d+)\s*(gr|gramos?)\b/g, '$1gr')
    .replace(/\b(\d+)\s*(kg|kilogramos?|kilos?)\b/g, '$1kg')
    .replace(/\b(\d+)\s*(mg|miligramos?)\b/g, '$1mg')
    .replace(/\b(\d+)\s*(cm|centímetros?)\b/g, '$1cm')
    .replace(/\b(\d+)\s*(mm|milímetros?)\b/g, '$1mm')
    .replace(/\b(\d+)\s*(oz|onzas?)\b/g, '$1oz')
    // Normalizar abreviaciones específicas
    .replace(/\b(\d+)l\b/g, '$1litro')
    .replace(/\b(\d+)g\b/g, '$1gr')
    // Normalizar marcas y variaciones comunes
    .replace(/\b(coca-cola|cocacola|coca cola)\b/g, 'coca cola')
    .replace(/\b(yogur|yogurt)\b/g, 'yogurt')
    .replace(/\b(champu|shampoo)\b/g, 'shampoo')
    .replace(/\b(jabon|jabón)\b/g, 'jabon')
    // Remover artículos y preposiciones
    .replace(/\b(el|la|los|las|un|una|de|del|al|y|o|con|sin|por|para|en)\b/g, '')
    // Remover descriptores comunes que no afectan la identidad del producto
    .replace(/\b(entera|descremada|semidescremada|light|diet|zero|normal|regular)\b/g, '')
    .replace(/\b(fresco|fresca|frescos|frescas|natural|premium|especial|extra)\b/g, '')
    .replace(/\b(grande|pequeño|mediano|chico|mini|maxi|familiar|personal)\b/g, '')
    .replace(/\b(pack|paquete|caja|bolsa|botella|lata|envase|unidad|unidades)\b/g, '')
    // Remover números de lote, códigos y caracteres especiales
    .replace(/\b(cod|codigo|ref|referencia|modelo|mod)\b[\s\d\w]*/g, '')
    .replace(/[^\w\sáéíóúñ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Función para extraer palabras clave expandida
const getKeyWords = (str) => {
  const commonWords = new Set([
    // Artículos y preposiciones
    'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'o', 'con', 'sin', 
    'por', 'para', 'en', 'al', 'del', 'a', 'ante', 'bajo', 'cabe', 'sobre', 'tras',
    // Unidades de medida (ya normalizadas)
    'ml', 'gr', 'kg', 'lt', 'mg', 'cm', 'mm', 'oz', 'litro', 'gramo', 'kilo',
    // Descriptores de calidad/tipo
    'premium', 'especial', 'extra', 'super', 'mega', 'ultra', 'plus', 'max',
    'fresco', 'frescos', 'fresca', 'frescas', 'natural', 'organico', 'organica',
    'light', 'diet', 'zero', 'normal', 'regular', 'clasico', 'clasica', 'tradicional',
    // Descriptores de tamaño
    'grande', 'pequeño', 'pequeña', 'mediano', 'mediana', 'chico', 'chica', 
    'mini', 'maxi', 'familiar', 'personal', 'individual',
    // Tipos de envase/empaque
    'pack', 'paquete', 'caja', 'bolsa', 'botella', 'lata', 'envase', 'frasco',
    'unidad', 'unidades', 'pieza', 'piezas', 'docena', 'media',
    // Descriptores lácteos
    'entera', 'descremada', 'semidescremada', 'deslactosada',
    // Palabras de relleno
    'nuevo', 'nueva', 'mejor', 'original', 'autentico', 'autentica', 'puro', 'pura',
    'tipo', 'marca', 'estilo', 'sabor', 'variedad', 'version'
  ]);
  
  return str
    .split(' ')
    .filter(word => word.length > 1 && !commonWords.has(word))
    .map(word => word.replace(/[^a-záéíóúñ0-9]/g, ''))
    .filter(word => word.length > 0);
};

// Funciones de similitud (mantenidas igual)
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

// Casos de prueba ampliados para productos desconocidos
const testCasesUniversal = [
  // Casos conocidos (ya probados)
  { producto1: "Huevos docena", producto2: "Docena de huevos frescos" },
  { producto1: "Leche 1L", producto2: "Leche entera 1 litro" },
  
  // Productos nuevos/desconocidos
  { producto1: "Detergente líquido 500ml", producto2: "Detergente 500 ml concentrado" },
  { producto1: "Galletas chocolate", producto2: "Galletas con chips chocolate" },
  { producto1: "Atún en agua 200g", producto2: "Atún al agua 200 gramos" },
  { producto1: "Papel higiénico 4 rollos", producto2: "Papel tissue 4 unidades" },
  { producto1: "Jugo naranja 1L", producto2: "Jugo de naranja 1 litro natural" },
  { producto1: "Arroz blanco 1kg", producto2: "Arroz grano largo 1 kilo" },
  { producto1: "Fideos espagueti 500g", producto2: "Pasta espagueti 500 gramos" },
  { producto1: "Aceitunas verdes 200g", producto2: "Aceitunas rellenas 200gr" },
  { producto1: "Mantequilla 250g", producto2: "Manteca 250 gramos sin sal" },
  { producto1: "Cerveza lager 350ml", producto2: "Cerveza rubia 350 ml" },
];

console.log("🧪 PRUEBAS DEL ALGORITMO UNIVERSAL");
console.log("==================================");

testCasesUniversal.forEach(({ producto1, producto2 }, index) => {
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

// Prueba de agrupación con productos mixtos
const productosMixtos = [
  "Detergente líquido 500ml",
  "Detergente 500 ml concentrado", 
  "Galletas chocolate",
  "Galletas con chips chocolate",
  "Atún en agua 200g",
  "Atún al agua 200 gramos",
  "Papel higiénico 4 rollos",
  "Papel tissue 4 unidades",
  "Jugo naranja 1L",
  "Jugo de naranja 1 litro natural",
  "Arroz blanco 1kg",
  "Arroz integral 1 kilo"
];

const testGrouping = (products) => {
  console.log("\n🔍 PRUEBA DE AGRUPACIÓN CON PRODUCTOS DESCONOCIDOS");
  console.log("================================================");
  
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

testGrouping(productosMixtos);
