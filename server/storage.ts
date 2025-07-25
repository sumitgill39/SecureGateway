import { 
  users, applications, resources, accessRequests, sessions, auditLogs,
  type User, type InsertUser, type Application, type InsertApplication,
  type Resource, type InsertResource, type AccessRequest, type InsertAccessRequest,
  type Session, type InsertSession, type AuditLog, type InsertAuditLog
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Applications
  getAllApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  
  // Resources
  getAllResources(): Promise<Resource[]>;
  getResourcesByApplication(applicationId: number): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, updates: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Access Requests
  getAllAccessRequests(): Promise<AccessRequest[]>;
  getAccessRequest(id: number): Promise<AccessRequest | undefined>;
  getAccessRequestsByUser(userId: number): Promise<AccessRequest[]>;
  getPendingAccessRequests(): Promise<AccessRequest[]>;
  createAccessRequest(request: InsertAccessRequest): Promise<AccessRequest>;
  updateAccessRequest(id: number, updates: Partial<AccessRequest>): Promise<AccessRequest | undefined>;
  
  // Sessions
  getAllSessions(): Promise<Session[]>;
  getActiveSessionsByUser(userId: number): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  terminateSession(id: number): Promise<boolean>;
  
  // Audit Logs
  getAllAuditLogs(): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: number): Promise<AuditLog[]>;
  getAuditLogsByResource(resourceId: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private applications: Map<number, Application> = new Map();
  private resources: Map<number, Resource> = new Map();
  private accessRequests: Map<number, AccessRequest> = new Map();
  private sessions: Map<number, Session> = new Map();
  private auditLogs: Map<number, AuditLog> = new Map();
  
  private currentUserId = 1;
  private currentApplicationId = 1;
  private currentResourceId = 1;
  private currentAccessRequestId = 1;
  private currentSessionId = 1;
  private currentAuditLogId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123", // In real app, this would be hashed
      fullName: "System Administrator",
      role: "Admin",
      email: "admin@company.com",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create TPO user
    const tpoUser: User = {
      id: this.currentUserId++,
      username: "john.smith",
      password: "password123",
      fullName: "John Smith",
      role: "TPO",
      email: "john.smith@company.com",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(tpoUser.id, tpoUser);

    // Create sample applications
    const ecommerceApp: Application = {
      id: this.currentApplicationId++,
      name: "E-Commerce Platform",
      owner: "John Smith",
      environment: "PROD",
      criticality: "High",
      tags: ["web", "frontend", "microservice"],
      description: "Main e-commerce platform",
      resourceCount: 12,
      createdAt: new Date(),
    };
    this.applications.set(ecommerceApp.id, ecommerceApp);

    const analyticsApp: Application = {
      id: this.currentApplicationId++,
      name: "Analytics Dashboard",
      owner: "Sarah Miller",
      environment: "STAGE",
      criticality: "Medium",
      tags: ["analytics", "dashboard", "reporting"],
      description: "Business analytics dashboard",
      resourceCount: 8,
      createdAt: new Date(),
    };
    this.applications.set(analyticsApp.id, analyticsApp);

    // Create sample resources
    const webServer: Resource = {
      id: this.currentResourceId++,
      applicationId: ecommerceApp.id,
      name: "web-prod-01",
      type: "server",
      environment: "PROD",
      host: "web-prod-01.company.com",
      tags: ["web", "nginx"],
      status: "active",
      createdAt: new Date(),
    };
    this.resources.set(webServer.id, webServer);

    const dbServer: Resource = {
      id: this.currentResourceId++,
      applicationId: ecommerceApp.id,
      name: "db-prod-01",
      type: "database",
      environment: "PROD",
      host: "db-prod-01.company.com",
      tags: ["database", "postgres"],
      status: "active",
      createdAt: new Date(),
    };
    this.resources.set(dbServer.id, dbServer);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Application operations
  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const app: Application = {
      ...insertApp,
      id: this.currentApplicationId++,
      createdAt: new Date(),
    };
    this.applications.set(app.id, app);
    return app;
  }

  async updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;
    
    const updatedApp = { ...app, ...updates };
    this.applications.set(id, updatedApp);
    return updatedApp;
  }

  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }

  // Resource operations
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResourcesByApplication(applicationId: number): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(r => r.applicationId === applicationId);
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const resource: Resource = {
      ...insertResource,
      id: this.currentResourceId++,
      createdAt: new Date(),
    };
    this.resources.set(resource.id, resource);
    return resource;
  }

  async updateResource(id: number, updates: Partial<InsertResource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...updates };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }

  // Access Request operations
  async getAllAccessRequests(): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values());
  }

  async getAccessRequest(id: number): Promise<AccessRequest | undefined> {
    return this.accessRequests.get(id);
  }

  async getAccessRequestsByUser(userId: number): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values()).filter(r => r.userId === userId);
  }

  async getPendingAccessRequests(): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values()).filter(r => r.status === "pending");
  }

  async createAccessRequest(insertRequest: InsertAccessRequest): Promise<AccessRequest> {
    const request: AccessRequest = {
      ...insertRequest,
      id: this.currentAccessRequestId++,
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      expiresAt: null,
      createdAt: new Date(),
    };
    this.accessRequests.set(request.id, request);
    return request;
  }

  async updateAccessRequest(id: number, updates: Partial<AccessRequest>): Promise<AccessRequest | undefined> {
    const request = this.accessRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.accessRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Session operations
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getActiveSessionsByUser(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId && s.status === "active");
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      ...insertSession,
      id: this.currentSessionId++,
      status: "active",
      commandCount: 0,
      startTime: new Date(),
      endTime: null,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async terminateSession(id: number): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    const updatedSession = { 
      ...session, 
      status: "terminated" as const,
      endTime: new Date()
    };
    this.sessions.set(id, updatedSession);
    return true;
  }

  // Audit Log operations
  async getAllAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getAuditLogsByUser(userId: number): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAuditLogsByResource(resourceId: number): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.resourceId === resourceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const log: AuditLog = {
      ...insertLog,
      id: this.currentAuditLogId++,
      timestamp: new Date(),
    };
    this.auditLogs.set(log.id, log);
    return log;
  }
}

export const storage = new MemStorage();
