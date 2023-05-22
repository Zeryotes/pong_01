const serverSocket = io('ws://localhost:3000');

function entrar(event){
    serverSocket.emit('entrar');
}

function desenhar(event){
    serverSocket.emit('desenhar')
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