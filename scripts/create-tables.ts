import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createTables() {
  console.log('📦 Creando tablas en Supabase...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env.local')
  }

  // Leer el archivo de migration completo
  const migrationPath = join(process.cwd(), 'supabase/migrations/001_init.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log('📝 Ejecutando SQL completo...\n')

  // Usar la API REST de Supabase para ejecutar el SQL
  // Necesitamos usar el endpoint correcto
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
  
  try {
    // Intentar ejecutar usando la API de Management de Supabase
    // Pero primero necesitamos crear una función helper
    console.log('🔧 Creando función helper para ejecutar SQL...')
    
    const createHelperSQL = `
      CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        EXECUTE sql_text;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
      END;
      $$;
    `

    // Ejecutar la función helper primero
    await executeSQL(createHelperSQL, supabaseUrl, supabaseServiceKey)
    
    console.log('✅ Función helper creada\n')
    
    // Ahora ejecutar el SQL completo dividido en bloques lógicos
    console.log('📊 Ejecutando migrations...\n')
    
    // Dividir el SQL en bloques más grandes y manejables
    const blocks = splitSQLIntoBlocks(migrationSQL)
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      const preview = block.substring(0, 80).replace(/\n/g, ' ')
      
      console.log(`[${i + 1}/${blocks.length}] Ejecutando bloque...`)
      console.log(`   ${preview}...`)
      
      try {
        await executeSQL(block, supabaseUrl, supabaseServiceKey)
        console.log(`   ✅ Completado\n`)
      } catch (error: any) {
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate')) {
          console.log(`   ℹ️  Ya existe (ok)\n`)
        } else {
          console.log(`   ⚠️  Error: ${error.message}\n`)
        }
      }
    }
    
    console.log('✅ Migrations completadas!\n')
    
    // Verificar tablas
    console.log('🔍 Verificando tablas...\n')
    await verifyTables(supabaseUrl, supabaseServiceKey)
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.log('\n💡 Ejecutando método alternativo...\n')
    
    // Método alternativo: ejecutar SQL directamente usando fetch
    await executeSQLDirect(migrationSQL, supabaseUrl, supabaseServiceKey)
  }
}

function splitSQLIntoBlocks(sql: string): string[] {
  const blocks: string[] = []
  let currentBlock = ''
  
  // Dividir por statements principales
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
  
  for (const statement of statements) {
    if (statement.startsWith('--')) continue
    
    // Agrupar statements relacionados
    if (statement.includes('CREATE TABLE') || 
        statement.includes('CREATE SEQUENCE') ||
        statement.includes('CREATE INDEX') ||
        statement.includes('ALTER TABLE') ||
        statement.includes('CREATE POLICY') ||
        statement.includes('CREATE FUNCTION') ||
        statement.includes('CREATE TRIGGER')) {
      
      if (currentBlock) {
        blocks.push(currentBlock + ';')
        currentBlock = ''
      }
      blocks.push(statement + ';')
    } else {
      currentBlock += statement + ';'
    }
  }
  
  if (currentBlock) {
    blocks.push(currentBlock)
  }
  
  return blocks
}

async function executeSQL(sql: string, url: string, serviceKey: string) {
  // Usar la API REST de Supabase
  // El endpoint correcto para ejecutar SQL es a través de una función RPC
  // Pero primero necesitamos que exista la función
  
  // Intentar ejecutar directamente usando el endpoint de query
  const response = await fetch(`${url}/rest/v1/rpc/exec_ddl`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ sql_text: sql })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error ejecutando SQL: ${errorText}`)
  }
}

async function executeSQLDirect(sql: string, url: string, serviceKey: string) {
  // Método directo: usar el cliente de Supabase para ejecutar queries
  // Pero Supabase no permite DDL desde el cliente JS directamente
  
  // La única forma real es usar el SQL Editor o la API de Management
  console.log('⚠️  Supabase no permite ejecutar DDL directamente desde el cliente.')
  console.log('📝 Por favor, ejecuta el SQL manualmente:\n')
  console.log('   1. Ve a: https://supabase.com/dashboard')
  console.log('   2. Selecciona tu proyecto')
  console.log('   3. Ve a SQL Editor')
  console.log('   4. Copia y pega el contenido de: supabase/migrations/001_init.sql')
  console.log('   5. Ejecuta el query\n')
  
  // Alternativa: usar psql si está disponible
  console.log('💡 O usa Supabase CLI:')
  console.log('   npm install -g supabase')
  console.log('   supabase login')
  console.log('   supabase link --project-ref oseeysmiwfdhpizzeota')
  console.log('   supabase db push\n')
}

async function verifyTables(url: string, serviceKey: string) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(url, serviceKey)
  
  const tables = [
    'juancito_categories',
    'juancito_products',
    'juancito_orders',
    'juancito_admins',
    'juancito_promos',
    'juancito_site_config'
  ]

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
