# SecureGateway - Secure Access Management System

A comprehensive enterprise-grade Secure Access Management System built with React, Express, and TypeScript.

## Features

- **Multi-role Authentication**: Admin, TPO (Technical Project Owner), Developer, QA roles
- **Application Management**: Register and manage application inventory with tagging
- **Access Control**: Time-bounded access requests with approval workflows
- **Session Monitoring**: Real-time session tracking with WebSocket updates
- **Audit Logging**: Comprehensive security event logging
- **User Management**: Admin-controlled user creation and role assignment
- **System Configuration**: Security and system settings management

## Prerequisites (MacBook)

Before running the application, ensure you have the following installed:

### 1. Node.js (Required)
```bash
# Install using Homebrew
brew install node

# Or download directly from https://nodejs.org/
# Verify installation
node --version
npm --version
```

### 2. Git (Usually pre-installed on Mac)
```bash
# Verify git is installed
git --version

# If not installed:
brew install git
```

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd securegateway
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install
```

### 3. Environment Setup (Optional)
The application uses in-memory storage by default, so no database setup is required for development.

## Running the Application

### Development Mode
```bash
# Start the development server
npm run dev
```

This command will:
- Start the Express backend server on port 5000
- Start the Vite frontend development server
- Enable hot module replacement for both frontend and backend
- Open your browser automatically

### Access the Application
Once the server is running, open your browser and navigate to:
```
http://localhost:5000
```

## Demo Credentials

The application comes with pre-seeded demo users:

### Administrator Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin (full system access)

### Technical Project Owner Account
- **Username**: `john.smith`
- **Password**: `password123`
- **Role**: TPO (can manage applications and approve access requests)

## Application Structure

```
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages/routes
│   │   ├── lib/         # Utilities and API clients
│   │   └── hooks/       # Custom React hooks
├── server/              # Express backend application
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes and WebSocket setup
│   └── storage.ts       # In-memory data storage
├── shared/              # Shared TypeScript types and schemas
└── components.json      # UI component configuration
```

## Available Scripts

```bash
# Development server (recommended)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Key Features Overview

### 1. Dashboard
- Real-time system statistics
- Recent access requests
- Quick action buttons
- Security score monitoring

### 2. Application Management
- Register new applications with metadata
- Tag-based resource organization
- Environment classification (DEV, QA, UAT, STAGE, PREPROD, PROD, DR)
- Criticality levels (High, Medium, Low)

### 3. Access Request Workflow
- Self-service access request portal
- Business justification requirements
- Time-bounded access (15, 30, 60, 120 minutes)
- Approval routing to appropriate TPOs
- Real-time status updates

### 4. Session Monitoring
- Live session tracking
- Terminal interface simulation
- Session termination controls
- Time remaining indicators

### 5. Audit & Compliance
- Comprehensive audit logging
- Exportable security reports
- User activity tracking
- System event monitoring

### 6. User Management (Admin Only)
- User creation and role assignment
- Account activation/deactivation
- Role-based permission matrix

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find and kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Then restart the application
   npm run dev
   ```

2. **Permission Issues**
   ```bash
   # Fix npm permissions (if needed)
   sudo chown -R $(whoami) ~/.npm
   ```

3. **Node Version Issues**
   ```bash
   # Check Node.js version (should be 18+ or 20+)
   node --version
   
   # Update if needed
   brew upgrade node
   ```

### Browser Requirements
- Modern browsers supporting ES2020+
- WebSocket support for real-time features
- JavaScript enabled

## Development Notes

- The application uses in-memory storage for development
- All data resets when the server restarts
- WebSocket connections enable real-time updates
- TypeScript provides full type safety across the stack

## Production Deployment

For production deployment, you would need to:
1. Set up a PostgreSQL database
2. Configure environment variables
3. Build the application (`npm run build`)
4. Use a process manager like PM2
5. Set up reverse proxy (nginx/Apache)
6. Configure SSL certificates

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the server logs in terminal
3. Verify all prerequisites are installed
4. Ensure no firewall blocking port 5000

## Security Note

This is a development setup with demo credentials. In production:
- Change all default passwords
- Enable HTTPS
- Configure proper authentication
- Set up database persistence
- Implement proper secret management
