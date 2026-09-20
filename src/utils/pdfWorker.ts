import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdfjs-dist
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  // Fallback to unpkg CDN if worker bundler resolution is not supported
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export { pdfjsLib };
