import { BaseSceneContainer, EVT_EXIT_PRESSED } from "./BaseSceneContainer";
import { Text } from "pixi.js";

export class FireTestSceneContainer extends BaseSceneContainer{
    override onInit(): void {
        super.onInit();

        const btnExit = new Text('Quit');
        btnExit.anchor.set(1, 0);
        btnExit.position.set(this.screenWidth - 50, 10);
        this.addChild(btnExit);

        btnExit.eventMode = "static";
        btnExit.cursor = "pointer";
        btnExit.on('pointerdown', () => {
            this.emit(EVT_EXIT_PRESSED);
        });

    }
}