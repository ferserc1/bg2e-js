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
        let rawCode = '';
        requiredFunctions.forEach(req => {
            if (typeof req === 'string') {
                // Add directly the string to the code
                rawCode += req + '\n\n';
            }
            else {
                allFunctions = [...allFunctions, ...getDependencies(req, allFunctions)];
            }
        });
        let code = header + '\n\n' + rawCode + '\n\n';
        allFunctions.forEach(fn => {
            code += fn.getFunctionText() + "\n\n";
        });

        return code;
    }
}

// This utility function generate an array of ShaderFunction objects from a block of GLSL code
export function generateShaderLibrary(glslCode) {
    return [
        ...splitStructs(glslCode),
        ...splitFunctions(glslCode)
            .map(func => createShaderFunctionObject(func))
    ];
}

// Extracts #define constants from a block of GLSL code
export function extractConstants(glslCode) {
    const constants = [];
    const lines = glslCode.split('\n');
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        // Check if line is a #define directive
        if (trimmedLine.startsWith('#define')) {
            // Remove #define and split by whitespace
            const parts = trimmedLine.substring(7).trim().split(/\s+/);
            
            if (parts.length >= 2) {
                const name = parts[0];
                // Join remaining parts as the value (in case value contains spaces)
                const value = parts.slice(1).join(' ');
                
                constants.push({
                    name: name,
                    value: value
                });
            }
        }
    }
    
    return constants;
}

export function splitStructs(glslCode) {
    const structs = [];
    const lines = glslCode.split('\n');
    let currentStruct = '';
    let braceCount = 0;
    let inStruct = false;
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines, comments, and preprocessor directives
        if (!trimmedLine || 
            trimmedLine.startsWith('//') || 
            trimmedLine.startsWith('/*') || 
            trimmedLine.startsWith('#')) {
            continue;
        }
        
        // Check if this line starts a struct definition
        if (!inStruct && trimmedLine.startsWith('struct')) {
            inStruct = true;
            currentStruct = line + '\n';
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            // Check if struct ends on the same line (unlikely but possible)
            if (braceCount === 0 && trimmedLine.includes('{') && trimmedLine.includes('}')) {
                structs.push(currentStruct.trim());
                currentStruct = '';
                inStruct = false;
            }
            continue;
        }
        
        if (inStruct) {
            currentStruct += line + '\n';
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            // Struct definition ends when we reach the closing brace and optional semicolon
            if (braceCount === 0) {
                structs.push(currentStruct.trim());
                currentStruct = '';
                inStruct = false;
            }
        }
    }
    
    return structs;
}

// Replace the constants in the GLSL code with their values
export function processConstants(glslCode, constants) {
    let processedCode = glslCode;
    
    // Sort constants by name length (descending) to avoid partial replacements
    // For example, if we have PI and PI_2, we want to replace PI_2 first
    const sortedConstants = [...constants].sort((a, b) => b.name.length - a.name.length);
    
    sortedConstants.forEach(constant => {
        // Create a regex that matches the constant name as a whole word
        // This prevents partial matches (e.g., PI matching inside PIRATE)
        const regex = new RegExp(`\\b${escapeRegExp(constant.name)}\\b`, 'g');
        processedCode = processedCode.replace(regex, constant.value);
    });
    
    return processedCode;
}

/////  Private helper functions

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitFunctions(shaderCode) {
    const functions = [];
    const lines = shaderCode.split('\n');
    let currentFunction = '';
    let braceCount = 0;
    let inFunction = false;
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines, comments, preprocessor directives, and global variables
        if (!trimmedLine || 
            trimmedLine.startsWith('//') || 
            trimmedLine.startsWith('/*') || 
            trimmedLine.startsWith('#') ||
            (trimmedLine.includes(';') && !inFunction && !trimmedLine.includes('{'))) {
            continue;
        }
        
        // Check if this line starts a function (contains parentheses and opening brace pattern)
        if (!inFunction && trimmedLine.includes('(') && trimmedLine.includes(')')) {
            // Look for function pattern: type name(params) or name(params)
            const functionPattern = /^\s*\w+\s+\w+\s*\([^)]*\)\s*\{?|^\s*\w+\s*\([^)]*\)\s*\{?/;
            if (functionPattern.test(trimmedLine)) {
                inFunction = true;
                currentFunction = line + '\n';
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                
                if (braceCount === 0 && trimmedLine.includes('{') && trimmedLine.includes('}')) {
                    // Single line function
                    functions.push(currentFunction.trim());
                    currentFunction = '';
                    inFunction = false;
                }
                continue;
            }
        }
        
        if (inFunction) {
            currentFunction += line + '\n';
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            if (braceCount === 0) {
                functions.push(currentFunction.trim());
                currentFunction = '';
                inFunction = false;
            }
        }
    }
    
    return functions;
}

function createShaderFunctionObject(functionCode) {
    const trimmedCode = functionCode.trim();
    
    // Find the opening brace to separate signature from body
    const openBraceIndex = trimmedCode.indexOf('{');
    if (openBraceIndex === -1) {
        throw new Error('Invalid function: no opening brace found');
    }
    
    // Extract function signature and body
    const signature = trimmedCode.substring(0, openBraceIndex).trim();
    const body = trimmedCode.substring(openBraceIndex + 1, trimmedCode.lastIndexOf('}')).trim();
    
    // Parse the signature to extract return type, name, and parameters
    const parenIndex = signature.indexOf('(');
    const closeParenIndex = signature.lastIndexOf(')');
    
    if (parenIndex === -1 || closeParenIndex === -1) {
        throw new Error('Invalid function signature: missing parentheses');
    }
    
    // Extract parameters
    const parameters = signature.substring(parenIndex + 1, closeParenIndex).trim();
    
    // Extract return type and function name from the part before parentheses
    const beforeParens = signature.substring(0, parenIndex).trim();
    const parts = beforeParens.split(/\s+/);
    
    let returnType, functionName;
    if (parts.length >= 2) {
        // Format: "returnType functionName"
        returnType = parts.slice(0, -1).join(' ');
        functionName = parts[parts.length - 1];
    } else {
        // Format: "functionName" (assuming void return type)
        returnType = 'void';
        functionName = parts[0];
    }
    
    return new ShaderFunction(returnType, functionName, parameters, ` {\n\t${body}\n}`);
}

