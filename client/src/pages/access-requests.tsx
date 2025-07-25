import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertAccessRequestSchema } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function AccessRequests() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: accessRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/access-requests'],
  });

  const { data: applications } = useQuery({
    queryKey: ['/api/applications'],
  });

  const { data: resources } = useQuery({
    queryKey: ['/api/resources'],
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/access-requests', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-requests'] });
      form.reset();
      toast({
        title: 'Access request submitted',
        description: 'Your request has been sent for approval.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit access request.',
        variant: 'destructive',
      });
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, duration }: { id: number; duration: number }) => {
      const response = await apiRequest('PUT', `/api/access-requests/${id}/approve`, { duration });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-requests'] });
      toast({
        title: 'Request approved',
        description: 'Access has been granted.',
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PUT', `/api/access-requests/${id}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-requests'] });
      toast({
        title: 'Request rejected',
        description: 'Access request has been denied.',
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertAccessRequestSchema.omit({ userId: true })),
    defaultValues: {
      applicationId: '',
      resourceId: '',
      accessType: 'read-only',
      duration: 30,
      justification: '',
    },
  });

  const onSubmit = (data: any) => {
    createRequestMutation.mutate({
      ...data,
      applicationId: parseInt(data.applicationId),
      resourceId: parseInt(data.resourceId),
    });
  };

  const pendingRequests = accessRequests?.filter((req: any) => req.status === 'pending') || [];
  const canApprove = user?.role === 'Admin' || user?.role === 'TPO';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Request Form */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Request Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select application..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {applications?.map((app: any) => (
                            <SelectItem key={app.id} value={app.id.toString()}>
                              {app.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resource..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resources?.map((resource: any) => (
                            <SelectItem key={resource.id} value={resource.id.toString()}>
                              {resource.name} ({resource.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="read-only">Read-only</SelectItem>
                          <SelectItem value="read-write">Read-write</SelectItem>
                          <SelectItem value="emergency">Emergency break-glass</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="justification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Justification</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Explain why you need access..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {canApprove ? 'Pending Approvals' : 'My Access Requests'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-3 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(canApprove ? pendingRequests : accessRequests)?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No access requests found</p>
                ) : (
                  (canApprove ? pendingRequests : accessRequests)?.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user?.fullName || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Resource:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            Resource ID: {request.resourceId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-900 ml-1">{request.duration} minutes</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Access Type:</span>
                          <span className="font-medium text-gray-900 ml-1">{request.accessType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Application:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            App ID: {request.applicationId}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Justification:</p>
                        <p className="text-sm text-gray-900">{request.justification}</p>
                      </div>

                      {canApprove && request.status === 'pending' && (
                        <div className="flex space-x-3">
                          <Button 
                            size="sm" 
                            onClick={() => approveRequestMutation.mutate({ 
                              id: request.id, 
                              duration: request.duration 
                            })}
                            disabled={approveRequestMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => rejectRequestMutation.mutate(request.id)}
                            disabled={rejectRequestMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            More Info
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
