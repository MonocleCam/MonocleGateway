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


import {CameraSource} from "./CameraSource";
import {CameraInfo} from "./CameraInfo";
import {CameraPreset} from "./CameraPreset";

export class Camera{

    // public read only variables
    private readonly _source:CameraSource;
    private readonly _info: CameraInfo;

    // public read only variables
    public readonly uuid: string;
    public readonly name: string;
    public readonly manufacturer: string;
    public readonly model: string;
    public readonly firmwareVersion: string;
    public readonly serialNumber: string;
    public readonly ptz: boolean;
    public readonly presets: Array<CameraPreset>;
    public readonly error: string;

    /**
     * Default Constructor
     *
     * @param source - json or object to seed model object
     */
    constructor(data?:any) {

        // set initial values from data object
        if(data){
            this._source = (data.source) ? new CameraSource(data.source) : new CameraSource();
            this._info = (data.info) ?  new CameraInfo(data.info) : new CameraInfo();
            this.ptz = (data.ptz) ? data.ptz : false;
            if(data.presets) this.presets = data.presets;
            if(data.error) this.error = data.error;
            if(data.source && data.source.uuid) this.uuid = data.source.uuid;
            if(data.info && data.info.serialNumber) this.serialNumber = data.info.serialNumber;

            if(data.source && data.source.name) this.name = data.source.name;
            else if(data.info && data.info.model) this.name = data.info.model;

            if(data.source && data.source.manufacturer) this.manufacturer = data.source.manufacturer;
            else if(data.info && data.info.manufacturer) this.manufacturer = data.info.manufacturer;

            if(data.source && data.source.model) this.model = data.source.model;
            else if(data.info && data.info.model) this.model = data.info.model;
        }
    }

    /**
     * Return the underlying camera info object received during the ONVIF camera initialization
     * @return {CameraInfo}
     */
    public info():CameraInfo {
        return this._info;
    }

    /**
     * Return the underlying camera source object received form the Monocle platform
     * @return {CameraSource}
     */
    public source():CameraSource {
        return this._source;
    }

    /**
     * This function returns a data transfer object that includes only public properties
     * @return {any}
     */
    public toDTO():any {
        let dto: any = {};
        for (let key in this) {
            if (key[0] !== '_') {
                dto[key] = this[key];
            }
        }
        return dto;
    }

    /**
     * This function returns a JSON string of the DTO (data transfer object) that includes only public properties
     * @return {string}
     */
    public toJson(pretty?:boolean):string {
        return JSON.stringify(this.toDTO(), null, (pretty) ? 3 : 0);
    }
}