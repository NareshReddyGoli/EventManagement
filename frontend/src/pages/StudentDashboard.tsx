import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiGet, apiPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Upload, 
  Award, 
  Image as ImageIcon, 
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Certificate, Event, EventMemory, Registration } from '@/types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myMemories, setMyMemories] = useState<EventMemory[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload memory state
  const [selectedEventForMemory, setSelectedEventForMemory] = useState('');
  const [memoryCaption, setMemoryCaption] = useState('');
  const [memoryImage, setMemoryImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.role === 'student') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      console.log('[StudentDashboard] Loading data...');
      
      const [certsData, regsData, memoriesData, allEventsData] = await Promise.all([
        apiGet<Certificate[]>(`/api/certificates?userId=${user?.id}`, true).catch(err => {
          console.error('[StudentDashboard] Failed to fetch certificates:', err);
          return [];
        }),
        apiGet<Registration[]>('/api/registrations/me/mine', true).catch(err => {
          console.error('[StudentDashboard] Failed to fetch registrations:', err);
          return [];
        }),
        apiGet<EventMemory[]>(`/api/event-memories?userId=${user?.id}`, true).catch(err => {
          console.error('[StudentDashboard] Failed to fetch memories:', err);
          return [];
        }),
        apiGet<Event[]>('/api/events').catch(err => {
          console.error('[StudentDashboard] Failed to fetch events:', err);
          return [];
        })
      ]);
      
      console.log('[StudentDashboard] Received data:', {
        certificates: certsData?.length || 0,
        registrations: regsData?.length || 0,
        memories: memoriesData?.length || 0,
        allEvents: allEventsData?.length || 0
      });
      
      const safeCerts = Array.isArray(certsData) ? certsData : [];
      const safeRegs = Array.isArray(regsData) ? regsData : [];
      const safeMemories = Array.isArray(memoriesData) ? memoriesData : [];
      const safeEvents = Array.isArray(allEventsData) ? allEventsData : [];
      
      setCertificates(safeCerts);
      setRegistrations(safeRegs);
      setMyMemories(safeMemories);
      
      // Get events user is registered for with date conversion
      if (safeRegs.length > 0) {
        const eventIds = safeRegs.map(r => r.eventId);
        const userEvents = safeEvents
          .filter(e => eventIds.includes(e.id))
          .map(event => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            registrationDeadline: new Date(event.registrationDeadline)
          }));
        console.log('[StudentDashboard] User registered for', userEvents.length, 'events');
        setMyEvents(userEvents);
      } else {
        console.log('[StudentDashboard] No registrations found');
        setMyEvents([]);
      }
      
      console.log('[StudentDashboard] Data loaded successfully');
    } catch (error) {
      console.error('[StudentDashboard] Error loading data:', error);
      setCertificates([]);
      setRegistrations([]);
      setMyMemories([]);
      setMyEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certId: string) => {
    try {
      window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/${certId}/download`, '_blank');
      toast({
        title: 'Download Started',
        description: 'Your certificate download has started.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download certificate',
        variant: 'destructive'
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setMemoryImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadMemory = async () => {
    if (!selectedEventForMemory || !memoryImage) {
      toast({
        title: 'Missing Information',
        description: 'Please select an event and upload an image',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      await apiPost('/api/event-memories', {
        eventId: selectedEventForMemory,
        userId: user?.id,
        type: 'photo',
        content: memoryImage,
        caption: memoryCaption
      }, true);
      
      toast({
        title: 'Memory Uploaded',
        description: 'Your memory has been submitted for approval.'
      });
      
      setSelectedEventForMemory('');
      setMemoryCaption('');
      setMemoryImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload memory',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const getRegistrationStatus = (eventId: string) => {
    const reg = registrations.find(r => r.eventId === eventId);
    if (!reg) return null;
    
    return {
      status: reg.status,
      attended: reg.attended
    };
  };

  // Redirect non-students
  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'student') {
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold gradient-text">My Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                View your certificates, upload memories, and track your event participation. Use "Browse All Events" to discover and register for new events.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-primary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Browse All Events
            </Button>
          </div>

          <Tabs defaultValue="certificates" className="w-full">
            <TabsList>
              <TabsTrigger value="certificates">
                <Award className="w-4 h-4 mr-2" />
                My Certificates ({certificates.length})
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                My Events ({myEvents.length})
              </TabsTrigger>
              <TabsTrigger value="memories">
                <ImageIcon className="w-4 h-4 mr-2" />
                My Memories ({myMemories.length})
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Memory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="certificates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Certificates</CardTitle>
                  <CardDescription>
                    Download certificates for events you've attended
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {certificates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No certificates yet</p>
                      <p className="text-sm mt-2">Certificates will appear here after you attend events</p>
                      <div className="mt-4">
                        <Button 
                          onClick={() => navigate('/dashboard')}
                          variant="outline"
                          size="sm"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Find Events to Attend
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {certificates.map((cert: any) => (
                        <Card key={cert.id} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <Award className="w-8 h-8 text-yellow-600" />
                              <Badge variant="outline">Verified</Badge>
                            </div>
                            <h3 className="font-semibold mb-1">
                              {cert.eventId?.title || 'Event Certificate'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              Certificate No: {cert.certificateNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                            </p>
                            <Button 
                              className="w-full" 
                              size="sm"
                              onClick={() => handleDownloadCertificate(cert.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Events</CardTitle>
                  <CardDescription>
                    Events you've registered for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myEvents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No events yet</p>
                      <p className="text-sm mt-2">Register for events to see them here</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: Only published events are visible to students
                      </p>
                      <div className="mt-4">
                        <Button 
                          onClick={() => navigate('/dashboard')}
                          className="bg-gradient-primary"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Browse Available Events
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myEvents.map((event) => {
                        const regStatus = getRegistrationStatus(event.id);
                        return (
                          <Card key={event.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                  </p>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{event.type}</Badge>
                                    {regStatus && (
                                      <>
                                        <Badge 
                                          variant={regStatus.status === 'approved' ? 'default' : 'secondary'}
                                        >
                                          {regStatus.status === 'approved' ? (
                                            <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                                          ) : regStatus.status === 'pending' ? (
                                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                                          ) : (
                                            <><XCircle className="w-3 h-3 mr-1" /> Rejected</>
                                          )}
                                        </Badge>
                                        {regStatus.attended && (
                                          <Badge variant="default" className="bg-green-600">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Attended
                                          </Badge>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="memories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Uploaded Memories</CardTitle>
                  <CardDescription>
                    Photos and memories you've shared from events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myMemories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No memories uploaded yet</p>
                      <p className="text-sm mt-2">Share your event experiences in the Upload Memory tab</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myMemories.map((memory) => (
                        <Card key={memory.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            {memory.type === 'photo' && (
                              <div className="relative group">
                                <img 
                                  src={memory.content} 
                                  alt={memory.caption || 'Event memory'} 
                                  className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                              </div>
                            )}
                            <div className="p-4 space-y-2">
                              {memory.event?.title && (
                                <p className="text-xs font-medium text-primary">
                                  {memory.event.title}
                                </p>
                              )}
                              {memory.caption && (
                                <p className="text-sm">{memory.caption}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(memory.createdAt).toLocaleDateString()}
                                </p>
                                <Badge 
                                  variant={memory.approved ? 'default' : memory.rejectedBy ? 'destructive' : 'secondary'}
                                  className={memory.approved ? 'bg-green-600' : ''}
                                >
                                  {memory.approved ? 'Approved' : memory.rejectedBy ? 'Rejected' : 'Pending Review'}
                                </Badge>
                              </div>
                              {memory.rejectionReason && (
                                <p className="text-xs text-destructive mt-2">
                                  Reason: {memory.rejectionReason}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Event Memory</CardTitle>
                  <CardDescription>
                    Share your favorite moments from events you've attended
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Event</label>
                    <select 
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={selectedEventForMemory}
                      onChange={(e) => setSelectedEventForMemory(e.target.value)}
                    >
                      <option value="">Choose an event...</option>
                      {myEvents
                        .filter(e => {
                          const regStatus = getRegistrationStatus(e.id);
                          return regStatus?.status === 'approved';
                        })
                        .map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Photo</label>
                    <Input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                    {memoryImage && (
                      <div className="mt-4">
                        <img 
                          src={memoryImage} 
                          alt="Preview" 
                          className="w-full max-w-md h-64 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Caption (Optional)</label>
                    <Textarea 
                      placeholder="Share your thoughts about this moment..."
                      value={memoryCaption}
                      onChange={(e) => setMemoryCaption(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handleUploadMemory}
                    disabled={uploading || !selectedEventForMemory || !memoryImage}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Memory
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Your memory will be reviewed by an admin before being published
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

