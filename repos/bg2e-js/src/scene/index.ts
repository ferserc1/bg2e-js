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

    // Retrocompatibility: the light is registered with both "Light" and "LightComponent" names, but only "LightComponent" should be used in the future
    registerComponent("Light", LightComponent);
    registerComponent("LightComponent", LightComponent);
    
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