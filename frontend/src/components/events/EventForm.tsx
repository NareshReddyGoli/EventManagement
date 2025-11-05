import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Event, Venue } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

interface EventFormProps {
  event?: Event;
  onSave: (event: Event) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ event, onSave, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [venues, setVenues] = useState<Venue[]>([]);
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'workshop',
    startDate: event?.startDate 
      ? new Date(event.startDate.getTime() - event.startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : '',
    endDate: event?.endDate 
      ? new Date(event.endDate.getTime() - event.endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : '',
    venueId: event?.venueId || '',
    maxParticipants: event?.maxParticipants || 50,
    registrationDeadline: event?.registrationDeadline 
      ? new Date(event.registrationDeadline.getTime() - event.registrationDeadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : '',
    requiresApproval: event?.requiresApproval || false,
    tags: event?.tags?.join(', ') || '',
    status: event?.status || 'published',
  });

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const list = await apiGet<Venue[]>(`/api/venues`);
        setVenues(list.filter(v => v.isActive));
      } catch (e) {
        setVenues([]);
      }
    };
    fetchVenues();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
    
    // Validation
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.venueId) {
      toast({
        title: "Missing Venue",
        description: "Please select a venue for the event.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.registrationDeadline) {
      toast({
        title: "Missing Deadline",
        description: "Please set a registration deadline.",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const registrationDeadline = new Date(formData.registrationDeadline);

    if (endDate <= startDate) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    if (registrationDeadline >= startDate) {
      toast({
        title: "Invalid Registration Deadline",
        description: "Registration deadline must be before the event starts.",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      type: formData.type as Event['type'],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      venueId: formData.venueId,
      coordinators: event?.coordinators || (user!.id === 'admin-env' ? [] : [user!.id]),
      maxParticipants: Number(formData.maxParticipants),
      status: formData.status as Event['status'],
      registrationDeadline: registrationDeadline.toISOString(),
      requiresApproval: formData.requiresApproval,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdBy: event?.createdBy || (user!.id === 'admin-env' ? undefined : user!.id),
    };

    try {
      console.log('Submitting event data:', eventData);
      
      if (event) {
        const updatedEvent = await apiPut<Event>(`/api/events/${event.id}`, eventData, true);
        console.log('Event updated:', updatedEvent);
        onSave(updatedEvent);
        toast({
          title: "Event Updated",
          description: "Event has been successfully updated.",
        });
      } else {
        const newEvent = await apiPost<Event>(`/api/events`, eventData, true);
        console.log('Event created:', newEvent);
        onSave(newEvent);
        toast({
          title: "Event Created",
          description: "Event has been successfully created.",
        });
      }
    } catch (error: any) {
      console.error('Event save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{event ? 'Edit Event' : 'Create New Event'}</CardTitle>
        <CardDescription>
          {event ? 'Update event information' : 'Fill in the details to create a new event'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as Event['type'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Select 
                value={formData.venueId} 
                onValueChange={(value) => setFormData({ ...formData, venueId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} (Capacity: {venue.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="AI, Technology, Workshop"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as Event['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (Not visible to students)</SelectItem>
                  <SelectItem value="published">Published (Visible to students)</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Students can only see events with "Published" status
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requiresApproval"
                checked={formData.requiresApproval}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
              />
              <Label htmlFor="requiresApproval">Requires Approval</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};