
export default class Path {
    get sep() { return "/"; }

    join(a,b) {
        if (a.lastIndexOf(this.sep)!=a.length-1) {
            return a + this.sep + b;
        }
        else {
            return a + b;
        }
    }

    extension(path) {
        return path.split(".").pop();
    }

    fileName(path) {
        return path.split(this.sep).pop();
    }

    removeFileName(path) {
        let result = path.split(this.sep);
        result.pop();
        return result.join(this.sep);
    }
}
