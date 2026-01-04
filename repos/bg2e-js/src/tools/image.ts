import { generateMD5 } from '../tools/crypto';

export const imageToBase64 = (image: HTMLImageElement, format = 'image/jpeg') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    if (ctx === null) {
        throw new Error('Could not get canvas 2D context');
    }
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL(format);
}

export const generateImageHash = (image: HTMLImageElement) => {
    const base64 = imageToBase64(image);
    return generateMD5(base64);
}
