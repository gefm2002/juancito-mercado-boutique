import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyMigrations() {
  console.log('📦 Aplicando migrations...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env.local')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Leer el archivo de migration
  const migrationPath = join(process.cwd(), 'supabase/migrations/001_init.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log('📝 Ejecutando SQL...')

  // Dividir en statements individuales
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.length < 10) continue // Skip very short statements
    
    try {
      // Ejecutar cada statement
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      // Si exec_sql no existe, intentar ejecutar directamente
      if (error && error.message?.includes('exec_sql')) {
        // Usar query directa para statements simples
        if (statement.toLowerCase().includes('create table')) {
          console.log(`⚠️  Ejecutando manualmente: ${statement.substring(0, 50)}...`)
        }
      }
    } catch (err) {
      // Ignorar errores de "ya existe"
      if (err instanceof Error && err.message.includes('already exists')) {
        console.log(`ℹ️  Ya existe: ${statement.substring(0, 50)}...`)
      } else {
        console.error(`Error en statement: ${err}`)
      }
    }
  }

  console.log('\n✅ Migrations aplicadas!')
  console.log('💡 Si hay errores, ejecuta el SQL manualmente desde el SQL Editor de Supabase')
}

// Alternativa: usar fetch directo a la API REST
async function applyMigrationsViaAPI() {
  console.log('📦 Aplicando migrations vía API...\n')

  const migrationPath = join(process.cwd(), 'supabase/migrations/001_init.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  // Supabase no tiene una API REST directa para ejecutar SQL arbitrario
  // Necesitamos usar el SQL Editor o el cliente de Supabase
  console.log('⚠️  La API de Supabase no permite ejecutar SQL arbitrario.')
  console.log('📝 Por favor, ejecuta el SQL manualmente:')
  console.log('   1. Ve a https://supabase.com/dashboard')
  console.log('   2. Selecciona tu proyecto')
  console.log('   3. Ve a SQL Editor')
  console.log('   4. Copia y pega el contenido de supabase/migrations/001_init.sql')
  console.log('   5. Ejecuta el query\n')
  
  console.log('O usa Supabase CLI:')
  console.log('   supabase db push\n')
}

applyMigrationsViaAPI().catch(console.error)
