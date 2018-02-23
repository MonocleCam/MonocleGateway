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

'use strict';

import {EventEmitter} from "events";
import * as Onvif from 'node-onvif';
import * as _ from 'underscore';
import * as url from 'url';
import {Camera} from "../";

// Default Camera Controller Options/Configuration
const default_options = {
    reconnectInterval: 60000  // 60 seconds
};

const HIGH_SPEED:number = 3;
const MEDIUM_SPEED:number = 2;
const LOW_SPEED:number = 1;

const PAN_HIGH_SPEED:number = 1;
const PAN_MEDIUM_SPEED:number = .5;
const PAN_LOW_SPEED:number = .2;

const TILT_HIGH_SPEED:number = 1;
const TILT_MEDIUM_SPEED:number = .5;
const TILT_LOW_SPEED:number = .2;

const ZOOM_HIGH_SPEED:number = 1;
const ZOOM_MEDIUM_SPEED:number = .5;
const ZOOM_LOW_SPEED:number = .2;

/**
 * This class is responsible for communicating with
 * network/IP cameras via the ONVIF protocol
 */
export class CameraController extends EventEmitter{

    protected readonly _options:any;
    protected _initialized:boolean;
    protected _device:Onvif;
    protected _camera:Camera = null;


    /**
     * Default Constructor
     */
    public constructor(options?:any|undefined){
        super();

        // apply provided options; merge with defaults
        if(options)
            this._options = _.defaults(options, default_options);
        else
            this._options = default_options;
    }

    /**
     * Returns the initialization status of the active camera
     * @return {boolean}
     */
    public isInitialized():boolean{
        return this._initialized;
    }

    /**
     * Returns the PTZ supported status of the active camera
     * @return {boolean}
     */
    public isPTZSupported():boolean{
        return this._camera.ptz;
    }

