// Initialize the grid
const tileContainer = document.getElementById("tilecontainer");
const gridSizeBoxes = document.getElementsByClassName("sizeinput");
const colorSelector = document.getElementById("colorselector");
const widthBox = gridSizeBoxes[0].children[0];
const heightBox = gridSizeBoxes[1].children[0];
let width = 0;
let height = 0;
let selectedColor = null;
updateGridSize();

// Give the input boxes event handlers
widthBox.addEventListener("change", updateGridSize);
heightBox.addEventListener("change", updateGridSize);

// For determining if the mouse is being held down
let isMouseDown = false;
document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp);

// Help button events
const helpArea = document.getElementById("helparea");
document.getElementById("helpdiamond").addEventListener("click", showHelpArea);
helpArea.addEventListener("click", hideHelpArea);

// Color selector events
colorSelector.addEventListener("click", cSelect);

// Add clear button event
document.getElementById("clear").addEventListener("click", clearGrid);

// Add solve puzzle event
const solveButton = document.getElementById("solve");
solveButton.addEventListener("click", solveGrid);

// To handle if the website is stepping through the solution instead of drawing
let inSolveMode = false;
let currentStep = 0;

// Next and pervious buttons for solve mode
const previousButton = document.getElementById("previous");
previousButton.addEventListener("click", previousBoardState);

const nextButton = document.getElementById("next");
nextButton.addEventListener("click", nextBoardState);

// Export and import buttons
const importButton = document.getElementById("import");
importButton.addEventListener("click", importBoard);

const exportButton = document.getElementById("export");
exportButton.addEventListener("click", exportBoard);

// Track if the solve button is disabled due to lack of solution
let noSolution = false;

// Set color selector size
colorSelector.style.gridTemplateColumns = "repeat(6, auto)";
colorSelector.style.gridTemplateRows = "repeat(2, auto)";

// When the grid size boxes are update, adds or removes tiles as needed
function updateGridSize() {
  let oldWidth = width;
  let oldHeight = height;

  // Make sure the changed values are in acceptable ranges
  const maxSize = 32;
  if (widthBox.value > maxSize) {
    widthBox.value = maxSize;
  } else if (widthBox.value < 1) {
    widthBox.value = 1; 
  }
  if (heightBox.value > maxSize) {
    heightBox.value = maxSize;
  } else if (heightBox.value < 1) {
    heightBox.value = 1; 
  }

  width = Number(widthBox.value);
  height = Number(heightBox.value);

  // Resize grid
  tileContainer.style.gridTemplateColumns = "repeat(" + String(width) + ", auto)";
  tileContainer.style.gridTemplateRows = "repeat(" + String(height) + ", auto)";

  // Add tiles
  if (width * height > oldWidth * oldHeight) {
    for (let i = 0; i < (width * height - oldWidth * oldHeight); i++) {
      const tile = document.createElement("canvas");
      tile.width = 40;
      tile.height = 40;
      tile.classList.add("tile", "c0");
      tile.addEventListener("mousedown", cChange);
      tile.addEventListener("mouseenter", mouseEnterTile)
      drawGlyphByNum(0, tile);
      tileContainer.appendChild(tile);
    }
  }
  // Remove tiles
  else {
    for (let i = 0; i < (oldWidth * oldHeight - width * height); i++) {
      tileContainer.removeChild(tileContainer.lastElementChild);
    }
  }
}

// Changed the class up or down 1 on user click
// Or use selected color if there is one
function cChange(e) {
  // If the website is in solve mode, don't allow drawing
  if (inSolveMode) {
    return;
  }

  // If the solve button is disabled, allow it to be pushed again
  if (noSolution) {
    noSolution = false;
    solveButton.textContent = "Solve";
    solveButton.removeAttribute("disabled");
  }

  if (selectedColor !== null) {
    // If selected color is set on current tile, make it blank/toggle it
    if (Number(getCNumber(e.target)) == Number(selectedColor)) {
      e.target.classList.replace("c" + getCNumber(e.target), "c0");
      drawGlyphByNum(0, e.target);
    } else {
      e.target.classList.replace("c" + getCNumber(e.target), "c" + selectedColor);
      drawGlyphByNum(selectedColor, e.target);
    }
    return;
  }

  let cNumber = Number(getCNumber(e.target));
  let newCNumber;

  // If shift is being held go down
  if (e.shiftKey) {
    newCNumber = cNumber - 1;
    if (newCNumber < -1) {
      newCNumber = 10;
    }
  } // Otherwise go up by 1
  else {
    newCNumber = cNumber + 1;
    if (newCNumber > 10) {
      newCNumber = -1;
    }
  }

  e.target.classList.replace("c" + cNumber, "c" + newCNumber);
  drawGlyphByNum(newCNumber, e.target);
}

