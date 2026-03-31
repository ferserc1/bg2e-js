/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


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
    // TODO: Node process detection disabled for now
    //if (typeof process !== 'undefined' && process.release.name === 'node') {
    //    return ProcessType.NODE;
    //}
    //else {
        return ProcessType.BROWSER;
    //}
}

export const isBrowser = (): boolean => {
    return getProcessType() === ProcessType.BROWSER;
}

export const isNode = (): boolean => {
    return getProcessType() === ProcessType.NODE;
}
