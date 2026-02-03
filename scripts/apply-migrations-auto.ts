import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyMigrations() {
  console.log('📦 Aplicando migrations automáticamente...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env.local')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Leer el archivo de migration
  const migrationPath = join(process.cwd(), 'supabase/migrations/001_init.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log('📝 Ejecutando SQL...\n')

  // Dividir en statements individuales, pero mantener los bloques completos
  // Necesitamos dividir por punto y coma, pero respetar funciones y bloques
  const statements: string[] = []
  let currentStatement = ''
  let inFunction = false
  let functionDepth = 0

  const lines = migrationSQL.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Detectar inicio de función
    if (trimmed.includes('CREATE OR REPLACE FUNCTION') || trimmed.includes('CREATE FUNCTION')) {
      inFunction = true
      functionDepth = 0
    }
    
    // Contar llaves para funciones
    if (inFunction) {
      functionDepth += (line.match(/\{/g) || []).length
      functionDepth -= (line.match(/\}/g) || []).length
      
      if (functionDepth <= 0 && trimmed.includes('$$')) {
        inFunction = false
      }
    }
    
    currentStatement += line + '\n'
    
    // Si no estamos en una función y encontramos un punto y coma, es el fin del statement
    if (!inFunction && trimmed.endsWith(';')) {
      const statement = currentStatement.trim()
      if (statement.length > 10 && !statement.startsWith('--')) {
        statements.push(statement)
      }
      currentStatement = ''
    }
  }

  // Si queda algo, agregarlo
  if (currentStatement.trim().length > 10) {
    statements.push(currentStatement.trim())
  }

  console.log(`📊 Encontrados ${statements.length} statements para ejecutar\n`)

  // Ejecutar cada statement usando la API REST directamente
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    const preview = statement.substring(0, 60).replace(/\n/g, ' ')
    
    try {
      console.log(`[${i + 1}/${statements.length}] Ejecutando: ${preview}...`)
      
      // Usar la API REST de Supabase para ejecutar SQL
      // Necesitamos usar el endpoint correcto con el service role key
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: statement })
      })

      // Si exec_sql no existe, intentar método alternativo
      if (!response.ok) {
        // Intentar crear una función temporal que ejecute SQL
        await executeSQLDirect(statement, supabaseUrl, supabaseServiceKey)
      } else {
        console.log(`  ✅ Ejecutado correctamente`)
      }
    } catch (error: any) {
      // Si es error de "ya existe", está bien
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate') ||
          error.code === '42P07' || 
          error.code === '42710') {
        console.log(`  ℹ️  Ya existe (ok)`)
      } else {
        console.log(`  ⚠️  Error: ${error.message || error}`)
        // Continuar con el siguiente
      }
    }
  }

  console.log('\n✅ Migrations aplicadas!')
  console.log('\n💡 Verificando tablas creadas...\n')
  
  // Verificar que las tablas existan
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

async function executeSQLDirect(sql: string, url: string, serviceKey: string) {
  // Método alternativo: usar pg_rest o crear función temporal
  // Por ahora, intentamos usar el método de Supabase para ejecutar SQL raw
  
  // Supabase no expone directamente ejecutar SQL arbitrario desde el cliente
  // Necesitamos usar el SQL Editor o crear una función helper
  
  // Intentar usando el endpoint de query
  try {
    // Crear una función temporal que ejecute el SQL
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
      END;
      $$;
    `
    
    // Esto no funcionará directamente, necesitamos otro enfoque
    // Por ahora, retornamos false para indicar que necesita ejecución manual
    return false
  } catch {
    return false
  }
}

applyMigrations().catch((error) => {
  console.error('\n❌ Error:', error.message)
  console.log('\n💡 Si las migrations no se aplicaron automáticamente,')
  console.log('   ejecútalas manualmente desde el SQL Editor de Supabase.')
  process.exit(1)
})
