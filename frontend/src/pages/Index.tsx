import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, LogIn, UserPlus } from 'lucide-react';
import logoImage from '@/assets/logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

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

        {/* Welcome Card */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Choose how you'd like to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            
            <Button
              onClick={() => navigate('/register')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
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

        {/* Demo Credentials */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a
              href="https://m-873.github.io/M873/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link group"
            >
              M873
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;