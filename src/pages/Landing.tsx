import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Card } from '@/components/ui/card';
import { Database, Zap, Shield, TrendingUp, User, Shield as AdminIcon, Crown } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

export default function Landing() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleGoogleSuccess = (role: 'user' | 'admin' | 'superadmin') => (credentialResponse: any) => {
    try {
      localStorage.setItem('user_data', JSON.stringify({ role, publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a' }));
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

        {/* Sign In Options - Single Card with Role Slider */}
        <div className="max-w-lg mx-auto mb-16 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Choose Your Role
            </h2>
            <p className="text-sm text-muted-foreground">Slide to select your access level</p>
          </div>
          
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {/* User Card */}
              <CarouselItem>
                <Card className="group relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="relative p-6 text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Sign in as User</h3>
                      <p className="text-xs text-muted-foreground">
                        Access templates and copy queries for your daily work
                      </p>
                    </div>
                    
                    <div className="pt-2 flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess('user')}
                        onError={() => console.error('Login Failed')}
                      />
                    </div>
                  </div>
                </Card>
              </CarouselItem>

              {/* Admin Card */}
              <CarouselItem>
                <Card className="group relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="relative p-6 text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <AdminIcon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Sign in as Admin</h3>
                      <p className="text-xs text-muted-foreground">
                        Manage templates, publishers, and team members
                      </p>
                    </div>
                    
                    <div className="pt-2 flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess('admin')}
                        onError={() => console.error('Login Failed')}
                      />
                    </div>
                  </div>
                </Card>
              </CarouselItem>

              {/* Superadmin Card */}
              <CarouselItem>
                <Card className="group relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="relative p-6 text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Crown className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Sign in as Superadmin</h3>
                      <p className="text-xs text-muted-foreground">
                        Full system access with global analytics control
                      </p>
                    </div>
                    
                    <div className="pt-2 flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess('superadmin')}
                        onError={() => console.error('Login Failed')}
                      />
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>

          {/* Role Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {['User', 'Admin', 'Superadmin'].map((role, index) => (
              <button
                key={role}
                onClick={() => api?.scrollTo(index)}
                className={`transition-all duration-300 ${
                  current === index
                    ? 'w-8 h-2 bg-primary rounded-full'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full'
                }`}
                aria-label={`Select ${role} role`}
              />
            ))}
          </div>
        </div>

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
