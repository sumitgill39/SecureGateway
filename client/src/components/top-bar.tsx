import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of system access and security' },
  '/applications': { title: 'Applications', subtitle: 'Manage application inventory and resources' },
  '/access-requests': { title: 'Access Requests', subtitle: 'Request and approve system access' },
  '/sessions': { title: 'Active Sessions', subtitle: 'Monitor and manage active user sessions' },
  '/audit-logs': { title: 'Audit Logs', subtitle: 'Security events and access history' },
  '/user-management': { title: 'User Management', subtitle: 'Manage users and permissions' },
  '/settings': { title: 'Settings', subtitle: 'System configuration and preferences' },
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const currentPage = pageTitles[location as keyof typeof pageTitles] || pageTitles['/'];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{currentPage.title}</h2>
          <p className="text-sm text-slate-600">{currentPage.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
              <p className="text-xs text-slate-600">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.fullName ? getInitials(user.fullName) : 'U'}
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
