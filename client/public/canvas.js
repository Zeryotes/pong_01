const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let mouseY = 0
let mouseX = 0
canvas.addEventListener('mousemove', (event) => {
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
});

const alturaRaquete = 100
const larguraRaquete = 10
const distanciaTela = 15

const raqueteEsquerda = {
    largura: larguraRaquete,
    altura: alturaRaquete,
    x: larguraRaquete + distanciaTela,
    y: canvas.height/2 - alturaRaquete/2,
    atualiza() {
        if (mouseX + alturaRaquete >= canvas.height){
            mouseX = canvas.height - alturaRaquete
        }
        raqueteEsquerda.y = mouseX
    },
    desenha() {
        ctx.fillRect(raqueteEsquerda.x, raqueteEsquerda.y, raqueteEsquerda.largura, raqueteEsquerda.altura);
    }
}

const raqueteDireita = {
    largura: larguraRaquete,
    altura: alturaRaquete,
    x: canvas.width - larguraRaquete - distanciaTela,
    y: canvas.height/2 - alturaRaquete/2,
    atualiza() {
        if (mouseY + alturaRaquete >= canvas.height){
            mouseY = canvas.height - alturaRaquete
        }
        raqueteDireita.y = mouseY
    },
    desenha() {
        ctx.fillRect(raqueteDireita.x, raqueteDireita.y, raqueteDireita.largura, raqueteDireita.altura);
    }
}

const bola = {
    direcaoX: 1,
    direcaoY: 1,
    raio: 7,
    x: (canvas.width/2),
    y: (canvas.height/2),
    velocidade: 5,
    atualiza(){
        if ((bola.x - bola.raio) <= 0 ){
            // console.log('Bateu [Esquerda]')
            console.log('Ponto do lado direito')
            bola.velocidade = 0
        }
    
        if ((bola.y - bola.raio) <= 0 ){
            // console.log('Bateu [Cima]')
            bola.direcaoY = bola.direcaoY * -1
        }
    
        if ((bola.x + bola.raio) >= canvas.width ){
            // console.log('Bateu [Direita]')
            console.log('Ponto do lado esquerdo')
            bola.velocidade = 0
        }
    
        if ((bola.y + bola.raio) >= canvas.height ){
            // console.log('Bateu [Baixo]')
            bola.direcaoY = bola.direcaoY * -1
        }

        if ((bola.x - bola.raio) <= raqueteEsquerda.x + larguraRaquete){
            if ((bola.y + bola.raio) >= raqueteEsquerda.y && bola.y - bola.raio <= raqueteEsquerda.y + alturaRaquete){
                console.log("Bateu na raquete [Esquerda]")
                bola.direcaoX = bola.direcaoX * -1
                bola.velocidade = bola.velocidade + 0.1
            }
        }
        
        if ((bola.x + bola.raio) >= raqueteDireita.x){
            if ((bola.y + bola.raio) >= raqueteDireita.y && bola.y - bola.raio <= raqueteDireita.y + alturaRaquete){
                console.log("Bateu na raquete [Direita]")
                console.log(bola.y)
                console.log(raqueteDireita.y)
                console.log(bola.y - raqueteDireita.y)
                console.log((bola.y - raqueteDireita.y) * 2)
                console.log(((bola.y - raqueteDireita.y) * 2/100) - 1)
                bola.direcaoX = bola.direcaoX * -1
                bola.direcaoY = ((bola.y - raqueteDireita.y) * 2/100) - 1
                bola.velocidade = bola.velocidade + 0.1
            }
        }

        bola.x = bola.x + bola.velocidade * bola.direcaoX 
        bola.y = bola.y + bola.velocidade * bola.direcaoY
    },
    desenha() {
        let circle = canvas.getContext('2d')
        circle.fillStyle = 'black';
        circle.beginPath()
        circle.arc(bola.x, bola.y, bola.raio, 0, 2 * Math.PI);
        circle.fill();
    }
}

function loop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    raqueteDireita.atualiza();
    raqueteEsquerda.atualiza();
    bola.atualiza();

    raqueteDireita.desenha();
    raqueteEsquerda.desenha();
    bola.desenha();

    requestAnimationFrame(loop);
}

loop();