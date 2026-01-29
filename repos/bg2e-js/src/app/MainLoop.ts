import Canvas from "./Canvas";
import AppController from "./AppController";

import { 
    MouseButtonEventType, 
    createMouseEvent,
    clearMouseButtons,
    setMouseButton
} from "./Bg2MouseEvent";
import Bg2MouseEvent from "./Bg2MouseEvent";
import { createTouchEvent } from "./Bg2TouchEvent";
import Bg2TouchEvent from "./Bg2TouchEvent";
import { createKeyboardEvent } from "./Bg2KeyboardEvent";
import Bg2KeyboardEvent from "./Bg2KeyboardEvent";

export enum FrameUpdate {
    AUTO = 0,
    MANUAL = 1
}

interface AnimationLoopState {
    lastTime: number;
    mainLoop: MainLoop[];
}

const g_animationLoop: AnimationLoopState = {
    lastTime: 0,
    mainLoop: []
};

async function animationLoop(totalTime?: number): Promise<void> {
    totalTime = totalTime || 0;
    requestAnimationFrame(animationLoop);
    const elapsed = totalTime - g_animationLoop.lastTime;
    g_animationLoop.lastTime = totalTime;
    for (const ml of g_animationLoop.mainLoop) {
        await onUpdate(ml, elapsed);
    }
}

class MouseStatus {
    pos: { x: number; y: number };
    leftButton: boolean;
    middleButton: boolean;
    rightButton: boolean;

    constructor() {
        this.pos = { x: 0, y: 0 };
        this.leftButton = false;
        this.middleButton = false;
        this.rightButton = false;
    }

    get anyButton(): boolean { return this.leftButton || this.middleButton || this.rightButton; }
}

export default class MainLoop {
    private _canvas: Canvas;
    private _appController: AppController;
    private _updateMode: FrameUpdate;
    private _firstFrameRendered: boolean;
    private _redisplayFrames: number;
    private _mouseStatus: MouseStatus;

    constructor(canvas: Canvas, appController: AppController) {
        this._canvas = canvas;
        (this._canvas as any)._mainLoop = this;
        this._appController = appController;
        (this._appController as any)._mainLoop = this;
        this._updateMode = FrameUpdate.AUTO;
        this._firstFrameRendered = false;
        this._redisplayFrames = 1;

        this._mouseStatus = new MouseStatus();
    }

    get canvas(): Canvas { return this._canvas; }
    get appController(): AppController { return this._appController; }
    get renderer(): any { return this._canvas?.renderer; }

    get updateMode(): FrameUpdate { return this._updateMode; }
    set updateMode(um: FrameUpdate) { this._updateMode = um; }

    get mouseStatus(): MouseStatus { return this._mouseStatus; }

    get redisplay(): boolean { return this._redisplayFrames > 0; }

    async run(): Promise<void> {
        await this.canvas.init();
        await this.appController.init();
        initEvents(this);
        g_animationLoop.mainLoop.push(this);
        animationLoop();
    }

    exit(): void {
        this.appController.destroy();
        const i = g_animationLoop.mainLoop.indexOf(this);
        if (i !== -1) {
            g_animationLoop.mainLoop.splice(i, 1);
        }
    }

    postReshape(): void {
        onResize(this);
    }

    postRedisplay({ frames = 10, timeout = 10 }: { frames?: number; timeout?: number } = {}): void {
        if (timeout <= 0) {
            this._redisplayFrames = frames;
        }
        else {
            setTimeout(() => this._redisplayFrames = frames, timeout);
        }
    }
}


function initEvents(mainLoop: MainLoop): void {
    onResize(mainLoop);

    const handlePropagation = (bgEvt: any, evt: Event): boolean => {
        if (bgEvt.isEventPropagationStopped) {
            evt.stopPropagation();
            evt.preventDefault();
            return false;
        }
        return true;
    }

    const c = mainLoop.canvas.domElement;
    (c as any).__mainLoop = mainLoop;
    c.addEventListener("mousedown", (evt: any) => {
        return handlePropagation(onMouseDown(evt, (evt.target as any).__mainLoop), evt);
    });
    c.addEventListener("mousemove", (evt: any) => {
        return handlePropagation(onMouseMove(evt, (evt.target as any).__mainLoop), evt);
    });
    c.addEventListener("mouseout", (evt: any) => {
        return handlePropagation(onMouseOut(evt, (evt.target as any).__mainLoop), evt);
    });
    
    c.addEventListener("mouseover", (evt: any) => {
        return handlePropagation(onMouseOver(evt, (evt.target as any).__mainLoop), evt);
    });

    c.addEventListener("mouseup", (evt: any) => {
        return handlePropagation(onMouseUp(evt, (evt.target as any).__mainLoop), evt);
    });
    
    c.addEventListener("touchstart", (evt: any) => {
        return handlePropagation(onTouchStart(evt, (evt.target as any).__mainLoop), evt);
    });

    c.addEventListener("touchmove", (evt: any) => {
        return handlePropagation(onTouchMove(evt, (evt.target as any).__mainLoop), evt);
    });
    
    c.addEventListener("touchend", (evt: any) => {
        return handlePropagation(onTouchEnd(evt, (evt.target as any).__mainLoop), evt);
    });

    const mouseWheelEvt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
    c.addEventListener(mouseWheelEvt, (evt: any) => {
        return handlePropagation(onMouseWheel(evt, (evt.target as any).__mainLoop), evt);
    });

    window.addEventListener("keydown", (evt: any) => {
        g_animationLoop.mainLoop.forEach(ml => onKeyDown(evt, ml));
    });

    window.addEventListener("keyup", (evt: any) => {
        g_animationLoop.mainLoop.forEach(ml => onKeyUp(evt, ml));
    });

    window.addEventListener("resize", (evt: Event) => {
        onResize(mainLoop);
    });

    (c as any).oncontextmenu = (evt: Event) => false;
}

