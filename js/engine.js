export const boardSize = 8

export const pieceTypes = {
	man: 0,
	king: 1
}

export const pieceColors = {
	white: 0,
	black: 1
}

const directions = {
	ne: [-1, 1],
	es: [1, 1],
	sw: [1, -1],
	nw: [-1, -1]
}

const standardBoardMap = [
	['bm', '--', 'bm', '--', 'bm', '--', 'bm', '--'],
	['--', 'bm', '--', 'bm', '--', 'bm', '--', 'bm'],
	['bm', '--', 'bm', '--', 'bm', '--', 'bm', '--'],
	['--', '--', '--', '--', '--', '--', '--', '--'],
	['--', '--', '--', '--', '--', '--', '--', '--'],
	['--', 'wm', '--', 'wm', '--', 'wm', '--', 'wm'],
	['wm', '--', 'wm', '--', 'wm', '--', 'wm', '--'],
	['--', 'wm', '--', 'wm', '--', 'wm', '--', 'wm'],
]

// const standardBoardMap = [
// 	['--', '--', 'bm', '--', '--', '--', 'bm', '--'],
// 	['--', '--', '--', '--', '--', 'wm', '--', '--'],
// 	['--', '--', 'bm', '--', '--', '--', '--', '--'],
// 	['--', '--', '--', '--', '--', 'wm', '--', '--'],
// 	['--', '--', 'bm', '--', '--', '--', '--', '--'],
// 	['--', '--', '--', '--', '--', 'wm', '--', '--'],
// 	['--', '--', 'bm', '--', '--', '--', 'bm', '--'],
// 	['--', 'wm', '--', '--', '--', 'wm', '--', '--'],
// ]

const Piece = class {
	constructor(r, c, type, color) {
		this.r = r
		this.c = c
		this.type = type
		this.color = color
	}
}

const Move = class {
	constructor(startR, startC, endR, endC,
		isCapture=false, capturedR=null, capturedC=null) {
		this.startR = startR
		this.startC = startC
		this.endR = endR
		this.endC = endC
		this.isCapture = isCapture
		this.capturedR = capturedR
		this.capturedC = capturedC
	}

	print() {
		let line = `${this.startR},${this.startC}->${this.endR},${this.endC}`
		if (this.isCapture) line += ` X ${this.captureR},${this.captureC}`
		console.log(line)
	}
}

