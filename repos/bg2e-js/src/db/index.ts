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


import Bg2LoaderPlugin from "./Bg2LoaderPlugin";
import {
    PluginOperationType,
    createPluginDatabase,
    registerPluginInDatabase,
    getPluginFromDatabase
} from "./DBPluginApi";
import Loader, {
    registerLoaderPlugin,
    getLoaderPlugin
} from "./Loader"
import LoaderPlugin from "./LoaderPlugin";
import MtlParser from "./MtlParser";
import ObjLoaderPlugin from "./ObjLoaderPlugin";
import ObjParser from "./ObjParser";
import ObjWriterPlugin from "./ObjWriterPlugin";
import VitscnjLoaderPlugin from "./VitscnjLoaderPlugin";
import Writer, {
    registerWriterPlugin,
    getWriterPlugin
} from "./Writer"
import WriterPlugin from "./WriterPlugin";

export default {
    Bg2LoaderPlugin,
    PluginOperationType,
    createPluginDatabase,
    registerPluginInDatabase,
    getPluginFromDatabase,
    Loader,
    registerLoaderPlugin,
    getLoaderPlugin,
    LoaderPlugin,
    MtlParser,
    ObjLoaderPlugin,
    ObjParser,
    ObjWriterPlugin,
    VitscnjLoaderPlugin,
    Writer,
    registerWriterPlugin,
    getWriterPlugin,
    WriterPlugin
}
