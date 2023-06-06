const serverSocket = io('ws://localhost:3000');

let jogadorLado = null

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
    desenharJogo();
}

function desenharJogo(dados){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const infoCanvas = {
        height: canvas.height,
        width: canvas.width,
    } 
    
    let mouseY = 0

    canvas.addEventListener('mousemove', (event) => {
        mouseY = event.clientY - canvas.getBoundingClientRect().top;
    });
    serverSocket.emit('desenhaJogo', mouseY, infoCanvas, dados)
}

serverSocket.on('desenhaJogoSucesso', (dados) => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const alturaRaquete = 100
    const larguraRaquete = 10

    // Jogador 1
    const raqueteEsquerda = {
        desenha() {
            ctx.fillRect(dados.xJogador1, dados.yJogador1, larguraRaquete, alturaRaquete);
        }
    }

    // Jogador 2
    const raqueteDireita = {
        desenha() {
            ctx.fillRect(dados.xJogador2, dados.yJogador2, larguraRaquete, alturaRaquete);
        }
    }

    // Bola
    const bola = {
        desenha() {
            let circle = canvas.getContext('2d')
            circle.fillStyle = 'black';
            circle.beginPath()
            circle.arc(dados.xBola, dados.yBola, dados.raioBola, 0, 2 * Math.PI);
            circle.fill();
        }
    }


    raqueteDireita.desenha();
    raqueteEsquerda.desenha();
    bola.desenha();

    requestAnimationFrame(desenharJogo);
    desenharJogo(dados)
})