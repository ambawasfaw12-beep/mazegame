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
currentCell.wall = false

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
                wall: true

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

function drawGrid() {
    grid.forEach(row => {
        row.forEach(cell => {
            cell.wall === true ? ctx.strokeRect(cell.x, cell.y, cellSize, cellSize) : ctx.fillRect(cell.x, cell.y, cellSize, cellSize)

        })
    });
}

function randomMove(neighbors) {
    let block = Math.floor(Math.random() * neighbors.length)
    return neighbors[block]
}

function moveTo(nextCell) {
    currentCell = nextCell
    currentCell.visited = true
    currentCell.wall = false
} 