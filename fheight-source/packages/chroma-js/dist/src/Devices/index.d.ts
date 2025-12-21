import Color from "../Color";
import { IDevice } from "./Base";
import ChromaLink from "./ChromaLink";
import Headset from "./Headset";
import Keyboard from "./Keyboard";
import Keypad from "./Keypad";
import Mouse from "./Mouse";
import Mousepad from "./Mousepad";
export default class DeviceContainer {
    Keyboard: Keyboard;
    Mousepad: Mousepad;
    Mouse: Mouse;
    Keypad: Keypad;
    Headset: Headset;
    ChromaLink: ChromaLink;
    AnimationId: string;
    Devices: IDevice[];
    constructor();
    setAll(color: Color): void;
    setNone(): void;
}
