
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  description?: string;
}

interface GalleryImagesListProps {
  galleryImages: GalleryImage[];
  onDeleteImage: (id: string) => void;
}

export const GalleryImagesList = ({ galleryImages, onDeleteImage }: GalleryImagesListProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Gallery Images ({galleryImages.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {galleryImages.map((image) => (
          <div key={image.id} className="border rounded-lg p-4">
            <img src={image.url} alt={image.title} className="w-full h-32 object-cover rounded mb-2" />
            <h3 className="font-semibold">{image.title}</h3>
            <p className="text-sm text-gray-600">{image.description}</p>
            <Button 
              size="sm" 
              variant="destructive" 
              className="mt-2 w-full"
              onClick={() => onDeleteImage(image.id)}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
