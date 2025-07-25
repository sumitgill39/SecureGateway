import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertApplicationSchema, insertResourceSchema, insertAccessRequestSchema } from "@shared/schema";

interface AuthenticatedRequest extends Express.Request {
  user?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different message types for real-time updates
        switch (data.type) {
          case 'subscribe':
            // Subscribe to specific updates
            ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Simple session middleware
  const sessions = new Map();
  
  app.use((req: AuthenticatedRequest, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && sessions.has(token)) {
      req.user = sessions.get(token);
    }
    next();
  });

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is disabled' });
      }

      const token = `token_${Date.now()}_${user.id}`;
      sessions.set(token, user);

      // Log login
      await storage.createAuditLog({
        userId: user.id,
        sessionId: null,
        resourceId: null,
        action: 'login',
        command: null,
        output: null,
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      });

      res.json({ token, user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req: AuthenticatedRequest, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && sessions.has(token)) {
      sessions.delete(token);
    }
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({ ...req.user, password: undefined });
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const activeSessions = await storage.getAllSessions();
      const activeSessionsCount = activeSessions.filter(s => s.status === 'active').length;
      
      const pendingRequests = await storage.getPendingAccessRequests();
      const applications = await storage.getAllApplications();
      
      const stats = {
        activeSessions: activeSessionsCount,
        pendingRequests: pendingRequests.length,
        applications: applications.length,
        securityScore: 94, // Mock security score
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Applications
  app.get('/api/applications', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  app.post('/api/applications', async (req: AuthenticatedRequest, res) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'TPO')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      
      broadcast({ type: 'application_created', data: application });
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: 'Invalid application data' });
    }
  });

  app.put('/api/applications/:id', async (req: AuthenticatedRequest, res) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'TPO')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const application = await storage.updateApplication(id, updates);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      broadcast({ type: 'application_updated', data: application });
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update application' });
    }
  });

  app.delete('/api/applications/:id', async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApplication(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Application not found' });
      }

      broadcast({ type: 'application_deleted', data: { id } });
      res.json({ message: 'Application deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete application' });
    }
  });

  // Resources
  app.get('/api/resources', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch resources' });
    }
  });

  app.get('/api/applications/:id/resources', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const resources = await storage.getResourcesByApplication(applicationId);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch resources' });
    }
  });

  // Access Requests
  app.get('/api/access-requests', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      let requests;
      if (req.user.role === 'Admin' || req.user.role === 'TPO') {
        requests = await storage.getAllAccessRequests();
      } else {
        requests = await storage.getAccessRequestsByUser(req.user.id);
      }
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch access requests' });
    }
  });

  app.get('/api/access-requests/pending', async (req: AuthenticatedRequest, res) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'TPO')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const requests = await storage.getPendingAccessRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pending requests' });
    }
  });

  app.post('/api/access-requests', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const validatedData = insertAccessRequestSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const request = await storage.createAccessRequest(validatedData);
      
      // Log the request
      await storage.createAuditLog({
        userId: req.user.id,
        sessionId: null,
        resourceId: validatedData.resourceId,
        action: 'access_request_created',
        command: null,
        output: null,
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      });

      broadcast({ type: 'access_request_created', data: request });
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.put('/api/access-requests/:id/approve', async (req: AuthenticatedRequest, res) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'TPO')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const id = parseInt(req.params.id);
      const expiresAt = new Date(Date.now() + (req.body.duration || 60) * 60 * 1000);
      
      const request = await storage.updateAccessRequest(id, {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        expiresAt,
      });

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Create session
      const session = await storage.createSession({
        userId: request.userId,
        resourceId: request.resourceId,
        accessRequestId: request.id,
        accessType: request.accessType,
        expiresAt,
      });

      // Log approval
      await storage.createAuditLog({
        userId: request.userId,
        sessionId: session.id,
        resourceId: request.resourceId,
        action: 'access_request_approved',
        command: null,
        output: null,
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      });

      broadcast({ type: 'access_request_approved', data: request });
      broadcast({ type: 'session_created', data: session });
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve request' });
    }
  });

  app.put('/api/access-requests/:id/reject', async (req: AuthenticatedRequest, res) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'TPO')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const id = parseInt(req.params.id);
      const request = await storage.updateAccessRequest(id, {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Log rejection
      await storage.createAuditLog({
        userId: request.userId,
        sessionId: null,
        resourceId: request.resourceId,
        action: 'access_request_rejected',
        command: null,
        output: null,
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      });

      broadcast({ type: 'access_request_rejected', data: request });
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Failed to reject request' });
    }
  });

  // Sessions
  app.get('/api/sessions', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      let sessions;
      if (req.user.role === 'Admin' || req.user.role === 'TPO') {
        sessions = await storage.getAllSessions();
      } else {
        sessions = await storage.getActiveSessionsByUser(req.user.id);
      }
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch sessions' });
    }
  });

  app.put('/api/sessions/:id/terminate', async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Check permissions
      if (req.user.role !== 'Admin' && req.user.role !== 'TPO' && session.userId !== req.user.id) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const terminated = await storage.terminateSession(id);
      
      if (!terminated) {
        return res.status(400).json({ message: 'Failed to terminate session' });
      }

      // Log termination
      await storage.createAuditLog({
        userId: req.user.id,
        sessionId: session.id,
        resourceId: session.resourceId,
        action: 'session_terminated',
        command: null,
        output: null,
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      });

      broadcast({ type: 'session_terminated', data: { id } });
      res.json({ message: 'Session terminated' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to terminate session' });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', async (req: AuthenticatedRequest, res) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'TPO')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  });

  // Users
  app.get('/api/users', async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({ ...u, password: undefined }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req: AuthenticatedRequest, res) => {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      
      broadcast({ type: 'user_created', data: { ...user, password: undefined } });
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data' });
    }
  });

  return httpServer;
}
