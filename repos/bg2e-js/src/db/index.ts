
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
