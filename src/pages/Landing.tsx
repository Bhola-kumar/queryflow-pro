import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Database, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Landing() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'superadmin') {
        navigate('/superadmin');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async (role: 'user' | 'admin' | 'superadmin' = 'user') => {
    try {
      // Simulate Google sign-in with different roles
      await login(role);
      // Navigation will be handled by the useEffect
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl animate-glow">
              <Database className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Query Template Tool
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your database queries with powerful templates. Access, manage, and track query usage across your organization with role-based control.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => handleGoogleSignIn('user')}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-primary/50 transition-all"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in as User
            </Button>
            
            <Button
              size="lg"
              onClick={() => handleGoogleSignIn('admin')}
              variant="outline"
              className="px-8 py-6 text-lg font-semibold"
            >
              Sign in as Admin
            </Button>
            
            <Button
              size="lg"
              onClick={() => handleGoogleSignIn('superadmin')}
              variant="outline"
              className="px-8 py-6 text-lg font-semibold"
            >
              Sign in as Superadmin
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-fade-in">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Template Library</h3>
            <p className="text-sm text-muted-foreground">
              Access pre-built query templates organized by type and category for quick reuse.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-fade-in [animation-delay:100ms]">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">One-Click Copy</h3>
            <p className="text-sm text-muted-foreground">
              Copy templates instantly with automatic usage tracking and version history.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-fade-in [animation-delay:200ms]">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Multi-tenant architecture with user, admin, and superadmin roles for secure access.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-fade-in [animation-delay:300ms]">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Track template usage, user activity, and identify popular queries across teams.
            </p>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-card/30 backdrop-blur-sm border-primary/20">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <div className="text-left space-y-3 text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Sign in with your Google account to create a user profile
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Browse and copy query templates from your organization's library
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Request admin access to manage users and view analytics
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                Track usage patterns and optimize your query workflows
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
