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

// import Monocle classes
import { Camera,
         CameraController,
         CameraSource,
         MonocleClient,
         PTZControllerService} from "./monocle";

// import 'fs-extra' library (https://github.com/jprichardson/node-fs-extra)
import * as fs from 'fs-extra';

const path = require('path');

/**
 * **************************************************************************
 * LOAD USER CONFIG
 * **************************************************************************
 */

let config:any = null;

// first look in the user's home directory for a '.monocle' directory with a 'config.json' file in it
let configFile = path.join(require('os').homedir(), ".monocle", "config.json");
if(!fs.existsSync(configFile)){
    // if we don't find a config file in the user's home directory, then look here in the app path
   configFile = "./config.json";
}

// if we still can't find a config file, then we have to abort
if(!fs.existsSync(configFile)) {
    console.error("UNABLE TO FIND 'config.json' FILE!; ABORTING PROGRAM");
    process.exit(1);
}

// load configuration file from config path
config = fs.readJsonSync(configFile);

// validate that we have a 'monocle-api-token' config attribute defined
if(!config["monocle-api-token"]){
    console.error("UNABLE TO FIND 'monocle-api-token' attribute in 'config.json' FILE!; ABORTING PROGRAM");
    process.exit(1);
}

/**
 * **************************************************************************
 * CREATE MONOCLE CLIENT, PTZ SERVICE and CAMERA CONTROLLER INSTANCES
 * **************************************************************************
 */

const monocle = new MonocleClient(config);
const ptzService = new PTZControllerService(config);
const cameraController = new CameraController(config);

/**
 * **************************************************************************
 * LOG EVENTS FROM THE MONOCLE CLIENT
 * **************************************************************************
 */

monocle.on('connected', ()=> {
    console.log("[Monocle Connected Event]");

    // after connection, subscribe to the "alexa.source"; this will provide
    // events to us when the camera source changes on the Alexa services
    // via a video-enabled Echo device (Echo Show, Echo Spot) or Fire TV.
    monocle.subscribe("alexa.source");
});

monocle.on('error', (err:Error)=> {
    console.error("[Monocle Error Event]", err.message);
});

monocle.on('closed', ()=> {
    console.log("[Monocle Disconnected Event]");
});

monocle.on('reconnecting', (interval:number)=> {
    console.log("[Monocle Reconnecting Event]", `... in ${interval/1000} seconds`);
});


/**
 * **************************************************************************
 * LOG EVENTS FROM THE MONOCLE PTZ CONTROLLER SERVICE
 * **************************************************************************
 */

ptzService.on("connected", (client:any)=> {
    console.log("[PTZ Controller Service  - Client Connected]" ,client);
});

ptzService.on("disconnected", (client:any)=> {
    console.log("[PTZ Controller Service  - Client Disconnected]" ,client);
});

ptzService.on("stop", (client:any)=> {
    console.log("[PTZ Controller Service  - STOP]", client);
    cameraController.stop().then(()=>{
        console.log("[PTZ Controller Service  - STOPPED]");
    }).catch((err:Error)=>{
        console.error("[PTZ Controller Service  - STOP ERROR]", err);
    });
});

ptzService.on("home", (client:any)=> {
    console.log("[PTZ Controller Service  - HOME]", client);
    cameraController.gotoHome().then(()=>{
        console.log("[PTZ Controller Service  - HOME]");
    }).catch((err:Error)=>{
        console.error("[PTZ Controller Service  - HOME ERROR]", err);
    });
});

ptzService.on("preset", (client:any, token:string)=> {
    console.log("[PTZ Controller Service  - Recall Preset]", client, token);
    cameraController.gotoPreset(token).then(()=>{
        console.log("[PTZ Controller Service  - RECALLED PRESET]", token);
    }).catch((err:Error)=>{
        console.error("[PTZ Controller Service  - RECALL PRESET ERROR]", err);
    });
});

ptzService.on("ptz", (client:any, pan:number, tilt:number, zoom:number)=> {
    console.log("[PTZ Controller Service  - Move Camera]", client, pan, tilt, zoom);
    cameraController.ptz(pan, tilt, zoom).then(()=>{
        console.log("[PTZ Controller Service  - PTZ]", pan, tilt, zoom);
    }).catch((err:Error)=>{
        console.error("[PTZ Controller Service  - PTZ ERROR]", err);
    });
});

