import React from 'react'
import { LyfoeModel, kGameWon } from './lyfoe-model';
import { observer } from 'mobx-react';
import './lyfoe.css';
import { PlayBack, IPlayBack } from './play-back-model';
import { observable, action } from 'mobx';
import { Move, Color } from './lyfoe-types';
import { move as _move} from './utils/moves';


@observer
export class Lyfoe extends React.Component {

    @observable
    colState: Color[][] = [

        // super hard
        ['lightgreen', 'pink', 'lightgreen',"lightblue"],
        ['lightgreen', 'green',"green", 'lightblue'],
        ['darkgrey', 'blue', 'pink', 'darkgreen'],
        ['lightblue', 'red', 'orange', 'aqua'],
        ['blue', 'white', 'purple', 'black'],
        ['yellow', 'orange', 'blue', 'red'],
        ['orange', 'aqua', 'white', 'purple'],
        ['black', 'pink', 'lightpink', 'orange'],
        ['darkgreen', 'white', 'blue', 'black'],
        ['pink', 'yellow', 'yellow', 'darkgreen'],
        ['aqua', 'purple', 'lightpink', 'lightblue'],
        ['yellow', 'green', 'purple', 'darkgrey'],
        ['darkgrey', 'aqua', 'darkgrey', 'lightgreen'],
        ['red', 'lightpink', 'darkgreen', 'black'],
        ['lightpink', 'green', 'white', 'red'],
        ['grey', 'grey', 'grey', 'grey'],
        ['grey', 'grey', 'grey', 'grey'],


        //mid-upper complexity
        // ['blue', 'red', 'red', 'green'],
        // ['pink', 'pink', 'yellow', 'red'],
        // ['yellow', 'blue', 'green', 'blue'],
        // ['green', 'yellow', 'red', 'yellow'],
        // ['blue', 'green', 'pink', 'pink'],
        // ['grey', 'grey', 'grey', 'grey'],
        // ['grey', 'grey', 'grey', 'grey'],

        // mid level real case
        // ['yellow', 'blue', 'yellow', 'red'],
        // ['blue', 'blue', 'red', 'red'],
        // ['yellow', 'yellow', 'red', 'blue'],
        // ['grey', 'grey', 'grey', 'grey'],
        // ['grey', 'grey', 'grey', 'grey'],
        
        // ['blue', 'green', 'blue', 'green'],
        // ['blue', 'green', 'blue', 'green'],
        // ['grey', 'grey', 'grey', 'grey'],
        // ['grey', 'grey', 'grey', 'grey'],
        // ['grey', 'pink', 'pink', 'pink'],
        // ['grey', 'grey', 'grey', 'pink'],


        // ["grey", "grey", "grey", "green"],
        // ["grey", "grey", "grey", "grey"],
        // ["blue", "blue", "blue", "blue"],
        // ["grey", "green", "green", "green"]
    ];

    columnCount = this.colState.length;
    game = new LyfoeModel(this.colState);
    playBackMachine: IPlayBack | undefined;
    isGameWon = this.game.gameWon;

    @observable
    forwardButtonEnabled = true;

    @observable
    reverseButtonEnabled = false;

    @observable
    result: string | null = null;

    @action
    startPlayBack() {
        this.playBackMachine = new PlayBack(this.game.winningPath);
    }

    @action
    move(move: Move) {
        this.colState = _move(move, this.colState);
    }

    disableCheck() {
        if (this.playBackMachine) {
            if (this.playBackMachine.currentIndex === this.game.winningPath.length) {
                this.forwardButtonEnabled = false;
            } else this.forwardButtonEnabled = true;

            if (this.playBackMachine.currentIndex === 0) {
                this.reverseButtonEnabled = false;
            } else this.reverseButtonEnabled = true;
        }
    }

    stepForward() {
        if (this.playBackMachine === undefined) {
            this.startPlayBack();
        }
        const nextMove = this.playBackMachine && this.playBackMachine.nextMove();
        nextMove && this.move(nextMove);
        this.disableCheck();
    }

    stepBack() {
        const forwardMove = this.playBackMachine && this.playBackMachine.previousMove();
        if (forwardMove) {
            const { from, to } = forwardMove;
            const nextMove = { from: to, to: from }
            this.move(nextMove)
        }
        this.disableCheck();
    }

    startSolve() {
        const result = this.game.startNew();
        if(typeof result === 'string') this.result = result;
    }

    render() {
        return (
            <div className='lyfoe'>
                <h1>Andrea's Lyfoe Solver</h1>
                <div className='buttonBar'>
                    <div className='lhs'>
                        <button
                            disabled={!!this.game.gameWon}
                            onClick={() => this.game.startNew()}>
                            Solve
                    </button>
                    </div>

                    <div className='rhs'>
                        <button
                            onClick={() => this.stepForward()}
                            disabled={!(this.game.gameWon && this.forwardButtonEnabled)}>
                            {'Step Forward >>'}</button>

                        <button
                            onClick={() => this.stepBack()}
                            disabled={!this.reverseButtonEnabled}>
                            {'<< Step Backward'}</button>
                    </div>

                </div>

                <span className='badluck'>
                    {this.game.unsolvable ? 'Soz Andrea, no Solution' : null}
                    {this.result === kGameWon ? 'Solution Found' : null}
                </span>

                <div className='board'>
                    {this.colState.map((col, colIndex) => {
                        return (<div key={colIndex} className='column'>
                            {col.map((color, colIndex) => {
                                return <div 
                                style={{backgroundColor: color}}
                                className={'cell'} key={colIndex}></div>
                            })}
                        </div>
                        )
                    })}
                </div>

            </div>
        )
    }
}

