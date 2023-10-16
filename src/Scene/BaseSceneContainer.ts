import { Application, Container, DisplayObjectEvents } from "pixi.js";

export const EVT_EXIT_PRESSED = "evt_exit_pressed" as (keyof DisplayObjectEvents);

export class BaseSceneContainer extends Container {
    protected screenWidth:number;
    protected screenHeight:number;

    constructor(app:Application) {
        super();
        this.screenWidth = app.screen.width;
        this.screenHeight = app.screen.height;

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