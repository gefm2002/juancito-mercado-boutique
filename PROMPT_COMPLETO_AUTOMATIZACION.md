# 🚀 PROMPT COMPLETO: Automatización Full-Stack con GitHub, Supabase y Netlify

## 📋 CONTEXTO

Este prompt documenta el proceso completo de automatización para crear una aplicación web full-stack desde cero, incluyendo:
- Creación automática de repositorio en GitHub
- Creación automática de proyecto en Supabase
- Configuración de base de datos, buckets y políticas
- Deploy en Netlify con Functions
- Solución de problemas comunes

## 🎯 OBJETIVO

Automatizar la creación completa de un proyecto web con:
- Frontend: Vite + React + TypeScript + TailwindCSS
- Backend: Netlify Functions (serverless)
- Base de datos: Supabase (PostgreSQL)
- Storage: Supabase Storage
- Deploy: Netlify

## 🔑 CREDENCIALES REQUERIDAS

El usuario debe proporcionar al inicio:

```bash
# GitHub
GITHUB_TOKEN=ghp_...

# Supabase
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_ORG_SLUG=...
```

## 📦 PASO 1: CREACIÓN DE REPOSITORIO EN GITHUB

### Script de Automatización

```typescript
// scripts/create-github-repo.ts
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const REPO_NAME = process.env.REPO_NAME || 'inferir-del-nombre-del-proyecto'

async function createGitHubRepo() {
  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: REPO_NAME,
      description: 'Auto-generated project',
      private: false,
      auto_init: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error creando repo: ${error}`)
  }

  const repo = await response.json()
  console.log(`✅ Repo creado: ${repo.html_url}`)
  return repo
}
```

### Comandos Git

```bash
# Inicializar repo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

## 🗄️ PASO 2: CREACIÓN DE PROYECTO EN SUPABASE

### Script de Automatización

```typescript
// scripts/setup-supabase.ts
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN!
const SUPABASE_ORG_SLUG = process.env.SUPABASE_ORG_SLUG!
const PROJECT_NAME = process.env.SUPABASE_PROJECT_NAME || 'inferir-del-repo'
const REGION = process.env.SUPABASE_REGION || 'us-east-1'
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || generateSecurePassword()

async function createSupabaseProject() {
  // 1. Crear proyecto
  const createResponse = await fetch(
    `https://api.supabase.com/v1/projects`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: PROJECT_NAME,
        organization_id: SUPABASE_ORG_SLUG,
        region: REGION,
        db_password: DB_PASSWORD,
        kps_enabled: false,
      }),
    }
  )

  if (!createResponse.ok) {
    const error = await createResponse.text()
    throw new Error(`Error creando proyecto: ${error}`)
  }

  const project = await createResponse.json()
  console.log(`✅ Proyecto creado: ${project.id}`)

  // 2. Esperar activación (polling)
  let isReady = false
  let attempts = 0
  while (!isReady && attempts < 30) {
    await sleep(5000)
    const statusResponse = await fetch(
      `https://api.supabase.com/v1/projects/${project.id}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        },
      }
    )
    const status = await statusResponse.json()
    if (status.status === 'ACTIVE_HEALTHY') {
      isReady = true
    }
    attempts++
  }

  // 3. Obtener credenciales
  const keysResponse = await fetch(
    `https://api.supabase.com/v1/projects/${project.id}/api-keys`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      },
    }
  )
  const keys = await keysResponse.json()

  const anonKey = keys.find((k: any) => k.name === 'anon')?.api_key
  const serviceKey = keys.find((k: any) => k.name === 'service_role')?.api_key

  // 4. Obtener URL
  const projectResponse = await fetch(
    `https://api.supabase.com/v1/projects/${project.id}`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      },
    }
  )
  const projectData = await projectResponse.json()
  const supabaseUrl = `https://${projectData.ref}.supabase.co`

  // 5. Actualizar .env.local
  const envContent = `
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}
SUPABASE_DB_PASSWORD=${DB_PASSWORD}
`.trim()

  fs.appendFileSync('.env.local', envContent)
  console.log('✅ Credenciales guardadas en .env.local')

  return { supabaseUrl, anonKey, serviceKey, dbPassword: DB_PASSWORD }
}
```

## 🗃️ PASO 3: MIGRACIONES Y BASE DE DATOS

### ⚠️ IMPORTANTE: Esperar Activación Completa

**El proyecto de Supabase debe estar completamente activo antes de aplicar migraciones.**

### Script de Automatización

```typescript
// scripts/apply-migrations-auto.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyMigrations() {
  console.log('📦 Aplicando migrations automáticamente...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env.local')
  }

  // ⚠️ IMPORTANTE: Esperar a que el proyecto esté completamente activo
  // Esto puede tomar varios minutos después de la creación
  console.log('⏳ Verificando que el proyecto esté activo...')
  await waitForProjectReady(supabaseUrl, supabaseServiceKey)

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

  // Dividir en statements individuales respetando funciones y bloques
  const statements = parseSQLStatements(migrationSQL)

  console.log(`📊 Encontrados ${statements.length} statements para ejecutar\n`)

  // Ejecutar cada statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    const preview = statement.substring(0, 60).replace(/\n/g, ' ')
    
    try {
      console.log(`[${i + 1}/${statements.length}] Ejecutando: ${preview}...`)
      
      // Intentar ejecutar usando diferentes métodos
      await executeSQLStatement(statement, supabaseUrl, supabaseServiceKey)
      console.log(`  ✅ Ejecutado correctamente`)
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
  const prefix = inferPrefixFromProject()
  const tables = [
    `${prefix}_categories`,
    `${prefix}_products`,
    `${prefix}_orders`,
    `${prefix}_admins`,
    `${prefix}_promos`,
    `${prefix}_site_config`
  ]

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0)
    if (error) {
      console.log(`  ⚠️  Tabla ${table} no encontrada`)
    } else {
      console.log(`  ✅ Tabla ${table} existe`)
    }
  }
}

