import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onView?: (event: Event) => void;
  onRegister?: (event: Event) => void;
  onUnregister?: (event: Event) => void;
  isRegistered?: boolean;
  variant?: 'default' | 'compact';
}

const eventTypeColors = {
  workshop: 'bg-blue-100 text-blue-800',
  seminar: 'bg-green-100 text-green-800',
  competition: 'bg-purple-100 text-purple-800',
  cultural: 'bg-pink-100 text-pink-800',
  sports: 'bg-orange-100 text-orange-800',
  academic: 'bg-indigo-100 text-indigo-800',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onView,
  onRegister,
  onUnregister,
  isRegistered = false,
  variant = 'default'
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator';
  const isStudent = user?.role === 'student';
  
  // Check if coordinator is assigned to this event
  const isAssignedCoordinator = isCoordinator && (
    event.coordinators?.includes(user?.id || '') || 
    event.createdBy === user?.id
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    return event.registrationDeadline > now && event.status === 'published';
  };

  const isEventFull = () => {
    return event.registeredCount >= event.maxParticipants;
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-card transition-all duration-300 cursor-pointer"
            onClick={() => onView?.(event)}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
            <Badge className={eventTypeColors[event.type]}>
              {event.type}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            {event.registeredCount} / {event.maxParticipants} registered
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-card transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {event.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={eventTypeColors[event.type]}>
              {event.type}
            </Badge>
            <Badge className={statusColors[event.status]}>
              {event.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <div>
              <p className="font-medium">Start Date</p>
              <p className="text-muted-foreground">{formatDate(event.startDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <div>
              <p className="font-medium">End Date</p>
              <p className="text-muted-foreground">{formatDate(event.endDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <div>
              <p className="font-medium">Venue</p>
              <p className="text-muted-foreground">{event.venue?.name || 'TBD'}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-2 text-primary" />
            <div>
              <p className="font-medium">Participants</p>
              <p className="text-muted-foreground">
                {event.registeredCount} / {event.maxParticipants}
              </p>
            </div>
          </div>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(event)}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            )}
            
            {/* Only admin or assigned coordinators can edit */}
            {(isAdmin || isAssignedCoordinator) && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            
            {/* Only admin can delete events */}
            {isAdmin && onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(event.id)}
                className="border-destructive/20 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>

          {isStudent && (onRegister || onUnregister) && (
            <div className="flex gap-2">
              {isRegistered && onUnregister ? (
                <Button 
                  onClick={() => onUnregister(event)} 
                  variant="outline"
                  className="border-destructive/20 hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Unregister
                </Button>
              ) : isEventFull() ? (
                <Button disabled>
                  Event Full
                </Button>
              ) : isRegistrationOpen() && onRegister ? (
                <Button onClick={() => onRegister(event)} className="bg-gradient-primary">
                  Register Now
                </Button>
              ) : (
                <Button disabled>
                  Registration Closed
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};