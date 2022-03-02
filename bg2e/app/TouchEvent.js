import { getMouseEventOffset } from "./Canvas";


export const createTouchEvent = (evt,mainLoop) => {
    
}

export default class TouchEvent extends EventBase  {
    constructor(touches,event) {
        super();
        this.touches = touches;
        this.event = event;
    }
}
