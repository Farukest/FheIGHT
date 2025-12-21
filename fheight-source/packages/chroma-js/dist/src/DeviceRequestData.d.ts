import { IDeviceData } from "./Devices/Base";
import Effect from "./Effect";
export declare class DeviceRequestData implements IDeviceData {
    activeEffect: Effect;
    effectData: any;
    device: string;
}
