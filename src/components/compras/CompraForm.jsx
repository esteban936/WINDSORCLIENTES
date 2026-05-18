import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createCompra } from '../../hooks/useCompras';
import { useClientes } from '../../hooks/useClientes';
import { today } from '../../lib/formatters';
import { Button } from '../ui/Button';

export function CompraForm({ clienteId, onSaved }) {
  const { personaActiva } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(clienteId ?? '');
  const [prendas, setPrendas] = useState([{ prenda: 'traje', detalle: '' }]);
  const { clientes } = useClientes(clienteId ? '' : search);

  const clienteOptions = useMemo(() => clientes.slice(0, 8), [clientes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const saved = await createCompra({
      cliente_id: clienteId ?? selectedCliente,
      fecha: form.get('fecha'),
      tipo: form.get('tipo'),
      prendas: prendas.filter((item) => item.prenda),
      evento: form.get('evento') || null,
      fecha_evento: form.get('fecha_evento') || null,
      precio: form.get('precio') || null,
      estado: 'en_proceso',
      atendido_por: personaActiva?.id,
      notas: form.get('notas') || null,
    });
    onSaved?.(saved, window.confirm('¿Querés tomar medidas ahora?'));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!clienteId && (
        <div>
          <span className="label">Cliente *</span>
          <input className="field mt-1" placeholder="Buscar por nombre, celular o email" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="field mt-2" value={selectedCliente} onChange={(event) => setSelectedCliente(event.target.value)} required>
            <option value="">Seleccionar cliente</option>
            {clienteOptions.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <label>
          <span className="label">Fecha</span>
          <input className="field mt-1" name="fecha" type="date" defaultValue={today()} required />
        </label>
        <label>
          <span className="label">Tipo</span>
          <select className="field mt-1" name="tipo" required>
            <option value="a_medida">A medida</option>
            <option value="ready_to_wear">Ready to wear</option>
            <option value="alquiler">Alquiler</option>
            <option value="arreglo">Arreglo</option>
          </select>
        </label>
        <label>
          <span className="label">Precio</span>
          <input className="field mt-1" name="precio" type="number" step="0.01" min="0" />
        </label>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="label">Prendas</span>
          <Button type="button" variant="secondary" onClick={() => setPrendas([...prendas, { prenda: 'traje', detalle: '' }])}>
            <Plus size={16} /> Agregar
          </Button>
        </div>
        {prendas.map((item, index) => (
          <div className="grid grid-cols-[180px_1fr_44px] gap-3" key={index}>
            <select
              className="field"
              value={item.prenda}
              onChange={(event) => setPrendas(prendas.map((row, i) => (i === index ? { ...row, prenda: event.target.value } : row)))}
            >
              {['traje', 'saco', 'camisa', 'pantalon', 'chaleco', 'sobretodo', 'smoking'].map((prenda) => (
                <option key={prenda} value={prenda}>{prenda}</option>
              ))}
            </select>
            <input
              className="field"
              placeholder="Detalle"
              value={item.detalle}
              onChange={(event) => setPrendas(prendas.map((row, i) => (i === index ? { ...row, detalle: event.target.value } : row)))}
            />
            <Button type="button" variant="ghost" className="px-2" onClick={() => setPrendas(prendas.filter((_, i) => i !== index))} aria-label="Quitar prenda">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label>
          <span className="label">Evento</span>
          <select className="field mt-1" name="evento">
            <option value="">Sin evento</option>
            <option value="casamiento">Casamiento</option>
            <option value="graduacion">Graduación</option>
            <option value="laboral">Laboral</option>
            <option value="fiesta">Fiesta</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label>
          <span className="label">Fecha de evento</span>
          <input className="field mt-1" name="fecha_evento" type="date" />
        </label>
      </div>
      <label className="block">
        <span className="label">Notas</span>
        <textarea className="field mt-1 min-h-20" name="notas" />
      </label>
      <div className="flex justify-end">
        <Button type="submit">Guardar compra</Button>
      </div>
    </form>
  );
}

