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


export class CameraPreset{

    public readonly token: string;
    public readonly name: string;


    /**
     * Default Constructor
     *
     * @param source - json or object to seed model object
     */
    constructor(source?:any) {

        // set initial values from source object
        if(source){
            if(source.token) this.token = source.token;
            if(source.name) this.name = source.name;
        }
    }
}