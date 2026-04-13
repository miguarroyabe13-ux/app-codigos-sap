-- Ejecutar esto en el SQL Editor de Supabase
CREATE TABLE IF NOT EXISTS solicitudes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL, -- 'referencia', 'cero', 'kit', 'modificacion'
  sku_referencia text, -- Nro de artículo base (para modificación o referencia)
  color_codigo text, -- Código de color
  version_codigo text, -- Código de versión
  kit_articulos jsonb, -- Array de artículos del kit [{SKU, DESCRIPCION}]
  kit_nombre text, -- Nombre del kit
  nueva_descripcion text, -- Para modificación
  comentarios text, -- Observaciones dadas por el usuario
  estado text NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADO, RECHAZADO, EN REVISIÓN
  usuario_email text, -- Quién la creó
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Opcional: Desactivar RLS por ahora si es una app interna sin políticas complejas
ALTER TABLE solicitudes DISABLE ROW LEVEL SECURITY;
