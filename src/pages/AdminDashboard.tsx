import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { User, RoleRequest, AnalyticsData } from '@/types';
import { Users, FileText, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, requestsData, analyticsData] = await Promise.all([
        apiClient.getUsers() as Promise<User[]>,
        apiClient.getRoleRequests() as Promise<RoleRequest[]>,
        apiClient.getAnalytics() as Promise<AnalyticsData>,
      ]);
      setUsers(usersData);
      setRoleRequests(requestsData);
      setAnalytics(analyticsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.updateRoleRequest(requestId, status);
      toast({
        title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
        description: `Role request has been ${status}.`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role request.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Publisher Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and view analytics for your organization
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold">{analytics?.total_users || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Templates</p>
                <p className="text-3xl font-bold">{analytics?.total_templates || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Copies</p>
                <p className="text-3xl font-bold">{analytics?.total_copies || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-card/50">
            <TabsTrigger value="requests">
              Role Requests
              {roleRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {roleRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Top Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="p-6 bg-card/50">
              <h2 className="text-xl font-bold mb-4">Role Requests</h2>
              <div className="space-y-4">
                {roleRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No role requests</p>
                ) : (
                  roleRequests.map((request) => (
                    <Card key={request.id} className="p-4 bg-background/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold">{request.user?.full_name}</p>
                            <Badge variant={request.status === 'pending' ? 'default' : request.status === 'approved' ? 'secondary' : 'destructive'}>
                              {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {request.status}
                            </Badge>
                            <Badge variant="outline">{request.requested_role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRoleRequest(request.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRoleRequest(request.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6 bg-card/50">
              <h2 className="text-xl font-bold mb-4">Publisher Users</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <Card key={user.id} className="p-4 bg-background/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {!user.is_active && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="p-6 bg-card/50">
              <h2 className="text-xl font-bold mb-4">Most Popular Templates</h2>
              <div className="space-y-3">
                {analytics?.top_templates?.map((template, index) => (
                  <Card key={template.document_item_id} className="p-4 bg-background/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{template.doc_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {template.total_copies} copies
                          </p>
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
