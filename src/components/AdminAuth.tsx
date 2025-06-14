
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Check if there's an existing lockout
    const savedLockoutEndTime = localStorage.getItem('adminLockoutEndTime');
    const savedFailedAttempts = localStorage.getItem('adminFailedAttempts');
    
    if (savedLockoutEndTime) {
      const endTime = parseInt(savedLockoutEndTime);
      const now = Date.now();
      
      if (now < endTime) {
        setIsLocked(true);
        setLockoutEndTime(endTime);
        setRemainingTime(Math.ceil((endTime - now) / 1000));
      } else {
        // Lockout has expired
        localStorage.removeItem('adminLockoutEndTime');
        localStorage.removeItem('adminFailedAttempts');
      }
    }
    
    if (savedFailedAttempts) {
      setFailedAttempts(parseInt(savedFailedAttempts));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLocked && lockoutEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((lockoutEndTime - now) / 1000));
        
        setRemainingTime(timeLeft);
        
        if (timeLeft <= 0) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setFailedAttempts(0);
          localStorage.removeItem('adminLockoutEndTime');
          localStorage.removeItem('adminFailedAttempts');
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockoutEndTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Access Locked",
        description: `Please wait ${remainingTime} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    // Enhanced security check - in production, use proper authentication
    if (username === 'admin' && password === 'admin123' && securityCode === 'SECURE2024') {
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.removeItem('adminFailedAttempts');
      localStorage.removeItem('adminLockoutEndTime');
      setFailedAttempts(0);
      onAuthenticated();
      toast({
        title: "Success",
        description: "Welcome to the admin panel!",
      });
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem('adminFailedAttempts', newFailedAttempts.toString());
      
      if (newFailedAttempts >= 3) {
        const lockoutEndTime = Date.now() + 60000; // 1 minute lockout
        setIsLocked(true);
        setLockoutEndTime(lockoutEndTime);
        setRemainingTime(60);
        localStorage.setItem('adminLockoutEndTime', lockoutEndTime.toString());
        
        toast({
          title: "Access Locked",
          description: "Too many failed attempts. Access locked for 1 minute.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Invalid credentials. ${3 - newFailedAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
    }
    
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                disabled={isLocked}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={isLocked}
              />
            </div>
            <div>
              <Label htmlFor="securityCode">Security Code</Label>
              <Input
                id="securityCode"
                type="password"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                placeholder="Enter security code"
                required
                disabled={isLocked}
              />
            </div>
            
            {isLocked && (
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 font-medium">Access Locked</p>
                <p className="text-red-500 text-sm">
                  Time remaining: {formatTime(remainingTime)}
                </p>
              </div>
            )}
            
            {failedAttempts > 0 && !isLocked && (
              <p className="text-sm text-red-500 text-center">
                {3 - failedAttempts} attempt(s) remaining
              </p>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isLocked}
            >
              {loading ? 'Authenticating...' : isLocked ? 'Access Locked' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
