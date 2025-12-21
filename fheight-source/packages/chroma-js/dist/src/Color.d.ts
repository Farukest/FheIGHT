export declare class Color {
    static Black: Color;
    static Red: Color;
    static Green: Color;
    static Blue: Color;
    static HotPink: Color;
    static Orange: Color;
    static Pink: Color;
    static Purple: Color;
    static While: Color;
    static Yellow: Color;
    r: number;
    g: number;
    b: number;
    isKey: boolean;
    constructor(r: number | string, g?: number, b?: number);
    toBGR(): number;
    toJSON(): number;
    toString(): string;
}
export default Color;
