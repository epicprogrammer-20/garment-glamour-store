import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');

    const { email, customerName, trackingCode, status, amount } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isApproved = status === 'approved';
    const subject = isApproved
      ? `✅ Refund Approved — ${trackingCode}`
      : `❌ Refund Request Update — ${trackingCode}`;

    const statusMessage = isApproved
      ? `<p style="color: #555; font-size: 16px; line-height: 1.6;">
          Your refund request for order <strong style="font-family: monospace;">${trackingCode}</strong> has been <span style="color: #16a34a; font-weight: bold;">approved</span>.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          A refund of <strong>$${Number(amount).toFixed(2)}</strong> will be processed within <strong>6 hours</strong>.
        </p>`
      : `<p style="color: #555; font-size: 16px; line-height: 1.6;">
          Your refund request for order <strong style="font-family: monospace;">${trackingCode}</strong> has been <span style="color: #dc2626; font-weight: bold;">declined</span>.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          If you believe this is an error, please contact our support team for further assistance.
        </p>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AURA Clothing <onboarding@resend.dev>',
        to: [email],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 28px; font-weight: bold; color: #111;">AURA</h1>
            </div>
            <h2 style="color: #111; font-size: 22px;">Hi ${customerName || 'Customer'},</h2>
            ${statusMessage}
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0 0 4px;">ORDER</p>
              <p style="color: #111; font-size: 24px; font-weight: bold; font-family: monospace; margin: 0;">${trackingCode}</p>
              <p style="color: #888; font-size: 14px; margin: 8px 0 0;">Amount: $${Number(amount).toFixed(2)}</p>
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
    console.error('Error sending refund status email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
