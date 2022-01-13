import Canvas from "./Canvas";
import { setupRequestAnimFrame } from "../utils/WebGLUtils";
import Mouse from "./Mouse";
import MouseEvent, { MouseButton } from "./MouseEvent";
import KeyboardEvent from "./KeyboardEvent";
import TouchEvent from "./TouchEvent";

window.s_bg_app_mainLoop = null;

export const FrameUpdate = {
    AUTO: 0,
    MANUAL: 1
};

let lastTime = 0;
function animationLoop(totalTime) {
    totalTime = totalTime || 0;
    if (!window.requestAnimFrame) {
        setupRequestAnimFrame();
    }
    requestAnimFrame(animationLoop);
    let elapsed = totalTime - lastTime;
    lastTime = totalTime;
    onUpdate(elapsed);
}

function initEvents() {
    onResize();
    
    window.addEventListener("resize", function() { onResize(); });
    
    if (s_bg_app_mainLoop.canvas) {
        let c = s_bg_app_mainLoop.canvas.domElement;
        c.addEventListener("mousedown", function(evt) {
            if (!onMouseDown(evt).executeDefault) {
                evt.preventDefault();
                return false;
            }
        });
        c.addEventListener("mousemove", function(evt) {
            if (!onMouseMove(evt).executeDefault) {
                evt.preventDefault();
                return false;
            }
        });
        c.addEventListener("mouseout", function(evt) {
            if (!onMouseOut(evt).executeDefault) {
                evt.preventDefault();
                return false;
            }
        });
        c.addEventListener("mouseover", function(evt) {
            if (!onMouseOver(evt).executeDefault) {
                evt.preventDefault();
                return false;
            }
        });
        c.addEventListener("mouseup", function(evt) {
            if (!onMouseUp(evt).executeDefault) { 
                evt.preventDefault();
                return false;
            }
        });
        
        c.addEventListener("touchstart", function(evt) {
            if (!onTouchStart(evt).executeDefault) {
                evt.preventDefault();
                return false;
            }
        });
        c.addEventListener("touchmove", function(evt) {
            if (!onTouchMove(evt).executeDefault) {
                evt.preventDefault();
                return false;
            }
        });
        c.addEventListener("touchend", function(evt) {
            if (!onTouchEnd(evt).executeDefault) { 
                evt.preventDefault();
                return false;
            }
        });
        
        let mouseWheelEvt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
        c.addEventListener(mouseWheelEvt, function(evt) {
            if (!onMouseWheel(evt).executeDefault) {
                evt.preventDefault();
                return false;
            }
        });
        
        window.addEventListener("keydown", function(evt) { onKeyDown(evt); });
        window.addEventListener("keyup", function(evt) { onKeyUp(evt); });
        
        c.oncontextmenu = function(e) { return false; };
    }
    else {
        throw new Error("Configuration error in MainLoop: no canvas defined");
    }
}

function onResize() {
    if (s_bg_app_mainLoop.canvas && s_bg_app_mainLoop.windowController) {
        const multisample = s_bg_app_mainLoop.canvas.multisample;
        s_bg_app_mainLoop.canvas.domElement.width = s_bg_app_mainLoop.canvas.width * multisample;
        s_bg_app_mainLoop.canvas.domElement.height = s_bg_app_mainLoop.canvas.height * multisample; 
        s_bg_app_mainLoop.windowController.reshape(s_bg_app_mainLoop.canvas.width * multisample, s_bg_app_mainLoop.canvas.height * multisample);
    }
}

function onUpdate(elapsedTime) {
    if (s_bg_app_mainLoop.redisplay) {
        s_bg_app_mainLoop.windowController.frame(elapsedTime);
        if (s_bg_app_mainLoop.updateMode==FrameUpdate.AUTO) {
            s_bg_app_mainLoop._redisplayFrames = 1;
        }
        else {
            s_bg_app_mainLoop._redisplayFrames--;
        }
        s_bg_app_mainLoop.windowController.display();
    }
}

function onMouseDown(event) {
    const offset = s_bg_app_mainLoop.canvas.domElement.getBoundingClientRect();
    const multisample = s_bg_app_mainLoop.canvas.multisample;
    const pos = Mouse.Position();
    pos.x = (event.clientX - offset.left) * multisample;
    pos.y = (event.clientY - offset.top) * multisample;
    switch (event.button) {
        case MouseButton.LEFT:
            Mouse.SetLeftButton(true);
            break;
        case MouseButton.MIDDLE:
            Mouse.SetMiddleButton(true);
            break;
        case MouseButton.RIGHT:
            Mouse.SetRightButton(true);
            break;
    }

    const bgEvent = new MouseEvent(event.button,pos.x,pos.y,0,event);
    s_bg_app_mainLoop.windowController.mouseDown(bgEvent);
    return bgEvent;
}

function onMouseMove(event) {
    const offset = s_bg_app_mainLoop.canvas.domElement.getBoundingClientRect();
    const multisample = s_bg_app_mainLoop.canvas.multisample;
    const pos = Mouse.SetPosition(
        (event.clientX - offset.left) * multisample,
        (event.clientY - offset.top) * multisampl
    );
    
    const evt = new MouseEvent(MouseButton.NONE,
                                    pos.x,
                                    pos.y,
                                    0,
                                    event);
    s_bg_app_mainLoop.windowController.mouseMove(evt);
    if (Mouse.AnyButton()) {
        s_bg_app_mainLoop.windowController.mouseDrag(evt);
    }
    return evt;
}

