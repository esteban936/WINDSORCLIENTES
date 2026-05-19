import { demoClientes, demoCompras, demoEquipo, demoInteracciones, demoMedidas } from './demoData';

const CLIENTES_KEY = 'windsor_demo_clientes';
const COMPRAS_KEY = 'windsor_demo_compras';
const INTERACCIONES_KEY = 'windsor_demo_interacciones';
const MEDIDAS_KEY = 'windsor_demo_medidas';

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
  if (saved) return withRelations(saved);
  write(CLIENTES_KEY, demoClientes);
  return withRelations(demoClientes);
}

export function getDemoCliente(id) {
  return getDemoClientes().find((cliente) => cliente.id === id);
}

export function saveDemoCliente(payload, id) {
  const clientes = read(CLIENTES_KEY, demoClientes);
  const now = new Date().toISOString();

  if (id) {
    const updated = clientes.map((cliente) => (
      cliente.id === id ? { ...cliente, ...payload } : cliente
    ));
    const cliente = updated.find((item) => item.id === id);
    write(CLIENTES_KEY, updated);
    return withRelations([cliente])[0];
  }

  const cliente = {
    id: `demo-cliente-${Date.now()}`,
    ...payload,
    created_at: now,
    compras: [],
    interacciones: [],
  };
  write(CLIENTES_KEY, [cliente, ...clientes]);
  return withRelations([cliente])[0];
}

function findEquipo(id) {
  const persona = demoEquipo.find((item) => item.id === id);
  return persona ? { nombre: persona.nombre } : null;
}

function findCliente(id) {
  const cliente = read(CLIENTES_KEY, demoClientes).find((item) => item.id === id);
  return cliente ? { nombre: cliente.nombre } : null;
}

function withRelations(clientes) {
  const compras = getDemoCompras();
  const interacciones = getDemoInteracciones();
  return clientes.map((cliente) => ({
    ...cliente,
    compras: compras
      .filter((compra) => compra.cliente_id === cliente.id)
      .map((compra) => ({ id: compra.id, estado: compra.estado })),
    interacciones: interacciones
      .filter((interaccion) => interaccion.cliente_id === cliente.id)
      .map((interaccion) => ({ fecha: interaccion.fecha })),
  }));
}

export function getDemoCompras(clienteId) {
  const compras = read(COMPRAS_KEY, null) ?? demoCompras;
  if (!localStorage.getItem(COMPRAS_KEY)) write(COMPRAS_KEY, compras);
  const filtered = clienteId ? compras.filter((compra) => compra.cliente_id === clienteId) : compras;
  return filtered
    .map((compra) => ({
      ...compra,
      equipo: compra.equipo ?? findEquipo(compra.atendido_por),
      clientes: compra.clientes ?? findCliente(compra.cliente_id),
    }))
    .sort((a, b) => `${b.fecha}`.localeCompare(`${a.fecha}`));
}

export function saveDemoCompra(payload) {
  const compras = read(COMPRAS_KEY, demoCompras);
  const compra = {
    id: `demo-compra-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...payload,
    equipo: findEquipo(payload.atendido_por),
    clientes: findCliente(payload.cliente_id),
  };
  write(COMPRAS_KEY, [compra, ...compras]);
  return compra;
}

export function updateDemoCompraEstado(id, estado) {
  const compras = read(COMPRAS_KEY, demoCompras);
  write(COMPRAS_KEY, compras.map((compra) => (
    compra.id === id ? { ...compra, estado } : compra
  )));
}

export function getDemoInteracciones(clienteId) {
  const interacciones = read(INTERACCIONES_KEY, null) ?? demoInteracciones;
  if (!localStorage.getItem(INTERACCIONES_KEY)) write(INTERACCIONES_KEY, interacciones);
  const filtered = clienteId ? interacciones.filter((item) => item.cliente_id === clienteId) : interacciones;
  return filtered
    .map((item) => ({ ...item, equipo: item.equipo ?? findEquipo(item.atendido_por) }))
    .sort((a, b) => `${b.fecha}`.localeCompare(`${a.fecha}`));
}

export function saveDemoInteraccion(payload) {
  const interacciones = read(INTERACCIONES_KEY, demoInteracciones);
  const interaccion = {
    id: `demo-int-${Date.now()}`,
    fecha: new Date().toISOString(),
    ...payload,
    equipo: findEquipo(payload.atendido_por),
  };
  write(INTERACCIONES_KEY, [interaccion, ...interacciones]);
  return interaccion;
}

export function getDemoMedidas(clienteId) {
  const medidas = read(MEDIDAS_KEY, null) ?? demoMedidas;
  if (!localStorage.getItem(MEDIDAS_KEY)) write(MEDIDAS_KEY, medidas);
  return medidas
    .filter((item) => item.cliente_id === clienteId)
    .map((item) => ({ ...item, equipo: item.equipo ?? findEquipo(item.tomadas_por) }))
    .sort((a, b) => `${b.fecha_toma}`.localeCompare(`${a.fecha_toma}`));
}

export function saveDemoMedidas(payload) {
  const medidas = read(MEDIDAS_KEY, demoMedidas);
  const medida = {
    id: `demo-medida-${Date.now()}`,
    fecha_toma: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    ...payload,
    equipo: findEquipo(payload.tomadas_por),
  };
  write(MEDIDAS_KEY, [medida, ...medidas]);
  return medida;
}
