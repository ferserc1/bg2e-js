
import { MouseButtonEventType, createMouseEvent } from "./MouseEvent";
import { createTouchEvent } from "./TouchEvent";
import { createKeyboardEvent } from "./KeyboardEvent";

export const FrameUpdate = {
    AUTO: 0,
    MANUAL: 1
};

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

        this._mouseStatus = {
            pos: {x: 0, y: 0},
            leftButton: false,
            middleButton: false,
            rightButton: false
        };

        Object.defineProperty(this._mouseStatus, "anyButton", {
            get: () => this.leftButton || this.middleButton || this.rightButton
        });
    }

    get canvas() { return this._canvas; }
    get appContoller() { return this._appController; }

    get updateMode() { return this._updateMode; }
    set updateMode(um) { this._updateMode = um; }

    get mouseStatus() { return this._mouseStatus; }

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


function initEvents(mainLoop) {
    onResize(mainLoop);

    const c = mainLoop.canvas.domElement;
    c.__mainLoop = mainLoop;
    c.addEventListener("mousedown", evt => {
        onMouseDown(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });
    c.addEventListener("mousemove", evt => {
        onMouseMove(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });
    c.addEventListener("mouseout", evt => {
        onMouseOut(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });
    
    c.addEventListener("mouseover", evt => {
        onMouseOver(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });

    c.addEventListener("mouseup", evt => {
        onMouseUp(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });
    
    c.addEventListener("touchstart", evt => {
        onTouchStart(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });

    c.addEventListener("touchmove", evt => {
        onTouchMove(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });
    
    c.addEventListener("touchend", evt => {
        onTouchEnd(evt, evt.target.__mainLoop);
        evt.stopPropagation();
    });

    const mouseWheelEvt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
    c.addEventListener(mouseWheelEvt, evt => {
        onMouseWheel(evt, evt.target.__mainLoop);
        evt.stopPropagation()
    });

    window.addEventListener("keydown", evt => onKeyDown(evt));
    window.addEventListener("keyup", evt => onKeyUp(evt));

    c.oncontextmenu = evt => false;
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

function onMouseDown(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.DOWN);
    mainLoop.appController.mouseDown(bg2Event);
    return bg2Event;
}

function onMouseMove(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    mainLoop.appContoller.mouseMove(bg2Event);
    if (mainLoop._mouseStatus.anyButton) {
        mainLoop.appContoller.mouseDrag(bg2Event);
    }
    return bg2Event;
}

function onMouseOut(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    mainLoop.appController.mouseOut(bg2Event);
    return bg2Event;
}

function onMouseOver(evt,mainLoop) {
    return onMouseMove(evt,mainLoop)
}

function onMouseUp(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.UP);
    mainLoop.appController.mouseUp(bg2Event);
    return bg2Event;
}

function onMouseWheel(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    bg2Event.delta = evt.wheelDelta ? evt.wheelDelta * -1 : evt.detail * 10;
    mainLoop.appContoller.mouseWheel(bg2Event);
    return bg2Event;
}

function onTouchStart(evt,mainLoop) {
    const bgEvent = createTouchEvent(evt,mainLoop);
    mainLoop.appController.touchStart(bgEvent);
    return bgEvent;
}

function onTouchMove(evt,mainLoop) {
    const bgEvent = createTouchEvent(evt,mainLoop);
    mainLoop.appContoller.touchMove(bgEvent);
    return bgEvent;
}

function onTouchEnd(evt,mainLoop) {
    const bgEvent = createTouchEvent(evt,mainLoop);
    mainLoop.appContoller.touchEnd(bgEvent);
    return bgEvent;
}

function onKeyDown(evt,mainLoop) {
    const bgEvent = createKeyboardEvent(evt);
    mainLoop.appController.keyDown(bgEvent);
    return bgEvent;
}

function onKeyUp(evt,mainLoop) {
    const bgEvent = createKeyboardEvent(evt);
    mainLoop.appContoller.keyUp(bgEvent);
    return bgEvent;
}