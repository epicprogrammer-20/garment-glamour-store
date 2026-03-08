import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

const EventBanner = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setEvent(data[0] as Event);
    };
    fetchEvent();
  }, []);

  if (!event) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[400px] py-12 lg:py-0">
          <div className="text-center lg:text-left space-y-6 z-10">
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Event</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{event.title}</h2>
            {event.subtitle && <p className="text-lg sm:text-xl opacity-80 font-light">{event.subtitle}</p>}
            {event.description && <p className="text-sm sm:text-base opacity-70 max-w-md mx-auto lg:mx-0">{event.description}</p>}

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Button
                variant="ghost"
                className="text-white border-b-2 border-white/60 rounded-none px-4 py-2 hover:bg-white/10 hover:border-white"
                onClick={() => navigate(`/event/${event.id}?tab=about`)}
              >
                Learn More
              </Button>
              <Button
                variant="outline"
                className="border-white/40 text-white rounded-full px-6 py-2 hover:bg-white/10 hover:border-white bg-transparent"
                onClick={() => navigate(`/event/${event.id}?tab=event`)}
              >
                Go to Event
              </Button>
            </div>
          </div>

          {event.image_url && (
            <div className="flex justify-center lg:justify-end">
              <img src={event.image_url} alt={event.title} className="max-h-[350px] lg:max-h-[400px] w-auto object-contain drop-shadow-2xl rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventBanner;
