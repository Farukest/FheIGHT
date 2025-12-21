import { Animation } from "./Animation";
import { IDeviceData } from "./Devices/Base";
import DeviceContainer from "./Devices";
export declare class ChromaInstance extends DeviceContainer {
    destroyed: boolean;
    private url;
    private interval;
    private activeAnimation;
    constructor(url: string);
    playAnimation(animation: Animation): Promise<Animation>;
    stopAnimation(): Promise<void>;
    destroy(): Promise<boolean>;
    heartbeat(): Promise<Response>;
    send(container?: DeviceContainer): Promise<any[]>;
    sendDeviceUpdate(devices: IDeviceData[], store?: boolean): Promise<any[]>;
    setEffect(effectids: string[]): Promise<void>;
    deleteEffect(effectids: string[]): Promise<void>;
}
