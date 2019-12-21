import cloneColumns from "./clone-columns";
import { Color, AvailablePosition, kColLength } from "../lyfoe-types";

// determines what color can go into each column
export default function availablePositions(columns: Color[][]) {
    const cols = cloneColumns(columns);
    const columnsCount = cols.length;

    let availablePositions: AvailablePosition[] = [];

    // iterate through each column
    for (let colIndex = 0; colIndex < columnsCount; colIndex++) {
        const column = cols[colIndex];

        // iterate through each cell in a column
        for (let i = 0; i < kColLength; i++) {

            // empty column: bottom cell is blank
            if (i === 3 && column[i] === 'grey') {
                availablePositions.push(
                    {
                        position: {
                            col: colIndex,
                            index: i
                        },
                        color: 'grey'  // indicates any
                    }
                )
            } else if (
                i < 3 && column[i] === 'grey' && column[i + 1] !== 'grey'
            ) {
                availablePositions.push(
                    {
                        position: {
                            col: colIndex,
                            index: i
                        },
                        color: column[i + 1]
                    }
                )
            }
        }
    }

    return availablePositions;
}