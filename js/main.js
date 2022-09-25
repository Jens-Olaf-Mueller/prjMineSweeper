
const BOARD = new Board(rows, columns,'divBoardTable');

init();

/**
 * Start function of the game
 */
function init() {   
    loadSettings(APP_NAME); 
    gameOver = false;
    gameWon = false;
    clicks = 0;
    gameTimer.showHours = false;
    btnNew.setAttribute('class', 'timer');
    BOARD.create(rows, columns);
    txtFlags.innerText = BOARD.flagsRemaining;
    txtClicks.innerText = 0; 
    clock.innerText = '00:00';     
    mainInterval = watchGameStatus();
}


/**
 * Observes the game status and timers.
 * Changes the Display of the clock after game is over to NEW GAME
 * @returns ID of the Interval that watches the game status 3 times a second
 */
function watchGameStatus() {
    return setInterval(() => {
        gameWon = (BOARD.size - BOARD.fieldsRevealed == BOARD.bombs);
        if (gameOver || gameWon) {
            mainInterval = clearInterval(mainInterval);
            gameTimer.stop();
            gameTimer.countDown('stop');
            BOARD.reveal();     
            clock.innerText = 'New game';            
            showIntroScreen(true);            
            btnNew.setAttribute('class', 'timer btn-style');
            btnNew.addEventListener('click', init, {once : true});
        }
    }, 250); // 4 times per second should be enough
}
 

/**
 * Plays the given audio file.
 * @param {object} file audio object
 */
function playSound(file) {
    if (soundEnabled) file.play();
}


/**
 * Displays or hides the intro / outro-screen
 * @param {boolean} status determines if intro screen is displayed or not
 */
function showIntroScreen(status) {
    const CSS_IMAGE = gameWon ? `url('../img/WIN-G.OVER/You_win_1.png')` : `url('../img/WIN-G.OVER/GAME_OVER.png'`;
    let delay = gameWon ? 400 : 1800;
    setCSSVar('--intro-screen', CSS_IMAGE);

    if (status == true) {
        setTimeout(() => {
            introScreen.classList.remove('hidden');
            playSound(gameWon ? SND_WINNER : SND_GAMEOVER);
        }, delay)
        return;
    } 
    introScreen.classList.add('hidden');    
}

/**
 * Helper function to change CSS variables
 * @param {string} variable CSS-Variable name
 * @param {string} value CSS variable's value
 * @param {string} unit (i.e. px, rem, %...)
 */
function setCSSVar(variable, value, unit = '') {
    document.querySelector(':root').style.setProperty(variable, `${value}${unit}`);
}

/**
 * Listener for a field to be clicked (right and left click)
 */
document.addEventListener('fieldclick', function() {
    handleClicks('left');
})
document.addEventListener('rightclick', function() {
    handleClicks('right');
});
document.addEventListener('edit', () => {    
    SND_FLAGOFF.currentTime = 0;
    SND_FLAGOFF.play();
    txtFlags.innerText = BOARD.flagsRemaining;
    BOARD.refresh();
});

/**
 * Helperfunction for event listeners 'fieldclick' & 'rightclick'
 * @param {string} button left or right button
 */
function handleClicks(button) {
    clicks++;
    txtClicks.innerText = clicks;
    if (clicks == 1) {        
        swipe.setAttribute('class', 'slide-out');
        changeArrowDirection(true);
        if(!countdown) {
            // TODO: settings erweitern mit Zeitlimit - dann gameTimer.setAlert(setting)
            gameTimer.start();
        }
    } 
    if (countdown) gameTimer.countDown(countdown); 
    if (button == 'right') txtFlags.innerText = BOARD.flagsRemaining;
}

window.addEventListener('resize', () => {
    BOARD.refresh();
});

/**
 * Listeners for timeout (play with countdown) or 
 * time-expired (not installed yet) for play with time limit...
 */