async function waitForProjectReady(url: string, serviceKey: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Intentar una query simple para verificar que el proyecto está listo
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      })
      
      if (response.ok) {
        console.log('✅ Proyecto activo y listo\n')
        return
      }
    } catch (error) {
      // Continuar esperando
    }
    
    process.stdout.write(`\r⏳ Esperando activación... (${i + 1}/${maxAttempts})`)
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  
  console.log('\n⚠️  El proyecto puede no estar completamente activo, pero continuando...\n')
}

async function executeSQLStatement(statement: string, url: string, serviceKey: string) {
  // Método 1: Intentar usar RPC exec_sql si existe
  try {
    const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: statement })
    })

    if (response.ok) {
      return
    }
  } catch (error) {
    // Continuar con método alternativo
  }

  // Método 2: Usar Management API para ejecutar SQL
  const projectRef = url.replace('https://', '').replace('.supabase.co', '')
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: statement })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error ejecutando SQL: ${errorText}`)
  }
}

function parseSQLStatements(sql: string): string[] {
  // Dividir en statements respetando funciones y bloques
  const statements: string[] = []
  let currentStatement = ''
  let inFunction = false
  let functionDepth = 0

  const lines = sql.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.includes('CREATE OR REPLACE FUNCTION') || trimmed.includes('CREATE FUNCTION')) {
      inFunction = true
      functionDepth = 0
    }
    
    if (inFunction) {
      functionDepth += (line.match(/\{/g) || []).length
      functionDepth -= (line.match(/\}/g) || []).length
      
      if (functionDepth <= 0 && trimmed.includes('$$')) {
        inFunction = false
      }
    }
    
    currentStatement += line + '\n'
    
    if (!inFunction && trimmed.endsWith(';')) {
      const statement = currentStatement.trim()
      if (statement.length > 10 && !statement.startsWith('--')) {
        statements.push(statement)
      }
      currentStatement = ''
    }
  }

  if (currentStatement.trim().length > 10) {
    statements.push(currentStatement.trim())
  }

  return statements
}

function inferPrefixFromProject(): string {
  const projectName = process.env.SUPABASE_PROJECT_NAME || 'project'
  return projectName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '_'
}

applyMigrations().catch(console.error)
```

### ⚠️ Nota Importante

**El script debe esperar lo suficiente** para que el proyecto esté completamente activo. Esto puede tomar 2-5 minutos después de la creación. El script incluye polling para verificar que el proyecto esté listo antes de ejecutar las migraciones.

