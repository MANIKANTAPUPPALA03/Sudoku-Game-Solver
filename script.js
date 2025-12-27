const startScreen = document.getElementById("startScreen")
const gameScreen = document.getElementById("gameScreen")
const startBtn = document.getElementById("startGame")

const boardEl = document.getElementById("board")
const newGameBtn = document.getElementById("newGame")
const resetBtn = document.getElementById("reset")
const hintBtn = document.getElementById("hint")
const timerEl = document.getElementById("timer")
const numberButtons = document.querySelectorAll(".numbers button")

let size = 9
let boxRows = 3
let boxCols = 3

let solution = []
let puzzle = []
let userBoard = []
let selectedCell = null

let seconds = 0
let timer = null

/* ---------- START GAME ---------- */
startBtn.onclick = () => {
  size = Number(document.getElementById("gridSize").value)

  if (size === 9) {
    boxRows = 3
    boxCols = 3
  } else {
    boxRows = 2
    boxCols = 3
  }

  startScreen.style.display = "none"
  gameScreen.style.display = "block"
  createGame()
}

/* ---------- TIMER ---------- */
function startTimer() {
  clearInterval(timer)
  seconds = 0
  timer = setInterval(() => {
    seconds++
    const m = String(Math.floor(seconds / 60)).padStart(2, "0")
    const s = String(seconds % 60).padStart(2, "0")
    timerEl.textContent = `${m}:${s}`
  }, 1000)
}

/* ---------- BOARD UTILS ---------- */
function emptyBoard() {
  return Array.from({ length: size }, () => Array(size).fill(0))
}

function isValid(board, r, c, n) {
  for (let i = 0; i < size; i++) {
    if (board[r][i] === n || board[i][c] === n) return false
  }

  const br = Math.floor(r / boxRows) * boxRows
  const bc = Math.floor(c / boxCols) * boxCols

  for (let i = br; i < br + boxRows; i++) {
    for (let j = bc; j < bc + boxCols; j++) {
      if (board[i][j] === n) return false
    }
  }
  return true
}

function hasConflict(board, r, c, n) {
  for (let i = 0; i < size; i++) {
    if (i !== c && board[r][i] === n) return true
    if (i !== r && board[i][c] === n) return true
  }

  const br = Math.floor(r / boxRows) * boxRows
  const bc = Math.floor(c / boxCols) * boxCols

  for (let i = br; i < br + boxRows; i++) {
    for (let j = bc; j < bc + boxCols; j++) {
      if ((i !== r || j !== c) && board[i][j] === n) return true
    }
  }
  return false
}

/* ---------- GENERATE ---------- */
function fill(board) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) {
        const nums = [...Array(size).keys()]
          .map(n => n + 1)
          .sort(() => Math.random() - 0.5)

        for (let n of nums) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n
            if (fill(board)) return true
            board[r][c] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

function removeCells(board) {
  let remove = size === 9 ? 45 : 20
  while (remove > 0) {
    const r = Math.floor(Math.random() * size)
    const c = Math.floor(Math.random() * size)
    if (board[r][c] !== 0) {
      board[r][c] = 0
      remove--
    }
  }
}

/* ---------- GAME ---------- */
function createGame() {
  solution = emptyBoard()
  fill(solution)
  puzzle = solution.map(r => r.slice())
  removeCells(puzzle)
  userBoard = puzzle.map(r => r.slice())
  render()
  startTimer()
  removeWinOverlay()
}

/* ---------- RENDER ---------- */
function render() {
  boardEl.innerHTML = ""
  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div")
      cell.className = "cell"
      cell.dataset.row = r
      cell.dataset.col = c

      if ((c + 1) % boxCols === 0 && c !== size - 1) cell.dataset.right = "true"
      if ((r + 1) % boxRows === 0 && r !== size - 1) cell.dataset.bottom = "true"

      if (puzzle[r][c] !== 0) {
        cell.textContent = puzzle[r][c]
        cell.classList.add("fixed")
      } else if (userBoard[r][c] !== 0) {
        cell.textContent = userBoard[r][c]
      }

      if (
        userBoard[r][c] !== 0 &&
        hasConflict(userBoard, r, c, userBoard[r][c])
      ) {
        cell.classList.add("error")
      }

      cell.onclick = () => selectCell(cell)
      boardEl.appendChild(cell)
    }
  }
}

function selectCell(cell) {
  if (cell.classList.contains("fixed")) return
  document.querySelectorAll(".cell").forEach(c => c.classList.remove("selected"))
  cell.classList.add("selected")
  selectedCell = cell
}

function placeNumber(n) {
  if (!selectedCell) return
  const r = Number(selectedCell.dataset.row)
  const c = Number(selectedCell.dataset.col)
  userBoard[r][c] = n
  render()
  checkWin()
}

/* ---------- WIN ---------- */
function checkWin() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (userBoard[r][c] !== solution[r][c]) return
    }
  }
  clearInterval(timer)
  showWinOverlay()
}

/* ---------- OVERLAY + CONFETTI ---------- */
function showWinOverlay() {
  const overlay = document.createElement("div")
  overlay.id = "winOverlay"
  overlay.innerHTML = `
    <div class="winBox">
      <h2>🎉 Solved! 🎉</h2>
      <p>Time: ${timerEl.textContent}</p>
      <button onclick="createGame()">Play Again</button>
    </div>
  `
  document.body.appendChild(overlay)
  launchConfetti()
}

function removeWinOverlay() {
  const old = document.getElementById("winOverlay")
  if (old) old.remove()
}

/* ---------- CONFETTI ---------- */
function launchConfetti() {
  for (let i = 0; i < 120; i++) {
    const c = document.createElement("span")
    c.className = "confetti"
    c.style.left = Math.random() * 100 + "vw"
    c.style.animationDuration = 2 + Math.random() * 3 + "s"
    document.body.appendChild(c)
    setTimeout(() => c.remove(), 5000)
  }
}

/* ---------- BUTTONS ---------- */
hintBtn.onclick = () => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (userBoard[r][c] === 0) {
        userBoard[r][c] = solution[r][c]
        render()
        return
      }
    }
  }
}

resetBtn.onclick = () => {
  userBoard = puzzle.map(r => r.slice())
  render()
}

newGameBtn.onclick = createGame

numberButtons.forEach(btn => {
  btn.onclick = () => {
    if (btn.id === "clear") placeNumber(0)
    else placeNumber(Number(btn.textContent))
  }
})

document.addEventListener("keydown", e => {
  if (!selectedCell) return
  if (e.key >= "1" && e.key <= String(size)) placeNumber(Number(e.key))
  if (e.key === "Backspace" || e.key === "Delete") placeNumber(0)
})