document.addEventListener('timeout', (evt) => { 
    gameOver = true;        
    if (soundEnabled) SND_ALERT.play();
})   
document.addEventListener('timerexpired', (evt) => {        
    gameOver = true;    
})  


/**
 * Slides the settings in and out...
 */
btnSettings.addEventListener('click', () => {
    let isOpen = swipe.classList.contains('slide-in');
    swipe.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
    changeArrowDirection(isOpen);
});


/**
 * Helperfunction to display the setting button's arrow correct
 * @param {boolean} isOpen toggles settings
 */
function changeArrowDirection(isOpen) {
    setCSSVar('--brd-right', isOpen ? 'transparent' : 'black');
    setCSSVar('--brd-left', isOpen ? 'black' : 'transparent');
    setCSSVar('--pos-right', isOpen ? '0' : '0.5rem'); 
}


/**
 * Hides the intro screen by click
 */
introScreen.addEventListener('click', () => {
    showIntroScreen(false);
});


/**
 * Switch in settings if playing with count down or not
 */
 chkCountdown.oninput = function() {
    countdown = parseInt(this.value);
    lblCountdown.innerText = countdown == 0 ? 'off' : countdown + ' sec';
}  


/**
 * Determines the debug mode in settings and refreshes the board.
 */
chkDebug.oninput = function() {
    debugMode = parseInt(this.value) == 1 ? true : false;
    lblDebugger.innerText = debugMode ? 'on' : 'off';
    BOARD.debugMode = debugMode;
    BOARD.refresh();
}


chkSound.oninput = function() {
    soundEnabled = parseInt(this.value) == 1 ? true : false;
    lblSound.innerText = soundEnabled ? 'on' : 'off';
}


/**
 * Switches on | off the editor mode
 */
chkEditor.oninput = function() {
    editorMode = parseInt(this.value) == 1 ? true : false;        
    if (toggleEditor(editorMode)) {
        toggleMenu(editorMode); 
    } else {
        chkEditor.value = 1;
        editorMode = true;
    }  
    lblEditor.innerText = editorMode ? 'on' : 'off';
}

function toggleEditor(mode) {
    BOARD.editMode = mode;
    imgFlag.src = mode ? './img/icons/Mine.jpg' : './img/icons/Flag.png';

    if (mode) {
        BOARD.create(rows, columns); 
        return true;       
    } else {
        let lvlName = txtLevelName.value,
            arrBombs = getBombIndices();
        if (lvlName.length > 2 && arrBombs.length) {
            gameSettings.levels.push({
                name: lvlName,
                rows: rows,
                columns: columns,
                bombs: arrBombs        
            });
            sldLevel.max = gameSettings.levels.length;
            return true;
        }   
        
        console.log('Save ceated board...', gameSettings.levels );
        // debugger
        txtLevelName.focus();
        return false;
    }   
}

function getBombIndices() {
    let arr = [];
    for (let i = 0; i < BOARD.size; i++) {
        if (BOARD.arrFields[i].hasBomb) arr.push(i);
    }
    return arr;
}

function toggleMenu(mode) {
    let arrMenu = $('.menu');
    for (let i = 0; i < arrMenu.length; i++) {
        const item = arrMenu[i];
        item.classList.toggle('hidden')
    }
}

/**
 * Determines the theme to play the game with
 */
sldTheme.oninput = function() {
    theme = parseInt(this.value);
    lblTheme.innerText = gameSettings.themes[theme];
    changeTheme(theme);
}


/**
 * Determines the game level and creates a new board based on the level.
 */
sldLevel.oninput = function changeLevel() {
    level = parseInt(this.value);    
    rows = gameSettings.levels[level].rows;
    columns = gameSettings.levels[level].columns;
    let arrBombs = gameSettings.levels[level].bombs;
    lblLevel.innerText = ' ' + gameSettings.levels[level].name;
    if (!gameOver) {
        BOARD.create(rows, columns, arrBombs);
        txtFlags.innerText = BOARD.flagsRemaining;
    } 
}