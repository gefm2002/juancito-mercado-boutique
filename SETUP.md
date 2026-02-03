# Setup Completado ✅

## Lo que ya está hecho:

1. ✅ **Repositorio GitHub creado**: https://github.com/gefm2002/juancito-mercado-boutique
2. ✅ **Proyecto Supabase creado**: `juancito-mercado-boutique` (ID: oseeysmiwfdhpizzeota)
3. ✅ **Credenciales configuradas**: `.env.local` actualizado con todas las keys
4. ✅ **Código subido a GitHub**: Todo el proyecto está en el repo

## Próximos pasos:

### 1. Aplicar Migrations (OBLIGATORIO)

Las migrations deben ejecutarse manualmente desde el SQL Editor de Supabase:

**Opción A: SQL Editor (Recomendado)**
1. Ve a https://supabase.com/dashboard
2. Selecciona el proyecto: **juancito-mercado-boutique**
3. Ve a **SQL Editor** (menú lateral izquierdo)
4. Crea una nueva query
5. Copia TODO el contenido de `supabase/migrations/001_init.sql`
6. Pega en el editor
7. Haz clic en **Run** o presiona `Cmd/Ctrl + Enter`
8. Verifica que no haya errores

**Opción B: Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref oseeysmiwfdhpizzeota
supabase db push
```

### 2. Ejecutar Seed Data

Una vez aplicadas las migrations:

```bash
npm run seed
```

Esto creará:
- 11 categorías
- ~100 productos (empanadas, sandwiches, tablas, fiambres, quesos, etc.)
- Configuración del sitio
- Promos iniciales

### 3. Crear Usuario Admin

```bash
npm run create-admin
```

Sigue las instrucciones para ingresar email y contraseña.

### 4. Iniciar Desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Credenciales Configuradas

Todas las credenciales están en `.env.local`:

- `SUPABASE_URL`: https://oseeysmiwfdhpizzeota.supabase.co
- `SUPABASE_ANON_KEY`: Configurada
- `SUPABASE_SERVICE_ROLE_KEY`: Configurada
- `VITE_SUPABASE_URL`: Configurada
- `VITE_SUPABASE_ANON_KEY`: Configurada

## Estructura del Proyecto

```
juancito-mercado-boutique/
├── src/                    # Código fuente React
├── netlify/functions/      # Netlify Functions (API)
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── seed/              # Script de seed data
└── scripts/               # Scripts utilitarios
```

## URLs Importantes

- **GitHub**: https://github.com/gefm2002/juancito-mercado-boutique
- **Supabase Dashboard**: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota
- **Supabase API**: https://oseeysmiwfdhpizzeota.supabase.co

## Notas

- El proyecto está listo para deploy en Netlify
- Las variables de entorno para Netlify deben configurarse en el dashboard
- El carrito se persiste en localStorage
- Las órdenes se crean vía Netlify Functions y se envían por WhatsApp

## Soporte

Si hay algún problema:
1. Verifica que las migrations se aplicaron correctamente
2. Revisa los logs en la consola
3. Verifica las credenciales en `.env.local`
