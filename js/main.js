let arrFields = [], arrLevel = ['easy', 'medium', 'hard', 'insane'],
    level = 0, rows = 9, columns = 9, countdown = 0, clicks = 0, mainInterval,
    debugMode = false, gameOver,
    gameTimer = new Timer('txtTimer');

const BOMBS_PERCENT = 0.15;
const board = document.getElementById('divBoard');
const sldLevel = document.getElementById('inpLevel');
const chkCountdown =  document.getElementById('inpCountdown');
const chkDebug = document.getElementById('inpDebugger');
const btnSettings = document.getElementById('divButtonSettings');
const dropDown = document.getElementById('divDropdown');
const btnNew = document.getElementById('divClock');
const clock = document.getElementById('txtTimer');
const rootCSS = document.querySelector(':root'); 

function setCSSVar(variable = '--fld-size', value) {
    rootCSS.style.setProperty(variable, `${value}px`);
}

init();

function init() {
    gameOver = false;
    clicks = 0;
    btnNew.setAttribute('class', 'timer');
    clock.innerText = '00:00';
    installEventListeners();
    createBoard(rows, columns);
}

btnSettings.addEventListener('click', () => {
    let isOpen = dropDown.classList.contains('slide-in');
    dropDown.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
});

function installEventListeners() {
    document.addEventListener('timeout', ()=>{
        gameOver = true;
        // alert('TIME OUT - GAME OVER !!!')
    })   
    chkCountdown.oninput = function() {
        countdown = parseInt(this.value);
        let value = countdown == 0 ? 'off' : countdown + ' sec';
        document.getElementById('lblCountdown').innerText = value;
    }    
    chkDebug.oninput = function() {
        debugMode = +this.value;
        document.getElementById('lblDebugger').innerText = debugMode ? 'on' : 'off';
        renderBoard();
    }
    sldLevel.oninput = function() {
        // board.style.flex = '1';
        level = parseInt(this.value);
        document.getElementById('lblLevel').innerText = ' ' + arrLevel[level];
        switch (level) {
            case 0:
                rows = 9;
                columns = 9;
                break;
            case 1:
                rows = 16;
                columns = 16;
                break;
            case 2:
                rows = 16;
                columns = 30;
                break;
            case 3:
                rows = 24;
                columns = 30;
                break;
        }
        if (!gameOver) createBoard(rows, columns);
    } 

    mainInterval = setInterval(() => {
        if (gameOver) {
            mainInterval = clearInterval(mainInterval);
            gameTimer.stop();
            revealBoard();
            renderBoard(false);           
            clock.innerText = 'New game';
            btnNew.setAttribute('class', 'timer btn-style');
            btnNew.addEventListener('click', init, {once : true});
        }
    }, 333);
}

function createBoard(rows, cols) {
    arrFields = [];
    const fldSize = getFieldSize(rows); 
    setCSSVar('--fld-size',fldSize);   
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            arrFields.push({
                // top: Math.round((x % rows) * fldSize),
                // left: Math.round((y % cols) * fldSize),
                index: x * rows + y,
                border: {
                        top: x % rows == 0,
                        left: y == 0, 
                        right: (y+1)% cols == 0,
                        bottom: (x+1)% rows == 0
                      },
                // isBorder: (x % size == 0 || y == 0 || (y+1)% size == 0 || (x+1)% size == 0),
                revealed: false,
                hasBomb: false,
                exploded: false,
                neighbours: 0,
                hasFlag: false,
            }); 
        }     
    }        
    setBombs();
    renderBoard();
}

function renderBoard(withEvents = true) {
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    board.innerHTML = '';
    for (let i = 0; i < arrFields.length; i++) {
        const currFld = arrFields[i], id = `fld-${i}`;
        board.innerHTML += `<div id="${id}" class="field" data-index="${i}"> </div>`;      
        drawField(id, currFld, fieldSize); // set the field's position in board
    }
    if (withEvents) setEventListeners();
}

