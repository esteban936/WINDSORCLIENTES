import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDashboardData } from '../hooks/useDashboardData';
import { useClientes } from '../hooks/useClientes';
import { ageOnNextBirthday, formatDate, formatDateTime, humanize, summarizePrendas } from '../lib/formatters';

export function Dashboard() {
  const { data, loading } = useDashboardData();
  const [search, setSearch] = useState('');
  const { clientes } = useClientes(search);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-neutral-500">Resumen operativo del local.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/clientes/nuevo')}>Nueva ficha</Button>
          <Button variant="secondary" onClick={() => navigate('/clientes')}>Buscar cliente</Button>
          <Button variant="gold" onClick={() => navigate('/compras/nueva')}>Registrar compra</Button>
        </div>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
          <input className="field pl-10 text-base" placeholder="Buscar cliente por nombre, celular o email" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        {search ? (
          <div className="mt-3 divide-y divide-neutral-100">
            {clientes.slice(0, 6).map((cliente) => (
              <button key={cliente.id} className="flex w-full justify-between py-3 text-left hover:text-champagne" onClick={() => navigate(`/clientes/${cliente.id}`)}>
                <span className="font-semibold">{cliente.nombre}</span>
                <span className="text-sm text-neutral-500">{cliente.celular || cliente.email || 'Sin contacto'}</span>
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <Card title="Hoy">
          {loading ? <p>Cargando...</p> : (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-neutral-100 p-4">
                <div className="text-3xl font-bold">{data.clientesHoy}</div>
                <div className="text-sm text-neutral-500">Clientes atendidos hoy</div>
              </div>
              <div className="rounded-md bg-neutral-100 p-4">
                <div className="text-3xl font-bold">{data.fichasHoy}</div>
                <div className="text-sm text-neutral-500">Fichas nuevas creadas hoy</div>
              </div>
            </div>
          )}
        </Card>
        <Card title="Pendientes">
          <div className="space-y-3">
            {data.pendientes.map((compra) => (
              <Link key={compra.id} className="block rounded-md border border-neutral-200 p-3 hover:border-champagne" to={`/clientes/${compra.cliente_id}?tab=compras`}>
                <div className="font-semibold">{compra.clientes?.nombre}</div>
                <div className="text-sm text-neutral-500">{summarizePrendas(compra.prendas)}</div>
              </Link>
            ))}
            {!data.pendientes.length ? <p className="text-sm text-neutral-500">No hay entregas listas pendientes.</p> : null}
          </div>
        </Card>
      </div>

      <Card title="Alertas">
        <div className="grid grid-cols-3 gap-5 text-sm">
          <div>
            <h3 className="mb-3 font-semibold">Cumpleaños próximos</h3>
            {data.cumpleanos.map((cliente) => (
              <p key={cliente.id} className="mb-2">{cliente.nombre} · {formatDate(cliente.fecha_nacimiento)} · {ageOnNextBirthday(cliente.fecha_nacimiento)} años</p>
            ))}
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Sin contacto en 6 meses</h3>
            {data.sinContacto.map((cliente) => (
              <p key={cliente.id} className="mb-2">{cliente.nombre} · {cliente.ultima ? formatDateTime(cliente.ultima) : 'Sin interacción'}</p>
            ))}
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Eventos próximos</h3>
            {data.eventos.map((compra) => (
              <p key={compra.id} className="mb-2">{compra.clientes?.nombre} · {humanize(compra.evento ?? 'evento')} · {formatDate(compra.fecha_evento)}</p>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

