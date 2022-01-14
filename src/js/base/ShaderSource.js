import Engine from "../utils/Engine";

export class ShaderSourceImpl {
    header(shaderType) { return ""; }
    parameter(shaderType,paramData) { return paramData.name; }
    func(shaderType,funcData) { return funcData.name; }
}

export default class ShaderSource {
    static FormatSource(src) {
        let result = "";
        let lines = src.replace(/^\n*/,"").replace(/\n*$/,"").split("\n");
        let minTabs = 100;
        lines.forEach((line) => {
            let tabsInLine = /(\t*)/.exec(line)[0].length;
            if (minTabs>tabsInLine) {
                minTabs = tabsInLine;
            }
        });
        
        lines.forEach((line) => {
            let tabsInLine = /(\t*)/.exec(line)[0].length;
            let diff = tabsInLine - minTabs;
            result += line.slice(tabsInLine - diff,line.length) + "\n";
        });
        
        return result.replace(/^\n*/,"").replace(/\n*$/,"");
    }
    
    constructor(type) {
        this._type = type;
        this._params = [];
        this._functions = [];
        this._requiredExtensions = [];
        this._header = "";
        this._preprocessor = "";
    }
    
    get type() { return this._type; }
    get params() { return this._params; }
    get header() { return this._header; }
    get functions() { return this._functions; }
    
    addParameter(param) {
        if (param instanceof Array) {
            this._params = [...this._params, ...param];
        }
        else {
            this._params.push(param);
        }
        this._params.push(null);	// This will be translated into a new line character
    }
    
    addFunction(func) {
        if (func instanceof Array) {
            this._functions = [...this._functions, ...func];
        }
        else {
            this._functions.push(func);
        }
    }
    
    setMainBody(body) {
        this.addFunction({
            returnType:"void", name:"main", params:{}, body:body
        });
    }
            
    appendHeader(src) {
        this._header += src + "\n";
    }

    appendPreprocessor(src) {
        this._preprocessor += src + "\n";
    }
            
    toString() {
        let impl = Engine.Get().shaderSource;
        // Build header
        let src = this._preprocessor;
        src += impl.header(this.type) + "\n" + this._header + "\n\n";
        
        this.params.forEach((p) => {
            src += impl.parameter(this.type,p) + "\n";
        });
        
        this.functions.forEach((f) => {
            src += "\n" + impl.func(this.type,f) + "\n";
        })
        return src;
    }
}
