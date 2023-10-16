import { Application, Container, DisplayObjectEvents } from "pixi.js";

export const EVT_EXIT_PRESSED = "evt_exit_pressed" as (keyof DisplayObjectEvents);

// Have a base container class for basic scene handling
export class BaseSceneContainer extends Container {
    protected screenWidth:number;
    protected screenHeight:number;
    protected isPortrait:boolean = false;
    
    constructor(app:Application) {
        super();
        this.screenWidth = app.screen.width;
        this.screenHeight = app.screen.height;

        this.isPortrait = this.screenHeight > this.screenWidth;
        this.once('added', this.onInit);
    }

    onInit():void {
        this.on('added', this.onShow);
    }

    onShow():void { 
    }

    update(_:number) {   
    }
}