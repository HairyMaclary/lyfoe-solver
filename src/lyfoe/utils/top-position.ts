import { Color, kColLength } from '../lyfoe-types'

export default function topPostionInColumn(column: Color[]): number {

    if (column[kColLength - 1] === 'grey') return 3;

    for (let i = 0; i < kColLength; i++) {
        if (column[i] !== 'grey') return i;
    }
    return 3; // keep TS happy
}