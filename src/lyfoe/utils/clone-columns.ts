import { Color } from "../lyfoe-types";

export default function cloneColumns(columns: Color[][]): Color[][] {
    return JSON.parse(JSON.stringify(columns));
}