// Changes the selected color to the clicked color
function cSelect(e) {
  // If the clicked element isn't a color, return
  if (!e.target.classList.contains("tile")) {
    return;
  }

  // Remove selected state from all colors
  let tiles = colorSelector.getElementsByClassName("tile");
  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    tile.classList.toggle("selected", false);
  }

  let targetColor = Number(getCNumber(e.target));

  // If the clicked element is the selected color, unselect it and return
  if (selectedColor === targetColor) {
    selectedColor = null;
    return;
  }
  
  selectedColor = targetColor;

  // Add selected state to the clicked color
  e.target.classList.toggle("selected", true);
  drawGlyphByNum(targetColor, e.target);
}

// Returns the value of the current class
function getCNumber(tile) {
  return tile.className.replace("tile", "").replace("c", "").trim();
}

// If the mouse is down on a tile enter, treat it as a click
function mouseEnterTile(e) {
  if (isMouseDown) {
    cChange(e);
  }
}

// Keeps track of if the mouse is being pressed
function mouseDown(e) {
  isMouseDown = true;
}

// Keeps track of if the mouse is being pressed
function mouseUp(e) {
  isMouseDown = false;
}

// Makes all the tiles white (c0)
function clearGrid(e) {
  // If the website is in solve mode, disable it
  if (inSolveMode) {
    disableSolveMode();
  }

  let tiles = tileContainer.getElementsByClassName("tile");

  // For each tile
  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    // Get the tiles c number
    let cNumber = Number(getCNumber(tile));
    // Replace its c class with c0
    tile.classList.replace("c" + cNumber, "c0");
    drawGlyphByNum(0, tiles[index]);
  }
}

// If the website is in solve mode, disable it
// Otherwise, starts the match3 solve in solve.js
function solveGrid(e) {
  if (inSolveMode) {
    disableSolveMode();
  }
  else {
    startSolve();
  }
}

// Shows the help rules
function showHelpArea(e) {
  helpArea.style.display = "block";
}

// Hides the help area
function hideHelpArea(e) {
  if (e.target.id == "helparea") {
    helpArea.style.display = "none";
  }
}

// Enables solve mode and buttons that interact with it
function enableSolveMode() {
  inSolveMode = true;

  // Reset the current spot in the step through
  currentStep = 0;

  // Disable the ability to change the grid size
  widthBox.disabled = "disabled";
  heightBox.disabled = "disabled";

  // Make the next and previous buttons visible
  previousButton.style.visibility = "visible";
  nextButton.style.visibility = "visible";
  previousButton.style.zIndex = "1";
  nextButton.style.zIndex = "1";

  // Hides the Export and Import buttons
  importButton.style.visibility = "hidden";
  exportButton.style.visibility = "hidden";

  // Enable the next button and disable the previous one
  previousButton.disabled = "disabled";
  nextButton.removeAttribute("disabled");

  // Update board state to highlight next move
  updateBoardState();
}

// Disables solve modes and buttons that interact with it
function disableSolveMode() {
  inSolveMode = false;

  // Remove move highlight
  highlightMove("0px");

  // Enable the ability to change the grid size
  widthBox.removeAttribute("disabled");
  heightBox.removeAttribute("disabled");

  // Make the next and previous buttons hidden
  previousButton.style.visibility = "hidden";
  nextButton.style.visibility = "hidden";
  previousButton.style.zIndex = "0";
  nextButton.style.zIndex = "0";

  // Show the export and import buttons
  importButton.style.visibility = "visible";
  exportButton.style.visibility = "visible";
}

// Handles moving to the next step in the solution
function nextBoardState() {
  // If there isn't a next step, return
  if (currentStep + 1 >= storedBoards.length) {
    return;
  }

  // Disable currently highlighted move
  highlightMove("0px");

  // Increment current step
  currentStep++;

  // Enable the previous button (in case its disabled)
  previousButton.removeAttribute("disabled");
  // Check to see if the next button should be disabled
  if (currentStep + 1 >= storedBoards.length) {
    nextButton.disabled = "disabled";
  }

  // Update to the next board state
  updateBoardState();
}

