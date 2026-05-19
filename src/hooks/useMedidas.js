import { useEffect, useState } from 'react';
import { getDemoMedidas, saveDemoMedidas } from '../lib/demoStore';
import { demoMode, supabase } from '../lib/supabase';

export function useMedidas(clienteId) {
  const [medidas, setMedidas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedidas = async () => {
    if (!clienteId) return;
    setLoading(true);
    if (demoMode) {
      setMedidas(getDemoMedidas(clienteId));
      setLoading(false);
      return;
    }
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
  if (demoMode) return saveDemoMedidas(payload);
  const { error } = await supabase.from('medidas').insert(payload);
  if (error) throw error;
}