export const Engine = class {
	constructor() {
		this.turn = pieceColors.white
		this.board = this.createBoardFromMap(standardBoardMap)
		this.possibleMoves = this.getAvailableMoves()
		
		this.gameOver = false
		this.losingSide = null
	}

	isInRange(v, r) {
		return v >= 0 && v < r
	}

	isOnBoard(r, c) {
		return this.isInRange(r, boardSize)
		&& this.isInRange(c, boardSize)
	}

	isVacant(r, c) {
		return this.isOnBoard(r, c)
		&& !this.board[r][c]
	}

	isEnemy(r, c) {
		return (
			this.isOnBoard(r, c)
			&& !this.isVacant(r, c)
			&& this.board[r][c].color !== this.turn
		)
	}

	isFriend(r, c) {
		return (
			this.isOnBoard(r, c)
			&& !this.isVacant(r, c)
			&& this.board[r][c].color === this.turn
		)
	}

	isMan(r, c) {
		return this.board[r][c].type === pieceTypes.man
	}

	isKing(r, c) {
		return this.board[r][c].type === pieceTypes.king
	}

	isWhite(r, c) {
		return this.board[r][c].color === pieceColors.white
	}

	isBlack(r, c) {
		return this.board[r][c].color === pieceColors.black
	}

	isCrownRow(r) {
		return (r === 7 && this.turn === pieceColors.black)
		|| (r === 0 && this.turn === pieceColors.white)
	}

	isStepForward(offset) {
		return (offset[0] > 0 && this.turn === pieceColors.black)
		|| (offset[0] < 0 && this.turn === pieceColors.white)
	}

	getPieceCount(color) {
		console.log("start blackPiecesCount")
		let count = 0

		for (let r = 0; r < boardSize; r++) {
			for (let c = 0; c < boardSize; c++) {
				if (!this.isOnBoard(r, c) || this.isVacant(r, c)) continue
				let piece = this.board[r][c]
				if (piece.color === color) count += 1
			}
		}

		console.log("end blackPiecesCount")
		return count
	}

	switchSides() {
		if (this.turn === pieceColors.white) this.turn = pieceColors.black
		else this.turn = pieceColors.white
	}

	resetBoard() {
		console.log("start resetBoard")

		this.turn = pieceColors.white
		this.board = this.createBoardFromMap(standardBoardMap)
		this.possibleMoves = this.getAvailableMoves()
		
		this.gameOver = false
		this.losingSide = null

		console.log("end resetBoard")
	}

	get boardArray() {
		console.log("start boardArray")
		let arr = []

		for (let r = 0; r < boardSize; r++) {
			for (let c = 0; c < boardSize; c++) {
				arr.push(this.board[r][c])
			}
		}

		console.log("end boardArray")
		return arr
	}
	
	createBoardFromMap(m) {
		let board = []
		for (let r = 0; r < boardSize; r++) {
			let row = []
			for (let c = 0; c < boardSize; c++) {
				if (m[r][c] === "--") row.push(null)
				else {
					let piece = new Piece(r, c)
					if (m[r][c][0] === "w") piece.color = pieceColors.white
					else piece.color = pieceColors.black
					if (m[r][c][1] === "m") piece.type = pieceTypes.man
					else piece.type = pieceTypes.king
					row.push(piece)
				}
			}
			board.push(row)
		}
		return board
	}

	createMapFromBoard(b) {
		let map = []
		for (let r = 0; r < boardSize; r++) {
			let row = []
			for (let c = 0; c < boardSize; c++) {
				const piece = b[r][c]
				if (!piece) row.push("--")
				else {
					let name = ""
					if (piece.color === pieceColors.white) name += "w"
					else name += "b"
					if (piece.type === pieceTypes.man) name += "m"
					else name += "k"
					row.push(name) 
				}
			}
			map.push(row)
		}
		return map
	}

	createMoveMap(fromR, fromC) {
		console.log("start createMoveMap")
		let map = []

		for (let r = 0; r < boardSize; r++) {
			let row = []
			for (let c = 0; c < boardSize; c++) row.push("-")
			map.push(row)
		}
		map[fromR][fromC] = "o"
		this.possibleMoves.filter(m => {
			if (m.startR === fromR
			&& m.startC === fromC) map[m.endR][m.endC] = "x"
		})

		console.log("end createMoveMap")
		return map
	}

	getPossiblePieceMoves(r, c, isMan=true) {
		console.log("start getPossiblePieceMoves")
		let moves = []

		for (let d of Object.values(directions)) {
			if (isMan && !this.isStepForward(d)) continue

			let nextR = r + d[0]
			let nextC = c + d[1]

			if (this.isVacant(nextR, nextC)) {
				const move = new Move(r, c, nextR, nextC)
				moves.push(move)
			}
		}
		
		console.log("end getPossiblePieceMoves")
		return moves
	}

	getPossiblePieceJumps(r, c, isMan=true) {
		console.log("start getPossiblePieceJumps")
		let moves = []

		for (let d of Object.values(directions)) {
			if (isMan && !this.isStepForward(d)) continue

			const nextR = r + d[0]
			const nextC = c + d[1]

			if (this.isEnemy(nextR, nextC)) {
				const landR = nextR + d[0]
				const landC = nextC + d[1]
				if (this.isVacant(landR, landC)) {
					const move = new Move(
						r, c, landR, landC,
						true, nextR, nextC
					)
					moves.push(move)
				}
			}
		}
		
		console.log("end getPossiblePieceJumps")
		return moves
	}

	getPossibleMoves() {
		console.log("start getPossibleMoves")
		let moves = []

		for (let r = 0; r < boardSize; r++) {
			for (let c = 0; c < boardSize; c++) {
				if (!this.isFriend(r, c)) continue
				const isMan = this.isMan(r, c)
				const pieceMoves = this.getPossiblePieceMoves(r, c, isMan)
				moves = moves.concat(pieceMoves)
			}
		}

		console.log("end getPossibleMoves")
		return moves
	}

	getPossibleJumps() {
		console.log("start getPossibleJumps")
		let moves = []

		for (let r = 0; r < boardSize; r++) {
			for (let c = 0; c < boardSize; c++) {
				if (!this.isFriend(r, c)) continue
				const isMan = this.isMan(r, c)
				const pieceJumps = this.getPossiblePieceJumps(r, c, isMan)
				moves = moves.concat(pieceJumps)
			}
		}

		console.log("end getPossibleJumps")
		return moves
	}

	getAvailableMoves() {
		console.log("start getAvailableMoves")

		let allJumps = this.getPossibleJumps()

		if (allJumps.length) {
			console.log("end getAvailableMoves")
			return allJumps
		}

		let moves = this.getPossibleMoves()

		console.log("end getAvailableMoves")
		return moves
	}

	makeMove(move) {
		console.log("start makeMove")

		// Modify piece
		let movingPiece = this.board[move.startR][move.startC]
		movingPiece.r = move.endR
		movingPiece.c = move.endC

		// Modify board
		this.board[move.startR][move.startC] = null
		this.board[move.endR][move.endC] = movingPiece

		// Handle crowning
		if (movingPiece.type !== pieceTypes.king
		&& this.isCrownRow(movingPiece.r)) {
			movingPiece.type = pieceTypes.king
		}

		// Handle capture
		if (move.isCapture) {
			this.board[move.capturedR][move.capturedC] = null

			let fromR = move.endR
			let fromC = move.endC
			let isMan = movingPiece.type === pieceTypes.man

			let capturesLeft = this.getPossiblePieceJumps(fromR, fromC, isMan)

			if (capturesLeft.length) {
				this.possibleMoves = capturesLeft
			}
			else {
				this.switchSides()
				this.possibleMoves = this.getAvailableMoves()
			}
		}
		else {
			this.switchSides()
			this.possibleMoves = this.getAvailableMoves()
		}

		// Handle game over
		if (!this.possibleMoves.length) {
			this.gameOver = true
			this.losingSide = this.turn
		}

		console.log("end makeMove")
	}
}