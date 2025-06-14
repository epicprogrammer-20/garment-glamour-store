
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';

export const UserGreeting = () => {
  const { user } = useAuth();
  const { profile } = useUserData();

  if (!user || !profile) {
    return (
      <span className="text-sm sm:text-base text-gray-600">
        Hello!
      </span>
    );
  }

  return (
    <span className="text-sm sm:text-base text-gray-600 truncate max-w-32 sm:max-w-none">
      Hello, {profile.first_name}!
    </span>
  );
};
