const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const {uuid} = require('uuidv4');

const io = new Server(server);
const port = 8080;
const roomContent = {};

app.get('/', (req, res) => {
  const newRoom = uuid().toLowerCase().substr(0, 5);
  res.redirect(`/${newRoom}`)
})

app.get('/:room', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})


io.on('connection', (socket) => {
  let userRoom = null;

  socket.on('join_room', (room) => {
    userRoom = room;
    console.log('user joined room ' + room);
    socket.join(room);
    socket.emit('content_updated', roomContent[userRoom] || '');
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('content_updated', (content) => {
    console.log('content updated in room ', userRoom)
    roomContent[userRoom] = content;
    socket.to(userRoom).emit('content_updated', content);
  });

});

app.use(express.static('public'));

server.listen(port, () => console.log('listening on ' + port));