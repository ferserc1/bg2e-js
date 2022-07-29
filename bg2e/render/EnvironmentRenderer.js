
export default class EnvironmentRenderer {
    constructor(renderer,environment) {
        if (environment._renderer) {
            throw new Error("Invalid environment renderer initialization: this environment is already controlled by a renderer.");
        }

        this._renderer = renderer;
        this._environment = environment;
        this._environment._renderer = this;
    }
}
