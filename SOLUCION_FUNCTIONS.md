# 🔧 Solución: Functions no se detectan en Netlify

## Problema confirmado
El deploy muestra: **"No functions deployed"**

## Posibles causas y soluciones

### 1. Verificar estructura de funciones
Las funciones deben estar en:
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

### 2. Verificar netlify.toml
```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### 3. Verificar que las funciones exporten handler
Cada función debe tener:
```typescript
export const handler: Handler = async (event, context) => {
  // ...
}
```

### 4. Verificar que las funciones estén en Git
```bash
git ls-files netlify/functions/ | wc -l
```
Debe mostrar: `13`

### 5. Solución: Mover funciones a raíz (si persiste)
Si Netlify no detecta funciones en subdirectorios, puedes moverlas temporalmente:

```bash
# Crear funciones en raíz de netlify/functions
netlify/functions/
  ├── public-config.ts
  ├── public-catalog.ts
  ├── orders-create.ts
  ├── admin-login.ts
  └── ...
```

Y actualizar las rutas en el código:
- `/.netlify/functions/public-config`
- `/.netlify/functions/orders-create`

### 6. Verificar build log
En Netlify Dashboard → Deploys → [deploy] → Build log:
- Busca: "Detected X functions"
- Si no aparece, hay un problema de configuración

### 7. Redeploy limpio
1. Netlify Dashboard → Deploys
2. Trigger deploy → Clear cache and deploy site
3. Verificar que aparezcan las funciones

### 8. Contactar soporte
Si nada funciona, puede ser un problema de la cuenta de Netlify o configuración del proyecto.
