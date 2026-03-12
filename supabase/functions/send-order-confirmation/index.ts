import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user is sending their own order confirmation OR is an admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { email, customerName, trackingCode, items, total, paymentMethod } = await req.json();

    // Check if user is admin or if the email matches their own
    const isOwnEmail = user.email === email;
    if (!isOwnEmail) {
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsHtml = (items || []).map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" />` : ''}
            <div>
              <p style="margin: 0; font-weight: 600; color: #111;">${item.name}</p>
              <p style="margin: 2px 0 0; color: #888; font-size: 13px;">Size: ${item.size || 'N/A'} · Qty: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #111;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AURA Clothing <onboarding@resend.dev>',
        to: [email],
        subject: `✅ Order Confirmed — ${trackingCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 28px; font-weight: bold; color: #111;">AURA</h1>
            </div>
            <h2 style="color: #111; font-size: 22px;">Hi ${customerName},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Thank you for your order! We've received it and will begin processing it shortly.
            </p>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0 0 4px;">TRACKING CODE</p>
              <p style="color: #111; font-size: 28px; font-weight: bold; font-family: monospace; margin: 0; letter-spacing: 4px;">${trackingCode}</p>
            </div>
            <h3 style="color: #111; font-size: 16px; margin-top: 28px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px 12px; border-bottom: 2px solid #eee; color: #888; font-size: 12px; text-transform: uppercase;">Item</th>
                  <th style="text-align: right; padding: 8px 12px; border-bottom: 2px solid #eee; color: #888; font-size: 12px; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div style="text-align: right; margin-top: 16px; padding-top: 16px; border-top: 2px solid #111;">
              <p style="font-size: 12px; color: #888; margin: 0;">Payment: ${paymentMethod || 'Card'}</p>
              <p style="font-size: 20px; font-weight: bold; color: #111; margin: 4px 0 0;">Total: $${Number(total).toFixed(2)}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://auralothingrand.lovable.app/track-order" style="background: #111; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Track Your Order</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              &copy; 2024 AURA Clothing. All rights reserved.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(data)}`);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
