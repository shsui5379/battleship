//colors
const BLUE = "#2196F3";
const GREY = "#9E9E9E";
const RED = "#F44336";

const A = 65; //capital letter ASCII offset

//key which
const UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;
const CW = 50, CCW = 49;

const SHIPS = [{name: "aircraft carrier", length: 5}, {name: "battleship", length: 4}, {name: "destroyer", length: 3}, {name: "submarine", length: 3}, {name: "patrol boat", length: 2}]; //ships and number of spaces

function initialize() {
    //grids
    humanGrid = [];
    humanGrid.ships = 5;
    computerGrid = [];
    computerGrid.ships = 5;

    //elements
    humanGridEl = document.getElementById("human");
    computerGridEl = document.getElementById("computer");
    logEl = document.getElementById("logBox");
    buttonEl = document.getElementById("btn");
    humanLabelEl = document.getElementById("humanLabel");
    computerLabelEl = document.getElementById("computerLabel");

    //states
    humanTurn = true;
    shipSetup = true;
    roundOver = false;
    shipToMove = undefined;
    logStr = "";
    interval = undefined;
    computerScratchpad = undefined;

    //create grid
    grid(10, 10, humanGrid, humanGridEl, true);
    grid(10, 10, computerGrid, computerGridEl, false);

    //populate grids
    placeRandomShips(computerGrid, SHIPS);
    presetShip(humanGrid, SHIPS);

    //display
    refresh(humanGrid, true);
    refresh(computerGrid, false);
}

//objects
function Space(x, y, isOnHumanGrid, el, gridArr) { //represents a space on the grid
    this.x = x;
    this.y = y;
    this.isOnHumanGrid = isOnHumanGrid;
    this.el = el;
    this.hasBeenGuessed = false;
    this.gridArr = gridArr;
}
Space.prototype.select = function(event) { //handles a space being selected
    if (!roundOver) {
        if (shipSetup) { 
            if (this.isOnHumanGrid && this.ship != undefined) { //selecting a ship to move
                shipToMove = this.ship;
                refresh(this.gridArr, this.isOnHumanGrid);
            }
        } else if (((this.isOnHumanGrid && event == undefined) || (!this.isOnHumanGrid && humanTurn)) && !this.hasBeenGuessed) { //torpedo opponent's grid
            this.hasBeenGuessed = true;
            refresh(this.gridArr, this.isOnHumanGrid);
            var sunkShip = false;
            if (this.ship != undefined) { //detecting for sunken ship
                if (shipSunk(this.gridArr, this.ship)) {
                    this.gridArr.ships--;
                    sunkShip = true;
                }
            }
            log(messageGenerator(this, humanTurn, sunkShip));
            if (humanGrid.ships == 0 || computerGrid.ships == 0) { //detecting if a player lost
                roundOver = true;
                if (humanTurn) {
                    var loser = "the computer's";
                    var winner = "You";
                } else {
                    var loser = "your";
                    var winner = "The computer";
                }
                log(winner + " sunk all of " + loser + " ships.");
            } else if (turnDeterminator(this)) { //determine who goes next
                humanTurn = true;
                computerLabelEl.style.color = "#FF6E40";
                humanLabelEl.style.color = "initial";
                if (interval != undefined) { //end computer turn
                    clearInterval(interval);
                    interval = undefined;
                }
            } else {
                humanTurn = false;
                computerLabelEl.style.color = "initial";
                humanLabelEl.style.color = "#FF6E40";
                if (interval == undefined) { //start computer turn
                    interval = setInterval(computerTurn, 1000);
                }
            }
        }
    } else if (interval != undefined) {
        clearInterval(interval);
        interval = undefined;
    }
}

function computerTurn() { //computer picking a space to torpedo
    var pre = humanGrid.ships;
    if (computerScratchpad == undefined) { //random
        var x = randomInteger(0, humanGrid[0].length-1);
        var y = randomInteger(0, humanGrid.length-1);
        if (!humanGrid[y][x].hasBeenGuessed) {
            humanGrid[y][x].select();
        } else {
            return computerTurn();
        }
    } else { //make intelligent guesses if the last torpedo hit something

    }
}

