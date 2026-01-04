
interface VersionInfo {
    major: number;
    minor: number;
    revision: number;
    stringValue: string;
    name: string;
    versionString: string;
}

interface SystemInfo {
    OSX: boolean;
    Windows: boolean;
    iPhone: boolean;
    iPodTouch: boolean;
    iPad: boolean;
    iOS: boolean;
    Android: boolean;
    Linux: boolean;
    OSName: string;
    Version: VersionInfo;
}

interface BrowserInfo {
    Version: VersionInfo;
    Safari: boolean;
    Chrome: boolean;
    Opera: boolean;
    Firefox: boolean;
    Edge: boolean;
    Explorer: boolean;
    MobileSafari: boolean;
    Android: boolean;
    IsMobileVersion: boolean;
    Name: string;
    Vendor: string;
}

export default class UserAgent {
    system: SystemInfo = {
        OSX: false,
        Windows: false,
        iPhone: false,
        iPodTouch: false,
        iPad: false,
        iOS: false,
        Android: false,
        Linux: false,
        OSName: "",
        Version: {
            major: 0,
            minor: 0,
            revision: 0,
            stringValue: "",
            name: "",
            versionString: ""
        }
    }
    browser: BrowserInfo = {
        Version: {
            major: 0,
            minor: 0,
            revision: 0,
            stringValue: "",
            name: "",
            versionString: ""
        },
        Safari: false,
        Chrome: false,
        Opera: false,
        Firefox: false,
        Edge: false,
        Explorer: false,
        MobileSafari: false,
        Android: false,
        IsMobileVersion: false,
        Name: "",
        Vendor: ""
    }

    constructor(userAgentString?: string) {
        if (!userAgentString) {
            userAgentString = navigator.userAgent;
        }
        this.parseOperatingSystem(userAgentString);
        this.parseBrowser(userAgentString);
    }

    parseOperatingSystem(userAgentString: string): void {
        this.system.OSX = /Macintosh/.test(userAgentString);
        this.system.Windows = /Windows/.test(userAgentString);
        this.system.iPhone = /iPhone/.test(userAgentString);
        this.system.iPodTouch = /iPod/.test(userAgentString);
        this.system.iPad = /iPad/.test(userAgentString);
        this.system.iOS = this.system.iPhone || this.system.iPad || this.system.iPodTouch;
        this.system.Android = /Android/.test(userAgentString);
        this.system.Linux = (this.system.Android) ? false:/Linux/.test(userAgentString);

        if (this.system.OSX) {
            this.system.OSName = "OS X";
            this.parseOSXVersion(userAgentString);
        }
        else if (this.system.Windows) {
            this.system.OSName = "Windows";
            this.parseWindowsVersion(userAgentString);
        }
        else if (this.system.Linux) {
            this.system.OSName = "Linux";
            this.parseLinuxVersion(userAgentString);
        }
        else if (this.system.iOS) {
            this.system.OSName = "iOS";
            this.parseIOSVersion(userAgentString);
        }
        else if (this.system.Android) {
            this.system.OSName = "Android";
            this.parseAndroidVersion(userAgentString);
        }
    }

