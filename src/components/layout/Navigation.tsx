import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Home,
  PlusCircle,
  ClipboardList,
  Award,
  MapPin,
  BarChart3
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navigationConfig = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  coordinator: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'my-events', label: 'My Events', icon: Calendar },
    { id: 'registrations', label: 'Registrations', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'my-registrations', label: 'My Events', icon: ClipboardList },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'memories', label: 'Memories', icon: PlusCircle },
  ],
};

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  
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
        </div>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : 'hover:bg-card-hover'
              }`}
              onClick={() => onViewChange(item.id)}
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
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </nav>
  );
};