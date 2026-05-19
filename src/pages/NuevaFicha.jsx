import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveCliente } from '../hooks/useClientes';
import { ClienteForm } from '../components/clientes/ClienteForm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function NuevaFicha() {
  const { personaActiva } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload, action) => {
    setError('');
    setSaving(true);
    try {
      const cliente = await saveCliente({ ...payload, created_by: personaActiva?.id });
      navigate(`/clientes/${cliente.id}${action === 'measures' ? '?tab=medidas' : ''}`);
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar la ficha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-3xl font-bold">Nueva ficha</h1>
      <Card>
        {error ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {saving ? <p className="mb-4 rounded-md bg-neutral-100 p-3 text-sm text-neutral-600">Guardando ficha...</p> : null}
        <ClienteForm
          onSubmit={handleSubmit}
          submitLabel="Guardar ficha"
          extraAction={<Button type="submit" value="measures" variant="gold">Guardar y tomar medidas</Button>}
        />
      </Card>
    </div>
  );
}
