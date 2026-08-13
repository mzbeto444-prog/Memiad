const socket = io();

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');

const currentUserSpan = document.getElementById('current-user');
const onlineCount = document.getElementById('online-count');
const userList = document.getElementById('user-list');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

let username = '';
let typingTimer = null;

// Login
loginBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    socket.emit('user-join', username);
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'grid';
    chatContainer.style.gridTemplateRows = '60px 1fr';
    chatContainer.style.gridTemplateColumns = '200px 1fr';
    document.getElementById('header').style.gridColumn = 'span 2';
    currentUserSpan.textContent = `👤 ${username}`;
  }
});

// Enviar mensagem
function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit('send-message', { username, message: msg });
    messageInput.value = '';
    clearTyping();
  }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Indicador de digitação
messageInput.addEventListener('input', () => {
  socket.emit('typing', username);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('typing', ''); // para de digitar
  }, 1500);
});

function clearTyping() {
  socket.emit('typing', '');
  clearTimeout(typingTimer);
}

// Receber mensagem
socket.on('receive-message', (data) => {
  const div = document.createElement('div');
  div.classList.add('message');
  if (data.username === username) div.classList.add('me');
  div.innerHTML = `<strong>${data.username}</strong> ${data.message} <span class="time">${data.time}</span>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Atualizar usuários online
socket.on('update-users', (users) => {
  userList.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    userList.appendChild(li);
  });
  onlineCount.textContent = `👥 ${users.length} online`;
});

// Eventos de entrada/saída
socket.on('user-joined', (name) => {
  addSystemMessage(`${name} entrou na comunidade`);
});

socket.on('user-left', (name) => {
  addSystemMessage(`${name} saiu da comunidade`);
});

// Digitando
socket.on('user-typing', (name) => {
  if (name && name !== username) {
    typingIndicator.textContent = `${name} está digitando...`;
  } else {
    typingIndicator.textContent = '';
  }
});

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.style.cssText = 'color: #7a8aa8; font-size: 13px; text-align: center; padding: 5px;';
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
