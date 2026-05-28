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

async function sendEmail(to: string[], subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Windsor Sastrería <onboarding@resend.dev>';
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

function argentinaToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return new Date(formatter.format(new Date()) + 'T00:00:00-03:00');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const hoy = argentinaToday();
  const diasAnticipacion = 7;

  const { data: clientes = [] } = await supabase
    .from('clientes')
    .select('id, nombre, fecha_nacimiento, celular');

  const cumpleaneros = [];

  for (const cliente of clientes) {
    if (cliente.fecha_nacimiento) {
      const nacimiento = new Date(cliente.fecha_nacimiento + 'T00:00:00');
      const cumple = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
      if (cumple < hoy) cumple.setFullYear(hoy.getFullYear() + 1);
      const diff = Math.ceil((cumple.getTime() - hoy.getTime()) / 86400000);
      if (diff >= 0 && diff <= diasAnticipacion) {
        const dia = cumple.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
        cumpleaneros.push({
          nombre: cliente.nombre,
          fecha: dia,
          celular: cliente.celular || 'Sin teléfono',
        });
      }
    }
  }

  if (cumpleaneros.length > 0) {
    const adminEmails = (Deno.env.get('ADMIN_EMAILS') ?? '').split(',').map(e => e.trim()).filter(Boolean);
    
    if (adminEmails.length > 0) {
      const listaHTML = cumpleaneros
        .map(c => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${c.nombre}</td><td style="padding:8px;border-bottom:1px solid #eee">${c.fecha}</td><td style="padding:8px;border-bottom:1px solid #eee">${c.celular}</td></tr>`)
        .join('');

      const html = `
        <h2>Cumpleaños próximos — Windsor Sastrería</h2>
        <p>Los siguientes clientes cumplen años en los próximos 7 días:</p>
        <table style="border-collapse:collapse;width:100%">
          <tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left">Cliente</th>
            <th style="padding:8px;text-align:left">Fecha</th>
            <th style="padding:8px;text-align:left">Teléfono</th>
          </tr>
          ${listaHTML}
        </table>
        <p style="margin-top:16px;color:#888">— Sistema Windsor</p>
      `;

      await sendEmail(adminEmails, '🎂 Cumpleaños próximos — Windsor Sastrería', html);
    }
  }

  return new Response(JSON.stringify({ ok: true, cumpleaneros: cumpleaneros.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
