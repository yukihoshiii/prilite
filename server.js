// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Store connected users
const users = {};

// Socket.io event handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle user joining
  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('message', {
      type: 'system',
      text: `${username} has joined the messenger`,
      timestamp: new Date().toISOString()
    });
    
    // Send connected users list
    io.emit('userList', Object.values(users));
    
    console.log(`User ${username} connected`);
  });
  
  // Handle messages
  socket.on('sendMessage', (message) => {
    io.emit('message', {
      type: 'user',
      sender: users[socket.id],
      text: message,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      io.emit('message', {
        type: 'system',
        text: `${users[socket.id]} has left the messenger`,
        timestamp: new Date().toISOString()
      });
      delete users[socket.id];
      io.emit('userList', Object.values(users));
    }
    console.log('Client disconnected');
  });
});

// Start server and set up serveo
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Set up serveo for port forwarding with the specific subdomain
  const serveoCommand = `ssh -R zfh-messenger:80:localhost:${PORT} serveo.net`;
  
  const serveo = exec(serveoCommand);
  
  serveo.stdout.on('data', (data) => {
    console.log(`Serveo: ${data}`);
  });
  
  serveo.stderr.on('data', (data) => {
    console.error(`Serveo error: ${data}`);
  });
  
  serveo.on('close', (code) => {
    console.log(`Serveo process exited with code ${code}`);
  });
});
