import { Color, kColLength } from "../lyfoe-types";

export function isColAllSame(column: Color[], firstIndex = 0) {
    let topColor = column[firstIndex];

    for (let i = firstIndex + 1; i < kColLength; i++) {
        if (column[i] !== topColor) return false
    }

    return true;
}

export function isColBlank(col: Color[]) {
    return col.every(color => color === 'grey')
}

/**
* Columns should not have a blank below a color
*/
export function isColumnLegal(col: Color[]) {
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