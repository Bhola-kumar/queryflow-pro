import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Database, LogOut, Settings, FileText } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isTemplatesActive = location.pathname === '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'superadmin') return '/superadmin';
    if (user.role === 'admin') return '/admin';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to={getDashboardLink()} className="flex items-center space-x-2 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-shadow">
                <Database className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Query Template Tool
                </h1>
              </div>
            </Link>

            {user && (
              <div className="flex items-center space-x-4">
                {user.role === 'user' && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative group ${
                      isTemplatesActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Templates
                    <span 
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform origin-left ${
                        isTemplatesActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                )}
                
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative group ${
                        isTemplatesActive 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      Templates
                      <span 
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform origin-left ${
                          isTemplatesActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </button>
                    
                    <button
                      onClick={() => navigate(user.role === 'superadmin' ? '/superadmin' : '/admin')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative group ${
                        (location.pathname === '/admin' || location.pathname === '/superadmin')
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                      <span 
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform origin-left ${
                          (location.pathname === '/admin' || location.pathname === '/superadmin') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </button>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        {user.full_name.charAt(0)}
                      </div>
                      <span className="hidden sm:inline">{user.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-primary font-semibold uppercase">{user.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'user' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/request-role">Request Role Upgrade</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
