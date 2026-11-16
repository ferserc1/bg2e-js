const scriptFactories = new Map<string, Promise<any>>();
/** Shared artifact location and lazy module initialization for loader plugins. */
export default class WasmResources {
    private _baseUrl: string;
    private modules = new Map<string, Promise<unknown>>();

    constructor(baseUrl = './bg2io/') {
        this._baseUrl = baseUrl;
    }
    get baseUrl(): string { return this._baseUrl; }
    set baseUrl(value: string) { this._baseUrl = value; }
    resolve(file: string): string {
        if (!file || file.includes('..') || /^[a-z]+:|^\//i.test(file)) throw new Error('Expected a relative WASM artifact name');
        return `${this.baseUrl.replace(/\/?$/, '/')}${file}`;
    }
    /** Adapter for legacy classic-script Emscripten factories (e.g. bg2io). */
    loadScriptFactory(file: string, symbol: string, baseUrl = this.baseUrl): Promise<any> {
        const url = new URL(new WasmResources(baseUrl).resolve(file), document.baseURI).href;
        let pending = scriptFactories.get(url);
        if (!pending) {
            pending = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url; script.async = false;
                const finish = (error?: Error) => {
                    clearTimeout(timer); script.remove();
                    if (error) reject(error);
                    else {
                        const factory = (globalThis as any)[symbol];
                        if (typeof factory !== 'function') reject(new Error(`Missing WASM factory: ${symbol}`));
                        else resolve(factory);
                    }
                };
                const timer = setTimeout(() => finish(new Error(`Timed out loading ${url}`)), 30000);
                script.onload = () => finish();
                script.onerror = () => finish(new Error(`Unable to load ${url}`));
                document.head.appendChild(script);
            });
            scriptFactories.set(url, pending);
            pending.catch(() => scriptFactories.delete(url));
        }
        return pending;
    }
    load<T>(name: string, initialize: (resolve: (file: string) => string) => Promise<T>, baseUrl = this.baseUrl): Promise<T> {
        const key = `${baseUrl}\n${name}`;
        let pending = this.modules.get(key) as Promise<T> | undefined;
        if (!pending) {
            const location = new WasmResources(baseUrl);
            pending = Promise.resolve().then(() => initialize(file => location.resolve(file)));
            this.modules.set(key, pending);
            // A failed initialization is retried only on an explicit subsequent load.
            pending.catch(() => { if (this.modules.get(key) === pending) this.modules.delete(key); });
        }
        return pending;
    }
}
