// 2048 游戏初始化脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化分数为 0
    let score = 0;
    updateScoreDisplay();
    
    // 4x4 游戏网格
    const gridSize = 4;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    // 获取所有格子元素
    const cells = document.querySelectorAll('.grid-cell');
    
    // 随机选择一个位置
    function getRandomPosition() {
        return {
            row: Math.floor(Math.random() * gridSize),
            col: Math.floor(Math.random() * gridSize)
        };
    }
    
    // 获取空位置列表
    function getEmptyPositions() {
        const positions = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (grid[row][col] === 0) {
                    positions.push({ row, col });
                }
            }
        }
        return positions;
    }
    
    // 生成随机值 (2 或 4)
    function getRandomValue() {
        return Math.random() < 0.9 ? 2 : 4;
    }
    
    // 在随机空位置生成方块
    function addRandomTile() {
        const emptyPositions = getEmptyPositions();
        if (emptyPositions.length === 0) return;
        
        const position = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        grid[position.row][position.col] = getRandomValue();
    }
    
    // 更新分数显示
    function updateScoreDisplay() {
        const scoreElement = document.querySelector('.score-value');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
    
    // 渲染网格到 DOM
    function renderGrid() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const index = row * gridSize + col;
                const cell = cells[index];
                const value = grid[row][col];
                
                // 清除之前的方块类
                cell.className = 'grid-cell';
                cell.textContent = '';
                
                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add('tile-' + value);
                    cell.classList.add('tile');
                }
            }
        }
    }
    
    // 初始化游戏
    function initGame() {
        // 清空网格
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                grid[row][col] = 0;
            }
        }
        
        // 生成两个随机方块
        addRandomTile();
        addRandomTile();
        
        // 渲染
        renderGrid();
        updateScoreDisplay();
    }
    
    // 启动游戏
    initGame();

    // 键盘事件监听
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        let moved = false;

        if (key === 'ArrowLeft') {
            moved = moveLeft();
        } else if (key === 'ArrowRight') {
            moved = moveRight();
        } else if (key === 'ArrowUp') {
            moved = moveUp();
        } else if (key === 'ArrowDown') {
            moved = moveDown();
        }

        if (moved) {
            addRandomTile();
            renderGrid();
            updateScoreDisplay();
            
            // 检查游戏是否结束
            if (checkGameOver()) {
                showGameOver();
            }
        }
    });

    // 检查游戏是否结束
    function checkGameOver() {
        // 检查是否有空位
        const emptyPositions = getEmptyPositions();
        if (emptyPositions.length > 0) {
            return false;
        }
        
        // 检查是否有可合并的相邻块
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const current = grid[row][col];
                
                // 检查右边
                if (col < gridSize - 1 && grid[row][col + 1] === current) {
                    return false;
                }
                
                // 检查下边
                if (row < gridSize - 1 && grid[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        // 没有空位且没有可合并的相邻块
        return true;
    }

    // 显示游戏结束弹窗
    function showGameOver() {
        // 检查弹窗是否已存在
        let overlay = document.querySelector('.game-over-overlay');
        if (overlay) {
            return;
        }
        
        // 创建遮罩层
        overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        
        // 创建弹窗内容
        const gameOverBox = document.createElement('div');
        gameOverBox.className = 'game-over-box';
        
        const title = document.createElement('h2');
        title.className = 'game-over-title';
        title.textContent = '游戏结束!';
        
        const finalScore = document.createElement('p');
        finalScore.className = 'game-over-score';
        finalScore.textContent = '最终得分: ' + score;
        
        const restartBtn = document.createElement('button');
        restartBtn.className = 'game-over-restart';
        restartBtn.textContent = '再来一局';
        restartBtn.onclick = function() {
            initGame();
            overlay.remove();
        };
        
        gameOverBox.appendChild(title);
        gameOverBox.appendChild(finalScore);
        gameOverBox.appendChild(restartBtn);
        overlay.appendChild(gameOverBox);
        document.body.appendChild(overlay);
    }

    // 左移：每行方块靠左
    function moveLeft() {
        let moved = false;
        for (let row = 0; row < gridSize; row++) {
            // 提取非零值
            let tiles = grid[row].filter(val => val !== 0);
            
            // 合并相邻的相同数字
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            
            // 补齐到 gridSize 长度
            while (tiles.length < gridSize) {
                tiles.push(0);
            }
            
            // 压缩到左边
            for (let col = 0; col < gridSize; col++) {
                if (grid[row][col] !== tiles[col]) {
                    grid[row][col] = tiles[col];
                    moved = true;
                }
            }
        }
        return moved;
    }

    // 右移：每行方块靠右
    function moveRight() {
        let moved = false;
        for (let row = 0; row < gridSize; row++) {
            // 提取非零值
            let tiles = grid[row].filter(val => val !== 0);
            
            // 合并相邻的相同数字（从左到右合并）
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            
            // 从右边开始填充
            for (let col = gridSize - 1; col >= 0; col--) {
                const tileIndex = tiles.length - 1 - (gridSize - 1 - col);
                const newValue = tileIndex >= 0 ? tiles[tileIndex] : 0;
                if (grid[row][col] !== newValue) {
                    grid[row][col] = newValue;
                    moved = true;
                }
            }
        }
        return moved;
    }

    // 上移：每列方块靠上
    function moveUp() {
        let moved = false;
        for (let col = 0; col < gridSize; col++) {
            // 提取列中的非零值
            let tiles = [];
            for (let row = 0; row < gridSize; row++) {
                if (grid[row][col] !== 0) {
                    tiles.push(grid[row][col]);
                }
            }
            
            // 合并相邻的相同数字
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            
            // 压缩到上边
            for (let row = 0; row < gridSize; row++) {
                const newValue = row < tiles.length ? tiles[row] : 0;
                if (grid[row][col] !== newValue) {
                    grid[row][col] = newValue;
                    moved = true;
                }
            }
        }
        return moved;
    }

    // 下移：每列方块靠下
    function moveDown() {
        let moved = false;
        for (let col = 0; col < gridSize; col++) {
            // 提取列中的非零值
            let tiles = [];
            for (let row = 0; row < gridSize; row++) {
                if (grid[row][col] !== 0) {
                    tiles.push(grid[row][col]);
                }
            }
            
            // 合并相邻的相同数字
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            
            // 压缩到下边
            for (let row = gridSize - 1; row >= 0; row--) {
                const tileIndex = tiles.length - 1 - (gridSize - 1 - row);
                const newValue = tileIndex >= 0 ? tiles[tileIndex] : 0;
                if (grid[row][col] !== newValue) {
                    grid[row][col] = newValue;
                    moved = true;
                }
            }
        }
        return moved;
    }
});
