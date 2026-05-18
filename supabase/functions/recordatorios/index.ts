import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Windsor Sastrería <recordatorios@windsor.local>';
  if (!apiKey) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  return response.ok;
}

async function getConfigNumber(clave: string, fallback: number) {
  const { data } = await supabase.from('configuracion').select('valor').eq('clave', clave).maybeSingle();
  const parsed = Number(data?.valor);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function argentinaToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return new Date(`${formatter.format(new Date())}T00:00:00-03:00`);
}

async function ensureReminder(clienteId: string, tipo: string, fechaEnvio: string, mensaje: string, estado = 'pendiente') {
  const { data } = await supabase
    .from('recordatorios')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('tipo', tipo)
    .eq('fecha_envio', fechaEnvio)
    .maybeSingle();

  if (!data) {
    await supabase.from('recordatorios').insert({ cliente_id: clienteId, tipo, fecha_envio: fechaEnvio, mensaje, estado });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const hoy = argentinaToday();
  const diasCumpleanos = await getConfigNumber('dias_cumpleanos', 3);
  const mesesReactivacion = await getConfigNumber('meses_reactivacion', 6);

  const { data: clientes = [] } = await supabase
    .from('clientes')
    .select('id, nombre, email, fecha_nacimiento');

  for (const cliente of clientes) {
    if (cliente.fecha_nacimiento) {
      const nacimiento = new Date(`${cliente.fecha_nacimiento}T00:00:00`);
      const cumple = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
      if (cumple < hoy) cumple.setFullYear(hoy.getFullYear() + 1);
      const diff = Math.ceil((cumple.getTime() - hoy.getTime()) / 86400000);
      if (diff >= 0 && diff <= diasCumpleanos) {
        let estado = 'pendiente';
        if (cliente.email) {
          const sent = await sendEmail(
            cliente.email,
            'Windsor Sastrería te saluda por tu cumpleaños',
            `<p>Hola ${cliente.nombre},</p><p>Desde Windsor Sastrería queremos saludarte por tu cumpleaños.</p>`,
          );
          estado = sent ? 'enviado' : 'fallido';
        }
        await ensureReminder(cliente.id, 'cumpleanos', dateOnly(cumple), `Cumpleaños de ${cliente.nombre}`, estado);
      }
    }
  }

  const corteReactivacion = new Date(hoy);
  corteReactivacion.setMonth(corteReactivacion.getMonth() - mesesReactivacion);
  const { data: ultimas = [] } = await supabase
    .from('clientes')
    .select('id, nombre, interacciones(fecha)')
    .order('fecha', { foreignTable: 'interacciones', ascending: false });

  for (const cliente of ultimas) {
    const ultima = cliente.interacciones?.[0]?.fecha ? new Date(cliente.interacciones[0].fecha) : null;
    if (!ultima || ultima < corteReactivacion) {
      await ensureReminder(cliente.id, 'reactivacion', dateOnly(hoy), `Reactivar contacto con ${cliente.nombre}`);
    }
  }

  const hastaEvento = new Date(hoy);
  hastaEvento.setDate(hastaEvento.getDate() + 14);
  const { data: eventos = [] } = await supabase
    .from('compras')
    .select('cliente_id, evento, fecha_evento, clientes(nombre)')
    .gte('fecha_evento', dateOnly(hoy))
    .lte('fecha_evento', dateOnly(hastaEvento));

  for (const compra of eventos) {
    await ensureReminder(
      compra.cliente_id,
      'evento_proximo',
      compra.fecha_evento,
      `${compra.evento ?? 'Evento'} próximo de ${compra.clientes?.nombre ?? 'cliente'}`
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