    parseBrowser(userAgentString: string): void {
        // Safari: Version/X.X.X Safari/XXX
        // Chrome: Chrome/XX.X.XX.XX Safari/XXX
        // Opera: Opera/X.XX
        // Firefox: Gecko/XXXXXX Firefox/XX.XX.XX
        // Explorer: MSIE X.X
        this.browser.Safari = /Version\/([\d\.]+) Safari\//.test(userAgentString);
        if (this.browser.Safari) {
            this.browser.Name = "Safari";
            this.browser.Vendor = "Apple";
            this.browser.Version.versionString = RegExp.$1;
        }

        this.browser.Chrome = /Chrome\/([\d\.]+) Safari\//.test(userAgentString);
        if (this.browser.Chrome) {
            this.browser.Name = "Chrome";
            this.browser.Vendor = "Google";
            this.browser.Version.versionString = RegExp.$1;
        }

        this.browser.Opera = /Opera\/[\d\.]+/.test(userAgentString);
        if (this.browser.Opera) {
            this.browser.Name = "Opera";
            this.browser.Vendor = "Opera Software";
            var versionString = /Version\/([\d\.]+)/.test(userAgentString);
            this.browser.Version.versionString = RegExp.$1;
        }

        this.browser.Firefox = /Gecko\/[\d\.]+ Firefox\/([\d\.]+)/.test(userAgentString);
        if (this.browser.Firefox) {
            this.browser.Name = "Firefox";
            this.browser.Vendor = "Mozilla Foundation";
            this.browser.Version.versionString = RegExp.$1;
        }

        this.browser.Edge = /Edge\/(.*)/.test(userAgentString);
        if (this.browser.Edge) {
            var result = /Edge\/(.*)/.exec(userAgentString);
            this.browser.Name = "Edge";
            this.browser.Chrome = false;
            this.browser.Vendor = "Microsoft";
            this.browser.Version.versionString = result && result[1] || "unknown";
        } 

        this.browser.Explorer = /MSIE ([\d\.]+)/.test(userAgentString);
        if (!this.browser.Explorer) {
            var re = /\Mozilla\/5.0 \(([^)]+)\) like Gecko/
            var matches = re.exec(userAgentString);
            if (matches) {
                re = /rv:(.*)/
                var version = re.exec(matches[1]);
                this.browser.Explorer = true;
                this.browser.Name = "Internet Explorer";
                this.browser.Vendor = "Microsoft";
                if (version) {
                    this.browser.Version.versionString = version[1];
                }
                else {
                    this.browser.Version.versionString = "unknown";
                }
            }
        }
        else {
            this.browser.Name = "Internet Explorer";
            this.browser.Vendor = "Microsoft";
            this.browser.Version.versionString = RegExp.$1;
        }

        if (this.system.iOS) {
            this.browser.IsMobileVersion = true;
            this.browser.MobileSafari = /Version\/([\d\.]+) Mobile/.test(userAgentString);
            if (this.browser.MobileSafari) {
                this.browser.Name = "Mobile Safari";
                this.browser.Vendor = "Apple";
                this.browser.Version.versionString = RegExp.$1;
            }
            this.browser.Android = false;
        }
        else if (this.system.Android) {
            this.browser.IsMobileVersion = true;
            this.browser.Android = /Version\/([\d\.]+) Mobile/.test(userAgentString);
            if (this.browser.MobileSafari) {
                this.browser.Name = "Android Browser";
                this.browser.Vendor = "Google";
                this.browser.Version.versionString = RegExp.$1;
            }
            else {
                this.browser.Chrome = /Chrome\/([\d\.]+)/.test(userAgentString);
                this.browser.Name = "Chrome";
                this.browser.Vendor = "Google";
                this.browser.Version.versionString = RegExp.$1;
            }

            this.browser.Safari = false;
        }
        else {
            this.browser.IsMobileVersion = false;
        }

