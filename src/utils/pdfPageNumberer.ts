import { PDFDocument, rgb, StandardFonts, RGB } from 'pdf-lib';
import { PageNumberConfig, PageNumberFormat } from '../types';

export function formatPageNumberText(
  pageIndex: number, // 0-based page index
  totalPages: number,
  config: PageNumberConfig
): string {
  // Current logical number
  const logicalNumber = config.startingNumber + (pageIndex - (config.startFromPage - 1));
  const totalNumberedPages = totalPages - (config.startFromPage - 1);

  switch (config.format) {
    case 'number-only':
      return `${logicalNumber}`;
    case 'hyphens':
      return `- ${logicalNumber} -`;
    case 'slash-total':
      return `${logicalNumber} / ${totalNumberedPages}`;
    case 'page-x-of-y':
      return `Page ${logicalNumber} of ${totalNumberedPages}`;
    case 'p-number':
      return `p. ${logicalNumber}`;
    case 'brackets':
      return `[ ${logicalNumber} ]`;
    default:
      return `${logicalNumber}`;
  }
}

function getColor(fontColor: PageNumberConfig['fontColor']): RGB {
  switch (fontColor) {
    case 'black':
      return rgb(0.1, 0.1, 0.1);
    case 'dark-gray':
      return rgb(0.3, 0.35, 0.4);
    case 'subtle-gray':
      return rgb(0.55, 0.6, 0.65);
    case 'indigo':
      return rgb(0.3, 0.28, 0.85);
    default:
      return rgb(0.2, 0.2, 0.2);
  }
}

export async function addPageNumbersToPdf(
  pdfBytes: Uint8Array,
  config: PageNumberConfig
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);

  let font;
  if (config.fontFamily === 'times') {
    font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  } else if (config.fontFamily === 'courier') {
    font = await pdfDoc.embedFont(StandardFonts.Courier);
  } else {
    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  }

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const color = getColor(config.fontColor);
  const fontSize = config.fontSize;
  const margin = config.margin;

  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1; // 1-based

    // Check if this page should be numbered
    if (config.skipFirstPage && pageNumber === 1) {
      continue;
    }
    if (pageNumber < config.startFromPage) {
      continue;
    }

    const page = pages[i];
    const { width, height } = page.getSize();
    const text = formatPageNumberText(i, totalPages, config);
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = 0;
    let y = 0;

    switch (config.position) {
      case 'bottom-center':
        x = (width - textWidth) / 2;
        y = margin;
        break;
      case 'bottom-right':
        x = width - textWidth - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - margin - fontSize;
        break;
      case 'top-right':
        x = width - textWidth - margin;
        y = height - margin - fontSize;
        break;
      case 'top-left':
        x = margin;
        y = height - margin - fontSize;
        break;
      default:
        x = (width - textWidth) / 2;
        y = margin;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color,
    });
  }

  return await pdfDoc.save();
}
