import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { EventCard } from '@/components/events/EventCard';
import { EventForm } from '@/components/events/EventForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardStats as StatsType, Event, Venue, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { 
  PlusCircle, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Users,
  Settings,
  Download,
  Upload
} from 'lucide-react';

interface NewCoordinator {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  course: string;
  branch: string;
  coordinatorEventType: string;
  department: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Main state
  const [currentView, setCurrentView] = useState('dashboard');
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState<StatsType>({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalUsers: 0,
    totalCoordinators: 0,
    totalStudents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });

  // ===== Admin: Users View =====
  const [usersSearch, setUsersSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  
  // Coordinator management state
  const [showNewCoordForm, setShowNewCoordForm] = useState(false);
  const [isCreatingCoordinator, setIsCreatingCoordinator] = useState(false);
  const [isDeletingCoordinator, setIsDeletingCoordinator] = useState<string | null>(null);
  const [coordSearch, setCoordSearch] = useState('');
  const [coordEventTypeFilter, setCoordEventTypeFilter] = useState<string>('all');
  const [coordDeptFilter, setCoordDeptFilter] = useState<string>('all');
  const [coordEditingId, setCoordEditingId] = useState<string | null>(null);
  
  // New coordinator form state
  const [newCoord, setNewCoord] = useState<NewCoordinator>({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    course: 'N/A',
    branch: 'N/A',
    coordinatorEventType: '',
    department: '',
  });

  const handleCreateCoordinator = async () => {
    if (!newCoord.username || !newCoord.password || !newCoord.firstName || !newCoord.lastName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingCoordinator(true);
    try {
      const result = await apiPost<{ success: boolean; message?: string }>('/api/users/coordinators', newCoord, true);
      if (result?.success) {
        toast({
          title: 'Success',
          description: 'Coordinator created successfully',
        });
        setNewCoord({
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          course: 'N/A',
          branch: 'N/A',
          coordinatorEventType: '',
          department: '',
        });
        setShowNewCoordForm(false);
        loadData(); // Refresh the data
      } else {
        throw new Error(result?.message || 'Failed to create coordinator');
      }
    } catch (error) {
      console.error('Error creating coordinator:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create coordinator',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingCoordinator(false);
    }
  };

  const handleDeleteCoordinator = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this coordinator?')) return;
    
    setIsDeletingCoordinator(userId);
    try {
      const result = await apiDelete<{ success: boolean; message?: string }>(`/api/users/${userId}`, true);
      if (result?.success) {
        toast({
          title: 'Success',
          description: 'Coordinator removed successfully',
        });
        loadData(); // Refresh the data
      } else {
        throw new Error(result?.message || 'Failed to remove coordinator');
      }
    } catch (error) {
      console.error('Error deleting coordinator:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove coordinator',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingCoordinator(null);
    }
  };

  const allCourses = useMemo(() => {
    const set = new Set<string>();
    (allUsers || []).forEach(u => { if (u.role === 'student' && u.course) set.add(u.course); });
    return Array.from(set).sort();
  }, [allUsers]);

  const allBranches = useMemo(() => {
    const set = new Set<string>();
    (allUsers || []).forEach(u => {
      if (u.role === 'student') {
        if (courseFilter === 'all' || u.course === courseFilter) {
          if (u.branch) set.add(u.branch);
        }
      }
    });
    return Array.from(set).sort();
  }, [allUsers, courseFilter]);

  const filteredStudents = useMemo(() => {
    return (allUsers || [])
      .filter(u => u.role === 'student')
      .filter(u => (courseFilter === 'all' ? true : (u.course || '') === courseFilter))
      .filter(u => (branchFilter === 'all' ? true : (u.branch || '') === branchFilter))
      .filter(u => {
        const q = usersSearch.toLowerCase();
        if (!q) return true;
        return (
          (u.firstName + ' ' + u.lastName).toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.department || '').toLowerCase().includes(q) ||
          (u.course || '').toLowerCase().includes(q) ||
          (u.branch || '').toLowerCase().includes(q)
        );
      });
  }, [allUsers, courseFilter, branchFilter, usersSearch]);

  // Get unique event types and departments from coordinators
  const coordinatorEventTypes = useMemo(() => {
    const types = new Set<string>();
    allUsers
      .filter(user => user.role === 'coordinator' && user.coordinatorEventType)
      .forEach(user => types.add(user.coordinatorEventType || ''));
    return Array.from(types).filter(Boolean).sort();
  }, [allUsers]);
  
  const coordinatorDepartments = useMemo(() => {
    const depts = new Set<string>();
    allUsers
      .filter(user => user.role === 'coordinator' && user.department)
      .forEach(user => depts.add(user.department || ''));
    return Array.from(depts).filter(Boolean).sort();
  }, [allUsers]);
  
  // Filter coordinators based on search and filters
  const filteredCoordinators = useMemo(() => {
    return (allUsers || [])
      .filter(user => {
        if (user.role !== 'coordinator') return false;
        
        // Apply search filter
        if (coordSearch) {
          const searchLower = coordSearch.toLowerCase();
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
          if (!fullName.includes(searchLower) && 
              !(user.username || '').toLowerCase().includes(searchLower) &&
              !(user.email || '').toLowerCase().includes(searchLower) &&
              !(user.department || '').toLowerCase().includes(searchLower) &&
              !(user.coordinatorEventType || '').toLowerCase().includes(searchLower) &&
              !(user.course || '').toLowerCase().includes(searchLower) &&
              !(user.branch || '').toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        
        // Apply event type filter
        if (coordEventTypeFilter !== 'all' && user.coordinatorEventType !== coordEventTypeFilter) {
          return false;
        }
        
        // Apply department filter
        if (coordDeptFilter !== 'all' && user.department !== coordDeptFilter) {
          return false;
        }
        
        return true;
      });
  }, [allUsers, coordSearch, coordEventTypeFilter, coordDeptFilter]);

  const countsByCourse = useMemo(() => {
    const map = new Map<string, number>();
    (allUsers || []).forEach(u => {
      if (u.role === 'student') {
        const key = u.course || 'Unknown';
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allUsers]);

  const countsByBranch = useMemo(() => {
    const map = new Map<string, number>();
    (allUsers || []).forEach(u => {
      if (u.role === 'student') {
        const key = u.branch || 'Unknown';
        if (courseFilter !== 'all' && u.course !== courseFilter) return;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allUsers, courseFilter]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allEvents, allVenues] = await Promise.all([
        apiGet<Event[]>(`/api/events`),
        apiGet<Venue[]>(`/api/venues`),
      ]);

      // Users (admin only)
      let totalUsers = 0;
      let totalCoordinators = 0;
      let totalStudents = 0;
      
      if (user?.role === 'admin') {
        try {
          const users = await apiGet<User[]>(`/api/users`, true);
          setAllUsers(users || []);
          totalUsers = Array.isArray(users) ? users.length : 0;
          totalCoordinators = users?.filter(u => u.role === 'coordinator').length || 0;
          totalStudents = users?.filter(u => u.role === 'student').length || 0;
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalUsers,
            totalCoordinators,
            totalStudents
          }));
        } catch {
          setAllUsers([]);
        }
      }

      // Registrations depending on role
      let registrations: any[] = [];
      try {
        if (user?.role === 'student') {
          const mine = await apiGet<any[]>(`/api/registrations/me/mine`, true);
          registrations = mine;
        } else if (user?.role === 'admin' || user?.role === 'coordinator') {
          const all = await apiGet<any[]>(`/api/registrations`, true);
          registrations = all;
        }
      } catch {}

      // Filter events based on role
      let filteredEvents = allEvents;
      if (user?.role === 'coordinator') {
        filteredEvents = allEvents.filter(event => 
          (event.coordinators || []).includes(user.id) || event.createdBy === user.id
        );
      }

      // Attach venues
      const eventsWithVenues = filteredEvents.map(event => ({
        ...event,
        venue: allVenues.find(v => v.id === event.venueId),
      }));

      setEvents(eventsWithVenues);
      setVenues(allVenues);

      // Stats
      const now = new Date();
      const upcomingEvents = filteredEvents.filter(e => new Date(e.startDate) > now && e.status === 'published').length;
      const activeEvents = filteredEvents.filter(e => e.status === 'ongoing' || e.status === 'published').length;
      const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;

      const userRegistrations = registrations.length;

      setStats({
        totalEvents: filteredEvents.length,
        activeEvents,
        totalRegistrations: userRegistrations,
        totalUsers,
        totalCoordinators,
        totalStudents,
        upcomingEvents,
        completedEvents,
      });
    } catch (e) {
      // minimal fallback
      setEvents([]);
      setVenues([]);
      setStats({ 
        totalEvents: 0, 
        activeEvents: 0, 
        totalRegistrations: 0, 
        totalUsers: 0, 
        totalCoordinators: 0, 
        totalStudents: 0, 
        upcomingEvents: 0, 
        completedEvents: 0 
      });
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await apiDelete(`/api/events/${eventId}`, true);
        await loadData();
        toast({
          title: "Event Deleted",
          description: "The event has been successfully deleted.",
        });
      } catch (e) {
        toast({
          title: "Delete Failed",
          description: "Unable to delete event.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEventSave = (event: Event) => {
    setShowEventForm(false);
    setEditingEvent(undefined);
    loadData();
  };

  const handleEventRegister = async (event: Event) => {
    if (!user) return;

    const registrationData = {
      eventId: event.id,
      userId: user.id,
      status: event.requiresApproval ? 'pending' : 'approved',
      formData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        studentId: user.studentId,
      },
    };

    try {
      await apiPost(`/api/registrations`, registrationData);
      await loadData();
      toast({
        title: "Registration Successful",
        description: event.requiresApproval 
          ? "Your registration is pending approval."
          : "You have been successfully registered for the event.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedEventType === 'all' || event.type === selectedEventType;
    return matchesSearch && matchesType;
  });

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's what's happening with your events today.
              </p>
              {user?.role === 'student' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass-effect border-primary/20">
                    <CardHeader>
                      <CardTitle>My Profile</CardTitle>
                      <CardDescription>Your academic details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Registration No.</span>
                          <div className="font-medium break-all">{user.username}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email</span>
                          <div className="font-medium break-all">{user.email}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Course</span>
                          <div className="font-medium">{user.course || '-'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Branch</span>
                          <div className="font-medium">{user.branch || '-'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <DashboardStats stats={stats} userRole={user?.role as any} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Events
                  </CardTitle>
                  <CardDescription>Latest events in the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {events.slice(0, 3).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      variant="compact"
                      onView={() => setCurrentView('events')}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Available Venues
                  </CardTitle>
                  <CardDescription>Event venues and their capacity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {venues.filter(v => v.isActive).slice(0, 3).map(venue => (
                    <div key={venue.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{venue.name}</p>
                        <p className="text-sm text-muted-foreground">{venue.location}</p>
                      </div>
                      <Badge variant="outline">
                        {venue.capacity} seats
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'users':
        if (user?.role !== 'admin') return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Only admins can view users.</p>
          </div>
        );
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Registered Students</h1>
                <p className="text-muted-foreground mt-2">View students course/branch wise</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Filter by course and branch</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Course</label>
                    <select
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={courseFilter}
                      onChange={(e) => { setCourseFilter(e.target.value); setBranchFilter('all'); }}
                    >
                      <option value="all">All Courses</option>
                      {allCourses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Branch</label>
                    <select
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                    >
                      <option value="all">All Branches</option>
                      {allBranches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input className="pl-9" placeholder="Search name, email, reg no..." value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Counts by course and branch</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">By Course</h4>
                    <div className="space-y-1 text-sm">
                      {countsByCourse.map(([c, n]) => (
                        <div key={c} className="flex justify-between">
                          <span className="text-muted-foreground">{c}</span>
                          <span className="font-medium">{n}</span>
                        </div>
                      ))}
                      {countsByCourse.length === 0 && <p className="text-muted-foreground">No data</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">By Branch{courseFilter !== 'all' ? ` (${courseFilter})` : ''}</h4>
                    <div className="space-y-1 text-sm">
                      {countsByBranch.map(([b, n]) => (
                        <div key={b} className="flex justify-between">
                          <span className="text-muted-foreground">{b}</span>
                          <span className="font-medium">{n}</span>
                        </div>
                      ))}
                      {countsByBranch.length === 0 && <p className="text-muted-foreground">No data</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Students ({filteredStudents.length})</CardTitle>
                <CardDescription>List of registered students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-primary/10">
                        <th className="py-2 pr-4">Reg. No.</th>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Course</th>
                        <th className="py-2 pr-4">Branch</th>
                        <th className="py-2 pr-4">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id} className="border-b border-primary/5 hover:bg-card">
                          <td className="py-2 pr-4 font-medium break-all">{s.username}</td>
                          <td className="py-2 pr-4">{s.firstName} {s.lastName}</td>
                          <td className="py-2 pr-4 break-all">{s.email}</td>
                          <td className="py-2 pr-4">{s.course || '-'}</td>
                          <td className="py-2 pr-4">{s.branch || '-'}</td>
                          <td className="py-2 pr-4">{s.department || '-'}</td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td className="py-6 text-center text-muted-foreground" colSpan={6}>No students found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'events':
      case 'my-events':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  {currentView === 'my-events' ? 'My Events' : 'Events'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {currentView === 'my-events' 
                    ? 'Events you are coordinating' 
                    : 'Manage and view all events'
                  }
                </p>
              </div>
              
              {(user?.role === 'admin' || user?.role === 'coordinator') && (
                <Button onClick={handleCreateEvent} className="bg-gradient-primary">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
                
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="academic">Academic</option>
                </select>
              </div>
            </div>

            {showEventForm ? (
              <EventForm
                event={editingEvent}
                onSave={handleEventSave}
                onCancel={() => {
                  setShowEventForm(false);
                  setEditingEvent(undefined);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={user?.role !== 'student' ? handleEditEvent : undefined}
                    onDelete={user?.role === 'admin' ? handleDeleteEvent : undefined}
                    onRegister={user?.role === 'student' ? handleEventRegister : undefined}
                  />
                ))}
              </div>
            )}

            {filteredEvents.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No events have been created yet'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ===== Coordinators Management (Admin) ===== */}
            {(user?.role === 'admin') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Coordinator */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create Coordinator</CardTitle>
                    <CardDescription>Admins can create coordinator accounts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Registration Number</label>
                        <Input 
                          value={newCoord.username} 
                          onChange={(e) => setNewCoord({ ...newCoord, username: e.target.value })} 
                          placeholder="e.g., 23abc123" 
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Password</label>
                        <Input 
                          type="password" 
                          value={newCoord.password} 
                          onChange={(e) => setNewCoord({ ...newCoord, password: e.target.value })} 
                          placeholder="Set a password" 
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">First Name</label>
                        <Input 
                          value={newCoord.firstName} 
                          onChange={(e) => setNewCoord({ ...newCoord, firstName: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Last Name</label>
                        <Input 
                          value={newCoord.lastName} 
                          onChange={(e) => setNewCoord({ ...newCoord, lastName: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Course</label>
                        <Input 
                          value={newCoord.course} 
                          onChange={(e) => setNewCoord({ ...newCoord, course: e.target.value })} 
                          placeholder="e.g., B. Tech" 
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Branch</label>
                        <Input 
                          value={newCoord.branch} 
                          onChange={(e) => setNewCoord({ ...newCoord, branch: e.target.value })} 
                          placeholder="e.g., CSE" 
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Department (optional)</label>
                        <Input 
                          value={newCoord.department} 
                          onChange={(e) => setNewCoord({ ...newCoord, department: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Event Type</label>
                        <Input 
                          value={newCoord.coordinatorEventType} 
                          onChange={(e) => setNewCoord({ ...newCoord, coordinatorEventType: e.target.value })} 
                          placeholder="e.g., workshop, seminar, etc." 
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={async () => {
                        try {
                          // TODO: Add API call to create coordinator
                          await apiPost('/api/users/coordinators', newCoord, true);
                          const usersResponse = await apiGet<User[]>('/api/users', true);
                          setAllUsers(usersResponse || []);
                          setNewCoord({
                            username: '',
                            firstName: '',
                            lastName: '',
                            password: '',
                            course: '',
                            branch: '',
                            coordinatorEventType: '',
                            department: '',
                          });
                          toast({
                            title: 'Coordinator created',
                            description: 'The coordinator account has been created successfully.'
                          });
                        } catch (error) {
                          console.error('Error creating coordinator:', error);
                          toast({
                            title: 'Error creating coordinator',
                            description: error.message || 'Failed to create coordinator account.',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      Create Coordinator
                    </Button>
                  </CardContent>
                </Card>

                {/* Coordinators List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Coordinators ({filteredCoordinators.length})</CardTitle>
                    <CardDescription>Manage event coordinators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search coordinators..."
                          className="pl-8 w-full"
                          value={coordSearch}
                          onChange={(e) => setCoordSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={coordEventTypeFilter}
                          onChange={(e) => setCoordEventTypeFilter(e.target.value)}
                        >
                          <option value="all">All Event Types</option>
                          {coordinatorEventTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={coordDeptFilter}
                          onChange={(e) => setCoordDeptFilter(e.target.value)}
                        >
                          <option value="all">All Departments</option>
                          {coordinatorDepartments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredCoordinators.map((coord) => (
                        <div 
                          key={coord.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                        >
                          <div>
                            <div className="font-medium">
                              {coord.firstName} {coord.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {coord.username} • {coord.coordinatorEventType || 'No event type'}
                              {coord.department && ` • ${coord.department}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewCoord({
                                  username: coord.username,
                                  firstName: coord.firstName,
                                  lastName: coord.lastName,
                                  password: '',
                                  course: coord.course || '',
                                  branch: coord.branch || '',
                                  coordinatorEventType: coord.coordinatorEventType || '',
                                  department: coord.department || '',
                                });
                                setCoordEditingId(coord.id);
                                // Scroll to form
                                document.getElementById('coordinator-form')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${coord.firstName} ${coord.lastName}?`)) {
                                  try {
                                    // TODO: Add API call to delete coordinator
                                    await apiDelete(`/api/users/${coord.id}`, true);
                                    const usersResponse = await apiGet<User[]>('/api/users', true);
                                    setAllUsers(usersResponse || []);
                                    toast({
                                      title: 'Coordinator deleted',
                                      description: 'The coordinator has been removed.'
                                    });
                                  } catch (error) {
                                    console.error('Error deleting coordinator:', error);
                                    toast({
                                      title: 'Error deleting coordinator',
                                      description: error.message || 'Failed to delete coordinator.',
                                      variant: 'destructive'
                                    });
                                  }
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {filteredCoordinators.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          No coordinators found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      default:
        return <div>Unknown view</div>;
    }
  };

  if (!user) return null;

  const renderView = (): React.ReactNode => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats stats={stats} userRole={user?.role || 'student'} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            {user?.role === 'admin' && (
              <div className="mt-12 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">User Statistics</h2>
                  <p className="text-muted-foreground">
                    View user statistics and manage coordinators
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Students</CardTitle>
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCoordinators}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeEvents}</div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Coordinator Management</CardTitle>
                    <CardDescription>Create and manage coordinator accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Create New Coordinator</h3>
                        <Button onClick={() => setShowNewCoordForm(!showNewCoordForm)}>
                          {showNewCoordForm ? 'Cancel' : 'Add Coordinator'}
                        </Button>
                      </div>
                      {showNewCoordForm && (
                        <div className="grid gap-4 p-4 border rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>First Name</Label>
                              <Input 
                                value={newCoord.firstName}
                                onChange={(e) => setNewCoord({...newCoord, firstName: e.target.value})}
                                placeholder="First Name"
                              />
                            </div>
                            <div>
                              <Label>Last Name</Label>
                              <Input 
                                value={newCoord.lastName}
                                onChange={(e) => setNewCoord({...newCoord, lastName: e.target.value})}
                                placeholder="Last Name"
                              />
                            </div>
                            <div>
                              <Label>Username</Label>
                              <Input 
                                value={newCoord.username}
                                onChange={(e) => setNewCoord({...newCoord, username: e.target.value})}
                                placeholder="Username"
                              />
                            </div>
                            <div>
                              <Label>Password</Label>
                              <Input 
                                type="password"
                                value={newCoord.password}
                                onChange={(e) => setNewCoord({...newCoord, password: e.target.value})}
                                placeholder="Password"
                              />
                            </div>
                            <div>
                              <Label>Department</Label>
                              <Input 
                                value={newCoord.department}
                                onChange={(e) => setNewCoord({...newCoord, department: e.target.value})}
                                placeholder="Department"
                              />
                            </div>
                            <div>
                              <Label>Event Type</Label>
                              <Input 
                                value={newCoord.coordinatorEventType}
                                onChange={(e) => setNewCoord({...newCoord, coordinatorEventType: e.target.value})}
                                placeholder="Event Type"
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={handleCreateCoordinator}
                            disabled={isCreatingCoordinator}
                            className="w-full"
                          >
                            {isCreatingCoordinator ? 'Creating...' : 'Create Coordinator'}
                          </Button>
                        </div>
                      )}
                      <div className="mt-8">
                        <h3 className="font-medium mb-4">Existing Coordinators</h3>
                        <div className="space-y-2">
                          {filteredCoordinators.map(coord => (
                            <div key={coord.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{coord.firstName} {coord.lastName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {coord.username} • {coord.department || 'No Department'}
                                </div>
                                {coord.coordinatorEventType && (
                                  <Badge variant="outline" className="mt-1">
                                    {coord.coordinatorEventType}
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteCoordinator(coord.id)}
                                disabled={isDeletingCoordinator === coord.id}
                              >
                                {isDeletingCoordinator === coord.id ? 'Deleting...' : 'Remove'}
                              </Button>
                            </div>
                          ))}
                          {filteredCoordinators.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No coordinators found
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      case 'events':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Events</h1>
                <p className="text-muted-foreground">
                  Manage and create events
                </p>
              </div>
              <Button onClick={() => setShowEventForm(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
            {/* Events list */}
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Users</h1>
              <p className="text-muted-foreground">
                Manage user accounts and permissions
              </p>
            </div>
            {/* Users list */}
            
            {/* Coordinators Management Section */}
            {user?.role === 'admin' && (
              <div className="mt-12 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Coordinators Management</h2>
                  <p className="text-muted-foreground">
                    Manage event coordinators and their permissions
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create Coordinator Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Coordinator</CardTitle>
                      <CardDescription>Add a new event coordinator</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Registration Number</label>
                          <Input
                            value={newCoord.username}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, username: e.target.value })
                            }
                            placeholder="e.g., 21BCE1234"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Password</label>
                          <Input
                            type="password"
                            value={newCoord.password}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, password: e.target.value })
                            }
                            placeholder="Set a password"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">First Name</label>
                          <Input
                            value={newCoord.firstName}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, firstName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Last Name</label>
                          <Input
                            value={newCoord.lastName}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, lastName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Course</label>
                          <Input
                            value={newCoord.course}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, course: e.target.value })
                            }
                            placeholder="e.g., B.Tech"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Branch</label>
                          <Input
                            value={newCoord.branch}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, branch: e.target.value })
                            }
                            placeholder="e.g., CSE"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Department</label>
                          <Input
                            value={newCoord.department}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, department: e.target.value })
                            }
                            placeholder="e.g., CSE"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Event Type</label>
                          <Input
                            value={newCoord.coordinatorEventType}
                            onChange={(e) =>
                              setNewCoord({ ...newCoord, coordinatorEventType: e.target.value })
                            }
                            placeholder="e.g., Workshop, Seminar"
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={async () => {
                          try {
                            await apiPost('/api/users/coordinators', newCoord, true);
                            const usersResponse = await apiGet<User[]>('/api/users', true);
                            setAllUsers(usersResponse || []);
                            setNewCoord({
                              username: '',
                              firstName: '',
                              lastName: '',
                              password: '',
                              course: '',
                              branch: '',
                              coordinatorEventType: '',
                              department: '',
                            });
                            toast({
                              title: 'Coordinator created',
                              description: 'The coordinator account has been created successfully.',
                            });
                          } catch (error) {
                            console.error('Error creating coordinator:', error);
                            toast({
                              title: 'Error creating coordinator',
                              description: error.message || 'Failed to create coordinator account.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        Create Coordinator
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Coordinators List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Coordinators ({filteredCoordinators.length})</CardTitle>
                      <CardDescription>Manage event coordinators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search coordinators..."
                            className="pl-8 w-full"
                            value={coordSearch}
                            onChange={(e) => setCoordSearch(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={coordEventTypeFilter}
                            onChange={(e) => setCoordEventTypeFilter(e.target.value)}
                          >
                            <option value="all">All Event Types</option>
                            {coordinatorEventTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={coordDeptFilter}
                            onChange={(e) => setCoordDeptFilter(e.target.value)}
                          >
                            <option value="all">All Departments</option>
                            {coordinatorDepartments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {filteredCoordinators.map((coord) => (
                          <div
                            key={coord.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                          >
                            <div>
                              <div className="font-medium">
                                {coord.firstName} {coord.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {coord.username} • {coord.coordinatorEventType || 'No event type'}
                                {coord.department && ` • ${coord.department}`}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCoordEditingId(coord.id);
                                  setNewCoord({
                                    username: coord.username || '',
                                    firstName: coord.firstName || '',
                                    lastName: coord.lastName || '',
                                    password: '',
                                    course: coord.course || '',
                                    branch: coord.branch || '',
                                    coordinatorEventType: coord.coordinatorEventType || '',
                                    department: coord.department || '',
                                  });
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this coordinator?')) {
                                    try {
                                      await apiDelete(`/api/users/${coord.id}`, true);
                                      toast({
                                        title: 'Coordinator deleted',
                                        description: 'The coordinator has been removed successfully.',
                                      });
                                      // Refresh users list
                                      const users = await apiGet<User[]>('/api/users', true);
                                      setAllUsers(users || []);
                                    } catch (error) {
                                      console.error('Error deleting coordinator:', error);
                                      toast({
                                        title: 'Error deleting coordinator',
                                        description: error.message || 'Failed to delete coordinator.',
                                        variant: 'destructive',
                                      });
                                    }
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                        {filteredCoordinators.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            No coordinators found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 p-6 md:pl-64 pt-6">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};