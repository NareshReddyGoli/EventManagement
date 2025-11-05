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
    <nav className="glass-card border-r border-primary/10 fixed inset-y-0 left-0 w-72 p-6 space-y-4 overflow-y-auto z-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold gradient-text">EventHub</h2>
            <p className="text-xs text-muted-foreground">University Events</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              user.role === 'admin' ? 'bg-gradient-admin text-white' :
              user.role === 'coordinator' ? 'bg-gradient-coordinator text-white' :
              'bg-gradient-student text-white'
            }`}>
              {user.role.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {user.role} Portal
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
              className={`w-full justify-start transition-all duration-300 rounded-xl ${
                isActive 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : 'hover:bg-primary/5 hover:transform hover:translate-x-2 hover:text-primary'
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <Button
          variant="outline"
          className="w-full justify-start border-destructive/20 hover:bg-destructive/10 hover:transform hover:translate-x-2 transition-all duration-300 rounded-xl"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </nav>
  );
};