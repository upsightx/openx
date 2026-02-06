// 2048 游戏实现
class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = localStorage.getItem('bestScore') || 0;
        this.history = [];
        this.init();
    }

    init() {
        // 初始化游戏格子
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.history = [];

        // 渲染游戏界面
        this.render();
        this.updateScore();

        // 添加初始格子
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }

    render() {
        const gridContainer = document.getElementById('gridContainer');
        gridContainer.innerHTML = '';

        // 创建格子背景
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.gridRow = i + 1;
                cell.style.gridColumn = j + 1;
                gridContainer.appendChild(cell);
            }
        }

        // 渲染数字格子
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;

                    // 设置格子位置
                    const gridWidth = gridContainer.offsetWidth;
                    const cellSize = (gridWidth - (this.size + 1) * 10) / this.size; // 减去间距
                    const x = j * (cellSize + 10) + 10;
                    const y = i * (cellSize + 10) + 10;
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.left = `${x}px`;
                    tile.style.top = `${y}px`;

                    // 调整字体大小
                    if (value >= 128) {
                        tile.style.fontSize = `${cellSize / 8}px`;
                    }

                    gridContainer.appendChild(tile);
                }
            }
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    moveLeft() {
        let moved = false;
        const newGrid = [];

        for (let i = 0; i < this.size; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            let mergedRow = [];

            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    mergedRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                } else {
                    mergedRow.push(row[j]);
                }
            }

            while (mergedRow.length < this.size) {
                mergedRow.push(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(mergedRow)) {
                moved = true;
            }

            newGrid.push(mergedRow);
        }

        if (moved) {
            this.history.push(JSON.parse(JSON.stringify(this.grid)));
            this.grid = newGrid;
            this.addRandomTile();
            this.render();
            this.updateScore();
        }

        return moved;
    }

    moveRight() {
        this.grid = this.grid.map(row => row.reverse());
        const moved = this.moveLeft();
        this.grid = this.grid.map(row => row.reverse());
        if (moved) {
            this.render();
        }
        return moved;
    }

    moveUp() {
        this.grid = this.transpose(this.grid);
        const moved = this.moveLeft();
        this.grid = this.transpose(this.grid);
        if (moved) {
            this.render();
        }
        return moved;
    }

    moveDown() {
        this.grid = this.transpose(this.grid);
        const moved = this.moveRight();
        this.grid = this.transpose(this.grid);
        if (moved) {
            this.render();
        }
        return moved;
    }

    transpose(matrix) {
        return matrix[0].map((_, index) => matrix.map(row => row[index]));
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('bestScore', this.best);
        }
        document.getElementById('best').textContent = this.best;
    }

    undo() {
        if (this.history.length > 0) {
            this.grid = this.history.pop();
            this.score = this.calculateScore();
            this.updateScore();
            this.render();
        }
    }

    calculateScore() {
        let score = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                score += this.grid[i][j];
            }
        }
        return score;
    }

    checkGameOver() {
        // 检查是否还有空格子
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }

        // 检查是否可以合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];

                if (j < this.size - 1 && value === this.grid[i][j + 1]) {
                    return false;
                }

                if (i < this.size - 1 && value === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }

        return true;
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
}

// 游戏初始化
const game = new Game2048();

// 事件监听
document.getElementById('newGame').addEventListener('click', () => {
    game.init();
});

document.getElementById('undo').addEventListener('click', () => {
    game.undo();
});

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    let moved = false;

    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            moved = game.moveLeft();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            moved = game.moveRight();
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            moved = game.moveUp();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            moved = game.moveDown();
            break;
    }

    if (moved) {
        if (game.checkWin()) {
            setTimeout(() => {
                alert('恭喜你，成功合成了 2048！');
            }, 300);
        } else if (game.checkGameOver()) {
            setTimeout(() => {
                alert('游戏结束！');
            }, 300);
        }
    }
});

// 触摸事件监听（移动端支持）
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!e.changedTouches.length) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 30;

    let moved = false;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        // 水平滑动
        if (deltaX > 0) {
            moved = game.moveRight();
        } else {
            moved = game.moveLeft();
        }
    } else if (Math.abs(deltaY) > minSwipeDistance) {
        // 垂直滑动
        if (deltaY > 0) {
            moved = game.moveDown();
        } else {
            moved = game.moveUp();
        }
    }

    if (moved) {
        if (game.checkWin()) {
            setTimeout(() => {
                alert('恭喜你，成功合成了 2048！');
            }, 300);
        } else if (game.checkGameOver()) {
            setTimeout(() => {
                alert('游戏结束！');
            }, 300);
        }
    }
});
