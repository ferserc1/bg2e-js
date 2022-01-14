
export default class Electron {
    get isElectronApp() {
        return (typeof module !== "undefined" && module.exports && true) || false;
    }
}
