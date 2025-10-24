import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Publisher } from '@/types';
import { ShieldCheck, UserPlus, Building, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RequestRole() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requestedRole, setRequestedRole] = useState<'admin' | 'superadmin'>('admin');
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (requestedRole === 'admin') {
      fetchPublishers();
    }
  }, [requestedRole]);

  const fetchPublishers = async () => {
    try {
      const data = await apiClient.getPublishers() as Publisher[];
      setPublishers(data);
    } catch (error) {
      console.error('Failed to fetch publishers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requestedRole === 'admin' && !selectedPublisher) {
      toast({
        title: 'Publisher Required',
        description: 'Please select a publisher for admin access.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.createRoleRequest({
        requested_role: requestedRole,
        requested_publisher_id: requestedRole === 'admin' ? selectedPublisher : undefined,
      });
      
      toast({
        title: 'Request Submitted',
        description: `Your ${requestedRole} access request has been submitted and is pending review.`,
      });
      
      setRequestedRole('admin');
      setSelectedPublisher('');
    } catch (error) {
      toast({
        title: 'Request Failed',
        description: 'Failed to submit role request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="p-8 bg-card/50 backdrop-blur-sm relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8"
            onClick={() => navigate(-1)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Request Role Upgrade</h1>
              <p className="text-sm text-muted-foreground">
                Submit a request for elevated permissions
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Requested Role</Label>
              <Select
                value={requestedRole}
                onValueChange={(value: 'admin' | 'superadmin') => setRequestedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Publisher Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="superadmin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Superadmin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {requestedRole === 'admin' && (
              <div className="space-y-2">
                <Label>Publisher</Label>
                <Select value={selectedPublisher} onValueChange={setSelectedPublisher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a publisher" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishers.map((pub) => (
                      <SelectItem key={pub.id} value={pub.id}>
                        {pub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the publisher organization you want admin access for
                </p>
              </div>
            )}

            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 text-sm">
                {requestedRole === 'admin' ? 'Publisher Admin' : 'Superadmin'} Permissions:
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {requestedRole === 'admin' ? (
                  <>
                    <li>• Manage users within your publisher</li>
                    <li>• View usage analytics for your organization</li>
                    <li>• Create and edit query templates</li>
                    <li>• Review user role requests</li>
                  </>
                ) : (
                  <>
                    <li>• Access all publishers and organizations</li>
                    <li>• Manage all users and admins globally</li>
                    <li>• View system-wide analytics</li>
                    <li>• Review all role requests</li>
                    <li>• Create and manage publishers</li>
                  </>
                )}
              </ul>
            </Card>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your request will be reviewed by a {requestedRole === 'admin' ? 'superadmin' : 'superadmin'}.
                You will be notified once your request is processed. Current role: <strong className="text-primary">{user?.role}</strong>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
