
import { Canvas } from "./Canvas";
import { AppController } from "./AppController";

import { 
    MouseButtonEventType, 
    createMouseEvent, 
    leftMouseButton,
    middleMouseButton,
    clearMouseButtons,
    setMouseButton
} from "./MouseEvent";
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

async function animationLoop(totalTime) {
    totalTime = totalTime || 0;
    requestAnimationFrame(animationLoop);
    const elapsed = totalTime - g_animationLoop.lastTime;
    g_animationLoop.lastTime = totalTime;
    for (const ml of g_animationLoop.mainLoop) {
        await onUpdate(ml, elapsed);
    }
}

class MouseStatus {
    constructor() {
        this.pos = {x: 0, y: 0};
        this.leftButton = false;
        this.middleButton = false;
        this.rightButton = false;
    }

    get anyButton() { return this.leftButton || this.middleButton || this.rightButton; }
}

export default class MainLoop {
    constructor(canvas: Canvas, appController: AppController);

    get canvas() : Canvas;
    get appController() : AppController;
    get renderer() { return this._canvas?.renderer; }

    get updateMode() { return this._updateMode; }
    set updateMode(um) { this._updateMode = um; }

    get mouseStatus() { return this._mouseStatus; }

    get redisplay() { return this._redisplayFrames>0; }

    async run() {
        await this.canvas.init();
        await this.appController.init();
        initEvents(this);
        g_animationLoop.mainLoop.push(this);
        animationLoop();
    }

    exit() {
        this.appController.destroy();
        const i = g_animationLoop.mainLoop.indexOf(this);
        if (i!==-1) {
            g_animationLoop.mainLoop.splice(i,1);
        }
    }

    postReshape() {
        onResize(this);
    }

    postRedisplay({ frames=2,timeout=10 } = {}) {
        if (timeout <= 0) {
            this._redisplayFrames = frames;
        }
        else {
            setTimeout(() => this._redisplayFrames = frames, timeout);
        }
    }
}


function initEvents(mainLoop) {
    onResize(mainLoop);

    const handlePropagation = (bgEvt,evt) => {
        if (bgEvt.isEventPropagationStopped) {
            evt.stopPropagation();
            evt.preventDefault();
            return false;
        }
        return true;
    }

    const c = mainLoop.canvas.domElement;
    c.__mainLoop = mainLoop;
    c.addEventListener("mousedown", evt => {
        return handlePropagation(onMouseDown(evt, evt.target.__mainLoop), evt);
    });
    c.addEventListener("mousemove", evt => {
        return handlePropagation(onMouseMove(evt, evt.target.__mainLoop), evt);
    });
    c.addEventListener("mouseout", evt => {
        return handlePropagation(onMouseOut(evt, evt.target.__mainLoop), evt);
    });
    
    c.addEventListener("mouseover", evt => {
        return handlePropagation(onMouseOver(evt, evt.target.__mainLoop), evt);
    });

    c.addEventListener("mouseup", evt => {
        return handlePropagation(onMouseUp(evt, evt.target.__mainLoop), evt);
    });
    
    c.addEventListener("touchstart", evt => {
        return handlePropagation(onTouchStart(evt, evt.target.__mainLoop), evt);
    });

    c.addEventListener("touchmove", evt => {
        return handlePropagation(onTouchMove(evt, evt.target.__mainLoop), evt);
    });
    
    c.addEventListener("touchend", evt => {
        return handlePropagation(onTouchEnd(evt, evt.target.__mainLoop), evt);
    });

    const mouseWheelEvt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
    c.addEventListener(mouseWheelEvt, evt => {
        return handlePropagation(onMouseWheel(evt, evt.target.__mainLoop), evt);
    });

    window.addEventListener("keydown", evt => {
        g_animationLoop.mainLoop.forEach(ml => onKeyDown(evt, ml));
    });

    window.addEventListener("keyup", evt => {
        g_animationLoop.mainLoop.forEach(ml => onKeyUp(evt, ml));
    });

    window.addEventListener("resize", evt => {
        onResize(mainLoop);
    });

    c.oncontextmenu = evt => false;
}

function onResize(mainLoop) {
    const dpi = window.devicePixelRatio;
    mainLoop.appController.reshape(mainLoop.canvas.width * dpi, mainLoop.canvas.height * dpi);
}

async function onUpdate(mainLoop, elapsed) {
    if (mainLoop.redisplay) {
        if (mainLoop.updateMode === FrameUpdate.AUTO) {
            mainLoop._redisplayFrames = 1;
        }
        else {
            mainLoop._redisplayFrames--;
        }
        if (mainLoop._redisplayFrames > 0) {
            await mainLoop.appController.frame(elapsed);
            mainLoop.appController.display();
        }
    }
}

function onMouseDown(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.DOWN);
    setMouseButton(bg2Event, true);
    mainLoop.appController.mouseDown(bg2Event);
    return bg2Event;
}

function onMouseMove(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    mainLoop.appController.mouseMove(bg2Event);
    if (mainLoop.mouseStatus.anyButton) {
        mainLoop.appController.mouseDrag(bg2Event);
    }
    return bg2Event;
}

function onMouseOut(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    clearMouseButtons();
    mainLoop.appController.mouseOut(bg2Event);
    return bg2Event;
}

function onMouseOver(evt,mainLoop) {
    return onMouseMove(evt,mainLoop)
}

function onMouseUp(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.UP);
    setMouseButton(bg2Event, false);
    mainLoop.appController.mouseUp(bg2Event);
    return bg2Event;
}

function onMouseWheel(evt,mainLoop) {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    bg2Event.delta = evt.wheelDelta ? evt.wheelDelta * -1 : evt.detail * 10;
    mainLoop.appController.mouseWheel(bg2Event);
    return bg2Event;
}

function onTouchStart(evt,mainLoop) {
    const bgEvent = createTouchEvent(evt,mainLoop);
    mainLoop.appController.touchStart(bgEvent);
    return bgEvent;
}

function onTouchMove(evt,mainLoop) {
    const bgEvent = createTouchEvent(evt,mainLoop);
    mainLoop.appController.touchMove(bgEvent);
    return bgEvent;
}

function onTouchEnd(evt,mainLoop) {
    const bgEvent = createTouchEvent(evt,mainLoop);
    mainLoop.appController.touchEnd(bgEvent);
    return bgEvent;
}

function onKeyDown(evt,mainLoop) {
    const bgEvent = createKeyboardEvent(evt);
    mainLoop.appController.keyDown(bgEvent);
    return bgEvent;
}

function onKeyUp(evt,mainLoop) {
    const bgEvent = createKeyboardEvent(evt);
    mainLoop.appController.keyUp(bgEvent);
    return bgEvent;
}
