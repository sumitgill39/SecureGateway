import { Link, useLocation } from 'wouter';
import { Shield, BarChart3, Box, Key, Terminal, ClipboardList, Users, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Applications', href: '/applications', icon: Box },
  { name: 'Access Requests', href: '/access-requests', icon: Key },
  { name: 'Active Sessions', href: '/sessions', icon: Terminal },
  { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
  { name: 'User Management', href: '/user-management', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-800 text-white flex-shrink-0">
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <Shield className="text-blue-400 w-8 h-8" />
          <div>
            <h1 className="font-bold text-lg">SAMS</h1>
            <p className="text-xs text-gray-300">Security Access Management</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
