import { GridCell, Digit, ValidDigit } from '../types/types';

// Export grid to parseable string format
function exportGrid(grid: GridCell[][]): string {
    return grid.flat().map((cell) => (cell.value ? cell.value : '0')).join('');
}

// Import grid from parseable string format to 2D grid
function importGrid(gridString: string): GridCell[][] {
    const flatArr: Digit[] = gridString.split('').map((char) => (char === '0' ? null : parseInt(char, 10) as ValidDigit));
    const newGrid: GridCell[][] = [];
    for (let i = 0; i < 9; i++) {
        newGrid.push(flatArr.slice(i * 9, i * 9 + 9).map((value) => {

            if (value === null) {
                return {
                    value: null,
                    invalid: false,
                    cellSource: 'USER',
                    cellSelect: 'NONE'
                };
            }

            return {
                value,
                invalid: false,
                cellSource: 'SOURCE',
                cellSelect: 'NONE'
            };
        }));
    }
    return newGrid;
}

export { exportGrid, importGrid };
