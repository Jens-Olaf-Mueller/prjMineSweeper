/**
 * Timer class with following features:
 * SYNTAX:      let objectVariable = new Timer( [HTML-ID] | [,hours] | [,minutes] | [,seconds] | [,run] )
 *              > HTML-ID                   - optional, {string}-id of an HTML-element to display the time
 *              > hours, minutes, seconds   - optional, {numeric} parameters (will be validated before setting)
 *              > run                       - optional, {boolean} starts the timer immediately if set to 'true'
 *              
 * EXAMPLE:     let myTimer = new Timer('divClock', 12, 30, 0, true);
 *              Will assign the timer to 'myTimer' at "12:30:00" and starts it immediately.
 *              Running time will be displayed on a <div>-Element with ID 'divClock'.
 * 
 * METHODS:     9
 *              - start()
 *              - resume()
 *              - getTime()
 *              - setTime()
 *              - setAlert()
 *              - stop()
 *              - reset()
 *              - clear()
 *              - countDown()
 * 
 * PROPERTIES:  3
 *              .htmlElement    --> connected HTML-Element to display the time
 *              .alertTime      --> returns the set alert time (or 'undefined' if missed)
 *              .showMinutes    --> determines if counting minutes are displayed (default = true)
 *                                  if showMinutes = 'false', hours won't be displayed either!
 *              .showHours      --> determines if counting hours are displayed (default = false)
 * 
 * EVENTS:      2
 *              - timeout       --> fired when countdown reaches zero
 *              - timerexpired  --> fired when defined alert time is reached
 * 
 * USAGE:       All params while creating a new instance of the timer are optional!
 *              If no time is submitted, the timer starts with 00:00:00. 
 *              If no HTML-element is submitted, it can be set later by: 
 *              myTimer.htmlElement = document.getElementById('htmlID');
 */
const TIMEOUT = 'timeout',
      EXPIRED = 'timerexpired';

class Timer {
    timerID = undefined;
    countDownID = undefined;
    htmlElement = undefined;
    alertTime = undefined;
    start_sec = 0;
    start_min = 0;
    start_hrs = 0;
    sec = 0;
    min = 0;
    hrs = 0;
    seconds = 0; // for countdown!
    showMinutes = true;
    showHours = false;
    
    constructor(htmlID, hours = 0, minutes = 0, seconds = 0, run = false) {
        this.htmlElement = document.getElementById(htmlID);
        if (this.htmlElement === null) this.htmlElement = undefined;
        this.setTime(hours, minutes, seconds);
        if (run) this.start();
    }

    /**
     * starts a defined timer or continues a stopped one.
     * @param {boolean} resume if true, continue a stopped or not started timer
     * @returns 
     */
    start(resume) {
        if (resume) {
            if (this.timerID) clearInterval(this.timerID);
        } else {
            if (this.timerID) return; // avoid conflict with a running timer!
            this.reset();
        }
        // start the interval timer
        this.timerID = setInterval(() => {
            this.sec++;
            if (this.sec == 60) {
                this.sec = 0;
                this.min++;
                if (this.min == 60) {
                    this.min = 0;
                    this.hrs++;
                    if (this.hrs == 24) this.hrs = 0;
                }
            }
            let currTime = this.#formatTime(this.hrs, this.min, this.sec);
            if (this.alertTime == currTime) document.dispatchEvent(new Event(EXPIRED)); // raise event
            if (this.htmlElement) this.htmlElement.innerText = currTime;
        }, 1000);
    }

    resume() {
        this.start(true);
    }

    /**
     * returns the current time
     * @param {string | undefined} returnAs if 'object' is submitted, a time object is returned,
     * if parameter is omitted the time will be returned in format 'hh:nn:ss'
     * @returns time object or formatted time string
     */
    getTime(returnAs) {
        if (returnAs == 'object') return {hours: this.hrs, minutes: this.min, seconds: this.sec};
        return this.#formatTime(this.hrs, this.min, this.sec);
    }

