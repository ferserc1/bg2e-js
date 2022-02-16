import ResourceProvider from './ResourceProvider.js';

export default class TextResourceProvider extends ResourceProvider {
    async load(url) {
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
}
