import { GridCell, Position } from "../../types/types";
import { convertIndexToPosition } from "../../utils/math";
import "./Grid.css";

interface GridProps {
    grid: GridCell[][];
    onClick: (position: Position) => void;
}

const Grid: React.FC<GridProps> = ({ grid, onClick }) => {

    // Determine the class name for each cell based on the cell properties
    return (
        <div className="sudoku-grid">
            {grid.flat().map((cell, index) => {
                return (
                    <div
                        key={index}
                        className={`sudoku-cell
                            ${cell.invalid ? "cell-invalid" : ""}
                            ${cell.cellSource === "USER" ? "cell-user" : "cell-source"}
                            ${cell.cellSelect === "SELECTED" ? "cell-selected" : ""}
                            ${cell.cellSelect === "SAME_VALUE" ? "cell-same-value" : ""}
                            ${cell.cellSelect === "NEIGHBOR" ? "cell-neighbor" : ""}
                        `}
                        onClick={() => onClick(convertIndexToPosition(index))}
                    >
                        {cell.value}
                    </div>
                );
            })}
        </div>
    );
};

export default Grid;
