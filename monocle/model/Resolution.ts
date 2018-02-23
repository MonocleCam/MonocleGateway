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


/**
 * Display Resolution
 */
export class Resolution {

    public static _1920x1080():Resolution{
        return Resolution.instance(1920, 1080);
    }

    public static _1280x720():Resolution{
        return Resolution.instance(1280, 720);
    }

    public static _1600x1200():Resolution{
        return Resolution.instance(1600, 1200);
    }

    public static _1024x768():Resolution{
        return Resolution.instance(1024, 768);
    }

    public static _800x600():Resolution{
        return Resolution.instance(800, 600);
    }

    public static _640x480():Resolution{
        return Resolution.instance(640, 480);
    }

    public static _320x240():Resolution{
        return Resolution.instance(320, 240);
    }

    public static instance(width:number, height:number):Resolution{
        return new Resolution({ height: height, width: width });
    }

    /**
     * resolution width (number of pixels)
     */
    public width:number;

    /**
     * resolution height (number of pixels)
     */
    public height:number;

    /**
     * Default Constructor
     * @param source data object to populate the class
     */
    constructor(source?:any){
        // set initial values from source object
        if(source){
            if(source.width) this.width = source.width;
            if(source.height) this.height = source.height;
        }
    }
}