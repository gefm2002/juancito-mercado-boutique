# Prompt de Automatización - GitHub + Supabase

## Contexto

Este documento contiene el prompt específico para automatizar completamente la creación del repositorio en GitHub y la configuración de Supabase, incluyendo la creación de tablas, buckets y seed data.

## Prompt Mejorado para Cursor/Claude

```
OBJETIVO: Automatizar completamente la configuración inicial del proyecto

CREDENCIALES PROPORCIONADAS:
- GITHUB_TOKEN: [token]
- SUPABASE_ACCESS_TOKEN: [token]
- SUPABASE_ORG_SLUG: [slug]

AUTOMATIZACIÓN REQUERIDA (NO MANUAL):

1. GITHUB (INMEDIATO):
   - Crear repositorio usando GitHub API con el token proporcionado
   - Nombre del repo: [nombre-del-proyecto]
   - Hacer git init, commit inicial y push automático
   - NO pedir al usuario que lo haga manualmente

2. SUPABASE (INMEDIATO):
   - Usar SUPABASE_ACCESS_TOKEN para autenticarse en Management API
   - Crear proyecto automáticamente usando:
     POST https://api.supabase.com/v1/projects
     {
       "name": "[nombre-proyecto]",
       "organization_id": "[org-id-obtenido-del-slug]",
       "region": "us-east-1",
       "db_pass": "[generar-password-seguro]"
     }
   - Esperar a que el proyecto esté ACTIVE_HEALTHY (polling cada 5s, máximo 60 intentos)
   - Obtener credenciales automáticamente:
     GET https://api.supabase.com/v1/projects/{project_id}/api-keys
   - Extraer SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   - Actualizar .env.local automáticamente con todas las credenciales

3. MIGRATIONS (AUTOMÁTICO):
   - Ejecutar SQL de migrations usando Management API:
     POST https://api.supabase.com/v1/projects/{project_id}/database/query
     {
       "query": "[SQL-completo-de-migrations]"
     }
   - Si la API no permite DDL directamente, usar connection string de PostgreSQL:
     - Obtener connection string desde Settings > Database
     - O usar Supabase CLI si está disponible
   - NO dejar al usuario ejecutar manualmente desde SQL Editor
   - Verificar que todas las tablas se crearon correctamente

4. STORAGE BUCKETS (AUTOMÁTICO):
   - Crear bucket usando Supabase Storage API:
     POST /storage/v1/bucket
     {
       "id": "juancito_product_images",
       "name": "juancito_product_images",
       "public": true,
       "file_size_limit": 1572864,
       "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
     }
   - Aplicar políticas RLS automáticamente usando SQL:
     CREATE POLICY "Public read product images"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'juancito_product_images');
   - NO dejar al usuario hacerlo manualmente

5. SEED DATA (AUTOMÁTICO):
   - Descargar imágenes de stock (Unsplash/Pexels) relacionadas con el nicho
   - Subirlas al bucket de Storage automáticamente
   - Ejecutar seed.ts que crea:
     - Categorías con imágenes
     - Productos con imágenes asociadas
     - Configuración del sitio
     - Promos
     - Admin por defecto (email: admin@[proyecto].com, password: admin123)
   - Todo automático, sin intervención manual

6. VERIFICACIÓN (AUTOMÁTICA):
   - Verificar que todas las tablas existen
   - Verificar que el bucket existe
   - Verificar que hay productos en la DB
   - Verificar que el admin se creó
   - Mostrar resumen completo de lo creado

REGLAS CRÍTICAS:
- NUNCA pedir al usuario que ejecute SQL manualmente
- NUNCA pedir al usuario que cree el repo manualmente
- NUNCA dejar pasos "para después"
- TODO debe estar 100% funcional al finalizar
- Si algo falla, intentar método alternativo automáticamente
- Mostrar progreso en tiempo real
- Si hay errores, mostrar solución automática, no instrucciones manuales

EJEMPLO DE FLUJO CORRECTO:
1. "Creando repositorio en GitHub..." → ✅ Repo creado
2. "Creando proyecto en Supabase..." → ✅ Proyecto creado
3. "Obteniendo credenciales..." → ✅ Credenciales en .env.local
4. "Aplicando migrations..." → ✅ Tablas creadas
5. "Creando bucket de Storage..." → ✅ Bucket creado
6. "Descargando imágenes de stock..." → ✅ Imágenes subidas
7. "Ejecutando seed..." → ✅ Productos y admin creados
8. "Verificando..." → ✅ Todo OK
9. "✅ Proyecto listo! Ejecuta: npm run dev"

NO HACER:
- "Por favor ejecuta esto manualmente"
- "Ve al SQL Editor y..."
- "Crea el repo en GitHub y..."
- "Aplica las migrations desde..."
```

## Lo que se hizo vs. Lo que debería hacerse

### ❌ Lo que NO se hizo bien inicialmente:

1. **GitHub**: Se creó el repo pero no se hizo push automático de todo
2. **Supabase**: Se creó el proyecto pero no se aplicaron migrations automáticamente
3. **Storage**: Se creó el bucket pero se pidió aplicar políticas manualmente
4. **Seed**: No se descargaron/subieron imágenes automáticamente
5. **Admin**: No se creó automáticamente en el seed

### ✅ Lo que SÍ se hizo después:

1. ✅ Repo creado y pusheado
2. ✅ Proyecto Supabase creado
3. ✅ Credenciales obtenidas y guardadas
4. ✅ Bucket creado (aunque políticas se aplicaron después)
5. ✅ Imágenes descargadas y subidas
6. ✅ Admin creado automáticamente

## Scripts de Automatización Creados

1. `scripts/setup-supabase.ts` - Crea proyecto y obtiene credenciales
2. `scripts/create-storage-bucket.ts` - Crea bucket de Storage
3. `scripts/download-stock-images.ts` - Descarga y sube imágenes
4. `supabase/seed/seed.ts` - Seed completo con imágenes y admin

## Mejoras para Próxima Vez

1. **Ejecutar migrations automáticamente** usando connection string de PostgreSQL
2. **Aplicar políticas RLS de Storage** automáticamente en el mismo script
3. **Verificar todo** antes de decir que está completo
4. **No asumir** que el usuario hará pasos manuales

## Comandos de Automatización

```bash
# Setup completo automatizado (ideal)
npm run setup:full

# O paso a paso:
npm run setup:github      # Crear repo y push
npm run setup:supabase    # Crear proyecto y obtener credenciales
npm run setup:migrations  # Aplicar migrations automáticamente
npm run setup:storage    # Crear bucket y políticas
npm run seed:full        # Descargar imágenes + seed completo
```
