import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createStorageBucket() {
  console.log('📦 Creando bucket de Storage...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env.local')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }

    const bucketExists = buckets?.some(b => b.id === 'juancito_product_images')

    if (bucketExists) {
      console.log('✅ El bucket "juancito_product_images" ya existe\n')
      return
    }

    // Crear el bucket
    console.log('📝 Creando bucket "juancito_product_images"...')
    
    const { data, error } = await supabase.storage.createBucket('juancito_product_images', {
      public: true,
      fileSizeLimit: 1572864, // 1.5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    })

    if (error) {
      // Si el error es que ya existe, está bien
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('✅ El bucket ya existe\n')
        return
      }
      throw error
    }

    console.log('✅ Bucket creado correctamente!\n')
    console.log('📝 Aplicando políticas RLS...')
    
    // Las políticas RLS se aplican desde la migration SQL
    // Ejecutar la migration 002_storage.sql desde el SQL Editor
    
    console.log('\n💡 IMPORTANTE: Ejecuta la migration de storage:')
    console.log('   1. Ve a: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota/sql/new')
    console.log('   2. Copia el contenido de: supabase/migrations/002_storage.sql')
    console.log('   3. Ejecuta el query\n')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('permission denied') || error.message.includes('not found')) {
      console.log('\n💡 El bucket debe crearse desde el SQL Editor:')
      console.log('   1. Ve a: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota/sql/new')
      console.log('   2. Copia el contenido de: supabase/migrations/002_storage.sql')
      console.log('   3. Ejecuta el query\n')
    }
  }
}

createStorageBucket().catch(console.error)
