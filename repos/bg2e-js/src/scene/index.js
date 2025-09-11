

import DrawableComponent from "./Drawable";
import TransformComponent from "./Transform";
import ChainComponent from "./Chain";
import {
    InputChainJoint as InputChainJointComponent,
    OutputChainJoint as OutputChainJointComponent } from "./ChainJoint";
import LightComponent from "./LightComponent";
import CameraComponent, {
    OpticalProjectionStrategy,
    PerspectiveProjectionStrategy,
    ProjectionStrategy
} from "./Camera";
import OrbitCameraControllerComponent from "./OrbitCameraController";
import SmoothOrbitCameraControllerComponent from "./SmoothOrbitCameraController";
import EnvironmentComponent from "./EnvironmentComponent";
import Component, { registerComponent } from "./Component";
import Node from "./Node";
import NodeVisitor from "./NodeVisitor";
import FindNodeVisitor from "./FindNodeVisitor";

export const registerComponents = () => {
    registerComponent("Drawable", DrawableComponent);
    registerComponent("Transform", TransformComponent);
    registerComponent("Light", LightComponent);
    registerComponent("Chain", ChainComponent);
    registerComponent("InputChainJoint", InputChainJointComponent);
    registerComponent("OutputChainJoint", OutputChainJointComponent);
    registerComponent("Camera", CameraComponent);
    registerComponent("OrbitCameraController", OrbitCameraControllerComponent);
    registerComponent("SmoothOrbitCameraController", SmoothOrbitCameraControllerComponent);
    registerComponent("Environment", EnvironmentComponent);
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
    OpticalProjectionStrategy,
    PerspectiveProjectionStrategy,
    ProjectionStrategy,
    OrbitCameraControllerComponent,
    SmoothOrbitCameraControllerComponent,
    EnvironmentComponent,
    registerComponents,
    registerComponent,
    Node,
    NodeVisitor,
    FindNodeVisitor
}