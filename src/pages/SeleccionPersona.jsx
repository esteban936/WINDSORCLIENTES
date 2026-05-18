import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEquipo } from '../hooks/useEquipo';
import { Button } from '../components/ui/Button';

export function SeleccionPersona() {
  const { session, setPersonaActiva } = useAuth();
  const { equipo, loading } = useEquipo(true);
  const navigate = useNavigate();

  if (!session) return <Navigate to="/login" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-6">
      <section className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-soft">
        <h1 className="font-serif text-3xl font-bold">¿Quién atiende?</h1>
        <p className="mt-2 text-sm text-neutral-500">Elegí tu nombre para asociar las acciones de esta sesión.</p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {loading ? <p>Cargando equipo...</p> : null}
          {equipo.map((persona) => (
            <button
              key={persona.id}
              className="rounded-lg border border-neutral-200 bg-white px-5 py-6 text-xl font-semibold shadow-sm transition hover:border-champagne hover:bg-neutral-50"
              onClick={() => {
                setPersonaActiva(persona);
                navigate('/');
              }}
            >
              {persona.nombre}
            </button>
          ))}
        </div>
        <Button variant="ghost" className="mt-6" onClick={() => navigate('/login')}>Volver</Button>
      </section>
    </main>
  );
}

