let arrFields = [], arrLevel = ['easy', 'medium', 'hard', 'insane'], arrClassFields =[],
    level = 0, rows = 9, columns = 9, countdown = 0, clicks = 0, 
    debugMode = false, soundEnabled = true,
    gameOver, mainInterval,
    gameTimer = new Timer('txtTimer');

const BOMBS_PERCENT = 0.15;
const SND_EXPLOSION = new Audio('../sounds/explosion.mp3'),
      SND_DIG = new Audio ('../sounds/digging.mp3'),
      SND_FLAG = new Audio ('../sounds/flag.mp3'),
      SND_FLAGOFF = new Audio ('../sounds/plopp.mp3'),
      SND_GAMEOVER = new Audio ('../sounds/game over.mp3'),
      SND_WINNER = new Audio ('../sounds/drumroll.mp3'),
      SND_CLOCK = new Audio ('../sounds/tick tack.mp3');

const sldLevel = document.getElementById('inpLevel'),
      chkCountdown =  document.getElementById('inpCountdown'),
      chkDebug = document.getElementById('inpDebugger'),
      chkSound = document.getElementById('inpSound'),
      btnSettings = document.getElementById('divButtonSettings'),
      swipe = document.getElementById('divDropdown'),
      btnNew = document.getElementById('divClock'),
      clock = document.getElementById('txtTimer'),
      txtClicks = document.getElementById('txtClicks'),
      introScreen = document.getElementById('divIntro');

const BOARD = new Board(rows, columns,'divBoardTable');

init();

/**
 * Start function of the game
 */
function init() {    
    gameOver = false;
    clicks = 0;
    txtClicks.innerText = 0;
    btnNew.setAttribute('class', 'timer');
    clock.innerText = '00:00';    
    BOARD.create(rows, columns);
    mainInterval = watchGameStatus();
}


/**
 * Observes the game status and timers.
 * Changes the Display of the clock after game is over to NEW GAME
 * @returns ID of the Interval that watches the game status 3 times a second
 */
function watchGameStatus() {
    return setInterval(() => {
        if (gameOver) {
            mainInterval = clearInterval(mainInterval);
            gameTimer.stop();
            gameTimer.countDown('stop');
            BOARD.reveal();     
            clock.innerText = 'New game';            
            showIntroScreen(true);            
            btnNew.setAttribute('class', 'timer btn-style');
            btnNew.addEventListener('click', init, {once : true});
        }
    }, 333);
}
 

/**
 * Plays the given audio file.
 * @param {object} file audio object
 */
function playSound(file) {
    if (soundEnabled) file.play();
}

function showIntroScreen(status) {
    if (status == true) {
        setTimeout(() => {
            introScreen.classList.remove('hidden');
            playSound(gameOver ? SND_GAMEOVER : SND_WINNER);
        }, 2000)
    } else {
        introScreen.classList.add('hidden');
    }
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

function handleClicks(button) {
    clicks++;
    txtClicks.innerText = clicks;
    if (clicks == 1) {        
        swipe.setAttribute('class', 'slide-out');
        if(!countdown) {
            // TODO: settings erweitern mit Zeitlimit - dann gameTimer.setAlert(setting)
            gameTimer.start();
        }
    } 
    if (countdown) gameTimer.countDown(countdown); 
}

/**
 * Listeners for timeout (play with countdown) or 
 * time-expired (not installed yet) for play with time limit...
 */
document.addEventListener('timeout', (evt) => { 
    gameOver = true;        
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
});


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