import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useClientes } from '../hooks/useClientes';
import { formatDateTime } from '../lib/formatters';

export function ListaClientes() {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [meses, setMeses] = useState('');
  const { clientes, loading } = useClientes(search);

  const filtered = useMemo(() => {
    const corte = meses ? new Date() : null;
    if (corte) corte.setMonth(corte.getMonth() - Number(meses));
    return clientes.filter((cliente) => {
      const activa = (cliente.compras ?? []).some((compra) => compra.estado === estado);
      const ultima = (cliente.interacciones ?? []).map((item) => item.fecha).sort().at(-1);
      const sinContacto = corte ? !ultima || new Date(ultima) < corte : true;
      return (!estado || activa) && sinContacto;
    });
  }, [clientes, estado, meses]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Clientes</h1>
        <Link to="/clientes/nuevo" className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">Nueva ficha</Link>
      </div>
      <Card>
        <div className="grid grid-cols-[1fr_220px_220px] gap-4">
          <input className="field" placeholder="Buscar por nombre, celular o email" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="field" value={estado} onChange={(event) => setEstado(event.target.value)}>
            <option value="">Estado compra activa</option>
            <option value="en_proceso">En proceso</option>
            <option value="listo">Listo</option>
          </select>
          <select className="field" value={meses} onChange={(event) => setMeses(event.target.value)}>
            <option value="">Contacto: todos</option>
            <option value="3">Sin contacto en 3 meses</option>
            <option value="6">Sin contacto en 6 meses</option>
            <option value="12">Sin contacto en 12 meses</option>
          </select>
        </div>
      </Card>
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
            <tr>
              <th className="py-3">Nombre</th>
              <th>Celular</th>
              <th>Email</th>
              <th>Última visita</th>
              <th>Compras activas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((cliente) => {
              const ultima = (cliente.interacciones ?? []).map((item) => item.fecha).sort().at(-1);
              const activas = (cliente.compras ?? []).filter((compra) => ['en_proceso', 'listo'].includes(compra.estado)).length;
              return (
                <tr key={cliente.id} className="hover:bg-neutral-50">
                  <td className="py-3 font-semibold"><Link to={`/clientes/${cliente.id}`}>{cliente.nombre}</Link></td>
                  <td>{cliente.celular ?? '-'}</td>
                  <td>{cliente.email ?? '-'}</td>
                  <td>{ultima ? formatDateTime(ultima) : '-'}</td>
                  <td>{activas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 ? <p className="py-6 text-center text-sm text-neutral-500">No hay clientes para esos filtros.</p> : null}
      </Card>
    </div>
  );
}
