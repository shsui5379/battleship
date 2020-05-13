//colors
const BLUE = "#2196F3";
const GREY = "#9E9E9E";
const RED = "#F44336";

const A = 65; //capital letter ASCII offset

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

    //create grid
    grid(10, 10, humanGrid, humanGridEl, true);
    grid(10, 10, computerGrid, computerGridEl, false);

    placeRandomShips(computerGrid, SHIPS); //populate computer's grid with random ships
    /*for (var array of computerGrid) {
        for (var box of array) {
            if (box.ship != undefined) {
                box.el.style.backgroundColor = GREY;
            }
        }
    }*/
}

//objects
function Space(x, y, isOnHumanGrid, el) { //represents a space on the grid
    this.x = x;
    this.y = y;
    this.isOnHumanGrid = isOnHumanGrid;
    this.el = el;
    this.highlight = false;
    this.hasBeenGuessed = false;
}
Space.prototype.select = function() { //handles a space being selected
    
}

//grid generation on display
function labelSpace(label, grid) { //adds a label block to the grid (ie: 1-10, A-J)
    var tmp = document.createElement("span");
    tmp.className = "space";
    //tmp.style.backgroundColor = BLUE;
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
function addSpace(x, y, isOnHumanGrid, grid) { //creates a space on the board
    var tmpEl = document.createElement("span");
    var tmpObj = new Space(x, y, isOnHumanGrid, tmpEl);
    tmpEl.className = "space";
    //tmpEl.style.backgroundColor = BLUE;
    tmpEl.space = tmpObj;
    tmpEl.addEventListener("click", tmpEl.space.select);
    grid.appendChild(tmpEl);
    return tmpObj;
}
function addRow(label, spaces, grid, isOnHumanGrid) { //creates a row number label with spaces space on grid grid
    var rowArr = [];
    labelSpace(label+1, grid);
    for (var i=0; i!=spaces; i++) {
        var tmp = addSpace(i, label, isOnHumanGrid, grid);
        rowArr.push(tmp);
    }
    var end = document.createElement("br");
    grid.appendChild(end);
    return rowArr;
}
function grid(row, col, grid, gridEl, isOnHumanGrid) { //creates a grid of row rows, col columns
    var tmp;
    headerRow(col, gridEl);
    for (var i=0; i!=row; i++) {
        var tmp = addRow(i, col, gridEl, isOnHumanGrid);
        grid.push(tmp);
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

function randomInteger(lower, upper) {  //random number generator
    var multiplier = upper - lower + 1;
    var rnd = Math.floor((Math.random() * multiplier) + lower);
    return rnd;
}

function buttonAction() {
    
}

function reset() {

}