import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { CompraForm } from '../components/compras/CompraForm';
import { MedidasPanel } from '../components/medidas/MedidasPanel';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { getCliente, saveCliente } from '../hooks/useClientes';
import { createInteraccion, useInteracciones } from '../hooks/useInteracciones';
import { updateCompraEstado, useCompras } from '../hooks/useCompras';
import { formatDate, formatDateTime, humanize, summarizePrendas } from '../lib/formatters';

const tabs = ['datos', 'medidas', 'compras', 'interacciones'];

export function FichaCliente() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { personaActiva } = useAuth();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalCompra, setModalCompra] = useState(false);
  const activeTab = tabs.includes(params.get('tab')) ? params.get('tab') : 'datos';

  const { compras, refetch: refetchCompras } = useCompras(id);
  const { interacciones, refetch: refetchInteracciones } = useInteracciones(id);

  useEffect(() => {
    getCliente(id).then(setCliente).finally(() => setLoading(false));
  }, [id]);

  const title = useMemo(() => cliente?.nombre ?? 'Ficha de cliente', [cliente]);

  if (loading) return <p className="text-sm text-neutral-500">Cargando ficha...</p>;
  if (!cliente) return <p>No se encontró el cliente.</p>;

  const setTab = (tab) => setParams({ tab });

  const saveDatos = async (payload) => {
    const updated = await saveCliente(payload, id);
    setCliente(updated);
  };

  const addInteraccion = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createInteraccion({
      cliente_id: id,
      tipo: form.get('tipo'),
      canal: form.get('canal'),
      atendido_por: personaActiva?.id,
      notas: form.get('notas') || null,
    });
    event.currentTarget.reset();
    await refetchInteracciones();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">{title}</h1>
          <p className="text-sm text-neutral-500">{cliente.celular || cliente.email || 'Sin datos de contacto'}</p>
        </div>
        <Button variant="gold" onClick={() => navigate(`/compras/nueva?cliente_id=${id}`)}>
          <Plus size={16} /> Nueva compra
        </Button>
      </div>
      <div className="border-b border-neutral-200">
        {tabs.map((tab) => (
          <button key={tab} className={`tab-button ${activeTab === tab ? 'tab-button-active' : ''}`} onClick={() => setTab(tab)}>
            {humanize(tab)}
          </button>
        ))}
      </div>

      {activeTab === 'datos' && (
        <Card title="Datos personales">
          <ClienteForm value={cliente} onSubmit={saveDatos} />
        </Card>
      )}

      {activeTab === 'medidas' && <MedidasPanel clienteId={id} />}

      {activeTab === 'compras' && (
        <Card
          title="Compras"
          action={<Button variant="secondary" onClick={() => setModalCompra(true)}><Plus size={16} /> Nueva compra</Button>}
        >
          <div className="space-y-3">
            {compras.map((compra) => (
              <div key={compra.id} className="rounded-md border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{formatDate(compra.fecha)} · {humanize(compra.tipo)}</div>
                    <div className="text-sm text-neutral-600">{summarizePrendas(compra.prendas)}</div>
                    <div className="mt-2 text-sm text-neutral-500">
                      {compra.evento ? `${humanize(compra.evento)} · ${formatDate(compra.fecha_evento)}` : 'Sin evento'} · Atiende {compra.equipo?.nombre ?? '-'}
                    </div>
                    {compra.notas ? <p className="mt-2 text-sm">{compra.notas}</p> : null}
                  </div>
                  <select
                    className="field w-44"
                    value={compra.estado}
                    onChange={async (event) => {
                      await updateCompraEstado(compra.id, event.target.value);
                      await refetchCompras();
                    }}
                  >
                    <option value="en_proceso">En proceso</option>
                    <option value="listo">Listo</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            ))}
            {compras.length === 0 ? <p className="text-sm text-neutral-500">Todavía no hay compras registradas.</p> : null}
          </div>
        </Card>
      )}

      {activeTab === 'interacciones' && (
        <div className="grid grid-cols-[360px_1fr] gap-5">
          <Card title="Registrar interacción">
            <form onSubmit={addInteraccion} className="space-y-4">
              <label className="block">
                <span className="label">Tipo</span>
                <select className="field mt-1" name="tipo" required>
                  <option value="visita">Visita</option>
                  <option value="consulta">Consulta</option>
                  <option value="prueba">Prueba</option>
                  <option value="entrega">Entrega</option>
                  <option value="reclamo">Reclamo</option>
                  <option value="seguimiento">Seguimiento</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Canal</span>
                <select className="field mt-1" name="canal" required>
                  <option value="presencial">Presencial</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="telefono">Teléfono</option>
                  <option value="instagram">Instagram</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Notas</span>
                <textarea className="field mt-1 min-h-28" name="notas" />
              </label>
              <Button type="submit" className="w-full">Registrar interacción</Button>
            </form>
          </Card>
          <Card title="Timeline">
            <div className="space-y-4">
              {interacciones.map((item) => (
                <div key={item.id} className="border-l-2 border-champagne pl-4">
                  <div className="font-semibold">{humanize(item.tipo)} · {humanize(item.canal)}</div>
                  <div className="text-sm text-neutral-500">{formatDateTime(item.fecha)} · {item.equipo?.nombre ?? '-'}</div>
                  {item.notas ? <p className="mt-1 text-sm">{item.notas}</p> : null}
                </div>
              ))}
              {interacciones.length === 0 ? <p className="text-sm text-neutral-500">Todavía no hay interacciones.</p> : null}
            </div>
          </Card>
        </div>
      )}

      {modalCompra ? (
        <Modal title="Nueva compra" onClose={() => setModalCompra(false)}>
          <CompraForm
            clienteId={id}
            onSaved={async (_compra, tomarMedidas) => {
              setModalCompra(false);
              await refetchCompras();
              if (tomarMedidas) setTab('medidas');
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
}

