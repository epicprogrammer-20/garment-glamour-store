
import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data && data.length > 0) {
        setVideos(data);
      } else {
        // Fallback to default videos if no videos in database
        setVideos([
          {
            id: 1,
            title: "Spring Collection 2024",
            url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop",
            description: "Discover our latest spring fashion trends"
          },
          {
            id: 2,
            title: "Luxury Accessories",
            url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
            description: "Premium accessories for every occasion"
          },
          {
            id: 3,
            title: "Sustainable Fashion",
            url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
            description: "Eco-friendly clothing that makes a statement"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const currentVideo = videos[activeVideo] || videos[0];
  const displayUrl = currentVideo?.thumbnail_url || currentVideo?.url;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Fashion Forward</h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Watch our latest fashion films and discover the stories behind our collections
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Video */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
              <img 
                src={displayUrl} 
                alt={currentVideo?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-4 sm:p-6 hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause size={24} className="text-white sm:w-8 sm:h-8" />
                    ) : (
                      <Play size={24} className="text-white ml-1 sm:w-8 sm:h-8" />
                    )}
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{currentVideo?.title}</h3>
                <p className="text-gray-200 text-sm sm:text-base">{currentVideo?.description}</p>
              </div>
            </div>
          </div>

          {/* Video Playlist */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold mb-4">More Videos</h3>
            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(index)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg transition-colors ${
                    activeVideo === index 
                      ? 'bg-white/10 border border-white/20' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex space-x-3 sm:space-x-4">
                    <img 
                      src={video.thumbnail_url || video.url} 
                      alt={video.title}
                      className="w-16 sm:w-20 h-10 sm:h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm sm:text-base">{video.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{video.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 sm:mt-12">
          <button className="bg-white text-black px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base">
            View All Collections
          </button>
        </div>
      </div>
    </section>
  );
};
