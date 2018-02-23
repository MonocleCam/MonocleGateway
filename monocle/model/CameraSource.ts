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

import {Resolution} from "./Resolution";

export class CameraSource{

    public readonly uuid: string;
    public readonly created: Date;
    public readonly modified: Date;
    public readonly owner: string;
    public readonly name: string;
    public readonly description: string;
    public readonly manufacturer: string;
    public readonly model: string;
    public readonly protocol: string;
    public readonly videoCodec: string;
    public readonly audioCodec: string;
    public readonly resolution: Resolution;
    public readonly uri: string;
    public readonly authenticationType: string;
    public readonly username: string;
    public readonly password: string;
    public readonly timeout: number;
    public readonly lastViewTimestamp: Date;

    /**
     * Default Constructor
     *
     * @param source - json or object to seed model object
     */
    constructor(source?:any) {

        // set initial values from source object
        if(source){
            if(source.uuid) this.uuid = source.uuid;
            if(source.created) this.created = source.created;
            if(source.modified) this.modified = source.modified;
            if(source.owner) this.owner = source.owner;
            if(source.name) this.name = source.name;
            if(source.description) this.description = source.description;
            if(source.manufacturer) this.manufacturer = source.manufacturer;
            if(source.model) this.model = source.model;
            if(source.protocol) this.protocol = source.protocol;
            if(source.videoCodec) this.videoCodec = source.videoCodec;
            if(source.audioCodec) this.audioCodec = source.audioCodec;
            if(source.resolution) new Resolution(source.resolution);
            if(source.uri) this.uri = source.uri;
            if(source.authenticationType) this.authenticationType = source.authenticationType;
            if(source.username) this.username = source.username;
            if(source.password) this.password = source.password;
            if(source.timeout) this.timeout = source.timeout;
            if(source.lastViewTimestamp) this.lastViewTimestamp = source.lastViewTimestamp;
        }
    }
}