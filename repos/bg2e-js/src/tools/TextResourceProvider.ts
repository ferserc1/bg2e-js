import ResourceProvider from './ResourceProvider';

export default class TextResourceProvider extends ResourceProvider {
    async load(url: string): Promise<any> {
        const response = await fetch(url);
        if (response.ok) {
            const textData = await response.text();
            try {
                const objectData = JSON.parse(textData);
                return objectData;
            }
            catch (e) {
                return textData;
            }
        }
        else {
            throw new Error(`Resource not found at '${ url }'`);
        }
    }

    async write(url: string, data: any): Promise<void> {
        throw new Error('TextResourceProvider.write not implemented.');
    }
}
