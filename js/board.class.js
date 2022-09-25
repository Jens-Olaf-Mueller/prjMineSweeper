class Board {
    arrFields = [];
    boardParentHTML = undefined;
    htmlBoard = undefined;
    get size() {return this.arrFields.length}; 
    get bombs() {return parseInt(this.#rows * this.#cols * BOMBS_PERCENT)};
    flagsRemaining;
    fieldsRevealed;
    debugMode;
    editMode = false;
    #rows;
    #cols;

    

    constructor(rows, columns, parentHtmlID, debugMode = false) { 
        this.boardParentHTML = document.getElementById(parentHtmlID);
        if (this.boardParentHTML === null) this.boardParentHTML = document.body; // make sure id exists!
        this.debugMode = debugMode;
        this.create(rows, columns);
    }


    /**
     * Creates a new HTML-board in the provided parent container (--> constructor).
     * If there is an existing board already, this step is skipped.
     * Then a new array of Fields is created depending on the rows and columns.
     * @param {number} rows number of rows in the new board
     * @param {number} cols number of columns in the board
     */
    create(rows, cols, bombs = []) {
        this.#rows = rows;
        this.#cols = cols;    
        this.flagsRemaining = this.bombs;    
        if (this.htmlBoard === undefined) {
            this.htmlBoard = this.#addElement('div', {id: 'divBoard', class: 'board'});
            this.boardParentHTML.appendChild(this.htmlBoard);
        }
        this.clear();             
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {                
                const field = new Field(rows, cols, x, y, this);
                this.arrFields.push(field);
            }
        }
        // if (!this.editMode) this.#setBombs(bombs);
        if (!this.editMode) this.#setBombs(bombs);
        this.refresh();
        if (debugMode) console.log('Fields: ', this.arrFields);
    }


    /**
     * Public method to refresh the existing board. (board is going to be rendered.)
     * Depending of the status of each field, different classes are added, toggled or removed,
     * in order to display the board correct.
     */
    refresh() {
        this.htmlBoard.innerHTML = '';
        this.fieldsRevealed = 0;
        for (let i = 0; i < this.arrFields.length; i++) {
            const fld = this.arrFields[i];
            this.htmlBoard.appendChild(fld.htmlElement);           
            fld.toggleClass('flag', fld.hasFlag);            
            if (fld.hasBomb) {
                fld.toggleClass('debugging', this.debugMode);
            } else if (this.editMode) {
                fld.toggleClass('mine', false);
                fld.toggleClass('revealed', false);
            }
            if (fld.revealed) {
                this.fieldsRevealed++;
                fld.toggleClass('revealed', true);
                if (fld.bombsNearby) fld.toggleClass('field'+fld.bombsNearby, true);
                if (fld.hasBomb) fld.toggleClass('mine', true);
                if (fld.exploded) fld.toggleClass('bang', true);
                if (fld.hasFlag && !fld.hasBomb) fld.toggleClass('flagwrong', true);                                
            }                          
        }
        this.#setFieldSize();
    }


    /**
     * Public method to clear an existing board.
     * CSS-property for GRID-colums and
     * CSS-variable for size of the fields is going to be reset.
     */
    clear() {
        this.htmlBoard.innerHTML = '';
        this.htmlBoard.style.gridTemplateColumns = `repeat(${this.#cols}, 1fr)`;
        this.arrFields = [];
        this.#setFieldSize();
    }


    /**
     * Public method to reveal the WHOLE board after game is over.
     */
    reveal() {
        for (let i = 0; i < this.arrFields.length; i++) {
            this.arrFields[i].revealed = true;
        }
        this.refresh();
    }   


    /**
     * Public method to reveal a SINGLE FIELD of the board.
     * After a field is clicked by the user, this method is called once.
     * Depending on the status of the neighbour-fields, the method calls itself recursively,
     * in order to reveal all adjacent fields that are allowed to be revealed.
     * @param {number} index of the field to be revealed
     */
    revealField(index) {
        const thisField = this.arrFields[index]
        thisField.revealed = !thisField.hasFlag;
        if (thisField.bombsNearby || thisField.hasBomb || thisField.hasFlag) return;
        const adjacents = this.arrFields[index].arrNeighbours;
        for (let i = 0; i < adjacents.length; i++) {
            const fld = adjacents[i];
            if (!this.arrFields[fld].revealed && !this.arrFields[fld].hasBomb) this.revealField(fld);
        }
    }


    /**
     * Private method to place the bombs in the new created field
     */
    #setBombs(bombs) {
        if (bombs.length == 0) {
            let z = 0;
            do {
                const fld = parseInt(Math.random() * this.arrFields.length);
                if (this.arrFields[fld].hasBomb == false) {
                    this.arrFields[fld].hasBomb = true;
                    z++;
                }
            } while (z < this.bombs);
        } else {
            for (let i = 0; i < bombs.length; i++) {
                const fld = bombs[i];
                this.arrFields[fld].hasBomb = true;
            }
        }
        this.#countBombNeighbours();
    }


    /**
     * Private method to determine all neighbour-fields of a field that contains a bomb.
     * Additional it determines the neighbour-indexes of each field in order to get
     * faster access in further progress of the game. 
     * (Recursive calls are faster to be executed since neighbours are known already.)
     */
    #countBombNeighbours() {         
        for (let i = 0; i < this.arrFields.length; i++) { 
            const adjacents = this.#getNeighbours(i);  
            this.arrFields[i].arrNeighbours = adjacents;     
            if (this.arrFields[i].hasBomb) {
                for (let j = 0; j < adjacents.length; j++) {
                    this.arrFields[adjacents[j]].bombsNearby++;
                }
            }
        }
    }


    /**
     * Privat method. Helper function for '#countBombNeighbours'.
     * Determines all VALID neighbours of a field, taking into account of borders!
     * @param {number} index of the given field
     * @returns array of indices of the field[index]
     */
    #getNeighbours(index) {
        const X = this.#cols, srcField = this.arrFields[index];
        let arr = [index-X-1, index-X, index-X+1, index-1, index+1, index+X-1, index+X, index+X+1]; 
        // filter out top & bottom border...
        arr = arr.filter(ind => ind >= 0 && ind < this.arrFields.length); 
        // filter out opposite borders: left field can't have a right field neighbour!
        for (let i = 0; i < arr.length; i++) {
            const nField = this.arrFields[arr[i]];
            if (srcField.border.left && nField.border.right || 
                srcField.border.right && nField.border.left) arr.splice(i,1);     
        }
        return arr;
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
     * Private method to determine the size of a field, depending on the board container.
     * @param {number} rows the board's amount of rows
     * @returns floating number of the size of a squared field  
     */
    #getFieldSize(rows) {
        return this.htmlBoard.clientHeight / rows;
    }


    /**
     * Private method to set the board's field size in CSS
     */
    #setFieldSize() {
        document.querySelector(':root').style.setProperty('--fld-size', `${this.#getFieldSize(this.#rows)}px`);
    }
}