import { PDFDocument } from 'pdf-lib';

/**
 * Extracts specified pages (1-based page numbers) from source PDF and creates a new PDF document.
 */
export async function extractPagesToNewPdf(
  sourcePdfBytes: Uint8Array,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(sourcePdfBytes);
  const newDoc = await PDFDocument.create();

  // Deduplicate and sort page numbers
  const uniqueSortedPages = Array.from(new Set(pageNumbers)).sort((a, b) => a - b);
  const totalPages = srcDoc.getPageCount();

  // Convert 1-based page numbers to 0-based indices, filtering valid ones
  const validIndices = uniqueSortedPages
    .filter((p) => p >= 1 && p <= totalPages)
    .map((p) => p - 1);

  if (validIndices.length === 0) {
    throw new Error('有効なページが選択されていません。');
  }

  const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Saves file using File System Access API (showSaveFilePicker) if available,
 * allowing user to choose exact directory and filename, or falls back to browser download.
 */
export async function saveFileWithPickerOrDownload(
  data: Uint8Array,
  suggestedName: string,
  mimeType: string = 'application/pdf',
  description: string = 'PDF Document'
): Promise<boolean> {
  const blob = new Blob([data.slice().buffer as ArrayBuffer], { type: mimeType });

  // 1. Try modern File System Access API (supported in Chrome, Edge, Opera, etc.)
  if ('showSaveFilePicker' in window && typeof (window as any).showSaveFilePicker === 'function') {
    try {
      const extension = suggestedName.split('.').pop() || 'pdf';
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description,
            accept: {
              [mimeType]: [`.${extension}`],
            },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled picker dialog
        return false;
      }
      console.warn('File System Access API failed or unsupported, falling back to download:', err);
    }
  }

  // 2. Standard browser download fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/**
 * Renders a specific page of a PDF directly to PNG image bytes.
 */
export async function exportPageAsImage(
  pdfDoc: any,
  pageNumber: number,
  scale: number = 2.0
): Promise<Blob> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas 2d context');

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to convert canvas to Blob'));
    }, 'image/png');
  });
}
