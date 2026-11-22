-- Ejecutar una vez en Supabase -> SQL Editor.
-- Permite guardar varias opciones de discapacidad por producto.

alter table public.productos_parkinson
  add column if not exists tipo_discapacidad text[];

alter table public.productos_parkinson
  alter column tipo_discapacidad set default array['Parkinson']::text[];

update public.productos_parkinson
set tipo_discapacidad = array['Parkinson']::text[]
where tipo_discapacidad is null;
