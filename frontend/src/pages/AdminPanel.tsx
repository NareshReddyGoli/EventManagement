import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiGet, apiPost, apiDelete, apiPut } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  MapPin, 
  Image, 
  Send,
  Users,
  Loader2
} from 'lucide-react';
import { EventMemory, Event, Venue } from '@/types';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [pendingMemories, setPendingMemories] = useState<EventMemory[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // SMS State
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [sending, setSending] = useState(false);

  // Venue State
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [venueForm, setVenueForm] = useState({
    name: '',
    location: '',
    address: '',
    capacity: 0,
    mapLink: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    facilities: [] as string[]
  });

  useEffect(() => {
    if (!user) return;
    
    if (user.role !== 'admin' && user.role !== 'coordinator') {
      navigate('/student');
      return;
    }
    
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [memoriesData, venuesData, eventsData, usersData] = await Promise.all([
        apiGet<EventMemory[]>('/api/event-memories/pending/all', true).catch(() => []),
        apiGet<Venue[]>('/api/venues', true).catch(() => []),
        apiGet<Event[]>('/api/events', true).catch(() => []),
        apiGet<any[]>('/api/users', true).catch(() => [])
      ]);
      
      setPendingMemories(memoriesData || []);
      setVenues(venuesData || []);
      setEvents(eventsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMemory = async (memoryId: string) => {
    try {
      await apiPost(`/api/event-memories/${memoryId}/approve`, {}, true);
      toast({
        title: 'Memory Approved',
        description: 'The memory has been approved and published.'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve memory',
        variant: 'destructive'
      });
    }
  };

  const handleRejectMemory = async (memoryId: string, reason: string) => {
    try {
      await apiPost(`/api/event-memories/${memoryId}/reject`, { reason }, true);
      toast({
        title: 'Memory Rejected',
        description: 'The memory has been rejected.'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject memory',
        variant: 'destructive'
      });
    }
  };

  const handleSendSMS = async () => {
    if (!smsMessage || !selectedEvent) {
      toast({
        title: 'Missing Information',
        description: 'Please select an event and enter a message',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      await apiPost('/api/notifications/send-to-event', {
        message: smsMessage,
        eventId: selectedEvent
      }, true);
      
      toast({
        title: 'SMS Sent',
        description: 'SMS notifications are being sent to all participants.'
      });
      setSmsMessage('');
      setSelectedEvent('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send SMS notifications',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleVenueSubmit = async () => {
    try {
      console.log('Submitting venue:', venueForm);
      
      // Validation
      if (!venueForm.name || !venueForm.location || !venueForm.capacity) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in Name, Location, and Capacity',
          variant: 'destructive'
        });
        return;
      }
      
      if (editingVenue) {
        const updated = await apiPut(`/api/venues/${editingVenue.id}`, venueForm, true);
        console.log('Venue updated:', updated);
        toast({
          title: 'Venue Updated',
          description: 'Venue details have been updated successfully.'
        });
      } else {
        // Don't send createdBy for admin-env user, let backend handle it
        const venueData = user?.id === 'admin-env' ? venueForm : { ...venueForm, createdBy: user?.id };
        const created = await apiPost('/api/venues', venueData, true);
        console.log('Venue created:', created);
        toast({
          title: 'Venue Created',
          description: 'New venue has been created successfully.'
        });
      }
      
      setShowVenueForm(false);
      setEditingVenue(null);
      setVenueForm({
        name: '',
        location: '',
        address: '',
        capacity: 0,
        mapLink: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        facilities: []
      });
      await loadData();
    } catch (error: any) {
      console.error('Venue submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save venue',
        variant: 'destructive'
      });
    }
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name,
      location: venue.location,
      address: venue.address || '',
      capacity: venue.capacity,
      mapLink: venue.mapLink || '',
      contactPerson: venue.contactPerson || '',
      contactPhone: venue.contactPhone || '',
      contactEmail: venue.contactEmail || '',
      facilities: venue.facilities || []
    });
    setShowVenueForm(true);
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    
    try {
      await apiDelete(`/api/venues/${venueId}`, true);
      toast({
        title: 'Venue Deleted',
        description: 'Venue has been deleted successfully.'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete venue',
        variant: 'destructive'
      });
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <main className="p-6 md:pl-64 pt-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">
              Manage venue, SMS notifications, and memory approvals
            </p>
          </div>

          <Tabs defaultValue="memories" className="w-full">
            <TabsList>
              <TabsTrigger value="memories">
                <Image className="w-4 h-4 mr-2" />
                Pending Memories ({pendingMemories.length})
              </TabsTrigger>
              <TabsTrigger value="sms">
                <MessageSquare className="w-4 h-4 mr-2" />
                SMS Notifications
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              {/* Only admin can manage venues */}
              {user?.role === 'admin' && (
                <TabsTrigger value="venues">
                  <MapPin className="w-4 h-4 mr-2" />
                  Venues
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="memories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Memory Approvals</CardTitle>
                  <CardDescription>
                    Review and approve event photos and memories uploaded by participants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingMemories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending memories to review</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingMemories.map((memory) => (
                        <Card key={memory.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            {memory.type === 'photo' && (
                              <div className="relative">
                                <img 
                                  src={memory.content} 
                                  alt={memory.caption || 'Event memory'} 
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}
                            <div className="p-4 space-y-3">
                              {memory.caption && (
                                <p className="text-sm font-medium">{memory.caption}</p>
                              )}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-medium text-muted-foreground">Event:</span>
                                  <span className="text-primary">{memory.event?.title || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-medium text-muted-foreground">Submitted by:</span>
                                  <span>{memory.user?.firstName} {memory.user?.lastName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Uploaded: {new Date(memory.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApproveMemory(memory.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="flex-1"
                                  onClick={() => {
                                    const reason = prompt('Reason for rejection (optional):');
                                    if (reason !== null) {
                                      handleRejectMemory(memory.id, reason || 'No reason provided');
                                    }
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Send SMS Notifications</CardTitle>
                  <CardDescription>
                    Send SMS notifications to all registered participants of an event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Event</label>
                    <select 
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                    >
                      <option value="">Choose an event...</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea 
                      placeholder="Enter your SMS message here..."
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      rows={4}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {smsMessage.length}/160 characters
                    </p>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handleSendSMS}
                    disabled={sending || !smsMessage || !selectedEvent}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send SMS to All Participants
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venues" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Venues</h2>
                <Button 
                  onClick={() => {
                    setEditingVenue(null);
                    setVenueForm({
                      name: '',
                      location: '',
                      address: '',
                      capacity: 0,
                      mapLink: '',
                      contactPerson: '',
                      contactPhone: '',
                      contactEmail: '',
                      facilities: []
                    });
                    setShowVenueForm(true);
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Add New Venue
                </Button>
              </div>

              {showVenueForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingVenue ? 'Edit Venue' : 'Create New Venue'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Venue Name</label>
                        <Input 
                          value={venueForm.name}
                          onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                          placeholder="Main Auditorium"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input 
                          value={venueForm.location}
                          onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })}
                          placeholder="Building A, Floor 2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Address</label>
                        <Input 
                          value={venueForm.address}
                          onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                          placeholder="Full address"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Capacity</label>
                        <Input 
                          type="number"
                          value={venueForm.capacity}
                          onChange={(e) => setVenueForm({ ...venueForm, capacity: parseInt(e.target.value) || 0 })}
                          placeholder="200"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Map Link</label>
                        <Input 
                          value={venueForm.mapLink}
                          onChange={(e) => setVenueForm({ ...venueForm, mapLink: e.target.value })}
                          placeholder="Google Maps URL"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contact Person</label>
                        <Input 
                          value={venueForm.contactPerson}
                          onChange={(e) => setVenueForm({ ...venueForm, contactPerson: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contact Phone</label>
                        <Input 
                          value={venueForm.contactPhone}
                          onChange={(e) => setVenueForm({ ...venueForm, contactPhone: e.target.value })}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contact Email</label>
                        <Input 
                          type="email"
                          value={venueForm.contactEmail}
                          onChange={(e) => setVenueForm({ ...venueForm, contactEmail: e.target.value })}
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleVenueSubmit} className="flex-1">
                        {editingVenue ? 'Update Venue' : 'Create Venue'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowVenueForm(false);
                          setEditingVenue(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venues.map(venue => (
                  <Card key={venue.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{venue.name}</CardTitle>
                      <CardDescription>{venue.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Capacity:</span> {venue.capacity} people</p>
                        {venue.address && <p><span className="font-medium">Address:</span> {venue.address}</p>}
                        {venue.contactPerson && <p><span className="font-medium">Contact:</span> {venue.contactPerson}</p>}
                        {venue.contactPhone && <p><span className="font-medium">Phone:</span> {venue.contactPhone}</p>}
                        {venue.mapLink && (
                          <a href={venue.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                            View on Map
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditVenue(venue)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeleteVenue(venue.id)}>
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {venues.length === 0 && !showVenueForm && (
                <Card>
                  <CardContent className="text-center py-12">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Venues Yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first venue to get started</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage all users in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Students</p>
                              <p className="text-2xl font-bold">{users.filter(u => u.role === 'student').length}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Coordinators</p>
                              <p className="text-2xl font-bold">{users.filter(u => u.role === 'coordinator').length}</p>
                            </div>
                            <Users className="w-8 h-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Users</p>
                              <p className="text-2xl font-bold">{users.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-2 pr-4">Name</th>
                            <th className="py-2 pr-4">Email</th>
                            <th className="py-2 pr-4">Role</th>
                            <th className="py-2 pr-4">ID/Faculty ID</th>
                            <th className="py-2 pr-4">Course/Dept</th>
                            <th className="py-2 pr-4">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-accent/50">
                              <td className="py-2 pr-4 font-medium">
                                {user.firstName} {user.lastName}
                              </td>
                              <td className="py-2 pr-4">{user.email}</td>
                              <td className="py-2 pr-4">
                                <Badge 
                                  variant={
                                    user.role === 'admin' ? 'destructive' :
                                    user.role === 'coordinator' ? 'default' :
                                    'secondary'
                                  }
                                >
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4 text-xs text-muted-foreground">
                                {user.studentId || user.facultyId || '-'}
                              </td>
                              <td className="py-2 pr-4 text-xs text-muted-foreground">
                                {user.course || user.department || '-'}
                                {user.branch ? ` - ${user.branch}` : ''}
                              </td>
                              <td className="py-2 pr-4 text-xs text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr>
                              <td className="py-6 text-center text-muted-foreground" colSpan={6}>
                                No users found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

