import { Move } from "./lyfoe-model";

export interface IPlayBack {
    moves: Move[];
    currentIndex: number;
    nextMove: () => Move;
    previousMove: () => Move;
}

export function cloneMoves(moves: Move[]): Move[] {
    return JSON.parse(JSON.stringify(moves));
}

export class PlayBack implements IPlayBack {

    moves: Move[];
    currentIndex = 0;

    constructor(moves: Move[]) {
        this.moves = cloneMoves(moves).reverse();
    }

    nextMove() {
        const presentMove = this.moves[this.currentIndex];
        if(this.currentIndex < this.moves.length) this.currentIndex ++;
        return presentMove;
    }

    previousMove() {
        if(this.currentIndex > 0) this.currentIndex --;
        return this.moves[this.currentIndex];
    }
}