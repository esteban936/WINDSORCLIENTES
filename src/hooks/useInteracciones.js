import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useInteracciones(clienteId) {
  const [interacciones, setInteracciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInteracciones = async () => {
    if (!clienteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('interacciones')
      .select('*, equipo(nombre)')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false });
    if (!error) setInteracciones(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInteracciones();
  }, [clienteId]);

  return { interacciones, loading, refetch: fetchInteracciones };
}

export async function createInteraccion(payload) {
  const { error } = await supabase.from('interacciones').insert(payload);
  if (error) throw error;
}
