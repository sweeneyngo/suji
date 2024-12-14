import { Digit, Empty, ValidDigit } from '../types/types'

function isValidDigit(value: Digit): value is ValidDigit {
    return value !== null && value >= 1 && value <= 9;
}

function isEmpty(value: Digit): value is Empty {
    return value === null;
}

export {
    isEmpty,
    isValidDigit
};
