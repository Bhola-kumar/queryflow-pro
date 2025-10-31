import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Card } from '@/components/ui/card';
import { Database, Zap, Shield, TrendingUp, User, Shield as AdminIcon, Crown } from 'lucide-react';

export default function Landing() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'superadmin' | null>(null);

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

  const handleRoleSelect = (role: 'user' | 'admin' | 'superadmin') => {
    localStorage.setItem('user_data', JSON.stringify({ role, publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a' }));
    setSelectedRole(role);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      signInWithGoogle(credentialResponse);
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
        </div>

        {/* Sign In Options */}
        {!selectedRole ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <Card 
              onClick={() => handleRoleSelect('user')}
              className="p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-glow cursor-pointer group"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sign in as User</h3>
                  <p className="text-sm text-muted-foreground">Access templates and copy queries</p>
                </div>
              </div>
            </Card>
            
            <Card 
              onClick={() => handleRoleSelect('admin')}
              className="p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-glow cursor-pointer group"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <AdminIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sign in as Admin</h3>
                  <p className="text-sm text-muted-foreground">Manage templates and publishers</p>
                </div>
              </div>
            </Card>
            
            <Card 
              onClick={() => handleRoleSelect('superadmin')}
              className="p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-glow cursor-pointer group"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sign in as Superadmin</h3>
                  <p className="text-sm text-muted-foreground">Full system access and analytics</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto mb-16">
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  {selectedRole === 'user' && <User className="w-8 h-8 text-primary" />}
                  {selectedRole === 'admin' && <AdminIcon className="w-8 h-8 text-primary" />}
                  {selectedRole === 'superadmin' && <Crown className="w-8 h-8 text-primary" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Sign in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Complete authentication with Google
                  </p>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.error('Login Failed')}
                    />
                  </div>
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Choose a different role
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Divider */}
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-muted-foreground bg-background">Platform Features</span>
            </div>
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
