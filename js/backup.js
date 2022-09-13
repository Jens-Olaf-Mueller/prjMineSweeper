function createBoard(size) {
    arrFields = [];
    const fldSize = board.clientWidth / size;
    debugger
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            arrFields.push({
                top: Math.round((x % size) * fldSize),
                left: Math.round((y % size) * fldSize),
                index: x * size + y,
                border: {
                        top: x % size == 0,
                        left: y == 0, 
                        right: (y+1)% size == 0,
                        bottom: (x+1)% size == 0
                      },
                // isBorder: (x % size == 0 || y == 0 || (y+1)% size == 0 || (x+1)% size == 0),
                revealed: false,
                hasBomb: false,
                neighbours: 0,
                hasFlag: false,
            }); 
        }     
    }
    setBombs(size);
    renderBoard(fldSize);
}