import { GridCell, ValidDigit } from '../types/types';
import { isBitSet } from './bit';
import {
    calculateScore,
    calculateStandardDeviation,
    findEmptyCell,
    findEmptyCells,
    findPreemptiveSets,
    getCandidates,
    generateNeighbor,
    generateValidPatterns,
    createRandomGrid,
    isValid,
    isUniqueInRow,
    isUniqueInColumn,
    isUniqueInBox,
    verifyGrid,
    createMarkupGrid
} from './cells';

function* solveBacktracking(grid: GridCell[][]): Generator<GridCell[][]> {

    const emptyCell = findEmptyCell(grid);
    if (!emptyCell) return true;
    const { row, col } = emptyCell;

    for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {

            const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
            newGrid[row][col].value = num as ValidDigit;
            yield newGrid;

            const result = yield* solveBacktracking(newGrid);
            if (result) return true;
        }
    }
    return false;
}

function* solveBacktrackingSorted(grid: GridCell[][]): Generator<GridCell[][]> {

    // Find all empty cells
    const emptyCells = findEmptyCells(grid);
    if (emptyCells.length === 0) return true;

    // Sort empty cells by number of possible candidates (least number of candidates first)
    const sortedEmptyCells = emptyCells.sort((a, b) => {
        const aCandidates = getCandidates(grid, a.row, a.col).length;
        const bCandidates = getCandidates(grid, b.row, b.col).length;
        return aCandidates - bCandidates;
    });

    // Take the first empty cell with the fewest possible candidates
    const { row, col } = sortedEmptyCells[0];

    for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {

            const newGrid = grid.map(row => row.map(cell => ({ ...cell })));  // Clone the grid
            newGrid[row][col].value = num as ValidDigit;
            yield newGrid;

            const result = yield* solveBacktrackingSorted(newGrid);
            if (result) return true;
        }
    }
    return false;
}

function* solveCandidateChecking(grid: GridCell[][]): Generator<GridCell[][]> {

    const emptyCells = findEmptyCells(grid);
    if (emptyCells.length === 0) return true;
    let progressMade = false;

    for (let i = 0; i < emptyCells.length; i++) {
        const { row, col } = emptyCells[i];
        const candidates = getCandidates(grid, row, col);

        // If there's only one candidate, it's a naked single
        if (candidates.length === 1) {
            const value = candidates[0];

            const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
            newGrid[row][col].value = value as ValidDigit;
            yield newGrid;

            const result = yield* solveCandidateChecking(newGrid);
            if (result) return true;
            progressMade = true; // Track progress to break the loop later
        }
    }
    // If no progress was made in this iteration, backtrack.
    if (!progressMade) {
    }
    return false;
}

function* solvePlaceFinding(grid: GridCell[][]): Generator<GridCell[][]> {

    const emptyCells = findEmptyCells(grid);
    if (emptyCells.length === 0) return true;

    for (let value = 1; value <= 9; value++) {
        for (let i = 0; i < emptyCells.length; i++) {
            const { row, col } = emptyCells[i];
            if (isValid(grid, row, col, value)) {
                if (isUniqueInRow(grid, row, col, value) ||
                    isUniqueInColumn(grid, row, col, value) ||
                    isUniqueInBox(grid, row, col, value)) {

                    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
                    newGrid[row][col].value = value as ValidDigit;
                    yield newGrid;

                    const result = yield* solvePlaceFinding(newGrid);
                    if (result) return true;
                }
            }
        }
    }
    return false;
}

function* solveCrooksAlgorithm(grid: GridCell[][]): Generator<GridCell[][]> {
    const markups = createMarkupGrid(grid);
    const solveCrooksRecursive = function* (grid: GridCell[][], markups: Set<number>[][]): Generator<GridCell[][]> {

        let progressMade = false;

        // Step 1: Apply Preemptive Sets (Naked pairs, Triples, etc.)
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const markup = markups[row][col];
                if (markup && markup.size > 1) {

                    const [newMarkups, changes] = findPreemptiveSets(markups, row, col);
                    markups[row][col] = newMarkups[row][col];

                    if (changes > 0) {
                        progressMade = true;
                        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
                        yield newGrid;
                    }
                }
            }
        }

        // Step 2: Naked Singles
        let newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        let newMarkups = markups.map(row => row.map(m => new Set(m)));

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const markup = markups[row][col];
                if (markup && markup.size === 1) {
                    const value = Array.from(markup)[0];

                    // Skip if the value is already set in the grid
                    if (grid[row][col].value !== value) {

                        newGrid[row][col].value = value as ValidDigit;
                        newMarkups[row][col].clear();

                        for (let r = 0; r < 9; r++) {
                            for (let c = 0; c < 9; c++) {
                                // Remove value from row, column, and box constraints
                                if (r === row || c === col || (Math.floor(row / 3) === Math.floor(r / 3) && Math.floor(col / 3) === Math.floor(c / 3))) {
                                    newMarkups[r][c].delete(value);
                                }
                            }
                        }

                        progressMade = true;
                        yield newGrid;
                    }
                }
            }
        }

        if (!progressMade) {
            return;
        }

        yield* solveCrooksRecursive(newGrid, newMarkups);
    }

    // Start the recursive solving process
    yield* solveCrooksRecursive(grid, markups);

    // Check if the grid is solved
    return grid.every(row => row.every(cell => cell.value !== null));
}

