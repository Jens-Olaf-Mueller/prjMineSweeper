class Timer {
    timerID = undefined;
    countDownID = undefined;
    htmlElement = undefined;
    sec = 0;
    min = 0;
    hrs = 0;
    seconds = 0; // for countdown!
    showMinutes = true;
    showHours = false;
    
    constructor(element, run = false) {
        if (element) this.htmlElement = document.getElementById(element);
        if (run) this.start();
    }

    start(resume) {
        if (!resume) {
            if (this.timerID) return;
            this.reset();
        }
        // start the interval timer
        this.timerID = setInterval(() => {
            this.sec++;
            if (this.sec == 60) {
                this.sec = 0;
                this.min++;
            }
            if (this.min == 60) {
                this.min = 0;
                this.hrs++;
            }
            if (this.hrs == 24) this.hrs = 24;

            if (this.htmlElement === undefined) {
                return {hours: this.hrs, minutes: this.min, seconds: this.sec};
            }
            this.htmlElement.innerText = this.#formatTime();
        }, 1000);
    }

    resume() {
        this.start(true);
    }

    stop() {
        this.timerID = clearInterval(this.timerID);
    }

    reset() {
        this.hrs = 0;
        this.sec = 0;
        this.min = 0;
        this.seconds = 0;
    }

    clear() {
        this.timerID = clearInterval(this.timerID);
        this.countDownID = clearInterval(this.countDownID);
        this.reset();
    }

    countDown(seconds, interval = 1000) {
        // allow only ONE countdown!
        if (this.countDownID) this.#stopCountdown();
        this.seconds = seconds;
        this.countDownID = setInterval(() => {
            this.seconds--;
            if (this.seconds < 0) {
                this.#stopCountdown();
                document.dispatchEvent(new Event('timeout')); // raise the timeout event
            }
        }, 1000);
    }

    #stopCountdown() {
        this.countDownID = clearInterval(this.countDownID);
    }

    /**
     * formats the timer's value in format hh:nn:ss
     * @returns time string
     */
    #formatTime() {
        if (this.showMinutes == false) this.showHours = false; // ensure correct format
        let time = `${('0'+this.sec).slice(-2)}`;
        if (this.showMinutes) time = `${('0'+this.min).slice(-2)}:` + time;        
        if (this.showHours) time = `${('0'+this.hrs).slice(-2)}:` + time;
        return time;
    }
}