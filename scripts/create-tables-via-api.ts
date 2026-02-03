import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const SUPABASE_ACCESS_TOKEN = 'sbp_5413937740855e338b963b11a2fc451575e09fb3'
const SUPABASE_PROJECT_REF = 'oseeysmiwfdhpizzeota'

async function createTables() {
  console.log('📦 Creando tablas usando Management API...\n')

  // Leer el archivo de migration completo
  const migrationPath = join(process.cwd(), 'supabase/migrations/001_init.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log('📝 Ejecutando SQL completo...\n')

  try {
    // Usar la API de Management de Supabase para ejecutar SQL
    // Endpoint: POST /v1/projects/{ref}/database/query
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: migrationSQL
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error:', errorText)
      
      // Si el endpoint no existe, intentar otro método
      console.log('\n💡 Intentando método alternativo...\n')
      await tryAlternativeMethod(migrationSQL)
      return
    }

    const result = await response.json()
    console.log('✅ SQL ejecutado correctamente!')
    console.log('Resultado:', result)
    
    // Verificar tablas
    console.log('\n🔍 Verificando tablas creadas...\n')
    await verifyTables()
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Usando método alternativo...\n')
    await tryAlternativeMethod(migrationSQL)
  }
}

async function tryAlternativeMethod(sql: string) {
  // Método alternativo: usar el endpoint de SQL Editor
  // O crear las tablas una por una usando la API REST
  
  console.log('📝 Creando tablas individualmente...\n')
  
  // Extraer solo los CREATE TABLE statements
  const createTableRegex = /CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\);/g
  let match
  const tables: Array<{ name: string; sql: string }> = []
  
  while ((match = createTableRegex.exec(sql)) !== null) {
    const tableName = match[1]
    const tableDef = match[2]
    const fullSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${tableDef});`
    tables.push({ name: tableName, sql: fullSQL })
  }
  
  // También obtener CREATE SEQUENCE
  const createSequenceRegex = /CREATE SEQUENCE IF NOT EXISTS (\w+)[\s\S]*?;/g
  while ((match = createSequenceRegex.exec(sql)) !== null) {
    const seqSQL = match[0]
    tables.push({ name: 'sequence', sql: seqSQL })
  }
  
  console.log(`📊 Encontradas ${tables.length} tablas/sequences para crear\n`)
  
  // Intentar ejecutar cada una usando la API de Management
  for (const table of tables) {
    try {
      console.log(`📝 Creando: ${table.name}...`)
      
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: table.sql
          })
        }
      )
      
      if (response.ok) {
        console.log(`  ✅ ${table.name} creada\n`)
      } else {
        const error = await response.text()
        if (error.includes('already exists')) {
          console.log(`  ℹ️  ${table.name} ya existe\n`)
        } else {
          console.log(`  ⚠️  Error: ${error.substring(0, 100)}\n`)
        }
      }
    } catch (error: any) {
      console.log(`  ⚠️  Error: ${error.message}\n`)
    }
  }
  
  // Si esto tampoco funciona, mostrar instrucciones
  console.log('\n⚠️  La API de Management no permite ejecutar DDL directamente.')
  console.log('📝 Por favor, ejecuta el SQL manualmente:\n')
  console.log('   1. Ve a: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota')
  console.log('   2. Ve a SQL Editor (menú lateral)')
  console.log('   3. Copia TODO el contenido de: supabase/migrations/001_init.sql')
  console.log('   4. Pega en el editor')
  console.log('   5. Haz clic en "Run" o presiona Cmd/Ctrl + Enter\n')
}

async function verifyTables() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️  No se pueden verificar tablas sin credenciales')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const tables = [
    'juancito_categories',
    'juancito_products',
    'juancito_orders',
    'juancito_admins',
    'juancito_promos',
    'juancito_site_config'
  ]

  console.log('Verificando tablas...\n')
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`)
      } else {
        console.log(`  ✅ ${table}: OK`)
      }
    } catch (err: any) {
      console.log(`  ⚠️  ${table}: ${err.message}`)
    }
  }
}

createTables().catch(console.error)
