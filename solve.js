// Javascript intepretation of the Match 3 Solver
// Only usable through the website

// Arrays used for solving
const puzzleBoard = [];
const movesToSolve = [];

// Where output is written out to
const outputBox = document.getElementById("output");

// Function called from the website button to start the solve process
function startSolve() {
    setUpBoard();
    solve();
}

// Sets the puzzleBoard and movesToSolve arrays up pre-solve
function setUpBoard() {
    // Empty the board if it isn't already
    puzzleBoard.length = 0;
    // Empty the solution moves if it isn't already
    movesToSolve.length = 0;

    // Get all the tiles
    let tiles = tileContainer.getElementsByClassName("tile");

    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        const tempRowOfTiles = [];
        for (let x = 0; x < width; x++) {
            // Add that tile's c value to the row of tiles
            const tile = tiles[y * height + x];
            let cNumber = Number(getCNumber(tile));
            tempRowOfTiles.push(cNumber);
        }
        // Add the row of tiles to the puzzleBoard
        puzzleBoard.push(tempRowOfTiles);
    }
}

// Recursive function that solves the puzzle
function solve() {
    checkForWin();

    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If the tile is movable
            if (puzzleBoard[y][x] > 0) {
                // Check if the piece can be moved up or right
                // There is no need to check down or left as those would be
                // another piece's up or right respectively

                if (checkValidMove(y, x, y - 1, x)) { // Up
                    executeMove(y, x, y - 1, x)
                }
                if (checkValidMove(y, x, y, x + 1)) { // Right
                    executeMove(y, x, y, x + 1)
                }
            }
        }
    }
}

// Checks if a move is a valid move
// Input coordinates y1, x1 to be swapped with y2, x2
function checkValidMove(y1, x1, y2, x2) {
    // If the move is out of bounds
    if (y2 < 0 || x2 >= width) {
        return false;
    }

    // If the move is swapping with air or a blocker
    if (puzzleBoard[y2][x2] < 1) {
        return false;
    }

    // Swap the 2 spots on the puzzle board
    let tempValue = puzzleBoard[y1][x1];
    puzzleBoard[y1][x1] = puzzleBoard[y2][x2];
    puzzleBoard[y2][x2] = tempValue;

    // Check if the move results in any blocks being removed
    let isMoveValid = (checkIfBlocksRemoved(y1, x1) || checkIfBlocksRemoved(y2, x2));

    // Swap the pieces back
    tempValue = puzzleBoard[y1][x1];
    puzzleBoard[y1][x1] = puzzleBoard[y2][x2];
    puzzleBoard[y2][x2] = tempValue;

    return isMoveValid;
}

// Takes an x and y coordinate of the puzzle board
// Checks if that piece should be removed
function checkIfBlocksRemoved(y, x) {
    // If it matches with the 2 blocks above it
    if (y - 2 >= 0) {
        if (puzzleBoard[y - 2][x] == puzzleBoard[y - 1][x] && puzzleBoard[y - 1][x] == puzzleBoard[y][x]) {
            return true;
        }
    }
    // If it matches with 1 block above it and 1 below it
    if (y - 1 >= 0 && y + 1 < height) {
        if (puzzleBoard[y - 1][x] == puzzleBoard[y][x] && puzzleBoard[y][x] == puzzleBoard[y + 1][x]) {
            return true;
        }
    }
    // If it matches with the 2 blocks below it
    if (y + 2 < height) {
        if (puzzleBoard[y][x] == puzzleBoard[y + 1][x] && puzzleBoard[y + 1][x] == puzzleBoard[y + 2][x]) {
            return true;
        }
    }

    // If it matches with the 2 blocks to the left of it
    if (x - 2 >= 0) {
        if (puzzleBoard[y][x - 2] == puzzleBoard[y][x - 1] && puzzleBoard[y][x - 1] == puzzleBoard[y][x]) {
            return true;
        }
    }
    // If it matches with the block to the left and to the right of it
    if (x - 1 >= 0 && x + 1 < width) {
        if (puzzleBoard[y][x - 1] == puzzleBoard[y][x] && puzzleBoard[y][x] == puzzleBoard[y][x + 1]) {
            return true;
        }
    }
    // If it matches with the 2 blocks to the right of it
    if (x + 2 < width) {
        if (puzzleBoard[y][x] == puzzleBoard[y][x + 1] && puzzleBoard[y][x + 1] == puzzleBoard[y][x + 2]) {
            return true;
        }
    }

    // If none of the moves resulted in blocks being removed
    return false;
}

// Executes a given move on the board
// Input coordinates y1, x1 to be swapped with y2, x2
function executeMove(y1, x1, y2, x2) {
    // Add the move to the move list
    movesToSolve.push([`${y1}, ${x1}`, `${y2}, ${x2}`]);
    // Save the current board state
    const oldBoardState = JSON.parse(JSON.stringify(puzzleBoard));

    // Execute the move and recalculate the new puzzle board
    tempValue = puzzleBoard[y1][x1];
    puzzleBoard[y1][x1] = puzzleBoard[y2][x2];
    puzzleBoard[y2][x2] = tempValue;
    recalculateBoard();

    // Attempt to do the next move
    solve();

    // If this line was reached, the move was inccorect, so revert to the old board state
    puzzleBoard.length = 0;
    puzzleBoard = JSON.parse(JSON.stringify(oldBoardState));
    // And remove the move from the move list
    movesToSolve.pop()
}

// Check if there are any pieces that need to be removed and removes them
// Then rearranges the board to account for pieces falling
// Recursively calls itself until no pieces move
function recalculateBoard() {

}

// Checks if any values in the array are greater than 0
// If there are none, the puzzle is solved and calls output solution
function checkForWin() {
    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If there is a tile, return
            if (puzzleBoard[y][x] > 0) {
                return;
            }
        }
    }

    // If this line is reached, the puzzle is solved
    outputSolution();
    throw new Error("This is not an error. This is just to stop the solving process on success.");
}

function outputSolution() {
    //TODO:
}