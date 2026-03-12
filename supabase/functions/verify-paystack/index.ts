import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const esc = (s: string) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { reference } = await req.json();

    if (!reference) {
      return new Response(JSON.stringify({ error: 'Reference is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Payment not verified' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orderId = data.data.metadata?.order_id;
    const trackingCode = data.data.metadata?.tracking_code;

    if (orderId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      // Idempotency: skip if already confirmed
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status, user_id')
        .eq('id', orderId)
        .single();

      if (existingOrder?.status === 'confirmed') {
        return new Response(JSON.stringify({
          verified: true,
          amount: data.data.amount / 100,
          reference: data.data.reference,
          order_id: orderId,
          tracking_code: trackingCode,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify the caller owns this order
      if (existingOrder?.user_id && existingOrder.user_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update order status
      await supabase.from('orders').update({
        status: 'confirmed',
        payment_method: 'paystack-card',
      }).eq('id', orderId);

      // Fetch order and items to send confirmation email
      const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
      const { data: orderItems } = await supabase.from('order_items').select('*').eq('order_id', orderId);

      if (order?.customer_email && orderItems) {
        try {
          const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
          if (RESEND_API_KEY) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

            await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({
                email: order.customer_email,
                customerName: esc(order.customer_name || 'Customer'),
                trackingCode: esc(trackingCode || order.tracking_code || ''),
                items: orderItems.map((item: any) => ({
                  name: esc(item.product_name),
                  image: item.product_image,
                  size: item.size,
                  quantity: item.quantity,
                  price: item.price,
                })),
                total: order.total,
                paymentMethod: 'paystack-card',
              }),
            });
          }
        } catch (e) {
          console.error('Failed to send order confirmation email:', e);
        }
      }
    }

    return new Response(JSON.stringify({
      verified: true,
      amount: data.data.amount / 100,
      reference: data.data.reference,
      order_id: orderId,
      tracking_code: trackingCode,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
