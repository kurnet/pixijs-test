import { DisplayObjectEvents, TextStyle, Text } from "pixi.js";
import { BaseSceneContainer } from "./BaseSceneContainer";

export const EVT_MODES_PRESSED = "evt_modes_pressed" as (keyof DisplayObjectEvents);

export type TestMode = "card" | "text" | "fire";

export class MainMenuContainer extends BaseSceneContainer {
    override onInit() {
        super.onInit();

        const style = new TextStyle({
            fill: "#11ff00",
            fontFamily: "Comic Sans MS",
            fontSize: 42,
            fontVariant: "small-caps",
            fontWeight: "bold",
            strokeThickness: 5
        });
        const txtCard = new Text('Card Test', style);
        txtCard.anchor.set(0.5, 0.5);
        txtCard.position.set(this.screenWidth / 2, this.screenHeight * 0.35);
        this.addChild(txtCard);

        txtCard.eventMode = "static";
        txtCard.cursor = "pointer";
        txtCard.on('pointerdown', () => {
            this.emit(EVT_MODES_PRESSED, "card");
        });


        const imgTextStyle = Object.assign({}, style);
        imgTextStyle.fill = "#33ffff";
        imgTextStyle.fontSize = 42;

        const txtImgText = new Text(`Image Text Test`, imgTextStyle);
        txtImgText.anchor.set(0.5, 0.5);
        txtImgText.position.set(this.screenWidth / 2, txtCard.position.y + 100);
        this.addChild(txtImgText);

        txtImgText.eventMode = "static";
        txtImgText.cursor = "pointer";
        txtImgText.on('pointerdown', () => {
            this.emit(EVT_MODES_PRESSED, "text");
        });

        const fireStyle = Object.assign({}, style);
        fireStyle.fill = "#ff6f00";
        fireStyle.fontSize = 36;

        const txtfireTest = new Text(`Fire Particles Test`, fireStyle);
        txtfireTest.anchor.set(0.5, 0.5);
        txtfireTest.position.set(this.screenWidth / 2, txtImgText.position.y + 100);
        this.addChild(txtfireTest);

        txtfireTest.eventMode = "static";
        txtfireTest.cursor = "pointer";
        txtfireTest.on('pointerdown', () => {
            this.emit(EVT_MODES_PRESSED, "fire");
        });

    }
}