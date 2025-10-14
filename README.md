# Event Management System (EMS) using MERN Stack

A comprehensive event management platform built with MongoDB, Express.js, React, and Node.js. This system enables administrators, coordinators, and students to manage college events efficiently.

## ✨ Features

### 🔐 Strict Role-Based Access Control
---------------------------------------------------------------------------------------
#### 🔴 **IMPORTANT: Access Control Rules**

**ONLY ADMIN CAN CREATE EVENTS** ⚠️
- Coordinators **CANNOT** create events
- Coordinators can **ONLY** edit events assigned to them by admin
- Students **CANNOT** create or edit any events

#### User Roles:

**Admin** - Full System Control
- ✅ Create, edit, and delete events
- ✅ Create coordinators and assign them to events
- ✅ Manage all venues
- ✅ Approve/reject registrations
- ✅ Send SMS notifications
- ✅ Approve event memories
- ✅ Generate certificates
- ✅ Access full analytics

**Coordinator** - Limited Event Management
- ❌ **CANNOT** create new events (admin only)
- ✅ Edit **ONLY** events assigned by admin
- ❌ **CANNOT** delete any events
- ❌ **CANNOT** manage venues
- ✅ Manage registrations for assigned events
- ✅ Send SMS to participants of assigned events
- ✅ Approve memories for assigned events
- ✅ View analytics for assigned events

**Student** - Event Participation
- ✅ Browse and register for events
- ✅ View own registrations and status
- ✅ Download own certificates
- ✅ Upload event memories
- ❌ **CANNOT** create, edit, or delete events

### 📅 Event Management
- Create, update, and delete events
- Support for multiple event types (Workshop, Seminar, Competition, Cultural, Sports, Academic)
- Event registration with approval workflow
- Attendance tracking
- Event scheduling and venue management

### 🏛️ Venue Management
- Complete venue CRUD operations
- Venue capacity tracking
- Map links and contact information
- Facilities management

### 🎓 Certificate System
- Automatic PDF certificate generation using PDFKit
- Downloadable certificates for event participants
- Bulk certificate generation for all attendees
- Custom certificate templates

### 📸 Event Memories (Gallery)
- Photo upload by participants
- Admin approval workflow
- Public gallery for approved memories
- Caption support

### 💬 SMS Notification System
- Send SMS notifications to event participants using Twilio
- Bulk SMS for venue updates and event reminders
- Notification history tracking

### 📊 Analytics Dashboard
- Comprehensive event statistics
- Registration trends
- Attendance rates
- User distribution charts
- Event type analysis
- Feedback and ratings

### 👥 User Management
- Student registration and management
- Coordinator creation by admins
- Course and branch-based filtering
- User profiles

## 🚀 Technologies Used

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **PDFKit** - Certificate generation
- **Twilio** - SMS notifications
- **Cloudinary** - Image storage
- **Multer** - File uploads

### Frontend
- **React** & **TypeScript** - UI framework
- **TailwindCSS** - Styling
- **Shadcn/ui** - Component library
- **Recharts** - Data visualization
- **React Query** - Data fetching
- **React Router** - Navigation
- **Vite** - Build tool

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Optional Services
- **Twilio** account for SMS (optional)
- **Cloudinary** account for image uploads (optional)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EventManagement
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (see `backend/ENV_SETUP.md` for details):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGINS=http://localhost:5173

# Optional: SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin User (created automatically)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## 🎯 Default Admin Credentials

After the first run, an admin account will be created automatically:

- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123

**⚠️ Change these credentials in production!**

## 📁 Project Structure

```
EventManagement/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # Database schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth & validation
│   │   ├── utils/            # Helper functions
│   │   └── index.js          # Server entry point
│   ├── certificates/         # Generated certificates
│   ├── package.json
│   └── ENV_SETUP.md
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utilities & API
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── ENV_SETUP.md
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Venues
- `GET /api/venues` - Get all venues
- `POST /api/venues` - Create venue
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue

### Certificates
- `GET /api/certificates` - Get certificates
- `POST /api/certificates/generate` - Generate certificate
- `POST /api/certificates/bulk-generate` - Bulk generate
- `GET /api/certificates/:id/download` - Download certificate

### Event Memories
- `GET /api/event-memories` - Get memories
- `POST /api/event-memories` - Upload memory
- `POST /api/event-memories/:id/approve` - Approve memory
- `POST /api/event-memories/:id/reject` - Reject memory
- `GET /api/event-memories/pending/all` - Get pending memories

### Notifications
- `POST /api/notifications/send` - Send SMS to users
- `POST /api/notifications/send-to-event` - Send SMS to event participants
- `GET /api/notifications` - Get notification history

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/events` - Get event statistics
- `GET /api/analytics/registration-trends` - Get registration trends
- `GET /api/analytics/event-types` - Get event type statistics

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users/coordinators` - Create coordinator (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Registrations
- `GET /api/registrations` - Get registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/me/mine` - Get my registrations

## 🎨 Features in Detail

### Admin Panel (`/admin`)
- **Memory Approvals**: Review and approve/reject event photos
- **SMS Notifications**: Send bulk SMS to event participants
- **Venue Management**: Create and manage event venues

### Student Dashboard (`/student`)
- **My Certificates**: View and download participation certificates
- **My Events**: Track registered events and their status
- **My Memories**: View uploaded photos and their approval status
- **Upload Memory**: Share event photos with captions

### Main Dashboard (`/dashboard`)
- **Events Management**: Create, edit, and delete events
- **User Management**: View students and coordinators
- **Statistics**: Real-time event and user statistics

### Analytics Dashboard (`/analytics`)
- **Visual Charts**: Pie charts, bar charts, and line graphs
- **Event Statistics**: Detailed metrics for each event
- **User Distribution**: Role-based user breakdown
- **Trends Analysis**: 30-day registration trends

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- CORS protection
- Input validation
- SQL injection prevention (MongoDB)

## 📱 SMS Integration

The system supports SMS notifications via Twilio. Configure your Twilio credentials in the backend `.env` file. If not configured, the system will work in mock mode (logs to console).

### Use Cases:
- Event confirmation SMS
- Venue change notifications
- Event reminders
- Feedback requests

## 🖼️ Image Storage

Images are stored using Cloudinary. Configure your Cloudinary credentials in the backend `.env` file. If not configured, a placeholder will be used.

## 📜 Certificate Generation

Certificates are automatically generated as PDFs when:
1. Admin generates certificate for a specific user
2. Admin runs bulk generation for all event attendees

Certificates include:
- Participant name
- Event name and date
- Unique certificate number
- Issue date

## 🚢 Deployment

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Create new Web Service
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Push code to GitHub
2. Import project
3. Set `VITE_API_URL` to backend URL
4. Deploy

### MongoDB Atlas
1. Create cluster
2. Get connection string
3. Update `MONGODB_URI` in backend .env

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Team Name
- Roll Numbers: <List>
- Supervisor: <Name>
- Department: CSE/IT

## 🙏 Acknowledgments

- Shadcn/ui for beautiful components
- MongoDB team for excellent documentation
- React community for amazing tools

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: <your-email@example.com>

---

**Made with ❤️ for efficient event management**

