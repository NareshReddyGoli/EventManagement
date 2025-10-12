export type UserRole = 'admin' | 'coordinator' | 'student';

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  facultyId?: string;
  course?: string;
  branch?: string;
  coordinatorEventType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  address?: string;
  capacity: number;
  mapLink?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  facilities: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'seminar' | 'competition' | 'cultural' | 'sports' | 'academic';
  startDate: Date;
  endDate: Date;
  venueId: string;
  venue?: Venue;
  coordinators: string[];
  maxParticipants: number;
  registeredCount: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  registrationDeadline: Date;
  certificateTemplateId?: string;
  requiresApproval: boolean;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  formData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  attended?: boolean;
  attendanceMarkedBy?: string;
  attendanceMarkedAt?: Date;
}

export interface Schedule {
  id: string;
  eventId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  venue?: string;
  speaker?: string;
  createdBy: string;
  createdAt: Date;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  design: 'modern' | 'classic' | 'elegant' | 'corporate';
  backgroundColor: string;
  textColor: string;
  borderStyle: string;
  logoUrl?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  eventId: string;
  userId: string;
  templateId: string;
  certificateNumber: string;
  issuedAt: Date;
  issuedBy: string;
  downloadUrl?: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comments: string;
  suggestions?: string;
  wouldRecommend: boolean;
  submittedAt: Date;
}

export interface EventMemory {
  id: string;
  eventId: string;
  userId: string;
  user?: User;
  event?: Event;
  type: 'photo' | 'note';
  content: string; // URL for photos, text for notes
  caption?: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select, radio
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface RegistrationForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  totalCoordinators: number;
  totalStudents: number;
  upcomingEvents: number;
  completedEvents: number;
}