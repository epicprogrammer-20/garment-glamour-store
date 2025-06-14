
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
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Gallery Images ({galleryImages.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {galleryImages.map((image) => (
          <div key={image.id} className="border rounded-lg p-3 sm:p-4">
            <img src={image.url} alt={image.title} className="w-full h-24 sm:h-32 object-cover rounded mb-2" />
            <h3 className="font-semibold text-sm sm:text-base truncate">{image.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{image.description}</p>
            <Button 
              size="sm" 
              variant="destructive" 
              className="mt-2 w-full text-xs sm:text-sm"
              onClick={() => onDeleteImage(image.id)}
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </Button>
          </div>
        ))}
        {galleryImages.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No gallery images added yet. Add some images to display in the style gallery.
          </div>
        )}
      </div>
    </div>
  );
};
