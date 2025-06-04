
import React from 'react';
import { Instagram, MessageCircle, Music } from 'lucide-react';

export const SocialMedia = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com',
      color: 'hover:text-pink-500',
      bgColor: 'hover:bg-pink-50'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://whatsapp.com',
      color: 'hover:text-green-500',
      bgColor: 'hover:bg-green-50'
    },
    {
      name: 'TikTok',
      icon: Music,
      url: 'https://tiktok.com',
      color: 'hover:text-black',
      bgColor: 'hover:bg-gray-50'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Follow Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay connected and get the latest fashion updates, behind-the-scenes content, and exclusive offers.
          </p>
        </div>
        
        <div className="flex justify-center space-x-8">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center p-6 rounded-lg bg-white shadow-sm transition-all duration-300 ${social.bgColor} hover:shadow-lg hover:scale-105`}
              >
                <div className={`p-4 rounded-full bg-gray-100 group-hover:bg-white transition-all duration-300 ${social.color}`}>
                  <IconComponent size={32} className="transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="mt-3 font-medium text-gray-700 group-hover:text-gray-900">
                  {social.name}
                </span>
              </a>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Join our community of fashion enthusiasts</p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span>#LuxeFashion</span>
            <span>#StyleInspiration</span>
            <span>#FashionForward</span>
          </div>
        </div>
      </div>
    </section>
  );
};
