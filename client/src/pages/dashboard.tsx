import { useQuery } from '@tanstack/react-query';
import { Terminal, Clock, Box, Shield, ArrowUp, Plus, TriangleAlert } from 'lucide-react';
import StatsCard from '@/components/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useWebSocket } from '@/lib/websocket';
import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

export default function Dashboard() {
  const { user } = useAuth();
  const { subscribe } = useWebSocket();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/access-requests'],
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((data: any) => {
      if (data.type === 'access_request_created' || data.type === 'access_request_approved' || data.type === 'session_created') {
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/access-requests'] });
      }
    });

    return unsubscribe;
  }, [subscribe]);

  if (statsLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const recentRequestsData = recentRequests?.slice(0, 3) || [];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Sessions"
          value={stats?.activeSessions || 0}
          icon={Terminal}
          iconColor="bg-blue-100 text-blue-600"
          trend={{ value: "12%", isPositive: true, label: "vs last week" }}
        />
        <StatsCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon={Clock}
          iconColor="bg-yellow-100 text-yellow-600"
          trend={{ value: "3%", isPositive: false, label: "vs last week" }}
        />
        <StatsCard
          title="Applications"
          value={stats?.applications || 0}
          icon={Box}
          iconColor="bg-green-100 text-green-600"
          trend={{ value: "5 new", isPositive: true, label: "this month" }}
        />
        <StatsCard
          title="Security Score"
          value={`${stats?.securityScore || 0}%`}
          icon={Shield}
          iconColor="bg-green-100 text-green-600"
          trend={{ value: "2%", isPositive: true, label: "improvement" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Access Requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Access Requests</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-3 bg-gray-300 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRequestsData.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent access requests</p>
                  ) : (
                    recentRequestsData.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{user?.fullName || 'Unknown User'}</p>
                            <p className="text-sm text-slate-600">Resource ID: {request.resourceId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={
                              request.status === 'pending' ? 'secondary' :
                              request.status === 'approved' ? 'default' : 'destructive'
                            }
                          >
                            {request.status}
                          </Badge>
                          <span className="text-sm text-slate-600">{request.duration} min</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Terminal className="w-4 h-4 mr-2" />
                Request Access
              </Button>
              <Button className="w-full justify-start bg-green-50 text-green-700 border-green-200 hover:bg-green-100" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Register Application
              </Button>
              <Button className="w-full justify-start bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" variant="outline">
                <Terminal className="w-4 h-4 mr-2" />
                View Sessions
              </Button>
              <Button className="w-full justify-start bg-red-50 text-red-700 border-red-200 hover:bg-red-100" variant="outline">
                <TriangleAlert className="w-4 h-4 mr-2" />
                Emergency Access
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