//grid generation on display
function labelSpace(label, grid) { //adds a label block to the grid (ie: 1-10, A-J)
    var tmp = document.createElement("span");
    tmp.className = "space";
    tmp.innerHTML = label;
    grid.appendChild(tmp);
}
function headerRow(spaces, grid) { //creates column labels: A-J
    labelSpace("", grid);
    for (var i=0; i!=spaces; i++) {
        labelSpace(String.fromCharCode(A+i), grid);
    }
    var end = document.createElement("br");
    grid.appendChild(end);
}
function addSpace(x, y, isOnHumanGrid, grid, gridArr) { //creates a space on the board
    var tmpEl = document.createElement("span");
    var tmpObj = new Space(x, y, isOnHumanGrid, tmpEl, gridArr);
    tmpEl.className = "space";
    tmpEl.space = tmpObj;
    tmpEl.addEventListener("click", function() {tmpEl.space.select(event)});
    grid.appendChild(tmpEl);
    return tmpObj;
}
function addRow(label, spaces, grid, isOnHumanGrid, gridArr) { //creates a row number label with spaces space on grid grid
    var rowArr = [];
    labelSpace(label+1, grid);
    for (var i=0; i!=spaces; i++) {
        var tmp = addSpace(i, label, isOnHumanGrid, grid, gridArr);
        rowArr.push(tmp);
    }
    var end = document.createElement("br");
    grid.appendChild(end);
    gridArr.push(rowArr);
}
function grid(row, col, grid, gridEl, isOnHumanGrid) { //creates a grid of row rows, col columns
    var tmp;
    headerRow(col, gridEl);
    for (var i=0; i!=row; i++) {
        addRow(i, col, gridEl, isOnHumanGrid, grid);
    }
}
function presetShip(board, ships) { //preloads ships onto a board for user configuration
    for (var ship in ships) {
        for (var i=0; i!=ships[ship].length; i++) {
            board[ship][i].ship = ships[ship].name;
        }
    }
}
function refresh(board, shipsVisible) { //refresh the displayed board based on array
    for (var row of board) {
        for (var space of row) {
            if (shipsVisible) {
                switch(space.ship) { //ship border colors
                    case "aircraft carrier":
                        space.el.style.borderColor = "#F44336";
                        break;
                    case "battleship":
                        space.el.style.borderColor = "#9C27B0";
                        break;
                    case "destroyer":
                        space.el.style.borderColor = "#8BC34A";
                        break;
                    case "submarine":
                        space.el.style.borderColor = "#FF9800";
                        break;
                    case "patrol boat":
                        space.el.style.borderColor = "#795548";
                        break;
                    default:
                        space.el.style.borderColor = "black";
                        break;
                }    
            }
            switch (true) { //filling space colors
                case !space.hasBeenGuessed && space.ship != undefined && shipsVisible:
                    space.el.style.backgroundColor = GREY;
                    break;
                case space.ship != undefined && space.hasBeenGuessed:
                    space.el.style.backgroundColor = RED;
                    break;
                case space.hasBeenGuessed && space.ship == undefined:
                    space.el.style.backgroundColor = "white";
                    break;
                default:
                    space.el.style.backgroundColor = BLUE;
                    break;
            }
            if (shipsVisible && shipToMove != undefined && space.ship == shipToMove) { //highlighting ship to move
                space.el.style.borderColor = "#76FF03";
            }
        }
    }
}

//populating computer's grid with ships
function randomPlacement(maxX, maxY) { //generates a random coord for ship head and direction to lay out the ship
    var output = {};
    output.x = randomInteger(0, maxX);
    output.y = randomInteger(0, maxY);
    output.horizontal = (Math.random() > 0.5);
    output.positiveDir = (Math.random() > 0.5);
    return output;
}
function placeRandomShips(board, ships) { //places ships randomly on a board
    for (var ship of ships) {
        var proposal = randomPlacement(board[0].length-1, board.length-1);
        while (!canPlaceShip(board, proposal, ship.length)) { //ensure placement won't overlap another ship or fall off the grid
            proposal = randomPlacement(board[0].length-1, board.length-1);
        }
        placeShip(board, proposal, ship.length, ship.name);
    }
}

//checks to ensure that ships won't overlap or fall off the edge
function canMoveSpace(board, initX, initY, horizontal, positiveDir, ship) { //determine if a ship can be placed in a certain space
    if (horizontal) {
        if (positiveDir) { //to the right
            if (initX+1 >= board[0].length) { //within grid
                return false;
            } else if (board[initY][initX+1].ship != undefined && board[initY][initX+1].ship != ship) { //not overlapping
                return false;
            }
        } else { //to the left
            if (!(initX-1>=0)) {
                return false;
            } else if (board[initY][initX-1].ship != undefined && board[initY][initX-1].ship != ship) {
                return false;
            }
        }
    } else {
        if (positiveDir) { //down
            if (initY+1 >= board.length) {
                return false;
            } else if (board[initY+1][initX].ship != undefined && board[initY+1][initX].ship != ship) {
                return false;
            }
        } else { //up
            if (!(initY-1>=0)) {
                return false;
            } else if (board[initY-1][initX].ship != undefined && board[initY-1][initX].ship != ship) {
                return false;
            }
        }
    }
    return true;
}
function canMoveShip (board, coords, horizontal, posDir, ship) { //returns if the ship can move in the board
    for (var coord of coords) {
        if (!canMoveSpace(board, coord.x, coord.y, horizontal, posDir, ship)) {
            return false;
        }
    }
    return true;
}
function canPlaceShip(board, proposal, length, ship) { //determines if a proposed ship can be placed on the board
    if (proposal.positiveDir) {
        var multiplier = 1;
    } else {
        var multiplier = -1;
    }
    if (proposal.horizontal) {
        for (var i=0; i!=length; i++) {
            if (!canMoveSpace(board, proposal.x+(i*multiplier)-(1*multiplier), proposal.y, true, proposal.positiveDir, ship)) {
                return false;
            }
        }
    } else {
        for (var i=0; i!=length; i++) {
            if (!canMoveSpace(board, proposal.x, proposal.y+(i*multiplier)-(1*multiplier), false, proposal.positiveDir, ship)) {
                return false;
            }
        }
    }
    return true;
}

