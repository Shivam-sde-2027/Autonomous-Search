let currentTool = '.';
let grid = [];
let rows = 5;
let cols = 6;
let isSimulating = false;

const INF = 1e9;
const dx = [1, -1, 0, 0];
const dy = [0, 0, 1, -1];

document.getElementById('speed').addEventListener('input', (e) => {
    document.getElementById('speedLabel').textContent = e.target.value + 'ms';
});

function selectTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tool === tool) {
            btn.classList.add('active');
        }
    });
}

function createGrid() {
    if (isSimulating) return;
    
    rows = parseInt(document.getElementById('rows').value);
    cols = parseInt(document.getElementById('cols').value);
    
    grid = Array(rows).fill(0).map(() => Array(cols).fill('.'));
    
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 45px)`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell road';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.onclick = () => placeCell(i, j);
            gridEl.appendChild(cell);
        }
    }
    
    document.getElementById('status').innerHTML = '';
}

function placeCell(i, j) {
    if (isSimulating) return;
    
    if (currentTool === 'S') {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 'S') grid[r][c] = '.';
            }
        }
    } else if (currentTool === 'E') {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 'E') grid[r][c] = '.';
            }
        }
    }
    
    grid[i][j] = currentTool;
    updateDisplay();
}

function updateDisplay() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const i = parseInt(cell.dataset.row);
        const j = parseInt(cell.dataset.col);
        const val = grid[i][j];
        
        cell.className = 'cell';
        cell.textContent = '';
        
        if (val === '.') {
            cell.classList.add('road');
        } else if (val === '#') {
            cell.classList.add('wall');
        } else if (val === 'S') {
            cell.classList.add('start');
            cell.textContent = '🤖';
        } else if (val === 'E') {
            cell.classList.add('exit');
            cell.textContent = '🚪';
        } else if (val === 'F') {
            cell.classList.add('fire');
            cell.textContent = '🔥';
        }
    });
}

function clearGrid() {
    if (isSimulating) return;
    grid = Array(rows).fill(0).map(() => Array(cols).fill('.'));
    updateDisplay();
    document.getElementById('status').innerHTML = '';
}

function reset() {
    isSimulating = false;
    updateDisplay();
    document.getElementById('status').innerHTML = '';
}

async function simulate() {
    if (isSimulating) return;
    isSimulating = true;
    
    let start = null, exit = null;
    const fireSources = [];
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 'S') start = [i, j];
            if (grid[i][j] === 'E') exit = [i, j];
            if (grid[i][j] === 'F') fireSources.push([i, j]);
        }
    }
    
    if (!start) {
        alert('Please place a Start point (S)');
        isSimulating = false;
        return;
    }
    if (!exit) {
        alert('Please place an Exit point (E)');
        isSimulating = false;
        return;
    }
    if (fireSources.length === 0) {
        alert('Please place at least one Fire source (F)');
        isSimulating = false;
        return;
    }
    
    const speed = parseInt(document.getElementById('speed').value);
    
    const fire = Array(rows).fill(0).map(() => Array(cols).fill(INF));
    const dist = Array(rows).fill(0).map(() => Array(cols).fill(INF));
    
    const fireQ = [];
    for (const [i, j] of fireSources) {
        fire[i][j] = 0;
        fireQ.push([i, j]);
    }
    
    let fireHead = 0;
    while (fireHead < fireQ.length) {
        const [x, y] = fireQ[fireHead++];
        
        for (let d = 0; d < 4; d++) {
            const nx = x + dx[d];
            const ny = y + dy[d];
            
            if (nx >= 0 && ny >= 0 && nx < rows && ny < cols) {
                if (grid[nx][ny] !== '#' && fire[nx][ny] === INF) {
                    fire[nx][ny] = fire[x][y] + 1;
                    fireQ.push([nx, ny]);
                }
            }
        }
    }
    
    const q = [];
    dist[start[0]][start[1]] = 0;
    q.push(start);
    
    let head = 0;
    let ans = -1;
    const path = [];
    const parent = Array(rows).fill(0).map(() => Array(cols).fill(null));
    
    while (head < q.length) {
        const [x, y] = q[head++];
        const t = dist[x][y];
        
        if (x === exit[0] && y === exit[1]) {
            ans = t;
            let curr = [x, y];
            while (curr) {
                path.unshift(curr);
                curr = parent[curr[0]][curr[1]];
            }
            break;
        }
        
        for (let d = 0; d < 4; d++) {
            const nx = x + dx[d];
            const ny = y + dy[d];
            
            if (nx >= 0 && ny >= 0 && nx < rows && ny < cols) {
                if (grid[nx][ny] !== '#' && dist[nx][ny] === INF) {
                    const nt = t + 1;
                    if (nt < fire[nx][ny]) {
                        dist[nx][ny] = nt;
                        parent[nx][ny] = [x, y];
                        q.push([nx, ny]);
                    }
                }
            }
        }
    }
    
    if (ans === -1) {
        document.getElementById('status').innerHTML = `
            <div class="result failure">
                 Mission Failed: Exit is unreachable or will burn before robot arrives!
            </div>
        `;
        isSimulating = false;
        return;
    }
    
    for (let step = 0; step <= ans; step++) {
        await new Promise(resolve => setTimeout(resolve, speed));
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const i = parseInt(cell.dataset.row);
            const j = parseInt(cell.dataset.col);
            const val = grid[i][j];
            
            cell.className = 'cell';
            cell.textContent = '';
            
            if (val === '#') {
                cell.classList.add('wall');
            } else if (val === 'E') {
                cell.classList.add('exit');
                cell.textContent = '🚪';
            } else if (fire[i][j] <= step) {
                cell.classList.add('burned');
                cell.textContent = '🔥';
            } else if (val === '.') {
                cell.classList.add('road');
            } else if (val === 'S') {
                cell.classList.add('start');
            }
            
            if (step < path.length && path[step][0] === i && path[step][1] === j) {
                cell.classList.add('robot');
                cell.textContent = '🤖';
            }
        });
        
        document.getElementById('status').innerHTML = `
            <div class="status-item">
                <strong>Current Time:</strong>
                <span>${step} minutes</span>
            </div>
            <div class="status-item">
                <strong>Robot Position:</strong>
                <span>(${path[step][0]}, ${path[step][1]})</span>
            </div>
            <div class="status-item">
                <strong>Status:</strong>
                <span>${step === ans ? ' Reached Exit!' : '🏃 Moving...'}</span>
            </div>
        `;
    }
    
    document.getElementById('status').innerHTML += `
        <div class="result success">
            Mission Successful! Robot reached exit in ${ans} minutes
        </div>
    `;
    
    isSimulating = false;
}

createGrid();

grid = [];
updateDisplay();
