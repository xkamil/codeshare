const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const {uuid} = require('uuidv4');

const io = new Server(server);
const port = process.env.PORT || 8080;
const roomContent = {};

app.get('/', (req, res) => {
  const newRoom = uuid().toLowerCase().substr(0, 5);
  res.redirect(`/${newRoom}`)
})

app.get('/:room', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

io.on('connection', (socket) => {
  const room = socket.handshake.query.room;
  let lockId = null;

  socket.join(room);
  console.log(`user ${socket.id} joined room ${room}`);
  socket.emit('content_updated', roomContent[room] || '');

  socket.on('grant-lock', () => {
    lockId = socket.id;
    io.in(room).emit('lock-granted', lockId);
    console.log(`room ${room} lock granted to ${lockId}`)
  });

  socket.on('update_content', (newContent) => {
    const oldContent = roomContent[room];
    if (newContent !== oldContent && lockId === socket.id) {
      console.log(`content updated by ${socket.id} in room ${room}`);
      socket.to(room).emit('content_updated', newContent);
      roomContent[room] = newContent;
    }
  });

});

app.use(express.static('public'));

server.listen(port, () => console.log('listening on ' + port));