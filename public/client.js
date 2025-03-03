// public/client.js
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginScreen = document.getElementById('login-screen');
  const messenger = document.getElementById('messenger');
  const usernameInput = document.getElementById('username');
  const loginBtn = document.getElementById('login-btn');
  const messageContainer = document.getElementById('message-container');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const usersList = document.getElementById('users-list');
  const currentUserDisplay = document.getElementById('current-user');
  const connectionStatus = document.getElementById('connection-status');
  const currentTimeDisplay = document.getElementById('current-time');
  
  // Connection status
  let isConnected = false;
  let username = '';
  
  // Socket.io connection
  const socket = io();
  
  // Connect to socket
  socket.on('connect', () => {
    isConnected = true;
    connectionStatus.textContent = 'CONNECTED';
    connectionStatus.style.color = 'var(--success-color)';
    document.querySelector('.status-light').style.backgroundColor = 'var(--success-color)';
    document.querySelector('.status-light').style.boxShadow = '0 0 8px var(--success-color)';
  });
  
  socket.on('disconnect', () => {
    isConnected = false;
    connectionStatus.textContent = 'DISCONNECTED';
    connectionStatus.style.color = 'var(--warning-color)';
    document.querySelector('.status-light').style.backgroundColor = 'var(--warning-color)';
    document.querySelector('.status-light').style.boxShadow = '0 0 8px var(--warning-color)';
    
    addMessage({
      type: 'system',
      text: 'CONNECTION LOST. ATTEMPTING TO RECONNECT...',
      timestamp: new Date().toISOString()
    });
  });
  
  // Update current time
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  setInterval(updateTime, 1000);
  updateTime();
  
  // Login functionality
  loginBtn.addEventListener('click', () => {
    const usernameValue = usernameInput.value.trim();
    if (usernameValue.length >= 3) {
      username = usernameValue;
      currentUserDisplay.textContent = username;
      
      // Hide login screen, show messenger
      loginScreen.style.display = 'none';
      messenger.style.display = 'flex';
      
      // Update battery level randomly between 60-95%
      const batteryLevel = Math.floor(Math.random() * 36) + 60;
      document.querySelector('.battery-level').style.width = `${batteryLevel}%`;
      
      // Join chat
      socket.emit('join', username);
      
      // Add welcome message
      addMessage({
        type: 'system',
        text: 'WELCOME TO ZFH MESSENGER. CONNECTION ESTABLISHED.',
        timestamp: new Date().toISOString()
      });
      
      // Focus on message input
      messageInput.focus();
    } else {
      alert('Username must be at least 3 characters long.');
    }
  });
  
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });
  
  // Sending messages
  sendBtn.addEventListener('click', () => {
    sendMessage();
  });
  
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message && isConnected) {
      socket.emit('sendMessage', message);
      messageInput.value = '';
    }
  }
  
  // Receiving messages
  socket.on('message', (message) => {
    addMessage(message);
  });
  
  // Update user list
  socket.on('userList', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user;
      if (user === username) {
        li.style.backgroundColor = 'rgba(42, 58, 86, 0.6)';
        li.style.borderLeft = '3px solid var(--success-color)';
      }
      usersList.appendChild(li);
    });
  });
  
  // Add message to the chat
  function addMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Format timestamp
    const timestamp = new Date(message.timestamp);
    const formattedTime = `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`;
    
    if (message.type === 'system') {
      messageDiv.classList.add('system');
      messageDiv.innerHTML = `
        <div class="message-text">${message.text}</div>
      `;
    } else {
      // Determine if the message is from the current user
      const isSelf = message.sender === username;
      messageDiv.classList.add(isSelf ? 'self' : 'user');
      
      messageDiv.innerHTML = `
        <div class="message-header">
          <span class="message-sender">${message.sender}</span>
          <span class="message-time">${formattedTime}</span>
        </div>
        <div class="message-text">${message.text}</div>
      `;
    }
    
    messageContainer.appendChild(messageDiv);
    
    // Add static/noise effect when a new message arrives
    const staticEffect = document.createElement('div');
    staticEffect.classList.add('static-effect');
    staticEffect.style.position = 'absolute';
    staticEffect.style.top = '0';
    staticEffect.style.left = '0';
    staticEffect.style.width = '100%';
    staticEffect.style.height = '100%';
    staticEffect.style.background = 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 14, 20, 0.1) 100%)';
    staticEffect.style.opacity = '0.5';
    staticEffect.style.pointerEvents = 'none';
    staticEffect.style.zIndex = '5';
    
    document.querySelector('.terminal').appendChild(staticEffect);
    
    setTimeout(() => {
      staticEffect.remove();
    }, 300);
    
    // Auto scroll to the newest message
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  // Random flicker effect for CRT aesthetic
  function randomFlicker() {
    const overlay = document.querySelectorAll('.crt-overlay');
    const randomDelay = Math.random() * 10000 + 5000; // 5-15 seconds
    
    setTimeout(() => {
      overlay.forEach(el => {
        el.style.opacity = '0.7';
        setTimeout(() => {
          el.style.opacity = '0.3';
        }, 100);
      });
      
      randomFlicker();
    }, randomDelay);
  }
  
  randomFlicker();
});
