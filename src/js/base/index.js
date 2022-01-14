
import Effect from "./Effect";
import Loader, { LoaderPlugin } from "./Loader";
import PolyList, { DrawMode, BufferType } from "./PolyList";
import Shader, { ShaderType } from "./Shader";
import ShaderLibrary from "./ShaderLibrary";
import ShaderSource from "./ShaderSource";
import Texture, {
    TextureUnit,
    TextureWrap,
    TextureFilter,
    TextureTarget,
    TextureDataType
} from "./Texture";
import TextureCache from "./TextureCache";
import TextureLoaderPlugin from "./TextureLoaderPlugin";
import TextureEffect from "./TextureEffect";
import Bg2matLoaderPlugin from "./Bg2matLoaderPlugin";
import Material from "./Material";
import MaterialFlag from "./MaterialFlag";
import MaterialModifier from "./MaterialModifier";
import VideoTextureLoaderPlugin from "./VideoTextureLoaderPlugin";
import imageTools from "./imageTools";

const base = {
    Bg2matLoaderPlugin,
    BufferType,
    Effect,
    DrawMode,
    imageTools,
    LoaderPlugin,
    Loader,
    PolyList,
    MaterialFlag,
    Material,
    MaterialModifier,
    ShaderType,
    Shader,
    ShaderLibrary,
    ShaderSource,
    TextureUnit,
    TextureWrap,
    TextureFilter,
    TextureTarget,
    TextureDataType,
    Texture,
    TextureCache,
    TextureEffect,
    TextureLoaderPlugin,
    VideoTextureLoaderPlugin
}

export default base;