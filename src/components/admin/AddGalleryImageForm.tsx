
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  description?: string;
}

interface AddGalleryImageFormProps {
  onImageAdded: (image: GalleryImage) => void;
}

export const AddGalleryImageForm = ({ onImageAdded }: AddGalleryImageFormProps) => {
  const [newGalleryImage, setNewGalleryImage] = useState({
    title: '',
    url: '',
    imageFile: null as File | null,
    description: '',
  });

  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGalleryImage.title || (!newGalleryImage.url && !newGalleryImage.imageFile)) {
      toast({
        title: "Error",
        description: "Please fill in required fields and provide an image",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = newGalleryImage.url;

      if (newGalleryImage.imageFile) {
        const fileExt = newGalleryImage.imageFile.name.split('.').pop();
        const filePath = `gallery/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newGalleryImage.imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        imageUrl = supabase.storage.from('products').getPublicUrl(filePath).data.publicUrl;
      }

      const newImage = {
        id: Date.now().toString(),
        title: newGalleryImage.title,
        url: imageUrl,
        description: newGalleryImage.description,
      };

      onImageAdded(newImage);

      setNewGalleryImage({
        title: '',
        url: '',
        imageFile: null,
        description: '',
      });

      toast({
        title: "Success",
        description: "Gallery image added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add gallery image: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Image className="mr-2" size={20} />
        Add Gallery Image
      </h2>
      <form onSubmit={handleAddGalleryImage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gallery-title">Image Title *</Label>
          <Input
            id="gallery-title"
            value={newGalleryImage.title}
            onChange={(e) => setNewGalleryImage({ ...newGalleryImage, title: e.target.value })}
            placeholder="Enter image title"
            required
          />
        </div>
        <div>
          <Label htmlFor="gallery-url">Image URL</Label>
          <Input
            id="gallery-url"
            value={newGalleryImage.url}
            onChange={(e) => setNewGalleryImage({ ...newGalleryImage, url: e.target.value })}
            placeholder="Enter image URL"
          />
        </div>
        <div>
          <Label htmlFor="gallery-file">Or Upload Image File</Label>
          <Input
            id="gallery-file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewGalleryImage((prev) => ({
                  ...prev,
                  imageFile: file,
                }));
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="gallery-description">Description</Label>
          <Textarea
            id="gallery-description"
            value={newGalleryImage.description}
            onChange={(e) => setNewGalleryImage({ ...newGalleryImage, description: e.target.value })}
            placeholder="Enter image description"
            rows={2}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" className="w-full">
            Add Gallery Image
          </Button>
        </div>
      </form>
    </div>
  );
};
