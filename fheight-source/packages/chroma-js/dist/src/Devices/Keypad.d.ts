import Color from "../Color";
import Grid from "../Grid";
import DeviceBase from "./Base";
export default class Keypad extends DeviceBase {
    grid: Grid;
    constructor();
    setAll(color: Color): this;
    setPosition(r: number, c: number, color: Color): this;
    set(): this;
}
