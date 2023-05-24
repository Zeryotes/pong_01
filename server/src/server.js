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
    } 
    else {
        if(players.length >= 2){
            io.to(socketId).emit('erro', 'Sala lotada, impossível entrar no servidor!')
        }
        else {
            if(players.length == 1){
                console.log('[Server] STATUS: Oponente encontrado')
            }
            else if (players.length == 0){
                console.log('[Server] STATUS: Sala vazia')
            } 
            const player = {
                nome: nome,
                socketId: socketId,
                side: null
            }
            players.push(player);
            io.emit('players', players);
            io.to(socketId).emit('submitNameSucess')
        }
    }
}

io.on('connection', (clientSocket) => {
    console.log('[Server] Usuário conectado.')

    // setTimeout(() => {
    //     clientSocket.emit(' ', 'conectado');
    // }, 2000)

    clientSocket.on('entrar', (nome) => {
        console.log(nome + ' entrou no jogo');
    })

    clientSocket.on('desenhar', () => {
        // console.log("Desenhando...")
    })

    clientSocket.on('submitName', (name) =>{
        console.log('[Server] \033[1;31;40m' + name + ' \033[1;30;40mentrou na partida!')
        addPlayer(name, clientSocket.id);
    })

    clientSocket.on('chooseSide', (side) => {
        const indexPlayer = players.findIndex((e) => e.socketId === clientSocket.id)
        if (indexPlayer != -1){
            players[indexPlayer].side = side
        }
        console.log("\033[1;31;40m " + players[indexPlayer].nome + " \033[1;30;40mpegou: " + side)
        io.to(clientSocket.id).emit('chooseSideSucess', players[indexPlayer])
    })

    // clientSocket.on('updatePaddle', (data) => {
    //     if (data.player === 'left') {
    //       leftPaddleY = data.y;
    //     } else if (data.player === 'right') {
    //       rightPaddleY = data.y;
    //     }
    //     io.broadcast.emit('updatePaddle', data);
    // });
})

// Ficar mandando a lista de player para todo mundo a cada 1 segundo
setInterval(() => {

}, 1000)

httpServer.listen(3000, () => {
    console.log('[Server] Servidor iniciado.')
})