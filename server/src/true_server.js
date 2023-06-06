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

let listaJogadores = [];
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
            if(listaJogadores.length == 1){
                console.log('[Server] STATUS: Oponente encontrado')
            }
            else if (listaJogadores.length == 0){
                console.log('[Server] STATUS: Sala vazia')
            } 
            const jogador = {
                nome: nome,
                socketId: socketId,
                lado: null,
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
        }
        console.log("\033[1;31;40m " + jogador.nome + " \033[1;30;40mpegou: " + ladoJogador)
        io.to(clientSocket.id).emit('escolheLadoSucesso')
        io.emit('listaJogadores', listaJogadores)
    });

    clientSocket.on('desenhaJogo', (mouseY, canvas, dados) => {
        const indexJogador = listaJogadores.findIndex((e) => e.socketId === clientSocket.id)
        const jogador = listaJogadores[indexJogador]

        // Informações estáticas
        const alturaRaquete = 100
        const larguraRaquete = 10
        const distanciaTela = 15
        
        // Dados do server
        if (!dados){
            const dados = {
                xJogador1: larguraRaquete + distanciaTela,
                yJogador1: canvas.height/2 - alturaRaquete/2,
                xJogador2: canvas.width - larguraRaquete - distanciaTela,
                yJogador2: canvas.height/2 - alturaRaquete/2,
                xBolaDirecao: 1,
                yBolaDirecao: 1,
                velBola: 4,
                xBola: (canvas.width/2),
                yBola: (canvas.height/2),
                raioBola: 5,
            }
        }

        //
        // [Movimento das raquetes]
        //
        if (jogador.lado === "esquerda"){
            if (mouseY + alturaRaquete >= canvas.height){
                dados.yJogador1 = canvas.height - alturaRaquete
            }
            dados.yJogador1 = mouseY
        } else {
            if (mouseY + alturaRaquete >= canvas.height){
                dados.yJogador2 = canvas.height - alturaRaquete
            }
            dados.yJogador2 = mouseY
        }

        //
        // [Colisões]
        //
        if ((dados.xBola - dados.raioBola) <= 0 ){
            // console.log('Bateu [Esquerda]')
            console.log('Ponto do lado direito')
            dados.velBola = 0
        }
    
        if ((dados.yBola - dados.raioBola) <= 0 ){
            // console.log('Bateu [Cima]')
            dados.yBolaDirecao = dados.yBolaDirecao * -1
        }
    
        if ((dados.xBola + dados.raioBola) >= canvas.width ){
            // console.log('Bateu [Direita]')
            console.log('Ponto do lado esquerdo')
            dados.velBola = 0
        }
    
        if ((dados.yBola + dados.raioBola) >= canvas.height ){
            // console.log('Bateu [Baixo]')
            dados.yBolaDirecao = dados.yBolaDirecao * -1
        }

        if ((dados.xBola - dados.raioBola) <= dados.xJogador1 + larguraRaquete){
            if ((dados.yBola + dados.raioBola) >= dados.yJogador1 && dados.yBola - dados.raioBola <= dados.yJogador1 + alturaRaquete){
                console.log("Bateu na raquete [Esquerda]")
                dados.xBolaDirecao = dados.xBolaDirecao * -1
                dados.velBola = dados.velBola + 0.1
            }
        }
        
        if ((dados.xBola + dados.raioBola) >= dados.xJogador2){
            if ((dados.yBola + dados.raioBola) >= dados.yJogador2 && dados.yBola - dados.raioBola <= dados.yJogador2 + alturaRaquete){
                console.log("Bateu na raquete [Direita]")
                dados.xBolaDirecao = dados.xBolaDirecao * -1
                dados.yBolaDirecao = ((bola.y - dados.yJogador2) * 2/100) - 1
                dados.velBola = dados.velBola + 0.1
            }
        }

        //
        // [Atualização da bola]
        //
        dados.xBola = dados.xBola + dados.velBola * dados.xBolaDirecao
        dados.yBola = dados.yBola + dados.velBola * dados.yBolaDirecao

        io.emit('desenhaJogoSucesso', dados)
    });

    clientSocket.on('disconnect', () => {
        if(listaJogadores.length > 0){
            const indexJogador = listaJogadores.findIndex((e) => e.socketId === clientSocket.id)
            const jogador = listaJogadores[indexJogador]
            console.log(jogador.nome + ' desconectou');
            if (indexJogador != -1){
                listaJogadores = listaJogadores.splice(indexJogador, 1)
            }
            io.emit('listaJogadores', listaJogadores)
        }
    });
});

httpServer.listen(3000, () => {
    console.log('[Server] Servidor iniciado.')
});