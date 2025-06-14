
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Shield, User, Bell, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/admin');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="mb-4 hover:bg-blue-50 border-blue-200 text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-lg text-gray-600">Manage your account preferences and system settings</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Admin Login Card */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-blue-200">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-xl text-gray-900">Admin Access</CardTitle>
              <CardDescription>
                Login as admin to change system settings and manage the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleAdminLogin}
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                variant="outline"
                disabled
              >
                Unavailable
              </Button>
            </CardContent>
          </Card>

          {/* User Settings Card */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-blue-200">
            <CardHeader className="text-center">
              <User className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-xl text-gray-900">User Profile</CardTitle>
              <CardDescription>
                Manage your personal information and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-blue-200">
            <CardHeader className="text-center">
              <Bell className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-xl text-gray-900">Notifications</CardTitle>
              <CardDescription>
                Configure how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-blue-200">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-xl text-gray-900">Security</CardTitle>
              <CardDescription>
                Password, privacy, and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;
