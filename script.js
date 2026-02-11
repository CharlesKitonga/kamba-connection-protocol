const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// =====================
// GAME STATE
// =====================
let gameState = 'START';
let score = 0;
const WIN_SCORE = 15;
let player;
let hearts = [];
let particles = [];
let floatingHearts = [];
let animationId;

let loveMeter = document.getElementById('love-fill');

// DOM Elements
const startScreen = document.getElementById('start-screen');
const proposalScreen = document.getElementById('proposal-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const startBtn = document.getElementById('start-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const storyText = document.getElementById("story-text");

// =====================
// RESIZE
// =====================
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (player) {
        player.y = canvas.height - 100;
    }
}
window.addEventListener('resize', resize);

// =====================
// PLAYER
// =====================
class Player {
    constructor() {
        this.w = 100;
        this.h = 80;
        this.x = canvas.width / 2 - this.w / 2;
        this.y = canvas.height - 100;
        this.dx = 0;
    }

    draw() {
        ctx.fillStyle = '#ff4d6d';

        ctx.beginPath();
        ctx.arc(this.x + this.w / 2, this.y, this.w / 2, 0, Math.PI, false);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#c9184a';
        ctx.lineWidth = 5;
        ctx.arc(this.x + this.w / 2, this.y - 10, this.w / 2, Math.PI, 0, false);
        ctx.stroke();
    }

    update() {
        this.x += this.dx;
        if (this.x < 0) this.x = 0;
        if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;
    }
}

// =====================
// FALLING HEARTS
// =====================
class Heart {
    constructor() {
        this.size = Math.random() * 20 + 20;
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size;
        this.speed = Math.random() * 3 + 2;
        this.color = `hsl(${Math.random() * 20 + 340}, 100%, 60%)`;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();

        const topCurveHeight = this.size * 0.3;

        ctx.moveTo(this.x, this.y + topCurveHeight);

        // Top left curve
        ctx.bezierCurveTo(
            this.x,
            this.y,
            this.x - this.size / 2,
            this.y,
            this.x - this.size / 2,
            this.y + topCurveHeight
        );

        // Bottom left curve
        ctx.bezierCurveTo(
            this.x - this.size / 2,
            this.y + (this.size + topCurveHeight) / 2,
            this.x,
            this.y + (this.size + topCurveHeight) / 2,
            this.x,
            this.y + this.size
        );

        // Bottom right curve
        ctx.bezierCurveTo(
            this.x,
            this.y + (this.size + topCurveHeight) / 2,
            this.x + this.size / 2,
            this.y + (this.size + topCurveHeight) / 2,
            this.x + this.size / 2,
            this.y + topCurveHeight
        );

        // Top right curve
        ctx.bezierCurveTo(
            this.x + this.size / 2,
            this.y,
            this.x,
            this.y,
            this.x,
            this.y + topCurveHeight
        );

        ctx.fill();
    }

    update() {
        this.y += this.speed;
    }
}


// =====================
// FLOATING BACKGROUND HEARTS
// =====================
class FloatingHeart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 15 + 10;
        this.speed = Math.random() * 0.5 + 0.3;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = "#ff4d6d";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update() {
        this.y -= this.speed;
    }
}

function spawnFloatingHearts() {
    if (Math.random() < 0.02) {
        floatingHearts.push(new FloatingHeart());
    }

    floatingHearts.forEach((heart, index) => {
        heart.update();
        heart.draw();
        if (heart.y < -20) floatingHearts.splice(index, 1);
    });
}

// =====================
// PARTICLES
// =====================
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = 100;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 2;
    }

    draw() {
        ctx.globalAlpha = this.life / 100;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function createParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y));
    }
}

// =====================
// INPUT
// =====================
function handleInput(e) {
    if (!player) return;

    const clientX =
        e.type === 'mousemove'
            ? e.clientX
            : e.touches[0].clientX;

    player.x = clientX - player.w / 2;
}

window.addEventListener('mousemove', handleInput);
window.addEventListener('touchmove', handleInput, { passive: false });

// =====================
// GAME LOOP
// =====================
function spawnHeart() {
    if (Math.random() < 0.02) {
        hearts.push(new Heart());
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnFloatingHearts();

    if (gameState === 'PLAYING') {
        player.update();
        player.draw();
        spawnHeart();

        hearts.forEach((heart, index) => {
            heart.update();
            heart.draw();

            if (
                heart.y + heart.size > player.y &&
                heart.x > player.x &&
                heart.x < player.x + player.w
            ) {
                hearts.splice(index, 1);
                score++;
                createParticles(heart.x, heart.y);
                updateScore();

                if (score >= WIN_SCORE) {
                    triggerProposal();
                }
            } else if (heart.y > canvas.height) {
                hearts.splice(index, 1);
            }
        });

        particles.forEach((p, idx) => {
            p.update();
            p.draw();
            if (p.life <= 0) particles.splice(idx, 1);
        });
    }

    animationId = requestAnimationFrame(updateGame);
}

// =====================
// SCORE
// =====================
function updateScore() {
    const percentage = (score / WIN_SCORE) * 100;
    loveMeter.style.width = `${percentage}%`;
}

// =====================
// TYPING STORY
// =====================
const storyLines = [
    "Hello there. Yes, you.",
    "I still remember the first time I said hello… mostly because I wanted to confirm there was another Kamba at Strath 🤣",
    "But I kind of knew this one would be different. Our worlds didn’t even look similar… yet somehow they aligned.",
    "Charming. Sensational. Fuuuun 😂 But what stood out the most? Your humility.",
    "Somewhere along the way, I grew to appreciate you deeply.",
    "10 years later… here we are."
];

function typeStory(index = 0, charIndex = 0) {
    if (index >= storyLines.length) return;

    if (charIndex < storyLines[index].length) {
        storyText.innerHTML += storyLines[index].charAt(charIndex);
        setTimeout(() => typeStory(index, charIndex + 1), 30);
    } else {
        storyText.innerHTML += "<br><br>";
        setTimeout(() => typeStory(index + 1, 0), 500);
    }
}

// =====================
// PROPOSAL
// =====================
function triggerProposal() {
    gameState = 'PROPOSAL';

    setTimeout(() => {
        proposalScreen.classList.remove('hidden');
        proposalScreen.classList.add('active');

        storyText.innerHTML = "";
        typeStory();
    }, 600);
}

// =====================
// START GAME
// =====================
function startGame() {
    resize();
    player = new Player();
    hearts = [];
    score = 0;
    updateScore();
    gameState = 'PLAYING';

    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');

    updateGame();
}

// =====================
// EVENTS
// =====================
startBtn.addEventListener('click', startGame);

yesBtn.addEventListener('click', () => {
    yesBtn.style.boxShadow = "0 0 30px rgba(45, 198, 83, 0.9)";
    yesBtn.style.transform = "scale(1.1)";

    setTimeout(() => {
        proposalScreen.classList.remove('active');
        proposalScreen.classList.add('hidden');
        celebrationScreen.classList.remove('hidden');
        celebrationScreen.classList.add('active');

        setTimeout(() => {
            const hiddenMessage = document.getElementById("hidden-message");
            if (hiddenMessage) hiddenMessage.style.opacity = "1";
        }, 3000);

    }, 600);
});

// RUNAWAY BUTTON
noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', moveNoButton);

function moveNoButton() {
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);

    noBtn.style.position = 'fixed';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    noBtn.innerText = "Further Audit Required 😅";
}

// =====================
// INIT
// =====================
resize();

 
