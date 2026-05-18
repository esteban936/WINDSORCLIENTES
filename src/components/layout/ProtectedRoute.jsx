import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ requirePerson = true }) {
  const { session, loading, personaActiva, demoMode } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-sm text-neutral-500">Cargando...</div>;
  if (!session && !demoMode) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requirePerson && !personaActiva) return <Navigate to="/seleccion-persona" replace />;

  return <Outlet />;
}
