# 🔍 Verificar Deploy en Netlify

## Problema: Functions devuelven 404 o HTML

Si las funciones devuelven HTML en lugar de JSON, significa que no se están desplegando.

### Pasos para verificar:

1. **En Netlify Dashboard → Deploys → [último deploy] → Functions**
   - Debe mostrar: "Detected 13 functions"
   - Si dice "No functions detected", las funciones no se están desplegando

2. **Verificar Build Log:**
   - Busca: "Detected 13 functions"
   - Busca: "Functions bundling"
   - Si no aparece, hay un problema

3. **Verificar que las funciones estén en el repo:**
   ```bash
   git ls-files netlify/functions/ | wc -l
   ```
   Debe mostrar: `13`

4. **Probar funciones directamente:**
   - `https://juancitoboutique.netlify.app/.netlify/functions/public/config`
   - Debe devolver JSON, no HTML

5. **Verificar variables de entorno:**
   En Netlify Dashboard → Site settings → Environment variables:
   - `SUPABASE_URL` ✅
   - `SUPABASE_SERVICE_ROLE_KEY` ✅
   - `SUPABASE_ANON_KEY` ✅
   - `NETLIFY_JWT_SECRET` (opcional)

### Si las funciones no se detectan:

1. Verifica que `netlify/functions` NO esté en `.gitignore`
2. Verifica que las funciones exporten `handler` correctamente
3. Verifica que `netlify.toml` tenga:
   ```toml
   [functions]
     directory = "netlify/functions"
     node_bundler = "esbuild"
   ```

### Solución temporal:

Si las funciones no funcionan, puedes:
1. Hacer un redeploy limpio (Clear cache and deploy site)
2. Verificar que el build log muestre las funciones
3. Contactar soporte de Netlify si persiste
