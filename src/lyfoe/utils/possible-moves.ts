import { Color, AvailablePosition, Move } from "../lyfoe-types";
import cloneColumns from "./clone-columns";
import topPostionInColumn from "./top-position";
import { isColAllSame } from "./column-checks";

// if the top color in a column matches the color that
    // can be received in another column (available positions)
    // then this method will generate a possible move 
    export default function possibleMoves(
        columns: Color[][],
        availablePositions: AvailablePosition[]): Move[] {

        const cols = cloneColumns(columns);

        const moves: Move[] = [];

        // skip along the top of each col and see if there is
        // a match in available positions

        for (
            let colIndex = 0;
            colIndex < cols.length;
            colIndex++
        ) {
            const column = cols[colIndex];
            const topIndex = topPostionInColumn(column);
            const topColor = column[topIndex];

            // empty column so nothing to move out
            if (topColor === 'grey') continue;

            // if a column is complete dont let anything move out
            if(topIndex === 0 && isColAllSame(cols[colIndex])) continue;

            //if a column already has 3 matching colors then dont move out
            if(topIndex === 1 && isColAllSame(cols[colIndex], 1)) continue;

            // have already tested that available positions exist
            const colorMatchedPossibilities = availablePositions.filter(possible => {
                
                // no point in moving in place
                if (colIndex === possible.position.col) return false;

                // anything can move to a bottom blank
                if (possible.color === 'grey') return true;

                // or else there must be a color match
                else if (possible.color === topColor) return true;

                else return false
            });

            if (colorMatchedPossibilities) {
                colorMatchedPossibilities.forEach(
                    possible => {
                        moves.push(
                            {
                                from:
                                {
                                    col: colIndex,
                                    index: topIndex
                                },
                                to:
                                {
                                    col: possible.position.col,
                                    index: possible.position.index
                                },
                            }
                        )
                    }
                )
            }
        }

        // change the order of moves if a better move exists.
        return moves;
        // return this.reorderMoves(moves);
    }