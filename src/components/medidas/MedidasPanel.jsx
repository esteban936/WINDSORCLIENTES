import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { medidasPorPrenda, tiposPrenda } from '../../lib/medidasConfig';
import { formatDate, humanize } from '../../lib/formatters';
import { createMedidas, useMedidas } from '../../hooks/useMedidas';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function MedidasPanel({ clienteId }) {
  const { personaActiva } = useAuth();
  const [tipoPrenda, setTipoPrenda] = useState('traje');
  const [openId, setOpenId] = useState(null);
  const { medidas, loading, refetch } = useMedidas(clienteId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const datos = {};
    medidasPorPrenda[tipoPrenda].forEach((campo) => {
      const value = form.get(campo);
      if (value !== '') datos[campo] = Number(value);
    });
    await createMedidas({
      cliente_id: clienteId,
      tipo_prenda: tipoPrenda,
      tomadas_por: personaActiva?.id,
      datos,
      notas: form.get('notas') || null,
    });
    event.currentTarget.reset();
    await refetch();
  };

  return (
    <div className="space-y-5">
      <Card title="Tomar medidas">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block max-w-xs">
            <span className="label">Tipo de prenda</span>
            <select className="field mt-1" value={tipoPrenda} onChange={(event) => setTipoPrenda(event.target.value)}>
              {tiposPrenda.map((tipo) => <option key={tipo} value={tipo}>{humanize(tipo)}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {medidasPorPrenda[tipoPrenda].map((campo) => (
              <label key={campo}>
                <span className="label">{humanize(campo)} (cm)</span>
                <input className="field mt-1" name={campo} type="number" step="0.1" min="0" />
              </label>
            ))}
          </div>
          <label className="block">
            <span className="label">Observaciones del cuerpo</span>
            <textarea className="field mt-1 min-h-20" name="notas" />
          </label>
          <div className="flex justify-end">
            <Button type="submit">Guardar medidas</Button>
          </div>
        </form>
      </Card>

      <Card title="Historial de medidas">
        {loading ? <p className="text-sm text-neutral-500">Cargando medidas...</p> : null}
        <div className="space-y-3">
          {medidas.map((item) => (
            <div key={item.id} className="rounded-md border border-neutral-200">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                <span className="font-semibold">{humanize(item.tipo_prenda)} · {formatDate(item.fecha_toma)}</span>
                <span className="text-sm text-neutral-500">{item.equipo?.nombre ?? 'Sin asignar'}</span>
              </button>
              {openId === item.id && (
                <div className="border-t border-neutral-200 p-4">
                  <dl className="grid grid-cols-3 gap-3 text-sm">
                    {Object.entries(item.datos ?? {}).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-neutral-500">{humanize(key)}</dt>
                        <dd className="font-semibold">{value} cm</dd>
                      </div>
                    ))}
                  </dl>
                  {item.notas ? <p className="mt-4 text-sm text-neutral-700">{item.notas}</p> : null}
                </div>
              )}
            </div>
          ))}
          {!loading && medidas.length === 0 ? <p className="text-sm text-neutral-500">Todavía no hay medidas cargadas.</p> : null}
        </div>
      </Card>
    </div>
  );
}

