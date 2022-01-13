
export const setupRequestAnimFrame = () => {
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) { window.setTimeout(callback,1000/60); };
    })();    
}

export const initWebGLContext = (canvas) => {
    let context = {
        gl:null,
        supported:false,
        experimental:false
    }
    try {
        context.gl = canvas.getContext("webgl",{ preserveDrawingBuffer:true });
        context.supported = context.gl!=null;
    }
    catch (e) {
        context.supported = false;
    }
    
    if (!context.supported) {
        try {
            context.gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer:true });
            context.supported = context.gl!=null;
            context.experimental = true;
        }
        catch(e) {
        }
    }
    
    if (context) {
        context.gl.uuid = Symbol(context.gl);
    }
    return context;
}


