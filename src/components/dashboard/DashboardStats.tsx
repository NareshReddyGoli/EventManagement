import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats as StatsType } from '@/types';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';

interface DashboardStatsProps {
  stats: StatsType;
  userRole: 'admin' | 'coordinator' | 'student';
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, userRole }) => {
  const getStatsForRole = () => {
    switch (userRole) {
      case 'admin':
        return [
          {
            title: 'Total Events',
            value: stats.totalEvents,
            icon: Calendar,
            description: 'All events in system',
            color: 'bg-gradient-primary',
          },
          {
            title: 'Active Events',
            value: stats.activeEvents,
            icon: Clock,
            description: 'Currently ongoing',
            color: 'bg-gradient-success',
          },
          {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            description: 'Registered users',
            color: 'bg-gradient-coordinator',
          },
          {
            title: 'Registrations',
            value: stats.totalRegistrations,
            icon: TrendingUp,
            description: 'Total event registrations',
            color: 'bg-gradient-admin',
          },
        ];
      
      case 'coordinator':
        return [
          {
            title: 'My Events',
            value: stats.totalEvents,
            icon: Calendar,
            description: 'Events I coordinate',
            color: 'bg-gradient-coordinator',
          },
          {
            title: 'Upcoming',
            value: stats.upcomingEvents,
            icon: Clock,
            description: 'Events starting soon',
            color: 'bg-gradient-primary',
          },
          {
            title: 'Registrations',
            value: stats.totalRegistrations,
            icon: Users,
            description: 'Total participants',
            color: 'bg-gradient-success',
          },
          {
            title: 'Completed',
            value: stats.completedEvents,
            icon: CheckCircle,
            description: 'Successfully finished',
            color: 'bg-gradient-admin',
          },
        ];
      
      case 'student':
        return [
          {
            title: 'Available Events',
            value: stats.totalEvents,
            icon: Calendar,
            description: 'Events open for registration',
            color: 'bg-gradient-student',
          },
          {
            title: 'My Registrations',
            value: stats.totalRegistrations,
            icon: TrendingUp,
            description: 'Events I\'ve registered for',
            color: 'bg-gradient-primary',
          },
          {
            title: 'Upcoming',
            value: stats.upcomingEvents,
            icon: Clock,
            description: 'Events I\'ll attend',
            color: 'bg-gradient-success',
          },
          {
            title: 'Certificates',
            value: stats.completedEvents,
            icon: Award,
            description: 'Earned certificates',
            color: 'bg-gradient-coordinator',
          },
        ];
      
      default:
        return [];
    }
  };

  const statsToShow = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsToShow.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="hover:shadow-card transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <CardDescription className="text-xs mt-1">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};