import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function Login() {
  const { session, signIn, demoMode } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/seleccion-persona" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await signIn(form.get('email'), form.get('password'));
      navigate('/seleccion-persona');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
        <h1 className="font-serif text-3xl font-bold">Windsor Sastrería</h1>
        <p className="mt-2 text-sm text-neutral-500">{demoMode ? 'Modo demo activo: podés ingresar sin cuenta.' : 'Ingresá con la cuenta del local.'}</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="label">Email</span>
            <input className="field mt-1" type="email" name="email" autoComplete="email" required={!demoMode} defaultValue={demoMode ? 'demo@windsor.local' : ''} />
          </label>
          <label className="block">
            <span className="label">Contraseña</span>
            <input className="field mt-1" type="password" name="password" autoComplete="current-password" required={!demoMode} defaultValue={demoMode ? 'demo' : ''} />
          </label>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Ingresando...' : (demoMode ? 'Entrar a la demo' : 'Ingresar')}</Button>
        </form>
      </section>
    </main>
  );
}