    /**
     * Stop all movement on the camera immediately
     * @return {Promise<void>}
     */
    public stop():Promise<void>{
        let self = this;

        // return promise
        return new Promise<any> ((resolve, reject) => {

            // ensure the current camera is initialized
            if (!this._initialized) {
                let error = new Error("Unable to stop camera movement; the camera is not initialized.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // ensure the current camera supports PTZ
            if (!this._camera.ptz) {
                let error = new Error("Unable to stop camera movement; the camera does not support PTZ.");
                self.emit("error", error);
                reject(error);
                return;
            }

            let params = {
                'ProfileToken': self._device.getCurrentProfile().token
            };

            // send home recall instruction to camera now
            self._device.services.ptz.stop(params).then(() => {
                self.emit("home");
                resolve();
            }).catch((error) => {
                self.emit("error", error);
                reject(error);
            });
        });
    }

    /**
     * Move the camera to its preconfigured HOME position
     * @return {Promise<void>}
     */
    public gotoHome():Promise<void>{
        let self = this;

        // return promise
        return new Promise<any> ((resolve, reject) => {

            // ensure the current camera is initialized
            if (!this._initialized) {
                let error = new Error("Unable to recall camera home; the camera is not initialized.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // ensure the current camera supports PTZ
            if (!this._camera.ptz) {
                let error = new Error("Unable to recall camera home; the camera does not support PTZ.");
                self.emit("error", error);
                reject(error);
                return;
            }

            let params = {
                'ProfileToken': self._device.getCurrentProfile().token
            };

            // send home recall instruction to camera now
            self._device.services.ptz.gotoHomePosition(params).then(() => {
                self.emit("home");
                resolve();
            }).catch((error) => {
                self.emit("error", error);
                reject(error);
            });
        });
    }

    /**
     * Move the camera to a preconfigured PRESET by token id.
     * @param {string} token id
     * @return {Promise<void>}
     */
    public gotoPreset(token:string):Promise<void>{
        let self = this;

        // return promise
        return new Promise<any> ((resolve, reject) => {

            // ensure the current camera is initialized
            if (!this._initialized) {
                let error = new Error("Unable to recall camera preset; the camera is not initialized.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // ensure the current camera supports PTZ
            if (!this._camera.ptz) {
                let error = new Error("Unable to recall camera preset; the camera does not support PTZ.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // if the token passed to us starts with the hash character, then
            // parse the number and use that as the index into the presets array
            if(token.startsWith("#")){
                let index = parseInt(token.slice(1));

                // validate index
                if(index >= self._camera.presets.length){
                    let error = new Error("Unable to recall camera preset; invalid preset index: " + token);
                    self.emit("error", error);
                    reject(error);
                    return;
                }

                // not get the actual preset token from the cached presets
                token = self._camera.presets[index].token;
            }

            let params = {
                'ProfileToken': self._device.getCurrentProfile().token,
                'PresetToken': token,
                'Speed': {'x': 1, 'y': 1, 'z': 1}
            };

            // send preset recall instruction to camera now
            self._device.services.ptz.gotoPreset(params).then(() => {
                self.emit("preset", token);
                resolve();
            }).catch((error) => {
                self.emit("error", error);
                reject(error);
            });
        });
    }

    /**
     * Pan the camera left or right based on the pan value received.
     * @param {number} pan : value between -3 and +3 (negative is left; positive is right)
     * @return {Promise<void>}
     */
    public pan(pan:number):Promise<void>{
        let self = this;

        // return promise
        return new Promise<any> ((resolve, reject) => {

            // ensure the current camera is initialized
            if (!this._initialized) {
                let error = new Error("Unable to pan camera; the camera is not initialized.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // ensure the current camera supports PTZ
            if (!this._camera.ptz) {
                let error = new Error("Unable to pan camera; the camera does not support PTZ.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // get scaled pan speed value for camera
            pan = CameraController.getPanSpeed(pan);

            let params = {
                'ProfileToken': self._device.getCurrentProfile().token,
                'Velocity': {
                    x: pan,  // Speed of pan (in the range of -1.0 to 1.0)
                    y: 0,    // Speed of tilt (in the range of -1.0 to 1.0)
                    z: 0     // Speed of zoom (in the range of -1.0 to 1.0)
                },
                'Timeout': 10
            };

            // send pan movement instruction to camera now
            self._device.services.ptz.continuousMove(params).then(() => {
                self.emit("pan", pan);
                resolve();
            }).catch((error) => {
                self.emit("error", error);
                reject(error);
            });
        });
    }

    /**
     * Tilt the camera up or down based on the tilt value received.
     * @param {number} tilt : value between -3 and +3 (negative is down; positive is up)
     * @return {Promise<void>}
     */
    public tilt(tilt:number):Promise<void>{
        let self = this;

        // return promise
        return new Promise<any> ((resolve, reject) => {

            // ensure the current camera is initialized
            if (!this._initialized) {
                let error = new Error("Unable to tilt camera; the camera is not initialized.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // ensure the current camera supports PTZ
            if (!this._camera.ptz) {
                let error = new Error("Unable to tilt camera; the camera does not support PTZ.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // get scaled tilt speed value for camera
            tilt = CameraController.getTiltSpeed(tilt);

            let params = {
                'ProfileToken': self._device.getCurrentProfile().token,
                'Velocity': {
                    x: 0,    // Speed of pan (in the range of -1.0 to 1.0)
                    y: tilt, // Speed of tilt (in the range of -1.0 to 1.0)
                    z: 0     // Speed of zoom (in the range of -1.0 to 1.0)
                },
                'Timeout': 10
            };

            // send tilt movement instruction to camera now
            self._device.services.ptz.continuousMove(params).then(() => {
                self.emit("tilt", tilt);
                resolve();
            }).catch((error) => {
                self.emit("error", error);
                reject(error);
            });
        });
    }

    /**
     * Zoom the camera in or out based on the zoom value received.
     * @param {number} zoom : value between -3 and +3 (negative is out; positive is in)
     * @return {Promise<void>}
     */
    public zoom(zoom:number):Promise<void>{
        let self = this;

        // return promise
        return new Promise<any> ((resolve, reject) => {

            // ensure the current camera is initialized
            if (!this._initialized) {
                let error = new Error("Unable to tilt camera; the camera is not initialized.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // ensure the current camera supports PTZ
            if (!this._camera.ptz) {
                let error = new Error("Unable to tilt camera; the camera does not support PTZ.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // get scaled zoom speed value for camera
            zoom = CameraController.getZoomSpeed(zoom);

            let params = {
                'ProfileToken': self._device.getCurrentProfile().token,
                'Velocity': {
                    x: 0,    // Speed of pan (in the range of -1.0 to 1.0)
                    y: 0,    // Speed of tilt (in the range of -1.0 to 1.0)
                    z: zoom  // Speed of zoom (in the range of -1.0 to 1.0)
                },
                'Timeout': 10
            };

            // send zoom movement instruction to camera now
            self._device.services.ptz.continuousMove(params).then(() => {
                self.emit("zoom", zoom);
                resolve();
            }).catch((error) => {
                self.emit("error", error);
                reject(error);
            });
        });
    }

    /**
     * Move the camera on its 3-axis depending on the PTZ values received
     * @param {number} pan : value between -3 and +3 (negative is left; positive is right)
     * @param {number} tilt : value between -3 and +3 (negative is down; positive is up)*
     * @param {number} zoom : value between -3 and +3 (negative is out; positive is in)
     * @return {Promise<void>}
     */
    public ptz(pan:number, tilt:number, zoom:number):Promise<void>{
        let self = this;

        // return promise
        return new Promise<any> ((resolve, reject) => {

            // ensure the current camera is initialized
            if (!this._initialized) {
                let error = new Error("Unable to pan camera; the camera is not initialized.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // ensure the current camera supports PTZ
            if (!this._camera.ptz) {
                let error = new Error("Unable to pan camera; the camera does not support PTZ.");
                self.emit("error", error);
                reject(error);
                return;
            }

            // get scaled pan speed value for camera
            pan = CameraController.getPanSpeed(pan);

            // get scaled tilt speed value for camera
            tilt = CameraController.getTiltSpeed(tilt);

            // get scaled zoom speed value for camera
            zoom = CameraController.getZoomSpeed(zoom);

            let params = {
                'ProfileToken': self._device.getCurrentProfile().token,
                'Velocity': {
                    x: pan,   // Speed of pan (in the range of -1.0 to 1.0)
                    y: tilt,  // Speed of tilt (in the range of -1.0 to 1.0)
                    z: zoom   // Speed of zoom (in the range of -1.0 to 1.0)
                },
                'Timeout': 10
            };

            // send PTZ movement instruction to camera now
            self._device.services.ptz.continuousMove(params).then(() => {
                self.emit("ptz", pan, tilt, zoom);
                resolve();
            }).catch((error) => {
                self.emit("error", error);
                reject(error);
            });
        });
    }

    /**
     * Initialize Camera to Control
     * @param source camera soruce to control
     * @return {Promise<any>} return promise with camera source
     */
    public initialize(source):Promise<any>{
        let self = this;
        let ptz_supported = false;

        // reset device and camera instances
        self._device = null;
        self._camera = null;

        return new Promise<any> ((resolve, reject) => {
            this._initialized = false;
            self.emit("uninitialized", source);
            let u = url.parse(source.uri, false);

            // TODO : DEAL WITH CAMERA USERNAME AND PASSWORD HERE
            //Create an OnvifDevice object
            self._device = new Onvif.OnvifDevice({
                xaddr: `http://${u.hostname}/onvif/device_service`,
                user : 'admin',
                pass : 'password'
            });

            // initialize onvif device
            self._device.init().then((info) => {
                self._initialized = true;
                self.emit("initialized", info);

                // if this device supports PTZ, then interrogate the PTZ presets
                if(self._device.services.ptz){
                    ptz_supported = true;

                    let params = {
                        'ProfileToken': self._device.getCurrentProfile().token,
                        'Speed': 1.0
                    };

                    // get camera presets
                    self._device.services.ptz.getPresets(params).then((result) => {

                        // iterate the SOAP preset response and build a simplified preset array
                        // that we will pass into our new Camera object instance constructor
                        let presets = [];
                        if(result.data.GetPresetsResponse && result.data.GetPresetsResponse.Preset){
                            let raw_presets:any = result.data.GetPresetsResponse.Preset;

                            // the SOAP response can either be a single object instance or an array of preset instances
                            // so we have to check to see if its an array and if not, we will make an array and
                            // put the single item in it so we can process the response as an array
                            if(!Array.isArray(raw_presets)){
                                raw_presets = [ raw_presets ];
                            }

                            // process the raw preset array and add each simplified
                            // preset object into the new presets array
                            for (let item of raw_presets) {
                                presets.push({
                                    token: item.$.token,
                                    name: item.Name });
                            }
                        }

                        // build a camera object from the camera source, device info and PTZ presets
                        self._camera = new Camera({
                            source: source,
                            info: info,
                            ptz: ptz_supported,
                            presets: presets
                        });

                        // return the newly created camera object to the initialize caller
                        resolve(self._camera);

                    }).catch((error) => {
                        self.emit("error", error);
                    });
                }
                else {
                    // build a camera object from the camera source, device info and PTZ presets
                    self._camera = new Camera({
                        source: source,
                        info: info,
                        ptz: ptz_supported
                    });

                    // return the newly created camera object to the initialize caller
                    resolve(self._camera);
                }
            }).catch((error) => {
                self.emit(error);
                reject(error);
            });
        });
    }

    /**
     * Scale the received PAN value to a speed adequate for the active camera
     * @param {number} speed : a number between -3 and +3.
     *                       3 = high speed
     *                       2 = medium speed
     *                       1 = low speed
     *                       0 = stop
     * @return {number} return a camera speed value from -1 to +1 (fractional)
     */
    private static getPanSpeed(speed:number):number {
        if(speed === -LOW_SPEED) speed = -PAN_LOW_SPEED;
        else if(speed === -MEDIUM_SPEED) speed = -PAN_MEDIUM_SPEED;
        else if(speed === -HIGH_SPEED) speed = -PAN_HIGH_SPEED;
        else if(speed === LOW_SPEED) speed = PAN_LOW_SPEED;
        else if(speed === MEDIUM_SPEED) speed = PAN_MEDIUM_SPEED;
        else if(speed === HIGH_SPEED) speed = PAN_HIGH_SPEED;
        else speed = 0;
        return speed;
    }

    /**
     * Scale the received TILT value to a speed adequate for the active camera
     * @param {number} speed : a number between -3 and +3.
     *                       3 = high speed
     *                       2 = medium speed
     *                       1 = low speed
     *                       0 = stop
     * @return {number} return a camera speed value from -1 to +1 (fractional)
     */
    private static getTiltSpeed(speed:number):number {
        if(speed === -LOW_SPEED) speed = -TILT_LOW_SPEED;
        else if(speed === -MEDIUM_SPEED) speed = -TILT_MEDIUM_SPEED;
        else if(speed === -HIGH_SPEED) speed = -TILT_HIGH_SPEED;
        else if(speed === LOW_SPEED) speed = TILT_LOW_SPEED;
        else if(speed === MEDIUM_SPEED) speed = TILT_MEDIUM_SPEED;
        else if(speed === HIGH_SPEED) speed = TILT_HIGH_SPEED;
        else speed = 0;
        return speed;
    }

    /**
     * Scale the received ZOOM value to a speed adequate for the active camera
     * @param {number} speed : a number between -3 and +3.
     *                       3 = high speed
     *                       2 = medium speed
     *                       1 = low speed
     *                       0 = stop
     * @return {number} return a camera speed value from -1 to +1 (fractional)
     */
    private static getZoomSpeed(speed:number):number {
        if(speed === -LOW_SPEED) speed = -ZOOM_LOW_SPEED;
        else if(speed === -MEDIUM_SPEED) speed = -ZOOM_MEDIUM_SPEED;
        else if(speed === -HIGH_SPEED) speed = -ZOOM_HIGH_SPEED;
        else if(speed === LOW_SPEED) speed = ZOOM_LOW_SPEED;
        else if(speed === MEDIUM_SPEED) speed = ZOOM_MEDIUM_SPEED;
        else if(speed === HIGH_SPEED) speed = ZOOM_HIGH_SPEED;
        else speed = 0;
        return speed;
    }
}
