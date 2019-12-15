import { observable, action } from 'mobx';
import { cloneMoves } from './play-back-model';
import { Color, Move, AvailablePosition, Position, kColLength } from './lyfoe-types';
import topPostionInColumn from './utils/top-position';
import cloneColumns from './utils/clone-columns';
import availablePositions from './utils/available-positions';

// const kColLength = 4;

export const kGameWon = 'GAME_SOLVED';

export class LyfoeModel {

    @observable
    columns: Color[][] = [[]];
    
    @observable
    gameWon: boolean = false;

    @observable
    unsolvable = false;

    columnsCount: number = 0;
    winningPath: Move[] = []; // reverse listing of steps to win
    history: string[] = []; // all previous move/state combos

    //debugging: limit memory usuage by capping solve calls
    maxIteration = 50;
    iterationCount = 0;

    constructor(
        columns: Color[][]   //= new Array(columns.length)
    ) {
        this.columnsCount = columns.length;
        this.setAllColumns(columns);
    };

    @action
    setColumn(index: number, newCol: Color[]) {
        this.columns[index] = [...newCol];
        try {
            this.isColumnLegal(this.columns[index]);
        } catch (e) {
            const errMsg = `Illegal Col. Index: ${index}. ` + e.message;
            throw new Error(errMsg);
        }

    }

    private isColsCountCorrect(cols: Color[][]) {
        if (cols.length !== this.columnsCount) {
            throw new Error('Columns count is not correct');
        }
    }

    setAllColumns(newCols: Color[][]) {
        this.isColsCountCorrect(newCols);

        newCols.forEach((newCol, index) => {
            this.setColumn(index, newCol)
        });
    }

    isColAllSame(column: Color[]) {
        let topColor = column[0];

        for (let i = 1; i < kColLength; i++) {
            if (column[i] !== topColor) return false
        }

        return true;
    }

    isColBlank(col: Color[]) {
        return col.every(color => color === 'grey')
    }

    isGameComplete(gameState: Color[][]): boolean {
        // let isGameComplete = true;
        for (let i = 0; i < gameState.length; i++) {

            // a blank column should count towards a game win
            const isColBlank = this.isColBlank(gameState[i]);
            if (!isColBlank) {
                const isColAllSame = this.isColAllSame(gameState[i]);
                if (!isColAllSame) {
                    // isGameComplete = false;
                    // break;
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Columns should not have a blank below a color
     */
    isColumnLegal(col: Color[]) {
        let legal = true;

        if (col.length !== kColLength) {
            legal = false;
            throw new Error('incorrect col length');
        }

        let isNonBlankHit = false;

        col.forEach(color => {
            if (color !== 'grey') {
                isNonBlankHit = true;

                if (typeof color !== 'string') {
                    legal = false;
                    throw new Error('array element not of type string')
                }

                // we have a blank. It should not be below non-blank
            } else {
                if (isNonBlankHit) {
                    legal = false;
                    throw new Error('Blank under a color');
                }
            }
        });

        return legal;
    }

    // if the top color in a column matches the color that
    // can be received in another column (available positions)
    // then this method will generate a possible move 
    possibleMoves(
        columns: Color[][],
        availablePositions: AvailablePosition[]): Move[] {

        const cols = cloneColumns(columns);

        const moves: Move[] = [];

        // skip along the top of each col and see if there is
        // a match in available positions

        for (
            let colIndex = 0;
            colIndex < this.columnsCount;
            colIndex++
        ) {
            const column = cols[colIndex];
            const topIndex = topPostionInColumn(column);
            const topColor = column[topIndex];

            // empty column so nothing to move out
            if (topColor === 'grey') continue;

            // if a column is complete dont let anything move out
            if(topIndex === 0 && this.isColAllSame(cols[colIndex])) continue;

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

    // ignore moves that would create an undo: prevent infinite loops
    isMoveUndo(previousState: Color[][], futureState: Color[][]) {
        const prev = JSON.stringify(previousState);
        const future = JSON.stringify(futureState);
        return prev === future;
    }

    isMoveRepeat(move: Move, state: Color[][]) {
        const snapshot = JSON.stringify({move, state});
        if(this.history.includes(snapshot) ) {
            return true;
        } else {
            this.history.push(snapshot);
            return false;
        };
    }

    move( move: Move, columns: Color[][]): Color[][] {
        const cols = cloneColumns(columns);
        const colorToMove = cols[move.from.col][move.from.index];
        cols[move.from.col][move.from.index] = 'grey';
        cols[move.to.col][move.to.index] = colorToMove;

        const fromColLegal =  this.isColumnLegal(cols[move.from.col]);
        const toColLegal =  this.isColumnLegal(cols[move.to.col]);
  
        if(!fromColLegal || !toColLegal) {
            throw new Error('A move has made an illegal state');
        }
        return cols;
    }

    startNew() {
        // check to see that the game is already won
        this.gameWon = this.isGameComplete(this.columns);
        
        if(!this.gameWon) {
            this.solve(this.columns);
        } else {
            return kGameWon;
        }
        
        if (!this.gameWon) this.unsolvable = true;
        else return kGameWon;
    }

    solve(gameState: Color[][]) {

        if(this.iterationCount >= this.maxIteration) {
            return;
        } else {
            this.iterationCount++;
        }

        const holesToFill = availablePositions(gameState);

        // what if there are no holes to fill? Does this break?
        const moves = this.possibleMoves(gameState, holesToFill);

        // no moves available so do nothing
        if (moves.length === 0) return 'NO_MOVES';

        for (let i = 0; i < moves.length; i++) {

            // make the move
            const newState = this.move(moves[i], gameState);

            // if the move is just an undo then ignore it
            if(this.isMoveUndo(gameState, newState)) {
                continue;
            }

            // if this move, with this state has already been tried then ignore
            if(this.isMoveRepeat(moves[i], newState)) {
                continue;
            }

            // test if the new state is a win
            if (!this.gameWon) {
                this.gameWon = this.isGameComplete(newState);
            }

            if (!this.gameWon) {
                this.solve(newState);
            } 
            
            // possible returned back from a recursion. If somewhere up the chain caused a win, we need to recording this move as part of the solution
            if(this.gameWon) {
                this.winningPath.push(moves[i]);
                
                //do not go and add any other moves as part of the winning path
                break;
            }
        }
    }
}

