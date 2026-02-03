# ✅ Checklist: Verificar Functions en Netlify

## Según la documentación oficial de Netlify

Según [la documentación de Netlify Functions](https://docs.netlify.com/build/functions/overview/), las funciones deberían detectarse automáticamente.

## Verificaciones necesarias

### 1. Estructura de directorios ✅
```
netlify/functions/
  ├── public/
  │   ├── config.ts
  │   └── catalog.ts
  ├── orders/
  │   └── create.ts
  └── admin/
      └── ...
```
✅ Verificado: Estructura correcta

### 2. Export de handler ✅
Cada función debe exportar:
```typescript
export const handler: Handler = async (event, context) => {
  // ...
}
```
✅ Verificado: Todas las funciones exportan `handler`

### 3. netlify.toml ✅
```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```
✅ Verificado: Configuración correcta

### 4. Funciones en Git ✅
```bash
git ls-files | grep "netlify/functions" | wc -l
```
Debe mostrar: `13`
✅ Verificado: 13 funciones en el repo

### 5. Dependencias ✅
```json
"@netlify/functions": "^2.4.0"
```
✅ Verificado: Dependencia instalada

## Acción requerida en Netlify Dashboard

### Paso 1: Verificar Build Log
1. Ve a **Netlify Dashboard → Deploys → [último deploy]**
2. Abre el **Build log completo**
3. Busca: `"Detected X functions"` o `"Functions bundling"`
4. Si NO aparece, hay un problema

### Paso 2: Verificar configuración del sitio
1. Ve a **Site settings → Build & deploy**
2. Verifica:
   - **Base directory:** (debe estar vacío)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions` (o dejar vacío)

### Paso 3: Redeploy limpio
1. Ve a **Deploys**
2. Click en **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Espera a que termine
4. Verifica si ahora aparece "Detected X functions"

### Paso 4: Verificar en la UI
1. Ve a **Functions** tab en Netlify Dashboard
2. Debe mostrar las 13 funciones
3. Si dice "No functions", no se están desplegando

## Si persiste el problema

Puede ser necesario:
1. **Contactar soporte de Netlify** - Puede ser un problema de la cuenta
2. **Verificar el plan** - Algunos planes tienen límites en functions
3. **Verificar que las funciones no estén en .gitignore** - Ya verificado ✅

## Referencia
- [Netlify Functions Overview](https://docs.netlify.com/build/functions/overview/)
- [Deploy Functions](https://docs.netlify.com/build/functions/deploy/)
