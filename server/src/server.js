var express = require('express');
var http = require('http');
var Server = require('socket.io').Server;
var cors = require('cors');

var Game = require('./game');

const { randomUUID } = require('crypto');

var app = express();

app.use(cors())

app.get('/', (request, response) => {
    response.send('RAIZ do servidor web')
});

var httpServer = http.createServer(app);
var io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
})

let players = [];
function addPlayer(nome, socketId){
    const existingPlayer = players.filter((e) => e.nome === nome)

    if(existingPlayer.length > 0){
        io.to(socketId).emit('erro', '[Server] Já existe um jogador com esse nome')
    } else {
        const player = {
            nome: nome,
            socketId: socketId
        }
        players.push(player);
        io.exit('player', players);
    }
}



io.on('connection', (clientSocket) => {
    console.log('[Server] Usuário conectado.')

    setTimeout(() => {
        clientSocket.emit('mensagem', 'conectado');
    }, 2000)

    //setInterval(() => {}, 1000)

    clientSocket.on('entrar', (nome) => {
        addPlayer(nome, clientSocket.id);
        console.log(nome + ' entrou no jogo');

        // Mandar players para todos
        // io.emit('players', players);
    })

    clientSocket.on('desenhar', () => {
        console.log("Desenhando...")
    })
})

// Ficar mandando a lista de player para todo mundo a cada 1 segundo
setInterval(() => {

}, 1000)

httpServer.listen(3000, () => {
    console.log('[Server] Servidor iniciado.')
})