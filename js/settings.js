const APP_NAME = 'Mine Sweeper';
const BOMBS_PERCENT = 0.15;

const SND_EXPLOSION = new Audio('./sounds/explosion.mp3'),
      SND_DIG = new Audio ('./sounds/digging.mp3'),
      SND_FLAG = new Audio ('./sounds/flag.mp3'),
      SND_FLAGOFF = new Audio ('./sounds/plopp.mp3'),
      SND_GAMEOVER = new Audio ('./sounds/game over.mp3'),
      SND_WINNER = new Audio ('./sounds/drumroll.mp3'),
      SND_CLOCK = new Audio ('./sounds/tick tack.mp3'),
      SND_ALERT = new Audio ('./sounds/alert.mp3');

const sldLevel = $('inpLevel'),
      lblLevel = $('lblLevel'),
      sldTheme = $('inpTheme'),
      lblTheme = $('lblTheme'),
      chkCountdown = $('inpCountdown'),
      lblCountdown = $('lblCountdown'),
      chkDebug = $('inpDebugger'),
      lblDebugger = $('lblDebugger'),
      chkEditor = $('inpEditor'),
      lblEditor = $('lblEditor'),
      chkSound = $('inpSound'),
      lblSound = $('lblSound'),
      btnSettings = $('divButtonSettings'),
      swipe = $('divWiper'),
      btnNew = $('divClock'),
      clock = $('txtTimer'),
      txtClicks = $('txtClicks'),
      txtFlags = $('txtFlags'),
      imgFlag = $('imgFlag'),
      introScreen = $('divIntro');

let arrLevel = ['easy', 'medium', 'hard', 'insane','wtf ???'], arrClassFields =[],
    level = 0, theme = 0, rows = 9, columns = 9, countdown = 0, clicks = 0, bombsRemaining = 0,
    debugMode = false, editorMode = false, soundEnabled = true,
    gameOver, gameWon, mainInterval,
    gameTimer = new Timer('txtTimer');

let gameSettings = {
    player: '',
    highScore: 0,
    currentLevel: 0,
    countDown: 0,
    soundEnabled: 1,
    debugMode: 0,
    currentTheme: 1,
    themes: ['Classic','Green','DevAc'],
    level: [
            {   name: 'easy',
                rows: 9,
                columns: 9,
                bombs: []
            },
            {   name: 'medium',
                rows: 16,
                columns: 16,
                bombs: []
            },
            {   name: 'hard',
                rows: 16,
                columns: 30,
                bombs: []
            },
            {   name: 'insane',
                rows: 24,
                columns: 30,
                bombs: []
            },
            {   name: 'wtf ???',
                rows: 24,
                columns: 48,
                bombs: []
            }]
};

function loadSettings(key = APP_NAME) { 
    gameSettings = JSON.parse(localStorage.getItem(key)) || gameSettings;
    setSettings();
}

function setSettings () {    
    level = gameSettings.currentLevel;
    sldLevel.value = level;
    lblLevel.innerText = ' ' + gameSettings.level[level].name;
    
    countdown = gameSettings.countDown;
    chkCountdown.value = countdown;
    lblCountdown.innerText = countdown == 0 ? 'off' : countdown + ' sec';

    soundEnabled = gameSettings.soundEnabled;
    chkSound.value = soundEnabled;
    lblSound.innerText = soundEnabled ? 'on' : 'off';

    debugMode = gameSettings.debugMode;
    chkDebug.value = debugMode;
    lblDebugger.innerText = debugMode ? 'on' : 'off';
}


function saveSettings (key = APP_NAME) {  
    gameSettings.player = ''; 
    gameSettings.currentTheme = theme;
    gameSettings.currentLevel = level;
    gameSettings.countDown = countdown;
    gameSettings.soundEnabled = soundEnabled;
    gameSettings.debugMode = debugMode;
    localStorage.setItem(key, JSON.stringify(gameSettings));
}


function changeTheme(theme) {
    let bgColors = ['silver', 'green', 'steelblue'],
        brdColors = ['#333333', 'green', 'navy'],
        txtColors = ['navy', 'darkgreen', 'navy'],
        hovColors = ['#e0e0e0', 'lime', 'dodgerblue'],
        sldColor = ['lightgrey','limegreen', 'steelblue'],
        hue = [0,270,0], bright = [0.9,1.25,0.9], sepia = [0.75,1,0.5];
    setCSSVar('--main-bg', `url('../img/background/full-bg${theme}.png')`);
    setCSSVar('--hover-color', hovColors[theme]);
    setCSSVar('--slider-color', sldColor[theme]);
    setCSSVar('--brd-color', brdColors[theme]);
    setCSSVar('--shadow', `10px 10px 8px ${bgColors[theme]}`);
    setCSSVar('--bg-color', bgColors[theme]);
    setCSSVar('--tooltip-color', brdColors[theme]);
    setCSSVar('--tooltip-text-color', hovColors[theme]);
    setCSSVar('--text-color', txtColors[theme]);
    setCSSVar('--flt-hue', `hue-rotate(${hue[theme]}deg)`);
    setCSSVar('--flt-bright', `brightness(${bright[theme]})`);
    setCSSVar('--flt-sepia', `sepia(${sepia[theme]})`);
    setCSSVar('--bang', `url('../img/buttons/bang${theme}.png')`),
    setCSSVar('--mine', `url('../img/buttons/mine${theme}.png')`);
    setCSSVar('--flag', `url('../img/buttons/flag${theme}.png')`);
    setCSSVar('--flag-wrong', `url('../img/buttons/wrong_flag${theme}.png')`);
    setCSSVar('--revealed', `url('../img/buttons/revealed${theme}.png')`);
    for (let i = 0; i < 9; i++){
        setCSSVar(`--fld${i}`, `url('../img/buttons/field${i}-${theme}.png')`);        
    }
}