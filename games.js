
// --- GAME LIST CONFIGURATION ---
const gamesList = [
    { id: 'tictactoe', label: 'Tic Tac', icon: '❌', type: 'internal' },
    { id: 'snake', label: 'Snake', icon: '🐍', type: 'internal' },
    { id: 'game2048', label: '2048', icon: '🔢', type: 'internal' },
    { id: 'dino', label: 'Dino', icon: '🦖', type: 'link', url: 'https://chromedino.com/' },
    { id: 'pong', label: 'Pong', icon: '🏓', type: 'link', url: 'https://pong-2.com/' },
    { id: 'home', label: 'Home', icon: '🏠', type: 'reset' },
    { id: 'space', label: 'Space', icon: '👾', type: 'link', url: 'https://freeinvaders.org/' },
    { id: 'chess', label: 'Chess', icon: '♟️', type: 'link', url: 'https://lichess.org/' },
    { id: 'hockey', label: 'Hockey', icon: '🏒', type: 'link', url: 'https://poki.com/en/air-hockey' },
    { id: 'brain', label: 'Brain', icon: '🧠', type: 'link', url: 'https://braindots.translimit.co.jp/en/' }
];

// --- CAROUSEL LOGIC ---
let activeIndex = 0; // The item at the top center
const radius = 120; // Radius of the arc
const carouselContainer = document.getElementById('arc-carousel-container');
const screen = document.getElementById('status-screen');
const gameModals = document.querySelectorAll('.game-modal');

// Game State References
let snakeInterval = null;

function initCarousel() {
    renderCarousel();
}

function renderCarousel() {
    carouselContainer.innerHTML = '';
    const total = gamesList.length;

    // We want the active item at -90 degrees (top) or 90 (bottom)?
    // User requested "Visible all around arc". A circle is best.
    // Let's position them in a full circle. Top is -90deg.

    // Angle per item
    const angleStep = 360 / total;

    gamesList.forEach((game, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        if (index === activeIndex) item.classList.add('active');

        item.innerHTML = `
            <span class="carousel-icon">${game.icon}</span>
            <span class="carousel-label">${game.label}</span>
        `;

        // Calculate Angle relative to active index
        // We want activeIndex to be at -90deg (Top)
        // offset = (index - activeIndex) * angleStep
        let theta = (index - activeIndex) * angleStep - 90;

        // Convert to radians
        let rad = theta * (Math.PI / 180);

        // Position
        // Center of container is 150, 150 (if width/height is 300)
        // but we position relative to center of item (30,30)
        // so translate(x, y)
        // x = r * cos(rad)
        // y = r * sin(rad)

        let x = radius * Math.cos(rad);
        let y = radius * Math.sin(rad);

        // Apply transform
        // Active item gets scale 1.5, others smaller
        // Distance from 'top' (-90deg) determines scale

        // Simpler approach: Determine "distance" in indices from active
        let dist = Math.abs(index - activeIndex);
        if (dist > total / 2) dist = total - dist; // wrap around distance

        let scale = dist === 0 ? 1.5 : Math.max(0.6, 1 - (dist * 0.15));

        item.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

        // Z-index: active on top
        item.style.zIndex = dist === 0 ? 100 : 10 - dist;

        // Events
        item.onclick = () => {
            if (index === activeIndex) {
                // Launch Game
                handleGameLaunch(game);
            } else {
                // Rotate to this item
                rotateCarousel(index);
            }
        };

        carouselContainer.appendChild(item);
    });
}

function rotateCarousel(newIndex) {
    activeIndex = newIndex;
    renderCarousel();

    // Update screen text with selection
    const game = gamesList[activeIndex];
    screen.innerText = "Selected: " + game.label;
}

function handleGameLaunch(game) {
    hideAllGames();

    if (game.type === 'internal') {
        openGame(game.id);
    } else if (game.type === 'link') {
        screen.innerText = "Opening " + game.label + "...";
        window.open(game.url, '_blank');
        setTimeout(() => screen.innerText = "SELECT GAME", 2000);
    } else if (game.type === 'reset') {
        resetAll();
    }
}

