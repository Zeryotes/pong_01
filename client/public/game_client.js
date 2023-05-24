const serverSocket = io('ws://localhost:3000');

let playerSide = null
function entrar(event){
    serverSocket.emit('entrar');
}

function desenhar(event){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const paddleHeight = 100;
    const paddleWidth = 10;
    const distanciaTela = 10;
    const ballSize = 5;
    const circle = new Path2D();
    
    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let rightPaddleY = (canvas.height - paddleHeight) / 2;
    let ballY = (canvas.height - ballSize) / 2;
    let ballX = (canvas.width - ballSize) / 2;

    // canvas.addEventListener("mousemove", (event) => {
    //     const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    //     serverSocket.emit('updatePaddle', ((mouseY - paddleHeight) / 2));
    // })

    // canvas.addEventListener('mousemove', (event) => {
    //   const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    //   if (playerSide === 'left') {
    //     leftPaddleY = mouseY - paddleHeight / 2;
    //   } else {
    //     rightPaddleY = mouseY - paddleHeight / 2;
    //   }
    //   serverSocket.emit('updatePaddle', { player: playerSide, y: mouseY - paddleHeight / 2 });
    // });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar paddles
        ctx.fillStyle = 'black';
        ctx.fillRect(0+distanciaTela, leftPaddleY, paddleWidth, paddleHeight);
        ctx.fillRect((canvas.width - paddleWidth - distanciaTela), rightPaddleY, paddleWidth, paddleHeight);

        circle.arc(ballX, ballY, ballSize, 0, 2 * Math.PI);

        // Desenhar bolinha
        ctx.fill(circle);

        requestAnimationFrame(draw);
    }
  
    draw();
    // Enviando para o servidor o comando 'desenhar'
    serverSocket.emit('desenhar')
}

function submitName(){
    const inputName = document.getElementById('inputName');
    let name = inputName.value
    serverSocket.emit('submitName', name)
    serverSocket.on('submitNameSucess', () => {
        const tela_chooseName = document.getElementById('chooseName');
        tela_chooseName.style.display = "none";
        const tela_chooseSide = document.getElementById('chooseSide');
        tela_chooseSide.style.display = "flex";
    })
}

function chooseSide(side){
    serverSocket.emit('chooseSide', side);
    serverSocket.on('chooseSideSucess', (player) => {
        const tela_chooseSide = document.getElementById('chooseSide');
        tela_chooseSide.style.display = "none";
        const tela_gameContainer = document.getElementById('gameContainer');
        tela_gameContainer.style.display = "flex";

        if(player.side === 'left'){
            const player1_name = document.getElementById('player1_name');
            player1_name.innerHTML = player.nome
        } 
        else if(player.side === 'right') {
            const player2_name = document.getElementById('player2_name');
            player2_name.innerHTML = player.nome
        }
    });
}

serverSocket.on('mensagem', (msg) => {
    console.log('Mensagem');
})

serverSocket.on('players', (players) => {
    console.log('players', players);
    players.forEach((player) => {
        if(player.side === 'left'){
            const player1_name = document.getElementById('player1_name');
            player1_name.innerHTML = player.nome
        } 
        else if(player.side === 'right') {
            const player2_name = document.getElementById('player2_name');
            player2_name.innerHTML = player.nome
        }
    });
})

serverSocket.on('erro', (erroMensagem) => {
    alert(erroMensagem);
})