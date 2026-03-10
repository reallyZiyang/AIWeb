// 2048 游戏初始化脚本

// localStorage 键名
const STORAGE_KEY_BEST_SCORE = '2048-best-score';
const STORAGE_KEY_LEADERBOARD = '2048-leaderboard';

// 获取最高分
function getBestScore() {
    const bestScore = localStorage.getItem(STORAGE_KEY_BEST_SCORE);
    return bestScore ? parseInt(bestScore, 10) : 0;
}

// 保存最高分
function saveBestScore(newScore) {
    const currentBest = getBestScore();
    if (newScore > currentBest) {
        localStorage.setItem(STORAGE_KEY_BEST_SCORE, newScore.toString());
        return true;
    }
    return false;
}

// 更新最高分显示
function updateBestScoreDisplay() {
    const bestScoreElement = document.querySelector('.best-score-value');
    if (bestScoreElement) {
        bestScoreElement.textContent = getBestScore();
    }
}

// 获取排行榜
function getLeaderboard() {
    const leaderboardJson = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    if (leaderboardJson) {
        try {
            return JSON.parse(leaderboardJson);
        } catch (e) {
            return [];
        }
    }
    return [];
}

// 保存排行榜
function saveLeaderboard(leaderboard) {
    localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(leaderboard));
}

// 更新排行榜（游戏结束时调用）
function updateLeaderboard(newScore) {
    if (newScore === 0) return;
    
    const leaderboard = getLeaderboard();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // 添加新分数
    leaderboard.push({
        score: newScore,
        date: dateStr
    });
    
    // 按分数降序排列
    leaderboard.sort((a, b) => b.score - a.score);
    
    // 只保留 Top 5
    const top5 = leaderboard.slice(0, 5);
    
    saveLeaderboard(top5);
    renderLeaderboard();
}

// 渲染排行榜
function renderLeaderboard() {
    const listElement = document.getElementById('leaderboardList');
    if (!listElement) return;
    
    const leaderboard = getLeaderboard();
    
    if (leaderboard.length === 0) {
        listElement.innerHTML = '<li class="leaderboard-empty">暂无记录</li>';
        return;
    }
    
    listElement.innerHTML = leaderboard.map((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        return `<li class="leaderboard-item">
            <span class="leaderboard-rank">${medal}</span>
            <span class="leaderboard-score">${item.score}</span>
            <span class="leaderboard-date">${item.date}</span>
        </li>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    // 初始化分数为 0
    let score = 0;
    updateScoreDisplay();
    updateBestScoreDisplay();
    renderLeaderboard();
    
    // 4x4 游戏网格
    const gridSize = 4;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    // 记录每个位置的上一个值，用于判断是否是新增或合并
    const prevGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
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
                const prevValue = prevGrid[row][col];
                
                // 清除之前的方块类（保留基础类），但保留动画类如果正在动画中
                const isAnimating = cell.classList.contains('tile-new') || cell.classList.contains('tile-merged');
                cell.className = 'grid-cell';
                cell.textContent = '';
                
                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add('tile-' + value);
                    cell.classList.add('tile');
                    
                    // 如果正在动画中，不重复添加动画类
                    if (!isAnimating) {
                        // 判断是新增方块还是合并方块
                        if (prevValue === 0 && value !== prevValue) {
                            // 新方块出现
                            cell.classList.add('tile-new');
                            // 动画结束后移除类
                            setTimeout(() => {
                                cell.classList.remove('tile-new');
                            }, 200);
                        } else if (prevValue !== 0 && value !== prevValue && value === prevValue * 2) {
                            // 合并方块
                            cell.classList.add('tile-merged');
                            // 动画结束后移除类
                            setTimeout(() => {
                                cell.classList.remove('tile-merged');
                            }, 200);
                        }
                    }
                }
                
                // 更新prevGrid
                prevGrid[row][col] = value;
            }
        }
    }
    
    // 初始化游戏
    function initGame() {
        // 清空网格
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                grid[row][col] = 0;
                prevGrid[row][col] = 0;
            }
        }
        
        // 分数归零
        score = 0;
        
        // 生成两个随机方块
        addRandomTile();
        addRandomTile();
        
        // 渲染
        renderGrid();
        updateScoreDisplay();
    }
    
    // 重置游戏（供新游戏按钮调用）
    function resetGame() {
        initGame();
    }
    
    // 绑定新游戏按钮点击事件
    const newGameBtn = document.getElementById('newGameBtn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', resetGame);
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

    // 触摸滑动事件监听
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 30; // 滑动阈值，防止误触

    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 0) {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchend', function(event) {
        if (event.changedTouches.length > 0) {
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            let moved = false;
            
            // 判断是水平滑动还是垂直滑动
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
                    if (deltaX > 0) {
                        // 向右滑动
                        moved = moveRight();
                    } else {
                        // 向左滑动
                        moved = moveLeft();
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
                    if (deltaY > 0) {
                        // 向下滑动
                        moved = moveDown();
                    } else {
                        // 向上滑动
                        moved = moveUp();
                    }
                }
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
        }
    }, { passive: true });

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
        // 更新最高分和排行榜
        saveBestScore(score);
        updateBestScoreDisplay();
        updateLeaderboard(score);
        
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
