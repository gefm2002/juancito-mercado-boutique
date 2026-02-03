# 🛠️ Setup de Desarrollo

## Problema: Netlify Functions en Desarrollo Local

Las Netlify Functions no están disponibles automáticamente en desarrollo local. Necesitas ejecutar `netlify dev` para que funcionen.

## Solución Rápida

### Opción 1: Usar Netlify Dev (Recomendado)

```bash
# Instalar Netlify CLI globalmente
npm install -g netlify-cli

# En una terminal, ejecutar:
netlify dev

# En otra terminal, ejecutar:
npm run dev
```

Esto iniciará:
- Netlify Functions en `http://localhost:8888`
- Vite dev server en `http://localhost:5173` (con proxy a funciones)

### Opción 2: Script Automático

```bash
npm run dev:full
```

Esto ejecuta ambos servidores simultáneamente.

## Verificar que Funciona

1. Abre `http://localhost:5173`
2. Ve a `/admin`
3. Intenta loguearte con: `admin@juancito.com` / `admin123`

Si ves el error "Unexpected end of JSON input", significa que las funciones no están corriendo.

## Solución Temporal

Si no puedes instalar Netlify CLI, puedes modificar el código para usar Supabase directamente en desarrollo (sin funciones). Pero esto no es recomendado para producción.
