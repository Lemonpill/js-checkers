import { Engine, boardSize,
		pieceColors, pieceTypes } from "./js/engine.js"

document.addEventListener("DOMContentLoaded", () => {
	let engine = new Engine()
	let board = document.getElementById("board")

	function getIndexByRowCol(pos) {
		return pos[0] * boardSize + pos[1]
	}

	function getMousePosOnBoard(pos) {
		var rect = board.getBoundingClientRect()
		var x = pos[0] - rect.left;
		var y = pos[1] - rect.top;
		return [x, y]
	}

	function getSquareSize() {
		return board.offsetWidth / boardSize
	}

	function getRowColByMousePos(pos) {
		const squareSize = getSquareSize()
		const row = Math.floor(pos[1] / squareSize)
		const col = Math.floor(pos[0] / squareSize)
		return [row, col]
	}

	function createSquares(board) {
		console.log("start createSquares")
		
		for (let r = 0; r < boardSize; r++) {
			for (let c = 0; c < boardSize; c++) {
				let square = document.createElement("div")
				square.classList.add("square")
				if ((r + c) % 2) square.classList.add("light")
				else square.classList.add("dark")
				board.appendChild(square)
			}
		}

		console.log("end createSquares")
	}

	function createPieces(board, engine) {
		console.log("start createPieces")
		let squares = board.children
		let boardArray = engine.boardArray
		let pieces = []

		for (let s of squares) {
			if (s.children.length > 0) {
				s.removeChild(s.lastElementChild)
			}
		}

		for (let i = 0; i < boardArray.length; i++) {
			const p = boardArray[i]
			if (!p) continue
			let piece = document.createElement("img")
			piece.draggable = false
			piece.classList.add("piece")
			if (p.color === pieceColors.white) piece.src = "./img/white.svg"
			else piece.src = "./img/black.svg"
			if (p.type === pieceTypes.king) piece.classList.add("king")
			squares[i].appendChild(piece)
			pieces.push(piece)
		}

		createEventListeners(pieces)

		console.log("end createPieces")
	}

	function handleGameOver(engine) {
		let losingSide 
		if (engine.losingSide === pieceColors.white) {
			losingSide = "White"
		}
		else losingSide = "Black"
		let choice = confirm(`Game over! ${losingSide} has lost. Click "OK" to play again.`)
		if (choice) {
			engine.resetBoard()
			createPieces(board, engine)
		}
	}

	function highlightPossibleMoves(r, c, board, moves) {
		for (let m of moves) {
			if (m.startR === r && m.startC === c) {
				const squareIndex = getIndexByRowCol([m.endR, m.endC])
				board.children[squareIndex].classList.add("highlight")
			}
		}
	}

	function resetHighlights(board) {
		const squares = board.children
		for (let s of squares) {
			if (s.classList.contains("highlight")) {
				s.classList.remove("highlight")
			}
		}
	}

	function handlePieceDragStart(e) {
		// https://javascript.info/mouse-drag-and-drop
		// (1) prepare to moving: make absolute and on top by z-index
		console.log("start handlePieceDragStart")

		const piece = e.target;

		const [bX, bY] = getMousePosOnBoard([e.clientX, e.clientY])
		const [fromR, fromC] = getRowColByMousePos([bX, bY])

		highlightPossibleMoves(fromR, fromC, board, engine.possibleMoves)

		piece.ondragstart = function() {
			return false;
		};

		piece.style.position = 'absolute';
		piece.style.zIndex = 1000;
		
		// move it out of any current parents directly into body
		// to make it positioned relative to the body
		document.body.append(piece);

		piece.style.width = getSquareSize() * .9 + "px"
		piece.style.height = getSquareSize() * .9 + "px"

		// centers the piece at (pageX, pageY) coordinates
		function moveAt(pageX, pageY) {
			piece.style.left = pageX - piece.offsetWidth / 2 + 'px';
			piece.style.top = pageY - piece.offsetHeight / 2 + 'px';
		}
		
		// move our absolutely positioned piece under the pointer
		moveAt(e.pageX, e.pageY);
		
		function onMouseMove(e) {
			moveAt(e.pageX, e.pageY);
		}
		
		// (2) move the piece on mousemove
		document.addEventListener('mousemove', onMouseMove);
		
		// (3) drop the piece, remove unneeded handlers
		piece.onmouseup = function(e) {
			document.removeEventListener('mousemove', onMouseMove);
			piece.onmouseup = null;

			const [bX, bY] = getMousePosOnBoard([e.clientX, e.clientY])
			const [toR, toC] = getRowColByMousePos([bX, bY])

			engine.possibleMoves.filter(m => {
				if (m.startR === fromR && m.startC === fromC
				&& m.endR === toR && m.endC === toC) {
					engine.makeMove(m)
				}
			})

			resetHighlights(board)
			document.body.removeChild(piece)
			createPieces(board, engine)

			if (engine.gameOver) {
				handleGameOver(engine)
			}
		};

		console.log("end handlePieceDragStart")
	}

	function createEventListeners() {
		console.log("start createEventListeners")

		for (let m of engine.possibleMoves) {
			let index = getIndexByRowCol([m.startR, m.startC])
			let piece = board.children[index].lastElementChild
			piece.addEventListener("mousedown", handlePieceDragStart)
		}

		console.log("end createEventListeners")
	}

	createSquares(board)
	createPieces(board, engine)
})
