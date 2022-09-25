class Field {
    index;
    arrNeighbours = [];
    ID = '';
    htmlElement;
    parentBoard = undefined;
    border = {
        top: false,
        left: false, 
        right: false,
        bottom: false
    };
    revealed = false;
    hasBomb = false;
    exploded = false;
    bombsNearby = 0;
    hasFlag = false;

    constructor(rows, columns, X, Y, parent) {
        this.parentBoard = parent;
        this.index = (columns <= rows) ? X * rows + Y : X * columns + Y;
        this.border.top = X % rows == 0;
        this.border.left = Y == 0;
        this.border.right = (Y + 1) % columns == 0;
        this.border.bottom = (X + 1) % rows == 0;
        this.ID = `fld-${this.index}`;
        this.htmlElement = this.#addElement('div', {id: `${this.ID}`, class: 'field', "data-index": `${this.index}`});
        // this.htmlElement.innerText = this.index; // for debugging only...
        if (this.parentBoard.editMode) {
            this.#setEditorClickEvents();
        } else {
            this.#setLeftClickEvents();
            this.#setRightClickEvents(); 
        }               
    }


    /**
     * Public method to change classes of the field instance properly
     * @param {string} classname the class to be added, removed or toggled
     * @param {boolean} force omitted = toggle class | true = add class | false = remove class      
     */
    toggleClass(classname, force) {
        this.htmlElement.classList.toggle(classname, force);
    }


    /**
     * Private method to create a new HTML-element in DOM
     * @param {string} node HTML-Tag that determines the element to be added
     * @param {object} attributes {key: value} array of attributes to be set
     * @returns the new created HTML-element
     */
    #addElement(node, attributes) {
        const newElement = document.createElement(node);
        for (let key in attributes){
            newElement.setAttribute(key, attributes[key]);
        }
        return newElement;
    }


    /**
     * Adds the event listners for left- and right-click to the current instance of the field.
     * Raises the new 'fieldclick' | 'rightclick'-event to be watched in main.js 
     * Refreshes the board (parent-object) after click in order to display it correct.
     *
     * install the listener for left clicks
     */
    #setLeftClickEvents() {
        if (!this.revealed) {
            this.htmlElement.addEventListener('click', () => {
                if (gameOver || gameWon) return; // game is already over and board revealed!
                this.revealed = true;
                this.hasFlag = false;
                this.exploded = this.hasBomb;
                gameOver = this.exploded
                playSound(gameOver ? SND_EXPLOSION : SND_DIG);
                this.parentBoard.revealField(this.index);
                this.parentBoard.refresh();
                document.dispatchEvent(new Event('fieldclick'));
            }, {once : true});
        }
    }


    /**
     * install the listener for right clicks
     */
    #setRightClickEvents() {
        if (!this.revealed) {
            this.htmlElement.addEventListener('contextmenu', (event) => {
                if (gameOver || gameWon) return;
                event.preventDefault();
                if (this.parentBoard.flagsRemaining || this.hasFlag) {
                    this.hasFlag = !this.hasFlag && !this.revealed;
                    this.parentBoard.flagsRemaining += (this.hasFlag) ? -1 : 1;
                    playSound(this.hasFlag ? SND_FLAG : SND_FLAGOFF);
                    this.parentBoard.refresh();    
                    document.dispatchEvent(new Event('rightclick'));                      
                }              
            });
        }
    }

    #setEditorClickEvents() {
        this.htmlElement.addEventListener('click', () => {
            if (this.parentBoard.flagsRemaining || this.hasBomb) {
                this.hasBomb = !this.hasBomb;
                this.revealed = this.hasBomb;
                this.parentBoard.flagsRemaining += (this.hasBomb) ? -1 : 1;
                document.dispatchEvent(new Event('edit'));
            }
        });
    }
}