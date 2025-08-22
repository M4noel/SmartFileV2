import sharp from 'sharp';

export async function compressImage(buffer, options) {
  const { quality = 70, format = 'jpeg' } = options;

  return await sharp(buffer)
    .toFormat(format, { quality: parseInt(quality) })
    .toBuffer();
}

export default compressImage;