function* solveSimulatedAnnealing(grid: GridCell[][]): Generator<GridCell[][]> {
    let currentGrid = createRandomGrid(grid);
    const std = calculateStandardDeviation(grid);
    const currentScore = calculateScore(createRandomGrid(grid));

    const initialTemperature = std;
    const coolingRate = 0.99;
    const maxIterations = 1000;

    const temperature = initialTemperature;
    const iteration = 0;

    const result = yield* solveSimulatedAnnealingRecursive(
        grid,
        currentGrid,
        currentScore,
        temperature,
        iteration,
        initialTemperature,
        coolingRate,
        maxIterations
    );

    if (result) return result;
}

function* solveSimulatedAnnealingRecursive(
    grid: GridCell[][],
    currentGrid: GridCell[][],
    currentScore: number,
    temperature: number,
    iteration: number,
    initialTemperature: number = 1.0,
    coolingRate: number = 0.99999,
    maxIterations: number = 1000
): Generator<GridCell[][]> {

    // Base case: stop when max iterations or the score reaches 0
    if (iteration >= maxIterations || currentScore === 0) {
        if (currentScore === 0) {
            return currentGrid; // Puzzle solved, return the grid
        }
        return null; // Maximum iterations reached without solving
    }

    if (iteration % 20 === 0) {
        console.debug('Iteration:', iteration, 'Score:', currentScore, 'Temperature:', temperature);
    }

    // Generate a neighboring state by swapping two random elements
    const neighborGrid = generateNeighbor(currentGrid);
    const neighborScore = calculateScore(neighborGrid);

    // Calculate the score difference and acceptance probability
    const scoreDifference = neighborScore - currentScore;
    const acceptanceProbability = Math.exp(-scoreDifference / temperature);

    // Accept the new state with a certain probability
    let nextGrid = currentGrid;
    let nextScore = currentScore;
    if (scoreDifference < 0 || Math.random() < acceptanceProbability) {
        nextGrid = neighborGrid;
        nextScore = neighborScore;
    }

    // Cool the temperature
    const nextTemperature = temperature * coolingRate;

    // Yield the current state (grid) at this step
    yield nextGrid;

    // Recurse with updated values: next grid, score, temperature, and iteration
    yield* solveSimulatedAnnealingRecursive(
        grid,
        nextGrid,
        nextScore,
        nextTemperature,
        iteration + 1,
        initialTemperature,
        coolingRate,
        maxIterations
    );
}

function* solvePatternMatching(grid: GridCell[][]): Generator<GridCell[][]> {

    const emptyCell = findEmptyCell(grid);
    if (!emptyCell) return true;

    for (let num = 1; num <= 9; num++) {
        const validPatterns = generateValidPatterns(grid, num as ValidDigit);

        // Try each valid pattern (bitmask) for each digit
        for (const bitmask of validPatterns) {
            const newGrid = grid.map(r => r.map(cell => ({ ...cell })));

            for (let i = 0; i < 81; i++) {
                const row = Math.floor(i / 9);
                const col = i % 9;

                if (isBitSet(bitmask, i)) {
                    newGrid[row][col].value = num as ValidDigit;
                }
            }

            if (verifyGrid(newGrid)) {
                yield newGrid;
                const result = yield* solvePatternMatching(newGrid);
                if (result) return true;
            }
        }
    }

    return false;
}

export {
    solveBacktracking,
    solveBacktrackingSorted,
    solveCandidateChecking,
    solvePlaceFinding,
    solveCrooksAlgorithm,
    solveSimulatedAnnealing,
    solvePatternMatching
};
