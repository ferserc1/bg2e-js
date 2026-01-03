
export enum ProcessType {
    BROWSER = 0,
    NODE = 1
}

export enum ProcessTypeName {
    BROWSER = "Browser",
    NODE = "Node"
}

export const getProcessTypeName = (type: ProcessType): string => {
    switch (type) {
    case ProcessType.BROWSER:
        return ProcessTypeName.BROWSER;
    case ProcessType.NODE:
        return ProcessTypeName.NODE;
    default:
        return ProcessTypeName.BROWSER;
    }
};

export const getProcessType = (): ProcessType => {
    if (typeof process !== 'undefined' && process.release.name === 'node') {
        return ProcessType.NODE;
    }
    else {
        return ProcessType.BROWSER;
    }
}

export const isBrowser = (): boolean => {
    return getProcessType() === ProcessType.BROWSER;
}

export const isNode = (): boolean => {
    return getProcessType() === ProcessType.NODE;
}
