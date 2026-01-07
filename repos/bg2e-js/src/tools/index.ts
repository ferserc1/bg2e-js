import { generateUUID, generateMD5 } from './crypto';
import { isBigEndian, isLittleEndian } from './endiantess';
import UserAgent from './UserAgent';
import Resource, {
    isFormat,
    addFormats,
    isValidImage,
    addImageFormats,
    getValidImageFormats,
    isValidVideo,
    addVideoFormats,
    getValidVideoFormats,
    isValidBinary,
    addBinaryFormats,
    getValidBinaryFormats
} from './Resource';
import ResourceProvider from './ResourceProvider';
import ImageResourceProvider from './ImageResourceProvider';
import VideoResourceProvider from './VideoResourceProvider';
import BinaryResourceProvider from './BinaryResourceProvider';
import TextResourceProvider from './TextResourceProvider';
import {
    ProcessType,
    ProcessTypeName,
    getProcessType,
    getProcessTypeName,
    isBrowser, isNode
} from './processType';

export default {
    generateUUID, generateMD5,
    isBigEndian, isLittleEndian,
    UserAgent,
    Resource, isFormat, addFormats, isValidImage, addImageFormats, getValidImageFormats, isValidVideo, addVideoFormats, getValidVideoFormats, isValidBinary, addBinaryFormats, getValidBinaryFormats,
    ResourceProvider,
    ImageResourceProvider,
    VideoResourceProvider,
    BinaryResourceProvider,
    TextResourceProvider,
    ProcessType, ProcessTypeName, getProcessType, getProcessTypeName, isBrowser, isNode
};
