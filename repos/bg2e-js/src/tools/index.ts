/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
