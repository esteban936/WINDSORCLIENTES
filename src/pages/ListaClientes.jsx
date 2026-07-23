import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useClientes } from '../hooks/useClientes';
import { formatDateTime } from '../lib/formatters';

function descargarCSV(clientes) {
  const filas = [
    ['Nombre', 'Email', 'Celular', 'Fecha de alta'],
    ...clientes.map((c) => [
      c.nombre ?? '',
      c.email ?? '',
      c.celular ?? '',
      c.created_at ? new Date(c.created_at).toLocaleDateString('es-AR') : '',
    ]),
  ];
  const csv = filas.map((fila) => fila.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clientes-windsor.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function ListaClientes() {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [meses, setMeses] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [orden, setOrden] = useState({ campo: 'nombre', dir: 'asc' });
  const { clientes, loading } = useClientes(search);

  const filtered = useMemo(() => {
    const corte = meses ? new Date() : null;
    if (corte) corte.setMonth(corte.getMonth() - Number(meses));

    const desdeTime = desde ? new Date(desde + 'T00:00:00').getTime() : null;
    const hastaTime = hasta ? new Date(hasta + 'T23:59:59').getTime() : null;

    const resultado = clientes.filter((cliente) => {
      const activa = (cliente.compras ?? []).some((compra) => compra.estado === estado);
      const ultima = (cliente.interacciones ?? []).map((item) => item.fecha).sort().at(-1);
      const sinContacto = corte ? !ultima || new Date(ultima) < corte : true;

      // Filtro por rango de fecha de alta (created_at)
      const alta = cliente.created_at ? new Date(cliente.created_at).getTime() : null;
      const dentroDesde = desdeTime ? alta !== null && alta >= desdeTime : true;
      const dentroHasta = hastaTime ? alta !== null && alta <= hastaTime : true;

      return (!estado || activa) && sinContacto && dentroDesde && dentroHasta;
    });

    // Ordenamiento
    const orillados = [...resultado].sort((a, b) => {
      if (orden.campo === 'created_at') {
        const va = a.created_at ? new Date(a.created_at).getTime() : 0;
        const vb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return orden.dir === 'asc' ? va - vb : vb - va;
      }
      // nombre
      const na = (a.nombre ?? '').toLowerCase();
      const nb = (b.nombre ?? '').toLowerCase();
      const cmp = na.localeCompare(nb, 'es');
      return orden.dir === 'asc' ? cmp : -cmp;
    });

    return orillados;
  }, [clientes, estado, meses, desde, hasta, orden]);

  const toggleOrden = (campo) => {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { campo, dir: 'asc' }
    );
  };

  const flecha = (campo) => (orden.campo === campo ? (orden.dir === 'asc' ? ' ↑' : ' ↓') : '');

  const limpiarRango = () => {
    setDesde('');
    setHasta('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Clientes</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => descargarCSV(filtered)}>Descargar CSV</Button>
          <Link to="/clientes/nuevo" className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">Nueva ficha</Link>
        </div>
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
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs uppercase text-neutral-500">Alta desde</label>
            <input type="date" className="field" value={desde} onChange={(event) => setDesde(event.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs uppercase text-neutral-500">Alta hasta</label>
            <input type="date" className="field" value={hasta} onChange={(event) => setHasta(event.target.value)} />
          </div>
          {(desde || hasta) ? (
            <Button variant="secondary" onClick={limpiarRango}>Limpiar rango</Button>
          ) : null}
          <span className="ml-auto self-center text-sm text-neutral-500">{filtered.length} cliente(s)</span>
        </div>
      </Card>
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
            <tr>
              <th className="py-3">
                <button type="button" className="uppercase hover:text-ink" onClick={() => toggleOrden('nombre')}>
                  Nombre{flecha('nombre')}
                </button>
              </th>
              <th>Celular</th>
              <th>Email</th>
              <th>
                <button type="button" className="uppercase hover:text-ink" onClick={() => toggleOrden('created_at')}>
                  Alta{flecha('created_at')}
                </button>
              </th>
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
                  <td>{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('es-AR') : '-'}</td>
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