// Handles moving to the previous step in the solution
function previousBoardState() {
  // If there isn't a previous step, return
  if (currentStep - 1 < 0) {
    return;
  }

  // Disable currently highlighted move
  highlightMove("0px");

  // Decrement current step
  currentStep--;

  // Enable the next button (in case its disabled)
  nextButton.removeAttribute("disabled");
  // Check to see if the previous button should be disabled
  if (currentStep - 1 < 0) {
    previousButton.disabled = "disabled";
  }

  // Update to the next board state
  updateBoardState();
}

// Updates to the next requested step of the solution
function updateBoardState() {
  const tiles = tileContainer.getElementsByClassName("tile");

  // For each tile
  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    // Get the tiles c number
    let cNumber = Number(getCNumber(tile));
    // Replace its c class with the c Number from the stored board state
    let newCNumber = storedBoards[currentStep][Math.floor(index / width)][index % width];
    tile.classList.replace("c" + cNumber, "c" + newCNumber);
    drawGlyphByNum(newCNumber, tile);
  }

  highlightMove("8px");
}

// Changes the currently selected move to the passed highlight
// 8px to highlight, 0px to remove highlight
function highlightMove(radius) {
  // If it isnt the last board state, show the next move to make
  if (movesToSolve.length > currentStep) {
    const tiles = tileContainer.getElementsByClassName("tile");
    
    let nextMove = movesToSolve[currentStep];
    tiles[Number(nextMove[0][0]) * width + Number(nextMove[0][1])].style.borderRadius = radius;
    tiles[Number(nextMove[1][0]) * width + Number(nextMove[1][1])].style.borderRadius = radius;
  }
}

// Copies the board as a json onto the clipboard and to a TextArea.
async function exportBoard(e) {
  let outputJSONString = '{"width":' + width + ',"height":' + height + ',"board":';

  // Get all the tiles
  let tiles = tileContainer.getElementsByClassName("tile");

  // For each row in the grid
  let boardString = "["
  for (let y = 0; y < height; y++) {
    // For each column in the grid
    boardString += "[";
    for (let x = 0; x < width; x++) {
      // Add that tile's c value to the row of tiles
      const tile = tiles[y * width + x];
      // Get the tiles c number
      let cNumber = Number(getCNumber(tile));
      boardString += cNumber += ",";
    }
    boardString = boardString.substring(0, boardString.length - 1) + "], ";
  }
  boardString = boardString.substring(0, boardString.length - 2) + "]";
  outputJSONString += boardString + " }";

  // Copy the string to the clipboard
  await navigator.clipboard.writeText(outputJSONString);

  // Change the export button for a few seconds to show it copied
  exportButton.textContent = "Copied";
  exportButton.disabled = "disabled";
  await sleep(3000)
  exportButton.textContent = "Export";
  exportButton.removeAttribute("disabled");

  // Send to text area too if available (vending machine style)
  let puzval = document.getElementById("puzzlevalue");
  if (puzval !== null) {
    puzval.value = outputJSONString;
  }
}

