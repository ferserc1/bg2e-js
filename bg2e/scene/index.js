

import Drawable from "./Drawable";
import Transform from "./Transform";
import Chain from "./Chain";
import { InputChainJoint, OutputChainJoint } from "./ChainJoint";
import { registerComponent } from "./Component";

export const registerComponents = () => {
    registerComponent("Drawable", Drawable);
    registerComponent("Transform", Transform);
    registerComponent("Chain", Chain);
    registerComponent("InputChainJoint", InputChainJoint);
    registerComponent("OutputChainJoint", OutputChainJoint);
    // TODO: Register more components
}