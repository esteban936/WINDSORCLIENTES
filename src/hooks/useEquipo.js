import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useEquipo(soloActivos = true) {
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipo = async () => {
    setLoading(true);
    let query = supabase.from('equipo').select('*').order('nombre');
    if (soloActivos) query = query.eq('activo', true);
    const { data, error } = await query;
    if (!error) setEquipo(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipo();
  }, [soloActivos]);

  return { equipo, loading, refetch: fetchEquipo };
}
