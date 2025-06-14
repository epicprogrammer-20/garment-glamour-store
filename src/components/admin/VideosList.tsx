
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  url: string;
  is_active: boolean;
}

interface VideosListProps {
  videos: Video[];
  onDeleteVideo: (id: string) => void;
}

export const VideosList = ({ videos, onDeleteVideo }: VideosListProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Videos ({videos.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Title</th>
              <th className="text-left py-2">URL</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-b">
                <td className="py-2">{video.title}</td>
                <td className="py-2">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {video.url.substring(0, 50)}...
                  </a>
                </td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-sm ${video.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {video.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit size={16} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDeleteVideo(video.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
