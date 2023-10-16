export interface ITextImageFormat {
    type: "text"|"price",
    sections: {
        type:"text"|"image",
        content:string,
    }[],
}