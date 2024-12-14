import React, { useState, useRef } from 'react';
import Encoder from '../Encoder/Encoder';
import Grid from '../Grid/Grid';
import Num from '../Num/Num';
import Toolbar from '../Toolbar/Toolbar';
import Notification from '../Notification/Notification';

import { GridCell, ValidDigit, Position, UserMode, ValidIndex, CellSelect } from '../../types/types';
import { createGrid, verifyGrid} from '../../utils/cells';
import { solveBacktracking, solveBacktrackingSorted, solveCandidateChecking, solvePlaceFinding, solveCrooksAlgorithm, solveSimulatedAnnealing, solvePatternMatching } from '../../utils/solver';
import { importGrid, exportGrid } from '../../utils/strings';

type Num = {
    value: ValidDigit;
    selected: boolean;
};

const Board: React.FC = () => {

    // Ref for the Sudoku solver
    const solverRef = useRef<Generator<GridCell[][]> | null>(null);

    // State for algorithm
    const [algorithm, setAlgorithm] = useState<string>('BT');

    // State for the user mode (select, draw, erase)
    const [mode, setMode] = useState<UserMode>('SELECT');

    // State for the 9x9 grid
    const [grid, setGrid] = useState<GridCell[][]>(createGrid());

    // State for the nums 1-9
    const [nums, setNums] = useState<Num[]>([
        { value: 1, selected: false },
        { value: 2, selected: false },
        { value: 3, selected: false },
        { value: 4, selected: false },
        { value: 5, selected: false },
        { value: 6, selected: false },
        { value: 7, selected: false },
        { value: 8, selected: false },
        { value: 9, selected: false }
    ]);

    // State for number of drawn cells
    const [numCells, setNumCells] = useState<number>(0);

    // State for notification
    const [notify, setNotify] = useState<{ message: string, duration: number, visible: boolean, timestamp: number } | null>(null);

    // When a cell is clicked, check if a number is selected and update the grid at index.
    const handleClickGridCell = (position: Position): void => {

        const selectedNum = nums.find((num) => num.selected);
        const { row, col } = position;

        if (mode === 'SELECT' && grid[row][col].value) {
            setGrid(updateSelectCell(grid, position));
        }
        if (mode === 'DRAW' && selectedNum) {
            setGrid(updateDrawCell(grid, position, selectedNum.value));
        }
    };

    // When a number is clicked, only that number should be selected.
    const handleClickNumber = (value: ValidDigit): void => {

        const newNums = [...nums];
        newNums.map((num) => {
            if (num.value !== value) num.selected = false;
        });

        const index = value - 1 as ValidIndex;

        if (newNums[index].selected) {
            newNums[index].selected = false;
            setMode('SELECT');
        } else {
            newNums[index].selected = true;
            setGrid(clearAllHighlights(grid));
            setMode('DRAW');
        }

        setNums(newNums);
    };

    const handleEncoding = (): void => {

        const encoding = exportGrid(grid);

        // Save to clipboard
        navigator.clipboard.writeText(encoding).then(() => {
            console.debug('Encoding copied to clipboard');
        }, (err) => {
            console.error('Failed to copy encoding to clipboard', err);
        });

        showClipboardNotification();
    }

    // When the encoding is pasted, update the grid.
    const handleDecoding = (value: string): void => {

        const newGrid = importGrid(value);
        const cells = newGrid.flat().filter((cell) => cell.value).length;

        setNumCells(cells);
        setGrid(newGrid);
    };

    // When the step button is clicked, solve the grid one step at a time.
    const handleStepSolver = (): void => {
        if (!solverRef.current) {
            solverRef.current = solve(grid, algorithm);
        }

        if (!solverRef.current) return;
        const { value, done } = solverRef.current.next();
        if (done) {
            solverRef.current = null;
        } else {
            setGrid(value);
        }
    };

    // When the play button is clicked, solve the grid.
    const handleSolver = async (): Promise<void> => {
        if (!solverRef.current) {
            solverRef.current = solve(grid, algorithm);
        }

        // Clear the notification if it's visible.
        setNotify(null);

        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        let iterations = 0;
        const startTime = Date.now();

        const step = async () => {
            if (!solverRef.current) return;
            const { value, done } = solverRef.current.next();
            if (done) {
                solverRef.current = null;
                const endTime = Date.now();
                const timeElapsed = (endTime - startTime);
                showNotification(timeElapsed, iterations);
                console.debug(`Time elapsed: ${timeElapsed}ms`);
                return;
            } else {

                // Deep copy the grid to avoid reference issues.
                const newGrid = value.map(row => row.map(cell => ({ ...cell })));

                // Check for errors
                const markedGrid = markInvalidCells(newGrid);

                setGrid(markedGrid);

                iterations++;
                await delay(100);
                await step();
            }
        };

        step();
    };

    const handleAlgorithm = (algo: string): void => {
        setAlgorithm(algo);
    };

    // HELPER: Update the grid at index with value when a cell is drawn.
    const updateDrawCell = (grid: GridCell[][], position: Position, newValue: ValidDigit): GridCell[][] => {

        let newGrid = [...grid];
        const { row, col } = position;
        const targetCell = newGrid[row][col];

        // If the cell is a given cell, do not update.
        if (targetCell.cellSource === 'SOURCE') return newGrid;

        // If grid cell is already assigned the value, erase it.
        if (targetCell.value === newValue) {
            targetCell.value = null;
            targetCell.invalid = false;
            setNumCells(numCells - 1);
            return newGrid;
        }

        // Otherwise, assign the new value to the cell.
        targetCell.value = newValue;
        targetCell.cellSource = 'USER';
        setNumCells(numCells + 1);

        // Check if grid completes.
        if (numCells === 80 && verifyGrid(newGrid)) {
            alert('Sudoku complete!');
            return newGrid;
        }

        // Check if the cell is invalid.
        if (isInvalidCell(newGrid, position)) targetCell.invalid = true;

        return newGrid;
    }

    // HELPER: Update the grid when a cell is selected.
    const updateSelectCell = (grid: GridCell[][], position: Position): GridCell[][] => {

        let newGrid = [...grid];
        const { row, col } = position;
        const targetCell = grid[row][col];

        // When deselecting a cell, return the grid with no highlights.
        if (targetCell.cellSelect === 'SELECTED') return clearAllHighlights(newGrid);

        newGrid = clearAllHighlights(newGrid);
        newGrid = markNeighborCells(newGrid, targetCell, position);
        newGrid = markSameCells(newGrid, targetCell);
        newGrid[row][col] = setSelect(targetCell, 'SELECTED');

        return newGrid;
    }


    // HELPER: Clear all selected cells and marked values.
    const clearAllHighlights = (grid: GridCell[][]): GridCell[][] => {
        return grid.map((row) => row.map((cell) => ({
            ...cell,
            cellSelect: 'NONE'
        })));
    }

    // HELPER: Mark all cells with the same value.
    const markSameCells = (grid: GridCell[][], targetCell: GridCell): GridCell[][] => {
        return grid.map((row) => row.map((cell) => {
            if (cell === targetCell || cell.invalid) return cell;
            if (cell.value === targetCell.value) return setSelect(cell, 'SAME_VALUE');
            return cell;
        }));
    }

    // HELPER: Mark all neighboring cells.
    // If a cell has the same value as the target cell, ignore (since it's already invalid).
    const markNeighborCells = (grid: GridCell[][], targetCell: GridCell, position: Position): GridCell[][] => {
        const newGrid = [...grid];
        const { row, col } = position;

        // Mark all cells in the same row.
        newGrid[row] = newGrid[row].map((cell) => {
            if (cell === targetCell || cell.invalid) return cell;
            if (cell.value === targetCell.value) return setSelect(cell, 'NONE');
            return setSelect(cell, 'NEIGHBOR');
        });

        // Mark all cells in the same column.
        newGrid.forEach((r) => {
            if (r[col] === targetCell || r[col].invalid) return;
            if (r[col].value === targetCell.value) r[col] = setSelect(r[col], 'NONE');
            else r[col] = setSelect(r[col], 'NEIGHBOR');
        });

        // Mark all cells in the same subgrid.
        const subgridRow = Math.floor(row / 3) * 3;
        const subgridCol = Math.floor(col / 3) * 3;
        for (let r = subgridRow; r < subgridRow + 3; r++) {
            for (let c = subgridCol; c < subgridCol + 3; c++) {
                if (newGrid[r][c] === targetCell || newGrid[r][c].invalid) continue;
                if (newGrid[r][c].value === targetCell.value) newGrid[r][c] = setSelect(newGrid[r][c], 'NONE');
                else newGrid[r][c] = setSelect(newGrid[r][c], 'NEIGHBOR');
            }
        }

        return newGrid;
    }

    // HELPER: Mark all cells with errors.
    const markInvalidCells = (grid: GridCell[][]): GridCell[][] => {

        // Deep copy the grid to avoid reference issues.
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

        // If a cell isn't unique in its row, column, or subgrid, mark it as invalid.
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (newGrid[row][col].value &&
                    isInvalidCell(newGrid, { row: row as ValidIndex, col: col as ValidIndex }) &&
                    newGrid[row][col].cellSource === 'USER') {
                    newGrid[row][col].invalid = true;
                }
                else {
                    newGrid[row][col].invalid = false;
                }
            }
        }

        return newGrid;
    }

    // HELPER: Check if cell is invalid.
    const isInvalidCell = (grid: GridCell[][], position: Position): boolean => {
        const newGrid = [...grid];
        const { row, col } = position;
        const targetCell = newGrid[row][col];

        // Check the row, column, and 3x3 subgrid
        for (let i = 0; i < 9; i++) {
            if (newGrid[row][i].value === targetCell.value && i !== col) return true;
            if (newGrid[i][col].value === targetCell.value && i !== row) return true;
        }

        const subgridRow = Math.floor(row / 3) * 3;
        const subgridCol = Math.floor(col / 3) * 3;
        for (let r = subgridRow; r < subgridRow + 3; r++) {
            for (let c = subgridCol; c < subgridCol + 3; c++) {
                if (newGrid[r][c].value === targetCell.value && r !== row && c !== col) return true;
            }
        }

        return false;
    }

    // HELPER: Set the notification state based on flag.
    const setSelect = (cell: GridCell, flag: CellSelect): GridCell => {

        switch (flag) {
            case 'SELECTED':
                return { ...cell, cellSelect: 'SELECTED' };
            case 'SAME_VALUE':
                return { ...cell, cellSelect: 'SAME_VALUE' };
            case 'NEIGHBOR':
                return { ...cell, cellSelect: 'NEIGHBOR' };
            default:
                return cell;
        }
    };

    // HELPER: Show the notification.
    const showNotification = (timeElapsed: number, iterations: number): void => {
        setNotify({
            message: `Finished in ${iterations} steps (${timeElapsed/1000}s)`,
            duration: 5000,
            visible: true,
            timestamp: Date.now()
        });
    };

    // HELPER: Show clipboard notification.
    const showClipboardNotification = (): void => {
        setNotify({
            message: 'Sudoku grid copied to clipboard!',
            duration: 3000,
            visible: true,
            timestamp: Date.now()
        });
    };

    // HELPER: Switch to algorithm based on user selection.
    const solve = (grid: GridCell[][], algo: string): Generator<GridCell[][]> => {
        switch (algo) {
            case 'BT':
                return solveBacktracking(grid);
            case 'BTS':
                return solveBacktrackingSorted(grid);
            case 'CC':
                return solveCandidateChecking(grid);
            case 'PF':
                return solvePlaceFinding(grid);
            case 'CA':
                return solveCrooksAlgorithm(grid);
            case 'SA':
                return solveSimulatedAnnealing(grid);
            case 'PM':
                return solvePatternMatching(grid);
            default:
                return solveBacktracking(grid);
        };
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <Encoder onClick={handleDecoding} onReverse={handleEncoding}/>
            <Toolbar onStep={handleStepSolver} onPlay={handleSolver} onAlgorithmChange={handleAlgorithm}/>
            <Grid grid={grid} onClick={handleClickGridCell}/>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {Object.values(nums).map((num) => (
                    <Num
                        key={num.value}
                        value={num.value}
                        selected={num.selected}
                        onClick={handleClickNumber}
                    />
                ))}
            </div>
            {notify && <Notification message={notify.message} duration={notify.duration} />}
        </div>
    );
};

export default Board;
