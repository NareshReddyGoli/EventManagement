import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { EventCard } from '@/components/events/EventCard';
import { EventForm } from '@/components/events/EventForm';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardStats as StatsType, Event, Venue, User, Registration } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Calendar,
  MapPin
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Main state
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  // Event management
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Students can view dashboard to browse events, but don't show create/edit/delete buttons
    // No redirect needed - all users can browse events
    
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      console.log('[Dashboard] Starting to load data...');
      
      const promises: Promise<any>[] = [
        apiGet<Event[]>(`/api/events`).catch(err => {
          console.error('[Dashboard] Failed to fetch events:', err);
          return [];
        }),
        apiGet<Venue[]>(`/api/venues`).catch(err => {
          console.error('[Dashboard] Failed to fetch venues:', err);
          return [];
        })
      ];
      
      // Students need to fetch their registrations too
      if (user?.role === 'student') {
        promises.push(
          apiGet<Registration[]>('/api/registrations/me/mine', true).catch(err => {
            console.error('[Dashboard] Failed to fetch registrations:', err);
            return [];
          })
        );
      }
      
      const results = await Promise.all(promises);
      const [allEvents, allVenues, myRegs] = results;

      console.log('[Dashboard] Received events:', allEvents?.length || 0);
      console.log('[Dashboard] Received venues:', allVenues?.length || 0);

      // Ensure we have arrays
      const safeEvents = Array.isArray(allEvents) ? allEvents : [];
      const safeVenues = Array.isArray(allVenues) ? allVenues : [];

      // Convert date strings to Date objects and attach venues
      const eventsWithVenues = safeEvents.map(event => {
        try {
          // Venue might already be populated from backend, or we need to find it
          const venue = event.venue || safeVenues.find(v => v.id === event.venueId);
          
          return {
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            registrationDeadline: new Date(event.registrationDeadline),
            venue: venue,
            registeredCount: event.registeredCount || 0,
          };
        } catch (err) {
          console.error('[Dashboard] Error processing event:', event.title, err);
          return event;
        }
      });

      setEvents(eventsWithVenues);
      setVenues(safeVenues);
      
      // Set registrations for students
      if (user?.role === 'student') {
        setRegistrations(Array.isArray(myRegs) ? myRegs : []);
      }

      // Calculate stats safely
      const now = new Date();
      const upcomingEvents = eventsWithVenues.filter(e => {
        try {
          return new Date(e.startDate) > now && e.status === 'published';
        } catch {
          return false;
        }
      }).length;
      
      const activeEvents = eventsWithVenues.filter(e => 
        e.status === 'ongoing' || e.status === 'published'
      ).length;
      
      const completedEvents = eventsWithVenues.filter(e => 
        e.status === 'completed'
      ).length;

      setStats({
        totalEvents: eventsWithVenues.length,
        activeEvents,
        upcomingEvents,
        completedEvents,
        totalRegistrations: 0,
        totalUsers: 0,
        totalCoordinators: 0,
        totalStudents: 0,
      });

      console.log('[Dashboard] Data loaded successfully');
    } catch (error) {
      console.error('[Dashboard] Error loading data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load dashboard data',
        variant: 'destructive'
      });
      // Set empty data to prevent crashes
      setEvents([]);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can create events',
        variant: 'destructive'
      });
      return;
    }
    setEditingEvent(undefined);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    // Check permissions
    if (user?.role === 'coordinator') {
      const isAssigned = event.coordinators?.includes(user.id) || event.createdBy === user.id;
      if (!isAssigned) {
        toast({
          title: 'Access Denied',
          description: 'You can only edit events you are assigned to',
          variant: 'destructive'
        });
        return;
      }
    }
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete events',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await apiDelete(`/api/events/${eventId}`, true);
      await loadData();
      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Unable to delete event.",
        variant: "destructive",
      });
    }
  };

  const handleEventSave = async (event: Event) => {
    setShowEventForm(false);
    setEditingEvent(undefined);
    await loadData();
  };

  const handleRegister = async (event: Event) => {
    if (!user || user.role !== 'student') return;
    
    try {
      await apiPost('/api/registrations', {
        eventId: event.id,
        userId: user.id,
        status: event.requiresApproval ? 'pending' : 'approved',
        formData: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }, true);
      
      toast({
        title: 'Registration Successful',
        description: event.requiresApproval 
          ? 'Your registration is pending approval' 
          : 'You have been registered for the event'
      });
      
      // Update local state immediately
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, registeredCount: (e.registeredCount || 0) + 1 }
            : e
        )
      );
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register for event',
        variant: 'destructive'
      });
    }
  };

  const handleUnregister = async (event: Event) => {
    if (!user || user.role !== 'student') return;
    
    if (!confirm('Are you sure you want to unregister from this event?')) return;
    
    try {
      const registration = registrations.find(r => r.eventId === event.id);
      if (!registration) return;
      
      await apiDelete(`/api/registrations/${registration.id}`, true);
      
      toast({
        title: 'Unregistered Successfully',
        description: 'You have been unregistered from the event'
      });
      
      // Update local state immediately
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, registeredCount: Math.max(0, (e.registeredCount || 0) - 1) }
            : e
        )
      );
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Unregister Failed',
        description: error.message || 'Failed to unregister from event',
        variant: 'destructive'
      });
    }
  };

  const isRegistered = (eventId: string) => {
    return registrations.some(r => r.eventId === eventId);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const filteredEvents = events.filter(event => {
    try {
      // Students should only see published events
      if (user?.role === 'student' && event.status !== 'published') {
        return false;
      }
      
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedEventType === 'all' || event.type === selectedEventType;
      return matchesSearch && matchesType;
    } catch (err) {
      console.error('[Dashboard] Error filtering event:', event?.title, err);
      return false;
    }
  });

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <main className="p-6 md:pl-64 pt-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {user?.role === 'student' ? 'Browse Events' : `Welcome back, ${user?.firstName}!`}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === 'admin' && "You have full administrative access to the system."}
              {user?.role === 'coordinator' && "Manage your assigned events and participants."}
              {user?.role === 'student' && "Discover and register for upcoming university events"}
            </p>
          </div>

          {/* Stats - Only show for admin/coordinator */}
          {(user?.role === 'admin' || user?.role === 'coordinator') && (
            <DashboardStats stats={stats} userRole={user?.role as any} />
          )}

          {/* Events Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">
                  {user?.role === 'student' ? 'Available Events' : 'Events'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {user?.role === 'admin' && 'Create and manage all events. Remember to set status to "Published" for students to see events.'}
                  {user?.role === 'coordinator' && 'View and manage your assigned events'}
                  {user?.role === 'student' && 'Browse and register for events'}
                </p>
              </div>
              
              {/* ONLY ADMIN CAN CREATE EVENTS */}
              {user?.role === 'admin' && (
                <Button onClick={handleCreateEvent} className="bg-gradient-primary">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>

            {/* Search and Filter */}
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

            {/* Event Form or Event List */}
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
              <>
                {filteredEvents.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No events found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || selectedEventType !== 'all' 
                          ? 'Try adjusting your search criteria' 
                          : 'No events have been created yet'}
                      </p>
                      {user?.role === 'admin' && !searchTerm && selectedEventType === 'all' && (
                        <Button onClick={handleCreateEvent} className="bg-gradient-primary">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Create Your First Event
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={user?.role !== 'student' ? handleEditEvent : undefined}
                        onDelete={user?.role === 'admin' ? handleDeleteEvent : undefined}
                        onView={handleViewDetails}
                        onRegister={user?.role === 'student' && !isRegistered(event.id) ? handleRegister : undefined}
                        onUnregister={user?.role === 'student' && isRegistered(event.id) ? handleUnregister : undefined}
                        isRegistered={user?.role === 'student' ? isRegistered(event.id) : false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Venue Quick View */}
          {venues.length > 0 && !showEventForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Available Venues
                </CardTitle>
                <CardDescription>Event venues and their capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {venues.filter(v => v.isActive).slice(0, 6).map(venue => (
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        onRegister={user?.role === 'student' && selectedEvent && !isRegistered(selectedEvent.id) ? handleRegister : undefined}
        onUnregister={user?.role === 'student' && selectedEvent && isRegistered(selectedEvent.id) ? handleUnregister : undefined}
        isRegistered={selectedEvent ? isRegistered(selectedEvent.id) : false}
      />
    </div>
  );
};

