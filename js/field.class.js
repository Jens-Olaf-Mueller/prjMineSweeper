class Field {
    index;
    ID = '';
    htmlElement;
    parentElement = undefined;
    border = {
        top: false,
        left: false, 
        right: false,
        bottom: false
    };
    revealed = false;
    hasBomb = false;
    exploded = false;
    neighbours = 0;
    hasFlag = false;

    constructor(rows, columns, X, Y) {
        this.index = X * rows + Y;
        this.border.top = X % rows == 0;
        this.border.left = Y == 0;
        this.border.right = (Y + 1) % columns == 0;
        this.border.bottom = (X + 1) % rows == 0;
        this.ID = `fld-${this.index}`;
        this.htmlElement = this.#addElement();
        this.#setEvents();
    }

    #addElement() {
        const newDiv = document.createElement("div",);
        newDiv.setAttribute('id', `${this.ID}`);
        newDiv.setAttribute('class', 'field');
        newDiv.setAttribute('data-index', `${this.index}`);
        return newDiv;
    }

    #setEvents() {
        return;
    }
}