// Imports a json (string) from the clipboard or TextArea to build the board
async function importBoard(e) {
  // If the website is in solve mode, disable it
  if (inSolveMode) {
    disableSolveMode();
  }
  // Start with a clean slate;
  clearGrid(e);

  let puzTextArea = document.getElementById("puzzlevalue");
  let puzerr = document.getElementById("puzerr");
  let importJSONString = "";

  if (puzerr !== null) {
    puzerr.innerHTML = "";  // New import means no errors, yet!
  }
  // Read JSON from clipboard
  try {
    importJSONString = await navigator.clipboard.readText();
  } catch (error) {
    // I feel like there is something I'm missing because Firefox's documentation makes it look like I can do this
    // but I can't figure it out. Would appreciate help.
    if (puzerr !== null) {
      puzerr.innerHTML = error.name + ": " + error.message + "\nThis browser doesn't support copying from the clipboard.\nChrome and Edge are confirmed to work.";
    } else { // Fallback to alert
      alert("This broswer doesn't support copying from the clipboard.\nChrome and Edge are confirmed to work.");
    }
    // Fallback to trying from TextArea
    if (puzTextArea !== null) {
      importJSONString = puzTextArea.value; // TextArea
    }
  }
  
  // Update all the tiles in the board
  const tiles = tileContainer.getElementsByClassName("tile");
  let importedBoard = [];
  let importedJSON = "";
  let jsonKeys = [];
  let maxMoves = 0;

  if (importJSONString.length < '{"tiles":{}}'.length
      || importJSONString.length < '{"board":[]}') return; // Nothing important to parse.

  try { // Proper error handling of JSON parsing.
    importedJSON = JSON.parse(importJSONString);
  } catch (err) {
    if (puzerr !== null) {
      puzerr.innerHTML = err.name + ": " + err.message;
    } else { // Fallback to alert
      alert(err.name + ": " + err.message);
    }
    importButton.textContent = "Invalid";
    importButton.style.disabled = "disabled";
    await sleep(3000);
    importButton.textContent = "Import";
    importButton.removeAttribute("disabled");
    return;
  }
  jsonKeys = Object.keys(importedJSON);

  // Restore JSON elements; The next 4 are optional fields, default = 8
  if (jsonKeys.includes("rows")) {
    heightBox.value = importedJSON["rows"];
  }
  if (jsonKeys.includes("cols")) {
    widthBox.value = importedJSON["cols"];
  }
  if (jsonKeys.includes("height")) {
    heightBox.value = importedJSON["height"];
  }
  if (jsonKeys.includes("width")) {
    widthBox.value = importedJSON["width"];
  }
  
  // Resize the grid
  updateGridSize();


  if (jsonKeys.includes("board")) {
    importedBoard = importedJSON.board;
    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index];
      // Get the tiles c number
      let cNumber = Number(getCNumber(tile));
      // Replace its c class with the c Number from the stored board state
      let newCNumber = importedBoard[Math.floor(index / width)][index % width];
      tile.classList.replace("c" + cNumber, "c" + newCNumber);
      drawGlyphByNum(newCNumber, tile);
    }
  }
  if (jsonKeys.includes("tiles")) { // Old format
    jsonKeys = Object.keys(importedJSON["tiles"]);
    for (let index = 0; index < jsonKeys.length; index++) {
      let tileIndex = Number(jsonKeys[index]);
      if (tileIndex >= height * width) break; // Too many tiles for matrix, so truncate;
      let tile = tiles[tileIndex];
      // Get the tiles c number
      let cNumber = Number(getCNumber(tile));
      // Restore current tile value
      tile.classList.replace("c" + cNumber, "c" + importedJSON["tiles"][jsonKeys[index]]);
      drawGlyphByNum(importedJSON["tiles"][jsonKeys[index]], tile);
    }
  }

  /* Format for puzzle solves:
   * Each tile swap tuple coord will get assigned a move number starting at 0.
   *
   * Example JSON:
   *   {"width":3, "height":2, "moves":1, "swaps":[[[0,1], [1,1]]], "board": [[2,1,2], [1,2,1]]}
   *                                    Move #0        Move #1
   *   If more than one move: "swaps":[ [[0,1],[1,1]], [[0,1],[1,1]] ]
   *
   * Example JSON from main.py:
   *   {"width":9, "height":6, "moves":10, "swaps":[[[3, 3], [3, 4]], [[3, 4], [3, 5]], [[3, 5], [3, 6]], [[3, 6], [3, 7]], [[3, 7], [3, 8]], [[3, 6], [3, 7]], [[3, 5], [3, 6]], [[3, 4], [3, 5]], [[3, 3], [3, 4]], [[3, 2], [3, 3]]], "board":[[0,0,0,1,2,3,4,2,0],[0,0,0,5,1,2,3,4,0],[0,0,0,3,4,5,1,6,0],[7,7,5,6,3,4,5,1,7],[-1,-1,-1,3,4,5,1,6,2],[-1,-1,-1,5,1,2,3,4,2]]}
   *
   *
   */
  if (jsonKeys.includes("moves")) {
    maxMoves = Number(importedJSON["moves"]);
  }
  if (jsonKeys.includes("swaps")) { // Needs to be last key checked.
    if (maxMoves <= 0) {
      puzerr.innerHTML = "Invalid Puzzle JSON solution format; no moves.";
      // Start with a clean slate;
      clearGrid(e);
      return; // We don't want to enter puzzle solve mode.
    }
    if (maxMoves > importedJSON["swaps"].length) {
      puzerr.innerHTML = "Invalid Puzzle JSON solution format; too many moves.";
      // Start with a clean slate;
      clearGrid(e);
      return; // We don't want to enter puzzle solve mode.
    }

    // Set up for showing solution
    setUpBoard();
    // Import Moves
    for (let i = 0; i < importedJSON["swaps"].length; i++) {
      let csw = importedJSON["swaps"][i];
      // Store up the solved board moves
      executeSolvedMove(csw[0][0], csw[0][1], csw[1][0], csw[1][1]);
    }
    // Add the empty board state to the stored boards
    storedBoards.push(JSON.parse(JSON.stringify(puzzleBoard)));
    // Now that everything is loaded, enter puzzle solve mode
    enableSolveMode();
  }
}

