import { AnimationFrame } from "./AnimationFrame";
import DeviceContainer from "./Devices";
import { IDeviceData } from "./Devices/Base";
export interface IPlayInstance {
    send(container: DeviceContainer): void;
    deleteEffect(effects: string[]): Promise<any>;
    sendDeviceUpdate(devices: IDeviceData[], store: boolean): Promise<any>;
}
export declare class Animation {
    Frames: AnimationFrame[];
    isPlaying: boolean;
    Instance: IPlayInstance;
    currentFrame: number;
    private isInit;
    play(instance: IPlayInstance): Promise<void>;
    playLoop(instance: IPlayInstance): Promise<void>;
    stop(): Promise<void>;
    createEffects(instance: IPlayInstance): Promise<void>;
    createFrames(): Promise<void>;
}
