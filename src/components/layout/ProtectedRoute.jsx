import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ requirePerson = true }) {
  const { session, usuario, loading, authError, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-sm text-neutral-500">Cargando...</div>;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-6">
        <section className="max-w-lg rounded-lg bg-white p-6 shadow-soft">
          <h1 className="font-serif text-2xl font-bold">No pudimos cargar tu usuario</h1>
          <p className="mt-3 text-sm text-neutral-600">{authError}</p>
          <button className="mt-5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={logout}>
            Cerrar sesión
          </button>
        </section>
      </div>
    );
  }
  if (requirePerson && !usuario) return <Navigate to="/login" replace />;

  return <Outlet />;
}
