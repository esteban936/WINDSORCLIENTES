import { demoClientes } from './demoData';

const CLIENTES_KEY = 'windsor_demo_clientes';

function read(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getDemoClientes() {
  const saved = read(CLIENTES_KEY, null);
  if (saved) return saved;
  write(CLIENTES_KEY, demoClientes);
  return demoClientes;
}

export function getDemoCliente(id) {
  return getDemoClientes().find((cliente) => cliente.id === id);
}

export function saveDemoCliente(payload, id) {
  const clientes = getDemoClientes();
  const now = new Date().toISOString();

  if (id) {
    const updated = clientes.map((cliente) => (
      cliente.id === id ? { ...cliente, ...payload } : cliente
    ));
    const cliente = updated.find((item) => item.id === id);
    write(CLIENTES_KEY, updated);
    return cliente;
  }

  const cliente = {
    id: `demo-cliente-${Date.now()}`,
    ...payload,
    created_at: now,
    compras: [],
    interacciones: [],
  };
  write(CLIENTES_KEY, [cliente, ...clientes]);
  return cliente;
}