ptzService.on("pan", (client:any, pan:number)=> {
    console.log("[PTZ Controller Service  - Pan Camera]", client, pan);
    cameraController.pan(pan).then(()=>{
        console.log("[PTZ Controller Service  - PAN]", pan);
    }).catch((err:Error)=>{
        console.error("[PTZ Controller Service  - PAN ERROR]", err);
    });
});

ptzService.on("tilt", (client:any, tilt:number)=> {
    console.log("[PTZ Controller Service  - Tilt Camera]", client, tilt);
    cameraController.tilt(tilt).then(()=>{
        console.log("[PTZ Controller Service  - TILT]", tilt);
    }).catch((err:Error)=>{
        console.error("[PTZ Controller Service  - TILT ERROR]", err);
    });
});

ptzService.on("zoom", (client:any, zoom:number)=> {
    console.log("[PTZ Controller Service  - Pan Zoom]", client, zoom);
    cameraController.zoom(zoom).then(()=>{
        console.log("[PTZ Controller Service  - ZOOM]", zoom);
    }).catch((err:Error)=>{
        console.error("[PTZ Controller Service  - ZOOM ERROR]", err);
    });
});

ptzService.on("error", (err:Error)=> {
    console.error("[PTZ Controller Service  - ERROR]", err);
});


/**
 * **************************************************************************
 * LOG EVENTS FROM THE MONOCLE CAMERA CONTROLLER
 * **************************************************************************
 */

cameraController.on("error", (err:Error)=> {
    console.error("[Camera Controller - ERROR]", err);
});

cameraController.on("stop", ()=> {
    console.log("[Camera Controller - STOPPED]");
});

cameraController.on("home", ()=> {
    console.log("[Camera Controller - HOME]");
});

cameraController.on("preset", (token:string)=> {
    console.log("[Camera Controller - RECALLED PRESET]", token);
});

cameraController.on("ptz", (pan:number, tilt:number, zoom:number)=> {
    console.log("[Camera Controller - PTZ]", pan, tilt, zoom);
});

cameraController.on("pan", (pan:number)=> {
    console.log("[Camera Controller - PAN]", pan);
});

cameraController.on("tilt", (tilt:number)=> {
    console.log("[Camera Controller - TILT]", tilt);
});

cameraController.on("zoom", (zoom:number)=> {
    console.log("[Camera Controller - ZOOM]", zoom);
});


/**
 * **************************************************************************
 * LISTEN FOR CAMERA SOURCE CHANGES ON THE ALEXA SERVICE
 * **************************************************************************
 */
monocle.on('alexa.source', (data:any)=> {

    // convert the data data received into a source object
    let source = new CameraSource(data);

    console.log("-------------------------------------------------");
    console.log("ACTIVE ALEXA CAMERA: ", source.name);
    console.log("-------------------------------------------------");

    cameraController.initialize(source).then((camera)=>{
        console.log("-- active camera source ready for control:", camera.name);
        ptzService.updateActiveCamera(camera);
    }).catch((err) => {
        ptzService.updateActiveCamera(new Camera({source: source, error: err.message}));
        console.error("-- active camera source failed to initialize:", source.name);
        console.error(err);
    });
});


/**
 * **************************************************************************
 * START THE MONOCLE CLIENT
 * **************************************************************************
 */
// the client will attempt to maintain a connection with the Monocle services
// if it gets disconnected, it will continue to retry to connect.
monocle.start();

// welcome
console.log(" ******************************************************************\r\n" +
            " *             __  __  ___  _  _  ___   ___ _    ___              *\r\n" +
            " *            |  \\/  |/ _ \\| \\| |/ _ \\ / __| |  | __|             *\r\n" +
            " *            | |\\/| | (_) | .` | (_) | (__| |__| _|              *\r\n" +
            " *            |_|  |_|\\___/|_|\\_|\\___/ \\___|____|___|             *\r\n" +
            " *                                                                *\r\n" +
            " ******************************************************************\r\n");
console.log("-------------------------------------------------");
console.log("MONOCLE GATEWAY SERVICE STARTED");
console.log("-------------------------------------------------");