    setTime(hours = 0, minutes = 0, seconds = 0) {
        if (this.#validateTime(hours, minutes, seconds)) {
            this.start_sec = seconds;
            this.start_min = minutes;
            this.start_hrs = hours;
            this.reset();
            return;
        }
        console.error('Could not set time due to invalid parameter(s)');
    }

    setAlert(hours = 0, minutes = 0, seconds = 0) {
        if (this.#validateTime(hours, minutes, seconds)) {
            this.alertTime = `${('0'+hours).slice(-2)}:${('0'+minutes).slice(-2)}:${('0'+seconds).slice(-2)}`;
            return;
        }
        this.alertTime = undefined;
        console.error('Could not set alert due to invalid parameter(s)');
    }

    stop() {
        this.timerID = clearInterval(this.timerID);
    }

    /**
     * resets the timer
     * @param {boolean | number} toZero determines, if timer is reset to zero or to the inital time
     */
    reset(toZero) {      
        if (toZero === true || toZero == 0)  {
            this.sec = 0;
            this.min = 0;
            this.hrs = 0;
        } else {
            this.sec = this.start_sec;
            this.min = this.start_min;
            this.hrs = this.start_hrs;
        }        
    }

    clear() {
        this.timerID = clearInterval(this.timerID);
        this.countDownID = clearInterval(this.countDownID);
        this.reset();
    }

    /**
     * Starts or stops a countdown depending on the submitted parameter 'seconds'
     * or returns the countdown time if seconds are omitted!
     * If seconds are zero, a timeout-event is fired
     * and the countdown timer stops.
     * @param {number | boolean | string} seconds 
     * if numeric and > 0, the count down starts with the submitted seconds,
     * if boolean = 'false' or string = 'stop' or number = 0, the countdown stops
     */
    countDown(seconds) {  
        if (typeof seconds == 'number' && seconds > 0) {
            if (this.countDownID) this.#stopCountDown(); // allow only ONE countdown!
            this.seconds = seconds;
            this.countDownID = setInterval(() => {
                this.seconds--;
                if (!this.timerID && this.htmlElement) this.htmlElement.innerText = this.#getCountDown();
                if (soundEnabled && this.seconds > 0 && this.seconds < 4 && !SND_CLOCK.ended) SND_CLOCK.play();
                if (this.seconds <= 0) { 
                    this.#stopCountDown();
                    document.dispatchEvent(new Event(TIMEOUT)); // raise timeout event
                }
            }, 1000);
        } else if (seconds === false || seconds === 'stop' || seconds == 0) {
            this.#stopCountDown();
        } else if (seconds === undefined) {
            return this.#getCountDown();
        } else {
            console.error('Could not set count down due to invalid parameter');
        }
    }

    #getCountDown() {
        let hours = parseInt(this.seconds / 3660),
            minutes = parseInt((this.seconds - hours * 3600) / 60),
            seconds = parseInt(this.seconds - (hours * 3600 + minutes * 60));
        return this.#formatTime(hours, minutes, seconds);
    }

    /**
     * private method: stops a countdown (when expired)
     */
    #stopCountDown() {
        SND_CLOCK.pause();
        SND_CLOCK.currentTime = 0;
        this.countDownID = clearInterval(this.countDownID);
    }

    /**
     * private method: formats and returns the timer's value in format hh:nn:ss
     * @returns time string
     */
    #formatTime(hours, minutes, seconds) {
        if (this.showMinutes == false) this.showHours = false; // ensure correct format
        let time = `${('0'+seconds).slice(-2)}`;
        if (this.showMinutes) time = `${('0'+minutes).slice(-2)}:` + time;        
        if (this.showHours) time = `${('0'+hours).slice(-2)}:` + time;
        return time;
    }

    /**
     * private method: checks if a given time is valid
     * @param {number} hours, minutes, seconds must be valid time parameters
     * @returns true | false
     */
    #validateTime(hours, minutes, seconds) {
        return (seconds >= 0 && seconds < 60 && minutes >= 0 && minutes < 60 && hours >= 0 && hours < 24);
    }
}