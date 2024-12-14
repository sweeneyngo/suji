
import { Bit, GridCell, ValidIndex, ValidDigit, ValidSubgridIndex, Position } from '../types/types';
import { isValidDigit } from './validate';
import { getCombinations, isSetsEqual, getTwoDistinctValues } from './math';
import { createBitmask, setBit } from './bit';

const MAX_ROWS = 9;
const MAX_COLS = 9;

const MAX_SUBGRID_ROWS = 3;
const MAX_SUBGRID_COLS = 3;

// Create a new grid with the given values.
function createGrid(): GridCell[][] {
    return Array.from({ length: MAX_ROWS }, () =>
        Array.from({ length: MAX_COLS }, () => ({
            value: null,
            invalid: false,
            cellSource: 'USER',
            cellSelect: 'NONE'
        }))
    );
}

// Create a new markup grid with the candidates for each cell.
function createMarkupGrid(grid: GridCell[][]): Set<number>[][] {
    const markups: Set<number>[][] = Array.from({ length: MAX_ROWS }, () =>
        Array.from({ length: MAX_COLS }, () => new Set<number>())
    );

    for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < MAX_COLS; c++) {
            const cell = grid[r][c];
            if (cell.value !== null) continue;
            markups[r][c] = new Set(getCandidates(grid, r, c));
        }
    }
    return markups;
}

// Verify that the entire grid is valid.
// A valid grid has valid rows, columns, and subgrids.
// Return true if the grid is valid, and false otherwise.
function verifyGrid(grid: GridCell[][]): boolean {
    for (let r = 0; r < MAX_ROWS; r++) {
        if (!verifyRow(grid, r as ValidIndex)) {
            return false;
        }
    }

    for (let c = 0; c < MAX_COLS; c++) {
        if (!verifyColumn(grid, c as ValidIndex)) {
            return false;
        }
    }

    for (let r = 0; r < MAX_SUBGRID_ROWS; r++) {
        for (let c = 0; c < MAX_SUBGRID_COLS; c++) {
            if (!verifySubgrid(grid, r as ValidSubgridIndex, c as ValidSubgridIndex)) {
                return false;
            }
        }
    }

    return true;
}

// Verify that a row in the grid is valid.
// A valid row contains no duplicate values, and null values are ignored. Therefore, it doesn't have to be complete.
// Return true if the row is valid, and false otherwise.
function verifyRow(grid: GridCell[][], row: ValidIndex): boolean {
    const rowValues = grid[row].filter((cell) => isValidDigit(cell.value)).map((cell) => cell.value);
    return new Set(rowValues).size === rowValues.length;
}

// Verify that a column in the grid is valid.
// A valid column contains no duplicate values, and null values are ignored. Therefore, it doesn't have to be complete.
// Return true if the column is valid, and false otherwise.
function verifyColumn(grid: GridCell[][], col: ValidIndex): boolean {
    const columnValues = grid.map((row) => row[col]).filter((cell) => isValidDigit(cell.value)).map((cell) => cell.value);
    return new Set(columnValues).size === columnValues.length;
}

// Verify that a 3x3 subgrid in the grid is valid.
// A valid subgrid contains no duplicate values, and null values are ignored. Therefore, it doesn't have to be complete.
// Return true if the subgrid is valid, and false otherwise.
function verifySubgrid(grid: GridCell[][], row: ValidSubgridIndex, col: ValidSubgridIndex): boolean {
    const subgridValues = [] as ValidDigit[];

    const startRow = row * MAX_SUBGRID_ROWS;
    const startCol = col * MAX_SUBGRID_COLS;
    for (let r = startRow; r < startRow + MAX_SUBGRID_ROWS; r++) {
        for (let c = startCol; c < startCol + MAX_SUBGRID_COLS; c++) {
            const cell = grid[r][c];
            if (isValidDigit(cell.value)) {
                subgridValues.push(cell.value);
            }
        }
    }
    return new Set(subgridValues).size === subgridValues.length;
}

// Verify that a cell in the grid is valid.
// A valid cell has a valid value, and the value doesn't conflict with the row, column, or subgrid.
const isValid = (grid: GridCell[][], row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i].value === num || grid[i][col].value === num) return false;
    }

    const subgridRow = Math.floor(row / 3) * 3;
    const subgridCol = Math.floor(col / 3) * 3;
    for (let r = subgridRow; r < subgridRow + 3; r++) {
        for (let c = subgridCol; c < subgridCol + 3; c++) {
            if (grid[r][c].value === num) return false;
        }
    }
    return true;
};

