CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE IF NOT EXISTS equipo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO equipo (nombre)
SELECT nombre
FROM (VALUES ('Pablo'), ('Diego'), ('Mónica'), ('Ángel'), ('Priscila')) AS iniciales(nombre)
WHERE NOT EXISTS (SELECT 1 FROM equipo WHERE equipo.nombre = iniciales.nombre);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  celular TEXT,
  fecha_nacimiento DATE,
  direccion TEXT,
  localidad TEXT,
  ocupacion TEXT,
  como_llego TEXT,
  talle_habitual TEXT,
  preferencias TEXT,
  notas TEXT,
  referido_por UUID REFERENCES clientes(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS medidas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_prenda TEXT NOT NULL,
  fecha_toma DATE NOT NULL DEFAULT CURRENT_DATE,
  tomadas_por UUID REFERENCES equipo(id),
  datos JSONB NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL,
  prendas JSONB NOT NULL,
  evento TEXT,
  fecha_evento DATE,
  precio DECIMAL(10,2),
  estado TEXT NOT NULL DEFAULT 'en_proceso',
  atendido_por UUID REFERENCES equipo(id),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ DEFAULT now(),
  tipo TEXT NOT NULL,
  canal TEXT NOT NULL,
  atendido_por UUID REFERENCES equipo(id),
  notas TEXT
);

CREATE TABLE IF NOT EXISTS recordatorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  fecha_envio DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  mensaje TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO configuracion (clave, valor)
VALUES
  ('dias_cumpleanos', '3'),
  ('dias_post_venta', '7'),
  ('meses_reactivacion', '6')
ON CONFLICT (clave) DO NOTHING;

ALTER TABLE equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tabla TEXT;
BEGIN
  FOREACH tabla IN ARRAY ARRAY['equipo', 'clientes', 'medidas', 'compras', 'interacciones', 'recordatorios', 'configuracion']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_authenticated_all" ON %I', tabla, tabla);
    EXECUTE format(
      'CREATE POLICY "%s_authenticated_all" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      tabla,
      tabla
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION crear_recordatorio_post_venta()
RETURNS TRIGGER AS $$
DECLARE
  dias INTEGER;
BEGIN
  IF NEW.estado = 'entregado' AND OLD.estado IS DISTINCT FROM 'entregado' THEN
    SELECT COALESCE((valor #>> '{}')::INTEGER, 7)
    INTO dias
    FROM configuracion
    WHERE clave = 'dias_post_venta';

    INSERT INTO recordatorios (cliente_id, tipo, fecha_envio, mensaje)
    VALUES (NEW.cliente_id, 'post_venta', CURRENT_DATE + COALESCE(dias, 7), 'Seguimiento post-venta');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS compras_post_venta_recordatorio ON compras;
CREATE TRIGGER compras_post_venta_recordatorio
AFTER UPDATE OF estado ON compras
FOR EACH ROW
EXECUTE FUNCTION crear_recordatorio_post_venta();
