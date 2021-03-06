const express = require('express');
const http = require('http');
const {Server} = require("socket.io");
const {uuid} = require('uuidv4');
const snippetRepository = require('./snippetRepository.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 8080;

snippetRepository.loadSnippetsFromDisc();
setInterval(() => snippetRepository.saveSnippetsOnDisc(), 5000);

app.get('/admin/health', (req, res) => {
    res.json('ok');
})

app.get('/admin/snippets', (req, res) => {
    res.json(snippetRepository.getAllSnippets());
})

app.get('/', (req, res) => {
    const newSnippetName = uuid().toLowerCase().substr(0, 7);
    res.redirect(`/${newSnippetName}`)
})

app.get('/:snippetName', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

app.get('/:snippetName/latestContent', (req, res) => {
    const snippetName = req.params.snippetName;
    res.json(snippetRepository.getSnippetContent(snippetName));
})

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    const snippetName = socket.handshake.query.snippetName;
    let lockId = null;
    socket.join(snippetName);

    socket.on('acquire-lock', () => {
        lockId = socket.id;
        io.in(snippetName).emit('lock-updated', lockId);
    });

    socket.on('update-content', (newContent) => {
        if (lockId === socket.id) {
            snippetRepository.updateSnippet(snippetName, newContent);
            socket.to(snippetName).emit('content-updated', newContent);
        }
    });

});

server.listen(port, () => console.log('listening on ' + port));

function log(text) {
    console.log(`${new Date()} ${text}`)
}