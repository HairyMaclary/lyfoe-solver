import { observable, action } from 'mobx';
import { Color, Move, history } from './lyfoe-types';
import availablePositions from './utils/available-positions';
import { isColBlank, isColAllSame, isColumnLegal } from './utils/column-checks';
import possibleMoves from './utils/possible-moves';
import { isMoveUndo, move } from './utils/moves';

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
    history: history = []; // all previous move/state combos

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
            isColumnLegal(this.columns[index]);
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

    isGameComplete(gameState: Color[][]): boolean {
        // let isGameComplete = true;
        for (let i = 0; i < gameState.length; i++) {

            // a blank column should count towards a game win
            const _isColBlank = isColBlank(gameState[i]);
            if (!_isColBlank) {
                const _isColAllSame = isColAllSame(gameState[i]);
                if (!_isColAllSame) {
                    // isGameComplete = false;
                    // break;
                    return false;
                }
            }
        }
        return true;
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
        const moves = possibleMoves(gameState, holesToFill);

        // no moves available so do nothing
        if (moves.length === 0) return 'NO_MOVES';

        for (let i = 0; i < moves.length; i++) {

            // make the move
            const newState = move(moves[i], gameState);

            // if the move is just an undo then ignore it
            if(isMoveUndo(gameState, newState)) {
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

