import Color from "../Color";
import Grid from "../Grid";
import DeviceBase from "./Base";
export default class Mousepad extends DeviceBase {
    grid: Grid;
    constructor();
    setAll(color: Color): this;
    setPosition(c: number, color: Color): this;
    set(): this;
}
