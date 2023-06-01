const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const alturaRaquete = 100
const larguraRaquete = 10

const raqueteEsquerda = {
    largura: larguraRaquete,
    altura: alturaRaquete,
    x: 10,
    y: 10,
    desenha() {
        ctx.drawImage(
            // Sprite
            // Posição na Sprite
            // largura, altura
            // Posição
            // não sei bem
        )
    }
}

const raqueteDireita = {
    largura: larguraRaquete,
    altura: alturaRaquete,
    x: canvas.largura - 10,
    y: 10,
    desenha() {
        ctx.drawImage(
            // Sprite
            // Posição na Sprite
            // largura, altura
            // Posição
            // não sei bem
        )
    }
}

const bola = {
    largura: 7,
    altura: 7,
    x: (canvas.width/2),
    y: (canvas.height/2),
    desenha() {
        let circle = canvas.getContext('2d')
        circle.fillStyle = 'black';
        circle.beginPath()
        circle.arc(bola.x, bola.y, bola.largura, 0, 2 * Math.PI);
        circle.fill();
    }
}

function loop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bola.desenha()

    bola.x = bola.x-1
    bola.y = bola.y+1

    requestAnimationFrame(loop);
}

loop();