import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Trash2, Plus, Save, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  learn_more_text: string;
  image_url: string;
  gallery_images: string[];
  is_active: boolean;
  competition_title: string;
  competition_description: string;
  competition_prize: string;
}

const emptyEvent = {
  title: '', subtitle: '', description: '', learn_more_text: '',
  competition_title: '', competition_description: '', competition_prize: '',
  is_active: false,
};

const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyEvent);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data as Event[]);
  };

  const fetchEntryCounts = async () => {
    const { data } = await supabase.from('event_entries').select('event_id');
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((e: any) => { counts[e.event_id] = (counts[e.event_id] || 0) + 1; });
      setEntryCounts(counts);
    }
  };

  useEffect(() => { fetchEvents(); fetchEntryCounts(); }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const filePath = `events/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('events').upload(filePath, file);
    if (error) throw error;
    return supabase.storage.from('events').getPublicUrl(filePath).data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Error', description: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      let imageUrl = '';
      if (imageFile) imageUrl = await uploadImage(imageFile);

      let galleryUrls: string[] = [];
      if (galleryFiles) {
        for (let i = 0; i < galleryFiles.length; i++) {
          galleryUrls.push(await uploadImage(galleryFiles[i]));
        }
      }

      const { error } = await supabase.from('events').insert({
        ...form,
        image_url: imageUrl,
        gallery_images: galleryUrls,
      });
      if (error) throw error;
      toast({ title: 'Event created!' });
      setForm(emptyEvent);
      setImageFile(null);
      setGalleryFiles(null);
      setShowForm(false);
      fetchEvents();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('events').update({ is_active: !current }).eq('id', id);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    toast({ title: 'Deleted' });
    fetchEvents();
  };

  const updateField = async (id: string, field: string, value: any) => {
    await supabase.from('events').update({ [field]: value }).eq('id', id);
    fetchEvents();
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles size={20} /> Events Manager</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-1 h-4 w-4" /> New Event</Button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 mb-6 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} /></div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><Label>Learn More Text (detailed info)</Label><Textarea value={form.learn_more_text} onChange={e => setForm(f => ({ ...f, learn_more_text: e.target.value }))} rows={5} /></div>
          <div><Label>Banner Image</Label><Input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }} /></div>
          <div><Label>Gallery Images (multiple)</Label><Input type="file" accept="image/*" multiple onChange={e => setGalleryFiles(e.target.files)} /></div>
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Competition Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Competition Title</Label><Input value={form.competition_title} onChange={e => setForm(f => ({ ...f, competition_title: e.target.value }))} placeholder="Win Free Stuff!" /></div>
              <div><Label>Prize</Label><Input value={form.competition_prize} onChange={e => setForm(f => ({ ...f, competition_prize: e.target.value }))} placeholder="Free sneakers" /></div>
            </div>
            <div className="mt-2"><Label>Competition Description</Label><Textarea value={form.competition_description} onChange={e => setForm(f => ({ ...f, competition_description: e.target.value }))} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            <Label>Active on homepage</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}><Save className="mr-1 h-4 w-4" /> {saving ? 'Saving...' : 'Create Event'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No events yet.</p>
      ) : (
        <div className="space-y-4">
          {events.map(ev => (
            <div key={ev.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch checked={ev.is_active} onCheckedChange={() => toggleActive(ev.id, ev.is_active)} />
                  <span className={`text-sm font-medium ${ev.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>{ev.is_active ? 'Active' : 'Inactive'}</span>
                  <span className="text-xs flex items-center gap-1 text-muted-foreground"><Users size={14} /> {entryCounts[ev.id] || 0} entries</span>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteEvent(ev.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Title</Label><Input defaultValue={ev.title} onBlur={e => updateField(ev.id, 'title', e.target.value)} /></div>
                <div><Label className="text-xs text-muted-foreground">Subtitle</Label><Input defaultValue={ev.subtitle || ''} onBlur={e => updateField(ev.id, 'subtitle', e.target.value)} /></div>
              </div>
              <div><Label className="text-xs text-muted-foreground">Description</Label><Textarea defaultValue={ev.description || ''} onBlur={e => updateField(ev.id, 'description', e.target.value)} /></div>
              {ev.image_url && <img src={ev.image_url} alt={ev.title} className="h-20 object-contain rounded" />}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default EventManager;
