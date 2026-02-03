import * as dotenv from 'dotenv'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const SUPABASE_ACCESS_TOKEN = 'sbp_5413937740855e338b963b11a2fc451575e09fb3'
const SUPABASE_ORG_SLUG = 'gopntmzxqonsqbsykbup'
const SUPABASE_PROJECT_NAME = 'juancito-mercado-boutique'
const SUPABASE_REGION = 'us-east-1'

async function setupSupabase() {
  console.log('🚀 Configurando Supabase...\n')

  // 1. Obtener organización
  console.log('📋 Obteniendo organización...')
  const orgRes = await fetch('https://api.supabase.com/v1/organizations', {
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!orgRes.ok) {
    throw new Error(`Error al obtener organizaciones: ${await orgRes.text()}`)
  }

  const orgs = await orgRes.json()
  const org = orgs.find((o: any) => o.slug === SUPABASE_ORG_SLUG || o.id === SUPABASE_ORG_SLUG)
  
  if (!org) {
    throw new Error(`Organización ${SUPABASE_ORG_SLUG} no encontrada`)
  }

  console.log(`✅ Organización encontrada: ${org.name} (${org.id})\n`)

  // 2. Listar proyectos existentes
  console.log('📦 Buscando proyectos existentes...')
  const projectsRes = await fetch(
    `https://api.supabase.com/v1/projects?organization_id=${org.id}`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!projectsRes.ok) {
    throw new Error(`Error al obtener proyectos: ${await projectsRes.text()}`)
  }

  const projects = await projectsRes.json()
  let project = projects.find((p: any) => p.name === SUPABASE_PROJECT_NAME)

  // 3. Crear proyecto si no existe
  if (!project) {
    console.log(`📦 Creando proyecto: ${SUPABASE_PROJECT_NAME}...`)
    
    const dbPassword = process.env.SUPABASE_DB_PASSWORD || generatePassword()
    
    const createRes = await fetch('https://api.supabase.com/v1/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: SUPABASE_PROJECT_NAME,
        organization_id: org.id,
        region: SUPABASE_REGION,
        db_pass: dbPassword,
        plan: 'free',
        kps_enabled: false,
      }),
    })

    if (!createRes.ok) {
      const error = await createRes.text()
      throw new Error(`Error al crear proyecto: ${error}`)
    }

    project = await createRes.json()
    console.log(`✅ Proyecto creado: ${project.id}`)
    console.log(`⏳ Esperando activación (esto puede tomar unos minutos)...`)
    
    // Esperar a que el proyecto esté listo
    await waitForProject(project.id)
    console.log(`✅ Proyecto activo!\n`)
  } else {
    console.log(`✅ Proyecto existente encontrado: ${project.name} (${project.id})\n`)
  }

  // 4. Obtener credenciales del proyecto
  console.log('🔑 Obteniendo credenciales...')
  
  // Esperar un poco más para asegurar que las keys estén disponibles
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const keysRes = await fetch(
    `https://api.supabase.com/v1/projects/${project.id}/api-keys`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!keysRes.ok) {
    const error = await keysRes.text()
    throw new Error(`Error al obtener API keys: ${error}`)
  }

  const keys = await keysRes.json()
  const anonKey = keys.find((k: any) => k.name === 'anon' || k.tags?.includes('anon'))?.api_key
  const serviceKey = keys.find((k: any) => k.name === 'service_role' || k.tags?.includes('service_role'))?.api_key

  if (!anonKey || !serviceKey) {
    console.log('⚠️  Keys no disponibles aún. Esperando...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    const keysRes2 = await fetch(
      `https://api.supabase.com/v1/projects/${project.id}/api-keys`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const keys2 = await keysRes2.json()
    const anonKey2 = keys2.find((k: any) => k.name === 'anon' || k.tags?.includes('anon'))?.api_key
    const serviceKey2 = keys2.find((k: any) => k.name === 'service_role' || k.tags?.includes('service_role'))?.api_key
    
    if (!anonKey2 || !serviceKey2) {
      throw new Error('No se pudieron obtener las API keys. Intenta más tarde o configúralas manualmente.')
    }
    
    updateEnvFile(project, anonKey2, serviceKey2)
  } else {
    updateEnvFile(project, anonKey, serviceKey)
  }
}

function updateEnvFile(project: any, anonKey: string, serviceKey: string) {
  const supabaseUrl = `https://${project.ref}.supabase.co`
  
  console.log('📝 Actualizando .env.local...')
  const envPath = join(process.cwd(), '.env.local')
  
  let envContent = ''
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8')
  } else {
    // Crear desde .env.example si existe
    const examplePath = join(process.cwd(), '.env.example')
    if (existsSync(examplePath)) {
      envContent = readFileSync(examplePath, 'utf-8')
    }
  }

  // Actualizar o agregar valores
  const updates: Record<string, string> = {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_ACCESS_TOKEN: SUPABASE_ACCESS_TOKEN,
    SUPABASE_ORG_SLUG: SUPABASE_ORG_SLUG,
    SUPABASE_PROJECT_NAME: SUPABASE_PROJECT_NAME,
    SUPABASE_REGION: SUPABASE_REGION,
  }

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`)
    } else {
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n'
      }
      envContent += `${key}=${value}\n`
    }
  }

  writeFileSync(envPath, envContent)
  console.log('✅ .env.local actualizado\n')

  console.log('✅ Configuración de Supabase completada!')
  console.log(`\n📊 Proyecto: ${project.name}`)
  console.log(`🔗 URL: ${supabaseUrl}`)
  console.log(`\n💡 Próximos pasos:`)
  console.log(`   1. Aplicar migrations: ejecutar el SQL en supabase/migrations/001_init.sql desde el SQL Editor`)
  console.log(`   2. Ejecutar seed: npm run seed`)
  console.log(`   3. Crear admin: npm run create-admin`)
}

function generatePassword(): string {
  const length = 20
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

async function waitForProject(projectId: string, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        },
      }
    )
    
    if (res.ok) {
      const project = await res.json()
      if (project.status === 'ACTIVE_HEALTHY' || project.status === 'ACTIVE_UNHEALTHY') {
        return true
      }
      process.stdout.write(`\r⏳ Esperando... (${i + 1}/${maxAttempts})`)
    }
    
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  
  throw new Error('El proyecto no se activó a tiempo')
}

setupSupabase().catch(console.error)
