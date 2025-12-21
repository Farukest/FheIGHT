import { Animation } from "../Animation";
export declare class WaveAnimation extends Animation {
    private rightToLeft;
    constructor(rightToLeft?: boolean);
    createFrames(): Promise<void>;
}
