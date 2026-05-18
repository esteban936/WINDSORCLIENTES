import { useEffect, useState } from 'react';
import { demoCompras } from '../lib/demoData';
import { demoMode, supabase } from '../lib/supabase';

export function useCompras(clienteId) {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompras = async () => {
    if (!clienteId) return;
    setLoading(true);
    if (demoMode) {
      setCompras(demoCompras.filter((item) => item.cliente_id === clienteId));
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
  if (demoMode) return { id: `demo-compra-${Date.now()}`, ...payload };
  const { data, error } = await supabase.from('compras').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCompraEstado(id, estado) {
  if (demoMode) return;
  const { error } = await supabase.from('compras').update({ estado }).eq('id', id);
  if (error) throw error;
}
