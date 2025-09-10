

import DrawableComponent from "./Drawable";
import TransformComponent from "./Transform";
import ChainComponent from "./Chain";
import {
    InputChainJoint as InputChainJointComponent,
    OutputChainJoint as OutputChainJointComponent } from "./ChainJoint";
import LightComponent from "./LightComponent";
import CameraComponent from "./Camera";
import OrbitCameraControllerComponent from "./OrbitCameraController";
import EnvironmentComponentComponent from "./EnvironmentComponent";
import Component, { registerComponent } from "./Component";

export const registerComponents = () => {
    registerComponent("Drawable", DrawableComponent);
    registerComponent("Transform", TransformComponent);
    registerComponent("Light", LightComponent);
    registerComponent("Chain", ChainComponent);
    registerComponent("InputChainJoint", InputChainJointComponent);
    registerComponent("OutputChainJoint", OutputChainJointComponent);
    registerComponent("Camera", CameraComponent);
    registerComponent("OrbitCameraController", OrbitCameraControllerComponent);
    registerComponent("Environment", EnvironmentComponentComponent);
    // TODO: Register more components
}

export default {
    Component,
    DrawableComponent,
    TransformComponent,
    ChainComponent,
    InputChainJointComponent,
    OutputChainJointComponent,
    LightComponent,
    CameraComponent,
    OrbitCameraControllerComponent,
    EnvironmentComponentComponent,
    registerComponents,
    registerComponent
}