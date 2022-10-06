

const isRequired = (candidateFunction,includedFunctions) => {
    return !includedFunctions.find(includedFunc => includedFunc.name === candidateFunction.name);
}

export default class ShaderFunction {
    constructor(returnType, name, params, body, deps = []) {
        this._returnType = returnType;
        this._name = name;
        this._params = params;
        this._body = body;
        this._deps = deps;
    }

    get returnType() {
        return this._returnType;
    }

    get name() {
        return this._name;
    }

    get params() {
        return this._params;
    }

    get body() {
        return this._body;
    }

    get dependencies() {
        return this._deps;
    }

    getFunctionText() {
        return `${this.returnType} ${this.name}(${this.params}) ${this.body}`;
    }

    static GetShaderCode(header, requiredFunctions) {
        const allFunctions = [];
        requiredFunctions.forEach(requiredFunction => {
            if (isRequired(requiredFunction,allFunctions)) {
                requiredFunction.dependencies.forEach(dep => {
                    if (isRequired(dep,allFunctions)) {
                        allFunctions.push(dep);
                    }
                });

                allFunctions.push(requiredFunction);
            }
        });

        let code = header;
        allFunctions.forEach(fn => {
            code += fn.getFunctionText() + "\n\n";
        });

        return code;
    }
}