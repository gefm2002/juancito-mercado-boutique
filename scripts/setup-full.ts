import * as dotenv from 'dotenv'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN!
const SUPABASE_ORG_SLUG = process.env.SUPABASE_ORG_SLUG!
const PROJECT_NAME = 'juancito-mercado-boutique'

async function setupFull() {
  console.log('🚀 Setup completo automatizado\n')

  // 1. GitHub
  console.log('📦 Paso 1: Configurando GitHub...')
  try {
    execSync('git status', { stdio: 'ignore' })
    console.log('✅ Git ya inicializado\n')
  } catch {
    execSync('git init', { stdio: 'inherit' })
    console.log('✅ Git inicializado\n')
  }

  // 2. Supabase
  console.log('📦 Paso 2: Configurando Supabase...')
  execSync('npx tsx scripts/setup-supabase.ts', { stdio: 'inherit' })

  // 3. Storage
  console.log('\n📦 Paso 3: Creando bucket de Storage...')
  execSync('npx tsx scripts/create-storage-bucket.ts', { stdio: 'inherit' })

  // 4. Aplicar políticas RLS de Storage
  console.log('\n📦 Paso 4: Aplicando políticas RLS...')
  const storageSQL = readFileSync('supabase/migrations/002_storage.sql', 'utf-8')
  // Intentar aplicar automáticamente
  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
    
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: storageSQL })
      }
    )
    
    if (response.ok) {
      console.log('✅ Políticas RLS aplicadas\n')
    } else {
      console.log('⚠️  Aplica políticas manualmente desde SQL Editor\n')
    }
  } catch (error) {
    console.log('⚠️  Aplica políticas manualmente desde SQL Editor\n')
  }

  // 5. Imágenes y Seed
  console.log('📦 Paso 5: Descargando imágenes y ejecutando seed...')
  execSync('npm run seed:full', { stdio: 'inherit' })

  // 6. Verificación
  console.log('\n📦 Paso 6: Verificando...')
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const tables = ['juancito_categories', 'juancito_products', 'juancito_orders']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: OK`)
    }
  }

  console.log('\n✅ Setup completo!')
  console.log('\n💡 Próximos pasos:')
  console.log('   npm run dev')
  console.log('   Login admin: admin@juancito.com / admin123')
}

setupFull().catch(console.error)
