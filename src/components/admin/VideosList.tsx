
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  is_active: boolean;
}

interface VideosListProps {
  videos: Video[];
  onDeleteVideo: (id: string) => void;
}

export const VideosList = ({ videos, onDeleteVideo }: VideosListProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Videos ({videos.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-sm sm:text-base">Thumbnail</th>
              <th className="text-left py-2 px-2 text-sm sm:text-base">Title</th>
              <th className="text-left py-2 px-2 text-sm sm:text-base hidden sm:table-cell">URL</th>
              <th className="text-left py-2 px-2 text-sm sm:text-base">Status</th>
              <th className="text-left py-2 px-2 text-sm sm:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-b">
                <td className="py-2 px-2">
                  <img 
                    src={video.thumbnail_url || video.url} 
                    alt={video.title}
                    className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded"
                  />
                </td>
                <td className="py-2 px-2 text-sm sm:text-base">{video.title}</td>
                <td className="py-2 px-2 hidden sm:table-cell">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {video.url.substring(0, 30)}...
                  </a>
                </td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 rounded text-xs sm:text-sm ${video.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {video.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex space-x-1 sm:space-x-2">
                    <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                      <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDeleteVideo(video.id)} className="text-xs sm:text-sm">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No videos added yet. Add some videos to display in the video section.
          </div>
        )}
      </div>
    </div>
  );
};