### Estructura de Migraciones

```
supabase/migrations/
  ├── 001_init.sql          # Tablas, sequences, RLS policies
  └── 002_storage.sql      # Bucket y políticas de storage
```

### Convenciones de Naming

- **Prefix para todo**: Inferir del nombre del proyecto
  - Proyecto: `{project-name}` → Prefix: `{project_prefix}_`
  - Tablas: `{prefix}_products`, `{prefix}_orders`, etc.
  - Sequences: `{prefix}_order_number_seq`
  - Buckets: `{prefix}_product_images`
  
**Ejemplo:**
- Proyecto: `mi-tienda-online` → Prefix: `mi_tienda_`
- Tablas: `mi_tienda_products`, `mi_tienda_orders`

## 🪣 PASO 4: STORAGE BUCKETS

### Script de Automatización

```typescript
// scripts/create-storage-bucket.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function inferPrefixFromProject(): string {
  const projectName = process.env.SUPABASE_PROJECT_NAME || 'project'
  return projectName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '_'
}

async function createStorageBucket() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const prefix = inferPrefixFromProject()
  const bucketName = `${prefix}product_images`

  // Crear bucket
  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: 1572864, // 1.5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })

  if (error) {
    console.error('Error creando bucket:', error)
    return
  }

  console.log(`✅ Bucket creado: ${bucketName}`)

  // Aplicar políticas RLS automáticamente
  const storageSQL = readFileSync('supabase/migrations/002_storage.sql', 'utf-8')
  await applyStoragePolicies(storageSQL, supabaseUrl, supabaseServiceKey)
}

async function applyStoragePolicies(sql: string, url: string, serviceKey: string) {
  console.log('📝 Aplicando políticas RLS de storage...\n')
  
  // Reemplazar el prefix en el SQL si es necesario
  const prefix = inferPrefixFromProject()
  const sqlWithPrefix = sql.replace(/{PREFIX}/g, prefix)
  
  const statements = parseSQLStatements(sqlWithPrefix)
  
  for (const statement of statements) {
    try {
      await executeSQLStatement(statement, url, serviceKey)
      console.log('  ✅ Política aplicada')
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('  ℹ️  Política ya existe (ok)')
      } else {
        console.log(`  ⚠️  Error: ${error.message}`)
      }
    }
  }
  
  console.log('\n✅ Políticas RLS de storage aplicadas!')
}

function inferPrefixFromProject(): string {
  const projectName = process.env.SUPABASE_PROJECT_NAME || 'project'
  return projectName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '_'
}
```

## 👤 PASO 5: CREAR USUARIO ADMIN INICIAL

### Script de Automatización

```typescript
// scripts/create-admin.ts
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@proyecto.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

function inferPrefixFromProject(): string {
  const projectName = process.env.SUPABASE_PROJECT_NAME || 'project'
  return projectName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '_'
}

async function createAdmin() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const prefix = inferPrefixFromProject()

  const { data, error } = await supabase
    .from(`${prefix}admins`)
    .insert({
      email: ADMIN_EMAIL,
      password_hash: passwordHash,
      role: 'admin',
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  console.log(`✅ Admin creado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}
```

## 🖼️ PASO 6: SEED DE IMÁGENES

### Script de Automatización

```typescript
// scripts/seed-images.ts
import fetch from 'node-fetch'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

function inferPrefixFromProject(): string {
  const projectName = process.env.SUPABASE_PROJECT_NAME || 'project'
  return projectName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '_'
}

