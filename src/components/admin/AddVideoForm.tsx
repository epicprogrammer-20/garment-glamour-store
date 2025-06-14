
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
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    description: '',
  });

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVideo.title || (!newVideo.url && !newVideo.videoFile)) {
      toast({
        title: "Error", 
        description: "Please fill in title and provide either a URL or upload a video file",
        variant: "destructive",
      });
      return;
    }

    try {
      let videoUrl = newVideo.url;
      let thumbnailUrl = '';

      if (newVideo.videoFile) {
        const fileExt = newVideo.videoFile.name.split('.').pop();
        const filePath = `videos/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newVideo.videoFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        videoUrl = supabase.storage.from('products').getPublicUrl(filePath).data.publicUrl;
      }

      if (newVideo.thumbnailFile) {
        const fileExt = newVideo.thumbnailFile.name.split('.').pop();
        const filePath = `thumbnails/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newVideo.thumbnailFile);

        if (uploadError) {
          console.error('Thumbnail upload error:', uploadError);
          throw uploadError;
        }

        thumbnailUrl = supabase.storage.from('products').getPublicUrl(filePath).data.publicUrl;
      }

      const { error } = await supabase.from('videos').insert({
        title: newVideo.title,
        url: videoUrl,
        thumbnail_url: thumbnailUrl,
        description: newVideo.description,
        is_active: true,
      });

      if (error) throw error;

      setNewVideo({
        title: '',
        url: '',
        videoFile: null,
        thumbnailFile: null,
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
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
        <Plus className="mr-2" size={20} />
        Add New Video
      </h2>
      <form onSubmit={handleAddVideo} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <Label htmlFor="video-url">Video URL</Label>
          <Input
            id="video-url"
            value={newVideo.url}
            onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
            placeholder="Enter video URL"
          />
        </div>
        <div>
          <Label htmlFor="video-file">Or Upload Video File</Label>
          <Input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewVideo((prev) => ({
                  ...prev,
                  videoFile: file,
                }));
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="thumbnail-file">Upload Thumbnail Image</Label>
          <Input
            id="thumbnail-file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewVideo((prev) => ({
                  ...prev,
                  thumbnailFile: file,
                }));
              }
            }}
          />
        </div>
        <div className="lg:col-span-2">
          <Label htmlFor="video-description">Description</Label>
          <Textarea
            id="video-description"
            value={newVideo.description}
            onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
            placeholder="Enter video description"
            rows={3}
          />
        </div>
        <div className="lg:col-span-2">
          <Button type="submit" className="w-full">
            Add Video
          </Button>
        </div>
      </form>
    </div>
  );
};
