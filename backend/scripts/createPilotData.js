import { executeQuery } from '../config/database.js';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Script para crear PyMEs piloto con productos de ejemplo
 */
async function createPilotData() {
  try {
    console.log('🏪 Creando PyMEs piloto y productos de ejemplo...');

    // Datos de las 5 PyMEs piloto
    const pilotBusinesses = [
      // 3 Almacenes de barrio
      {
        name: 'María González',
        email: 'almacen.maria@vallemarkets.cl',
        password: 'maria123',
        business_name: 'Almacén Doña María',
        business_type: 'neighborhood_store',
        commission_rate: 5,
        products: [
          { name: 'Arroz 1kg', price: 1200, stock: 50, category: 'Abarrotes' },
          { name: 'Fideos 500g', price: 800, stock: 30, category: 'Abarrotes' },
          { name: 'Aceite 1L', price: 2500, stock: 20, category: 'Abarrotes' },
          { name: 'Coca Cola 1.5L', price: 1800, stock: 25, category: 'Bebidas' },
          { name: 'Pan de molde', price: 1500, stock: 15, category: 'Panadería' }
        ]
      },
      {
        name: 'Carlos Pérez',
        email: 'minimarket.carlos@vallemarkets.cl',
        password: 'carlos123',
        business_name: 'Minimarket El Rincón',
        business_type: 'neighborhood_store',
        commission_rate: 5,
        products: [
          { name: 'Leche 1L', price: 1000, stock: 40, category: 'Lácteos' },
          { name: 'Yogurt Natural', price: 600, stock: 35, category: 'Lácteos' },
          { name: 'Huevos docena', price: 2200, stock: 25, category: 'Lácteos' },
          { name: 'Galletas Soda', price: 1200, stock: 30, category: 'Snacks' },
          { name: 'Chocolate', price: 800, stock: 20, category: 'Dulces' }
        ]
      },
      {
        name: 'Ana Rodríguez',
        email: 'almacen.ana@vallemarkets.cl',
        password: 'ana123',
        business_name: 'Almacén La Esquina',
        business_type: 'neighborhood_store',
        commission_rate: 5,
        products: [
          { name: 'Detergente 1kg', price: 3500, stock: 15, category: 'Limpieza' },
          { name: 'Jabón en polvo', price: 2800, stock: 18, category: 'Limpieza' },
          { name: 'Papel higiénico 4 rollos', price: 3200, stock: 22, category: 'Higiene' },
          { name: 'Shampoo 400ml', price: 4500, stock: 12, category: 'Higiene' },
          { name: 'Cerveza Cristal 6 pack', price: 4800, stock: 20, category: 'Bebidas' }
        ]
      },
      // 2 Botillerías
      {
        name: 'Roberto Silva',
        email: 'botilleria.roberto@vallemarkets.cl',
        password: 'roberto123',
        business_name: 'Botillería Don Roberto',
        business_type: 'liquor_store',
        commission_rate: 7,
        products: [
          { name: 'Vino Tinto Reserva 750ml', price: 8500, stock: 30, category: 'Vinos' },
          { name: 'Vino Blanco Sauvignon 750ml', price: 7500, stock: 25, category: 'Vinos' },
          { name: 'Cerveza Escudo 330ml', price: 1200, stock: 60, category: 'Cervezas' },
          { name: 'Pisco 35° 750ml', price: 12000, stock: 15, category: 'Licores' },
          { name: 'Whisky Nacional 750ml', price: 18000, stock: 10, category: 'Licores' }
        ]
      },
      {
        name: 'Patricia Morales',
        email: 'botilleria.patricia@vallemarkets.cl',
        password: 'patricia123',
        business_name: 'Licorería Las Viñas',
        business_type: 'liquor_store',
        commission_rate: 7,
        products: [
          { name: 'Champagne Espumante', price: 15000, stock: 12, category: 'Espumantes' },
          { name: 'Ron Blanco 750ml', price: 14000, stock: 8, category: 'Licores' },
          { name: 'Cerveza Artesanal IPA', price: 2500, stock: 24, category: 'Cervezas' },
          { name: 'Vodka Premium 750ml', price: 22000, stock: 6, category: 'Licores' },
          { name: 'Vino Rosé 750ml', price: 6500, stock: 20, category: 'Vinos' }
        ]
      }
    ];

    // Crear categorías si no existen
    const categories = ['Abarrotes', 'Bebidas', 'Panadería', 'Lácteos', 'Snacks', 'Dulces', 'Limpieza', 'Higiene', 'Vinos', 'Cervezas', 'Licores', 'Espumantes'];
    
    for (const categoryName of categories) {
      const existing = await executeQuery('SELECT id FROM categories WHERE name = ?', [categoryName]);
      if (existing.length === 0) {
        await executeQuery(
          'INSERT INTO categories (id, name, description) VALUES (?, ?, ?)',
          [randomUUID(), categoryName, `Productos de ${categoryName}`]
        );
        console.log(`✅ Categoría creada: ${categoryName}`);
      }
    }

    // Crear PyMEs y productos
    for (const business of pilotBusinesses) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await executeQuery('SELECT id FROM users WHERE email = ?', [business.email]);
        
        let userId;
        if (existingUser.length > 0) {
          userId = existingUser[0].id;
          console.log(`ℹ️  Usuario existente: ${business.business_name}`);
          
          // Actualizar datos del negocio
          await executeQuery(`
            UPDATE users 
            SET business_name = ?, business_type = ?, commission_rate = ?, verified = 1 
            WHERE id = ?
          `, [business.business_name, business.business_type, business.commission_rate, userId]);
          
        } else {
          // Crear nuevo usuario vendedor
          userId = randomUUID();
          const hashedPassword = await bcrypt.hash(business.password, 10);
          
          await executeQuery(`
            INSERT INTO users (
              id, name, email, password, role, 
              business_name, business_type, commission_rate, verified, 
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'seller', ?, ?, ?, 1, NOW(), NOW())
          `, [
            userId, business.name, business.email, hashedPassword,
            business.business_name, business.business_type, business.commission_rate
          ]);
          
          console.log(`✅ PyME creada: ${business.business_name}`);
          console.log(`   📧 Email: ${business.email}`);
          console.log(`   🔐 Password: ${business.password}`);
        }

        // Crear productos para esta PyME
        for (const product of business.products) {
          // Obtener ID de categoría
          const categoryResult = await executeQuery('SELECT id FROM categories WHERE name = ?', [product.category]);
          const categoryId = categoryResult[0]?.id;

          if (categoryId) {
            // Verificar si el producto ya existe
            const existingProduct = await executeQuery(
              'SELECT id FROM products WHERE name = ? AND seller_id = ?', 
              [product.name, userId]
            );

            if (existingProduct.length === 0) {
              const productId = randomUUID();
              await executeQuery(`
                INSERT INTO products (
                  id, name, description, price, stock, category_id, seller_id,
                  status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
              `, [
                productId, product.name, 
                `${product.name} disponible en ${business.business_name}`,
                product.price, product.stock, categoryId, userId
              ]);
            }
          }
        }

        console.log(`   📦 ${business.products.length} productos agregados`);
        console.log('   ' + '─'.repeat(40));
        
      } catch (error) {
        console.error(`❌ Error procesando ${business.business_name}:`, error.message);
      }
    }

    console.log('\n🎉 ¡PyMEs piloto creadas exitosamente!');
    console.log('\n🔐 CREDENCIALES DE ACCESO:');
    console.log('='.repeat(50));
    
    pilotBusinesses.forEach(business => {
      console.log(`🏪 ${business.business_name}`);
      console.log(`   📧 Email: ${business.email}`);
      console.log(`   🔐 Password: ${business.password}`);
      console.log(`   💰 Comisión: ${business.commission_rate}%`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    throw error;
  }
}

// Ejecutar script
createPilotData()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });
