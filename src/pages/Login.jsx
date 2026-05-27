import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const USUARIOS = [
  { nombre: 'Esteban', email: 'esteban@windsor.app' },
  { nombre: 'Pablo', email: 'pablo@windsor.app' },
  { nombre: 'Monica', email: 'monica@windsor.app' },
  { nombre: 'Diego', email: 'diego@windsor.app' },
  { nombre: 'Karina', email: 'karina@windsor.app' },
];

export function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(USUARIOS[0].email);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message ?? 'No se pudo ingresar.');
    } finally {
      setLoading(false);
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            >
              {USUARIOS.map((usuario) => (
                <option key={usuario.email} value={usuario.email}>
                  {usuario.nombre}
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

          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </section>
    </main>
  );
}
