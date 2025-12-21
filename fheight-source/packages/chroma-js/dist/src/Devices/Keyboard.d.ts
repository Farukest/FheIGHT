import Color from "../Color";
import Grid from "../Grid";
import Key from "../Key";
import DeviceBase from "./Base";
export declare class Keyboard extends DeviceBase {
    static Columns: number;
    static Rows: number;
    grid: Grid;
    keys: Grid;
    constructor();
    setAll(color: Color): this;
    setRow(r: number, color: Color): this;
    setCol(c: number, color: Color): this;
    setPosition(r: number, c: number, color: Color): this;
    setKey(keyOrArrayOfKeys: Key | Key[], color: Color): this;
    set(): this;
}
export default Keyboard;
