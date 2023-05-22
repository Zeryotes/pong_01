const serverSocket = io('ws://localhost:3000');

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
}

function submitName(){
    const name = document.getElementById('inputName');
    const tela_chooseName = document.getElementById('chooseName');
    tela_chooseName.style.display = "none";
    const tela_chooseSide = document.getElementById('chooseSide');
    tela_chooseSide.style.display = "flex";
    console.log('[User] ' + name)
    serverSocket.on('submitName', name)
}

function chooseSide(side){
    const test_h1 = document.getElementById('player1_name');
    test_h1.innerHTML += side
    serverSocket.on('chooseSide')
}

serverSocket.on('mensagem', (msg) => {
    console.log('Mensagem')
})

serverSocket.on('players', (players) => {
    console.log('players', players);
})

serverSocket.on('erro', (erroMensagem) => {
    alert(erroMensagem);
})