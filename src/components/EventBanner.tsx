import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  gallery_images: string[];
  is_active: boolean;
}

const EventBanner = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const allImages = event ? [event.image_url, ...(event.gallery_images || [])].filter(Boolean) : [];

  const nextSlide = useCallback(() => {
    if (allImages.length > 1) setCurrentSlide(prev => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevSlide = useCallback(() => {
    if (allImages.length > 1) setCurrentSlide(prev => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Auto-advance
  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, allImages.length]);

  if (!event) return null;

  return (
    <section className="relative overflow-hidden text-white min-h-[400px]">
      {/* Background carousel */}
      {allImages.length > 0 && (
        <div className="absolute inset-0">
          {allImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${event.title} ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
      )}
      {allImages.length === 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary to-primary/80" />
      )}

      {/* Carousel controls */}
      {allImages.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors">
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {allImages.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center min-h-[400px] py-12 max-w-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Event</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{event.title}</h2>
            {event.subtitle && <p className="text-lg sm:text-xl opacity-80 font-light">{event.subtitle}</p>}
            {event.description && <p className="text-sm sm:text-base opacity-70 max-w-md">{event.description}</p>}

            <div className="flex flex-wrap gap-3">
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
        </div>
      </div>
    </section>
  );
};

export default EventBanner;
