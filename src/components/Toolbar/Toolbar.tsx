import React from 'react';
import './Toolbar.css'; // Assuming you have some CSS for styling

interface ToolbarProps {
    onStep: () => void;
    onPlay: () => void;
    onAlgorithmChange: (algorithm: string) => void;
}
const Toolbar: React.FC<ToolbarProps> = ({onStep, onPlay, onAlgorithmChange}) => {
    return (
        <div className="toolbar">
            <button className="toolbar-button" onClick={() => onStep()}>
                <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="12px" height="12px" viewBox="0 0 163.861 163.861"
                    xmlSpace="preserve">
                    <g>
                        <path d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275
		                c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z"/>
                    </g>
                </svg>
            </button>
            <button className="toolbar-button" onClick={() => onPlay()}>
                <svg fill="#000000" width="14px" height="14px" viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <path className="clr-i-solid clr-i-solid-path-1" d="M5,31.9a2,2,0,0,1-2-2V5.44A2,2,0,0,1,6.12,3.81L23.18,16a2,2,0,0,1,0,3.25h0L6.12,31.52A2,2,0,0,1,5,31.9Z"></path><rect className="clr-i-solid clr-i-solid-path-2" x="25.95" y="3.67" width="7" height="28" rx="2" ry="2"></rect>
                    <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
                </svg>
            </button>
            <select className="toolbar-dropdown" onChange={(e) => onAlgorithmChange(e.target.value)}>
                <option value="BT">Backtracking</option>
                <option value="BTS">Backtracking (sorted)</option>
                <option value="CC">Candidate-checking </option>
                <option value="PF">Place-finding (Naked Singles)</option>
                <option value="CA">Crook's Algorithm</option>
                <option value="SA">Simulated Annealing</option>
                <option value="PM">Pattern Matching</option>
            </select>
        </div>
    );
};

export default Toolbar;
