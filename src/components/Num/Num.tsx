import React from 'react';
import './Num.css';

import { ValidDigit } from '../../types/types';

type ValueMap = {
    [key in ValidDigit]: string;
}

const valueMap: ValueMap = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九'
}

interface NumProps {
    value: ValidDigit;
    selected: boolean;
    onClick: (value: ValidDigit) => void;
}

const Num: React.FC<NumProps> = ({ value, selected, onClick }) => {
    return (
        <button
            className={`num-button ${selected ? 'selected' : ''}`}
            onClick={() => onClick(value)}
        >
            {valueMap[value]}
        </button>
    );
};

export default Num;
