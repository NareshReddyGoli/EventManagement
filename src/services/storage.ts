import { User, Event, Venue, Registration, Schedule, CertificateTemplate, Certificate, Feedback, EventMemory, RegistrationForm } from '@/types';

class StorageService {
  private getStorageKey(entity: string): string {
    return `event_management_${entity}`;
  }

  // Generic CRUD operations
  private getItems<T>(entity: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(entity));
    return data ? JSON.parse(data) : [];
  }

  private setItems<T>(entity: string, items: T[]): void {
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(items));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Users
  getUsers(): User[] {
    return this.getItems<User>('users');
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getUsers();
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    this.setItems('users', users);
    return user;
  }

  getUserByCredentials(username: string, password: string): User | null {
    const users = this.getUsers();
    // In a real app, you'd hash passwords. For demo purposes, using plain text.
    return users.find(u => u.username === username) || null;
  }

  getCurrentUser(): User | null {
    const currentUserId = localStorage.getItem('current_user_id');
    if (!currentUserId) return null;
    
    const users = this.getUsers();
    return users.find(u => u.id === currentUserId) || null;
  }

  setCurrentUser(userId: string): void {
    localStorage.setItem('current_user_id', userId);
  }

  logout(): void {
    localStorage.removeItem('current_user_id');
  }

  // Events
  getEvents(): Event[] {
    const events = this.getItems<Event>('events');
    return events.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      registrationDeadline: new Date(event.registrationDeadline),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    }));
  }

  createEvent(eventData: Omit<Event, 'id' | 'registeredCount' | 'createdAt' | 'updatedAt'>): Event {
    const events = this.getEvents();
    const event: Event = {
      ...eventData,
      id: this.generateId(),
      registeredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    events.push(event);
    this.setItems('events', events);
    return event;
  }

  updateEvent(id: string, eventData: Partial<Event>): Event | null {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;

    events[index] = { ...events[index], ...eventData, updatedAt: new Date() };
    this.setItems('events', events);
    return events[index];
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    
    this.setItems('events', filtered);
    return true;
  }

  // Venues
  getVenues(): Venue[] {
    const venues = this.getItems<Venue>('venues');
    return venues.map(venue => ({
      ...venue,
      createdAt: new Date(venue.createdAt),
    }));
  }

  createVenue(venueData: Omit<Venue, 'id' | 'createdAt'>): Venue {
    const venues = this.getVenues();
    const venue: Venue = {
      ...venueData,
      id: this.generateId(),
      createdAt: new Date(),
    };
    venues.push(venue);
    this.setItems('venues', venues);
    return venue;
  }

  deleteVenue(id: string): boolean {
    const venues = this.getVenues();
    const filtered = venues.filter(v => v.id !== id);
    if (filtered.length === venues.length) return false;
    
    this.setItems('venues', filtered);
    return true;
  }

  // Registrations
  getRegistrations(): Registration[] {
    const registrations = this.getItems<Registration>('registrations');
    return registrations.map(reg => ({
      ...reg,
      registeredAt: new Date(reg.registeredAt),
      approvedAt: reg.approvedAt ? new Date(reg.approvedAt) : undefined,
      attendanceMarkedAt: reg.attendanceMarkedAt ? new Date(reg.attendanceMarkedAt) : undefined,
    }));
  }

  createRegistration(regData: Omit<Registration, 'id' | 'registeredAt'>): Registration {
    const registrations = this.getRegistrations();
    const registration: Registration = {
      ...regData,
      id: this.generateId(),
      registeredAt: new Date(),
    };
    registrations.push(registration);
    this.setItems('registrations', registrations);

    // Update event registration count
    this.updateEventRegistrationCount(regData.eventId);
    
    return registration;
  }

  updateRegistration(id: string, regData: Partial<Registration>): Registration | null {
    const registrations = this.getRegistrations();
    const index = registrations.findIndex(r => r.id === id);
    if (index === -1) return null;

    registrations[index] = { ...registrations[index], ...regData };
    this.setItems('registrations', registrations);
    return registrations[index];
  }

  private updateEventRegistrationCount(eventId: string): void {
    const registrations = this.getRegistrations();
    const approvedRegs = registrations.filter(r => r.eventId === eventId && r.status === 'approved');
    this.updateEvent(eventId, { registeredCount: approvedRegs.length });
  }

  // Initialize demo data
  initializeDemoData(): void {
    // Check if data already exists
    if (this.getUsers().length > 0) return;

    // Create demo users
    const demoUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        username: 'admin',
        email: 'admin@university.edu',
        firstName: 'John',
        lastName: 'Admin',
        role: 'admin',
        facultyId: 'FAC001',
        department: 'Computer Science',
      },
      {
        username: 'coord1',
        email: 'coordinator@university.edu',
        firstName: 'Sarah',
        lastName: 'Wilson',
        role: 'coordinator',
        facultyId: 'FAC002',
        department: 'Engineering',
      },
      {
        username: 'student1',
        email: 'student@university.edu',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science',
      },
    ];

    demoUsers.forEach(user => this.createUser(user));

    // Create demo venues
    const demoVenues: Omit<Venue, 'id' | 'createdAt'>[] = [
      {
        name: 'Main Auditorium',
        location: 'Academic Block A, Ground Floor',
        capacity: 500,
        facilities: ['Projector', 'Sound System', 'AC', 'Stage'],
        isActive: true,
        createdBy: this.getUsers()[0].id,
      },
      {
        name: 'Computer Lab 1',
        location: 'IT Block, 2nd Floor',
        capacity: 50,
        facilities: ['Computers', 'Projector', 'Whiteboard'],
        isActive: true,
        createdBy: this.getUsers()[0].id,
      },
      {
        name: 'Conference Hall',
        location: 'Administrative Block, 3rd Floor',
        capacity: 100,
        facilities: ['Projector', 'Video Conferencing', 'AC'],
        isActive: true,
        createdBy: this.getUsers()[0].id,
      },
    ];

    demoVenues.forEach(venue => this.createVenue(venue));

    // Create demo events
    const venues = this.getVenues();
    const users = this.getUsers();
    
    const demoEvents: Omit<Event, 'id' | 'registeredCount' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on workshop covering the fundamentals of AI and ML with practical exercises.',
        type: 'workshop',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        venueId: venues[1].id,
        coordinators: [users[1].id],
        maxParticipants: 45,
        status: 'published',
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        requiresApproval: false,
        tags: ['AI', 'Machine Learning', 'Technology'],
        createdBy: users[0].id,
      },
      {
        title: 'Annual Cultural Fest',
        description: 'Join us for a celebration of arts, music, and culture featuring student performances.',
        type: 'cultural',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 3 days event
        venueId: venues[0].id,
        coordinators: [users[1].id],
        maxParticipants: 400,
        status: 'published',
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        requiresApproval: true,
        tags: ['Cultural', 'Arts', 'Music', 'Performance'],
        createdBy: users[0].id,
      },
    ];

    demoEvents.forEach(event => this.createEvent(event));
  }
}

export const storageService = new StorageService();