// --- EXISTING GAME LOGIC ---

function hideAllGames() {
    gameModals.forEach(modal => modal.style.display = 'none');
    stopSnake();
    // Stop 2048 listener if we want (logic is safe though)
}

function resetAll() {
    hideAllGames();
    screen.innerText = "SELECT GAME";
    resetTicTacToe();
    stopSnake();

    // Reset carousel to Home or just keep current
    // activeIndex = gamesList.findIndex(g => g.id === 'home');
    renderCarousel();
}

function openGame(gameId) {
    // hideAllGames() called by handleGameLaunch already
    if(gameId === 'tictactoe') {
        screen.innerText = "Playing: Tic Tac Toe";
        document.getElementById('tictactoe-area').style.display = 'block';
    } else if (gameId === 'snake') {
        screen.innerText = "Playing: Snake";
        document.getElementById('snake-area').style.display = 'block';
        initSnake();
    } else if (gameId === 'game2048') {
        screen.innerText = "Playing: 2048";
        document.getElementById('area-2048').style.display = 'block';
        init2048();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});


// --- TIC TAC TOE ---
let tttPlayer = 'X';
let tttActive = true;
let tttBoard = ["", "", "", "", "", "", "", "", ""];
const tttCells = document.querySelectorAll('.cell');
const tttMsg = document.getElementById('winner-msg');

function makeMove(index) {
    if (tttBoard[index] !== "" || !tttActive) return;

    tttBoard[index] = tttPlayer;
    tttCells[index].innerText = tttPlayer;
    tttCells[index].classList.add('taken');
    tttCells[index].style.color = tttPlayer === 'X' ? '#00D9FF' : '#FF0055'; // Theme colors

    checkTTTWin();

    if(tttActive) {
        tttPlayer = tttPlayer === 'X' ? 'O' : 'X';
    }
}

function checkTTTWin() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    let roundWon = false;
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        tttMsg.innerText = `Player ${tttPlayer} Wins!`;
        screen.innerText = `${tttPlayer} WINS! 🏆`;
        tttActive = false;
        return;
    }

    if (!tttBoard.includes("")) {
        tttMsg.innerText = "It's a Draw!";
        screen.innerText = "DRAW!";
        tttActive = false;
    }
}

function resetTicTacToe() {
    tttBoard = ["", "", "", "", "", "", "", "", ""];
    tttActive = true;
    tttPlayer = 'X';
    tttMsg.innerText = "";
    tttCells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove('taken');
        cell.style.color = '';
    });
}

// --- SNAKE GAME ---
const snakeCanvas = document.getElementById('snake-canvas');
const ctx = snakeCanvas.getContext('2d');
const gridSize = 15; // Size of one square
const tileCount = 20; // 300 / 15 = 20
let velocityX = 0;
let velocityY = 0;
let playerX = 10;
let playerY = 10;
let trail = [];
let tail = 5;
let appleX = 15;
let appleY = 15;

function initSnake() {
    // Reset state
    playerX = 10; playerY = 10;
    appleX = 15; appleY = 15;
    velocityX = 0; velocityY = 0;
    trail = [];
    tail = 5;

    // Start loop
    if(snakeInterval) clearInterval(snakeInterval);
    snakeInterval = setInterval(gameSnake, 1000/10); // 10 FPS

    // Add Event Listener for keys
    document.addEventListener('keydown', keyPush);
}

function stopSnake() {
    if(snakeInterval) clearInterval(snakeInterval);
    document.removeEventListener('keydown', keyPush);
}

