# 🚀 Prompt de Automatización Completa - Genérico

## 📋 Uso

Este prompt debe agregarse al final del prompt inicial del proyecto. Automatiza completamente GitHub y Supabase **inferiendo todo del prompt inicial**.

## 🎯 Prompt para Agregar (Genérico)

```
═══════════════════════════════════════════════════════════════
AUTOMATIZACIÓN COMPLETA - GITHUB + SUPABASE
═══════════════════════════════════════════════════════════════

CREDENCIALES PROPORCIONADAS:
- GITHUB_TOKEN: [token proporcionado]
- SUPABASE_ACCESS_TOKEN: [token proporcionado]
- SUPABASE_ORG_SLUG: [slug proporcionado] (opcional)

REGLAS DE AUTOMATIZACIÓN (OBLIGATORIAS):

1. INFERIR DEL PROMPT INICIAL:
   - Nombre del proyecto: inferir de "PROJECT_PREFIX" o nombre del repo
   - Nombre del repo: inferir del nombre del proyecto (lowercase, sin espacios)
   - Prefijo de tablas: usar PROJECT_PREFIX del prompt inicial
   - Bucket de Storage: usar PROJECT_PREFIX + "_product_images" o similar
   - Admin por defecto: admin@[proyecto].com / admin123

2. GITHUB (AUTOMÁTICO, INMEDIATO):
   ✅ Si existe GITHUB_TOKEN:
      - Crear repositorio usando GitHub API:
        POST https://api.github.com/user/repos
        Headers: Authorization: token {GITHUB_TOKEN}
        Body: { 
          "name": "{nombre-repo-inferido}",
          "description": "{descripción del prompt inicial}",
          "private": false 
        }
      
      - Git init, commit inicial, push automático:
        git init
        git add .
        git commit -m "Initial commit: {nombre-proyecto}"
        git branch -M main
        git remote add origin https://github.com/{user}/{repo}.git
        git push -u origin main
   
   ❌ NO pedir al usuario que cree el repo manualmente
   ❌ NO dejar el push "para después"

3. SUPABASE - PROYECTO (AUTOMÁTICO, INMEDIATO):
   ✅ Si existe SUPABASE_ACCESS_TOKEN:
      - Obtener organization_id desde org_slug:
        GET https://api.supabase.com/v1/organizations
        Headers: Authorization: Bearer {SUPABASE_ACCESS_TOKEN}
        Buscar org con slug = {SUPABASE_ORG_SLUG}
        Si no hay slug, usar la primera org disponible
      
      - Crear proyecto automáticamente:
        POST https://api.supabase.com/v1/projects
        Body: {
          "name": "{nombre-proyecto-inferido}",
          "organization_id": "{org_id}",
          "region": "{SUPABASE_REGION del prompt o us-east-1}",
          "db_pass": "{generar-password-seguro-20-chars}"
        }
      
      - Esperar activación (polling cada 5s, máximo 60 intentos):
        GET https://api.supabase.com/v1/projects/{project_id}
        Esperar: status === "ACTIVE_HEALTHY" o "ACTIVE_UNHEALTHY"
      
      - Obtener credenciales automáticamente:
        GET https://api.supabase.com/v1/projects/{project_id}/api-keys
        Extraer: anon key, service_role key
        Construir: SUPABASE_URL = https://{project_ref}.supabase.co
      
      - Actualizar .env.local automáticamente:
        SUPABASE_URL=...
        SUPABASE_ANON_KEY=...
        SUPABASE_SERVICE_ROLE_KEY=...
        VITE_SUPABASE_URL=...
        VITE_SUPABASE_ANON_KEY=...
        SUPABASE_DB_PASSWORD=...
   
   ❌ NO pedir al usuario que cree el proyecto manualmente
   ❌ NO dejar credenciales "para configurar después"

4. SUPABASE - MIGRATIONS (AUTOMÁTICO, OBLIGATORIO):
   ✅ Ejecutar SQL de migrations automáticamente:
      - Intentar primero con Management API:
        POST https://api.supabase.com/v1/projects/{project_id}/database/query
        Body: { "query": "{SQL-completo-de-todas-las-migrations}" }
      
      - Si falla, usar connection string de PostgreSQL:
        - Construir connection string: postgresql://postgres.{project_ref}:{db_password}@aws-0-{region}.pooler.supabase.com:6543/postgres
        - Usar cliente pg para ejecutar SQL directamente
        - Ejecutar todas las migrations en orden
      
      - Verificar que todas las tablas se crearon:
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE '{prefix}_%'
        Comparar con tablas esperadas del prompt inicial
   
   ❌ NO pedir al usuario que ejecute SQL desde SQL Editor
   ❌ NO dejar migrations "para aplicar después"
   ❌ NO asumir que el usuario lo hará manualmente

5. SUPABASE - STORAGE BUCKETS (AUTOMÁTICO, OBLIGATORIO):
   ✅ Si el prompt menciona imágenes o Storage:
      - Crear bucket usando Supabase Storage API:
        POST /storage/v1/bucket (usando service role)
        Body: {
          "id": "{prefix}_product_images",
          "name": "{prefix}_product_images",
          "public": true,
          "file_size_limit": 1572864,
          "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
        }
      
      - Aplicar políticas RLS automáticamente:
        Ejecutar SQL de políticas de Storage:
        CREATE POLICY "Public read {bucket_name}"
        ON storage.objects FOR SELECT
        USING (bucket_id = '{bucket_id}');
      
      - Verificar que el bucket existe y es público
   
   ❌ NO pedir al usuario que cree el bucket manualmente
   ❌ NO dejar políticas RLS "para aplicar después"

6. SEED DATA - IMÁGENES (AUTOMÁTICO, SI APLICA):
   ✅ Si el prompt menciona imágenes de stock o productos con imágenes:
      - Descargar imágenes de stock relacionadas con el nicho:
        * Inferir nicho del prompt inicial (deli, restaurante, ecommerce, etc.)
        * Usar Unsplash/Pexels con keywords del nicho
        * Descargar imágenes para cada categoría mencionada
        * Optimizar: convertir a webp, max 1600px, calidad 0.8
      
      - Subir imágenes al bucket automáticamente:
        * Usar Supabase Storage API con service role
        * Organizar por categoría: {categoria}/{timestamp}-{random}.webp
        * Guardar URLs en archivo JSON: supabase/seed/images.json
      
      - Asociar imágenes a productos en el seed:
        * Cargar images.json en seed.ts
        * Asignar imágenes según categoría del producto
        * Actualizar campo images[] en cada producto
   
   ❌ NO dejar imágenes "para subir después"
   ❌ NO usar placeholders o URLs de ejemplo

7. SEED DATA - PRODUCTOS Y ADMIN (AUTOMÁTICO, OBLIGATORIO):
   ✅ Ejecutar seed.ts que crea:
      - Categorías (con imágenes si aplica)
      - Productos (con imágenes del bucket si aplica)
      - Configuración del sitio (del prompt inicial)
      - Promos/banners (si se mencionan)
      - Admin por defecto:
        email: admin@{proyecto}.com
        password: admin123 (hash con bcrypt)
        role: admin
        is_active: true
      
      - Verificar que hay datos en la DB
      - Verificar que el admin se creó correctamente
   
   ❌ NO pedir al usuario que cree el admin manualmente
   ❌ NO dejar seed "para ejecutar después"

8. VERIFICACIÓN FINAL (AUTOMÁTICA, OBLIGATORIA):
   ✅ Verificar todas las tablas existen
   ✅ Verificar bucket existe (si aplica)
   ✅ Verificar productos tienen imágenes (si aplica)
   ✅ Verificar admin existe y puede loguearse
   ✅ Mostrar resumen completo:
      - Repo GitHub: [url] (si se creó)
      - Proyecto Supabase: [url] (si se creó)
      - Tablas creadas: [lista]
      - Bucket: [nombre] (si aplica)
      - Productos: [cantidad]
      - Admin: [email] / [password]
      - Estado: ✅ 100% funcional
   
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
❌ NUNCA usar valores hardcodeados específicos del proyecto

✅ SIEMPRE: Automatizar todo
✅ SIEMPRE: Inferir valores del prompt inicial
✅ SIEMPRE: Verificar que funcionó
✅ SIEMPRE: Mostrar progreso en tiempo real
✅ SIEMPRE: Si falla, intentar método alternativo automáticamente
✅ SIEMPRE: Usar PROJECT_PREFIX y variables del prompt inicial

═══════════════════════════════════════════════════════════════
EJEMPLO DE FLUJO CORRECTO
═══════════════════════════════════════════════════════════════

1. "📦 Analizando prompt inicial..."
   → ✅ Proyecto: {nombre-inferido}
   → ✅ Prefix: {prefix-inferido}
   → ✅ Repo: {repo-inferido}

2. "📦 Creando repositorio en GitHub..."
   → ✅ Repo creado: https://github.com/{user}/{repo}
   → ✅ Código pusheado

3. "📦 Creando proyecto en Supabase..."
   → ✅ Proyecto creado: {nombre}
   → ✅ Esperando activación... (15/60)
   → ✅ Proyecto activo!

4. "🔑 Obteniendo credenciales..."
   → ✅ Credenciales obtenidas
   → ✅ .env.local actualizado

5. "📊 Aplicando migrations..."
   → ✅ {N} tablas creadas
   → ✅ Políticas RLS aplicadas

6. "📦 Creando bucket de Storage..." (si aplica)
   → ✅ Bucket creado: {prefix}_product_images
   → ✅ Políticas RLS aplicadas

7. "📥 Descargando imágenes de stock..." (si aplica)
   → ✅ {N} imágenes descargadas
   → ✅ Imágenes subidas a Storage

8. "🌱 Ejecutando seed..."
   → ✅ {N} categorías creadas
   → ✅ {N} productos creados
   → ✅ Admin creado: admin@{proyecto}.com

9. "✅ Verificando..."
   → ✅ Todas las tablas existen
   → ✅ Bucket es público (si aplica)
   → ✅ Productos tienen imágenes (si aplica)
   → ✅ Admin puede loguearse

10. "✅ Proyecto 100% listo!"
    → Ejecuta: npm run dev
    → Login: admin@{proyecto}.com / admin123

═══════════════════════════════════════════════════════════════
```

## 📝 Notas

- Este prompt es **genérico** y debe inferir todo del prompt inicial
- Usa PROJECT_PREFIX, nombre del proyecto, y otras variables del prompt
- No hardcodea valores específicos
- Se adapta según lo que mencione el prompt inicial (Storage, imágenes, etc.)
