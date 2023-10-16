import { BaseSceneContainer, EVT_EXIT_PRESSED } from "./BaseSceneContainer";
import { Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import * as particles from "@pixi/particle-emitter"

export class FireTestSceneContainer extends BaseSceneContainer {
    private _emitter?: particles.Emitter;

    private _emitterHost?: Container;

    override onInit(): void {
        super.onInit();

        const btnExit = new Text("Quit");
        btnExit.anchor.set(1, 0);
        btnExit.position.set(this.screenWidth - 50, 10);
        this.addChild(btnExit);

        btnExit.eventMode = "static";
        btnExit.cursor = "pointer";
        btnExit.on("pointerdown", () => {
            this.emit(EVT_EXIT_PRESSED);
        });

        const bgColor = new Graphics();
        bgColor.beginFill(0, 1);
        bgColor.drawRect(0, 50, this.screenWidth, this.screenHeight);
        this.addChild(bgColor);

        this._emitterHost = new Container();
        this.addChild(this._emitterHost);

        Assets.load([
            { alias: "logs-img", src: "imgs/logs.png" },
            { alias: "circle-img", src: "imgs/hardCircle.png" }
        ]).then(() => {
            // load particle json after images assets loaded and before use.
            Assets.load([
                { alias: "config", src: "particles/emitter-fire04.json" }
            ]).then((res: any) => {
                const logSprite = Sprite.from("logs-img");
                logSprite.anchor.set(0.5, 1);
                logSprite.position.set(this.screenWidth / 2, this.screenHeight / 2);
                this._emitterHost?.addChild(logSprite);

                this._emitter = new particles.Emitter(this._emitterHost!, particles.upgradeConfig(res["config"], [Texture.from("circle-img")]));
                this._emitter.updateSpawnPos(this.screenWidth / 2, this.screenHeight / 2 - 65);
                this._emitter.emit = true;

                this.eventMode = "static";
                this.on("mousemove", event => {
                    this._emitter?.updateSpawnPos(event.global.x, event.global.y - 65);

                    logSprite.x = event.global.x;
                    logSprite.y = event.global.y - 40;
                });
            });
        })

    }

    override update(dt: number): void {
        super.update(dt);

        this._emitter?.update(dt * 0.001);
    }
}