// Check if a number is unique in the row.
// A number is unique in the row if it doesn't appear in any other empty cell in the row.
const isUniqueInRow = (grid: GridCell[][], row: number, col: number, num: number): boolean => {
    for (let c = 0; c < 9; c++) {
        // If there's another empty cell in the row where the guess is valid, return false
        if (grid[row][c].value === null && c !== col && isValid(grid, row, c, num)) {
            return false;
        }
    }
    return true;  // The guess can only fit in the current cell in the row
}

// Check if a number is unique in the column.
// A number is unique in the column if it doesn't appear in any other empty cell in the column.
const isUniqueInColumn = (grid: GridCell[][], row: number, col: number, num: number): boolean => {
    for (let r = 0; r < 9; r++) {
        // If there's another empty cell in the column where the guess is valid, return false
        if (grid[r][col].value === null && r !== row && isValid(grid, r, col, num)) {
            return false;
        }
    }
    return true;  // The guess can only fit in the current cell in the row
}

// Check if a number is unique in the 3x3 box.
// A number is unique in the box if it doesn't appear in any other empty cell in the box.
const isUniqueInBox = (grid: GridCell[][], row: number, col: number, num: number): boolean => {
    const subgridRow = Math.floor(row / 3) * 3;
    const subgridCol = Math.floor(col / 3) * 3;

    for (let r = subgridRow; r < subgridRow + 3; r++) {
        for (let c = subgridCol; c < subgridCol + 3; c++) {
            // If there's another empty cell in the box where the guess is valid, return false
            if (grid[r][c].value === null && !(r === row && c === col) && isValid(grid, r, c, num)) {
                return false;
            }
        }
    }
    return true;  // The guess can only fit in the current cell in the box
};

// Find all empty cells in the grid.
function findEmptyCells(grid: GridCell[][]): Position[] {
    const emptyCells: Position[] = [];
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col].value === null) {
                emptyCells.push({ row: row as ValidIndex, col: col as ValidIndex });
            }
        }
    }
    return emptyCells;
}

// Find the first empty cell in the grid.
const findEmptyCell = (grid: GridCell[][]): Position | null => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col].value === null) return { row: row as ValidIndex, col: col as ValidIndex };
        }
    }
    return null;
};

// Find all preemptive sets in the grid.
// A preemptive set is a set of candidates that only appear in the same row, column, or subgrid.
function findPreemptiveSets(markups: Set<number>[][], row: number, col: number): [Set<number>[][], number] {

    let changesMade = 0;
    const markup = markups[row][col];

    // Row preemptive sets
    // Find number of cells in the row with the same markup set as the current cell.
    const countRow = markups[row].filter(m => isSetsEqual(m, markup)).length;
    if (countRow === markup.size) {
        for (let c = 0; c < 9; c++) {
            if (c !== col && !isSetsEqual(markups[row][c], markup)) {
                for (let value of markup) {
                    if (markups[row][c].has(value)) {
                        markups[row][c].delete(value);
                        changesMade++;
                    }
                }
            }
        }
    }

    // Column preemptive sets
    // Find number of cells in the column with the same markup set as the current cell.
    const countCol = markups.map(m => m[col]).filter(m => isSetsEqual(m, markup)).length;
    if (countCol === markup.size) {
        for (let r = 0; r < 9; r++) {
            if (r !== row && !isSetsEqual(markups[r][col], markup)) {
                for (let value of markup) {
                    if (markups[r][col].has(value)) {
                        markups[r][col].delete(value);
                        changesMade++;
                    }
                }
            }
        }
    }

    // Subgrid preemptive sets
    // Find number of cells in the subgrid with the same markup set as the current cell.
    const subgridRow = Math.floor(row / 3) * 3;
    const subgridCol = Math.floor(col / 3) * 3;
    const countSubgrid = [];
    for (let r = subgridRow; r < subgridRow + 3; r++) {
        for (let c = subgridCol; c < subgridCol + 3; c++) {
            countSubgrid.push(markups[r][c]);
        }
    }
    const countBox = countSubgrid.filter(m => isSetsEqual(m, markup)).length;
    if (countBox === markup.size) {
        for (let r = subgridRow; r < subgridRow + 3; r++) {
            for (let c = subgridCol; c < subgridCol + 3; c++) {
                if ((r !== row || c !== col) && !isSetsEqual(markups[r][c], markup)) {
                    for (let value of markup) {
                        if (markups[r][c].has(value)) {
                            markups[r][c].delete(value);
                            changesMade++;
                        }
                    }
                }
            }
        }
    }

    return [markups, changesMade];
}

