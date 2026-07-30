let grid = []
let stack = []
const gridBox = document.getElementById("grid-box")
const heading = document.getElementById("heading")
const startBtn = document.getElementById("start-btn")
const solveBtn = document.getElementById("solve-btn")
const speedSlider = document.getElementById("speed-slider")
const ctx = gridBox.getContext("2d")

let currentCell
let startCell
let endCell
let playerCell
let isGenerating = false
let isSolving = false
let animationFrameId
let lastFrameTime = 0

const cellSize = 20
ctx.strokeStyle = 'green'

// Start the initial maze
resetApp()

// Event Listeners for UI
startBtn.addEventListener("click", () => {
    resetApp()
})

solveBtn.addEventListener("click", () => {
    if (!isGenerating && !isSolving) {
        solveMazeBFS()
    }
})

window.addEventListener("keydown", (e) => {
    if (!playerCell || isGenerating) return
    
    // Manual Player Controls
    if (e.key === "ArrowUp" && !playerCell.topWall) {
        playerCell = grid[playerCell.row - 1][playerCell.col]
    } else if (e.key === "ArrowDown" && !playerCell.bottomWall) {
        playerCell = grid[playerCell.row + 1][playerCell.col]
    } else if (e.key === "ArrowLeft" && !playerCell.leftWall) {
        playerCell = grid[playerCell.row][playerCell.col - 1]
    } else if (e.key === "ArrowRight" && !playerCell.rightWall) {
        playerCell = grid[playerCell.row][playerCell.col + 1]
    }

    drawGrid()

    if (playerCell === endCell) {
        heading.textContent = "You Won! You reached the end!"
    }
})

function resetApp() {
    cancelAnimationFrame(animationFrameId)
    grid = []
    stack = []
    isGenerating = true
    isSolving = false

    heading.textContent = "Generating Maze..."
    
    createData()
    
    // Feature 1: Start and End Points
    startCell = grid[0][0]
    endCell = grid[29][29]
    startCell.topWall = false // Open Entrance
    endCell.bottomWall = false // Open Exit

    currentCell = startCell
    currentCell.visited = true
    playerCell = startCell

    lastFrameTime = performance.now()
    
    // Feature 4: requestAnimationFrame Optimization Loop
    requestAnimationFrame(gameLoop)
}

function gameLoop(currentTime) {
    // Calculate delay based on UI slider speed
    const delay = 101 - speedSlider.value 

    if (currentTime - lastFrameTime >= delay) {
        if (isGenerating) {
            stepGeneration()
        }
        lastFrameTime = currentTime
    }

    drawGrid()

    if (isGenerating) {
        animationFrameId = requestAnimationFrame(gameLoop)
    }
}

function stepGeneration() {
    let neighbors = getNeighbors()

    while (neighbors.length === 0 && stack.length > 0) {
        currentCell = stack.pop()
        neighbors = getNeighbors()
    }

    if (neighbors.length === 0 && stack.length === 0) {
        isGenerating = false
        heading.textContent = "Maze Complete! Use Arrow Keys or click Solve."
        return
    }

    const nextCell = randomMove(neighbors)
    stack.push(currentCell)
    removeWall(currentCell, nextCell)
    moveTo(nextCell)
}

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
                bottomWall: true,
                parent: null
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

// Feature 2: Interactive Maze Solver (BFS Algorithm)
function solveMazeBFS() {
    isSolving = true
    heading.textContent = "Solving Maze..."

    let queue = [startCell]
    let visitedNodes = new Set()
    visitedNodes.add(startCell)

    function bfsStep() {
        if (queue.length === 0) return

        let curr = queue.shift()

        if (curr === endCell) {
            reconstructPath(curr)
            heading.textContent = "Maze Solved!"
            isSolving = false
            return
        }

        let validMoves = getOpenNeighbors(curr)
        validMoves.forEach(neighbor => {
            if (!visitedNodes.has(neighbor)) {
                visitedNodes.add(neighbor)
                neighbor.parent = curr
                queue.push(neighbor)
            }
        })

        drawGrid()
        
        // Highlight search frontier
        visitedNodes.forEach(node => highlightCell(node, 'rgba(0, 150, 255, 0.2)'))

        const delay = 101 - speedSlider.value
        setTimeout(bfsStep, delay)
    }

    bfsStep()
}

function reconstructPath(node) {
    let curr = node
    while (curr) {
        highlightCell(curr, 'gold')
        curr = curr.parent
    }
}

function getOpenNeighbors(cell) {
    let neighbors = []
    if (!cell.topWall && cell.row > 0) neighbors.push(grid[cell.row - 1][cell.col])
    if (!cell.bottomWall && cell.row < 29) neighbors.push(grid[cell.row + 1][cell.col])
    if (!cell.leftWall && cell.col > 0) neighbors.push(grid[cell.row][cell.col - 1])
    if (!cell.rightWall && cell.col < 29) neighbors.push(grid[cell.row][cell.col + 1])
    return neighbors
}

function drawGrid() {
    clearCanvas()

    grid.forEach(row => {
        row.forEach(cell => {
            if (cell.visited) {
                highlightCell(cell, '#1a1a1a')
            }
            drawCellWalls(cell)
        })
    })

    // Highlight Start and End
    if (startCell) highlightCell(startCell, '#22c55e') // Green Start
    if (endCell) highlightCell(endCell, '#eab308')   // Yellow End

    // Highlight Generator Head
    if (isGenerating && currentCell) {
        highlightCell(currentCell, '#ff3366')
    }

    // Draw Player Position
    if (playerCell && !isGenerating) {
        highlightCell(playerCell, '#3b82f6') // Blue Player
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
    const xDiff = currentCell.col - nextCell.col
    const yDiff = currentCell.row - nextCell.row

    if (xDiff === 1) {
        currentCell.leftWall = false
        nextCell.rightWall = false
    } else if (xDiff === -1) {
        currentCell.rightWall = false
        nextCell.leftWall = false
    }

    if (yDiff === 1) {
        currentCell.topWall = false
        nextCell.bottomWall = false
    } else if (yDiff === -1) {
        currentCell.bottomWall = false
        nextCell.topWall = false
    }
}

function highlightCell(cell, color) {
    ctx.fillStyle = color
    ctx.fillRect(cell.x, cell.y, cellSize, cellSize)
}

function clearCanvas() {
    ctx.clearRect(0, 0, gridBox.width, gridBox.height)
}

function drawCellWalls(cell) {
    ctx.beginPath()

    if (cell.topWall) {
        ctx.moveTo(cell.x, cell.y)
        ctx.lineTo(cell.x + cellSize, cell.y)
    }
    if (cell.rightWall) {
        ctx.moveTo(cell.x + cellSize, cell.y)
        ctx.lineTo(cell.x + cellSize, cell.y + cellSize)
    }
    if (cell.bottomWall) {
        ctx.moveTo(cell.x, cell.y + cellSize)
        ctx.lineTo(cell.x + cellSize, cell.y + cellSize)
    }
    if (cell.leftWall) {
        ctx.moveTo(cell.x, cell.y)
        ctx.lineTo(cell.x, cell.y + cellSize)
    }

    ctx.stroke()
}