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
  let migrationSQL = readFileSync(migrationPath, 'utf-8')

  // Limpiar comentarios y dividir en statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      const trimmed = s.trim()
      return trimmed.length > 10 && 
             !trimmed.startsWith('--') && 
             !trimmed.toLowerCase().startsWith('comment')
    })

  console.log(`📝 Ejecutando ${statements.length} statements...\n`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (!statement) continue

    try {
      // Para CREATE TABLE y otros DDL, necesitamos usar el método correcto
      // Supabase no permite ejecutar DDL directamente desde el cliente JS
      // Necesitamos usar el SQL Editor o la API de Management
      
      // Por ahora, solo verificamos que las tablas existan
      const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)
      if (tableMatch) {
        const tableName = tableMatch[1]
        console.log(`✓ Verificando tabla: ${tableName}`)
        
        // Verificar si la tabla existe
        const { error } = await supabase.from(tableName).select('*').limit(0)
        if (error && error.code === '42P01') {
          console.log(`  ⚠️  Tabla ${tableName} no existe - debe ejecutarse manualmente`)
        } else {
          console.log(`  ✅ Tabla ${tableName} existe`)
        }
      }
    } catch (err) {
      // Continuar con el siguiente
    }
  }

  console.log('\n⚠️  IMPORTANTE: Las migrations DDL deben ejecutarse manualmente.')
  console.log('📝 Pasos:')
  console.log('   1. Ve a https://supabase.com/dashboard')
  console.log('   2. Selecciona tu proyecto: juancito-mercado-boutique')
  console.log('   3. Ve a SQL Editor (menú lateral)')
  console.log('   4. Copia y pega el contenido de: supabase/migrations/001_init.sql')
  console.log('   5. Haz clic en "Run" o presiona Cmd/Ctrl + Enter')
  console.log('   6. Verifica que no haya errores\n')
  
  console.log('💡 Alternativa: Instala Supabase CLI y ejecuta:')
  console.log('   npm install -g supabase')
  console.log('   supabase login')
  console.log('   supabase link --project-ref oseeysmiwfdhpizzeota')
  console.log('   supabase db push\n')
}

applyMigrations().catch(console.error)
