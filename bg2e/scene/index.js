

import Drawable from "./Drawable";
import Transform from "./Transform";
import Chain from "./Chain";
import { InputChainJoint, OutputChainJoint } from "./ChainJoint";
import Light from "./LightComponent";
import Camera from "./Camera";
import OrbitCameraController from "./OrbitCameraController";
import EnvironmentComponent from "./EnvironmentComponent";
import { registerComponent } from "./Component";

export const registerComponents = () => {
    registerComponent("Drawable", Drawable);
    registerComponent("Transform", Transform);
    registerComponent("Light", Light);
    registerComponent("Chain", Chain);
    registerComponent("InputChainJoint", InputChainJoint);
    registerComponent("OutputChainJoint", OutputChainJoint);
    registerComponent("Camera", Camera);
    registerComponent("OrbitCameraController", OrbitCameraController);
    registerComponent("Environment", EnvironmentComponent);
    // TODO: Register more components
}