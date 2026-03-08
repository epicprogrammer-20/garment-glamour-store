import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Gift, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  learn_more_text: string;
  image_url: string;
  gallery_images: string[];
  competition_title: string;
  competition_description: string;
  competition_prize: string;
}

const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get('tab') || 'about';
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryForm, setEntryForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      if (data) setEvent(data as EventData);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('event_entries').insert({
        event_id: event.id,
        name: entryForm.name.trim(),
        email: entryForm.email.trim(),
        phone: entryForm.phone.trim(),
      });
      if (error) throw error;
      toast({ title: 'Entry submitted!', description: 'You have been entered into the competition. Good luck!' });
      setEntryForm({ name: '', email: '', phone: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]"><p>Loading...</p></div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]"><p>Event not found</p></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        {/* Hero */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="w-full h-64 sm:h-80 object-cover" />
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center p-6">
            <div>
              <div className="flex items-center gap-2 justify-center mb-2">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-white/80 text-sm uppercase tracking-widest">Event</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white">{event.title}</h1>
              {event.subtitle && <p className="text-lg text-white/80 mt-2">{event.subtitle}</p>}
            </div>
          </div>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="about">Learn More</TabsTrigger>
            <TabsTrigger value="event">Event Details</TabsTrigger>
            <TabsTrigger value="competition">Enter Competition</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {event.learn_more_text || event.description || 'More details coming soon.'}
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="event">
            <Card className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-6">{event.description}</p>

              {event.gallery_images && event.gallery_images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Event Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {event.gallery_images.map((img, i) => (
                      <img key={i} src={img} alt={`Event ${i + 1}`} className="w-full h-48 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="competition">
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{event.competition_title || 'Win Free Stuff!'}</h2>
              </div>
              {event.competition_description && (
                <p className="text-muted-foreground mb-2">{event.competition_description}</p>
              )}
              {event.competition_prize && (
                <p className="text-primary font-semibold mb-6">🎁 Prize: {event.competition_prize}</p>
              )}

              <form onSubmit={handleEntrySubmit} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="entry-name">Full Name</Label>
                  <Input id="entry-name" value={entryForm.name} onChange={e => setEntryForm(f => ({ ...f, name: e.target.value }))} required maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="entry-email">Email</Label>
                  <Input id="entry-email" type="email" value={entryForm.email} onChange={e => setEntryForm(f => ({ ...f, email: e.target.value }))} required maxLength={255} />
                </div>
                <div>
                  <Label htmlFor="entry-phone">Phone Number</Label>
                  <Input id="entry-phone" type="tel" value={entryForm.phone} onChange={e => setEntryForm(f => ({ ...f, phone: e.target.value }))} required maxLength={20} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Enter Competition'}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default EventPage;
