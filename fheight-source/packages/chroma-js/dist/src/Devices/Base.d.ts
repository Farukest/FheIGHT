import Effect from "../Effect";
export interface IDeviceData {
    activeEffect: Effect;
    effectData: any;
    device: string;
}
export interface IDevice {
    activeEffect: Effect;
    effectData: any;
    device: string;
    effectId: string;
    setStatic(color: any): void;
    setAll(color: any): void;
    setNone(): void;
}
export default class DeviceBase implements IDevice, IDeviceData {
    device: any;
    supports: any;
    activeEffect: Effect;
    effectData: any;
    effectId: string;
    constructor();
    setStatic(color: any): this;
    setAll(color: any): this;
    set(): void;
    setNone(): void;
    setDeviceEffect(effect: Effect, data?: any): Promise<void>;
}