function gameSnake() {
    playerX += velocityX;
    playerY += velocityY;

    // Wrap around
    if(playerX < 0) playerX = tileCount - 1;
    if(playerX > tileCount - 1) playerX = 0;
    if(playerY < 0) playerY = tileCount - 1;
    if(playerY > tileCount - 1) playerY = 0;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    // Snake
    ctx.fillStyle = '#00D9FF'; // Accent color
    for(let i=0; i<trail.length; i++) {
        ctx.fillRect(trail[i].x * gridSize, trail[i].y * gridSize, gridSize - 2, gridSize - 2);

        if(trail[i].x === playerX && trail[i].y === playerY && (velocityX !==0 || velocityY !==0)) {
            // Collision with self
            tail = 5;
            screen.innerText = "GAME OVER!";
        }
    }

    trail.push({x: playerX, y: playerY});
    while(trail.length > tail) {
        trail.shift();
    }

    // Apple
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(appleX * gridSize, appleY * gridSize, gridSize - 2, gridSize - 2);

    // Eat Apple
    if(appleX === playerX && appleY === playerY) {
        tail++;
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
        screen.innerText = "Score: " + (tail - 5);
    }
}

function keyPush(evt) {
    if(document.getElementById('snake-area').style.display !== 'block') return;

    switch(evt.keyCode) {
        case 37: // Left
            if(velocityX !== 1) { velocityX = -1; velocityY = 0; }
            break;
        case 38: // Up
            if(velocityY !== 1) { velocityX = 0; velocityY = -1; }
            break;
        case 39: // Right
            if(velocityX !== -1) { velocityX = 1; velocityY = 0; }
            break;
        case 40: // Down
            if(velocityY !== -1) { velocityX = 0; velocityY = 1; }
            break;
    }
}

// --- 2048 GAME ---
const board2048 = document.getElementById('game-2048-board');
let grid2048 = [];
let score2048 = 0;

function init2048() {
    board2048.innerHTML = '';
    grid2048 = Array(16).fill(0);
    score2048 = 0;

    // Create grid cells
    for(let i=0; i<16; i++) {
        let cell = document.createElement('div');
        cell.className = 'tile-2048';
        cell.id = `tile-${i}`;
        board2048.appendChild(cell);
    }

    generateTile();
    generateTile();
    updateBoardView();

    document.addEventListener('keyup', control2048);
}

function generateTile() {
    let emptyTiles = [];
    for(let i=0; i<16; i++) {
        if(grid2048[i] === 0) emptyTiles.push(i);
    }
    if(emptyTiles.length === 0) return;
    let randomCell = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    grid2048[randomCell] = Math.random() < 0.9 ? 2 : 4;
}

function updateBoardView() {
    for(let i=0; i<16; i++) {
        let tile = document.getElementById(`tile-${i}`);
        tile.innerText = grid2048[i] === 0 ? '' : grid2048[i];
        tile.className = 'tile-2048'; // reset
        if(grid2048[i] > 0) {
            let val = grid2048[i] <= 2048 ? grid2048[i] : '2048-val';
            tile.classList.add(`tile-${val}`);
        }
    }
    screen.innerText = "2048 Score: " + score2048;
}

function control2048(e) {
    if(document.getElementById('area-2048').style.display !== 'block') return;

    let moved = false;
    if(e.keyCode === 39) moved = moveRight();
    else if(e.keyCode === 37) moved = moveLeft();
    else if(e.keyCode === 38) moved = moveUp();
    else if(e.keyCode === 40) moved = moveDown();

    if(moved) {
        generateTile();
        updateBoardView();
        checkForGameOver();
    }
}

