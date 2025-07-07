# Collaborative Candidate Notes MVP

A real-time collaborative application that allows recruiters and hiring managers to share candidate feedback and receive tag-based notifications.

## Features

- **Real-time Notes**: Instant messaging for candidate feedback
- **User Authentication**: Secure login/register system
- **Candidate Management**: Create and manage candidate profiles
- **Tag-based Notifications**: @username tagging with real-time notifications
- **Global Notifications**: Dashboard showing all tagged messages

## Real-time Functionality

The application uses Socket.IO for real-time communication:

- **Room-based messaging**: Each candidate has their own room
- **Instant updates**: Notes appear immediately for all users in the same room
- **Connection status**: Visual indicators show socket connection status
- **Tag notifications**: Real-time notifications when users are tagged

## Recent Fixes

### Issue: Notes were not updating in real-time

**Root Cause**: Multiple socket connections were being created, causing conflicts and preventing proper room joining.

**Solution**: 
1. Created a centralized `SocketContext` to manage a single socket connection
2. Updated components to use the shared socket instead of creating their own
3. Added proper room joining/leaving logic in the Notes component
4. Added comprehensive logging for debugging

### Key Changes:

1. **SocketContext.js**: Centralized socket management
2. **Notes.js**: Proper room joining and real-time event handling
3. **Dashboard.js**: Uses shared socket for notifications
4. **App.js**: Wrapped with SocketProvider

## How to Test Real-time Functionality

1. **Start the servers**:
   ```bash
   # Terminal 1 - Start backend
   cd server && npm start
   
   # Terminal 2 - Start frontend
   cd client && npm start
   ```

2. **Create test users**:
   - Register 2 different users (e.g., "John" and "Jane")
   - Note down their usernames for tagging

3. **Test real-time notes**:
   - Login as User 1
   - Create a candidate
   - Click on the candidate to open notes
   - Verify the connection status shows "Connected"
   - Send a note

4. **Test real-time updates**:
   - Open a second browser window/tab
   - Login as User 2
   - Navigate to the same candidate
   - Send a note from User 2
   - Verify the note appears immediately for User 1
   - Check for the "✨ New note received!" notification

5. **Test tagging**:
   - From User 1, send a note with "@Jane" (replace with actual username)
   - Verify User 2 receives a notification in their dashboard
   - Click the notification to navigate to the candidate's notes

## Technical Architecture

### Backend (Node.js + Express + Socket.IO)
- **server.js**: Main server with Socket.IO setup
- **noteController.js**: Handles note creation and real-time emission
- **socket events**: join_room, leave_room, new_note, new_notification

### Frontend (React + Socket.IO Client)
- **SocketContext**: Manages single socket connection
- **Notes.js**: Real-time notes interface with room management
- **Dashboard.js**: Global notifications and candidate management

### Database (MongoDB)
- **Note**: Stores candidate notes with author and candidate references
- **User**: User authentication and profile data
- **Candidate**: Candidate information
- **Notification**: Tag-based notification tracking

## Environment Setup

1. **Backend Dependencies**:
   ```bash
   cd server && npm install
   ```

2. **Frontend Dependencies**:
   ```bash
   cd client && npm install
   ```

3. **Environment Variables** (server/.env):
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```

## Troubleshooting

### Notes not updating in real-time:
1. Check browser console for socket connection logs
2. Verify the connection status shows "Connected"
3. Check server logs for room joining/leaving messages
4. Ensure both users are viewing the same candidate

### Socket connection issues:
1. Verify both servers are running (port 3000 and 5001)
2. Check CORS settings in server.js
3. Clear browser cache and reload

### Tagging not working:
1. Ensure usernames match exactly (case-sensitive)
2. Check notification logs in server console
3. Verify user rooms are being joined correctly

## Future Enhancements

- Message timestamps
- Typing indicators
- Message editing/deletion
- File attachments
- Read receipts
- Message search functionality 