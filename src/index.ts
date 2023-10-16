import { Application, Text } from 'pixi.js'
import { BaseSceneContainer, EVT_EXIT_PRESSED } from './Scene/BaseSceneContainer';
import { EVT_MODES_PRESSED, MainMenuContainer, TestMode } from './Scene/MenuScene';
import { CardTestSceneContainer } from './Scene/CardTestScene';
import { Group } from 'tweedle.js';
import { ImageTextSceneContainer } from './Scene/ImageTextScene';
import { FireTestSceneContainer } from './Scene/FireTestScene';

const eleCanvas = document.getElementById("pixi-canvas") as HTMLCanvasElement;

const app = new Application({
    view: eleCanvas,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: 1280,
    height: 720,
});

// scenes array hold by root for passing app ticker
const scenes: BaseSceneContainer[] = [];


const menuScene: MainMenuContainer = new MainMenuContainer(app);
scenes.push(menuScene);

app.stage.addChild(menuScene);

const cardTestScene: CardTestSceneContainer = new CardTestSceneContainer(app);
scenes.push(cardTestScene);

const imgTextScene: ImageTextSceneContainer = new ImageTextSceneContainer(app);
scenes.push(imgTextScene);

const fireTestScene: FireTestSceneContainer = new FireTestSceneContainer(app);
fireTestScene.hitArea = app.screen;
scenes.push(fireTestScene);

app.ticker.add((_ => {
    Group.shared.update();
    scenes.forEach(s => s.update(app.ticker.deltaMS))
}));

const fpsContainer = new BaseSceneContainer(app);
const fpsText = new Text('FPS');
fpsContainer.addChild(fpsText);
// make it short to override update function here for FPS
fpsContainer.update = (_) => {
    fpsText.text = `FPS : ${Math.floor(app.ticker.FPS)}`;
}
scenes.push(fpsContainer);
app.stage.addChild(fpsContainer);

// Listening Menu when Mode selection, and always keep fps on the top
menuScene.on(EVT_MODES_PRESSED, (mode: TestMode) => {
    switch (mode) {
        case 'card':
            app.stage.addChildAt(cardTestScene, 0);
            break;
        case 'text':
            app.stage.addChildAt(imgTextScene, 0);
            break;
        case 'fire':
            app.stage.addChildAt(fireTestScene, 0);
            break;
    };
    app.stage.removeChild(menuScene);
})

scenes.forEach(scene => {
    scene.on(EVT_EXIT_PRESSED, () => {
        app.stage.addChildAt(menuScene, 0);
        app.stage.removeChild(scene);
    });
});
