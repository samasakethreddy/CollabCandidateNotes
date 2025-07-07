# Collaborative Candidate Notes MVP

A real-time collaborative application that allows recruiters and hiring managers to share candidate feedback and receive tag-based notifications.

## 🚀 Features

- **Real-time Notes**: Instant messaging for candidate feedback
- **User Authentication**: Secure login/register system
- **Candidate Management**: Create and manage candidate profiles
- **Tag-based Notifications**: @username tagging with real-time notifications
- **Global Notifications**: Dashboard showing all tagged messages
- **Socket.IO Integration**: Real-time communication between users

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud service)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd collaborative-candidate-notes-ap2
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env  # If .env.example exists, or create .env manually
```

**Configure Environment Variables** (`server/.env`):
```env
MONGO_URI=mongodb://localhost:27017/candidate-notes
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/candidate-notes

JWT_SECRET=your-super-secret-jwt-key-here
PORT=5001
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install
```

### 4. Start the Application

**Option 1: Run both servers simultaneously**
```bash
# Terminal 1 - Start backend server
cd server && npm start

# Terminal 2 - Start frontend server
cd client && npm start
```

**Option 2: Use a process manager (recommended for development)**
```bash
# Install concurrently globally
npm install -g concurrently

# From the root directory, run both servers
concurrently "cd server && npm start" "cd client && npm start"
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📖 Usage Guide

### 1. Getting Started
1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. You'll be redirected to the Dashboard

### 2. Creating Candidates
1. Click the "Add New Candidate" button on the Dashboard
2. Fill in the candidate information:
   - Name
   - Email
   - Position
   - Status
3. Click "Create Candidate" to save

### 3. Adding Notes
1. Click on any candidate from the Dashboard
2. You'll be taken to the candidate's notes page
3. Type your note in the input field
4. Press Enter or click "Send" to post the note

### 4. Using Tags (@mentions)
1. In any note, type `@username` to tag another user
2. The tagged user will receive a real-time notification
3. Notifications appear in the notification bell on the Dashboard
4. Click on a notification to navigate to the relevant candidate's notes

### 5. Real-time Collaboration
- Notes appear instantly for all users viewing the same candidate
- Connection status is shown at the top of the notes page
- Multiple users can collaborate on the same candidate simultaneously

## 🧪 Testing Real-time Functionality

### Test with Multiple Users
1. **Start the application** (both servers running)
2. **Create test users**:
   - Open an incognito/private browser window
   - Register User 1 (e.g., "john@example.com")
   - Open another incognito window
   - Register User 2 (e.g., "jane@example.com")

3. **Test real-time notes**:
   - Login as User 1
   - Create a candidate
   - Click on the candidate to open notes
   - Verify connection status shows "Connected"
   - Send a note

4. **Test real-time updates**:
   - In the second browser window, login as User 2
   - Navigate to the same candidate
   - Send a note from User 2
   - Verify the note appears immediately for User 1
   - Check for the "✨ New note received!" notification

5. **Test tagging**:
   - From User 1, send a note with "@jane" (replace with actual username)
   - Verify User 2 receives a notification in their dashboard
   - Click the notification to navigate to the candidate's notes

## 🏗️ Technical Architecture

### Backend (Node.js + Express + Socket.IO)
- **server.js**: Main server with Socket.IO setup
- **Controllers**: Handle business logic for notes, candidates, users, and notifications
- **Models**: MongoDB schemas for data persistence
- **Middleware**: Authentication and request validation
- **Routes**: API endpoints for CRUD operations

### Frontend (React + Socket.IO Client)
- **SocketContext**: Manages single socket connection
- **Components**: Reusable UI components
- **Pages**: Main application views
- **Services**: API communication layer

### Database (MongoDB)
- **User**: Authentication and profile data
- **Candidate**: Candidate information and metadata
- **Note**: Real-time messages with author and candidate references
- **Notification**: Tag-based notification tracking

## 🔧 Environment Setup

### Backend Dependencies
```bash
cd server && npm install
```
Key packages:
- `express`: Web framework
- `socket.io`: Real-time communication
- `mongoose`: MongoDB ODM
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `cors`: Cross-origin resource sharing

### Frontend Dependencies
```bash
cd client && npm install
```
Key packages:
- `react`: UI library
- `react-router-dom`: Client-side routing
- `socket.io-client`: Real-time client
- `axios`: HTTP client for API calls

## 🐛 Troubleshooting

### Common Issues

**Notes not updating in real-time:**
1. Check browser console for socket connection logs
2. Verify the connection status shows "Connected"
3. Check server logs for room joining/leaving messages
4. Ensure both users are viewing the same candidate

**Socket connection issues:**
1. Verify both servers are running (port 3000 and 5001)
2. Check CORS settings in server.js
3. Clear browser cache and reload
4. Check firewall settings

**Tagging not working:**
1. Ensure usernames match exactly (case-sensitive)
2. Check notification logs in server console
3. Verify user rooms are being joined correctly

**MongoDB connection issues:**
1. Ensure MongoDB is running locally or Atlas connection is correct
2. Check MONGO_URI in .env file
3. Verify network connectivity

### Debug Mode
Enable debug logging by adding to `server/.env`:
```env
DEBUG=socket.io:*
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update API endpoints to point to your production backend

## 🔮 Future Enhancements

- Message timestamps and editing
- Typing indicators
- File attachments
- Read receipts
- Message search functionality
- User roles and permissions
- Email notifications
- Mobile app support

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Candidate Endpoints
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/:id` - Get candidate by ID
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Notes Endpoints
- `GET /api/notes/candidate/:candidateId` - Get notes for candidate
- `POST /api/notes` - Create new note

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request