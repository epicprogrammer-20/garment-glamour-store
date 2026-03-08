import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  countdown_end: string | null;
  is_active: boolean;
  product_id: number | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const PromoBanner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from('promotional_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setBanner(data[0] as Banner);
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    if (!banner?.countdown_end) return;
    const calcTime = () => {
      const diff = new Date(banner.countdown_end!).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [banner?.countdown_end]);

  if (!banner || expired) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  const handleButtonClick = (type: 'primary' | 'secondary') => {
    if (banner.product_id) {
      navigate(`/product/${banner.product_id}`);
    } else {
      const link = type === 'primary' ? banner.button_link : banner.secondary_button_link;
      if (link && link !== '#') navigate(link);
    }
  };

  return (
    <section className="relative overflow-hidden text-white min-h-[500px]">
      {/* Full background image */}
      {banner.image_url && (
        <div className="absolute inset-0">
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
      )}
      {!banner.image_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,20%,20%)] via-[hsl(250,25%,28%)] to-[hsl(260,20%,40%)]" />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center min-h-[500px] py-12 max-w-xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{banner.title}</h2>
              {banner.subtitle && <p className="text-lg sm:text-xl mt-2 opacity-80 font-light">{banner.subtitle}</p>}
            </div>
            {banner.description && <p className="text-sm sm:text-base opacity-70 max-w-md">{banner.description}</p>}

            {banner.countdown_end && (
              <div className="flex gap-3 sm:gap-5">
                {[
                  { val: timeLeft.days, label: 'DAYS' },
                  { val: timeLeft.hours, label: 'HOURS' },
                  { val: timeLeft.minutes, label: 'MINUTES' },
                  { val: timeLeft.seconds, label: 'SECONDS' },
                ].map((item, i) => (
                  <React.Fragment key={item.label}>
                    {i > 0 && <span className="text-3xl sm:text-4xl font-bold opacity-60 self-start mt-1">:</span>}
                    <div className="text-center">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums">{pad(item.val)}</span>
                      <p className="text-[10px] sm:text-xs tracking-widest opacity-60 mt-1">{item.label}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {banner.button_text && (
                <Button
                  variant="ghost"
                  className="text-white border-b-2 border-white/60 rounded-none px-4 py-2 hover:bg-white/10 hover:border-white text-sm sm:text-base"
                  onClick={() => handleButtonClick('primary')}
                >
                  {banner.button_text}
                </Button>
              )}
              {banner.secondary_button_text && (
                <Button
                  variant="outline"
                  className="border-white/40 text-white rounded-full px-6 py-2 hover:bg-white/10 hover:border-white text-sm sm:text-base bg-transparent"
                  onClick={() => handleButtonClick('secondary')}
                >
                  {banner.secondary_button_text}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