async function downloadAndUploadImages() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const images = [
    { url: 'https://...', productId: '...' },
    // ...
  ]

  for (const img of images) {
    // 1. Descargar
    const response = await fetch(img.url)
    const buffer = await response.buffer()

    // 2. Optimizar (webp, 1600px max, calidad 0.8)
    const optimized = await sharp(buffer)
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    // 3. Subir a Supabase Storage
    const timestamp = Date.now()
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.webp`
    const path = `${img.productId}/${filename}`

    const prefix = inferPrefixFromProject()
    const bucketName = `${prefix}product_images`
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, optimized, {
        contentType: 'image/webp',
        upsert: false,
      })

    if (error) {
      console.error(`Error subiendo ${img.url}:`, error)
      continue
    }

    // 4. Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path)

    // 5. Actualizar producto con URL
    await supabase
      .from(`${prefix}products`)
      .update({
        images: [publicUrl.publicUrl],
      })
      .eq('id', img.productId)

    console.log(`✅ Imagen subida: ${publicUrl.publicUrl}`)
  }
}
```

## 🚀 PASO 7: NETLIFY FUNCTIONS - ⚠️ PROBLEMA CRÍTICO

### ❌ ERROR COMÚN: Functions no detectadas

**Síntoma:**
```
No Functions were found in netlify/functions directory
```

**Causa:**
Netlify **NO detecta funciones TypeScript en subdirectorios**. Solo detecta funciones directamente en la raíz de `netlify/functions/`.

### ✅ SOLUCIÓN: Estructura de Funciones

**❌ ESTRUCTURA INCORRECTA:**
```
netlify/functions/
  ├── public/
  │   ├── config.ts
  │   └── catalog.ts
  ├── orders/
  │   └── create.ts
  └── admin/
      ├── login.ts
      └── ...
```

**✅ ESTRUCTURA CORRECTA:**
```
netlify/functions/
  ├── public-config.ts
  ├── public-catalog.ts
  ├── orders-create.ts
  ├── admin-login.ts
  ├── admin-me.ts
  ├── admin-products.ts
  ├── admin-categories.ts
  ├── admin-orders.ts
  ├── admin-promos.ts
  ├── admin-sucursales.ts
  ├── admin-content.ts
  ├── admin-images-sign-upload.ts
  └── admin-images-delete.ts
```

### Rutas Resultantes

Las funciones en la raíz se mapean así:
- `netlify/functions/public-config.ts` → `/.netlify/functions/public-config`
- `netlify/functions/orders-create.ts` → `/.netlify/functions/orders-create`
- `netlify/functions/admin-login.ts` → `/.netlify/functions/admin-login`

### Configuración de netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### Helper para Rutas API

```typescript
// src/lib/api-helper.ts
export function getApiBase(): string {
  return import.meta.env.DEV ? '/api' : '/.netlify/functions'
}

export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${getApiBase()}/${cleanEndpoint}`
}
```

### Actualizar Todas las Llamadas

**Antes:**
```typescript
fetch(apiUrl('public/config'))
fetch(apiUrl('orders/create'))
fetch(apiUrl('admin/login'))
```

**Después:**
```typescript
fetch(apiUrl('public-config'))
fetch(apiUrl('orders-create'))
fetch(apiUrl('admin-login'))
```

### Servidor de Desarrollo Local

El servidor local (`scripts/dev-server.ts`) también debe usar las nuevas rutas:

```typescript
app.get('/api/public-config', ...)
app.post('/api/orders-create', ...)
app.post('/api/admin-login', ...)
```

## 🗺️ PASO 8: GOOGLE MAPS EMBED

### ❌ INCORRECTO: Usar API Key

```typescript
// ❌ NO hacer esto
<iframe
  src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${address}`}
/>
```

### ✅ CORRECTO: Embed sin API Key

```typescript
// ✅ Usar embed directo con query params
const mapUrl = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(direccion)}`

<iframe
  src={mapUrl}
  width="100%"
  height="300"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

**O mejor aún, usar el formato más simple:**

```typescript
// Formato más simple y confiable
const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`

<iframe
  src={mapUrl}
  width="100%"
  height="300"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
/>
```

## 📝 CHECKLIST DE AUTOMATIZACIÓN

### Pre-requisitos
- [ ] `GITHUB_TOKEN` en `.env.local`
- [ ] `SUPABASE_ACCESS_TOKEN` en `.env.local`
- [ ] `SUPABASE_ORG_SLUG` en `.env.local`
- [ ] Node.js 20+ instalado

### Ejecución Automática

```bash
# 1. Crear repo GitHub
npm run create-github-repo

# 2. Setup Supabase (crear proyecto, obtener credenciales)
npm run setup-supabase

# 3. Aplicar migraciones (MANUAL - ver instrucciones)
# Ejecutar supabase/migrations/001_init.sql en SQL Editor

# 4. Crear bucket storage
npm run create-storage-bucket

