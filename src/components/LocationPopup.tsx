
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';

interface LocationData {
  country: string;
  city: string;
  location: string;
}

interface LocationPopupProps {
  isOpen: boolean;
  onLocationSubmit: (locationData: LocationData) => void;
  onClose: () => void;
}

export const LocationPopup = ({ isOpen, onLocationSubmit, onClose }: LocationPopupProps) => {
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    location: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.country && formData.city && formData.location) {
      onLocationSubmit(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="text-purple-600" size={24} />
            Enter Your Location
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Enter your country"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location/Address</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your specific location"
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Continue to Checkout
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
