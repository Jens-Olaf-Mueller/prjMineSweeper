let arrFields = [], arrLevel = ['easy', 'medium', 'hard', 'insane'], arrClassFields =[],
    level = 0, rows = 9, columns = 9, countdown = 0, clicks = 0, 
    debugMode = false, soundEnabled = true,
    gameOver, gameWon, mainInterval,
    gameTimer = new Timer('txtTimer');

const BOMBS_PERCENT = 0.15;
const SND_EXPLOSION = new Audio('../sounds/explosion.mp3'),
      SND_DIG = new Audio ('../sounds/digging.mp3'),
      SND_FLAG = new Audio ('../sounds/flag.mp3'),
      SND_FLAGOFF = new Audio ('../sounds/plopp.mp3'),
      SND_GAMEOVER = new Audio ('../sounds/game over.mp3'),
      SND_WINNER = new Audio ('../sounds/drumroll.mp3'),
      SND_CLOCK = new Audio ('../sounds/tick tack.mp3'),
      SND_ALERT = new Audio ('../sounds/alert.mp3');

const sldLevel = document.getElementById('inpLevel'),
      chkCountdown =  document.getElementById('inpCountdown'),
      chkDebug = document.getElementById('inpDebugger'),
      chkSound = document.getElementById('inpSound'),
      btnSettings = document.getElementById('divButtonSettings'),
      swipe = document.getElementById('divWiper'),
      btnNew = document.getElementById('divClock'),
      clock = document.getElementById('txtTimer'),
      txtClicks = document.getElementById('txtClicks'),
      txtFlags = document.getElementById('txtFlags'),
      introScreen = document.getElementById('divIntro');

const BOARD = new Board(rows, columns,'divBoardTable');

init();

/**
 * Start function of the game
 */
function init() {    
    gameOver = false;
    gameWon = false;
    clicks = 0;
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
    let delay = gameWon ? 400 : 2000;
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
document.addEventListener('fieldclick', function () {
    handleClicks('left');
})
document.addEventListener('rightclick', function () {
    handleClicks('right');
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
 * @param {boolean} isOpen determines if settings are shown or not
 */
function changeArrowDirection(isOpen) {
    if (isOpen) {
        setCSSVar('--brd-right', 'transparent');
        setCSSVar('--brd-left', 'black');
        setCSSVar('--pos-right', '0');

    } else {
        setCSSVar('--brd-right', 'black');
        setCSSVar('--brd-left', 'transparent');
        setCSSVar('--pos-right', '0.5rem');
    }  
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
    let value = countdown == 0 ? 'off' : countdown + ' sec';
    document.getElementById('lblCountdown').innerText = value;
}  


/**
 * Determines the debug mode in settings and refreshes the board.
 */
chkDebug.oninput = function() {
    debugMode = parseInt(this.value) == 1 ? true : false;
    document.getElementById('lblDebugger').innerText = debugMode ? 'on' : 'off';
    BOARD.debugMode = debugMode;
    BOARD.refresh();
}


chkSound.oninput = function() {
    soundEnabled = parseInt(this.value) == 1 ? true : false;
    document.getElementById('lblSound').innerText = soundEnabled ? 'on' : 'off';
}

/**
 * Determines the game level and creates a new board based on the level.
 */
sldLevel.oninput = function() {
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
    if (!gameOver) BOARD.create(rows, columns);
}