// Sleeps for passed ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get color pallet from CSS
function getCssBg(tileCSS = ".c0") {
  let cssBg = '';

  // Since "styles.css" is external to the "index.html", 
  // document.styleSheets[0].cssRules is only website accessible & not via file:///
  try {
    styleRules = document.styleSheets[0].cssRules;  // use Index = 0 since only 1 stylesheet
    // Since CSS rules can be all over the place, only safe thing to do is iterate.
    for (let yindex = 0; yindex < styleRules.length; yindex++) {
      if (styleRules[yindex].selectorText == tileCSS) {
        cssBg = styleRules[yindex].style.getPropertyValue("background-color");
        if (cssBg.length > 0) {
          cssBg = cssBg.replace("rgb(", "rgba(").replace(")", ", 1.0)");
        }
      }
    }
  } catch (err) {
    console.log(err.name + ": " + err.message);
    return "";
  }
  //console.log(cssBg);
  return cssBg;
}

// Handle single and multiple elements
function drawGlyphList(elemList = document.getElementsByClassName('tile c0'), gcb = drawGlyph0) {
  if (elemList.toString() == "[object HTMLCanvasElement]") {
    // Single element
    gcb(elemList);
  } else if (elemList.toString() == "[object HTMLCollection]") {
    // Multiple elements
    for (let i=0; i < elemList.length; i++) {
      drawGlyphList(elemList[i], gcb);
    }
  }
}

// Return a single element by ID or CSS Class; prefer class.
function domClassOrId(glyphStr = 'tile c0') {
  const domElem = document.getElementById(glyphStr);
  const domElemList = document.getElementsByClassName(glyphStr);

  if (domElem === null || domElemList.length > 0) {
    return domElemList; // Use with drawGlyphList above
  }
  return domElem;
}

// Make it easier to draw a specific glyph or set of glyphs
function drawGlyphByNum(glyphNum = 0, e) {
  // Currently only 12 possible glyphs; other numbers ignored & logged.
  if (e === undefined) {
    e = domClassOrId('tile c' + glyphNum);
  }
  switch (glyphNum) {
  case -1:
    drawGlyphList(e, drawGlyph_1);
    break;
  case 0:
    drawGlyphList(e, drawGlyph0);
    break;
  case 1:
    drawGlyphList(e, drawGlyph1);
    break;
  case 2:
    drawGlyphList(e, drawGlyph2);
    break;
  case 3:
    drawGlyphList(e, drawGlyph3);
    break;
  case 4:
    drawGlyphList(e, drawGlyph4);
    break;
  case 5:
    drawGlyphList(e, drawGlyph5);
    break;
  case 6:
    drawGlyphList(e, drawGlyph6);
    break;
  case 7:
    drawGlyphList(e, drawGlyph7);
    break;
  case 8:
    drawGlyphList(e, drawGlyph8);
    break;
  case 9:
    drawGlyphList(e, drawGlyph9);
    break;
  case 10:
    drawGlyphList(e, drawGlyph10);
    break;
  default: // Error condition
    console.log("Unknown Glyph number: " + String(glyphNum));
  }
}

// blank black glyph
function drawGlyph_1(elem = document.getElementById('tile c-1')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 4);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(0,0,0,1.0)';
  let cssBg = getCssBg(".c-1");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// blank white glyph
function drawGlyph0(elem = document.getElementById('tile c0')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 4);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(255,255,255,1.0)';
  let cssBg = getCssBg(".c0");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// 2 hunting bows against a circle
function drawGlyph1(elem = document.getElementById('tile c1')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 4);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(90,190,245,1.0)';
  let cssBg = getCssBg(".c1");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // Top arc
  context.beginPath();
  context.moveTo(linelen * -1, centerY);
  context.quadraticCurveTo(0, centerY+(curGlyph.height / 4), linelen, centerY);
  context.stroke();
  context.closePath();

  // Bottom arc
  context.beginPath();
  context.moveTo(linelen * -1, (centerY*-1));
  context.quadraticCurveTo(0, centerY+(curGlyph.height / 4), linelen, (centerY*-1));
  context.stroke();
  context.closePath();

  // Small center circle
  context.beginPath();
  context.arc(0, 0, radius/2, 0, 2.0 * Math.PI, false);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Narrow orbit
