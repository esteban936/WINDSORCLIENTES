import { useEffect, useState } from 'react';
import { demoCompras } from '../lib/demoData';
import { getDemoClientes } from '../lib/demoStore';
import { demoMode, supabase } from '../lib/supabase';
import { today } from '../lib/formatters';

export function useDashboardData() {
  const [data, setData] = useState({
    clientesHoy: 0,
    fichasHoy: 0,
    pendientes: [],
    cumpleanos: [],
    sinContacto: [],
    eventos: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    if (demoMode) {
      const demoClientes = getDemoClientes();
      setData({
        clientesHoy: 1,
        fichasHoy: 1,
        pendientes: demoCompras.filter((compra) => compra.estado === 'listo'),
        cumpleanos: demoClientes.slice(0, 1),
        sinContacto: demoClientes.slice(1, 2).map((cliente) => ({ ...cliente, ultima: cliente.interacciones?.[0]?.fecha })),
        eventos: demoCompras.filter((compra) => compra.fecha_evento),
      });
      setLoading(false);
      return;
    }
    const hoy = today();
    const en7 = new Date();
    en7.setDate(en7.getDate() + 7);
    const en14 = new Date();
    en14.setDate(en14.getDate() + 14);
    const corte6 = new Date();
    corte6.setMonth(corte6.getMonth() - 6);

    const [interaccionesHoy, fichasHoy, pendientes, clientes, eventos] = await Promise.all([
      supabase.from('interacciones').select('cliente_id').gte('fecha', `${hoy}T00:00:00`).lt('fecha', `${hoy}T23:59:59`),
      supabase.from('clientes').select('id').gte('created_at', `${hoy}T00:00:00`).lt('created_at', `${hoy}T23:59:59`),
      supabase.from('compras').select('*, clientes(nombre)').eq('estado', 'listo').order('fecha', { ascending: false }).limit(8),
      supabase.from('clientes').select('id, nombre, fecha_nacimiento, interacciones(fecha)').order('fecha', { foreignTable: 'interacciones', ascending: false }),
      supabase.from('compras').select('*, clientes(nombre)').gte('fecha_evento', hoy).lte('fecha_evento', en14.toISOString().slice(0, 10)).order('fecha_evento').limit(8),
    ]);

    const cumpleanos = (clientes.data ?? []).filter((cliente) => {
      if (!cliente.fecha_nacimiento) return false;
      const nacimiento = new Date(`${cliente.fecha_nacimiento}T00:00:00`);
      const cumple = new Date(new Date().getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
      if (cumple < new Date()) cumple.setFullYear(cumple.getFullYear() + 1);
      return cumple <= en7;
    });

    const sinContacto = (clientes.data ?? [])
      .map((cliente) => ({ ...cliente, ultima: cliente.interacciones?.[0]?.fecha ?? null }))
      .filter((cliente) => !cliente.ultima || new Date(cliente.ultima) < corte6)
      .slice(0, 8);

    setData({
      clientesHoy: new Set((interaccionesHoy.data ?? []).map((item) => item.cliente_id)).size,
      fichasHoy: fichasHoy.data?.length ?? 0,
      pendientes: pendientes.data ?? [],
      cumpleanos,
      sinContacto,
      eventos: eventos.data ?? [],
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}
