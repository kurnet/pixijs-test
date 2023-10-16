import { ITextImageFormat } from "../Data/ITextImageFormat";
import { Helper } from "../Helper/helper";
import { BaseSceneContainer, EVT_EXIT_PRESSED } from "./BaseSceneContainer";
import { Assets, Container, Rectangle, Sprite, Text, TextStyle, Texture } from "pixi.js";
import * as TextLib from "../Data/text-lib";

export class ImageTextSceneContainer extends BaseSceneContainer {
    private _imgPool: Texture[] = [];

    private _msgContainer?: Container;
    private _penddingNext: boolean = false;

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

        Assets.add({ alias: "emoji", src: "imgs/emoji-ss.png" });
        Assets.add({ alias: "dollar", src: "imgs/dollar.svg" });
        Assets.load(["emoji", "dollar"]).then(() => {
            this.initImages();
            this.onShow();
        });
    }

    override onShow(): void {
        super.onShow();

        if (this._msgContainer) {
            this._msgContainer.destroy();
        }

        // Have a default data set for this scene default content 
        const defaultText: ITextImageFormat = {
            type: "text",
            sections: [
                {
                    type: 'text',
                    content: "Hello!",
                },
                {
                    type: 'image',
                    content: '0',
                },
                {
                    type: 'image',
                    content: '2',
                },
                {
                    type: 'text',
                    content: 'Going to Start!',
                }
            ]
        }

        let defaultStyle:TextStyle = new TextStyle({
            fontSize: this.isPortrait ? 24 : 42,
        });

        this._msgContainer = this.createMessageContainer(defaultText, defaultStyle);
        this.addChild(this._msgContainer);

        this.startRandom();
    }

    private startRandom(): void {
        if (!this._penddingNext) {
            this._penddingNext = true;
            Helper.TimeoutPromise(2000).then(() => {
                this._msgContainer?.destroy();

                this._msgContainer = this.randomMessage();
                this.addChild(this._msgContainer);

                this._penddingNext = false;
                if (this.parent && this.visible) {
                    this.startRandom();
                }
            })
        }

    }

    private initImages(): void {
        const sheetData = { w: 128, h: 128, row: 4, col: 4 };
        for (let vi = 0; vi < sheetData.row; ++vi) {
            for (let vj = 0; vj < sheetData.col; ++vj) {
                this._imgPool.push(new Texture(Texture.from("emoji").baseTexture,
                    new Rectangle(vi * sheetData.w, vj * sheetData.h, sheetData.w, sheetData.h)));
            }
        }

        this._imgPool.push(Texture.from("dollar"));
    }

    private randomMessage(): Container {

        const textImageFormat: ITextImageFormat = {
            type: "text",
            sections: [],
        }

        // give 40% chance to show price content
        const showPrice = Helper.GetRandomNumber(100, 0) < 40;

        if (showPrice) {
            // formating a price content
            textImageFormat.type = 'price';
            textImageFormat.sections.push({
                type: 'image',
                content: `${this._imgPool.length - 1}`,
            });
            textImageFormat.sections.push({
                type: 'text',
                content: Helper.GetRandomNumber(10000, 1000).toString(),
            });
        } else {
            // random how many section of the content
            const randSection = Helper.GetRandomNumber(10, 3);

            let vi = 0;
            for (vi = 0; vi < randSection; ++vi) {
                // random text or image
                const randType = Helper.GetRandomNumber(2, 0);
                textImageFormat.sections.push({
                    type: randType === 0 ? "text" : "image",
                    content: randType === 0 ? TextLib.textlib.texts.at(Helper.GetRandomNumber(TextLib.textlib.texts.length, 0))! :
                        Helper.GetRandomNumber(this._imgPool.length, 0).toString(),
                });
            }
        }

        const tarFontSize = this.isPortrait ? 24 : 48;
        const textStyle = new TextStyle({
            fontSize: Helper.GetRandomNumber(tarFontSize, tarFontSize),
        });
        

        return this.createMessageContainer(textImageFormat, textStyle);
    }

    private createMessageContainer(textImageFormat: ITextImageFormat, textStyle?: TextStyle): Container {
        const msgHost = new Container();

        let textHeight = -1;
        let pendingChild: Container[] = [];

        // create Text or Sprite from the format data
        textImageFormat.sections.forEach(data => {
            let initChild: Container;
            switch (data.type) {
                case "image":
                    {
                        let imgIn = Number.parseInt(data.content);
                        imgIn = Math.max(0, Math.min(imgIn, this._imgPool.length - 1));

                        initChild = new Sprite(this._imgPool[imgIn]);
                    }
                    break;
                case "text":
                    {
                        initChild = new Text(data.content, textStyle);
                        textHeight = initChild.height;
                    }
            }
            pendingChild.push(initChild);
        });

        let totalWidth = 0;
        let totalHeight = 0;
        let lastChild: Container | undefined;
        // add all the display object when know the size of text and do the scaling alignment
        pendingChild.forEach(child => {
            if (lastChild) {
                child.x = lastChild.x + lastChild.width;
            }
            child.scale.set(textHeight / child.height);
            lastChild = child;

            totalWidth += child.width;
            totalHeight = child.height;

            msgHost.addChild(child);
        });

        pendingChild = [];

        // try to center the content in this screen
        msgHost.x = (this.screenWidth - totalWidth) / 2;
        msgHost.y = (this.screenHeight - totalHeight) / 2;
        return msgHost;
    }
}