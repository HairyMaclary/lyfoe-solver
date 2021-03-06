import { LyfoeModel, kGameWon } from "./lyfoe-model"
import cloneColumns from "./utils/clone-columns";
import availablePositions from "./utils/available-positions";
import topPostionInColumn from "./utils/top-position";
import { Color, Move } from "./lyfoe-types";
import { isColAllSame, isColumnLegal } from "./utils/column-checks";
import possibleMoves from "./utils/possible-moves";
import { isMoveUndo, move } from "./utils/moves";
import reorderMoves from "./utils/order-priority";

// mocking this affects other tests. Will have to consider moving this out into another test suite. This file is more integration test like.
//jest.mock('./utils/column-checks');

const simpleGame: Color[][] = [
    ['blue', 'green', 'blue', 'green'],
    ['grey', 'green', 'blue', 'green'],
    ['grey', 'grey', 'grey', 'grey'],
    ['grey', 'grey', 'grey', 'grey'],
    ['grey', 'grey', 'blue', 'green'],

];

const game = new LyfoeModel(simpleGame);

describe('illegal column checks:', () => {

    test('A column with no greys is legal', () => {
        const legal = isColumnLegal(simpleGame[0]);
        expect(legal).toBe(true);
    })

    test('A mixed column is legal', () => {
        const legal = isColumnLegal(simpleGame[4]);
        expect(legal).toBe(true);
    })

    test('An empty column is legal', () => {
        const legal = isColumnLegal(simpleGame[2]);
        expect(legal).toBe(true);
    })

    test('A column with an empty string is illegal', () => {
        const legal = isColumnLegal(simpleGame[2]);
        expect(legal).toBe(true);
    })

    test('A column with other than 4 entries is illegal', () => {

        const setColumnSpy = jest.spyOn(game, 'setColumn');

        expect(() => game.setColumn(4, ['grey'])).toThrowError();
        // expect(isColumnLegal).toHaveBeenCalled();
        expect(setColumnSpy).toHaveBeenCalled();

        setColumnSpy.mockReset();
        setColumnSpy.mockRestore();
    })

    test('A column with a grey below a color is illegal', () => {
        const setColumnSpy = jest.spyOn(game, 'setColumn');

        expect(() => game.setColumn(4, ['blue', 'grey', 'grey', 'grey'])).toThrowError();
        expect(setColumnSpy).toHaveBeenCalled();

        setColumnSpy.mockReset();
        setColumnSpy.mockRestore();
    })

    test('A column with a non string element is illegal', () => {
        const setColumnSpy = jest.spyOn(game, 'setColumn');

        expect(() => game.setColumn(4, [(true as any as Color), 'grey', 'grey', 'grey'])).toThrowError();
        expect(setColumnSpy).toHaveBeenCalled();

        setColumnSpy.mockReset();
        setColumnSpy.mockRestore();
    })
})



describe('Individual columns are complete:', () => {

    const testCols: Color[][] = [
        ['blue', 'blue', 'blue', 'blue'],
        ['grey', 'grey', 'grey', 'grey'],
        ['green', 'blue', 'green', 'blue'],
        ['grey', 'blue', 'blue', 'blue'],
    ];

    const game = new LyfoeModel(testCols);

    test('if all cells are blank', () => {
        expect(isColAllSame(testCols[1])).toBe(true);
    })

    test('if all cells are the same color', () => {
        expect(isColAllSame(testCols[0])).toBe(true);
    })

    test('not if cells are mixed colors', () => {
        expect(isColAllSame(testCols[2])).toBe(false);
    })

    test('not if cells include a blank', () => {
        expect(isColAllSame(testCols[3])).toBe(false);
    })

    test('can test all cells are the same from the second index', () => {
        expect(isColAllSame(testCols[3], 1)).toBe(true);
    })
});


