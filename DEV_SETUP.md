# 🛠️ Setup de Desarrollo

## ⚠️ Importante: Servidor de Desarrollo

Para que el login, las funciones admin y las funciones públicas funcionen en desarrollo local, necesitas ejecutar el servidor de desarrollo.

## 🚀 Inicio Rápido

### Opción 1: Dos Terminales (Recomendado)

**Terminal 1:**
```bash
npm run dev:server
```

**Terminal 2:**
```bash
npm run dev
```

### Opción 2: Una Terminal (Automático)

```bash
npm run dev:full
```

Esto ejecuta ambos servidores simultáneamente.

## 📝 Qué hace cada servidor

- **Vite Dev Server** (`npm run dev`): Frontend en http://localhost:5173
- **Dev Server** (`npm run dev:server`): API local en http://localhost:3001
  - Proporciona `/api/admin/login`, `/api/admin/me`
  - Proporciona `/api/public/config`, `/api/public/catalog`
  - Proporciona `/api/orders/create`
  - Usa las credenciales de `.env.local`

## ✅ Verificar que funciona

1. Ejecuta `npm run dev:full` o los dos servidores por separado
2. Abre http://localhost:5173
3. Ve a `/admin` y prueba el login
4. Ve a `/sucursales` y verifica que carga correctamente

## 🔧 Troubleshooting

### Error: "Unexpected end of JSON input" o "Unexpected token '<'"
- El servidor de desarrollo no está corriendo
- Ejecuta: `npm run dev:server` en otra terminal

### Error: "No se puede conectar al servidor"
- Verifica que el servidor esté en puerto 3001
- Verifica que `.env.local` tenga las credenciales correctas
- Verifica que no haya otro proceso usando el puerto 3001

### Error: "Credenciales inválidas"
- Verifica que el admin exista: `npm run create-admin`
- O usa: `admin@juancito.com` / `admin123` (creado en seed)

### La página de Sucursales no carga
- Asegúrate de que el servidor de desarrollo esté corriendo
- Verifica que `/api/public/config` responda correctamente:
  ```bash
  curl http://localhost:3001/api/public/config
  ```

## 📦 Producción

En producción (Netlify), las funciones se ejecutan automáticamente. No necesitas el servidor de desarrollo.
