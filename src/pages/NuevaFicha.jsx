import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveCliente } from '../hooks/useClientes';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function NuevaFicha() {
  const { personaActiva } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (payload, action) => {
    const cliente = await saveCliente({ ...payload, created_by: personaActiva?.id });
    navigate(`/clientes/${cliente.id}${action === 'measures' ? '?tab=medidas' : ''}`);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-3xl font-bold">Nueva ficha</h1>
      <Card>
        <ClienteForm
          onSubmit={handleSubmit}
          submitLabel="Guardar ficha"
          extraAction={<Button type="submit" value="measures" variant="gold">Guardar y tomar medidas</Button>}
        />
      </Card>
    </div>
  );
}
