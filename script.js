//colors
const BLUE = "#2196F3";
const GREY = "#9E9E9E";
const RED = "#F44336";

const A = 65; //capital letter ASCII offset

function initialize() {
    //grids
    humanGrid = [];
    humanGrid.ships = 5;
    computerGrid = [];
    computerGrid.ships = 5;

    //elements
    humanGridEl = document.getElementById("human");
    computerGridEl = document.getElementById("computer");

    //populating grid
    grid(10, 10, humanGrid, humanGridEl, true);
    grid(10, 10, computerGrid, computerGridEl, false);
}

//objects
function Space(x, y, isOnHumanGrid, el) { //represents a space on the grid
    this.x = x;
    this.y = y;
    this.isOnHumanGrid = isOnHumanGrid;
    this.el = el;
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
    labelSpace(label, grid);
    for (var i=0; i!=spaces; i++) {
        var tmp = addSpace(String.fromCharCode(A+i), label, isOnHumanGrid, grid);
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
        var tmp = addRow(i+1, col, gridEl, isOnHumanGrid);
        grid.push(tmp);
    }
}

function buttonAction() {
    
}

function reset() {

}