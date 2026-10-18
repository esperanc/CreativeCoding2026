let imgSource;
let imgCasaVazia, imgPecaNormal, imgPecaDama;
let imgCasasLago = [];

// Coordenadas Absolutas Exatas e Organizadas
let cropVazia       = { x1: 844,  y1: 1887, x2: 1164, y2: 2197 };
let cropUmaPessoa   = { x1: 2131, y1: 1871, x2: 2444, y2: 2197 };
let cropDuasPessoas = { x1: 2424, y1: 1611, x2: 2780, y2: 1871 };
let cropLagoInicio  = { x1: 100,  y1: 100,  x2: 400,  y2: 400  };

let boardState = []; // Agora a matriz começa vazia e será preenchida dinamicamente
let squareSize;

function preload() {
    let url = 'https://fastly.picsum.photos/id/671/3513/2635.jpg?hmac=I7S7zbpqnG_f2rLiCOGQ1NtAH-ieKa3reYrkuIJZuUw';
    imgSource = loadImage(url);
    
    // Regra OBRIGATÓRIA para evitar erros de CORS na manipulação de píxeis
    imgSource.crossOrigin = "anonymous";
}

function setup() {
    createCanvas(640, 640);
    squareSize = width / 8;

    // 1. Extração da Imagem Matriz
    imgCasaVazia  = recortarPorPosicao(cropVazia);
    imgPecaNormal = recortarPorPosicao(cropUmaPessoa);
    imgPecaDama   = recortarPorPosicao(cropDuasPessoas);

    // 2. Extração dos recortes do lago
    let colunasLago = 8;
    let lw = abs(cropLagoInicio.x2 - cropLagoInicio.x1);
    let lh = abs(cropLagoInicio.y2 - cropLagoInicio.y1);
    let startX = min(cropLagoInicio.x1, cropLagoInicio.x2);
    let startY = min(cropLagoInicio.y1, cropLagoInicio.y2);

    for (let i = 0; i < 32; i++) {
        let lx = startX + (i % colunasLago) * lw;
        let ly = startY + floor(i / colunasLago) * lh;
        imgCasasLago.push(imgSource.get(lx, ly, lw, lh));
    }

    // Gera o primeiro estado aleatório logo que o jogo abre
    gerarJogadasAleatorias();

    noLoop(); // Trava o loop do draw, só atualiza quando clicarmos
}

// Retorna o tabuleiro intacto na posição original
function getInitialBoard() {
    return [
        [0, 3, 0, 3, 0, 3, 0, 3], // Linha 0 (Jogador 2)
        [3, 0, 3, 0, 3, 0, 3, 0], // Linha 1 (Jogador 2)
        [0, 3, 0, 3, 0, 3, 0, 3], // Linha 2 (Jogador 2)
        [0, 0, 0, 0, 0, 0, 0, 0], // Linha 3 (Vazia)
        [0, 0, 0, 0, 0, 0, 0, 0], // Linha 4 (Vazia)
        [1, 0, 1, 0, 1, 0, 1, 0], // Linha 5 (Jogador 1)
        [0, 1, 0, 1, 0, 1, 0, 1], // Linha 6 (Jogador 1)
        [1, 0, 1, 0, 1, 0, 1, 0]  // Linha 7 (Jogador 1)
    ];
}

// Simula jogadas aleatórias (1 a 5 movimentos)
function gerarJogadasAleatorias() {
    boardState = getInitialBoard(); // Reseta para a posição inicial
    let numMoves = floor(random(1, 6)); // Sorteia um número de 1 até 5
    let currentPlayer = 1; // Jogador 1 sempre começa

    for (let i = 0; i < numMoves; i++) {
        fazerMovimentoAleatorio(currentPlayer);
        // Troca o turno (se era 1, vira 3. Se era 3, vira 1)
        currentPlayer = (currentPlayer === 1) ? 3 : 1; 
    }
    
    redraw(); // Pede para desenhar a tela novamente com as novas posições
}

// Lógica para encontrar um movimento válido para o jogador atual e executá-lo
function fazerMovimentoAleatorio(player) {
    let possiveisMovimentos = [];
    let dir = (player === 1) ? -1 : 1; // Jogador 1 sobe (-1), Jogador 2 desce (+1)

    // Procura por todas as peças do jogador atual
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] === player) {
                // Checa a diagonal da esquerda
                if (r + dir >= 0 && r + dir < 8 && c - 1 >= 0) {
                    if (boardState[r + dir][c - 1] === 0) { // Se a casa estiver vazia
                        possiveisMovimentos.push({ fromR: r, fromC: c, toR: r + dir, toC: c - 1 });
                    }
                }
                // Checa a diagonal da direita
                if (r + dir >= 0 && r + dir < 8 && c + 1 < 8) {
                    if (boardState[r + dir][c + 1] === 0) { // Se a casa estiver vazia
                        possiveisMovimentos.push({ fromR: r, fromC: c, toR: r + dir, toC: c + 1 });
                    }
                }
            }
        }
    }

    // Se houver movimentos válidos, escolhe um aleatoriamente e aplica na matriz
    if (possiveisMovimentos.length > 0) {
        let move = random(possiveisMovimentos);
        boardState[move.fromR][move.fromC] = 0;       // Esvazia a casa antiga
        boardState[move.toR][move.toC] = player;      // Coloca a peça na nova casa
    }
}

// FUNÇÃO INTELIGENTE DE CORTE
function recortarPorPosicao(crop) {
    let rx = min(crop.x1, crop.x2);
    let ry = min(crop.y1, crop.y2);
    let w = abs(crop.x2 - crop.x1);
    let h = abs(crop.y2 - crop.y1);
    return imgSource.get(rx, ry, w, h);
}

// EVENTO DE CLIQUE DO MOUSE
function mousePressed() {
    // Garante que só atualiza se clicar dentro do canvas do jogo
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        gerarJogadasAleatorias();
    }
}

function draw() {
    background(100);
    let indexLago = 0;

    // Se o tabuleiro ainda não foi gerado, não tenta desenhar
    if (boardState.length === 0) return;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let x = c * squareSize;
            let y = r * squareSize;

            // --- DESENHO DO FUNDO DA CASA ---
            if ((r + c) % 2 !== 0) {
                // Casa escura / jogável (Deck)
                image(imgCasaVazia, x, y, squareSize, squareSize);
            } else {
                // Casa clara / não jogável (Lago)
                image(imgCasasLago[indexLago], x, y, squareSize, squareSize);
                indexLago++;
            }

            // --- DESENHO DAS PEÇAS ---
            let peca = boardState[r][c];
            if (peca !== 0) {
                let imgAtual;
                
                if (peca === 1 || peca === 2) {
                    imgAtual = imgPecaNormal; // Jogador 1 (Uma pessoa)
                } 
                else if (peca === 3 || peca === 4) {
                    imgAtual = imgPecaDama; // Jogador 2 (Duas pessoas)
                }
                
                image(imgAtual, x, y, squareSize, squareSize);
            }
        }
    }
}