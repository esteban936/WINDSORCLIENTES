import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const emailPorNombre = {
  Esteban: 'esteban@windsor.app',
  Pablo: 'pablo@windsor.app',
  Monica: 'monica@windsor.app',
  Diego: 'diego@windsor.app',
  Karina: 'karina@windsor.app',
};

export function SeleccionPersona() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [equipo, setEquipo] = useState([]);
  const [personaId, setPersonaId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipo = async () => {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('equipo')
        .select('id, nombre, rol, auth_id')
        .not('auth_id', 'is', null)
        .order('nombre', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setEquipo([]);
      } else {
        const personas = (data ?? []).filter((persona) => emailPorNombre[persona.nombre]);
        setEquipo(personas);
        setPersonaId(personas[0]?.id ?? '');
      }

      setLoading(false);
    };

    fetchEquipo();
  }, []);

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const persona = equipo.find((item) => item.id === personaId);
    const email = persona ? emailPorNombre[persona.nombre] : null;

    if (!email) {
      setError('No encontramos el email interno para esa persona.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message ?? 'No se pudo ingresar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
        <h1 className="font-serif text-3xl font-bold">Windsor Sastrería</h1>
        <p className="mt-2 text-sm text-neutral-500">Elegí tu usuario e ingresá la contraseña.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="label">Usuario</span>
            <select
              className="field mt-1"
              value={personaId}
              onChange={(event) => setPersonaId(event.target.value)}
              required
              disabled={loading || equipo.length === 0}
            >
              {equipo.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label">Contraseña</span>
            <input
              className="field mt-1"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {loading ? <p className="rounded-md bg-neutral-100 p-3 text-sm text-neutral-600">Cargando usuarios...</p> : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={loading || saving || equipo.length === 0}>
            {saving ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </section>
    </main>
  );
}
