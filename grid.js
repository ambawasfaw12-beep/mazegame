const grid = []
const stack = []
const gridBox = document.getElementById("grid-box")
const heading = document.getElementById("heading")
const ctx = gridBox.getContext("2d"); // 1. Get the drawing context
let currentCell

const cellSize = 20
ctx.strokeStyle = 'green'
ctx.fillStyle = "white"

createData()
currentCell = grid[0][0]
currentCell.visited = true

generateMaze()
function generateMaze() {
    let neighbors = getNeighbors()

    while (neighbors.length === 0 && stack.length > 0) {
        currentCell = stack.pop();
        neighbors = getNeighbors();
    }

    if (neighbors.length === 0 && stack.length === 0) {
        drawGrid(); // Final draw
        heading.textContent = "Maze Generation Complete!";
        return;
    }

    const nextCell = randomMove(neighbors)
    setTimeout(() => {
        stack.push(currentCell)
        removeWall(currentCell, nextCell)
        moveTo(nextCell)
        drawGrid()
        generateMaze()
    }, 50)
}

// drawGrid()

function createData() {
    let rows
    for (let row = 0; row < 30; row++) {

        rows = []

        let y = row * cellSize
        for (let col = 0; col < 30; col++) {

            let x = col * cellSize
            let data = {
                row,
                col,
                x,
                y,
                visited: false,
                leftWall: true,
                rightWall: true,
                topWall: true,
                bottomWall: true
            }
            rows.push(data)
        }
        grid.push(rows)
    }
}

function getNeighbors() {

    let neighbors = []

    if (currentCell.row > 0 && grid[currentCell.row - 1][currentCell.col].visited === false) {
        neighbors.push(grid[currentCell.row - 1][currentCell.col])
    }

    if (currentCell.row < 29 && grid[currentCell.row + 1][currentCell.col].visited === false) {
        neighbors.push(grid[currentCell.row + 1][currentCell.col])
    }

    if (currentCell.col > 0 && grid[currentCell.row][currentCell.col - 1].visited === false) {
        neighbors.push(grid[currentCell.row][currentCell.col - 1])
    }

    if (currentCell.col < 29 && grid[currentCell.row][currentCell.col + 1].visited === false) {
        neighbors.push(grid[currentCell.row][currentCell.col + 1])
    }
    return neighbors

}

function highlightCell(cell, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
}

function drawGrid() {
    clearCanvas();

    grid.forEach(row => {
        row.forEach(cell => {
            // Highlight visited paths
            if (cell.visited) {
                highlightCell(cell, '#1a1a1a'); 
            }
            
            // Draw walls
            drawCellWalls(cell);
        });
    });

    // Highlight the active head node searching the grid
    if (currentCell) {
        highlightCell(currentCell, '#ff3366');
    }
}

function randomMove(neighbors) {
    let block = Math.floor(Math.random() * neighbors.length)
    return neighbors[block]
}

function moveTo(nextCell) {
    currentCell = nextCell
    currentCell.visited = true
}

function removeWall(currentCell, nextCell) {
    const xDiff = currentCell.col - nextCell.col;
    const yDiff = currentCell.row - nextCell.row;

    // Moving Left / Right
    if (xDiff === 1) {
        currentCell.leftWall = false;
        nextCell.rightWall = false;
    } else if (xDiff === -1) {
        currentCell.rightWall = false;
        nextCell.leftWall = false;
    }

    // Moving Up / Down
    if (yDiff === 1) {
        currentCell.topWall = false;
        nextCell.bottomWall = false;
    } else if (yDiff === -1) {
        currentCell.bottomWall = false;
        nextCell.topWall = false;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, gridBox.width, gridBox.height);
}

function drawCellWalls(cell) {
    ctx.beginPath();
    
    // Top Wall
    if (cell.topWall) {
        ctx.moveTo(cell.x, cell.y);
        ctx.lineTo(cell.x + cellSize, cell.y);
    }
    // Right Wall
    if (cell.rightWall) {
        ctx.moveTo(cell.x + cellSize, cell.y);
        ctx.lineTo(cell.x + cellSize, cell.y + cellSize);
    }
    // Bottom Wall
    if (cell.bottomWall) {
        ctx.moveTo(cell.x, cell.y + cellSize);
        ctx.lineTo(cell.x + cellSize, cell.y + cellSize);
    }
    // Left Wall
    if (cell.leftWall) {
        ctx.moveTo(cell.x, cell.y);
        ctx.lineTo(cell.x, cell.y + cellSize);
    }

    ctx.stroke();
}