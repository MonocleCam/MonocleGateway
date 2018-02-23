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
import WebSocket = require('ws');
import * as _ from 'underscore';
import {Camera, CameraSource} from "../";

// Default Options
const default_options = {
    port: 8080,
    perMessageDeflate: false
};

/**
 * PTZControllerService
 * -------------------------
 * This service provides an entry point for local PTZ controllers to
 * connect and perform PTZ control actions.
 */
export class PTZControllerService extends EventEmitter{

    protected readonly _options:any;
    protected readonly _wss;
    protected _camera:Camera = null;

    /**
     * Call this method to broadcast a message object to all
     * connected PTZ controllers
     * @param data (object)
     */
    broadcast(data:any){
        this._wss.broadcast(data);
    }

    /**
     * Call this method when the active camera has changed and we
     * need to update all connected PTZ controllers
     * @param {Camera} camera
     */
    updateActiveCamera(camera:Camera){
        this._camera = camera; // update local reference
        // broadcast the update to all PTZ controllers
        this.broadcast({ source: this._camera.toDTO() });
    }

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

        // start web-socket server
        this._wss = new WebSocket.Server({ port: this._options.port }, ()=> {
            let self = this;

            /**
             * LISTEN FOR LOCAL CONNECTIONS FROM PTZ CONTROLLERS
             */
            this._wss.on('connection', function (ws, request) {
                ws._remoteAddress = ws._socket.remoteAddress.toString();
                self.emit("connected", ws._remoteAddress);

                // once the client is connected, we should send the active camera source to it
                if(self._camera)
                    ws.send(JSON.stringify({ source: self._camera.toDTO() }));

                /**
                 * Listen for PTZ endpoint messages
                 */
                ws.on('message', function incoming(data) {

                    // decode the received command and emit the proper event
                    let command:string = data.toString().toLowerCase();

                    // handle STOP command
                    if(command === "stop") {
                        self.emit("stop", ws._remoteAddress);
                        return;
                    }

                    // handle HOME command
                    if(command === "home") {
                        self.emit("home", ws._remoteAddress);
                        return;
                    }

                    // handle PRESET:<#> command
                    if(command.startsWith("preset:")){
                        let parts = command.split(":");

                        // validate command syntax
                        if(!parts || parts.length < 2){
                            self.emit("error", "Invalid 'preset' command received from PTZ controller: " + data);
                            return;
                        }

                        // parse the value received and emit the preset event
                        let token = parts[1];
                        self.emit("preset", ws._remoteAddress, token);
                        return;
                    }

                    // handle PTZ:<P#>:<T#>:<Z#> command
                    if(command.startsWith("ptz:")){
                        let parts = command.split(":");

                        // validate command syntax
                        if(!parts || parts.length < 4){
                            self.emit("error", "Invalid 'preset' command received from PTZ controller: " + data);
                            return;
                        }

                        // parse the PTZ values received and emit the ptz event
                        let pan = parseInt(parts[1]);
                        let tilt = parseInt(parts[2]);
                        let zoom = parseInt(parts[3]);
                        self.emit("ptz", ws._remoteAddress, pan, tilt, zoom);
                        return;
                    }

                    // handle PAN:<#> command
                    if(command.startsWith("pan:")){
                        let parts = command.split(":");

                        // validate command syntax
                        if(!parts || parts.length < 2){
                            self.emit("error", "Invalid 'pan' command received from PTZ controller: " + data);
                            return;
                        }

                        // parse the value received and emit the pan event
                        let pan = parseInt(parts[1]);
                        self.emit("pan", ws._remoteAddress, pan);
                        return;
                    }

                    // handle TILT:<#> command
                    if(command.startsWith("tilt:")){
                        let parts = command.split(":");

                        // validate command syntax
                        if(!parts || parts.length < 2){
                            self.emit("error", "Invalid 'tilt' command received from PTZ controller: " + data);
                            return;
                        }

                        // parse the value received and emit the tilt event
                        let tilt = parseInt(parts[1]);
                        self.emit("tilt", ws._remoteAddress, tilt);
                        return;
                    }

                    // handle ZOOM:<#> command
                    if(command.startsWith("zoom:")){
                        let parts = command.split(":");

                        // validate command syntax
                        if(!parts || parts.length < 2){
                            self.emit("error", "Invalid 'zoom' command received from PTZ controller: " + data);
                            return;
                        }

                        // parse the value received and emit the zoom event
                        let zoom = parseInt(parts[1]);
                        self.emit("zoom", ws._remoteAddress, zoom);
                        return;
                    }

                    // unknown command received
                    self.emit("error", "Unknown command received from PTZ controller: " + data);
                });

                /**
                 * Listen for client disconnections
                 */
                ws.on('close', function () {
                    self.emit("disconnected", ws._remoteAddress);
                });

                /**
                 * Listen for errors
                 */
                ws.on('error', function (err) {
                    self.emit("error", err);
                });
            });
        });

        /**
         * This method will broadcast the message object
         * to all connected PTZ controllers
         * @param data (object)
         */
        this._wss.broadcast = function broadcast(data:any) {
            this.clients.forEach(function each(client) {
                client.send(JSON.stringify(data));
            });
        };
    }
}
