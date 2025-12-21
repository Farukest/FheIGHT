import { Color } from "./Color";
export default class Grid {
    grid: Color[][];
    rows: number;
    cols: number;
    initialValue: Color;
    isExtended: boolean;
    constructor(rows: number, cols: number, initialValue?: Color);
    clone(): Grid;
    setPosition(r: number, c: number, value: Color): void;
    setRow(r: number, value: Color): void;
    setCol(c: number, value: Color): void;
    set(value: Color): void;
    getPosition(r: number, c: number): Color;
    toJSON(): Color[][];
}
