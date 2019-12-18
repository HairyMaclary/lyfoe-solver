import { Color, Move } from "../lyfoe-types";
import cloneColumns from "./clone-columns";
import { isColumnLegal } from "./column-checks";

export function cloneMoves(moves: Move[]): Move[] {
    return JSON.parse(JSON.stringify(moves));
}

// ignore moves that would create an undo: prevent infinite loops
export function isMoveUndo(previousState: Color[][], futureState: Color[][]) {
    const prev = JSON.stringify(previousState);
    const future = JSON.stringify(futureState);
    return prev === future;
}

export function move(move: Move, columns: Color[][]): Color[][] {
    const cols = cloneColumns(columns);
    const colorToMove = cols[move.from.col][move.from.index];
    cols[move.from.col][move.from.index] = 'grey';
    cols[move.to.col][move.to.index] = colorToMove;

    const fromColLegal = isColumnLegal(cols[move.from.col]);
    const toColLegal = isColumnLegal(cols[move.to.col]);

    if (!fromColLegal || !toColLegal) {
        throw new Error('A move has made an illegal state');
    }
    return cols;
}