import * as dotenv from 'dotenv'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// URLs de imágenes de stock (Unsplash - dominio público, temática deli/fiambres)
const STOCK_IMAGES: Record<string, string[]> = {
  'empanadas': [
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80&fit=crop',
  ],
  'sandwiches-tradicionales': [
    'https://images.unsplash.com/photo-1553909489-cf46db38dfd9?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80&fit=crop',
  ],
  'sandwiches-gourmet': [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1553909489-cf46db38dfd9?w=800&q=80&fit=crop',
  ],
  'fiambres': [
    'https://images.unsplash.com/photo-1606914469633-bd39206ea739?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&q=80&fit=crop',
  ],
  'quesos': [
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1618164436261-4473940d1f5c?w=800&q=80&fit=crop',
  ],
  'carnes-envasadas': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&q=80&fit=crop',
  ],
  'tablas-y-picadas': [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1606914469633-bd39206ea739?w=800&q=80&fit=crop',
  ],
  'menu-del-dia': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80&fit=crop',
  ],
  'almacen-gourmet': [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80&fit=crop',
  ],
  'vinos-y-bebidas': [
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1506377247727-4bdfd91f78e4?w=800&q=80&fit=crop',
  ],
  'panaderia-y-pasteleria': [
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80&fit=crop',
  ],
  'hero': [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1200&q=80&fit=crop',
  ],
}

async function downloadAndUploadImages() {
  console.log('📥 Descargando y subiendo imágenes de stock...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env.local')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Crear directorio temporal
  const tempDir = join(process.cwd(), 'temp-images')
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  const uploadedImages: Record<string, string[]> = {}

  for (const [category, urls] of Object.entries(STOCK_IMAGES)) {
    console.log(`📦 Procesando: ${category}...`)
    uploadedImages[category] = []

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      try {
        // Descargar imagen
        console.log(`  📥 Descargando ${i + 1}/${urls.length}...`)
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Generar nombre único
        const extension = url.includes('.jpg') || url.includes('jpeg') ? 'jpg' : 'webp'
        const filename = `${category}-${Date.now()}-${i}.${extension}`
        const filePath = `${category}/${filename}`

        // Subir a Supabase Storage
        console.log(`  ⬆️  Subiendo a Storage...`)
        const { data, error } = await supabase.storage
          .from('juancito_product_images')
          .upload(filePath, buffer, {
            contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
            upsert: true
          })

        if (error) {
          console.log(`  ⚠️  Error: ${error.message}`)
          continue
        }

        // Obtener URL pública
        const { data: publicData } = supabase.storage
          .from('juancito_product_images')
          .getPublicUrl(filePath)

        uploadedImages[category].push(publicData.publicUrl)
        console.log(`  ✅ Subida: ${publicData.publicUrl}\n`)

      } catch (error: any) {
        console.log(`  ❌ Error procesando imagen: ${error.message}\n`)
      }
    }
  }

  // Guardar URLs en un archivo JSON para usar en el seed
  const imagesPath = join(process.cwd(), 'supabase/seed/images.json')
  writeFileSync(imagesPath, JSON.stringify(uploadedImages, null, 2))
  console.log(`✅ URLs guardadas en: ${imagesPath}\n`)

  // Limpiar directorio temporal
  if (existsSync(tempDir)) {
    const { rmSync } = await import('fs')
    rmSync(tempDir, { recursive: true, force: true })
  }

  console.log('✅ Proceso completado!')
  console.log('\n💡 Ahora ejecuta: npm run seed')
}

downloadAndUploadImages().catch(console.error)
