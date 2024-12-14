
import { Position, ValidIndex } from '../types/types';

const MAX_INDEX = 81;
function convertIndexToPosition(index: number): Position {

    if (index < 0 || index > MAX_INDEX-1) {
        throw new Error('Index out of bounds');
    }

    const row = Math.floor(index / 9) as ValidIndex;
    const col = index % 9 as ValidIndex;

    const pos: Position = { row, col };
    return pos;
}

// Generate all possible combinations of k elements from an array of n>k elements.
function getCombinations(arr: Position[], k: number): Position[][] {

    const result: Position[][] = [];
    const combination: Position[] = [];

    function backtrack(start: number) {
        if (combination.length === k) {
            result.push([...combination]);
            return;
        }

        for (let i = start; i < arr.length; i++) {
            combination.push(arr[i]);
            backtrack(i + 1);
            combination.pop();
        }
    }

    backtrack(0);
    return result;
}

// Create a bitmask from the combination of positions.
function createBitmask(combination: Position[]): number {
    let bitmask = 0;
    for (const pos of combination) {
        bitmask |= 1 << (pos.row * 9 + pos.col);
    }
    return bitmask;
}

// Compare two sets of equal matching values.
function isSetsEqual(setA: Set<number>, setB: Set<number>): boolean {
    if (setA.size !== setB.size) return false;
    for (let value of setA) {
        if (!setB.has(value)) return false;
    }
    return true;
}

function getTwoDistinctValues(length: number): [number, number] {
    const a = Math.floor(Math.random() * length);
    let b = Math.floor(Math.random() * length);
    while (a === b) {
        b = Math.floor(Math.random() * length);
    }
    return [a, b];
}

export {
    convertIndexToPosition,
    getCombinations,
    createBitmask,
    isSetsEqual,
    getTwoDistinctValues
};
