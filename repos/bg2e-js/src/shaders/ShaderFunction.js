

const isRequired = (candidateFunction,includedFunctions) => {
    return !includedFunctions.find(includedFunc => includedFunc.name === candidateFunction.name);
}

const getAllDependencies = (fn, result = []) => {
    fn.dependencies.forEach(depFn => {
        getAllDependencies(depFn, result);
        result.push(depFn);
    });
    result.push(fn);
}

const getDependencies = (fn) => {
    const allFunctions = [];
    getAllDependencies(fn, allFunctions);
    const includedFunctions = [];
    return allFunctions.filter(candidateFn => {
        if (includedFunctions.indexOf(candidateFn.name) === -1) {
            includedFunctions.push(candidateFn.name);
            return true;
        }
    });
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
        let allFunctions = [];
        requiredFunctions.forEach(req => {
            allFunctions = [...allFunctions, ...getDependencies(req, allFunctions)];
        });
        let code = header;
        allFunctions.forEach(fn => {
            code += fn.getFunctionText() + "\n\n";
        });

        return code;
    }
}