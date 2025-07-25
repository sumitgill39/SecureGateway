import { useQuery, useMutation } from '@tanstack/react-query';
import { Eye, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Terminal from '@/components/terminal';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Sessions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/sessions'],
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('PUT', `/api/sessions/${sessionId}/terminate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: 'Session terminated',
        description: 'The session has been successfully terminated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to terminate session.',
        variant: 'destructive',
      });
    },
  });

  const activeSessions = sessions?.filter((session: any) => session.status === 'active') || [];
  const canManageSessions = user?.role === 'Admin' || user?.role === 'TPO';

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} min remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'terminated': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Active Sessions List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Sessions</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live monitoring</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border-b pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-3 bg-gray-300 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-300 rounded w-16"></div>
                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activeSessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active sessions</p>
                ) : (
                  activeSessions.map((session: any) => (
                    <div key={session.id} className="py-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user?.fullName || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">Resource ID: {session.resourceId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusColor(session.status)}>{session.status}</Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {session.expiresAt ? getTimeRemaining(session.expiresAt) : 'No expiry'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Started:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {new Date(session.startTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Access Type:</span>
                          <span className="font-medium text-gray-900 ml-1">{session.accessType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Commands:</span>
                          <span className="font-medium text-gray-900 ml-1">{session.commandCount || 0}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Monitor
                        </Button>
                        {(canManageSessions || session.userId === user?.id) && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => terminateSessionMutation.mutate(session.id)}
                            disabled={terminateSessionMutation.isPending}
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Terminate
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Clock className="w-4 h-4 mr-2" />
                          Extend
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Terminal Interface */}
      <div>
        <Terminal resourceName="web-prod-01" />
      </div>
    </div>
  );
}