function onMouseOut() {
    const pos = Mouse.Position();
    let bgEvt = new MouseEvent(MouseButton.NONE,pos.x,pos.y,0,{});
    s_bg_app_mainLoop.windowController.mouseOut(bgEvt);
    if (Mouse.LeftButton()) {
        Mouse.SetLeftButton(false);
        bgEvt = new MouseEvent(MouseButton.LEFT,pos.x,pos.y,0,{});
        s_bg_app_mainLoop.windowController.mouseUp(bgEvt);
    }
    if (Mouse.MiddleButton()) {
        Mouse.SetMiddleButton(false);
        bgEvt = new MouseEvent(MouseButton.MIDDLE,pos.x,pos.y,0,{});
        s_bg_app_mainLoop.windowController.mouseUp(bgEvt);
    }
    if (Mouse.RightButton()) {
        Mouse.SetRightButton(false);
        bgEvt = new MouseEvent(MouseButton.RIGHT,pos.x,pos.y,0,{});
        s_bg_app_mainLoop.windowController.mouseUp(bgEvt);
    }
    return bgEvt;
}

function onMouseOver(event) {
    return onMouseMove(event);
}

function onMouseUp(event) {
    switch (event.button) {
        case MouseButton.LEFT:
            Mouse.SetLeftButton(false);
            break;
        case MouseButton.MIDDLE:
            Mouse.SetMiddleButton(false);
            break;
        case MouseButton.RIGHT:
            Mouse.SetRightButton(false);
            break;
    }
    const offset = s_bg_app_mainLoop.canvas.domElement.getBoundingClientRect();
    const multisample = s_bg_app_mainLoop.canvas.multisample;
    const pos = Mouse.SetPosition(
        (event.clientX - offset.left) * multisample,
        (event.clientY - offset.top) * multisample);
    const bgEvt = new MouseEvent(event.button,pos.x,pos.y,0,event)
    s_bg_app_mainLoop.windowController.mouseUp(bgEvt);
    return bgEvt;
}

function onMouseWheel(event) {
    const offset = s_bg_app_mainLoop.canvas.domElement.getBoundingClientRect();
    const multisample = s_bg_app_mainLoop.canvas.multisample;
    const pos = Mouse.SetPosition(
        (event.clientX - offset.left) * multisample,
        (event.clientY - offset.top) * multisample);
    const delta = event.wheelDelta ? event.wheelDelta * -1:event.detail * 10;
    const bgEvt = new MouseEvent(MouseButton.NONE,pos.x,pos.y,delta,event)
    s_bg_app_mainLoop.windowController.mouseWheel(bgEvt);
    return bgEvt;
}

function getTouchEvent(event) {
    const offset = s_bg_app_mainLoop.canvas.domElement.getBoundingClientRect();
    const touches = [];
    for (let i=0; i<event.touches.length; ++i) {
        let touch = event.touches[i];
        touches.push({
            identifier: touch.identifier,
            x: touch.clientX - offset.left,
            y: touch.clientY - offset.top,
            force: touch.force,
            rotationAngle: touch.rotationAngle,
            radiusX: touch.radiusX,
            radiusY: touch.radiusY
        });
    }
    return new TouchEvent(touches,event);
}

function onTouchStart(event) {
    const bgEvt = getTouchEvent(event)
    s_bg_app_mainLoop.windowController.touchStart(bgEvt);
    return bgEvt;
}

function onTouchMove(event) {
    const bgEvt = getTouchEvent(event)
    s_bg_app_mainLoop.windowController.touchMove(bgEvt);
    return bgEvt;
}

function onTouchEnd(event) {
    const bgEvt = getTouchEvent(event)
    s_bg_app_mainLoop.windowController.touchEnd(bgEvt);
    return bgEvt;
}

function onKeyDown(event) {
    const code = KeyboardEvent.IsSpecialKey(event) ? 	event.keyCode:
                                                        event.code;
    s_bg_app_mainLoop.windowController.keyDown(new KeyboardEvent(code,event));
}

function onKeyUp(event) {
    let code = KeyboardEvent.IsSpecialKey(event) ? 	event.keyCode:
                                                    event.code;
    s_bg_app_mainLoop.windowController.keyUp(new KeyboardEvent(code,event));
}

export default class MainLoop {
    constructor() {
        this._canvas = null;
        this._windowController = null;
        this._updateMode = FrameUpdate.AUTO;
        this._redisplayFrames = 1;
        // TODO: Implement this
//        bg.bindImageLoadEvent(() => {
//            this.postRedisplay();
//        });
    }
    
    get canvas() { return this._canvas; }
    set canvas(c) {
        this._canvas = new Canvas(c);
    }
    get windowController() { return this._windowController; }
    get updateMode() { return this._updateMode; }
    set updateMode(m) {
        this._updateMode = m;
        if (this._updateMode==FrameUpdate.AUTO) {
            this._redisplayFrames = 1;
        }
    }
    get redisplay() { return this._redisplayFrames>0; }
    get mouseButtonStatus() { return s_mouseStatus; }
    
    run(windowController) {
        this._windowController = windowController;
        this.postRedisplay();
        this.windowController.init();
        initEvents();
        animationLoop();
    }
    
    // 4 frames to ensure that the reflections are fully updated
    postRedisplay(frames=4) {
        this._redisplayFrames = frames;
    }
    
    postReshape() {
        onResize();
    }
}

Object.defineProperty(MainLoop, "singleton", {
    get: function() {
        if (!s_bg_app_mainLoop) {
            s_bg_app_mainLoop = new MainLoop();
        }
        return s_bg_app_mainLoop;
    }
});
