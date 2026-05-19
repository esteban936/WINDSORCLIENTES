import { useEffect, useState } from 'react';
import { getDemoCompras, saveDemoCompra, updateDemoCompraEstado } from '../lib/demoStore';
import { demoMode, supabase } from '../lib/supabase';

export function useCompras(clienteId) {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompras = async () => {
    if (!clienteId) return;
    setLoading(true);
    if (demoMode) {
      setCompras(getDemoCompras(clienteId));
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('compras')
      .select('*, equipo(nombre)')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false });
    if (!error) setCompras(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompras();
  }, [clienteId]);

  return { compras, loading, refetch: fetchCompras };
}

export async function createCompra(payload) {
  if (demoMode) return saveDemoCompra(payload);
  const { data, error } = await supabase.from('compras').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCompraEstado(id, estado) {
  if (demoMode) return updateDemoCompraEstado(id, estado);
  const { error } = await supabase.from('compras').update({ estado }).eq('id', id);
  if (error) throw error;
}
