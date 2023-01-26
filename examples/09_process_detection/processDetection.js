import { ProcessType, ProcessTypeName, getProcessType } from "bg2e/tools/processType.js";

export const executeExample = async () => {
    const processType = getProcessType();
    let result = `Current process: ${ ProcessTypeName[processType] }\n`;
    switch (processType) {
    case ProcessType.BROWSER:
        result += "The application is running in a browser\n";
        break;
    case ProcessType.ELECTRON_RENDERER:
        result += "The application is running in Electron (renderer process)\n";
        break;
    case ProcessType.ELECTRON_MAIN:
        result += "The application is running in Electron (main process)\n";
        break;
    case ProcessType.NODE:
        result += "The application is running in Node.js\n";
        break;
    }
    return result;
}

