import PDFMerger from 'pdf-merger-js';

export default async (files) => {
  const merger = new PDFMerger();
  
  for (const file of files) {
    await merger.add(file.buffer);
  }

  return merger.saveAsBuffer();
};