var express = require('express');
var http = require('http');
var Server = require('socket.io').Server;
var cors = require('cors');

const PORT = 3000

var Game = require('./game');

const { randomUUID } = require('crypto');

var app = express();
app.use(express.static(__dirname + "/public"));

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

// Informações estáticas
const alturaRaquete = 100
const larguraRaquete = 10
const distanciaTela = 15

const wCanvas = 800
const hCanvas = 600

const bola = {
    x: 400,
    y: 300,
    raio: 5,
    vel: 4,
    direcaoX: Math.random() > 0.5 ? 1 : -1,
    direcaoY: Math.random() > 0.5 ? 1 : -1,
}

let listaJogadores = [];
let jogador1 = null
let jogador2 = null

function adicionarJogador(nome, socketId){
    const existeJogador = listaJogadores.filter((e) => e.nome === nome)

    if(existeJogador.length > 0){
        io.to(socketId).emit('erro', '[Server] Já existe um jogador com esse nome')
    } 
    else {
        if(listaJogadores.length >= 2){
            io.to(socketId).emit('erro', 'Sala lotada, impossível entrar no servidor!')
        }
        else {
            const jogador = {
                nome: nome,
                socketId: socketId,
                lado: null,
                pontuacao: 0,
            }
            listaJogadores.push(jogador);
            io.to(socketId).emit('enviarNomeSucesso')
        }
    }
}

io.on('connection', (clientSocket) => {
    console.log('[Server] Usuário conectado.')
    io.emit('listaJogadores', listaJogadores);

    clientSocket.on('enviarNome', (nome) => {
        console.log('[Server] \033[1;31;40m' + nome + ' \033[1;30;40mentrou na partida!')
        adicionarJogador(nome, clientSocket.id);
    });

    clientSocket.on('escolheLado', (ladoJogador) => {
        const indexJogador = listaJogadores.findIndex((e) => e.socketId === clientSocket.id)
        const jogador = listaJogadores[indexJogador]
        if (indexJogador != -1){
            jogador.lado = ladoJogador
            if(ladoJogador === "esquerda"){
                jogador1 = jogador
                jogador1.x = distanciaTela
                jogador1.y = hCanvas/2
            } else {
                jogador2 = jogador
                jogador2.x = wCanvas - distanciaTela
                jogador2.y = hCanvas/2
            }
        }
        console.log("\033[1;31;40m " + jogador.nome + " \033[1;30;40mpegou: " + ladoJogador)
        io.to(clientSocket.id).emit('escolheLadoSucesso')
        io.emit('listaJogadores', listaJogadores)
        if(listaJogadores.length >= 2) {
            iniciarJogo()
        }
    });

    clientSocket.emit('inicioJogo', dadosIniciais())

    clientSocket.on('moverRaquete', (mouseY) => {
        if(listaJogadores.length >= 2){
            const indexJogador = listaJogadores.findIndex((e) => e.socketId === clientSocket.id)
            const jogador = listaJogadores[indexJogador]
            if (mouseY + alturaRaquete > hCanvas){
                if(jogador.lado === "esquerda"){
                    jogador1.y = mouseY - alturaRaquete
                } else {
                    jogador2.y = mouseY - alturaRaquete
                }
            } else {
                if(jogador.lado === "esquerda"){
                    jogador1.y = mouseY
                } else {
                    jogador2.y = mouseY
                }
            }
        }
    });

    clientSocket.on('disconnect', () => {
        if(listaJogadores.length > 0){
            const indexJogador = listaJogadores.findIndex((e) => e.socketId === clientSocket.id)
            const jogador = listaJogadores[indexJogador]
            if(jogador){
                console.log(jogador.nome + ' desconectou');
                if (indexJogador != -1){
                    listaJogadores = listaJogadores.splice(indexJogador, 1)
                }
                io.emit('listaJogadores', listaJogadores)
            }
        }
    });
});

function dadosIniciais(){
    const bola = {
        x: wCanvas/2,
        y: hCanvas/2,
        vel: 4,
        raio: 5,
        direcaoX: Math.random() > 0.5 ? 1 : -1,
        direcaoY: Math.random() > 0.5 ? 1 : -1,
    }

    const jogador1 = {
        x: larguraRaquete + distanciaTela,
        y: hCanvas/2 - alturaRaquete/2,
    }

    const jogador2 = {
        x: wCanvas - larguraRaquete + distanciaTela,
        y: hCanvas/2 - alturaRaquete/2,
    }
    dadosAtualizados = {
        bola, jogador1, jogador2
    };
    return dadosAtualizados
}

function atualizarDadosJogo(){
    bola.x += bola.vel * bola.direcaoX
    bola.y += bola.vel * bola.direcaoY

    const esquerdaBola = bola.x - bola.raio
    const direitaBola = bola.x + bola.raio
    const topoBola = bola.y - bola.raio
    const baseBola = bola.y + bola.raio

    if (esquerdaBola < 0 ){
        console.log('Ponto do lado direito')
        bola.vel = 0
    }

    if (topoBola < 0 || baseBola >= hCanvas){
        bola.direcaoY *= -1
    }

    if (direitaBola >= wCanvas ){
        console.log('Ponto do lado esquerdo')
        bola.vel = 0
    }

    // if (topoBola <= dados.xJogador1 + larguraRaquete){
    //     if ((dados.yBola + dados.raioBola) >= dados.yJogador1 && dados.yBola - dados.raioBola <= dados.yJogador1 + alturaRaquete){
    //         console.log("Bateu na raquete [Esquerda]")
    //         dados.xBolaDirecao = dados.xBolaDirecao * -1
    //         dados.velBola = dados.velBola + 0.1
    //     }
    // }
    
    // if ((dados.xBola + dados.raioBola) >= dados.xJogador2){
    //     if ((dados.yBola + dados.raioBola) >= dados.yJogador2 && dados.yBola - dados.raioBola <= dados.yJogador2 + alturaRaquete){
    //         console.log("Bateu na raquete [Direita]")
    //         dados.xBolaDirecao = dados.xBolaDirecao * -1
    //         dados.yBolaDirecao = ((bola.y - dados.yJogador2) * 2/100) - 1
    //         dados.velBola = dados.velBola + 0.1
    //     }
    // }
}

function resetarBola(){
    bola.x = 400
    bola.y = 300
    bola.direcaoX = Math.random() > 0.5 ? 1 : -1
    bola.direcaoY = Math.random() > 0.5 ? 1 : -1
}

function iniciarJogo(){
    setInterval(() => {
        atualizarDadosJogo();
        
        io.sockets.emit('atualizaJogo', {jogador1, jogador2, bola})
    }, 1000/60); // 60 FPS
}

httpServer.listen(PORT, () => {
    console.log(`[Server] Servidor iniciado na porta ${PORT}.`)
});

