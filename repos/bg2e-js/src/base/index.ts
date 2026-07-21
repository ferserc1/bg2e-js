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

import BoundingBox from './BoundingBox';
import Color from './Color';
import Environment from './Environment';
import Light, {
    LightType
} from './Light';
import Material from './Material';
import PolyList, {
    BufferType,
    DrawMode,
    RenderLayer,
    getLayers,
    PolyListFrontFace,
    PolyListCullFace
} from './PolyList';
import Texture, {
    TextureDataType,
    TextureWrap,
    TextureFilter,
    TextureTarget,
    ProceduralTextureFunction,
    TextureRenderTargetAttachment,
    TextureComponentFormat,
    TextureChannel,
    TextureDataTypeName,
    TextureWrapName,
    TextureFilterName,
    TextureTargetName,
    ProceduralTextureFunctionName,
    TextureRenderTargetAttachmentNames,
    TextureComponentFormatNames,
    TextureChannelNames,
    textureWrapString,
    textureDataTypeString,
    textureFilterString,
    textureTargetString,
    proceduralTextureFunctionString,
    textureRenderTargetAttachmentString,
    textureComponentFormatString,
    textureChannelString,
} from './Texture';

export default {
    BoundingBox,
    Color,
    Environment,
    Light,
    LightType,
    Material,
    PolyList,
    BufferType,
    DrawMode,
    RenderLayer,
    getLayers,
    PolyListFrontFace,
    PolyListCullFace,
    Texture,
    TextureDataType,
    TextureWrap,
    TextureFilter,
    TextureTarget,
    ProceduralTextureFunction,
    TextureRenderTargetAttachment,
    TextureComponentFormat,
    TextureChannel,
    TextureDataTypeName,
    TextureWrapName,
    TextureFilterName,
    TextureTargetName,
    ProceduralTextureFunctionName,
    TextureRenderTargetAttachmentNames,
    TextureComponentFormatNames,
    TextureChannelNames,
    textureWrapString,
    textureDataTypeString,
    textureFilterString,
    textureTargetString,
    proceduralTextureFunctionString,
    textureRenderTargetAttachmentString,
    textureComponentFormatString,
    textureChannelString,
}

