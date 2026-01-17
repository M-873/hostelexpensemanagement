import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';
import logoImage from '@/assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        // Redirect to hostel management first for new users to select/join a hostel
        navigate('/hostel-management');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={logoImage} 
              alt="Hostel Expense Management" 
              className="h-16 w-16 object-contain rounded-2xl shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hostel Expense Management</h1>
            <p className="text-muted-foreground mt-1">Food Expense Management</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your hostel dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Select Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedRole === 'admin'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Shield className={`h-8 w-8 ${selectedRole === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold ${selectedRole === 'admin' ? 'text-primary' : 'text-foreground'}`}>
                      Admin
                    </span>
                    <span className="text-xs text-muted-foreground">Edit Access</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedRole('user')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedRole === 'user'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <User className={`h-8 w-8 ${selectedRole === 'user' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold ${selectedRole === 'user' ? 'text-primary' : 'text-foreground'}`}>
                      User
                    </span>
                    <span className="text-xs text-muted-foreground">View Only</span>
                  </button>
                </div>
              </div>

              {/* Email & Password */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                      onClick={() => alert('Password reset functionality would be implemented here')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!selectedRole || !email || !password || isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Data Retention Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-semibold text-yellow-800">Notice</h3>
          </div>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>All data will be automatically deleted after 3 months.</p>
            <p>Please make sure to export and save your data carefully.</p>
            <p>A single hostel cannot store data for more than 100 members.</p>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by M873</p>
        </div>
      </div>
    </div>
  );
}
