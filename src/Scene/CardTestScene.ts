import { Assets, Color, Container, Graphics, Point, Rectangle, Texture, Text } from "pixi.js";
import { BaseSceneContainer, EVT_EXIT_PRESSED } from "./BaseSceneContainer"
import { CardSprite } from "../Objects/CardSprite";
import { Helper } from "../Helper/helper";
import { Easing, Tween } from "tweedle.js";

export class CardTestSceneContainer extends BaseSceneContainer {
    private _assetsKey: string[] = [];
    private _cardBackKey: string = "card-back";
    private _cardFaceKeyPrefix: string = "card-face-0";

    private _numOfCard: number = 144;
    private _cardOffset: { x: number, y: number } = { x: 0.2, y: 0.7 };

    private _cards: CardSprite[] = [];
    private _movedCards: CardSprite[] = [];
    private _moving: boolean = false;

    private _cardsTexPool: Texture[] = [];
    private _randCardsPool: number[] = [];

    private _leftDeck?: Container;
    private _rightDeck?: Container;

    override onInit(): void {
        super.onInit();

        this._assetsKey.push(this._cardBackKey);
        Assets.add({ alias: this._cardBackKey, src: "imgs/card-back.png" });
        for (let vi = 1; vi <= 4; ++vi) {
            const cardFaceKey = `${this._cardFaceKeyPrefix}${vi}`;
            Assets.add({ alias: cardFaceKey, src: `imgs/${this._cardFaceKeyPrefix}${vi}.png` });

            this._assetsKey.push(cardFaceKey);
        }


        this._leftDeck = new Container();
        const leftDeckBg = new Graphics();

        leftDeckBg.beginFill(new Color(0x4ca832).toArray(), 1);
        leftDeckBg.drawRect(10, 50, this.screenWidth / 2 - 20, this.screenHeight - 100);
        this._leftDeck.addChild(leftDeckBg);

        this.addChild(this._leftDeck);

        this._rightDeck = new Container();
        const rightDeckBg = new Graphics();

        rightDeckBg.beginFill(new Color(0xe2e62e).toArray(), 1);
        rightDeckBg.drawRect(10, 50, this.screenWidth / 2 - 20, this.screenHeight - 100);
        this._rightDeck.addChild(rightDeckBg);

        this._rightDeck.x = this.screenWidth / 2;
        this.addChild(this._rightDeck);

        const btnExit = new Text('Quit');
        btnExit.anchor.set(1, 0);
        btnExit.position.set(this.screenWidth - 50, 10);
        this.addChild(btnExit);

        btnExit.eventMode = "static";
        btnExit.cursor = "pointer";
        btnExit.on('pointerdown', () => {
            this.emit(EVT_EXIT_PRESSED);
        });

        // load all the sprite sheet for this scene
        Assets.load(this._assetsKey).then(() => {
            this.initCardDeck();
            this.forwardCard(2);
        });

    }

    override onShow(): void {
        super.onShow();

        this.forwardCard(1)
    }

    private moveCard(srcAry: CardSprite[], tarAry: CardSprite[], delaySec: number, offsetToX: number,
        onCardMoved: (card: CardSprite) => void, onComplete: () => void) {
        // on hold if the scene is not showing 
        if (this.parent == null || this._moving) {
            return;
        }

        if (srcAry.length > 0) {
            this._moving = true;

            const stPos: Point = new Point(20, 100);

            const lastCard = srcAry.pop();
            if (lastCard) {
                const cardIn = tarAry.length;

                const tarPos = { x: stPos.x + cardIn * this._cardOffset.x, y: 100 + cardIn * this._cardOffset.y };
                tarPos.x += offsetToX;

                const moveTween = new Tween(lastCard.position).to(tarPos, 2000).onComplete(() => {
                    this._moving = false;
                    onCardMoved(lastCard);
                });
                moveTween.easing(Easing.Quadratic.Out);
                moveTween.start(delaySec * 1000);

                tarAry.push(lastCard);
            }
        } else {
            onComplete();
        }
    }

    // a animation sequence from left -> right
    private forwardCard(delaySec: number): void {
        const toRightScreenX = this.screenWidth / 2;

        this.moveCard(this._cards, this._movedCards, delaySec, toRightScreenX, (card: CardSprite) => {
            // when the card aarrived then add to the right panel container
            this._rightDeck!.addChild(card);

            // revert the position fake arrived at the same position
            card.x -= toRightScreenX;
            this.forwardCard(1);
        }, () => {
            this.backward(2);
        });
    }

    // a animation sequence from right -> left
    private backward(delaySec: number): void {
        const toLeftScreenX = this.screenWidth / 2 * -1;

        this.moveCard(this._movedCards, this._cards, delaySec, toLeftScreenX, (card: CardSprite) => {
            // add the card back to this container but always bottom of the right panel
            this.addChildAt(card, this.children.indexOf(this._rightDeck!));
            card.x -= toLeftScreenX;
            this.backward(1);
        }, () => {
            // when all card done, reorder the right panel to mostly bottom
            this.addChildAt(this._rightDeck!, 1);
            this.forwardCard(2);
        });
    }

    private initCardDeck(): void {
        // generate card textures library
        const sheetData = { symbol: 4, count: 13 };

        const cardSheetData = { w: 88, h: 124, row: 5, count: 13 };

        for (let vs = 1; vs <= sheetData.symbol; ++vs) {
            for (let vc = 0; vc < sheetData.count; ++vc) {
                const pickCol = vc % cardSheetData.row;
                const pickRow = Math.floor(vc / cardSheetData.row);

                const pickRctangle = new Rectangle(pickCol * cardSheetData.w, pickRow * cardSheetData.h, cardSheetData.w, cardSheetData.h);

                this._cardsTexPool.push(new Texture(Texture.from(`${this._cardFaceKeyPrefix}${vs}`).baseTexture, pickRctangle));
            }
        }

        const stPos: Point = new Point(20, 100);

        // create all the card from sprite frame and added to the left side
        for (let vi = 0; vi < this._numOfCard; ++vi) {
            const cardBackTex = Texture.from("card-back");
            cardBackTex.frame = new Rectangle(0, 0, 88, 124);

            const card = new CardSprite(cardBackTex);

            card.position.x = stPos.x + this._cardOffset.x * vi;
            card.position.y = stPos.y + this._cardOffset.y * vi;

            this.addChild(card);

            card.setCardFace(this.randomPickCard());

            card.reveal();

            this._cards.push(card);
        }
    }

    private randomPickCard(): Texture {
        // create the range of the texture index avoid much duplication
        if (this._randCardsPool.length == 0) {
            this._cardsTexPool.forEach((_, vi) => {
                this._randCardsPool.push(vi);
            });

            // shuffle the order of the card
            this._randCardsPool = Helper.ShuffleArray(this._randCardsPool);
        }


        return this._cardsTexPool[this._randCardsPool.pop()!];
    }
}