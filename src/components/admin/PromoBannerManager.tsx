import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Timer, Trash2, Plus, Save } from 'lucide-react';

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
}

const emptyBanner = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  button_text: 'Learn more',
  button_link: '#',
  secondary_button_text: 'Pre-order',
  secondary_button_link: '#',
  countdown_end: '',
  is_active: false,
};

const PromoBannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyBanner);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('promotional_banners')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBanners(data as Banner[]);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        image_url: form.image_url,
        button_text: form.button_text,
        button_link: form.button_link,
        secondary_button_text: form.secondary_button_text,
        secondary_button_link: form.secondary_button_link,
        countdown_end: form.countdown_end || null,
        is_active: form.is_active,
      };
      const { error } = await supabase.from('promotional_banners').insert(payload);
      if (error) throw error;
      toast({ title: 'Success', description: 'Banner created!' });
      setForm(emptyBanner);
      setShowForm(false);
      fetchBanners();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('promotional_banners')
      .update({ is_active: !current })
      .eq('id', id);
    if (!error) fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from('promotional_banners').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Deleted', description: 'Banner removed.' });
      fetchBanners();
    }
  };

  const updateField = async (id: string, field: string, value: string) => {
    const { error } = await supabase
      .from('promotional_banners')
      .update({ [field]: value })
      .eq('id', id);
    if (!error) fetchBanners();
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Timer size={20} /> Promotional Banner / Timer
        </h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> New Banner
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="border rounded-lg p-4 mb-6 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Galaxy S26 Ultra" />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Galaxy AI ✨" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="512 GB for the price of 256 GB..." />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Button Text</Label>
              <Input value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} />
            </div>
            <div>
              <Label>Button Link</Label>
              <Input value={form.button_link} onChange={e => setForm(f => ({ ...f, button_link: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Secondary Button Text</Label>
              <Input value={form.secondary_button_text} onChange={e => setForm(f => ({ ...f, secondary_button_text: e.target.value }))} />
            </div>
            <div>
              <Label>Secondary Button Link</Label>
              <Input value={form.secondary_button_link} onChange={e => setForm(f => ({ ...f, secondary_button_link: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Countdown End (Date & Time)</Label>
            <Input type="datetime-local" value={form.countdown_end} onChange={e => setForm(f => ({ ...f, countdown_end: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            <Label>Active on homepage</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-1 h-4 w-4" /> {saving ? 'Saving...' : 'Create Banner'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Existing Banners */}
      {banners.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No promotional banners yet.</p>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b.id, b.is_active)} />
                  <span className={`text-sm font-medium ${b.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteBanner(b.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Title</Label>
                  <Input defaultValue={b.title} onBlur={e => updateField(b.id, 'title', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Subtitle</Label>
                  <Input defaultValue={b.subtitle || ''} onBlur={e => updateField(b.id, 'subtitle', e.target.value)} />
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Description</Label>
                <Textarea defaultValue={b.description || ''} onBlur={e => updateField(b.id, 'description', e.target.value)} />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Image URL</Label>
                <Input defaultValue={b.image_url || ''} onBlur={e => updateField(b.id, 'image_url', e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Countdown End</Label>
                  <Input
                    type="datetime-local"
                    defaultValue={b.countdown_end ? new Date(b.countdown_end).toISOString().slice(0, 16) : ''}
                    onBlur={e => updateField(b.id, 'countdown_end', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">Button Text</Label>
                    <Input defaultValue={b.button_text || ''} onBlur={e => updateField(b.id, 'button_text', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Button Link</Label>
                    <Input defaultValue={b.button_link || ''} onBlur={e => updateField(b.id, 'button_link', e.target.value)} />
                  </div>
                </div>
              </div>

              {b.image_url && (
                <img src={b.image_url} alt={b.title} className="h-20 object-contain rounded" />
              )}
            </div>
          ))
        </div>
      )}
    </Card>
  );
};

export default PromoBannerManager;
