import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createTables() {
  console.log('📦 Creando tablas directamente en PostgreSQL...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env.local')
  }

  // Extraer connection string de Supabase
  // Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
  
  // Necesitamos la password de la DB - está en .env.local como SUPABASE_DB_PASSWORD
  // O podemos obtenerla de la API
  const dbPassword = process.env.SUPABASE_DB_PASSWORD
  
  if (!dbPassword) {
    console.log('⚠️  SUPABASE_DB_PASSWORD no está en .env.local')
    console.log('📝 Obteniendo password desde la API...\n')
    
    // Intentar obtener la password desde la API de Management
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}`,
        {
          headers: {
            'Authorization': `Bearer sbp_5413937740855e338b963b11a2fc451575e09fb3`,
          },
        }
      )
      
      if (response.ok) {
        const project = await response.json()
        // La password no está en la respuesta por seguridad
        console.log('❌ No se puede obtener la password desde la API (por seguridad)')
        console.log('📝 Necesitas la password de la base de datos para continuar\n')
        console.log('💡 Opciones:')
        console.log('   1. Ve a Supabase Dashboard > Settings > Database')
        console.log('   2. Copia la connection string o resetea la password')
        console.log('   3. Agrega SUPABASE_DB_PASSWORD a .env.local')
        console.log('   4. O ejecuta el SQL manualmente desde el SQL Editor\n')
        return
      }
    } catch (error) {
      console.log('❌ Error obteniendo información del proyecto')
    }
    
    console.log('📝 Por favor, ejecuta el SQL manualmente:')
    console.log('   1. Ve a: https://supabase.com/dashboard/project/' + projectRef)
    console.log('   2. SQL Editor > New Query')
    console.log('   3. Copia el contenido de: supabase/migrations/001_init.sql')
    console.log('   4. Ejecuta (Cmd/Ctrl + Enter)\n')
    return
  }

  // Construir connection string
  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
  
  console.log('🔌 Conectando a PostgreSQL...\n')

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('✅ Conectado a PostgreSQL\n')

    // Leer el archivo de migration
    const migrationPath = join(process.cwd(), 'supabase/migrations/001_init.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📝 Ejecutando migrations...\n')

    // Ejecutar el SQL completo
    await client.query(migrationSQL)

    console.log('✅ Migrations aplicadas correctamente!\n')

    // Verificar tablas
    console.log('🔍 Verificando tablas...\n')
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'juancito_%'
      ORDER BY table_name;
    `)

    const tables = result.rows.map(row => row.table_name)
    const expectedTables = [
      'juancito_categories',
      'juancito_products',
      'juancito_orders',
      'juancito_admins',
      'juancito_promos',
      'juancito_site_config'
    ]

    for (const table of expectedTables) {
      if (tables.includes(table)) {
        console.log(`  ✅ ${table}`)
      } else {
        console.log(`  ❌ ${table} (no encontrada)`)
      }
    }

    if (tables.length === expectedTables.length) {
      console.log('\n✅ Todas las tablas fueron creadas correctamente!')
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 La password es incorrecta o no está configurada.')
      console.log('   Ejecuta el SQL manualmente desde el SQL Editor.\n')
    }
  } finally {
    await client.end()
  }
}

// Intentar importar pg, si no está disponible, mostrar instrucciones
try {
  createTables().catch(console.error)
} catch (error) {
  console.log('⚠️  El paquete "pg" no está instalado.')
  console.log('📦 Instalando...\n')
  
  // No podemos instalar en runtime, mejor mostrar instrucciones
  console.log('💡 Para ejecutar este script:')
  console.log('   npm install pg @types/pg')
  console.log('   npm run create-tables\n')
  console.log('📝 O ejecuta el SQL manualmente:')
  console.log('   1. Ve a: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota')
  console.log('   2. SQL Editor > New Query')
  console.log('   3. Copia: supabase/migrations/001_init.sql')
  console.log('   4. Ejecuta\n')
}
