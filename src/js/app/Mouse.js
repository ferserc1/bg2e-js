
window.s_bg_app_mouseStatus = {
    leftButton:false,
    middleButton:false,
    rightButton:false,
    pos: {
        x:-1,
        y:-1
    }	
}
Object.defineProperty(s_bg_app_mouseStatus, "anyButton", {
    get: function() {
        return this.leftButton || this.middleButton || this.rightButton;
    }
});

export default class Mouse {
    static LeftButton() { return s_bg_app_mouseStatus.leftButton; }
    static MiddleButton() { return s_bg_app_mouseStatus.middleButton; }
    static RightButton() { return s_bg_app_mouseStatus.rightButton; }
    static Position() { return s_bg_app_mouseStatus.pos; }
    static AnyButton() { return s_bg_app_mouseStatus.anyButton; }

    static SetLeftButton(s) { s_bg_app_mouseStatus.leftButton = s; return s_bg_app_mouseStatus.leftButton; }
    static SetMiddleButton(s) { s_bg_app_mouseStatus.middleButton = s; return s_bg_app_mouseStatus.middleButton; }
    static SetRightButton(s) { s_bg_app_mouseStatus.rightButton = s; return s_bg_app_mouseStatus.rightButton; }
    static SetPosition(x,y) { s_bg_app_mouseStatus.pos = { x, y }; return s_bg_app_mouseStatus.pos; }
}
