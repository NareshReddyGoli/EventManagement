import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  Image, 
  MessageSquare,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  events: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
  users: {
    total: number;
    students: number;
    coordinators: number;
    admins: number;
  };
  registrations: {
    total: number;
    approved: number;
    pending: number;
    attended: number;
  };
  certificates: {
    total: number;
  };
  memories: {
    total: number;
    approved: number;
    pending: number;
  };
  feedback: {
    total: number;
    averageRating: number;
  };
}

interface EventStats {
  eventId: string;
  title: string;
  startDate: Date;
  status: string;
  maxParticipants: number;
  registrations: number;
  approved: number;
  attended: number;
  certificates: number;
  memories: number;
  feedback: number;
  averageRating: number;
  attendanceRate: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [eventTypeStats, setEventTypeStats] = useState<any[]>([]);
  const [registrationTrends, setRegistrationTrends] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    if (user.role !== 'admin' && user.role !== 'coordinator') {
      navigate('/student');
      return;
    }
    
    loadAnalytics();
  }, [user, navigate]);

  const loadAnalytics = async () => {
    try {
      const [dashboardData, eventsData, typesData, trendsData] = await Promise.all([
        apiGet<DashboardStats>('/api/analytics/dashboard', true).catch(() => null),
        apiGet<EventStats[]>('/api/analytics/events', true).catch(() => []),
        apiGet<any[]>('/api/analytics/event-types', true).catch(() => []),
        apiGet<any[]>('/api/analytics/registration-trends', true).catch(() => [])
      ]);
      
      setStats(dashboardData);
      setEventStats(eventsData || []);
      setEventTypeStats(typesData || []);
      setRegistrationTrends(trendsData || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'coordinator') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const userTypeData = stats ? [
    { name: 'Students', value: stats.users.students },
    { name: 'Coordinators', value: stats.users.coordinators }
    // Admin not included - admins are env-based, not in database
  ].filter(item => item.value > 0) : [];

  const eventStatusData = stats ? [
    { name: 'Active', value: stats.events.active },
    { name: 'Upcoming', value: stats.events.upcoming },
    { name: 'Completed', value: stats.events.completed }
  ] : [];

  const registrationStatusData = stats ? [
    { name: 'Approved', value: stats.registrations.approved },
    { name: 'Pending', value: stats.registrations.pending },
    { name: 'Attended', value: stats.registrations.attended }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <main className="p-6 md:pl-64 pt-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive insights into your event management system
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.events.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.events.active || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users.students || 0} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.registrations.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.registrations.attended || 0} attended
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.certificates.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Issued to attendees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Distribution of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Status</CardTitle>
                <CardDescription>Current status of all events</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Event Type Stats */}
          {eventTypeStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Events by Type</CardTitle>
                <CardDescription>Distribution of events across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventTypeStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Events" />
                    <Bar dataKey="totalRegistrations" fill="#82ca9d" name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Registration Trends */}
          {registrationTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Registration Trends (Last 30 Days)</CardTitle>
                <CardDescription>Daily registration activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registrationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      name="Registrations"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Event-wise Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
              <CardDescription>Detailed statistics for each event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Event</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Registrations</th>
                      <th className="py-2 pr-4">Attended</th>
                      <th className="py-2 pr-4">Attendance %</th>
                      <th className="py-2 pr-4">Certificates</th>
                      <th className="py-2 pr-4">Memories</th>
                      <th className="py-2 pr-4">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventStats.map((event) => (
                      <tr key={event.eventId} className="border-b hover:bg-accent/50">
                        <td className="py-2 pr-4 font-medium">{event.title}</td>
                        <td className="py-2 pr-4">
                          <span className="px-2 py-1 rounded text-xs bg-primary/10">
                            {event.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4">{event.registrations}</td>
                        <td className="py-2 pr-4">{event.attended}</td>
                        <td className="py-2 pr-4">{event.attendanceRate}%</td>
                        <td className="py-2 pr-4">{event.certificates}</td>
                        <td className="py-2 pr-4">{event.memories}</td>
                        <td className="py-2 pr-4">
                          {event.feedback > 0 ? (
                            <span className="flex items-center gap-1">
                              {event.feedback}
                              <span className="text-xs text-muted-foreground">
                                ({event.averageRating.toFixed(1)}⭐)
                              </span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                    {eventStats.length === 0 && (
                      <tr>
                        <td className="py-6 text-center text-muted-foreground" colSpan={8}>
                          No event statistics available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memories</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.memories.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.memories.approved || 0} approved, {stats?.memories.pending || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.feedback.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Avg. rating: {stats?.feedback.averageRating.toFixed(1) || '0.0'}⭐
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats && stats.registrations.approved > 0 
                    ? ((stats.registrations.attended / stats.registrations.approved) * 100).toFixed(1)
                    : '0.0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.registrations.attended || 0} of {stats?.registrations.approved || 0} attended
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

