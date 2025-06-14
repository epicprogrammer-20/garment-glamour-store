
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddVideoFormProps {
  onVideoAdded: () => void;
}

export const AddVideoForm = ({ onVideoAdded }: AddVideoFormProps) => {
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    description: '',
  });

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVideo.title || !newVideo.url) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('videos').insert({
        title: newVideo.title,
        url: newVideo.url,
        description: newVideo.description,
        is_active: true,
      });

      if (error) throw error;

      setNewVideo({
        title: '',
        url: '',
        description: '',
      });

      onVideoAdded();
      toast({
        title: "Success",
        description: "Video added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add video: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Plus className="mr-2" size={20} />
        Add New Video
      </h2>
      <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="video-title">Video Title *</Label>
          <Input
            id="video-title"
            value={newVideo.title}
            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
            placeholder="Enter video title"
            required
          />
        </div>
        <div>
          <Label htmlFor="video-url">Video URL *</Label>
          <Input
            id="video-url"
            value={newVideo.url}
            onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
            placeholder="Enter video URL"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="video-description">Description</Label>
          <Textarea
            id="video-description"
            value={newVideo.description}
            onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
            placeholder="Enter video description"
            rows={3}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" className="w-full">
            Add Video
          </Button>
        </div>
      </form>
    </div>
  );
};
