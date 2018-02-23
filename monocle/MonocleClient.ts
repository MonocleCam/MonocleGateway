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

/**
 * MONOCLE CLIENT LIBRARY
 * @description Client Library for MonocleCam.com.
 */

// *******************************************************************************************************
// DEPENDENCIES
// *******************************************************************************************************

import {EventEmitter} from "events";
import WebSocket = require('ws');
import * as _ from 'underscore';

// *******************************************************************************************************
// LOCAL CONSTANTS & VARIABLES
// *******************************************************************************************************

const CLOSED_BY_CONSUMER = 4000;
const MONOCLE_API_URI    = "https://api.monoclecam.com/v1";

// Default Monocle Client Options/Configuration
const default_options = {
    reconnectInterval: 60000,  // 60 seconds
    perMessageDeflate: false
};

// *******************************************************************************************************
// MONOCLE HELPER/UTILITY/PRIVATE METHODS
// *******************************************************************************************************

/**
 * Reconnect to Monocle API Services
 * @param {MonocleClient} client - Monocle client instance
 */
function reconnect(client){
    client.emit("reconnecting", client._options.reconnectInterval);
    setTimeout(function(){
        client.start();
    }, client._options.reconnectInterval);
}

// *******************************************************************************************************
// MONOCLE CLIENT CLASS
// *******************************************************************************************************

/**
 * MonocleClient
 * ---------------
 * This class provides a connectin and communicate channel to the Monocle Platform
 */
export class MonocleClient extends EventEmitter {

    protected readonly _options:any;
    protected _ws:WebSocket;

    /**
     * Default constructor for MonocleClient class.
     *
     * @constructor
     * @param {Object} [options] - optional configuration options
     */
    constructor(options) {
        super();

        // merge user specified options with default options and set runtime options property
        if(options)
            this._options = _.defaults(options, default_options);
        else
            this._options = default_options;
    };

    /**
     * Start a session with the Monocle platform.
     */
    start(){
        let self = this;
        try {
            // init events
            self.emit("starting");
            self.emit("connecting");

            // create a web-socket options data structure
            // include the user's API authorization token as a Bearer token in the Auth header
            const websocketOptions = {
                headers: {
                    "Authorization": "Bearer " + this._options["monocle-api-token"]
                }
            };

            // create web-socket instance
            this._ws = new WebSocket(MONOCLE_API_URI, websocketOptions);

            // set auto reconnect interval on web-socket instance from options
            this._ws.autoReconnectInterval = this._options.reconnectInterval;

            // handle web-socket connected event
            this._ws.on('open', function open() {
                self.emit("connected");
            });

            // handle web-socket data received event
            this._ws.on('message', function (data, flags) {
                // API messages will be received as JSON encoded data
                let response = JSON.parse(data); // parse json message
                self.emit("data", response);  // raise event with json response object

                // iterate object keys and email events for each key
                Object.keys(response).forEach(function (key) {
                    self.emit(key, response[key]);
                });
            });

            // handle web-socket error event
            this._ws.on('error', function (err:Error) {
                if(err.message.endsWith("401")){
                    console.error("Monocle API Authentication Error; invalid or missing token.")
                }
                self.emit("error", err);
            });

            // handle web-socket connected closed event
            this._ws.on('close', function (code) {
                self.emit("closed", code);
                // if the web socket has disconnected and was not closed by the consumer,
                // then attempt to re-connect
                if (code !== CLOSED_BY_CONSUMER) {
                    reconnect(self);
                }
            });
        }
        catch(err){
            self.emit("error", err);

            // if the web socket has disconnected and was not closed by the consumer,
            // then attempt to re-connect
            reconnect(self);
        }
    };

    /**
     * Stop/Disconnect Monocle Client
     */
    stop():void{
        this.emit("stopping");
        this._ws.close(CLOSED_BY_CONSUMER);
    }

    /**
     * Send request to Monocle Platform
     * @param request json payload
     * @return {boolean} success
     */
    send(request:any):boolean{
        if(this._ws && this._ws.readyState === WebSocket.OPEN) {
            this._ws.send(JSON.stringify(request));
            return true;
        }
        return false;
    }

    /**
     * Subscribe to server side events on the Monocle Platform
     * @param {string | Array<string>} ids
     * @return {boolean}
     */
    subscribe(ids:string|Array<string>):boolean{
        return this.send({ sub: ids })
    }
};