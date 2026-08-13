const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Armazenar usuários online
const users = {};

io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  // Quando um usuário entra (define o nome)
  socket.on('user-join', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user-joined', username);
    io.emit('update-users', Object.values(users));
  });

  // Recebe mensagem e envia para todos
  socket.on('send-message', (data) => {
    io.emit('receive-message', {
      username: data.username,
      message: data.message,
      time: new Date().toLocaleTimeString()
    });
  });

  // Quando digita (opcional)
  socket.on('typing', (username) => {
    socket.broadcast.emit('user-typing', username);
  });

  // Quando desconecta
  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    if (username) {
      io.emit('user-left', username);
      io.emit('update-users', Object.values(users));
    }
    console.log('Usuário desconectado:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
