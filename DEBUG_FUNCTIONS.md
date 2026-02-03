# 🔍 Debug: Functions no detectadas

## Configuración verificada ✅

Según la imagen del dashboard de Netlify:
- ✅ **Base directory**: Vacío (correcto)
- ✅ **Functions directory**: `netlify/functions` (correcto)
- ✅ **Build command**: `npm run build` (correcto)
- ✅ **Publish directory**: `dist` (correcto)

## Posibles causas

### 1. Build log no muestra funciones
**Acción**: Revisar el build log completo en Netlify
1. Ve a **Deploys → [último deploy] → Build log**
2. Busca líneas como:
   - `"Detected X functions"`
   - `"Bundling functions"`
   - `"Functions bundling"`
3. Si NO aparecen, las funciones no se están detectando durante el build

### 2. Funciones no se compilan correctamente
**Verificación local**:
```bash
npm run build
```
Si hay errores de TypeScript o compilación, las funciones no se desplegarán.

### 3. Problema con esbuild
Netlify usa `esbuild` para compilar funciones TypeScript. Si hay un error silencioso, las funciones no se detectan.

**Solución**: Verificar que todas las funciones:
- Exporten `handler` correctamente
- No tengan errores de TypeScript
- Tengan todas las dependencias instaladas

### 4. Funciones en subdirectorios
Netlify debería detectar funciones en subdirectorios automáticamente, pero a veces hay problemas.

**Rutas esperadas**:
- `/.netlify/functions/public/config`
- `/.netlify/functions/orders/create`
- `/.netlify/functions/admin/login`

### 5. Variables de entorno faltantes
Si las funciones fallan al inicializarse por variables de entorno faltantes, pueden no aparecer en el deploy.

**Verificar en Netlify Dashboard**:
- Site settings → Environment variables
- Debe tener: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.

## Acciones recomendadas

### Paso 1: Verificar build log completo
1. Ve a **Deploys → [último deploy]**
2. Abre el **Build log completo** (no solo el resumen)
3. Busca errores relacionados con funciones
4. Busca líneas que mencionen "functions"

### Paso 2: Redeploy con logs detallados
1. Ve a **Deploys**
2. Click en **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Observa el build log en tiempo real
4. Busca mensajes sobre funciones

### Paso 3: Verificar Functions tab
1. Ve a **Functions** tab en el dashboard
2. Si dice "No functions", confirma que no se están desplegando
3. Si aparecen funciones pero con errores, revisa los logs de cada función

### Paso 4: Contactar soporte
Si todo lo anterior está correcto y las funciones aún no se detectan, puede ser:
- Un problema de la cuenta de Netlify
- Un bug en el sistema de detección de funciones
- Un problema con el plan (límites de functions)

## Verificación local

Para verificar que las funciones están correctas localmente:

```bash
# Verificar que todas exportan handler
find netlify/functions -name "*.ts" -exec grep -l "export.*handler" {} \;

# Debe mostrar 13 archivos
```

## Próximos pasos

1. Revisar el build log completo en Netlify
2. Verificar que no haya errores de compilación
3. Si persiste, contactar soporte de Netlify con:
   - URL del proyecto
   - Build log completo
   - Estructura de funciones
