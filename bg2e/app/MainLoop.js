
import MouseEvent, { MouseButton } from "./MouseEvent";

export const FrameUpdate = {
    AUTO: 0,
    MANUAL: 1
};


function initEvents(mainLoop) {
    onResize(mainLoop);

    const c = mainLoop.canvas.domElement;
    c.__mainLoop = mainLoop;
    c.addEventListener("mousedown", evt => {
        const ml = evt.target.__mainLoop;
        onMouseDown(evt, ml);
        evt.stopPropagation();
    })
}

function onMouseDown(evt,mainLoop) {
    const offset = mainLoop.canvas.domElement.getBoundingClientRect();
    mainLoop._mouseStatus = {
        pos: { x: evt.clientX - offset.left , y: evt.clientY - offset.top },
        leftButton: evt.button === MouseButton.LEFT,
        middleButton: evt.button === MouseButton.MIDDLE,
        rightButton: evt.button === MouseButton.RIGHT
    };

    const bgEvent = new MouseEvent(evt.button, mainLoop._mouseStatus.pos.x, mainLoop._mouseStatus.pos.y, 0, evt);
    mainLoop.appController(bgEvent);
    return bgEvent;
}

const g_animationLoop = {
    lastTime: 0,
    mainLoop: []
};

function animationLoop(totalTime) {
    totalTime = totalTime || 0;
    requestAnimationFrame(animationLoop);
    const elapsed = totalTime - g_animationLoop.lastTime;
    g_animationLoop.lastTime = totalTime;
    g_animationLoop.mainLoop.forEach(ml => {
        onUpdate(ml,elapsed);
    });
}

export default class MainLoop {
    constructor({ canvas, appController }) {
        this._canvas = canvas;
        this._canvas._mainLoop = this;
        this._appController = appController;
        this._updateMode = FrameUpdate.AUTO;
        this._redisplayFrames = 1;
    }

    get canvas() { return this._canvas; }
    get appContoller() { return this._appController; }

    get updateMode() { return this._updateMode; }
    set updateMode(um) { this._updateMode = um; }

    get redisplay() { return this._redisplayFrames>0; }

    run() {
        this.appContoller.init();
        initEvents(this.canvas);
        g_animationLoop.mainLoop.push(this);
        animationLoop();
    }

    exit() {
        const i = g_animationLoop.mainLoop.indexOf(this);
        if (i!==-1) {
            g_animationLoop.mainLoop.splice(i,1);
        }
    }

    postReshape() {
        onResize(this);
    }

    postRedisplay(frames=2) {
        this._redisplayFrames = frames;
    }
}

function onResize(mainLoop) {
    mainLoop.appController.reshape(mainLoop.canvas.width, mainLoop.canvas.height);
}

function onUpdate(mainLoop, elapsed) {
    if (mainLoop.redisplay) {
        if (mainLoop.updateMode === FrameUpdate.AUTO) {
            mainLoop._redisplayFrames = 1;
        }
        else {
            mainLoop._redisplayFrames--;
        }
        mainLoop.appController.frame(elapsed);
        mainLoop.appController.display();
    }
}