function onResize(mainLoop: MainLoop): void {
    const dpi = window.devicePixelRatio;
    mainLoop.appController.reshape(mainLoop.canvas.width * dpi, mainLoop.canvas.height * dpi);
}

async function onUpdate(mainLoop: MainLoop, elapsed: number): Promise<void> {
    if (mainLoop.redisplay) {
        if (mainLoop.updateMode === FrameUpdate.AUTO) {
            (mainLoop as any)._redisplayFrames = 1;
        }
        else {
            (mainLoop as any)._redisplayFrames--;
        }
        if ((mainLoop as any)._redisplayFrames > 0 || !(mainLoop as any)._firstFrameRendered) {
            await mainLoop.appController.frame(elapsed);
            mainLoop.appController.display();
            (mainLoop as any)._firstFrameRendered = true;
        }
    }
}

function onMouseDown(evt: any, mainLoop: MainLoop): Bg2MouseEvent {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.DOWN);
    setMouseButton(bg2Event, true);
    mainLoop.appController.mouseDown(bg2Event);
    return bg2Event;
}

function onMouseMove(evt: any, mainLoop: MainLoop): Bg2MouseEvent {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    mainLoop.appController.mouseMove(bg2Event);
    if (mainLoop.mouseStatus.anyButton) {
        mainLoop.appController.mouseDrag(bg2Event);
    }
    return bg2Event;
}

function onMouseOut(evt: any, mainLoop: MainLoop): Bg2MouseEvent {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    clearMouseButtons();
    mainLoop.appController.mouseOut(bg2Event);
    return bg2Event;
}

function onMouseOver(evt: any, mainLoop: MainLoop): Bg2MouseEvent {
    return onMouseMove(evt, mainLoop);
}

function onMouseUp(evt: any, mainLoop: MainLoop): Bg2MouseEvent {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.UP);
    setMouseButton(bg2Event, false);
    mainLoop.appController.mouseUp(bg2Event);
    return bg2Event;
}

function onMouseWheel(evt: any, mainLoop: MainLoop): Bg2MouseEvent {
    const bg2Event = createMouseEvent(evt, mainLoop, MouseButtonEventType.NONE);
    bg2Event.delta = evt.wheelDelta ? evt.wheelDelta * -1 : evt.detail * 10;
    mainLoop.appController.mouseWheel(bg2Event);
    return bg2Event;
}

function onTouchStart(evt: any, mainLoop: MainLoop): Bg2TouchEvent {
    const bgEvent = createTouchEvent(evt, mainLoop);
    mainLoop.appController.touchStart(bgEvent);
    return bgEvent;
}

function onTouchMove(evt: any, mainLoop: MainLoop): Bg2TouchEvent {
    const bgEvent = createTouchEvent(evt, mainLoop);
    mainLoop.appController.touchMove(bgEvent);
    return bgEvent;
}

function onTouchEnd(evt: any, mainLoop: MainLoop): Bg2TouchEvent {
    const bgEvent = createTouchEvent(evt, mainLoop);
    mainLoop.appController.touchEnd(bgEvent);
    return bgEvent;
}

function onKeyDown(evt: any, mainLoop: MainLoop): Bg2KeyboardEvent {
    const bgEvent = createKeyboardEvent(evt);
    mainLoop.appController.keyDown(bgEvent);
    return bgEvent;
}

function onKeyUp(evt: any, mainLoop: MainLoop): Bg2KeyboardEvent {
    const bgEvent = createKeyboardEvent(evt);
    mainLoop.appController.keyUp(bgEvent);
    return bgEvent;
}
