import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { EventCard } from '@/components/events/EventCard';
import { EventForm } from '@/components/events/EventForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardStats as StatsType, Event, Venue } from '@/types';
import { storageService } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState('dashboard');
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [stats, setStats] = useState<StatsType>({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalUsers: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEvents = storageService.getEvents();
    const allVenues = storageService.getVenues();
    const allUsers = storageService.getUsers();
    const allRegistrations = storageService.getRegistrations();

    // Filter events based on user role
    let filteredEvents = allEvents;
    if (user?.role === 'coordinator') {
      filteredEvents = allEvents.filter(event => 
        event.coordinators.includes(user.id) || event.createdBy === user.id
      );
    }

    // Add venue information to events
    const eventsWithVenues = filteredEvents.map(event => ({
      ...event,
      venue: allVenues.find(v => v.id === event.venueId),
    }));

    setEvents(eventsWithVenues);
    setVenues(allVenues);

    // Calculate stats
    const now = new Date();
    const upcomingEvents = filteredEvents.filter(e => e.startDate > now && e.status === 'published').length;
    const activeEvents = filteredEvents.filter(e => e.status === 'ongoing' || e.status === 'published').length;
    const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;
    
    let userRegistrations = 0;
    if (user?.role === 'student') {
      userRegistrations = allRegistrations.filter(r => r.userId === user.id).length;
    } else {
      userRegistrations = allRegistrations.length;
    }

    setStats({
      totalEvents: filteredEvents.length,
      activeEvents,
      totalRegistrations: userRegistrations,
      totalUsers: allUsers.length,
      upcomingEvents,
      completedEvents,
    });
  };

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const success = storageService.deleteEvent(eventId);
      if (success) {
        loadData();
        toast({
          title: "Event Deleted",
          description: "The event has been successfully deleted.",
        });
      }
    }
  };

  const handleEventSave = (event: Event) => {
    setShowEventForm(false);
    setEditingEvent(undefined);
    loadData();
  };

  const handleEventRegister = (event: Event) => {
    if (!user) return;
    
    // Create registration
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
      storageService.createRegistration(registrationData as any);
      loadData();
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
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              This feature is under development and will be available soon.
            </p>
          </div>
        );
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 p-6 md:pl-64 pt-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};