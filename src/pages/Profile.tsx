
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { useWishlist } from '../contexts/WishlistContext';
import { User, Mail, Lock, Edit, Heart, ShoppingBag, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Profile = () => {
  const { user, signIn, signUp, verifyOtp, signOut } = useAuth();
  const { profile, orderCount, reviewCount, loading } = useUserData();
  const { state: wishlistState } = useWishlist();
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setAuthError(error.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setAuthError('Passwords do not match');
          return;
        }
        
        if (!formData.phone) {
          setAuthError('Phone number is required for verification');
          return;
        }

        const { error, needsVerification } = await signUp(
          formData.email, 
          formData.password, 
          formData.name,
          formData.phone
        );
        
        if (error) {
          setAuthError(error.message);
        } else if (needsVerification) {
          setShowOtpVerification(true);
          setAuthError('');
        }
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
    }
  };

  const handleOtpVerification = async () => {
    if (otpValue.length !== 6) {
      setAuthError('Please enter the complete 6-digit code');
      return;
    }

    try {
      const { error } = await verifyOtp(formData.phone, otpValue);
      if (error) {
        setAuthError(error.message);
      } else {
        setShowOtpVerification(false);
        setAuthError('Account verified successfully! You can now sign in.');
        setIsLogin(true);
      }
    } catch (error) {
      setAuthError('Verification failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg border p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h1>
              <p className="text-gray-600">
                We've sent a 6-digit code to +263716601651
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {authError}
              </div>
            )}

            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={(value) => setOtpValue(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleOtpVerification}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Verify Code
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setShowOtpVerification(false)}
                  className="text-gray-600 hover:underline"
                >
                  Back to signup
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (user && profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
              </div>
              <button className="ml-auto p-2 text-gray-600 hover:text-black">
                <Edit size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <ShoppingBag size={24} className="mx-auto mb-2 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Orders</h3>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : orderCount}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Heart size={24} className="mx-auto mb-2 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Wishlist</h3>
                <p className="text-2xl font-bold text-gray-900">{wishlistState.items.length}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Star size={24} className="mx-auto mb-2 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Reviews</h3>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : reviewCount}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={signOut}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Sign up for a new account'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="+263716601651"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-black font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
