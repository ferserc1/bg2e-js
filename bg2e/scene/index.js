

import Drawable from "./Drawable";
import { registerComponent } from "./Component";

export const registerComponents = () => {
    registerComponent("Drawable", Drawable);
    // TODO: Register more components
}