function drawGlyph2(elem = document.getElementById('tile c2')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 4);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(97,86,129,1.0)';
  let cssBg = getCssBg(".c2");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // Large top arc
  context.beginPath();
  context.moveTo(linelen * -1, centerY+(curGlyph.height / 4)-(radius/2));
  context.quadraticCurveTo(0, centerY*0.75, linelen, centerY+(curGlyph.height / 4)-(radius/2));
  context.stroke();
  context.closePath();

  // Large bottom arc
  context.beginPath();
  context.moveTo(linelen * -1, centerY+(curGlyph.height / 4)+(radius/2));
  context.quadraticCurveTo(0, (centerY*-1)*0.75, linelen, centerY+(curGlyph.height / 4)+(radius/2));
  context.stroke();
  context.closePath();

  // Small left arc
  context.beginPath();
  // Arc length should be slightly reduced, but I don't know the formula
  context.arc(linelen * -1 + context.lineWidth/4, 0, radius/2, 0.5 * Math.PI, 1.5 * Math.PI, false);
  context.stroke();
  context.closePath();

  // Small right arc
  context.beginPath();
  context.arc(linelen - context.lineWidth/4, 0, radius/2, 0.5 * Math.PI, 1.5 * Math.PI, true);
  context.stroke();
  context.closePath();

  // Large left arc
  context.beginPath();
  context.moveTo(centerY+(curGlyph.height / 4)-(radius/2), linelen * -1);
  context.quadraticCurveTo(centerY*0.75, 0, centerY+(curGlyph.height / 4)-(radius/2), linelen);
  context.stroke();
  context.closePath();

  // Large right arc
  context.beginPath();
  context.moveTo(centerY+(curGlyph.height / 4)+(radius/2), linelen * -1);
  context.quadraticCurveTo((centerY*-1)*0.75, 0, centerY+(curGlyph.height / 4)+(radius/2), linelen);
  context.stroke();
  context.closePath();

  // Small top arc
  context.beginPath();
  context.arc(0, linelen * -1 + context.lineWidth/4, radius/2, 0.0 * Math.PI, 1.0 * Math.PI, true);
  context.stroke();
  context.closePath();

  // Small bottom arc
  context.beginPath();
  context.arc(0, linelen * 1 - context.lineWidth/4, radius/2, 0.0 * Math.PI, 1.0 * Math.PI, false);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Opposing Sunsets
function drawGlyph3(elem = document.getElementById('tile c3')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 8);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(217,50,145,1.0)';
  let cssBg = getCssBg(".c3");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);

  // define the arc path
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 1.0 * Math.PI, true);
  context.moveTo(linelen * -1, centerY);
  context.lineTo(linelen, centerY);
  context.moveTo(linelen * -1, centerY+(curGlyph.height / 4));
  context.lineTo(linelen, centerY+(curGlyph.height / 4));
  context.arc(centerX, centerY+(curGlyph.height / 4), radius, 0, 1.0 * Math.PI, false);

  // stroke it
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;
  context.stroke();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Wide orbit
