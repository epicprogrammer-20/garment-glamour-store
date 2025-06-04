
import React from 'react';

export const ImageGallery = () => {
  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop',
      alt: 'Fashion Collection 1',
      title: 'Summer Collection',
      description: 'Elegant styles for the season'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      alt: 'Fashion Collection 2',
      title: 'Urban Chic',
      description: 'Modern streetwear essentials'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
      alt: 'Fashion Collection 3',
      title: 'Classic Elegance',
      description: 'Timeless pieces for every occasion'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
      alt: 'Fashion Collection 4',
      title: 'Autumn Vibes',
      description: 'Cozy and stylish autumn wear'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Style Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our latest collections through stunning visuals that capture the essence of modern fashion.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <div 
              key={image.id} 
              className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                  index === 0 ? 'h-96 md:h-full' : 'h-64'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                <p className="text-sm opacity-90">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
