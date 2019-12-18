import { Color, Position, Move } from "../lyfoe-types";
import { cloneMoves } from "./moves";

/**
 *  Which column is it preferable to move to?
 * 
 *  eg, if a later column exists that already has multiple colors of the correct type then prefer it over a blank column.
 *   (Only re-ordering and not deleting. Don't want to miss anything).
 * @param moves 
 */
export default function reorderMoves(moves: Move[], cols: Color[][]) {
    const _moves = cloneMoves(moves);

    // for each move see if there are any moves with the same `to` location

    _moves.sort(
        (a, b) => {
            // first check they are the same 'from'. Moves are constructed in column order so there will not be a gap between similar 'froms' in the array.
            if (a.from.col === b.from.col) {
                if (a.from.index === b.from.index) { // should need this check; can only ever move the top color, but will use to log an error below

                    const aPriority = priority(a.to, cols);
                    const bPriority = priority(b.to, cols);

                    return bPriority - aPriority;
                } else {
                    console.error('cols match but index do not!');
                    return 0;
                }
            } else return 0;
        }
    );
    return _moves;
}

/**
* Priority based on the number of color matches below the insertion point. All colors must be the same.
* @param to 
* @param cols 
*/
function priority(to: Position, cols: Color[][]) {
    // the index for the color below the insertion point
    let index = to.index + 1;
    let colorMatchCount = 0;
    let inComingColor;

    if(index < 4) {
        inComingColor = cols[to.col][index];
    } else return colorMatchCount;

    while (index < 4) {
        if (inComingColor === cols[to.col][index]) {
            colorMatchCount++;
            index++;
        } else return 0; // if not all the same color
    }
    return colorMatchCount;
}
