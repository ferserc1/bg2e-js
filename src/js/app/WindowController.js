
import LifeCycle from "../utils/LifeCycle";
import MainLoop from "./MainLoop";

export default class WindowController extends LifeCycle {
    // Functions from LifeCycle:
    // init()
    // frame(delta)
    // display()
    // reshape(width,height)
    // keyDown(evt)
    // keyUp(evt)
    // mouseUp(evt)
    // mouseDown(evt)
    // mouseMove(evt)
    // mouseOut(evt)
    // mouseDrag(evt)
    // mouseWheel(evt)
    // touchStart(evt)
    // touchMove(evt)
    // touchEnd(evt)
    
    // 4 frames to ensure that the reflections are fully updated
    postRedisplay(frames=4) {
        MainLoop.singleton.postRedisplay(frames);
    }
    
    postReshape() {
        MainLoop.singleton.postReshape();
    }
    
    get canvas() {
        return MainLoop.singleton.canvas;
    }
    
    get context() {
        return MainLoop.singleton.canvas.context;
    }
    
    get gl() {
        return MainLoop.singleton.canvas.context.gl;
    }
}
