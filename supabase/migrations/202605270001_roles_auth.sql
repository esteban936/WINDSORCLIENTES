ALTER TABLE equipo
ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'vendedor'
CHECK (rol IN ('admin', 'vendedor'));

ALTER TABLE equipo
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);

UPDATE equipo SET nombre = 'Monica' WHERE nombre = 'Mónica';

INSERT INTO equipo (nombre, rol)
SELECT nombre, rol
FROM (VALUES
  ('Esteban', 'admin'),
  ('Karina', 'vendedor'),
  ('Monica', 'vendedor')
) AS iniciales(nombre, rol)
WHERE NOT EXISTS (SELECT 1 FROM equipo WHERE equipo.nombre = iniciales.nombre);

UPDATE equipo SET rol = 'admin' WHERE nombre IN ('Esteban', 'Pablo');

UPDATE equipo e
SET auth_id = u.id
FROM auth.users u
WHERE lower(u.email) = CASE e.nombre
  WHEN 'Esteban' THEN 'esteban@windsor.app'
  WHEN 'Pablo' THEN 'pablo@windsor.app'
  WHEN 'Monica' THEN 'monica@windsor.app'
  WHEN 'Diego' THEN 'diego@windsor.app'
  WHEN 'Karina' THEN 'karina@windsor.app'
  ELSE lower(e.nombre || '@windsor.app')
END;

CREATE OR REPLACE FUNCTION public.usuario_actual_es_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.equipo
    WHERE auth_id = auth.uid()
      AND rol = 'admin'
      AND activo = true
  );
$$;

DO $$
DECLARE
  tabla TEXT;
BEGIN
  FOREACH tabla IN ARRAY ARRAY['equipo', 'clientes', 'medidas', 'compras', 'interacciones', 'recordatorios', 'configuracion']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_authenticated_all" ON %I', tabla, tabla);
    EXECUTE format('DROP POLICY IF EXISTS "%s_authenticated_select" ON %I', tabla, tabla);
    EXECUTE format('DROP POLICY IF EXISTS "%s_authenticated_insert" ON %I', tabla, tabla);
    EXECUTE format('DROP POLICY IF EXISTS "%s_authenticated_update" ON %I', tabla, tabla);
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_delete" ON %I', tabla, tabla);
    EXECUTE format('DROP POLICY IF EXISTS "%s_anon_login_select" ON %I', tabla, tabla);

    EXECUTE format(
      'CREATE POLICY "%s_authenticated_select" ON %I FOR SELECT TO authenticated USING (true)',
      tabla,
      tabla
    );
    EXECUTE format(
      'CREATE POLICY "%s_authenticated_insert" ON %I FOR INSERT TO authenticated WITH CHECK (true)',
      tabla,
      tabla
    );
    EXECUTE format(
      'CREATE POLICY "%s_authenticated_update" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
      tabla,
      tabla
    );
    EXECUTE format(
      'CREATE POLICY "%s_admin_delete" ON %I FOR DELETE TO authenticated USING (public.usuario_actual_es_admin())',
      tabla,
      tabla
    );
  END LOOP;
END $$;

CREATE POLICY "equipo_anon_login_select"
ON equipo
FOR SELECT
TO anon
USING (auth_id IS NOT NULL AND activo = true);
