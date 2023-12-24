const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});;



app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('direction', (msg) => {
    console.log(msg)
  })
  socket.on('score',(score) => {
    console.log(`new score : ${score}`)
    io.emit('message',`message du server : ${score}`)
  })
  socket.on('snakePosList',(list) => {
    console.log(list[0])
  })
});

server.listen(3001, () => {
  console.log('server running at http://localhost:3001');
});