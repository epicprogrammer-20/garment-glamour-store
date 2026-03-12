import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tracking_code } = await req.json();

    if (!tracking_code || typeof tracking_code !== 'string' || tracking_code.trim().length !== 5) {
      return new Response(JSON.stringify({ error: 'A valid 5-character tracking code is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const code = tracking_code.trim().toUpperCase();

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, tracking_code, status, created_at, customer_name, total, payment_method, country, estimated_delivery')
      .eq('tracking_code', code)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'No order found with that tracking code' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('id, product_name, product_image, size, quantity, price')
      .eq('order_id', order.id);

    // For refund lookup, also return minimal extra fields
    return new Response(JSON.stringify({
      order: {
        id: order.id,
        tracking_code: order.tracking_code,
        status: order.status,
        created_at: order.created_at,
        customer_name: order.customer_name,
        total: order.total,
        payment_method: order.payment_method,
        country: order.country,
        estimated_delivery: order.estimated_delivery,
      },
      items: items || [],
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
