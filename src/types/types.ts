
// Type definition for valid digits in a Sudoku grid
export type ValidDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Empty = null;
export type Digit = ValidDigit | Empty;

// Type definition for valid indices in a Sudoku grid (row, column)
export type ValidIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Type definition for a 3x3 subgrid in a Sudoku grid
export type ValidSubgridIndex = 0 | 1 | 2;

export type Bit = 0 | 1;

// Type definition for position (row, column) in a Sudoku grid
export type Position = {
    row: ValidIndex;
    col: ValidIndex;
};

// Type definition for a cell in the grid
export type GridCell = {
    value: Digit;
    invalid: boolean;
    cellSource: CellSource;
    cellSelect: CellSelect;
};

// Type definition for select state of a cell
// SELECTED: Cell is selected by the user
// SAME_VALUE: Cell has the same value as the selected cell
// NEIGHBOR: Cell is a neighbor of the selected cell (same row, column, or subgrid)
// NONE: Cell is not selected
export type CellSelect = 'SELECTED' | 'SAME_VALUE' | 'NEIGHBOR' | 'NONE';
export type CellSource = 'SOURCE' | 'USER';
// Type definition for UserMode (select, draw, erase)
export type UserMode = 'SELECT' | 'DRAW' | 'ERASE';
