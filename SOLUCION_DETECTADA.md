# ✅ Solución: Functions no detectadas en subdirectorios

## Problema identificado

El build log muestra:
```
No Functions were found in netlify/functions directory
```

**Causa**: Netlify no está detectando funciones TypeScript en subdirectorios (`public/`, `admin/`, `orders/`).

## Soluciones posibles

### Opción 1: Mover funciones a la raíz (más simple)

Netlify detecta funciones directamente en `netlify/functions/`, no en subdirectorios.

**Estructura actual**:
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

**Estructura que Netlify detecta**:
```
netlify/functions/
  ├── public-config.ts
  ├── public-catalog.ts
  ├── orders-create.ts
  ├── admin-login.ts
  └── ...
```

**Rutas resultantes**:
- `/.netlify/functions/public-config` (en lugar de `public/config`)
- `/.netlify/functions/orders-create` (en lugar de `orders/create`)
- `/.netlify/functions/admin-login` (en lugar de `admin/login`)

### Opción 2: Usar archivos index.ts en subdirectorios

Crear `index.ts` en cada subdirectorio que exporte el handler:

```typescript
// netlify/functions/public/index.ts
export { handler } from './config'
```

Pero esto solo crearía una función por subdirectorio, no múltiples.

### Opción 3: Verificar si Netlify necesita configuración adicional

Algunas versiones de Netlify Build pueden requerir configuración explícita para subdirectorios.

## Recomendación

**Usar Opción 1**: Mover funciones a la raíz con nombres descriptivos.

**Ventajas**:
- ✅ Netlify las detecta automáticamente
- ✅ Rutas más simples
- ✅ Sin configuración adicional

**Desventajas**:
- ⚠️ Necesita actualizar rutas en el código frontend
- ⚠️ Nombres de archivos más largos

## Próximos pasos

1. Decidir si mover funciones a la raíz
2. Actualizar `apiUrl()` helper para usar nuevas rutas
3. Probar deploy nuevamente
