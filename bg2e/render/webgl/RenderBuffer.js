
import { TextureRenderTargetAttachmentNames, TextureTargetName } from "../../base/Texture";
import RenderBuffer from "../RenderBuffer";

function getAttachmentPoint(gl,att) {
    return gl[TextureRenderTargetAttachmentNames[att]];
}

function getTextureTarget(gl,texture) {
    return gl[TextureTargetName[texture.target]];
}
export default class WebGLRenderBuffer extends RenderBuffer {
    constructor(renderer) {
        super(renderer);
    }

    beginUpdate() {
        const { gl } = this.renderer;

        if (this.dirty) {
            if (this._framebuffer) {
                gl.deleteFramebuffer(this._framebuffer);
            }
            this._framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

            for (const attachment in this.attachments) {
                const textureRenderer = this.attachments[attachment];
                const textureApi = textureRenderer.getApiObject();
                const attachmentPoint = getAttachmentPoint(gl,attachment);
                const textureTarget = getTextureTarget(gl,textureRenderer.texture);
                const level = 0;
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, textureTarget, textureApi, level);
            }

            this.setUpdated(true);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

        gl.viewport(0, 0, this.size.width, this.size.height);
    }

    endUpdate() {
        const { gl } = this.renderer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}