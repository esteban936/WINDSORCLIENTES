import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Configuracion } from './pages/Configuracion';
import { Dashboard } from './pages/Dashboard';
import { FichaCliente } from './pages/FichaCliente';
import { ListaClientes } from './pages/ListaClientes';
import { Login } from './pages/Login';
import { NuevaCompra } from './pages/NuevaCompra';
import { NuevaFicha } from './pages/NuevaFicha';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/clientes" element={<ListaClientes />} />
          <Route path="/clientes/nuevo" element={<NuevaFicha />} />
          <Route path="/clientes/:id" element={<FichaCliente />} />
          <Route path="/compras/nueva" element={<NuevaCompra />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/seleccion-persona" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
