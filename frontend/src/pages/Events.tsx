import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Event, Registration } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  CheckCircle,
  Loader2
} from 'lucide-react';

export const Events: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[Events] Loading data...');
      
      const [eventsData, regsData] = await Promise.all([
        apiGet<Event[]>('/api/events').catch(err => {
          console.error('[Events] Failed to fetch events:', err);
          return [];
        }),
        user?.role === 'student' 
          ? apiGet<Registration[]>('/api/registrations/me/mine', true).catch(err => {
              console.error('[Events] Failed to fetch registrations:', err);
              return [];
            })
          : Promise.resolve([])
      ]);
      
      console.log('[Events] Received events:', eventsData?.length || 0);
      
      // Ensure arrays and convert dates
      const safeEvents = Array.isArray(eventsData) ? eventsData : [];
      const safeRegs = Array.isArray(regsData) ? regsData : [];
      
      const eventsWithDates = safeEvents.map(event => {
        try {
          return {
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            registrationDeadline: new Date(event.registrationDeadline),
            registeredCount: event.registeredCount || 0,
            // Venue is already populated from backend
          };
        } catch (err) {
          console.error('[Events] Error processing event:', event.title, err);
          return event;
        }
      });
      
      setEvents(eventsWithDates);
      setMyRegistrations(safeRegs);
      
      console.log('[Events] Data loaded successfully');
    } catch (error) {
      console.error('[Events] Error loading events:', error);
      setEvents([]);
      setMyRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    
    setRegistering(eventId);
    try {
      await apiPost('/api/registrations', {
        eventId,
        userId: user.id,
        status: 'approved',
        formData: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }, true);
      
      toast({
        title: 'Registration Successful',
        description: 'You have been registered for the event'
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register for event',
        variant: 'destructive'
      });
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (eventId: string) => {
    return myRegistrations.some(r => r.eventId === eventId);
  };

  const filteredEvents = events.filter(event => {
    try {
      // Only show published events
      if (event.status !== 'published') return false;
      
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || event.type === selectedType;
      return matchesSearch && matchesType;
    } catch (err) {
      console.error('[Events] Error filtering event:', event?.title, err);
      return false;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <main className="p-6 md:pl-80 pt-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="fade-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="heading-lg gradient-text">Browse Events</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                  Discover and register for upcoming university events
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-primary/20 focus:border-primary/40 rounded-xl"
                />
              </div>
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-primary/20 bg-background rounded-xl text-sm font-medium focus:border-primary/40 h-12"
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

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gradient">No Events Available</h3>
                <p className="text-muted-foreground text-lg">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'No published events available at the moment'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid-auto-fill">
              {filteredEvents.map(event => {
                const registered = isRegistered(event.id);
                const isFull = event.registeredCount >= event.maxParticipants;
                const deadlinePassed = new Date(event.registrationDeadline) < new Date();
                
                return (
                  <Card key={event.id} className="card-hover glass-effect border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg text-gradient">{event.title}</CardTitle>
                        <Badge className={`
                          ${event.type === 'workshop' ? 'bg-blue-100 text-blue-800' : ''}
                          ${event.type === 'seminar' ? 'bg-green-100 text-green-800' : ''}
                          ${event.type === 'competition' ? 'bg-purple-100 text-purple-800' : ''}
                          ${event.type === 'cultural' ? 'bg-pink-100 text-pink-800' : ''}
                          ${event.type === 'sports' ? 'bg-orange-100 text-orange-800' : ''}
                          ${event.type === 'academic' ? 'bg-indigo-100 text-indigo-800' : ''}
                        `}>
                          {event.type}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.venue?.name || 'Venue TBD'}
                        </div>
                        
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-2" />
                          {event.registeredCount} / {event.maxParticipants} registered
                        </div>
                        
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                        </div>
                      </div>

                      {user?.role === 'student' && (
                        <div className="pt-2">
                          {registered ? (
                            <Button disabled className="w-full bg-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Registered
                            </Button>
                          ) : isFull ? (
                            <Button disabled className="w-full">
                              Event Full
                            </Button>
                          ) : deadlinePassed ? (
                            <Button disabled className="w-full">
                              Registration Closed
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleRegister(event.id)}
                              disabled={registering === event.id}
                              className="w-full btn-primary shimmer-effect"
                            >
                              {registering === event.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Registering...
                                </>
                              ) : (
                                'Register Now'
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};


