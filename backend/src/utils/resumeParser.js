const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { createWorker } = require('tesseract.js');
const pdf2pic = require('pdf2pic'); // optional: for PDF image pages

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  console.log('Extracting file with extension:', ext);

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    if (data.text.trim().length > 50) {
      console.log('✅ PDF Text extracted (text-based PDF)');
      return data.text;
    } else {
      console.log('⚠️ PDF appears to be scanned or image-based, using OCR...');
      return await extractTextWithOCR(filePath);
    }
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    console.log('✅ DOCX Text Length:', result.value.length);
    return result.value;
  }

  if (ext === '.txt') {
    const txt = fs.readFileSync(filePath, 'utf-8');
    console.log('✅ TXT Text Length:', txt.length);
    return txt;
  }

  throw new Error('Unsupported file type for text extraction');
}

async function extractTextWithOCR(filePath) {
  const { fromPath } = pdf2pic;
  const convert = fromPath(filePath, {
    density: 200,
    saveFilename: 'ocr_output',
    savePath: './tmp',
    format: 'png',
    width: 1200,
    height: 1600
  });

  const firstPageImage = await convert(1);
  const worker = await createWorker(['eng']);
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const {
    data: { text },
  } = await worker.recognize(firstPageImage.path);

  await worker.terminate();
  console.log('✅ OCR Text Length:', text.length);
  return text;
}

module.exports = { extractText };
