-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'juancito_product_images',
  'juancito_product_images',
  true,
  1572864, -- 1.5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política: Lectura pública de imágenes
CREATE POLICY "Public read product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'juancito_product_images');

-- Política: Solo admins pueden subir imágenes (vía service role en functions)
-- No hay policy pública para INSERT, solo vía service role

-- Política: Solo admins pueden eliminar imágenes (vía service role en functions)
-- No hay policy pública para DELETE, solo vía service role
