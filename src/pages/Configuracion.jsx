import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useEquipo } from '../hooks/useEquipo';
import { supabase } from '../lib/supabase';

const defaults = {
  dias_cumpleanos: 3,
  dias_post_venta: 7,
  meses_reactivacion: 6,
};

export function Configuracion() {
  const { equipo, refetch } = useEquipo(false);
  const [config, setConfig] = useState(defaults);

  useEffect(() => {
    supabase.from('configuracion').select('*').then(({ data }) => {
      const next = { ...defaults };
      (data ?? []).forEach((row) => {
        next[row.clave] = Number(row.valor);
      });
      setConfig(next);
    });
  }, []);

  const addPersona = async (event) => {
    event.preventDefault();
    const nombre = new FormData(event.currentTarget).get('nombre');
    await supabase.from('equipo').insert({ nombre });
    event.currentTarget.reset();
    await refetch();
  };

  const togglePersona = async (persona) => {
    await supabase.from('equipo').update({ activo: !persona.activo }).eq('id', persona.id);
    await refetch();
  };

  const saveConfig = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await Promise.all(Object.keys(defaults).map((clave) =>
      supabase.from('configuracion').upsert({ clave, valor: Number(form.get(clave)), updated_at: new Date().toISOString() })
    ));
  };

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-3xl font-bold">Configuración</h1>
      <div className="grid grid-cols-2 gap-5">
        <Card title="Equipo">
          <form onSubmit={addPersona} className="mb-5 flex gap-3">
            <input className="field" name="nombre" placeholder="Nombre" required />
            <Button type="submit">Agregar</Button>
          </form>
          <div className="space-y-2">
            {equipo.map((persona) => (
              <div key={persona.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3">
                <span className="font-semibold">{persona.nombre}</span>
                <Button variant={persona.activo ? 'secondary' : 'gold'} onClick={() => togglePersona(persona)}>
                  {persona.activo ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Recordatorios">
          <form onSubmit={saveConfig} className="space-y-4">
            <label className="block">
              <span className="label">Días de anticipación para cumpleaños</span>
              <input className="field mt-1" name="dias_cumpleanos" type="number" min="0" defaultValue={config.dias_cumpleanos} />
            </label>
            <label className="block">
              <span className="label">Días post-venta para seguimiento</span>
              <input className="field mt-1" name="dias_post_venta" type="number" min="1" defaultValue={config.dias_post_venta} />
            </label>
            <label className="block">
              <span className="label">Meses de inactividad para reactivación</span>
              <input className="field mt-1" name="meses_reactivacion" type="number" min="1" defaultValue={config.meses_reactivacion} />
            </label>
            <Button type="submit">Guardar parámetros</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
