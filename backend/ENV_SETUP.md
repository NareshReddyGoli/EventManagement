# Environment Variables Setup

Create a `.env` file in the backend root directory with the following variables:

## Server Configuration
```
PORT=5000
NODE_ENV=development
```

## Database
```
MONGODB_URI=mongodb://localhost:27017/event-management
```
Or use MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management
```

## JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

## CORS Configuration
Comma-separated list of allowed origins:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Twilio SMS Configuration (Optional)
Get credentials from https://www.twilio.com/console
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Cloudinary Configuration (Optional)
Get credentials from https://cloudinary.com/console
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Admin User
Default admin user created on first run:
```
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

## Example .env File
Create a file named `.env` in the backend directory with:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=change-this-secret-key-in-production
JWT_EXPIRE=7d
CORS_ORIGINS=http://localhost:5173
```

For production, make sure to:
1. Use a strong JWT_SECRET
2. Set NODE_ENV=production
3. Configure proper CORS_ORIGINS
4. Use MongoDB Atlas or secure MongoDB instance
5. Enable SMS and Cloudinary for full functionality

