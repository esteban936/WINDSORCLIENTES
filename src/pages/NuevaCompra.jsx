import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { CompraForm } from '../components/compras/CompraForm';

export function NuevaCompra() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const clienteId = params.get('cliente_id');

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-3xl font-bold">Registrar compra</h1>
      <Card>
        <CompraForm
          clienteId={clienteId}
          onSaved={(compra, tomarMedidas) => navigate(`/clientes/${compra.cliente_id}${tomarMedidas ? '?tab=medidas' : '?tab=compras'}`)}
        />
      </Card>
    </div>
  );
}

