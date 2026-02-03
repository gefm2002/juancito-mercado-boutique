# 🚀 Prompt de Automatización Completa - GitHub + Supabase

## 📋 Resumen

Este documento contiene el **prompt mejorado** que debe usarse para automatizar completamente la creación de repositorios en GitHub y la configuración de Supabase, **sin dejar pasos manuales al usuario**.

## 🎯 Prompt para Cursor/Claude (Copiar y Pegar)

```
OBJETIVO: Automatizar 100% la configuración inicial del proyecto

CREDENCIALES PROPORCIONADAS:
- GITHUB_TOKEN: [token]
- SUPABASE_ACCESS_TOKEN: [token]  
- SUPABASE_ORG_SLUG: [slug]

═══════════════════════════════════════════════════════════════
AUTOMATIZACIÓN OBLIGATORIA (NO DEJAR PASOS MANUALES)
═══════════════════════════════════════════════════════════════

1. GITHUB (INMEDIATO, AUTOMÁTICO):
   ✅ Crear repositorio usando GitHub API:
      POST https://api.github.com/user/repos
      Headers: Authorization: token {GITHUB_TOKEN}
      Body: { "name": "[nombre]", "private": false }
   
   ✅ Git init, commit inicial, push automático:
      git init
      git add .
      git commit -m "Initial commit"
      git remote add origin https://github.com/{user}/{repo}.git
      git push -u origin main
   
   ❌ NO pedir al usuario que cree el repo manualmente
   ❌ NO dejar el push "para después"

2. SUPABASE - PROYECTO (INMEDIATO, AUTOMÁTICO):
   ✅ Obtener organization_id desde org_slug:
      GET https://api.supabase.com/v1/organizations
      Headers: Authorization: Bearer {SUPABASE_ACCESS_TOKEN}
      Buscar org con slug = {SUPABASE_ORG_SLUG}
   
   ✅ Crear proyecto automáticamente:
      POST https://api.supabase.com/v1/projects
      Body: {
        "name": "[nombre-proyecto]",
        "organization_id": "{org_id}",
        "region": "us-east-1",
        "db_pass": "{generar-password-seguro-20-chars}"
      }
   
   ✅ Esperar activación (polling cada 5s, máximo 60 intentos):
      GET https://api.supabase.com/v1/projects/{project_id}
      Esperar: status === "ACTIVE_HEALTHY"
   
   ✅ Obtener credenciales automáticamente:
      GET https://api.supabase.com/v1/projects/{project_id}/api-keys
      Extraer: anon key, service_role key
      Construir: SUPABASE_URL = https://{project_ref}.supabase.co
   
   ✅ Actualizar .env.local automáticamente:
      SUPABASE_URL=...
      SUPABASE_ANON_KEY=...
      SUPABASE_SERVICE_ROLE_KEY=...
      VITE_SUPABASE_URL=...
      VITE_SUPABASE_ANON_KEY=...
   
   ❌ NO pedir al usuario que cree el proyecto manualmente
   ❌ NO dejar credenciales "para configurar después"

3. SUPABASE - MIGRATIONS (AUTOMÁTICO, OBLIGATORIO):
   ✅ Ejecutar SQL de migrations automáticamente:
      POST https://api.supabase.com/v1/projects/{project_id}/database/query
      Body: { "query": "[SQL-completo-de-migrations]" }
   
   ✅ Si la API no permite DDL, usar método alternativo:
      - Obtener connection string desde API
      - Usar cliente PostgreSQL (pg) para ejecutar SQL directamente
      - O instalar Supabase CLI y usar: supabase db push
   
   ✅ Verificar que todas las tablas se crearon:
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'juancito_%'
   
   ❌ NO pedir al usuario que ejecute SQL desde SQL Editor
   ❌ NO dejar migrations "para aplicar después"
   ❌ NO asumir que el usuario lo hará manualmente

4. SUPABASE - STORAGE BUCKETS (AUTOMÁTICO, OBLIGATORIO):
   ✅ Crear bucket usando Storage API:
      POST /storage/v1/bucket
      Body: {
        "id": "juancito_product_images",
        "name": "juancito_product_images",
        "public": true,
        "file_size_limit": 1572864,
        "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
      }
   
   ✅ Aplicar políticas RLS automáticamente:
      POST /database/query con SQL:
      CREATE POLICY "Public read product images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'juancito_product_images');
   
   ✅ Verificar que el bucket existe y es público
   
   ❌ NO pedir al usuario que cree el bucket manualmente
   ❌ NO dejar políticas RLS "para aplicar después"

5. SEED DATA - IMÁGENES (AUTOMÁTICO, OBLIGATORIO):
   ✅ Descargar imágenes de stock relacionadas con el nicho:
      - Usar Unsplash/Pexels API o URLs directas
      - Descargar imágenes para cada categoría (empanadas, fiambres, quesos, etc.)
      - Optimizar: convertir a webp, max 1600px, calidad 0.8
   
   ✅ Subir imágenes al bucket automáticamente:
      - Usar Supabase Storage API
      - Organizar por categoría: {categoria}/{timestamp}-{random}.webp
      - Guardar URLs en archivo JSON: supabase/seed/images.json
   
   ✅ Asociar imágenes a productos en el seed:
      - Cargar images.json en seed.ts
      - Asignar imágenes según categoría del producto
      - Actualizar campo images[] en cada producto
   
   ❌ NO dejar imágenes "para subir después"
   ❌ NO usar placeholders o URLs de ejemplo

6. SEED DATA - PRODUCTOS Y ADMIN (AUTOMÁTICO, OBLIGATORIO):
   ✅ Ejecutar seed.ts que crea:
      - Categorías con imágenes asociadas
      - Productos con imágenes del bucket
      - Configuración del sitio
      - Promos
      - Admin por defecto:
        email: admin@[proyecto].com
        password: admin123 (hash con bcrypt)
        role: admin
        is_active: true
   
   ✅ Verificar que hay productos en la DB
   ✅ Verificar que el admin se creó correctamente
   
   ❌ NO pedir al usuario que cree el admin manualmente
   ❌ NO dejar seed "para ejecutar después"

7. VERIFICACIÓN FINAL (AUTOMÁTICA, OBLIGATORIA):
   ✅ Verificar todas las tablas existen
   ✅ Verificar bucket existe y es público
   ✅ Verificar productos tienen imágenes
   ✅ Verificar admin existe y puede loguearse
   ✅ Mostrar resumen completo:
      - Repo GitHub: [url]
      - Proyecto Supabase: [url]
      - Tablas creadas: [lista]
      - Bucket: [nombre]
      - Productos: [cantidad]
      - Admin: [email] / [password]
   
   ❌ NO asumir que todo está bien sin verificar

═══════════════════════════════════════════════════════════════
REGLAS CRÍTICAS - NUNCA HACER
═══════════════════════════════════════════════════════════════

❌ NUNCA decir: "Por favor ejecuta esto manualmente"
❌ NUNCA decir: "Ve al SQL Editor y..."
❌ NUNCA decir: "Crea el repo en GitHub y..."
❌ NUNCA decir: "Aplica las migrations desde..."
❌ NUNCA decir: "Para después ejecuta..."
❌ NUNCA dejar pasos "para el usuario"
❌ NUNCA asumir que el usuario hará algo manualmente

✅ SIEMPRE: Automatizar todo
✅ SIEMPRE: Verificar que funcionó
✅ SIEMPRE: Mostrar progreso en tiempo real
✅ SIEMPRE: Si falla, intentar método alternativo automáticamente

═══════════════════════════════════════════════════════════════
EJEMPLO DE FLUJO CORRECTO
═══════════════════════════════════════════════════════════════

1. "📦 Creando repositorio en GitHub..."
   → ✅ Repo creado: https://github.com/user/repo
   → ✅ Código pusheado

2. "📦 Creando proyecto en Supabase..."
   → ✅ Proyecto creado: [nombre]
   → ✅ Esperando activación... (15/60)
   → ✅ Proyecto activo!

3. "🔑 Obteniendo credenciales..."
   → ✅ Credenciales obtenidas
   → ✅ .env.local actualizado

4. "📊 Aplicando migrations..."
   → ✅ 6 tablas creadas
   → ✅ Políticas RLS aplicadas

5. "📦 Creando bucket de Storage..."
   → ✅ Bucket creado: juancito_product_images
   → ✅ Políticas RLS aplicadas

6. "📥 Descargando imágenes de stock..."
   → ✅ 15 imágenes descargadas
   → ✅ Imágenes subidas a Storage

7. "🌱 Ejecutando seed..."
   → ✅ 11 categorías creadas
   → ✅ 100 productos creados
   → ✅ Admin creado: admin@proyecto.com

8. "✅ Verificando..."
   → ✅ Todas las tablas existen
   → ✅ Bucket es público
   → ✅ Productos tienen imágenes
   → ✅ Admin puede loguearse

9. "✅ Proyecto 100% listo!"
   → Ejecuta: npm run dev
   → Login: admin@proyecto.com / admin123

═══════════════════════════════════════════════════════════════
SCRIPTS DE AUTOMATIZACIÓN REQUERIDOS
═══════════════════════════════════════════════════════════════

Crear estos scripts que se ejecuten automáticamente:

1. scripts/setup-github.ts
   - Crear repo vía API
   - Git init, commit, push

2. scripts/setup-supabase.ts
   - Crear proyecto
   - Obtener credenciales
   - Actualizar .env.local

3. scripts/apply-migrations.ts
   - Ejecutar SQL automáticamente
   - Verificar tablas creadas

4. scripts/setup-storage.ts
   - Crear bucket
   - Aplicar políticas RLS

5. scripts/download-stock-images.ts
   - Descargar imágenes
   - Subir a Storage
   - Guardar URLs

6. supabase/seed/seed.ts
   - Crear categorías con imágenes
   - Crear productos con imágenes
   - Crear admin automáticamente

7. scripts/setup-full.ts
   - Ejecutar todos los scripts en orden
   - Verificación final completa

═══════════════════════════════════════════════════════════════
```

## 📝 Notas Importantes

### Lo que NO se hizo bien inicialmente:

1. ❌ Se pidió ejecutar migrations manualmente desde SQL Editor
2. ❌ Se pidió aplicar políticas RLS manualmente
3. ❌ No se descargaron/subieron imágenes automáticamente
4. ❌ No se creó el admin automáticamente
5. ❌ Se asumió que el usuario haría pasos manuales

### Lo que SÍ se hizo después (correcto):

1. ✅ Scripts de automatización creados
2. ✅ Imágenes descargadas y subidas automáticamente
3. ✅ Admin creado en el seed
4. ✅ Todo funcionando al 100%

### Para la próxima vez:

Usar este prompt desde el inicio para automatizar TODO sin dejar pasos manuales.
