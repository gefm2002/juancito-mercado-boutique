# 🔧 Solución: Functions no detectadas en Netlify

## Problema
El deploy muestra: **"No functions deployed"**

Según la [documentación oficial de Netlify Functions](https://docs.netlify.com/build/functions/overview/), las funciones deberían detectarse automáticamente.

## Verificaciones realizadas ✅

- ✅ 13 funciones en el repo (`git ls-files netlify/functions/` muestra 13 archivos)
- ✅ Todas las funciones exportan `handler` correctamente
- ✅ `netlify.toml` configurado con `directory = "netlify/functions"`
- ✅ Estructura de directorios correcta
- ✅ Dependencia `@netlify/functions` instalada

## Solución: Verificar configuración en Netlify Dashboard

### Paso 1: Verificar Build Log
1. Ve a **Netlify Dashboard → Deploys → [último deploy]**
2. Abre el **Build log completo** (no solo el resumen)
3. Busca estas líneas:
   - `"Detected X functions"`
   - `"Functions bundling"`
   - `"Bundling functions"`
4. Si NO aparecen, las funciones no se están detectando

### Paso 2: Verificar configuración del sitio
1. Ve a **Site settings → Build & deploy → Build settings**
2. Verifica estos campos:
   - **Base directory:** Debe estar **VACÍO** (no `/` ni nada)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** Debe estar **VACÍO** o ser `netlify/functions`

   ⚠️ **IMPORTANTE:** Si "Base directory" tiene un valor, puede estar causando que Netlify no encuentre las funciones.

### Paso 3: Redeploy limpio
1. Ve a **Deploys**
2. Click en **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Espera a que termine el build
4. Verifica el build log para ver si ahora aparece "Detected X functions"

### Paso 4: Verificar en Functions tab
1. Ve a **Functions** tab en el dashboard
2. Debe mostrar las 13 funciones listadas
3. Si dice "No functions", no se están desplegando

### Paso 5: Verificar variables de entorno
1. Ve a **Site settings → Environment variables**
2. Verifica que estén configuradas:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `NETLIFY_JWT_SECRET` (opcional, tiene default)

## Si persiste el problema

Puede ser necesario:
1. **Verificar el plan de Netlify** - Algunos planes tienen límites
2. **Contactar soporte de Netlify** - Puede ser un problema de la cuenta
3. **Verificar que el proyecto esté correctamente vinculado** a GitHub

## Estructura actual (correcta)
```
netlify/functions/
  ├── public/
  │   ├── config.ts ✅
  │   └── catalog.ts ✅
  ├── orders/
  │   └── create.ts ✅
  └── admin/
      ├── login.ts ✅
      ├── me.ts ✅
      ├── products.ts ✅
      ├── categories.ts ✅
      ├── orders.ts ✅
      ├── promos.ts ✅
      ├── sucursales.ts ✅
      ├── content.ts ✅
      └── images/
          ├── sign-upload.ts ✅
          └── delete.ts ✅
```

## Referencias
- [Netlify Functions Overview](https://docs.netlify.com/build/functions/overview/)
- [Deploy Functions](https://docs.netlify.com/build/functions/deploy/)
