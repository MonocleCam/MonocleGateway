/*
 **********************************************************************
 *             __  __  ___  _  _  ___   ___ _    ___
 *            |  \/  |/ _ \| \| |/ _ \ / __| |  | __|
 *            | |\/| | (_) | .` | (_) | (__| |__| _|
 *            |_|  |_|\___/|_|\_|\___/ \___|____|___|
 *
 * -------------------------------------------------------------------
 *                    MONOCLE GATEWAY SERVICE
 * -------------------------------------------------------------------
 *
 *  The Monocle Gateway Service is a small service that you install
 *  and run inside your network to order to facilitate communication
 *  between the Monocle (cloud) platform and your cameras. This
 *  service is required if you want to implement one of the PTZ
 *  controllers included in the Monocle project. The Monocle Gateway
 *  Service DOES NOT communicate ANY video or audio content to the
 *  Internet. It's sole purpose is to provide camera control
 *  integration for PTZ cameras.
 *
 * -------------------------------------------------------------------
 *        COPYRIGHT SHADEBLUE, LLC @ 2018, ALL RIGHTS RESERVED
 * -------------------------------------------------------------------
 *
 **********************************************************************
 */


export class CameraInfo{

    public readonly manufacturer: string;
    public readonly model: string;
    public readonly firmwareVersion: string;
    public readonly serialNumber: string;
    public readonly hardwareId: string;


    /**
     * Default Constructor
     *
     * @param source - json or object to seed model object
     */
    constructor(source?:any) {

        // set initial values from source object
        if(source){
            if(source.manufacturer) this.manufacturer = source.manufacturer || source.Manufacturer;
            else if(source.Manufacturer) this.manufacturer = source.Manufacturer;

            if(source.model) this.model = source.model;
            else if(source.Model) this.model = source.Model;

            if(source.firmwareVersion) this.firmwareVersion = source.firmwareVersion;
            else if(source.FirmwareVersion) this.firmwareVersion = source.FirmwareVersion;

            if(source.serialNumber) this.serialNumber = source.serialNumber;
            else if(source.SerialNumber) this.serialNumber = source.SerialNumber;

            if(source.hardwareId) this.hardwareId = source.hardwareId;
            else if(source.HardwareId) this.hardwareId = source.HardwareId;
        }
    }
}