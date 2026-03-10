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
});
