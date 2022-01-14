import version from "./version";
import { setupRequestAnimFrame, initWebGLContext } from "./WebGLUtils";
import { isBigEndian, isLittleEndian } from "./endianness";
import UserAgent from "./UserAgent";
import Path from "./Path";
import ResourceProvider, {
    beginImageLoad,
    endImageLoad,
    beginVideoLoad,
    endVideoLoad
} from "./ResourceProvider";
import HTTPResourceProvider from "./HTTPResourceProvider";
import Resource, {
    IMG_LOAD_EVENT_NAME,
    emitImageLoadEvent,
    bindImageLoadEvent,
    requireGlobal
 } from "./Resource";
import Engine from "./Engine";
import LifeCycle from "./LifeCycle";
import md5, {
    generateUUID 
} from "./md5";

const utils = {
    version,
    setupRequestAnimFrame,
    initWebGLContext,
    isBigEndian,
    isLittleEndian,
    UserAgent,
    userAgent: new UserAgent(),
    Path,
    path: new Path(),
    ResourceProvider,
    beginImageLoad,
    endImageLoad,
    beginVideoLoad,
    endVideoLoad,
    HTTPResourceProvider,
    Resource,
    IMG_LOAD_EVENT_NAME,
    emitImageLoadEvent,
    bindImageLoadEvent,
    requireGlobal,
    Engine,
    LifeCycle,
    md5,
    generateUUID
}

export default utils;