// Logic for 2048 movement (simplified rows/cols extraction)
function moveRight() {
    let moved = false;
    for(let i=0; i<16; i+=4) {
        let row = [grid2048[i], grid2048[i+1], grid2048[i+2], grid2048[i+3]];
        let filteredRow = row.filter(num => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = zeros.concat(filteredRow);

        // Combine
        for(let j=3; j>0; j--) {
            if(newRow[j] === newRow[j-1] && newRow[j] !== 0) {
                newRow[j] *= 2;
                score2048 += newRow[j];
                newRow[j-1] = 0;
            }
        }
        // Re-filter after combination
        filteredRow = newRow.filter(num => num);
        missing = 4 - filteredRow.length;
        zeros = Array(missing).fill(0);
        newRow = zeros.concat(filteredRow);

        if(newRow.join(',') !== row.join(',')) moved = true;

        grid2048[i] = newRow[0];
        grid2048[i+1] = newRow[1];
        grid2048[i+2] = newRow[2];
        grid2048[i+3] = newRow[3];
    }
    return moved;
}

function moveLeft() {
    let moved = false;
    for(let i=0; i<16; i+=4) {
        let row = [grid2048[i], grid2048[i+1], grid2048[i+2], grid2048[i+3]];
        let filteredRow = row.filter(num => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = filteredRow.concat(zeros);

        // Combine
        for(let j=0; j<3; j++) {
            if(newRow[j] === newRow[j+1] && newRow[j] !== 0) {
                newRow[j] *= 2;
                score2048 += newRow[j];
                newRow[j+1] = 0;
            }
        }
        filteredRow = newRow.filter(num => num);
        missing = 4 - filteredRow.length;
        zeros = Array(missing).fill(0);
        newRow = filteredRow.concat(zeros);

        if(newRow.join(',') !== row.join(',')) moved = true;

        grid2048[i] = newRow[0];
        grid2048[i+1] = newRow[1];
        grid2048[i+2] = newRow[2];
        grid2048[i+3] = newRow[3];
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for(let i=0; i<4; i++) {
        let col = [grid2048[i], grid2048[i+4], grid2048[i+8], grid2048[i+12]];
        let filteredCol = col.filter(num => num);
        let missing = 4 - filteredCol.length;
        let zeros = Array(missing).fill(0);
        let newCol = filteredCol.concat(zeros);

        for(let j=0; j<3; j++) {
            if(newCol[j] === newCol[j+1] && newCol[j] !== 0) {
                newCol[j] *= 2;
                score2048 += newCol[j];
                newCol[j+1] = 0;
            }
        }
        filteredCol = newCol.filter(num => num);
        missing = 4 - filteredCol.length;
        zeros = Array(missing).fill(0);
        newCol = filteredCol.concat(zeros);

        if(newCol.join(',') !== col.join(',')) moved = true;

        grid2048[i] = newCol[0];
        grid2048[i+4] = newCol[1];
        grid2048[i+8] = newCol[2];
        grid2048[i+12] = newCol[3];
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for(let i=0; i<4; i++) {
        let col = [grid2048[i], grid2048[i+4], grid2048[i+8], grid2048[i+12]];
        let filteredCol = col.filter(num => num);
        let missing = 4 - filteredCol.length;
        let zeros = Array(missing).fill(0);
        let newCol = zeros.concat(filteredCol);

        for(let j=3; j>0; j--) {
            if(newCol[j] === newCol[j-1] && newCol[j] !== 0) {
                newCol[j] *= 2;
                score2048 += newCol[j];
                newCol[j-1] = 0;
            }
        }
        filteredCol = newCol.filter(num => num);
        missing = 4 - filteredCol.length;
        zeros = Array(missing).fill(0);
        newCol = zeros.concat(filteredCol);

        if(newCol.join(',') !== col.join(',')) moved = true;

        grid2048[i] = newCol[0];
        grid2048[i+4] = newCol[1];
        grid2048[i+8] = newCol[2];
        grid2048[i+12] = newCol[3];
    }
    return moved;
}

function checkForGameOver() {
    let zeros = 0;
    for(let i=0; i<16; i++) {
        if(grid2048[i] === 0) zeros++;
    }
    if(zeros === 0) {
        // Simple check: if no zeros, game over (not checking merges for simplicity)
        // A full check would verify if any adjacent tiles are equal
        let possible = false;
        // Check rows
        for(let i=0; i<16; i+=4) {
            if(grid2048[i] === grid2048[i+1] || grid2048[i+1] === grid2048[i+2] || grid2048[i+2] === grid2048[i+3]) possible = true;
        }
        // Check cols
        for(let i=0; i<12; i++) {
            if(grid2048[i] === grid2048[i+4]) possible = true;
        }

        if(!possible) {
            screen.innerText = "2048 GAME OVER!";
        }
    }
}
