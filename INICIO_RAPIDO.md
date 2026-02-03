# 🚀 Inicio Rápido

## Para Desarrollo Local

### Opción 1: Una Terminal (Recomendado)

```bash
npm run dev:full
```

Esto ejecuta ambos servidores simultáneamente:
- **Vite Dev Server**: http://localhost:5173 (Frontend)
- **Dev Server**: http://localhost:3001 (API)

### Opción 2: Dos Terminales

**Terminal 1:**
```bash
npm run dev:server
```

**Terminal 2:**
```bash
npm run dev
```

## ✅ Verificar que Funciona

1. Abre http://localhost:5173
2. Ve a `/admin` y prueba el login:
   - Email: `admin@juancito.com`
   - Password: `admin123`
3. Ve a `/sucursales` y verifica que carga correctamente

## 🔧 Si el Servidor No Inicia

Si ves el error "No se puede conectar al servidor":

1. Verifica que el puerto 3001 esté libre:
   ```bash
   lsof -ti:3001
   ```

2. Si hay un proceso, detenlo:
   ```bash
   pkill -f "tsx scripts/dev-server"
   ```

3. Inicia el servidor manualmente:
   ```bash
   npm run dev:server
   ```

4. Verifica que responda:
   ```bash
   curl http://localhost:3001/api/public/config
   ```

## 📝 Endpoints Disponibles

El servidor de desarrollo proporciona:

- `POST /api/admin/login` - Login de admin
- `GET /api/admin/me` - Info del admin actual
- `GET /api/public/config` - Configuración del sitio
- `GET /api/public/catalog` - Catálogo de productos
- `POST /api/orders/create` - Crear orden

## 🐛 Troubleshooting

### Error: "Unexpected end of JSON input"
- El servidor de desarrollo no está corriendo
- Ejecuta: `npm run dev:server`

### Error: "No se puede conectar al servidor"
- Verifica que el servidor esté en puerto 3001
- Verifica que `.env.local` tenga las credenciales correctas

### Error: "Credenciales inválidas"
- Verifica que el admin exista: `npm run create-admin`
- O usa: `admin@juancito.com` / `admin123`
