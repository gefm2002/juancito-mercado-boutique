import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('🌱 Starting seed...')

  // Categorías
  const categories = [
    { name: 'Empanadas', slug: 'empanadas', sort_order: 1 },
    { name: 'Sandwiches tradicionales', slug: 'sandwiches-tradicionales', sort_order: 2 },
    { name: 'Sandwiches gourmet', slug: 'sandwiches-gourmet', sort_order: 3 },
    { name: 'Tablas y picadas', slug: 'tablas-y-picadas', sort_order: 4 },
    { name: 'Fiambres', slug: 'fiambres', sort_order: 5 },
    { name: 'Quesos', slug: 'quesos', sort_order: 6 },
    { name: 'Carnes envasadas', slug: 'carnes-envasadas', sort_order: 7 },
    { name: 'Menú del día', slug: 'menu-del-dia', sort_order: 8 },
    { name: 'Almacén gourmet', slug: 'almacen-gourmet', sort_order: 9 },
    { name: 'Vinos y bebidas', slug: 'vinos-y-bebidas', sort_order: 10 },
    { name: 'Panadería y pastelería', slug: 'panaderia-y-pasteleria', sort_order: 11 },
  ]

  console.log('📦 Creating categories...')
  const categoryMap: Record<string, string> = {}
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('juancito_categories')
      .upsert(cat, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error(`Error creating category ${cat.name}:`, error)
    } else {
      categoryMap[cat.slug] = data.id
      console.log(`✓ Created category: ${cat.name}`)
    }
  }

  // Productos
  const products = [
    // Empanadas
    ...['Jamón y Queso', 'Carne', 'Pollo', 'Cubana', 'Roquefort', '4 Quesos', 'Roquefort y Jamón', 'Margarita', 'Española', 'Americana', 'Portuguesa'].map((name) => ({
      name: `Empanada ${name}`,
      slug: `empanada-${name.toLowerCase().replace(/\s+/g, '-')}`,
      category_id: categoryMap['empanadas'],
      product_type: 'standard',
      price: 2400,
      description: null,
      images: [],
      is_featured: false,
    })),
    {
      name: 'Docena surtida',
      slug: 'docena-surtida',
      category_id: categoryMap['empanadas'],
      product_type: 'combo',
      price: 28800,
      description: '12 empanadas surtidas + 2 gratis',
      images: [],
      is_featured: true,
    },
    // Menú del día
    ...['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((dia, idx) => ({
      name: `Menú del día ${dia}`,
      slug: `menu-del-dia-${dia.toLowerCase()}`,
      category_id: categoryMap['menu-del-dia'],
      product_type: 'standard',
      price: 10000,
      description: ['Pollo a la mostaza con papas noisette', 'Pastel de papa', 'Pechuga de pollo al verdeo con papas fritas', 'Milanesa de carne napolitana con puré', 'Carne al horno con papas a la portuguesa'][idx],
      images: [],
      is_featured: true,
    })),
    // Sandwiches tradicionales
    { name: 'Jamón cocido y queso', slug: 'jamon-cocido-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 6300 },
    { name: 'Jamón cocido natural y queso', slug: 'jamon-cocido-natural-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7500 },
    { name: 'Jamón asado y queso', slug: 'jamon-asado-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8500 },
    { name: 'Jamón de Praga y queso', slug: 'jamon-de-praga-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8700 },
    { name: 'Jamón crudo y queso', slug: 'jamon-crudo-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 9300 },
    { name: 'Jamón crudo importado y queso', slug: 'jamon-crudo-importado-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 11900 },
    { name: 'Jamón crudo macerado al whisky y queso', slug: 'jamon-crudo-macerado-al-whisky-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7000 },
    { name: 'Lomito de Praga y queso', slug: 'lomito-de-praga-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7500 },
    { name: 'Lomito suizo y queso', slug: 'lomito-suizo-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7500 },
    { name: 'Lomito a las hierbas y queso', slug: 'lomito-a-las-hierbas-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7700 },
    { name: 'Lomito curado y queso', slug: 'lomito-curado-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8500 },
    { name: 'Leberwurst y queso', slug: 'leberwurst-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7000 },
    { name: 'Salame milán y queso', slug: 'salame-milan-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 6500 },
    { name: 'Salame bastón cagnoli (picado grueso) y queso', slug: 'salame-baston-cagnoli-picado-grueso-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8000 },
    { name: 'Salame bastón cagnoli (picado fino) y queso', slug: 'salame-baston-cagnoli-picado-fino-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8000 },
    { name: 'Salame puro cerdo y queso', slug: 'salame-puro-cerdo-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8000 },
    { name: 'Salame a las finas hierbas y queso', slug: 'salame-a-las-finas-hierbas-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8000 },
    { name: 'Salame tipo italiano (Montesano) y queso', slug: 'salame-tipo-italiano-montesano-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8000 },
    { name: 'Salame español (Cantimpalo) y queso', slug: 'salame-espanol-cantimpalo-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8000 },
    { name: 'Spianatta y queso', slug: 'spianatta-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 9000 },
    { name: 'Panceta ahumada y queso', slug: 'panceta-ahumada-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7000 },
    { name: 'Porchetta y queso', slug: 'porchetta-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 9000 },
    { name: 'Matambre casero y queso', slug: 'matambre-casero-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8000 },
    { name: 'Mortadela con pistacho y queso', slug: 'mortadela-con-pistacho-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 6500 },
    { name: 'Mortadela criolla y queso', slug: 'mortadela-criolla-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 5500 },
    { name: 'Pastrón casero y queso', slug: 'pastron-casero-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8500 },
    { name: 'Pavita y queso', slug: 'pavita-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8500 },
    { name: 'Bondiola clásica y queso', slug: 'bondiola-clasica-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 8500 },
    { name: 'Ciervo curado y queso', slug: 'ciervo-curado-y-queso', category_id: categoryMap['sandwiches-tradicionales'], product_type: 'standard', price: 7500 },
    // Sandwiches gourmet
    { name: 'Porchetta, queso criollo y morrón asado', slug: 'porchetta-queso-criollo-y-morron-asado', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 12500 },
    { name: 'Jamón crudo, rúcula, tomates secos, parmesano y oliva', slug: 'jamon-crudo-rucula-tomates-secos-parmesano-y-oliva', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 14400 },
    { name: 'Jamón crudo, polpetta, tomates secos, aceitunas negras, albahaca y oliva', slug: 'jamon-crudo-polpetta-tomates-secos-aceitunas-negras-albahaca-y-oliva', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 15400 },
    { name: 'Jamón crudo, brie, tomates secos, rúcula y oliva', slug: 'jamon-crudo-brie-tomates-secos-rucula-y-oliva', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 15400 },
    { name: 'Pavita, queso pategrás, tomates secos, queso blanco con ciboulette', slug: 'pavita-queso-pategras-tomates-secos-queso-blanco-con-ciboulette', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 10400 },
    { name: 'Jamón de Praga, queso Atuel, tomates secos y queso blanco con ciboulette', slug: 'jamon-de-praga-queso-atuel-tomates-secos-y-queso-blanco-con-ciboulette', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 11500 },
    { name: 'Pastón, pepino agridulce, mostaza relish y queso Dambo', slug: 'paston-pepino-agridulce-mostaza-relish-y-queso-dambo', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 11500 },
    { name: 'Mortadela con pistacho, stracciatella y pesto', slug: 'mortadela-con-pistacho-stracciatella-y-pesto', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 11500 },
    { name: 'Jamón crudo, gruyere, tomates secos, mayonesa casera', slug: 'jamon-crudo-gruyere-tomates-secos-mayonesa-casera', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 14000 },
    { name: 'Panceta ahumada, queso ahumado, pepinos agridulces y mostaza relish', slug: 'panceta-ahumada-queso-ahumado-pepinos-agridulces-y-mostaza-relish', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 11500 },
    { name: 'Jamón asado, queso fontina, aceitunas negras y queso blanco con ciboulette', slug: 'jamon-asado-queso-fontina-aceitunas-negras-y-queso-blanco-con-ciboulette', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 11500 },
    { name: 'Jamón cocido, stracciatella, tomate natural, aceitunas negras y pesto', slug: 'jamon-cocido-stracciatella-tomate-natural-aceitunas-negras-y-pesto', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 11500 },
    { name: 'Leberwurst, pepinos agridulces, queso Dambo y mostaza relish', slug: 'leberwurst-pepinos-agridulces-queso-dambo-y-mostaza-relish', category_id: categoryMap['sandwiches-gourmet'], product_type: 'standard', price: 10400 },
    // Tablas
    { name: 'Tabla Clásica de Fiambres y Quesos (2 comen / 4 pican)', slug: 'tabla-clasica-2-4', category_id: categoryMap['tablas-y-picadas'], product_type: 'combo', price: 46000, is_featured: true },
    { name: 'Tabla Clásica de Fiambres y Quesos (4 comen / 6 pican)', slug: 'tabla-clasica-4-6', category_id: categoryMap['tablas-y-picadas'], product_type: 'combo', price: 66000, is_featured: true },
    { name: 'Tabla Clásica de Fiambres y Quesos (8 comen / 12 pican)', slug: 'tabla-clasica-8-12', category_id: categoryMap['tablas-y-picadas'], product_type: 'combo', price: 96000, is_featured: true },
    { name: 'Tabla Especial de Fiambres y Quesos (2 comen / 4 pican)', slug: 'tabla-especial-2-4', category_id: categoryMap['tablas-y-picadas'], product_type: 'combo', price: 54000, is_featured: true },
    { name: 'Tabla Especial de Fiambres y Quesos (4 comen / 6 pican)', slug: 'tabla-especial-4-6', category_id: categoryMap['tablas-y-picadas'], product_type: 'combo', price: 81000, is_featured: true },
    { name: 'Tabla Especial de Fiambres y Quesos (8 comen / 12 pican)', slug: 'tabla-especial-8-12', category_id: categoryMap['tablas-y-picadas'], product_type: 'combo', price: 106000, is_featured: true },
    // Fiambres (weighted)
    { name: 'Jamón crudo tipo Parma (kg)', slug: 'jamon-crudo-tipo-parma-kg', category_id: categoryMap['fiambres'], product_type: 'weighted', price_per_kg: 42000, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Jamón cocido natural (kg)', slug: 'jamon-cocido-natural-kg', category_id: categoryMap['fiambres'], product_type: 'weighted', price_per_kg: 18500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Bondiola clásica (kg)', slug: 'bondiola-clasica-kg', category_id: categoryMap['fiambres'], product_type: 'weighted', price_per_kg: 24000, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Salame milán (kg)', slug: 'salame-milan-kg', category_id: categoryMap['fiambres'], product_type: 'weighted', price_per_kg: 19500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Mortadela con pistacho (kg)', slug: 'mortadela-con-pistacho-kg', category_id: categoryMap['fiambres'], product_type: 'weighted', price_per_kg: 17500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Pastrón casero (kg)', slug: 'pastron-casero-kg', category_id: categoryMap['fiambres'], product_type: 'weighted', price_per_kg: 25500, min_weight_g: 100, step_weight_g: 100 },
    // Quesos (weighted)
    { name: 'Pategrás (kg)', slug: 'pategras-kg', category_id: categoryMap['quesos'], product_type: 'weighted', price_per_kg: 16500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Gouda (kg)', slug: 'gouda-kg', category_id: categoryMap['quesos'], product_type: 'weighted', price_per_kg: 17000, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Gruyere (kg)', slug: 'gruyere-kg', category_id: categoryMap['quesos'], product_type: 'weighted', price_per_kg: 26000, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Brie (kg)', slug: 'brie-kg', category_id: categoryMap['quesos'], product_type: 'weighted', price_per_kg: 24500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Queso azul (kg)', slug: 'queso-azul-kg', category_id: categoryMap['quesos'], product_type: 'weighted', price_per_kg: 21000, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Parmesano (kg)', slug: 'parmesano-kg', category_id: categoryMap['quesos'], product_type: 'weighted', price_per_kg: 29500, min_weight_g: 100, step_weight_g: 100 },
    // Carnes envasadas (weighted)
    { name: 'Vacío envasado al vacío (kg)', slug: 'vacio-envasado-al-vacio-kg', category_id: categoryMap['carnes-envasadas'], product_type: 'weighted', price_per_kg: 11500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Ojo de bife (kg)', slug: 'ojo-de-bife-kg', category_id: categoryMap['carnes-envasadas'], product_type: 'weighted', price_per_kg: 16500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Bife de chorizo (kg)', slug: 'bife-de-chorizo-kg', category_id: categoryMap['carnes-envasadas'], product_type: 'weighted', price_per_kg: 15500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Matambre (kg)', slug: 'matambre-kg', category_id: categoryMap['carnes-envasadas'], product_type: 'weighted', price_per_kg: 12500, min_weight_g: 100, step_weight_g: 100 },
    { name: 'Costillar (kg)', slug: 'costillar-kg', category_id: categoryMap['carnes-envasadas'], product_type: 'weighted', price_per_kg: 9800, min_weight_g: 100, step_weight_g: 100 },
    // Almacén gourmet
    { name: 'Aceitunas mixtas premium 300g', slug: 'aceitunas-mixtas-premium-300g', category_id: categoryMap['almacen-gourmet'], product_type: 'standard', price: 6900 },
    { name: 'Tomates secos hidratados 200g', slug: 'tomates-secos-hidratados-200g', category_id: categoryMap['almacen-gourmet'], product_type: 'standard', price: 6400 },
    { name: 'Pesto clásico 180g', slug: 'pesto-clasico-180g', category_id: categoryMap['almacen-gourmet'], product_type: 'standard', price: 7200 },
    { name: 'Mostaza relish 200g', slug: 'mostaza-relish-200g', category_id: categoryMap['almacen-gourmet'], product_type: 'standard', price: 5600 },
    { name: 'Pepinos agridulces 300g', slug: 'pepinos-agridulces-300g', category_id: categoryMap['almacen-gourmet'], product_type: 'standard', price: 5900 },
    // Vinos y bebidas
    { name: 'Vino tinto Malbec 750ml (selección)', slug: 'vino-tinto-malbec-750ml-seleccion', category_id: categoryMap['vinos-y-bebidas'], product_type: 'standard', price: 9800 },
    { name: 'Vino blanco Sauvignon Blanc 750ml (selección)', slug: 'vino-blanco-sauvignon-blanc-750ml-seleccion', category_id: categoryMap['vinos-y-bebidas'], product_type: 'standard', price: 9200 },
    { name: 'Espumante brut 750ml (selección)', slug: 'espumante-brut-750ml-seleccion', category_id: categoryMap['vinos-y-bebidas'], product_type: 'standard', price: 12500 },
  ]

  console.log('📦 Creating products...')
  for (const product of products) {
    const { error } = await supabase
      .from('juancito_products')
      .upsert(
        {
          ...product,
          images: product.images || [],
          combo_items: product.product_type === 'combo' ? [] : null,
        },
        { onConflict: 'slug' }
      )

    if (error) {
      console.error(`Error creating product ${product.name}:`, error)
    } else {
      console.log(`✓ Created product: ${product.name}`)
    }
  }

  // Configuración del sitio
  console.log('⚙️ Creating site config...')
  const configs = [
    {
      key: 'nombre_comercial',
      value: 'Juancito Mercado Boutique',
    },
    {
      key: 'sucursales',
      value: [
        { nombre: 'Caballito La Plata', direccion: 'Av. La Plata 152, Caballito, CABA' },
        { nombre: 'Caballito Rivadavia', direccion: 'Av. Rivadavia 4546, Caballito, CABA' },
      ],
    },
    {
      key: 'whatsapp_phone',
      value: null,
    },
    {
      key: 'whatsapp_fallback_url',
      value: 'https://walink.co/d1b15d',
    },
    {
      key: 'textos',
      value: {
        hero_headline: 'Tu mercado boutique en Caballito',
        hero_subheadline: 'Fiambres, quesos, carnes, vinos y deli. Todo para el almuerzo, la picada o quedar como un campeón.',
        hero_cta_1: 'Ver productos',
        hero_cta_2: 'Pedir por WhatsApp',
      },
    },
    {
      key: 'faqs',
      value: [
        { question: '¿Hacen envíos?', answer: 'Sí, hacemos envíos en CABA. Consultá las zonas disponibles en el checkout.' },
        { question: '¿Puedo pedir para retirar?', answer: 'Sí, podés retirar en cualquiera de nuestras dos sucursales.' },
        { question: '¿Cómo funcionan los productos por peso?', answer: 'Los productos por peso se calculan según la cantidad que elijas. El precio se muestra por kg y se calcula automáticamente.' },
        { question: '¿Con cuánto tiempo pido una tabla?', answer: 'Te recomendamos pedir con 24 horas de anticipación para tablas grandes.' },
        { question: '¿Medios de pago?', answer: 'Aceptamos efectivo, transferencia, tarjetas y Mercado Pago.' },
      ],
    },
  ]

  for (const config of configs) {
    await supabase
      .from('juancito_site_config')
      .upsert(config, { onConflict: 'key' })
  }

  // Promos
  console.log('🎉 Creating promos...')
  const promos = [
    { title: 'Menú del día', description: 'Todos los días un menú diferente', link_url: '/catalogo?categoria=menu-del-dia', is_active: true, sort_order: 1 },
    { title: 'Empanadas $2400', description: 'Variedad de sabores', link_url: '/catalogo?categoria=empanadas', is_active: true, sort_order: 2 },
    { title: 'Tablas para picada', description: 'Armá tu picada perfecta', link_url: '/catalogo?categoria=tablas-y-picadas', is_active: true, sort_order: 3 },
  ]

  for (const promo of promos) {
    await supabase.from('juancito_promos').upsert(promo, { onConflict: 'id' })
  }

  console.log('✅ Seed completed!')
}

seed().catch(console.error)
