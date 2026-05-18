import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Settings, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const nav = [
  ['/', 'Dashboard'],
  ['/clientes', 'Clientes'],
  ['/compras/nueva', 'Registrar compra'],
  ['/configuracion', 'Configuración'],
];

export function AppLayout() {
  const { personaActiva, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-800 bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-serif text-2xl font-bold tracking-wide">Windsor Sastrería</Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm">
              <UserRound size={16} className="text-champagne" />
              Atiende {personaActiva?.nombre}
            </div>
            <Button variant="gold" onClick={() => navigate('/seleccion-persona')}>Cambiar persona</Button>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={signOut}>
              <LogOut size={16} /> Salir
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr] gap-6 px-6 py-6">
        <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-3 shadow-soft">
          <nav className="space-y-1">
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-ink text-white' : 'text-neutral-700 hover:bg-neutral-100'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 flex items-center gap-2 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
            <Settings size={14} /> Gestión interna
          </div>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