/**
 * helper function for 'renderBoard'
 * @param {object} fldHTML the HTML field
 * @param {object} fld object from array 'arrFields'
 * @param {number} size lenght of a field in the parent container
 */
 function drawField(id, fld, size) {
    const fldHTML = document.getElementById(id);
    // fldHTML.style.top = fld.top + 'px';
    // fldHTML.style.left = fld.left + 'px';
    // fldHTML.style.height = size + 'px';
    // fldHTML.style.width = size + 'px';
    if (fld.revealed) {
        fldHTML.classList.add('revealed');
        if (fld.neighbours) fldHTML.classList.add(`field${fld.neighbours}`);
        if (fld.exploded) {
            fldHTML.classList.add('bang');
            fldHTML.style.filter = 'hue-rotate(270deg)';
        }
        if (fld.hasBomb && !fld.exploded && gameOver) fldHTML.classList.add('mine');
    }
    if (fld.hasFlag) fldHTML.classList.add('flag');
    if (debugMode && fld.hasBomb)  fldHTML.classList.add('debugging');
}

/**
 * adds a click-Event to each created field
 * using the data-attribute "index" as parameter
 */
function setEventListeners() {
    const fields = Array.from(document.getElementsByClassName('field'));
    fields.forEach(fld => {
        const index = parseInt(fld.dataset.index);
        if (!arrFields[index].revealed) {
            fld.addEventListener('click', () => {
                fieldClicked(index);
            }, {once : true});
            // same for right click!
            fld.addEventListener('contextmenu', function(evt) {
                evt.preventDefault();
                arrFields[index].hasFlag = !arrFields[index].hasFlag;
                renderBoard();                            
            });
        }
    });
}

function getFieldSize(rows) {
    return board.clientHeight / rows;
}

/**
 * click event handler of fields
 * @param {number} index the given index of the clicked field
 */
function fieldClicked(index) {
    revealField(index);
    clicks++;
    if (clicks == 1) {
        gameTimer.start();
        dropDown.setAttribute('class', 'slide-out');
    } 
    if(countdown) gameTimer.countDown(countdown);
    gameOver = arrFields[index].hasBomb;
    arrFields[index].exploded = gameOver;
    if (gameOver) playSound('../sounds/explosion.mp3');
    renderBoard();
}

function revealField(index) {
    arrFields[index].revealed = true;
    if (arrFields[index].neighbours || arrFields[index].hasBomb) return;
    let arrNeighbours = getNeighbours(index, columns);
    if (debugMode) console.log('Field ['+index +'] neighbours:', arrNeighbours)
    for (let i = 0; i < arrNeighbours.length; i++) {
        const fld = arrNeighbours[i];
        if (!arrFields[fld].revealed && !arrFields[fld].hasBomb) revealField(fld);
    }
}

function revealBoard() {
    for (let i = 0; i < arrFields.length; i++) {
        arrFields[i].revealed = true;
    }
}

function setBombs() {
    let z = 0, bombs = parseInt(rows*columns*BOMBS_PERCENT);
    do {
        const fldNr = parseInt(Math.random() * arrFields.length);
        if (arrFields[fldNr].hasBomb == false) {
            arrFields[fldNr].hasBomb = true;
            z++;
        }
    } while (z < bombs);
    countNeighbours(columns);
}

/**
 * counts the neighbours of a bomb field
 * @param {number} rows size of the board
 */
function countNeighbours(rowSize) {    
    let arrNeighbours;
    for (let i = 0; i < arrFields.length; i++) {        
        if (arrFields[i].hasBomb) {
            arrNeighbours = getNeighbours(i, rowSize);
            for (let j = 0; j < arrNeighbours.length; j++) {
                const fInd = arrNeighbours[j];
                arrFields[fInd].neighbours++;
            }
        }
    }
}

/**
 * determines all neighbours of a given field (index)
 * @param {number} fld index of the field
 * @param {number} size board size (level)
 * @returns array of valid neighbour fields (indexes)
 */
function getNeighbours(fld, size) {
    let arr = [];
    arr.push(fld-size-1, fld-size, fld-size+1, fld-1, fld+1, fld+size-1, fld+size, fld+size+1);
    arr = arr.filter(ind => ind >= 0 && ind < arrFields.length); // filter out top & bottom border...
    // filter out opposite borders:
    // (left field can't be a neighbour of a right field!)
    for (let i = 0; i < arr.length; i++) {
        const ind = arr[i];
        if (arrFields[fld].border.left && arrFields[ind].border.right) arr.splice(i,1); 
        if (arrFields[fld].border.right && arrFields[ind].border.left) arr.splice(i,1);      
    }
    return arr;
}

function playSound(file) {
    let sound = new Audio(file);
    sound.play();
}