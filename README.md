# Juancito Mercado Boutique

Webapp completa para "Juancito Mercado Boutique" - mercado boutique en Caballito, CABA.

## Stack

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Functions**: Netlify Functions
- **Deploy**: Netlify

## Setup Local

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

Copiar `.env.example` a `.env.local` y completar:

```bash
# Supabase - Modo A (existente)
SUPABASE_URL=tu_url
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Supabase - Modo B (crear automáticamente)
SUPABASE_ACCESS_TOKEN=tu_access_token
SUPABASE_ORG_SLUG=tu_org_slug
SUPABASE_PROJECT_NAME=juancito-mercado-boutique
SUPABASE_REGION=us-east-1
SUPABASE_DB_PASSWORD=tu_password_seguro

# Netlify
NETLIFY_JWT_SECRET=tu_secret_jwt_seguro

# GitHub (opcional)
GITHUB_TOKEN=tu_token
```

### Configurar Supabase

#### Modo A: Proyecto existente

Si ya tenés un proyecto de Supabase:

1. Obtener `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` desde el dashboard
2. Aplicar migrations:

```bash
# Instalar Supabase CLI si no lo tenés
npm install -g supabase

# Link proyecto
supabase link --project-ref tu-project-ref

# Aplicar migrations
supabase db push
```

#### Modo B: Crear proyecto automáticamente

1. Obtener `SUPABASE_ACCESS_TOKEN` desde https://supabase.com/dashboard/account/tokens
2. Configurar `SUPABASE_ORG_SLUG` y `SUPABASE_PROJECT_NAME` en `.env.local`
3. Ejecutar script de setup (próximamente)

### Seed Data

Ejecutar el script de seed para crear categorías, productos y configuración inicial:

```bash
npm run seed
```

### Crear Admin

Crear el primer usuario admin:

```bash
npm run create-admin
```

Seguir las instrucciones para ingresar email y contraseña.

### Desarrollo

Iniciar servidor de desarrollo:

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
juancito-mercado-boutique/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── contexts/         # Context providers (Cart, Admin)
│   ├── lib/              # Utilidades (Supabase client)
│   ├── pages/            # Páginas de la app
│   │   ├── admin/       # Panel de administración
│   ├── styles/           # Estilos globales y tokens
│   └── types/           # TypeScript types
├── netlify/
│   └── functions/       # Netlify Functions (API)
│       ├── public/      # Endpoints públicos
│       ├── admin/       # Endpoints admin (requieren auth)
│       └── orders/      # Endpoints de órdenes
├── supabase/
│   ├── migrations/      # Migrations de base de datos
│   └── seed/            # Scripts de seed data
└── scripts/             # Scripts utilitarios
```

## Funcionalidades

### Público

- **Home**: Hero, banners promocionales, categorías destacadas, menú del día, tablas, sucursales
- **Catálogo**: Búsqueda, filtros por categoría/tipo, ordenamiento
- **Producto**: Detalle con galería, selector de peso (weighted), agregar al carrito
- **Carrito**: Gestión de items, persistencia en localStorage
- **Checkout**: Formulario completo, validación, creación de orden, envío por WhatsApp
- **Sucursales**: Mapa y direcciones
- **FAQ**: Preguntas frecuentes

### Admin

- **Dashboard**: Estadísticas generales
- **Productos**: CRUD completo
- **Categorías**: CRUD completo
- **Promos**: Gestión de banners promocionales
- **Sucursales**: Edición de sucursales
- **Órdenes**: Visualización, cambio de estado, envío por WhatsApp
- **Contenido**: Edición de textos del sitio

## Tipos de Productos

### Standard
Productos unitarios con precio fijo.

### Weighted
Productos por peso. Requieren:
- `price_per_kg`: Precio por kilogramo
- `min_weight_g`: Peso mínimo en gramos
- `step_weight_g`: Incremento de peso

El precio se calcula: `(price_per_kg * weight_g) / 1000`

### Combo
Packs con múltiples items. Requieren:
- `combo_items`: Array de items con `product_id`, `quantity`, `weight_g` (opcional)

## Carrito y Checkout

El carrito se persiste en `localStorage` y se sincroniza con la base de datos al crear la orden.

El checkout genera un mensaje de WhatsApp con todos los detalles del pedido y abre WhatsApp Web o copia el mensaje al portapapeles según configuración.

## Deploy en Netlify

1. Conectar repositorio a Netlify
2. Configurar variables de entorno en Netlify Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NETLIFY_JWT_SECRET`
   - `VITE_SUPABASE_URL` (igual a `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (igual a `SUPABASE_ANON_KEY`)
3. Build command: `npm run build`
4. Publish directory: `dist`

## Import/Export CSV

(Próximamente) Funcionalidad para exportar e importar productos desde el panel admin.

## Notas sobre Weighted

Los productos weighted muestran el precio por kg y permiten seleccionar la cantidad en gramos. El precio total se calcula automáticamente y se guarda en el snapshot de la orden.

## Licencia

Proyecto desarrollado por Structura.
