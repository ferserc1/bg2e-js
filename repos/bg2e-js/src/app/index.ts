import AppController from "./AppController";
import Canvas, {
     getMouseEventOffset,
     getEventTouches
} from "./Canvas";
import EventBase from "./EventBase";
import MainLoop, {
    FrameUpdate
} from "./MainLoop";
import Bg2KeyboardEvent from "./Bg2KeyboardEvent";
import Bg2MouseEvent from "./Bg2MouseEvent";
import Bg2TouchEvent from "./Bg2TouchEvent";

export default {
    AppController,
    FrameUpdate,
    Canvas,
    getMouseEventOffset,
    getEventTouches,
    EventBase,
    Bg2KeyboardEvent,
    MainLoop,
    Bg2MouseEvent,
    Bg2TouchEvent
}