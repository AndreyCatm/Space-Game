document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const coinsElement = document.getElementById('coins');
    const startGameButton = document.getElementById('startGame');
    const speedUpgradeButton = document.getElementById('speedUpgrade');
    const shieldUpgradeButton = document.getElementById('shieldUpgrade');
    const shieldIcon = document.getElementById('shieldIcon');

    const canvasWidth = 800;
    const canvasHeight = 600;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let score = 0;
    let coins = 0;
    let gameInterval;
    let meteors = [];
    let bullets = [];
    let speedUpgradeCost = 100;
    let shieldUpgradeCost = 500;
    let bulletSpeed = 5;
    let shieldActive = false;
    let shieldDuration = 0;

    const meteorImages = {
        small: 'M_small.png',
        medium: 'M_medium.png',
        large: 'M_large.png'
    };

    const meteorTypes = {
        small: { speed: 4, size: 20, cost: 10 },
        medium: { speed: 2, size: 40, cost: 20 },
        large: { speed: 1, size: 60, cost: 50 }
    };

    function drawMeteors() {
        meteors.forEach(meteor => {
            const img = new Image();
            img.src = meteorImages[meteor.type];
            ctx.drawImage(img, meteor.x, meteor.y, meteorTypes[meteor.type].size, meteorTypes[meteor.type].size);
        });
    }

    function drawBullets() {
        ctx.fillStyle = 'yellow';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    function drawPlayer() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(canvasWidth / 2 - 25, canvasHeight - 50, 50, 30);
    }

    function updateMeteors() {
        meteors.forEach(meteor => {
            meteor.y += meteorTypes[meteor.type].speed;
        });
        meteors = meteors.filter(meteor => meteor.y < canvasHeight);
    }

    function updateBullets() {
        bullets.forEach(bullet => {
            bullet.y -= bulletSpeed;
        });
        bullets = bullets.filter(bullet => bullet.y > 0);
    }

    function checkCollisions() {
        bullets.forEach((bullet, bIndex) => {
            meteors.forEach((meteor, mIndex) => {
                const meteorType = meteorTypes[meteor.type];
                if (bullet.x < meteor.x + meteorType.size &&
                    bullet.x + bullet.width > meteor.x &&
                    bullet.y < meteor.y + meteorType.size &&
                    bullet.y + bullet.height > meteor.y) {
                    meteors.splice(mIndex, 1);
                    bullets.splice(bIndex, 1);
                    score += meteorType.cost;
                }
            });
        });

        if (shieldActive) {
            shieldDuration--;
            if (shieldDuration <= 0) {
                shieldActive = false;
                shieldIcon.classList.add('hidden');
            }
        }
    }

    function endGame() {
        clearInterval(gameInterval);
        alert(`Game Over! Your score is ${score}`);
        startGameButton.disabled = false;
    }

    function startGame() {
        score = 0;
        coins = 0;
        bullets = [];
        meteors = [];
        bulletSpeed = 5;
        shieldActive = false;
        shieldDuration = 0;
        startGameButton.disabled = true;

        gameInterval = setInterval(() => {
            if (Math.random() < 0.02) {
                const type = Math.random() < 0.5 ? 'small' : (Math.random() < 0.5 ? 'medium' : 'large');
                meteors.push({
                    x: Math.random() * (canvasWidth - meteorTypes[type].size),
                    y: 0,
                    type: type
                });
            }

            updateMeteors();
            updateBullets();
            checkCollisions();
            draw();
        }, 1000 / 60);
    }

    function draw() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawPlayer();
        drawMeteors();
        drawBullets();
        scoreElement.textContent = `Score: ${score}`;
        coinsElement.textContent = `Coins: ${coins}`;
    }

    function movePlayer(event) {
        const player = { x: canvasWidth / 2 - 25, y: canvasHeight - 50, width: 50, height: 30 };
        switch (event.key) {
            case 'ArrowLeft':
                player.x = Math.max(0, player.x - 5);
                break;
            case 'ArrowRight':
                player.x = Math.min(canvasWidth - player.width, player.x + 5);
                break;
            case ' ':
                bullets.push({
                    x: player.x + player.width / 2 - 2,
                    y: player.y,
                    width: 4,
                    height: 10
                });
                break;
        }
    }

    function upgradeSpeed() {
        if (coins >= speedUpgradeCost) {
            coins -= speedUpgradeCost;
            bulletSpeed += 0.5;
            speedUpgradeCost += 150;
        }
    }

    function upgradeShield() {
        if (coins >= shieldUpgradeCost) {
            coins -= shieldUpgradeCost;
            shieldActive = true;
            shieldDuration = 600; // 10 seconds
            shieldIcon.classList.remove('hidden');
            shieldUpgradeCost += 300;
        }
    }

    startGameButton.addEventListener('click', startGame);
    window.addEventListener('keydown', movePlayer);
    speedUpgradeButton.addEventListener('click', upgradeSpeed);
    shieldUpgradeButton.addEventListener('click', upgradeShield);
});
