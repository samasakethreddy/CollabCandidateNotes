const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Track user connections
const userConnections = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Check if user already has active sessions
    if (userConnections.has(user.id)) {
      const existingConnections = userConnections.get(user.id);
      console.log(`User ${user.name} already has ${existingConnections.size} active connections`);
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));

// Apply authentication middleware to all socket connections
io.use(authenticateSocket);

// Note routes with io instance
app.use('/api/notes', require('./routes/notes')(io));

io.on('connection', (socket) => {
  const userId = socket.user.id;
  const userName = socket.user.name;
  
  console.log('=== SOCKET CONNECTION ===');
  console.log('Socket ID:', socket.id);
  console.log('User Name:', userName);
  console.log('User ID:', userId);
  console.log('User Agent:', socket.handshake.headers['user-agent']);
  console.log('Connection Time:', new Date().toISOString());

  // Track user connections
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId).add(socket.id);
  
  console.log(`User ${userName} now has ${userConnections.get(userId).size} active connections`);
  console.log('Total active users:', userConnections.size);
  console.log('========================');

  socket.on('join_room', (candidateId) => {
    socket.join(candidateId);
    console.log(`User ${userName} (${socket.id}) joined room ${candidateId}`);
    console.log('Current rooms:', socket.rooms);
  });

  socket.on('join_user_room', (requestedUserId) => {
    // Validate that user is joining their own room
    if (requestedUserId !== userId) {
      console.error(`User ${userName} (${userId}) attempted to join room ${requestedUserId}`);
      return;
    }
    
    socket.join(userId);
    console.log(`User ${userName} (${socket.id}) joined user room ${userId}`);
    console.log('Current rooms:', socket.rooms);
  });

  socket.on('leave_room', (candidateId) => {
    socket.leave(candidateId);
    console.log(`User ${userName} (${socket.id}) left room ${candidateId}`);
    console.log('Current rooms:', socket.rooms);
  });

  socket.on('leave_user_room', (requestedUserId) => {
    // Validate that user is leaving their own room
    if (requestedUserId !== userId) {
      console.error(`User ${userName} (${userId}) attempted to leave room ${requestedUserId}`);
      return;
    }
    
    socket.leave(userId);
    console.log(`User ${userName} (${socket.id}) left user room ${userId}`);
    console.log('Current rooms:', socket.rooms);
  });

  socket.on('send_note', (note) => {
    console.log('Received send_note event:', note);
    io.to(note.candidate).emit('new_note', note);
  });

  socket.on('disconnect', () => {
    console.log('=== SOCKET DISCONNECT ===');
    console.log('Socket ID:', socket.id);
    console.log('User Name:', userName);
    console.log('User ID:', userId);
    console.log('Disconnect Time:', new Date().toISOString());
    
    // Remove from user connections tracking
    if (userConnections.has(userId)) {
      userConnections.get(userId).delete(socket.id);
      if (userConnections.get(userId).size === 0) {
        userConnections.delete(userId);
        console.log(`User ${userName} has no more active connections`);
      } else {
        console.log(`User ${userName} still has ${userConnections.get(userId).size} active connections`);
      }
    }
    
    console.log('Total active users:', userConnections.size);
    console.log('==========================');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
