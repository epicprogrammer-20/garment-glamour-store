import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory rate limiter: max 10 requests per IP per 60 seconds
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now >= entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Periodically clean up stale entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRequestCounts) {
    if (now >= entry.resetAt) {
      ipRequestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by client IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown';

    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

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
      .select('id, tracking_code, status, created_at, customer_name, customer_email, total, estimated_delivery')
      .eq('tracking_code', code)
      .single();

    if (orderErr || !order) {
      // Use a generic message to avoid revealing whether a code exists
      return new Response(JSON.stringify({ error: 'No order found with that tracking code' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch order items (only non-PII product info)
    const { data: items } = await supabase
      .from('order_items')
      .select('id, product_name, product_image, size, quantity, price')
      .eq('order_id', order.id);

    // Return minimal fields — no country, no payment_method
    return new Response(JSON.stringify({
      order: {
        id: order.id,
        tracking_code: order.tracking_code,
        status: order.status,
        created_at: order.created_at,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        total: order.total,
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
