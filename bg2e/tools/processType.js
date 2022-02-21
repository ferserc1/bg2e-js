
export const ProcessType = {
    BROWSER: 0,
    ELECTRON_RENDERER: 1,
    ELECTRON_MAIN: 2,
    NODE: 3
};

export const ProcessTypeName = {
    0: "Browser",
    1: "Electron (renderer)",
    2: "Electron (main)",
    3: "Node"
};

export const getProcessType = () => {
    if (typeof process !== 'undefined' && process.release.name === 'node') {
        return ProcessType.NODE;
    }
    else if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return ProcessType.ELECTRON_RENDERER;
    }
    else if (typeof process !== 'undefined' && typeof process.versions === 'object' && !process.versions.electron) {
        return ProcessType.ELECTRON_MAIN;
    }
    else if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return ProcessType.ELECTRON_RENDERER;
    }
    else {
        return ProcessType.BROWSER;
    }
}


export const isElectron = () => {
    switch (getProcessType()) {
    case ProcessType.ELECTRON_RENDERER:
    case ProcessType.ELECTRON_MAIN:
        return true;
    default:
        return false;
    }
}

export const isBrowser = () => {
    return getProcessType() === ProcessType.BROWSER;
}

export const isNode = () => {
    return getProcessType() === ProcessType.NODE;
}
