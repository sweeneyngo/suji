import React, { useState } from 'react';
import "./Encoder.css";
interface EncoderProps {
    onClick: (input: string) => void;
    onReverse: () => void;
}

const Encoder: React.FC<EncoderProps> = ({ onClick, onReverse }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(true);

    const handleInput = (input: string): void => {
        // Check if input is valid
        if (input.length !== 81) {
            setError(true);
            setInput(input);
            return;
        }

        // Check if input has only 0-9
        if (!input.match(/^[0-9]+$/)) {
            setError(true);
            setInput(input);
            return;
        }

        setError(false);
        setInput(input);
    }

    return (
        <div className="encoder">
            <input
                className="encoder-textbox"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Paste your Sudoku encoding here..."
            />
            <button className={`encoder-button ${error && 'encoder-disabled'}`} onClick={() => onClick(input)}>
                <svg height="16px" width="16px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 512 512" xmlSpace="preserve">
                    <g>
                        <path className="st0" d="M184.025,259.35h26.422c6.953,0,12.609,5.652,12.609,12.605v75.034c0,8.708,7.082,15.792,15.788,15.792h34.314
                            c8.706,0,15.786-7.084,15.786-15.792v-75.034c0-6.952,5.658-12.605,12.611-12.605h26.422c4.412,0,7.584-1.494,8.93-4.208
                            c1.347-2.71,0.619-6.141-2.046-9.658l-69.012-90.966c-2.591-3.412-6.089-5.295-9.85-5.295c-3.76,0-7.258,1.883-9.849,5.295
                            l-69.012,90.966c-2.667,3.517-3.393,6.949-2.046,9.658C176.439,257.856,179.613,259.35,184.025,259.35z"/>
                        <path className="st0" d="M256,0C114.842,0,0.002,114.84,0.002,256S114.842,512,256,512c141.158,0,255.998-114.84,255.998-256
                            S397.158,0,256,0z M256,66.785c104.334,0,189.216,84.879,189.216,189.215S360.334,445.215,256,445.215S66.783,360.336,66.783,256
                            S151.667,66.785,256,66.785z"/>
                    </g>
                </svg>
            </button>
            <button className={`encoder-button reverse`} onClick={() => onReverse()}>
                <svg height="16px" width="16px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 512 512" xmlSpace="preserve">
                    <g>
                        <path className="st0" d="M184.025,259.35h26.422c6.953,0,12.609,5.652,12.609,12.605v75.034c0,8.708,7.082,15.792,15.788,15.792h34.314
                            c8.706,0,15.786-7.084,15.786-15.792v-75.034c0-6.952,5.658-12.605,12.611-12.605h26.422c4.412,0,7.584-1.494,8.93-4.208
                            c1.347-2.71,0.619-6.141-2.046-9.658l-69.012-90.966c-2.591-3.412-6.089-5.295-9.85-5.295c-3.76,0-7.258,1.883-9.849,5.295
                            l-69.012,90.966c-2.667,3.517-3.393,6.949-2.046,9.658C176.439,257.856,179.613,259.35,184.025,259.35z"/>
                        <path className="st0" d="M256,0C114.842,0,0.002,114.84,0.002,256S114.842,512,256,512c141.158,0,255.998-114.84,255.998-256
                            S397.158,0,256,0z M256,66.785c104.334,0,189.216,84.879,189.216,189.215S360.334,445.215,256,445.215S66.783,360.336,66.783,256
                            S151.667,66.785,256,66.785z"/>
                    </g>
                </svg>
            </button>
        </div>

    );
};

export default Encoder;
