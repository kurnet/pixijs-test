import { Sprite, Texture } from "pixi.js";

export class CardSprite extends Sprite {
    private _face?:Texture;
    private _cardBack?:Texture;

    public setCardFace(face:Texture){
        this._face = face;
    }

    public reveal() :void {
        if(this._face){
            this._cardBack = this.texture;

            this.texture = this._face;
        }        
    }

    public cover(): void{
        if(this._cardBack){
            this.texture = this._cardBack;
        }        
    }
}