function drawGlyph4(elem = document.getElementById('tile c4')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 4);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(172,56,96,1.0)';
  let cssBg = getCssBg(".c4");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // Large top arc
  context.beginPath();
  context.moveTo(linelen * -1, centerY+(curGlyph.height / 4)-(radius/2));
  context.quadraticCurveTo(0, centerY*1.5, linelen, centerY+(curGlyph.height / 4)-(radius/2));
  context.stroke();
  context.closePath();

  // Large bottom arc
  context.beginPath();
  context.moveTo(linelen * -1, centerY+(curGlyph.height / 4)+(radius/2));
  context.quadraticCurveTo(0, (centerY*-1)*1.5, linelen, centerY+(curGlyph.height / 4)+(radius/2));
  context.stroke();
  context.closePath();

  // Small left arc
  context.beginPath();
  // Arc length should be slightly reduced, but I don't know the formula
  context.arc(linelen * -1 + context.lineWidth/4, 0, radius/2, 0.5 * Math.PI, 1.5 * Math.PI, false);
  context.stroke();
  context.closePath();

  // Small right arc
  context.beginPath();
  context.arc(linelen - context.lineWidth/4, 0, radius/2, 0.5 * Math.PI, 1.5 * Math.PI, true);
  context.stroke();
  context.closePath();

  // Large left arc
  context.beginPath();
  context.moveTo(centerY+(curGlyph.height / 4)-(radius/2), linelen * -1);
  context.quadraticCurveTo(centerY*1.5, 0, centerY+(curGlyph.height / 4)-(radius/2), linelen);
  context.stroke();
  context.closePath();

  // Large right arc
  context.beginPath();
  context.moveTo(centerY+(curGlyph.height / 4)+(radius/2), linelen * -1);
  context.quadraticCurveTo((centerY*-1)*1.5, 0, centerY+(curGlyph.height / 4)+(radius/2), linelen);
  context.stroke();
  context.closePath();

  // Small top arc
  context.beginPath();
  context.arc(0, linelen * -1 + context.lineWidth/4, radius/2, 0.0 * Math.PI, 1.0 * Math.PI, true);
  context.stroke();
  context.closePath();

  // Small bottom arc
  context.beginPath();
  context.arc(0, linelen * 1 - context.lineWidth/4, radius/2, 0.0 * Math.PI, 1.0 * Math.PI, false);
  context.stroke();
  context.closePath();

  context.beginPath();
  context.arc(centerX, 0, radius/2, 0, 2.0 * Math.PI, false);
  context.arc(centerX, 0, radius/4, 0, 2.0 * Math.PI, false);
  context.arc(centerX, 0, radius/8, 0, 2.0 * Math.PI, false);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Symbol for Poseidon (modified)
function drawGlyph5(elem = document.getElementById('tile c5')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 8);
  const radius = (curGlyph.height / 4);
  const linelen = 2.5 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(230,150,184,1.0)';
  let cssBg = getCssBg(".c5");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // define the arc path
  context.beginPath();
  context.arc(centerX, centerY*-1+(curGlyph.height / 4), radius, 0, 1.0 * Math.PI, true);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(linelen * -1, 0);
  context.lineTo(linelen, 0);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(centerX, centerY-(curGlyph.height / 4)+radius);
  context.lineTo(centerX, centerY*-1+(curGlyph.height / 4)-radius);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.arc(centerX, centerY-(curGlyph.height / 4), radius, 0, 1.0 * Math.PI, false);

  // stroke it
  context.stroke();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Symbol for Pluto
function drawGlyph6(elem = document.getElementById('tile c6')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 8);
  const radius = (curGlyph.height / 4);
  const linelen = 2.5 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(230,187,150,1.0)';
  let cssBg = getCssBg(".c6");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // define the arc path
  context.beginPath();
  context.arc(centerX, 0-radius, radius/2, 0, 2.0 * Math.PI, false);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.arc(centerX, 0-radius, radius, 0, 1.0 * Math.PI, false);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(radius/2 * -1, (centerY+(curGlyph.height / 4)+radius)/2);
  context.lineTo(radius/2, (centerY+(curGlyph.height / 4)+radius)/2);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(centerX, 0);
  context.lineTo(centerX, centerY+(curGlyph.height / 4)+radius);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Bow tie (Modified) aka Butterfly
