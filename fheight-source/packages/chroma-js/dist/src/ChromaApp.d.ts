import { AppCategory } from "./AppInfo";
import AvailableDevices from "./Devices/AvailableDevices";
import { ChromaInstance } from "./ChromaInstance";
export declare class ChromaApp {
    private uninitpromise;
    private activeInstance;
    private data;
    constructor(title: string, description?: string, author?: string, contact?: string, devices?: AvailableDevices[], category?: AppCategory);
    Instance(create?: boolean): Promise<ChromaInstance>;
}