describe('The game is complete:', () => {

    test('if all columns are complete', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'grey'],
            ['green', 'green', 'green', 'green']
        ];

        const game = new LyfoeModel(testCols);
        expect(game.isGameComplete(testCols)).toBe(true);
    })

    test('not if all columns are not complete', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'green', 'green', 'green']
        ];

        const game = new LyfoeModel(testCols);
        const isComplete = game.isGameComplete(testCols);
        expect(isComplete).toBe(false);
    })

    test('not complete if last column blank', () => {
        const testCols: Color[][] = [
            ["grey", "green", "blue", "green"],
            ["blue", "green", "blue", "green"],
            ["grey", "grey", "grey", "blue"],
            ["grey", "grey", "grey", "grey"]
        ];

        const game = new LyfoeModel(testCols);
        const isComplete = game.isGameComplete(testCols);
        expect(isComplete).toBe(false);
    })

    test('not complete if last column is all the same', () => {
        const testCols: Color[][] = [
            ["grey", "green", "blue", "green"],
            ["blue", "green", "blue", "green"],
            ["grey", "grey", "grey", "blue"],
            ["grey", "grey", "grey", "grey"],
            ["blue", "blue", "blue", "blue"]
        ];

        const game = new LyfoeModel(testCols);
        const isComplete = game.isGameComplete(testCols);
        expect(isComplete).toBe(false);
    })

});


describe('cloning', () => {

    test('a complete game', () => {
        const testCols: Color[][] =
            [
                ['blue', 'blue', 'blue', 'blue'],
                ['grey', 'grey', 'grey', 'grey'],
                ['grey', 'grey', 'grey', 'grey'],
                ['green', 'green', 'green', 'green']
            ];

        const game = new LyfoeModel(testCols);
        const cloned = cloneColumns(game.columns);

        expect(cloned).toMatchSnapshot();
        expect(cloned).not.toBe(game.columns);
        expect(cloned[1]).not.toBe(game.columns[1]);
        expect(cloned[1][1]).toBe(game.columns[1][1]);
    })
});


describe('Available positions', () => {
    test('located for all column types', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'green', 'blue'],
            ['grey', 'grey', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'green'],
            ['grey', 'blue', 'green', 'blue'],
        ];

        const game = new LyfoeModel(testCols);
        const availablePostions = availablePositions(game.columns);
        expect(availablePostions).toMatchSnapshot();
    })
});


describe('Top position in column', () => {
    const testCols: Color[][] = [
        ['blue', 'blue', 'green', 'blue'],
        ['grey', 'green', 'green', 'blue'],
        ['grey', 'grey', 'green', 'blue'],
        ['grey', 'grey', 'grey', 'blue'],
        ['grey', 'grey', 'grey', 'grey'],
    ];

    const game = new LyfoeModel(testCols);

    test('none blank', () => {
        const column = game.columns[0];
        expect(topPostionInColumn(column)).toBe(0);
    })

    test('top blank', () => {
        const column = game.columns[1];
        expect(topPostionInColumn(column)).toBe(1);
    })

    test('two blank', () => {
        const column = game.columns[2];
        expect(topPostionInColumn(column)).toBe(2);
    })

    test('three blank', () => {
        const column = game.columns[3];
        expect(topPostionInColumn(column)).toBe(3);
    })

    test('all blank', () => {
        const column = game.columns[4];
        expect(topPostionInColumn(column)).toBe(3);
    })

});

describe('Possible moves"', () => {
    test('for all positive scenarios', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'green', 'blue'],
            ['green', 'blue', 'green', 'blue'],
            ['grey', 'grey', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'green'],
            ['grey', 'blue', 'green', 'blue'],
        ];

        const game = new LyfoeModel(testCols);
        const availablePostions = availablePositions(game.columns);
        const _possibleMoves = possibleMoves(game.columns, availablePostions);
        expect(_possibleMoves).toMatchSnapshot();
    });

    test('may not exist', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'green', 'blue'],
            ['grey', 'green', 'blue', 'blue'],
            ['blue', 'blue', 'green', 'blue'],
        ];

        const game = new LyfoeModel(testCols);
        const availablePostions = availablePositions(game.columns);
        const _possibleMoves = possibleMoves(game.columns, availablePostions);
        expect(_possibleMoves).toMatchObject([]);
    });
});

