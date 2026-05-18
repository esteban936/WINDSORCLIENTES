import { useEffect, useState } from 'react';
import { demoMode, supabase } from '../lib/supabase';
import { demoEquipo } from '../lib/demoData';

export function useEquipo(soloActivos = true) {
  const [equipo, setEquipo] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipo = async () => {
    setLoading(true);
    if (demoMode) {
      setEquipo(soloActivos ? demoEquipo.filter((persona) => persona.activo) : demoEquipo);
      setLoading(false);
      return;
    }
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
