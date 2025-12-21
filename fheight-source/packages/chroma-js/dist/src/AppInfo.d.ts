import { AuthorInfo } from "./AuthorInfo";
import AvailableDevices from "./Devices/AvailableDevices";
export declare enum AppCategory {
    Application,
    Game
}
export declare class AppInfo {
    Title: string;
    Description: string;
    Author: AuthorInfo;
    DeviceSupported: AvailableDevices[];
    Category: AppCategory;
    toJSON(): {
        author: AuthorInfo;
        category: AppCategory;
        description: string;
        device_supported: AvailableDevices[];
        title: string;
    };
}
