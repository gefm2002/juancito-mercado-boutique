# ⚠️ ACCIÓN REQUERIDA: Functions no se detectan en Netlify

## Problema confirmado
El deploy muestra: **"No functions deployed"**

## Verificaciones realizadas ✅
- ✅ 13 funciones en el repo
- ✅ Funciones exportan `handler` correctamente
- ✅ `netlify.toml` configurado correctamente
- ✅ Estructura de directorios correcta

## Acciones a realizar en Netlify Dashboard

### 1. Verificar Build Log
1. Ve a Netlify Dashboard → Deploys → [último deploy]
2. Abre el build log completo
3. Busca: "Detected X functions" o "Functions bundling"
4. Si NO aparece, las funciones no se están detectando

### 2. Verificar configuración del proyecto
1. Ve a Netlify Dashboard → Site settings → Build & deploy
2. Verifica:
   - **Base directory:** (debe estar vacío o ser `/`)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions` (o dejar vacío para auto-detect)

### 3. Redeploy limpio
1. Ve a Deploys
2. Click en "Trigger deploy" → "Clear cache and deploy site"
3. Espera a que termine el build
4. Verifica si ahora detecta las funciones

### 4. Verificar variables de entorno
1. Ve a Site settings → Environment variables
2. Verifica que estén configuradas:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `NETLIFY_JWT_SECRET` (opcional)

### 5. Si persiste el problema
Puede ser necesario:
1. Contactar soporte de Netlify
2. Verificar que la cuenta tenga acceso a Functions
3. Verificar límites de la cuenta (plan gratuito tiene límites)

## Estructura esperada
```
netlify/functions/
  ├── public/
  │   ├── config.ts
  │   └── catalog.ts
  ├── orders/
  │   └── create.ts
  └── admin/
      ├── login.ts
      ├── me.ts
      ├── products.ts
      ├── categories.ts
      ├── orders.ts
      ├── promos.ts
      ├── sucursales.ts
      ├── content.ts
      └── images/
          ├── sign-upload.ts
          └── delete.ts
```

## Rutas esperadas (cuando funcionen)
- `/.netlify/functions/public/config`
- `/.netlify/functions/orders/create`
- `/.netlify/functions/admin/login`