describe('Check move is an undo:', () => {
    test('true positive', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'green', 'blue'],
            ['green', 'blue', 'green', 'blue'],
            ['grey', 'grey', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'green'],
            ['grey', 'blue', 'green', 'blue'],
        ];

        const game = new LyfoeModel(testCols);
        const _isMoveUndo = isMoveUndo(testCols, testCols);
        expect(_isMoveUndo).toBe(true);
    });

    test('true negative', () => {
        const testCols1: Color[][] = [
            ['blue', 'blue', 'green', 'blue'],
            ['green', 'blue', 'green', 'blue'],
            ['grey', 'grey', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'green'],
            ['grey', 'blue', 'green', 'blue'],
        ];

        const testCols2: Color[][] = [
            ['grey', 'blue', 'green', 'blue'], //move blue
            ['green', 'blue', 'green', 'blue'],
            ['grey', 'grey', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'green'],
            ['blue', 'blue', 'green', 'blue'], //to here
        ];

        const game = new LyfoeModel(testCols1);
        const _isMoveUndo = isMoveUndo(testCols1, testCols2);
        expect(_isMoveUndo).toBe(false);
    });
});

describe('Moving', () => {
    test('across columns', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'green', 'blue'], //move the blue
            ['green', 'blue', 'green', 'blue'],
            ['grey', 'grey', 'blue', 'blue'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'green'],
            ['grey', 'blue', 'green', 'blue'], // to here
        ];

        const nextMove: Move = {
            from: {
                col: 0,
                index: 0
            },
            to: {
                col: 5,
                index: 0
            }
        }

        const game = new LyfoeModel(testCols);
        expect(move(nextMove, testCols)).toMatchSnapshot();
    });
});

describe('undo moves', () => {
    test('are detected when appropriate', () => {
        const firstState: Color[][] = [
            ['blue', 'green', 'blue', 'green'],
            ['blue', 'green', 'blue', 'green'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'grey']
        ];
        const secondState: Color[][] = [
            ['blue', 'green', 'blue', 'green'],
            ['blue', 'green', 'blue', 'green'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'grey']
        ];

        const game = new LyfoeModel(firstState);
        expect(isMoveUndo(firstState, secondState)).toBe(true);
    });

    test('are not detected when appropriate', () => {
        const firstState: Color[][] = [
            ['blue', 'green', 'blue', 'green'],
            ['blue', 'green', 'blue', 'green'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'grey']
        ];
        const secondState: Color[][] = [
            ['grey', 'green', 'blue', 'green'],
            ['blue', 'green', 'blue', 'green'],
            ['grey', 'grey', 'grey', 'grey'],
            ['grey', 'grey', 'grey', 'blue']
        ];

        const game = new LyfoeModel(firstState);
        expect(isMoveUndo(firstState, secondState)).toBe(false);
    });
});

describe('The state history', () => {
    test('prevents a repeated state with a certain move', () => {
        const testCols: Color[][] = [
            ['blue', 'blue', 'green', 'blue'],
            ['grey', 'blue', 'green', 'blue']
        ];

        const testCols2: Color[][] = [
            ['blue', 'blue', 'blue', 'blue'],
            ['grey', 'blue', 'green', 'blue']
        ];

        const nextMove: Move = {
            from: {
                col: 0,
                index: 0
            },
            to: {
                col: 1,
                index: 0
            }
        }

        const nextMove2: Move = {
            from: {
                col: 1,
                index: 0
            },
            to: {
                col: 0,
                index: 0
            }
        }

        const game = new LyfoeModel(testCols);
        expect(game.isMoveRepeat(nextMove, testCols)).toBe(false);
        expect(game.isMoveRepeat(nextMove, testCols)).toBe(true);
        expect(game.isMoveRepeat(nextMove2, testCols)).toBe(false);
        expect(game.isMoveRepeat(nextMove2, testCols2)).toBe(false);
    });
});