// Get all possible candidates for a cell in the grid.
function getCandidates(grid: GridCell[][], row: number, col: number): number[] {
    const candidates = [];
    for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {
            candidates.push(num);
        }
    }
    return candidates;
}

// Generate all valid POM (Pattern Overlay Method) patterns for a given digit (1-9) across the grid.
// A POM pattern is a possible configuration for all instances a single digit that does not violate the Sudoku rule.
// For example, a POM pattern for digit 1 in a 3x3 subgrid would be:

// Function to generate valid patterns for a given digit, considering pre-filled cells
function generateValidPatterns(grid: GridCell[][], digit: ValidDigit): Uint8Array[] {

    const emptyCells = findEmptyCells(grid);  // Find the empty cells in the grid
    const validPatterns: Uint8Array[] = [];

    const numDigits = 9 - countExistingDigits(grid, digit);  // Count how many times the digit already appears
    if (numDigits === 0) return validPatterns;

    const combinations = getCombinations(emptyCells, numDigits);
    for (const combination of combinations) {
        if (isValidPattern(grid, combination, digit)) {
            const bitmask = createBitmask();
            for (const { row, col } of combination) {
                setBit(bitmask, row * 9 + col);
            }
            validPatterns.push(bitmask);
        }
    }

    return validPatterns;
}

// Helper function to count how many times a digit already appears in the grid
function countExistingDigits(grid: GridCell[][], digit: ValidDigit): number {
    let count = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value === digit) {
                count++;
            }
        }
    }
    return count;
}

// Helper function to check if a digit can be placed in a given combination of empty cells
function isValidPattern(grid: GridCell[][], combination: Position[], digit: ValidDigit): boolean {

    const bitmask = createBitmask();
    const [rowMasks, colMasks, subgridMasks] = createMasks(grid);

    for (const { row, col } of combination) {
        const bit = 1 << (digit - 1);
        if ((rowMasks[row] & bit) || (colMasks[col] & bit) || (subgridMasks[Math.floor(row / 3) * 3 + Math.floor(col / 3)] & bit)) {
            return false;
        }
        setBit(bitmask, row * 9 + col);
    }

    return true;
}

// Helper function to create the masks for the row, column, and subgrid
function createMasks(grid: GridCell[][]): [Bit[], Bit[], Bit[]] {
    const rowMasks: Bit[] = Array.from({ length: 9 }, () => 0);
    const colMasks: Bit[] = Array.from({ length: 9 }, () => 0);
    const subgridMasks: Bit[] = Array.from({ length: 9 }, () => 0);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = grid[r][c];
            if (isValidDigit(cell.value)) {
                const bit = 1 << (cell.value - 1);
                rowMasks[r] |= bit;
                colMasks[c] |= bit;
                const subgridIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
                subgridMasks[subgridIndex] |= bit;
            }
        }
    }

    return [rowMasks, colMasks, subgridMasks];
}


// Helper function to create a random grid filled with remaining empty cells
function createRandomGrid(grid: GridCell[][]): GridCell[][] {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));  // Copy the grid to avoid mutation

    // Iterate over each subgrid and fill empty cells with random remaining values
    const subgridCells = Array.from({ length: 9 }, (_, index) => {
        const subgridRowStart = Math.floor(index / 3) * 3;
        const subgridColStart = (index % 3) * 3;
        const subgrid = [];

        // Collect all the cells in this subgrid
        for (let r = subgridRowStart; r < subgridRowStart + 3; r++) {
            for (let c = subgridColStart; c < subgridColStart + 3; c++) {
                subgrid.push({ row: r, col: c });
            }
        }
        return subgrid;
    });

    // For each subgrid, find the missing values and assign them to empty cells
    for (const subgrid of subgridCells) {
        // Get the values already present in this subgrid
        const presentValues = new Set<number>();
        for (const { row, col } of subgrid) {
            const cellValue = newGrid[row][col].value;
            if (cellValue !== null) presentValues.add(cellValue);
        }

        // Calculate the remaining values for this subgrid (1-9 minus the present values)
        const remainingValues = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(value => !presentValues.has(value));

        // Get the empty cells in this subgrid
        const emptySubgridCells = subgrid.filter(({ row, col }) => newGrid[row][col].value === null);

        // Randomly assign the remaining values to the empty cells
        for (let i = 0; i < emptySubgridCells.length; i++) {
            const { row, col } = emptySubgridCells[i];
            const randomIndex = Math.floor(Math.random() * remainingValues.length);
            newGrid[row][col].value = remainingValues.splice(randomIndex, 1)[0] as ValidDigit;  // Assign the value and remove it from the list
        }
    }

    return newGrid;
}

