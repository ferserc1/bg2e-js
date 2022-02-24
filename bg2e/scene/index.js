

import Drawable from "./Drawable";
import Transform from "./Transform";
import { registerComponent } from "./Component";

export const registerComponents = () => {
    registerComponent("Drawable", Drawable);
    registerComponent("Transform", Transform);
    // TODO: Register more components
}