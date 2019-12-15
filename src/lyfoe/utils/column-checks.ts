import { Color, kColLength } from "../lyfoe-types";

export function isColAllSame(column: Color[]) {
    let topColor = column[0];

    for (let i = 1; i < kColLength; i++) {
        if (column[i] !== topColor) return false
    }

    return true;
}

export function isColBlank(col: Color[]) {
    return col.every(color => color === 'grey')
}