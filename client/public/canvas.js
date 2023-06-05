const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const som = new Audio();
som.src = '../sfx/click_x.wav'

let mouseY = 0
let mouseX = 0
canvas.addEventListener('mousemove', (event) => {
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
});

const alturaRaquete = 100
const larguraRaquete = 10
const distanciaTela = 15

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

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

function criaBola(){
    const bola = {
        direcaoX: 0.5,
        direcaoY: getRandomArbitrary(-1,1),
        raio: 7,
        x: (canvas.width/2),
        y: (canvas.height/2),
        velocidade: 10,
        atualiza(){
            if ((bola.x - bola.raio) <= 0 ){
                // console.log('Bateu [Esquerda]')
                console.log('Ponto do lado direito')
                mudaTelaAtiva(Telas.JOGO)
            }
        
            if ((bola.y - bola.raio) <= 0 ){
                // console.log('Bateu [Cima]')
                bola.y += 1
                bola.direcaoY = bola.direcaoY * -1
            }
        
            if ((bola.x + bola.raio) >= canvas.width ){
                // console.log('Bateu [Direita]')
                console.log('Ponto do lado esquerdo')
                mudaTelaAtiva(Telas.JOGO)
            }
        
            if ((bola.y + bola.raio) >= canvas.height ){
                // console.log('Bateu [Baixo]')
                bola.y -= 1
                bola.direcaoY = bola.direcaoY * -1
            }
    
            if ((bola.x - bola.raio) <= raqueteEsquerda.x + larguraRaquete){
                if ((bola.y + bola.raio) >= raqueteEsquerda.y && bola.y - bola.raio <= raqueteEsquerda.y + alturaRaquete){
                    console.log("Bateu na raquete [Esquerda]")
                    console.log(`x: ${bola.direcaoX} y: ${bola.direcaoY} vel: ${bola.velocidade}`)
                    som.play()
                    bola.direcaoX = bola.direcaoX * (-1) + 0.01
                    bola.direcaoY = ((bola.y - raqueteEsquerda.y) * 2/100) - 1 // Duplica o valor, pega a porcentagem e subitrai 1 pra deixar o valor entre 1 e -1.
                    bola.velocidade = bola.velocidade + 0.1
                }
            }
            
            if ((bola.x + bola.raio) >= raqueteDireita.x){
                if ((bola.y + bola.raio) >= raqueteDireita.y && bola.y - bola.raio <= raqueteDireita.y + alturaRaquete){
                    console.log("Bateu na raquete [Direita]")
                    console.log(`x: ${bola.direcaoX} y: ${bola.direcaoY} vel: ${bola.velocidade}`)
                    bola.direcaoX = bola.direcaoX * (-1) - 0.01
                    bola.direcaoY = ((bola.y - raqueteDireita.y) * 2/100) - 1 // Duplica o valor, pega a porcentagem e subitrai 1 pra deixar o valor entre 1 e -1.
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
    return bola;
}

//
// [Telas]
//
const globais = {};
let telaAtiva = {};
function mudaTelaAtiva(novaTela){
    telaAtiva = novaTela

    if(telaAtiva.inicializa){
        telaAtiva.inicializa()
    }
}

const Telas = {
    INICIO: {
        desenha(){
            const chooseName = document.getElementById('chooseName');
            const chooseSide = document.getElementById('chooseSide');
            const gameContainer = document.getElementById('gameContainer');

            chooseName.style.display = 'flex';
            chooseSide.style.display = 'None';
            gameContainer.style.display = 'None';
        },
        atualiza(){

        },
    }
};

Telas.JOGO = {
    inicializa(){
        setTimeout(() => {

        }, 3000)
        globais.bola = criaBola();
        
    },
    desenha() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const chooseName = document.getElementById('chooseName');
        const chooseSide = document.getElementById('chooseSide');
        const gameContainer = document.getElementById('gameContainer');

        chooseName.style.display = 'None';
        chooseSide.style.display = 'None';
        gameContainer.style.display = 'flex';

        raqueteDireita.desenha();
        raqueteEsquerda.desenha();
        globais.bola.desenha();
    },
    atualiza(){
        raqueteDireita.atualiza();
        raqueteEsquerda.atualiza();
        globais.bola.atualiza();
    }
}

function loop(){
    telaAtiva.desenha();
    telaAtiva.atualiza();
    requestAnimationFrame(loop);
};

function submitName(){
    mudaTelaAtiva(Telas.JOGO)
};

mudaTelaAtiva(Telas.INICIO)
loop();