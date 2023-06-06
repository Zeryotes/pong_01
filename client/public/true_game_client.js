const serverSocket = io('ws://localhost:3000');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let jogador1 = {};
let jogador2 = {};
let bola = {};

serverSocket.on("inicioJogo", (dadosIniciais) => {
    jogador1 = dadosIniciais.jogador1
    jogador2 = dadosIniciais.jogador2
    bola = dadosIniciais.bola
});

serverSocket.on("atualizaJogo", (dadosAtualizados) => {
    jogador1 = dadosAtualizados.jogador1
    jogador2 = dadosAtualizados.jogador2
    bola = dadosAtualizados.bola
});

function enviarNome(){
    const inputName = document.getElementById('inputName');
    let nome = inputName.value
    serverSocket.emit('enviarNome', nome)
    serverSocket.on('enviarNomeSucesso', () => {
        const tela_chooseName = document.getElementById('chooseName');
        tela_chooseName.style.display = "none";
        const tela_chooseSide = document.getElementById('chooseSide');
        tela_chooseSide.style.display = "flex";
    })
}

serverSocket.on('listaJogadores', (listaJogadores) => {
    console.log('listaJogadores', listaJogadores);
    listaJogadores.forEach((jogador) => {
        if(jogador.lado === 'esquerda'){
            const jogador1_nome = document.getElementById('player1_name');
            jogador1_nome.innerHTML = jogador.nome
        } 
        else if(jogador.lado === 'direita') {
            const jogador2_nome = document.getElementById('player2_name');
            jogador2_nome.innerHTML = jogador.nome
        }
    });
})

function escolheLado(ladoJogador){
    jogadorLado = ladoJogador
    serverSocket.emit('escolheLado', ladoJogador);
    serverSocket.on('escolheLadoSucesso', () => {
        const tela_chooseSide = document.getElementById('chooseSide');
        tela_chooseSide.style.display = "none";
        const tela_gameContainer = document.getElementById('gameContainer');
        tela_gameContainer.style.display = "flex";
    });
    draw()
}

function reiniciarJogo(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    draw();
}

serverSocket.on('reiniciarJogo', () => {
    reiniciarJogo();
})


function draw(){
    // if(vencedor){
    //     console.log('venceu')
    //     return
    // }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const alturaRaquete = 100
    const larguraRaquete = 10

    ctx.fillRect(jogador1.x, jogador1.y, larguraRaquete, alturaRaquete);
    ctx.fillRect(jogador2.x, jogador2.y, larguraRaquete, alturaRaquete);

    let circle = canvas.getContext('2d')
    circle.fillStyle = 'black';
    circle.beginPath()
    circle.arc(bola.x, bola.y, bola.raio, 0, 2 * Math.PI);
    circle.fill();
    
    requestAnimationFrame(draw);
}

canvas.addEventListener("mousemove", (event) => {
    let mouseY = event.clientY - canvas.getBoundingClientRect().top
    setTimeout(() => {

    }, 50)
    serverSocket.emit('moverRaquete', mouseY)
});