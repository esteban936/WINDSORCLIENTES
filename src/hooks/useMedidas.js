import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useMedidas(clienteId) {
  const [medidas, setMedidas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedidas = async () => {
    if (!clienteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('medidas')
      .select('*, equipo(nombre)')
      .eq('cliente_id', clienteId)
      .order('fecha_toma', { ascending: false });
    if (!error) setMedidas(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMedidas();
  }, [clienteId]);

  return { medidas, loading, refetch: fetchMedidas };
}

export async function createMedidas(payload) {
  const { error } = await supabase.from('medidas').insert(payload);
  if (error) throw error;
}