//allowing a player to configure where to place ships
function translateShip(board, coords, horizontal, posDir, ship) { //translates a ship
    if (posDir) {
        var multiplier = 1;
    } else {
        var multiplier = -1;
    }
    if (posDir) { //ensure that a ship keeps its length
        coords.reverse();
    }
    for (var coord of coords) {
        board[coord.y][coord.x].ship = undefined; //remove old
        if (horizontal) { //add new
            board[coord.y][coord.x+(1*multiplier)].ship = ship;
        } else {
            board[coord.y+(1*multiplier)][coord.x].ship = ship;
        }
    }
}
function move(board, event) { //handles events for moving ships
    if (shipSetup && shipToMove != undefined) {
        if (event.which >= 37 && event.which <= 40) { //arrow keys for moving ship
            var horizontal = (event.which == LEFT || event.which == RIGHT);
            var posDir = (event.which == DOWN || event.which == RIGHT);
            var coords = getShipCoords(board, shipToMove);
            if (canMoveShip(board, coords, horizontal, posDir, shipToMove)) { //move ship if movable
                translateShip(board, coords, horizontal, posDir, shipToMove);
                refresh(board, true);
            }
        } else if (event.which == CW || event.which == CCW) { //rotations
            var coords = getShipCoords(board, shipToMove);
            var summary = getSummary(coords);
            summary.horizontal = !summary.horizontal;
            if ((event.which == CCW && !summary.horizontal) || (event.which == CW && summary.horizontal)) {
                summary.positiveDir = !summary.positiveDir;
            }
            if (canPlaceShip(board, summary, coords.length, shipToMove)) { //rotate ship of rotatable
                for (var coord of coords) { //delete old ship
                    board[coord.y][coord.x].ship = undefined;
                }
                placeShip(board, summary, coords.length, shipToMove);
                refresh(board, true);
            }
        }
    }
}
function placeShip(board, proposal, length, ship) { //adds the propsed ship to the board
    if (proposal.positiveDir) {
        var multiplier = 1;
    } else {
        var multiplier = -1;
    }
    if (proposal.horizontal) {
        for (var i=0; i!=length; i++) {
            board[proposal.y][proposal.x+(i*multiplier)].ship = ship;
        }
    } else {
        for (var i=0; i!=length; i++) {
            board[proposal.y+(i*multiplier)][proposal.x].ship = ship;
        }
    }
}

function getShipCoords(board, ship) { //returns a list of coords of the given ship on the board
    var output = [];
    for (var row of board) {
        for (var space of row) {
            if (space.ship == ship) {
                var tmp = {};
                tmp.x = space.x;
                tmp.y = space.y;
                output.push(tmp);
            }
        }
    }
    return output;
}
function getSummary(coords) { //summarizes the ship's head coord and direction of layout
    var output = {};
    output.x = coords[0].x;
    output.y = coords[0].y;
    output.horizontal = (coords[0].y == coords[1].y);
    output.positiveDir = ((output.horizontal && coords[0].x < coords[1].x) || (!output.horizontal && coords[0].y < coords[1].y));
    return output;
}

function shipSunk(board, ship) { //returns whether or not all of that ship's spaces has been torpedoed
    var coords = getShipCoords(board, ship);
    for (var coord of coords) {
        if (!board[coord.y][coord.x].hasBeenGuessed) {
            return false;
        }
    }
    return true;
}

function messageGenerator(space, human, sunk) { //returns a string that summarizes what happened that turn
    var output = "";
    if (human) {
        output += "You ";
    } else {
        output += "The computer ";
    }
    output += "torpedoed " + String.fromCharCode(A+space.x) + parseInt(space.y+1);
    if (space.ship != undefined) {
        output += " and hit the "
        if (human) {
            output += "computer's ";
        } else {
            output += "your ";
        }
        output += space.ship;
        if (sunk) {
            output += " and it sunk";
        }
    } else {
        output += " and hit nothing";
    }
    output += ".";
    return output;
}

function randomInteger(lower, upper) {  //random number generator
    var multiplier = upper - lower + 1;
    var rnd = Math.floor((Math.random() * multiplier) + lower);
    return rnd;
}

function buttonAction() {
    humanTurn = true;
    humanLabelEl.style.color = "initial";
    computerLabelEl.style.color = "#FF6E40";
    shipToMove = undefined;
    roundOver = false;
    if (shipSetup) { //for starting round
        shipSetup = false;
        buttonEl.innerHTML = "Reset";
    } else {
        if (confirm("Are you sure you want to reset the game?  This cannot be undone.")) { //for starting a new game
            shipSetup = true;
            buttonEl.innerHTML = "Start"
        }
    }
    refresh(humanGrid, true);
    refresh(computerGrid, false);
}

function log(message) {
    logStr = message + "<br /><br />" + logStr;
    logEl.innerHTML = logStr;
}