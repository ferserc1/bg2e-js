import { generateMD5 } from '../tools/crypto';

export const imageToBase64 = (image, format = 'image/jpeg') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL(format);
}

export const generateImageHash = (image) => {
    const base64 = imageToBase64(image);
    return generateMD5(base64);
}
