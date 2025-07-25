# Secure Access Management System (SAMS) - replit.md

## Overview

This is a comprehensive enterprise-grade Secure Access Management System (SAMS) built with a modern full-stack architecture. The system provides role-based access control, application inventory management, access request workflows, and session monitoring capabilities for enterprise environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation of concerns:

- **Frontend**: React-based SPA using Vite as the build tool
- **Backend**: Express.js API server
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket integration
- **Authentication**: Session-based authentication with role-based access control
- **UI Framework**: shadcn/ui components with Tailwind CSS styling

## Key Components

### Frontend Architecture (`client/`)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form with Zod validation
- **Real-time Updates**: WebSocket client integration

### Backend Architecture (`server/`)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket server for live updates
- **Authentication**: Session-based auth with role validation middleware

### Database Schema (`shared/schema.ts`)
The system uses a comprehensive database schema with the following main entities:
- **Users**: Role-based user management (Admin, TPO, Developer, QA)
- **Applications**: Application inventory with environment classification
- **Resources**: Infrastructure resources linked to applications via tags
- **Access Requests**: Workflow management for access approvals
- **Sessions**: Active session tracking with time-based expiration
- **Audit Logs**: Complete audit trail for security compliance

### Shared Types (`shared/`)
- Centralized TypeScript definitions and Zod schemas
- Database models with insert/update validation schemas
- Consistent type safety across frontend and backend

## Data Flow

1. **Authentication Flow**: Users authenticate via session-based login with role validation
2. **Application Management**: TPOs can register applications and define associated resources
3. **Access Request Workflow**: 
   - Users request access to specific resources
   - Requests are routed to appropriate TPOs for approval
   - Time-bounded access sessions are created upon approval
4. **Real-time Updates**: WebSocket connections provide live updates for access requests, session changes, and system events
5. **Audit Logging**: All system interactions are logged for compliance and security monitoring

## External Dependencies

### Core Framework Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connectivity
- **ORM**: `drizzle-orm` and `drizzle-kit` for database operations
- **Real-time**: `ws` (WebSocket) for live updates
- **UI Components**: Extensive Radix UI component suite
- **State Management**: `@tanstack/react-query` for server state
- **Form Handling**: `react-hook-form` with `@hookform/resolvers`
- **Validation**: `zod` for runtime type checking

### Development Tools
- **Build Tool**: Vite with React plugin
- **Bundler**: esbuild for server-side bundling
- **TypeScript**: Full TypeScript support across the stack
- **Styling**: Tailwind CSS with PostCSS processing

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: PostgreSQL with Drizzle migrations
- **Real-time**: WebSocket server on same port as HTTP server

### Production Build
- **Frontend**: Static assets built via Vite and served from `dist/public`
- **Backend**: Bundled server application using esbuild
- **Database**: Migration management via `drizzle-kit push`
- **Environment**: Production-ready Express server with static file serving

### Key Architectural Decisions

1. **Monorepo Structure**: Chosen for shared type safety and simplified deployment
2. **Session-based Authentication**: Selected over JWT for better security in enterprise environments
3. **WebSocket Integration**: Enables real-time updates for collaborative access management
4. **Role-based Permissions**: Implements enterprise-grade RBAC with granular permissions
5. **Tag-based Resource Sharing**: Flexible infrastructure management allowing resources to belong to multiple applications
6. **Time-bounded Sessions**: Security-first approach with automatic session expiration

The system is designed to scale horizontally and provides comprehensive audit trails, making it suitable for enterprise security compliance requirements.