function drawGlyph7(elem = document.getElementById('tile c7')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = 0;
  const radius = (curGlyph.height / 4);
  const linelen = 2.5 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(168,198,29,1.0)';
  let cssBg = getCssBg(".c7");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // define the glyph path(s)
  context.beginPath();
  context.moveTo(linelen * -1, -1 * linelen);
  context.lineTo(linelen, linelen);
  context.lineTo(linelen, -1 * linelen);
  context.lineTo(linelen * -1, linelen);
  context.lineTo(linelen * -1, -1 * linelen);
  context.lineTo(linelen, linelen);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(-1 * (curGlyph.width/8), -1 * radius - context.lineWidth/2);
  context.lineTo(0, -1 * (curGlyph.height/8)*1.25);
  context.lineTo((curGlyph.width/8), -1 * radius - context.lineWidth/2);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(-1 * (curGlyph.width/8), radius + context.lineWidth/2);
  context.lineTo(0, (curGlyph.height/8)*1.25);
  context.lineTo((curGlyph.width/8), radius + context.lineWidth/2);
  context.stroke();
  context.closePath();
  context.beginPath(); // It is easier to overwrite white lines
  context.fillStyle = glyphBackground;
  context.strokeStyle = glyphBackground;
  context.arc(centerX, centerY, radius/4, 0, 2.0 * Math.PI, false);
  context.arc(centerX, centerY, radius/8, 0, 2.0 * Math.PI, false);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.strokeStyle = glyphForeground;
  context.arc(centerX, centerY, radius/2, 0, 2.0 * Math.PI, false);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Japanese Torii Gate (Simplified)
function drawGlyph8(elem = document.getElementById('tile c8')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 8);
  const radius = (curGlyph.height / 4);
  const linelen1 = 3.0 * (curGlyph.height / 8);
  const linelen2 = 2.5 * (curGlyph.height / 8);
  const linelen3 = 1.6 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(132,224,146,1.0)';
  let cssBg = getCssBg(".c8");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // define the glyph path(s)
  context.beginPath();
  context.moveTo(linelen1 * -1, -1 * (centerY+(curGlyph.height / 4)+radius));
  context.lineTo(linelen1, -1 * (centerY+(curGlyph.height / 4)+radius));
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(linelen2 * -1, -1 * (centerY+(curGlyph.height / 4)+radius)/2);
  context.lineTo(linelen2, -1 * (centerY+(curGlyph.height / 4)+radius)/2);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(linelen3 * -1, -1 * (centerY+(curGlyph.height / 4)+radius));
  context.lineTo(linelen3 * -1, centerY+(curGlyph.height / 4)+radius);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.moveTo(linelen3, -1 * (centerY+(curGlyph.height / 4)+radius));
  context.lineTo(linelen3, centerY+(curGlyph.height / 4)+radius);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// triangle green glyph (unused?)
function drawGlyph9(elem = document.getElementById('tile c9')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 4);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(0,255,0,1.0)';
  let cssBg = getCssBg(".c9");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // define the glyph path(s)
  context.beginPath();
  context.moveTo(0, -1 * linelen);
  context.lineTo(linelen * -1, linelen);
  context.lineTo(linelen, linelen);
  context.lineTo(0, -1 * linelen);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.strokeStyle = glyphForeground;
  context.arc(centerX, linelen/2-radius/3, radius/2, 0, 2.0 * Math.PI, false);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// chevron magenta glyph (unused?)
function drawGlyph10(elem = document.getElementById('tile c10')) {
  if (elem === undefined || elem === null) return;
  var curGlyph = elem; // 1 specific tile
  var context = curGlyph.getContext('2d');

  const centerX = 0;
  const centerY = -1 * (curGlyph.height / 4);
  const radius = (curGlyph.height / 6);
  const linelen = 3 * (curGlyph.height / 8);
  const lineWidth = (curGlyph.height / 16);
  const glyphForeground = 'rgba(255,255,255,1.0)';
  let glyphBackground = 'rgba(255,0,255,1.0)';
  let cssBg = getCssBg(".c10");

  if (cssBg.length > 0) glyphBackground = cssBg;

  context.clearRect(0, 0, window.innerWidth,window.innerHeight);

  context.fillStyle = glyphBackground;
  context.fillRect(0,0,window.innerWidth,window.innerHeight);

  context.save();
  context.translate(curGlyph.width / 2, curGlyph.height / 2);

  context.scale(1.0, 1.0);
  context.lineWidth = lineWidth;
  context.strokeStyle = glyphForeground;

  // define the glyph path(s)
  context.beginPath();
  context.moveTo(0, -1 * linelen);
  context.lineTo(linelen * -1, 0);
  context.lineTo(linelen * -1, linelen);
  context.lineTo(0, 0);
  context.lineTo(linelen, linelen);
  context.lineTo(linelen, 0);
  context.lineTo(0, -1 * linelen);
  context.stroke();
  context.closePath();
  context.beginPath();
  context.strokeStyle = glyphForeground;
  context.arc(centerX, linelen/-2 + radius/4, radius/2, 0, 2.0 * Math.PI, false);
  context.stroke();
  context.closePath();

  // make alpha solid (the color doesn't matter)
  context.fillStyle = 'rgba(255,255,255,0.0)';

  // change composite mode and fill
  context.globalCompositeOperation = 'destination-out';
  context.fill();
  context.restore();

  // reset composite mode to default
}

// Populate the color selector with glyphs too:
drawGlyphByNum(-1);
drawGlyphByNum(0);
drawGlyphByNum(1);
drawGlyphByNum(2);
drawGlyphByNum(3);
drawGlyphByNum(4);
drawGlyphByNum(5);
drawGlyphByNum(6);
drawGlyphByNum(7);
drawGlyphByNum(8);
drawGlyphByNum(9);
drawGlyphByNum(10);