        this.parseBrowserVersion(userAgentString);
    }

    parseBrowserVersion(userAgentString: string): void {
        if (/([\d]+)\.([\d]+)\.*([\d]*)/.test(this.browser.Version.versionString)) {
            this.browser.Version.major = Number(RegExp.$1);
            this.browser.Version.minor = Number(RegExp.$2);
            this.browser.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
        }
    }

    parseOSXVersion(userAgentString: string): void {
        var versionString = (/Mac OS X (\d+_\d+_*\d*)/.test(userAgentString)) ? RegExp.$1:'';
        // Safari/Chrome
        if (versionString!='') {
            if (/(\d+)_(\d+)_*(\d*)/.test(versionString)) {
                this.system.Version.major = Number(RegExp.$1);
                this.system.Version.minor = Number(RegExp.$2);
                this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
            }
        }
        // Firefox/Opera
        else {
            versionString = (/Mac OS X (\d+\.\d+\.*\d*)/.test(userAgentString)) ? RegExp.$1:'Unknown';
            if (/(\d+)\.(\d+)\.*(\d*)/.test(versionString)) {
                this.system.Version.major = Number(RegExp.$1);
                this.system.Version.minor = Number(RegExp.$2);
                this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
            }
        }
        if (!this.system.Version.major) {
            this.system.Version.major = 0;
            this.system.Version.minor = 0;
            this.system.Version.revision = 0;
        }
        this.system.Version.stringValue = this.system.Version.major + '.' + this.system.Version.minor + '.' + this.system.Version.revision;
        switch (this.system.Version.minor) {
            case 0:
                this.system.Version.name = "Cheetah";
                break;
            case 1:
                this.system.Version.name = "Puma";
                break;
            case 2:
                this.system.Version.name = "Jaguar";
                break;
            case 3:
                this.system.Version.name = "Panther";
                break;
            case 4:
                this.system.Version.name = "Tiger";
                break;
            case 5:
                this.system.Version.name = "Leopard";
                break;
            case 6:
                this.system.Version.name = "Snow Leopard";
                break;
            case 7:
                this.system.Version.name = "Lion";
                break;
            case 8:
                this.system.Version.name = "Mountain Lion";
                break;
        }
    }

    parseWindowsVersion(userAgentString: string): void {
        if (/NT (\d+)\.(\d*)/.test(userAgentString)) {
            this.system.Version.major = Number(RegExp.$1);
            this.system.Version.minor = Number(RegExp.$2);
            this.system.Version.revision = 0;	// Solo por compatibilidad
            this.system.Version.stringValue = "NT " + this.system.Version.major + "." + this.system.Version.minor;
            var major = this.system.Version.major;
            var minor = this.system.Version.minor;
            var name = 'undefined';
            if (major==5) {
                if (minor==0) this.system.Version.name = '2000';
                else this.system.Version.name = 'XP';
            }
            else if (major==6) {
                if (minor==0) this.system.Version.name = 'Vista';
                else if (minor==1) this.system.Version.name = '7';
                else if (minor==2) this.system.Version.name = '8';
            }
        }
        else {
            this.system.Version.major = 0;
            this.system.Version.minor = 0;
            this.system.Version.name = "Unknown";
            this.system.Version.stringValue = "Unknown";
        }
    }

    parseLinuxVersion(userAgentString: string): void {
        this.system.Version.major = 0;
        this.system.Version.minor = 0;
        this.system.Version.revision = 0;
        this.system.Version.name = "";
        this.system.Version.stringValue = "Unknown distribution";
    }

    parseIOSVersion(userAgentString: string): void {
        if (/iPhone OS (\d+)_(\d+)_*(\d*)/i.test(userAgentString)) {
            this.system.Version.major = Number(RegExp.$1);
            this.system.Version.minor = Number(RegExp.$2);
            this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
            this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
            this.system.Version.name = "iOS";
        }
        else {
            this.system.Version.major = 0;
            this.system.Version.minor = 0;
            this.system.Version.name = "Unknown";
            this.system.Version.stringValue = "Unknown";
        }
    }

    parseAndroidVersion(userAgentString: string): void {
        if (/Android (\d+)\.(\d+)\.*(\d*)/.test(userAgentString)) {
            this.system.Version.major = Number(RegExp.$1);
            this.system.Version.minor = Number(RegExp.$2);
            this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
            this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
        }
        else {
            this.system.Version.major = 0;
            this.system.Version.minor = 0;
            this.system.Version.revision = 0;
        }
        if (/Build\/([a-zA-Z]+)/.test(userAgentString)) {
            this.system.Version.name = RegExp.$1;
        }
        else {
            this.system.Version.name = "Unknown version";
        }
        this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
    }

    getInfoString(): string {
        return navigator.userAgent;
    }
}
