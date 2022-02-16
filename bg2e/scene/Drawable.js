
import Component from "./Component";

export default class Drawable extends Component {
    constructor(name) {
        super();
        this._name = name;
    }

    get name() {
        return this._name;
    }

    clone() {
        throw new Error("Drawable.clone() not implemented");
    }

    assign(other) {
        throw new Error("Drawable.assign() not implemented");
    }

    addPolyList(plist,mat,trx) {

    }

    removePolyList(plist) {
        
    }

    destroy() {

    }

    addedToNode(node) {

    }

    removedFromNode(node) {

    }

    async deserialize(sceneData) {
        throw new Error("Drawable.deserialize() not implemented");
    }

    async serialize(sceneData) {
        throw new Error("Drawable.serialice() not implemented");
    }
}
