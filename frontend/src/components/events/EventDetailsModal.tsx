import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Tag,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (event: Event) => void;
  onUnregister?: (event: Event) => void;
  isRegistered?: boolean;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegister,
  onUnregister,
  isRegistered = false
}) => {
  if (!event) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    return new Date(event.registrationDeadline) > now && event.status === 'published';
  };

  const isEventFull = () => {
    return event.registeredCount >= event.maxParticipants;
  };

  const eventTypeColors: Record<string, string> = {
    workshop: 'bg-blue-100 text-blue-800',
    seminar: 'bg-green-100 text-green-800',
    competition: 'bg-purple-100 text-purple-800',
    cultural: 'bg-pink-100 text-pink-800',
    sports: 'bg-orange-100 text-orange-800',
    academic: 'bg-indigo-100 text-indigo-800',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{event.title}</DialogTitle>
              <DialogDescription className="text-base">
                {event.description}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={eventTypeColors[event.type] || 'bg-gray-100'}>
                {event.type}
              </Badge>
              <Badge className={statusColors[event.status] || 'bg-gray-100'}>
                {event.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm text-muted-foreground">Start Date</p>
                <p className="text-sm">{formatDate(event.startDate)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm text-muted-foreground">End Date</p>
                <p className="text-sm">{formatDate(event.endDate)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm text-muted-foreground">Venue</p>
                <p className="text-sm font-medium">{event.venue?.name || 'To Be Decided'}</p>
                {event.venue?.location && (
                  <p className="text-sm text-muted-foreground">{event.venue.location}</p>
                )}
                {event.venue?.address && (
                  <p className="text-xs text-muted-foreground">{event.venue.address}</p>
                )}
                {event.venue?.mapLink && (
                  <a 
                    href={event.venue.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View on Map →
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm text-muted-foreground">Participants</p>
                <p className="text-sm">
                  <span className="font-bold">{event.registeredCount || 0}</span>
                  <span className="text-muted-foreground"> / {event.maxParticipants}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ({Math.round(((event.registeredCount || 0) / event.maxParticipants) * 100)}% filled)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm text-muted-foreground">Registration Deadline</p>
                <p className="text-sm">{formatDate(event.registrationDeadline)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm text-muted-foreground">Approval Required</p>
                <p className="text-sm">
                  {event.requiresApproval ? 'Yes - Admin approval needed' : 'No - Instant registration'}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {event.venue?.contactPerson && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium text-sm mb-2">Venue Contact Information</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {event.venue.contactPerson && <p>Contact: {event.venue.contactPerson}</p>}
                {event.venue.contactPhone && <p>Phone: {event.venue.contactPhone}</p>}
                {event.venue.contactEmail && <p>Email: {event.venue.contactEmail}</p>}
              </div>
            </div>
          )}

          {/* Venue Facilities */}
          {event.venue?.facilities && event.venue.facilities.length > 0 && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">Venue Facilities</p>
              <div className="flex flex-wrap gap-2">
                {event.venue.facilities.map((facility, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Registration Status & Action */}
          <div className="border-t pt-4">
            {isRegistered && onUnregister ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium">You are registered for this event</p>
                </div>
                <Button 
                  onClick={() => onUnregister(event)} 
                  variant="outline"
                  className="border-destructive/20 hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Unregister
                </Button>
              </div>
            ) : isEventFull() ? (
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Event is Full</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum capacity of {event.maxParticipants} participants reached
                </p>
              </div>
            ) : !isRegistrationOpen() ? (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Registration Closed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registration deadline has passed
                </p>
              </div>
            ) : onRegister ? (
              <Button 
                onClick={() => onRegister(event)} 
                className="w-full bg-gradient-primary text-lg py-6"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Register for this Event
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