// Helper function to score a grid based on the how many unique digits are in each row, column, and subgrid
function calculateScore(grid: GridCell[][]): number {
    let score = 0;
    for (let i = 0; i < 9; i++) {
        score += scoreRow(grid, i);
        score += scoreColumn(grid, i);
    }
    return score;
}

// Helper function to score a row based on the number of unique digits
// With a perfect row, the score would be 0.
function scoreRow(grid: GridCell[][], row: number): number {
    const rowValues = grid[row].filter(cell => isValidDigit(cell.value)).map(cell => cell.value);
    return 9 - new Set(rowValues).size;
}

// Helper function to score a column based on the number of unique digits
// With a perfect column, the score would be 0.
function scoreColumn(grid: GridCell[][], col: number): number {
    const columnValues = grid.map(row => row[col]).filter(cell => isValidDigit(cell.value)).map(cell => cell.value);
    return 9 - new Set(columnValues).size;
}


// Helper function to randomly choose two user-filled cells to swap
function generateNeighbor(grid: GridCell[][]): GridCell[][] {

    // Randomly choose a subgrid
    const subgridIndex = Math.floor(Math.random() * 9);

    // Calculate the start row and column of the chosen subgrid
    const subgridRowStart = Math.floor(subgridIndex / 3) * 3;
    const subgridColStart = (subgridIndex % 3) * 3;

    // Find all user-filled cells within the selected subgrid
    const cellsSubgrid = [];
    for (let r = subgridRowStart; r < subgridRowStart + 3; r++) {
        for (let c = subgridColStart; c < subgridColStart + 3; c++) {
            if (grid[r][c].cellSource === 'USER') {
                cellsSubgrid.push({ row: r as ValidIndex, col: c as ValidIndex });
            }
        }
    }

    // Ensure there are at least two user-filled cells to swap
    if (cellsSubgrid.length < 2) return grid;

    // Choose two random user-filled cells from the subgrid
    const [idx1, idx2] = getTwoDistinctValues(cellsSubgrid.length);
    return swapCells(grid, cellsSubgrid[idx1], cellsSubgrid[idx2]);
}

// Helper function to swap two cells in the grid (used for shuffling)
function swapCells(grid: GridCell[][], cell1: Position, cell2: Position): GridCell[][] {

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    const temp = newGrid[cell1.row][cell1.col];
    newGrid[cell1.row][cell1.col] = newGrid[cell2.row][cell2.col];
    newGrid[cell2.row][cell2.col] = temp;

    return newGrid;
}

// Calculate the standard deviation of the score of 200 random grids
function calculateStandardDeviation(grid: GridCell[][]): number {
    const scores = [];
    for (let i = 0; i < 200; i++) {
        const randomGrid = createRandomGrid(grid);
        scores.push(calculateScore(randomGrid));
    }

    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const variance = scores.map(score => Math.pow(score - mean, 2))
        .reduce((a, b) => a + b) / (scores.length - 1); // Use (n-1) for sample variance
    return Math.sqrt(variance);
}

export {
    calculateScore,
    calculateStandardDeviation,
    createGrid,
    createMarkupGrid,
    createRandomGrid,
    verifyGrid,
    findEmptyCell,
    findEmptyCells,
    findPreemptiveSets,
    getCandidates,
    generateValidPatterns,
    generateNeighbor,
    isValid,
    isUniqueInRow,
    isUniqueInColumn,
    isUniqueInBox,
};
