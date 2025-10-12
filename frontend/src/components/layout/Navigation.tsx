import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  LogOut, 
  Home,
  ClipboardList,
  Award,
  MapPin,
  BarChart3,
  Shield,
  GraduationCap
} from 'lucide-react';
import { UserRole } from '@/types';

const navigationConfig = {
  admin: [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin', label: 'Admin Panel', icon: Shield },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  coordinator: [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin', label: 'Management', icon: Shield },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  student: [
    { path: '/student', label: 'My Dashboard', icon: Home },
    { path: '/dashboard', label: 'Browse Events', icon: Calendar },
  ],
};

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!user) return null;

  const navItems = navigationConfig[user.role as UserRole] || [];

  return (
    <nav className="glass-effect border-r border-primary/20 fixed inset-y-0 left-0 w-64 p-4 space-y-2 overflow-y-auto z-20">
      <div className="mb-8">
        <h2 className="text-xl font-bold gradient-text">University Events</h2>
        <p className="text-sm text-muted-foreground capitalize">
          {user.role} Portal
        </p>
        <div className="mt-2 p-2 bg-card rounded-lg">
          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${
              user.role === 'admin' ? 'bg-red-100 text-red-800' :
              user.role === 'coordinator' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : 'hover:bg-card-hover'
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="outline"
          className="w-full justify-start border-destructive/20 hover:bg-destructive/10"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </nav>
  );
};