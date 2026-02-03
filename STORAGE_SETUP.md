# 📦 Configuración de Storage (Imágenes)

## ✅ Bucket Creado

El bucket `juancito_product_images` ya fue creado.

## ⚠️ Aplicar Políticas RLS

Las políticas RLS para el bucket deben aplicarse manualmente:

1. **Ve al SQL Editor:**
   - https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota/sql/new

2. **Copia y ejecuta el SQL:**
   - Archivo: `supabase/migrations/002_storage.sql`
   - Contenido:
   ```sql
   -- Política: Lectura pública de imágenes
   CREATE POLICY "Public read product images"
   ON storage.objects
   FOR SELECT
   USING (bucket_id = 'juancito_product_images');
   ```

3. **Ejecuta el query** (Cmd/Ctrl + Enter)

## 🔧 Funciones Disponibles

### `/api/admin/images/sign-upload`
Genera una signed URL para subir imágenes.

**Request:**
```json
{
  "filename": "producto.jpg",
  "contentType": "image/jpeg"
}
```

**Response:**
```json
{
  "signedUrl": "https://...",
  "token": "...",
  "path": "1234567890-abc123.jpg",
  "publicUrl": "https://..."
}
```

### `/api/admin/images/delete`
Elimina una imagen del storage.

**Request:**
```json
{
  "path": "1234567890-abc123.jpg"
}
```

## 📝 Uso en el Admin

Las funciones están listas para usar en el panel admin. Solo necesitas:

1. Aplicar las políticas RLS (paso arriba)
2. Usar las funciones desde el frontend admin para subir/eliminar imágenes

## ✅ Verificar

Para verificar que el bucket existe:
1. Ve a: https://supabase.com/dashboard/project/oseeysmiwfdhpizzeota/storage/buckets
2. Deberías ver `juancito_product_images` en la lista
