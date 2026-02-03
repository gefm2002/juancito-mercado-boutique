# ⚠️ IMPORTANTE: Crear las Tablas

Las tablas **NO se crearon automáticamente** porque Supabase por seguridad no permite ejecutar DDL (CREATE TABLE) desde la API REST.

## ✅ Solución Rápida (2 minutos)

### Opción 1: SQL Editor (Recomendado)

1. **Abre el SQL Editor:**
   - Ve a: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota/sql/new
   - O ve a Dashboard > SQL Editor > New Query

2. **Copia el SQL:**
   - Abre el archivo: `supabase/migrations/001_init.sql`
   - Selecciona TODO el contenido (Cmd/Ctrl + A)
   - Copia (Cmd/Ctrl + C)

3. **Pega y ejecuta:**
   - Pega en el SQL Editor
   - Haz clic en **"Run"** o presiona **Cmd/Ctrl + Enter**
   - Espera a que termine (debería decir "Success")

4. **Verifica:**
   - Ve a **Table Editor** en el menú lateral
   - Deberías ver las tablas: `juancito_categories`, `juancito_products`, etc.

### Opción 2: Usar el archivo helper

1. Abre `migration-helper.html` en tu navegador
2. Haz clic en "Copiar SQL"
3. Ve al SQL Editor y pega

## 🚀 Después de crear las tablas

Una vez creadas las tablas, ejecuta:

```bash
npm run seed
```

Esto creará todos los productos, categorías y configuración inicial.

Luego crea un admin:

```bash
npm run create-admin
```

## ❓ ¿Por qué no se crearon automáticamente?

Supabase por diseño de seguridad **no permite ejecutar DDL** (CREATE TABLE, ALTER TABLE, etc.) desde:
- La API REST pública
- El cliente JavaScript
- Las Netlify Functions

Solo se puede ejecutar desde:
- El SQL Editor (interfaz web)
- Supabase CLI (requiere instalación manual)
- Connection string directa de PostgreSQL (requiere password de DB)

Por eso es necesario ejecutarlo manualmente una sola vez.