describe('The winning path is correct', () => {

    test('in the simplest 2 column case do nothing', () => {

        const testCols: Color[][] = [
            ["blue", "blue", "blue", "blue"],
            ["grey", "grey", "grey", "grey"]
        ];

        const game = new LyfoeModel(testCols);

        expect(game.gameWon).toBe(false);
        const result = game.startNew();
        expect(result).toBe(kGameWon);
        expect(game.gameWon).toBe(true);
        expect(game.winningPath.length).toBe(0);
    });

    test('in a simple 4 column case', () => {

        const testCols: Color[][] = [
            ["blue", "green", "blue", "green"],
            ["blue", "green", "blue", "green"],
            ["grey", "grey", "grey", "grey"],
            ["grey", "grey", "grey", "grey"]
        ];

        const game = new LyfoeModel(testCols);

        expect(game.gameWon).toBe(false);
        game.solve(testCols);

        expect(game.gameWon).toBe(true);
        expect(game.winningPath).toBeTruthy();

        const winningMoves = game.winningPath;
        // is also testing that moves are in the
        // correct order
        expect(winningMoves).toMatchSnapshot();
    });
});

describe('Priority move system', () => {

    test('reorderPriority function perfers a 3 match column over a blank column', () => {

        // we want the green to go to the last column, not the second column. The first two moves should be swaped

        const testCols: Color[][] = [
            ["grey", "grey", "grey", "green"],
            ["grey", "grey", "grey", "grey"],
            ["blue", "blue", "blue", "blue"],
            ["grey", "green", "green", "green"]
        ];

        const moves = [
            {
                "from": { "col": 0, "index": 3 },
                "to": { "col": 1, "index": 3 }
            },
            {
                "from": { "col": 0, "index": 3 }, "to": { "col": 3, "index": 0 }
            },
            {
                "from": { "col": 3, "index": 1 }, "to": { "col": 0, "index": 2 }
            },
            {
                "from": { "col": 3, "index": 1 }, "to": { "col": 1, "index": 3 }
            }
        ]

        const reorderedMoves = reorderMoves(moves, testCols);

        expect(reorderedMoves).toMatchObject(
            [
                {
                    "from": { "col": 0, "index": 3 }, "to": { "col": 3, "index": 0 }
                },
                {
                    "from": { "col": 0, "index": 3 },
                    "to": { "col": 1, "index": 3 }
                },
                {
                    "from": { "col": 3, "index": 1 }, "to": { "col": 0, "index": 2 }
                },
                {
                    "from": { "col": 3, "index": 1 }, "to": { "col": 1, "index": 3 }
                }
            ]
        );
    });

    xtest('the game perfers a 2 match column over a blank column', () => {

        // we want the green to go to the last column, not the second column
        const testCols: Color[][] = [
            ["grey", "grey", "grey", "green"],
            ["grey", "grey", "grey", "grey"],
            ["blue", "blue", "blue", "blue"],
            ["grey", "grey", "green", "green"]
        ];

        const game = new LyfoeModel(testCols);

        const result = game.startNew();
        expect(game.columns).toMatchSnapshot();
    });


    test('the games gives priority to moving to a column with 3 matchin colors', () => {

        // we want the green to go to the last column, not the second column
        const testCols: Color[][] = [
            ["grey", "grey", "grey", "green"],
            ["grey", "grey", "grey", "grey"],
            ["blue", "blue", "blue", "blue"],
            ["grey", "green", "green", "green"]
        ];

        const game = new LyfoeModel(testCols);

        expect(game.gameWon).toBe(false);
        const result = game.startNew();
        expect(result).toBe(kGameWon);
        expect(game.gameWon).toBe(true);
        expect(game.columns).toMatchSnapshot();
    });
});

