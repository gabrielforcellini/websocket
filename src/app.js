const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');

const PORT = process.env.PORT || 3000;
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use(express.static(__dirname));

app.post('/login', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
});

// app.get('/draw', (req, res) => {
//   res.sendFile(__dirname + '/draw.html');
// });

const drawingHistory = []; 
const clients = [];

io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  socket.on('chooseIdentity', (identity) => {
    console.log(`Usuário escolheu identidade: ${identity}`);
    clients.push(identity);
    socket.identity = identity;

    socket.emit('identityChosen');

    // Emitir alerta para todos os usuários conectados
    io.emit('userConnected', `Um novo usuário - ${identity} se conectou`);

    io.emit('users-updated', clients);
  });

  // Enviar histórico de desenhos para o novo usuário
  socket.emit('drawingHistory', drawingHistory);

  socket.on('draw', (data) => {
    drawingHistory.push(data);
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
    const index = clients.indexOf(socket.identity);
    console.log(socket.identity);
    if (index !== -1) {
      clients.splice(index, 1);
    };
    io.emit('users-updated', clients);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor WebSocket está escutando na porta ${PORT}`);
});
