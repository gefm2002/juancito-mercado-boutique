# 🚀 Deploy en Netlify - Troubleshooting

## Problema: Functions devuelven 404

Si las funciones devuelven 404 o HTML en lugar de JSON, verifica:

### 1. Verificar que las funciones estén en el repo

```bash
ls -R netlify/functions/
```

Debe mostrar:
- `netlify/functions/public/config.ts`
- `netlify/functions/orders/create.ts`
- `netlify/functions/admin/*.ts`

### 2. Verificar netlify.toml

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### 3. Verificar variables de entorno en Netlify

En Netlify Dashboard → Site settings → Environment variables, asegúrate de tener:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NETLIFY_JWT_SECRET` (opcional, tiene default)

### 4. Verificar que las funciones se compilen

En el build log de Netlify, deberías ver:
```
Detected 13 functions
```

Si no ves esto, las funciones no se están detectando.

### 5. Probar funciones directamente

Después del deploy, prueba:
- `https://tu-sitio.netlify.app/.netlify/functions/public/config`
- `https://tu-sitio.netlify.app/.netlify/functions/admin/login`

Deberían devolver JSON, no HTML.

### 6. Si sigue fallando

1. Verifica que `netlify/functions` esté en el repo (no en .gitignore)
2. Verifica que las funciones exporten `handler` correctamente
3. Verifica que no haya errores de compilación en el build log
4. Intenta hacer un redeploy limpio

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

## Rutas esperadas

- `/.netlify/functions/public/config` → `netlify/functions/public/config.ts`
- `/.netlify/functions/orders/create` → `netlify/functions/orders/create.ts`
- `/.netlify/functions/admin/login` → `netlify/functions/admin/login.ts`
