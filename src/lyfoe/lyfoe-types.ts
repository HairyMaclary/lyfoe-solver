export type Color = 'grey' | 'blue' | 'green' | 'pink' | 'yellow';

export interface Position {
    col: number,
    index: number
}

export interface AvailablePosition {
    position: Position,
    color: Color
}

export interface Move {
    from: Position,
    to: Position
}

export type history = string[];

export const kColLength = 4;