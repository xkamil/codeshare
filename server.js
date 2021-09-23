const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const {uuid} = require('uuidv4');

const io = new Server(server);
const port = process.env.PORT || 8080;
const roomContent = {};

app.get('/admin/health', (req,res)=>{
  res.json('ok');
})

app.get('/', (req, res) => {
  const newRoom = uuid().toLowerCase().substr(0, 7);
  res.redirect(`/${newRoom}`)
})

app.get('/:room', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

app.get('/:room/latestContent', (req, res) => {
  const room = req.params.room;
  res.json(roomContent[room] || '');
})

io.on('connection', (socket) => {
  const room = socket.handshake.query.room;
  let lockId = null;
  socket.join(room);
  log(`user ${socket.id} joined room ${room}`);


  socket.on('acquire-lock', () => {
    lockId = socket.id;
    io.in(room).emit('lock-updated', lockId);
    log(`room ${room} lock granted to ${lockId}`)
  });

  socket.on('update-content', (newContent) => {
    if (lockId === socket.id) {
      log(`content updated by ${socket.id} in room ${room}`);
      socket.to(room).emit('content-updated', newContent);
      roomContent[room] = newContent;
    }
  });

});

app.use(express.static(__dirname + '/public'));

server.listen(port, () => console.log('listening on ' + port));

function log(text){
  console.log(`${new Date()} ${text}`)
}