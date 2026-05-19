import { useEffect, useState } from 'react';
import { getDemoCliente, getDemoClientes, saveDemoCliente } from '../lib/demoStore';
import { demoMode, supabase } from '../lib/supabase';

export function useClientes(search = '') {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    setLoading(true);
    if (demoMode) {
      const term = search.toLowerCase().trim();
      setClientes(getDemoClientes().filter((cliente) =>
        !term || [cliente.nombre, cliente.celular, cliente.email].some((value) => value?.toLowerCase().includes(term))
      ));
      setLoading(false);
      return;
    }
    let query = supabase
      .from('clientes')
      .select('*, compras(id, estado), interacciones(fecha)')
      .order('nombre');

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`nombre.ilike.${term},celular.ilike.${term},email.ilike.${term}`);
    }

    const { data, error } = await query;
    if (!error) setClientes(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, [search]);

  return { clientes, loading, refetch: fetchClientes };
}

export async function getCliente(id) {
  if (demoMode) {
    const cliente = getDemoCliente(id);
    if (!cliente) throw new Error('Cliente no encontrado en demo.');
    return cliente;
  }
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function saveCliente(payload, id) {
  if (demoMode) {
    return saveDemoCliente(payload, id);
  }
  const query = id ? supabase.from('clientes').update(payload).eq('id', id).select().single() : supabase.from('clientes').insert(payload).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
