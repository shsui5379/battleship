//colors
const BLUE = "#2196F3";
const GREY = "#9E9E9E";
const RED = "#F44336";

const A = 65; //capital letter ASCII offset

const SHIPS = [{name: "aircraft carrier", length: 5}, {name: "battleship", length: 4}, {name: "destroyer", length: 3}, {name: "submarine", length: 3}, {name: "patrol boat", length: 2}]; //ships and number of spaces

function initialize(turnDeterminator) {
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

    //states
    humanTurn = true;
    shipSetup = true;
    roundOver = false;
    shipToMove = undefined;
    logStr = "";

    //create grid
    grid(10, 10, humanGrid, humanGridEl, true, turnDeterminator);
    grid(10, 10, computerGrid, computerGridEl, false, turnDeterminator);

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
Space.prototype.select = function(turnDeterminator, event) { //handles a space being selected
    if (!roundOver) {
        if (shipSetup) { 
            if (this.isOnHumanGrid && this.ship != undefined) { //selecting a ship to move
                shipToMove = this.ship;
                refresh(this.gridArr, this.isOnHumanGrid);
            }
        } else if (((this.isOnHumanGrid && event == undefined) || (!this.isOnHumanGrid && humanTurn)) && !this.hasBeenGuessed) { //torpedo opponent's grid
            this.hasBeenGuessed = true;
            refresh(this.gridArr, this.isOnHumanGrid);
            log("test");
        }
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
function addSpace(x, y, isOnHumanGrid, grid, callback, gridArr) { //creates a space on the board
    var tmpEl = document.createElement("span");
    var tmpObj = new Space(x, y, isOnHumanGrid, tmpEl, gridArr);
    tmpEl.className = "space";
    tmpEl.space = tmpObj;
    tmpEl.addEventListener("click", function() {tmpEl.space.select(callback, event)});
    grid.appendChild(tmpEl);
    return tmpObj;
}
function addRow(label, spaces, grid, isOnHumanGrid, callback, gridArr) { //creates a row number label with spaces space on grid grid
    var rowArr = [];
    labelSpace(label+1, grid);
    for (var i=0; i!=spaces; i++) {
        var tmp = addSpace(i, label, isOnHumanGrid, grid, callback, gridArr);
        rowArr.push(tmp);
    }
    var end = document.createElement("br");
    grid.appendChild(end);
    gridArr.push(rowArr);
}
function grid(row, col, grid, gridEl, isOnHumanGrid, turnDeterminator) { //creates a grid of row rows, col columns
    var tmp;
    headerRow(col, gridEl);
    for (var i=0; i!=row; i++) {
        addRow(i, col, gridEl, isOnHumanGrid, turnDeterminator, grid);
    }
}

//populating computer's grid with ships
function randomPlacement(maxX, maxY) { //generates a random coord for ship head and direction to lay out the ship
    var output = {};
    output.x = randomInteger(0, maxX);
    output.y = randomInteger(0, maxY);
    if (Math.random() > 0.5) {
        output.horizontal = true;
    } else {
        output.horizontal = false;
    }
    if (Math.random() > 0.5) {
        output.positiveDir = true;
    } else {
        output.positiveDir = false;
    }
    return output;
}
function placeRandomShips(board, ships) { //places ships randomly on a board
    for (var ship of ships) {
        var proposal = randomPlacement(board[0].length-1, board.length-1);
        var canPlace = false;
        var multiplier;
        while (!canPlace) { //ensure placement won't overlap another ship or fall off the grid
            var redo = false;
            if (proposal.positiveDir) {
                multiplier = 1;
            } else {
                multiplier = -1;
            }
            if (proposal.horizontal) {
                for (var i=0; i!=ship.length; i++) {
                    if (!canMove(board, proposal.x+(i*multiplier)-(1*multiplier), proposal.y, true, proposal.positiveDir)) {
                        redo = true;
                    }
                }
            } else {
                for (var i=0; i!=ship.length; i++) {
                    if (!canMove(board, proposal.x, proposal.y+(i*multiplier)-(1*multiplier), false, proposal.positiveDir)) {
                        redo = true;
                    }
                }
            }
            if (redo) {
                proposal = randomPlacement(board[0].length-1, board.length-1);
            } else {
                canPlace = true;
            }
        }
        if (proposal.horizontal) { //writing in the ship
            for (var i=0; i!=ship.length; i++) {
                board[proposal.y][proposal.x+(i*multiplier)].ship = ship.name;
            }
        } else {
            for (var i=0; i!=ship.length; i++) {
                board[proposal.y+(i*multiplier)][proposal.x].ship = ship.name;
            }
        }
    }
}

function canMove(board, initX, initY, horizontal, positiveDir) { //determine if a ship can be placed in the proposed placement
    if (horizontal) {
        if (positiveDir) { //to the right
            if (initX+1 >= board[0].length) {
                return false;
            } else if (board[initY][initX+1].ship != undefined) {
                return false;
            }
        } else { //to the left
            if (!(initX-1>=0)) {
                return false;
            } else if (board[initY][initX-1].ship != undefined) {
                return false;
            }
        }
    } else {
        if (positiveDir) { //down
            if (initY+1 >= board.length) {
                return false;
            } else if (board[initY+1][initX].ship != undefined) {
                return false;
            }
        } else { //up
            if (!(initY-1>=0)) {
                return false;
            } else if (board[initY-1][initX].ship != undefined) {
                return false;
            }
        }
    }
    return true;
}

function presetShip(board, ships) { //preloads ships onto a board for user configuration
    for (var ship in ships) {
        for (var i=0; i!=ships[ship].length; i++) {
            board[ship][i].ship = ships[ship].name;
        }
    }
}

function refresh(board, shipsVisible) { //refreshed the displayed board based on array
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
            if (shipsVisible && shipToMove != undefined && space.ship == shipToMove) {
                space.el.style.borderColor = "#76FF03";
            }
        }
    }
}

function randomInteger(lower, upper) {  //random number generator
    var multiplier = upper - lower + 1;
    var rnd = Math.floor((Math.random() * multiplier) + lower);
    return rnd;
}

function buttonAction() {
    if (shipSetup) {
        shipSetup = false;
        shipToMove = undefined;
        buttonEl.innerHTML = "Reset";
        refresh(humanGrid, true);
    } else {
        if (confirm("Are you sure you want to reset the game?  This cannot be undone.")) {
            shipSetup = true;
            buttonEl.innerHTML = "Start"
        }
    }
}

function log(message) {
    logStr += message + "<br />";
    logEl.innerHTML = logStr;
}