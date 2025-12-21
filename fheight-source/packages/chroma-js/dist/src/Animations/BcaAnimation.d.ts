import { Animation } from "../Animation";
export declare class BcaAnimation extends Animation {
    private url;
    private blob;
    constructor(url: string | Blob);
    createFrames(): Promise<void>;
    private fromBlob;
    private parseAnimation;
}