# 5. Aplicar políticas storage (MANUAL)
# Ejecutar supabase/migrations/002_storage.sql en SQL Editor

# 6. Crear admin inicial
npm run create-admin

# 7. Seed de datos
npm run seed

# 8. Seed de imágenes
npm run seed:images

# 9. Push a GitHub
git add -A
git commit -m "Initial setup"
git push
```

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### 1. Netlify: "No Functions were found"

**Causa:** Funciones en subdirectorios

**Solución:** Mover todas las funciones a la raíz de `netlify/functions/` con nombres descriptivos (usar guiones, no slashes)

### 2. Netlify: Functions devuelven HTML en lugar de JSON

**Causa:** Functions no se están desplegando o rutas incorrectas

**Solución:**
- Verificar que funciones estén en la raíz
- Verificar `netlify.toml` tiene `directory = "netlify/functions"`
- Verificar que rutas en frontend usen `/.netlify/functions/` en producción

### 3. Supabase: Error ejecutando migraciones

**Causa:** Proyecto no está completamente activo o timeout en polling

**Solución:** 
- Aumentar el tiempo de espera en `waitForProjectReady()` (maxAttempts)
- Verificar que el proyecto esté en estado `ACTIVE_HEALTHY` antes de ejecutar migraciones
- Si falla, esperar 5-10 minutos y reintentar

### 4. Build Netlify: TypeScript errors con `import.meta.env`

**Solución:** Crear `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 5. Google Maps: API Key requerida

**Solución:** Usar embed sin API key con query params de dirección

## 📚 ESTRUCTURA DE ARCHIVOS FINAL

```
proyecto/
├── netlify/
│   ├── functions/              # ⚠️ TODAS las funciones en la raíz
│   │   ├── public-config.ts
│   │   ├── orders-create.ts
│   │   ├── admin-login.ts
│   │   └── ...
│   └── toml
├── supabase/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   └── 002_storage.sql
│   └── seed/
│       └── seed.ts
├── scripts/
│   ├── create-github-repo.ts
│   ├── setup-supabase.ts
│   ├── create-admin.ts
│   ├── seed-images.ts
│   └── dev-server.ts
├── src/
│   ├── lib/
│   │   ├── api-helper.ts       # Helper para rutas API
│   │   └── supabase.ts
│   └── ...
├── public/
│   └── _redirects             # SPA redirects para Netlify
├── .env.local
├── .env.example
└── package.json
```

## 🎯 PROMPT PARA CURSOR

Cuando recibas un prompt inicial para crear un proyecto, debes:

1. **Inferir el prefix** del nombre del proyecto
2. **Crear estructura completa** de archivos
3. **Automatizar GitHub repo** si hay `GITHUB_TOKEN`
4. **Automatizar Supabase** si hay `SUPABASE_ACCESS_TOKEN`
5. **Aplicar migraciones automáticamente** (esperar activación completa del proyecto)
6. **Crear funciones en la raíz** de `netlify/functions/` (NO subdirectorios)
7. **Usar rutas con guiones** en lugar de slashes
8. **Google Maps sin API key** usando embed con query params
9. **Crear admin inicial** automáticamente
10. **Seed de imágenes** con optimización webp

## ✅ VERIFICACIÓN FINAL

Antes de considerar el proyecto completo:

- [ ] Repo GitHub creado y pusheado
- [ ] Proyecto Supabase creado y activo
- [ ] Migraciones aplicadas automáticamente
- [ ] Bucket storage creado
- [ ] Políticas RLS aplicadas
- [ ] Admin creado y funcional
- [ ] Seed de datos ejecutado
- [ ] Seed de imágenes ejecutado
- [ ] Funciones en raíz de `netlify/functions/`
- [ ] Rutas actualizadas en frontend
- [ ] `dev-server.ts` actualizado
- [ ] Build local funciona
- [ ] Deploy Netlify detecta funciones
- [ ] Mapas funcionan sin API key

---

**Última actualización:** Basado en experiencia real con problemas de Netlify Functions y automatización completa de Supabase.

**Nota:** Este prompt es completamente genérico. Reemplaza `{project_name}`, `{project_prefix}`, etc. con los valores inferidos del prompt inicial del proyecto.
