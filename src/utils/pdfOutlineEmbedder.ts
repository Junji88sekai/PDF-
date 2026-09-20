import { PDFDocument, PDFName, PDFNumber, PDFHexString } from 'pdf-lib';
import { TocItem } from '../types';

interface OutlineTreeNode {
  item: TocItem;
  ref: any;
  parentRef: any;
  prevRef: any;
  nextRef: any;
  children: OutlineTreeNode[];
}

/**
 * Embeds hierarchical table of contents (TOC) as standard PDF Outlines / Bookmarks into a PDF.
 * This allows Adobe Acrobat Reader, Apple Preview, Google Chrome, and Edge PDF viewers to
 * display the bookmarks in their sidebar and navigate directly to target pages.
 */
export async function embedOutlinesInPdf(
  pdfBytes: Uint8Array,
  tocItems: TocItem[]
): Promise<Uint8Array> {
  // Load PDF with pdf-lib
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const pageCount = pages.length;

  if (pageCount === 0) {
    return pdfBytes;
  }

  // If no TOC items, remove existing outlines if present and return
  if (!tocItems || tocItems.length === 0) {
    pdfDoc.catalog.delete(PDFName.of('Outlines'));
    return await pdfDoc.save();
  }

  // Create Outlines dictionary
  const outlinesDict = pdfDoc.context.obj({
    Type: 'Outlines',
  });
  const outlinesRef = pdfDoc.context.register(outlinesDict);

  // Build hierarchical tree structure from flat TocItem list based on level
  const rootNodes: OutlineTreeNode[] = [];
  const stack: { node: OutlineTreeNode; level: number }[] = [];

  for (const item of tocItems) {
    const node: OutlineTreeNode = {
      item,
      ref: pdfDoc.context.nextRef(),
      parentRef: null,
      prevRef: null,
      nextRef: null,
      children: [],
    };
    const level = Math.max(1, item.level || 1);

    // Pop any nodes that are at the same or deeper level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      node.parentRef = outlinesRef;
      rootNodes.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      node.parentRef = parent.ref;
      parent.children.push(node);
    }

    stack.push({ node, level });
  }

  // Helper to count total open descendants
  function countDescendants(node: OutlineTreeNode): number {
    let count = node.children.length;
    for (const child of node.children) {
      count += countDescendants(child);
    }
    return count;
  }

  // Process nodes, link siblings, and assign to PDF context
  function processList(nodes: OutlineTreeNode[], parentRef: any) {
    for (let i = 0; i < nodes.length; i++) {
      const curr = nodes[i];
      if (i > 0) curr.prevRef = nodes[i - 1].ref;
      if (i < nodes.length - 1) curr.nextRef = nodes[i + 1].ref;

      if (curr.children.length > 0) {
        processList(curr.children, curr.ref);
      }

      // Clamp target page index to valid page range (0-based)
      const targetPageIdx = Math.max(
        0,
        Math.min(pageCount - 1, (curr.item.pageNumber || 1) - 1)
      );
      const pageRef = pages[targetPageIdx].ref;
      // XYZ with null, null, null navigates to top-left retaining current zoom
      const dest = pdfDoc.context.obj([
        pageRef,
        PDFName.of('XYZ'),
        null,
        null,
        null,
      ]);

      const dictObj: Record<string, any> = {
        Title: PDFHexString.fromText(curr.item.title || 'Untitled'),
        Parent: parentRef,
        Dest: dest,
      };

      if (curr.prevRef) dictObj.Prev = curr.prevRef;
      if (curr.nextRef) dictObj.Next = curr.nextRef;

      if (curr.children.length > 0) {
        dictObj.First = curr.children[0].ref;
        dictObj.Last = curr.children[curr.children.length - 1].ref;
        // Positive Count displays the outline item expanded by default
        dictObj.Count = PDFNumber.of(countDescendants(curr));
      }

      const dict = pdfDoc.context.obj(dictObj);
      pdfDoc.context.assign(curr.ref, dict);
    }
  }

  if (rootNodes.length > 0) {
    processList(rootNodes, outlinesRef);

    let totalCount = rootNodes.length;
    for (const root of rootNodes) {
      totalCount += countDescendants(root);
    }

    outlinesDict.set(PDFName.of('First'), rootNodes[0].ref);
    outlinesDict.set(PDFName.of('Last'), rootNodes[rootNodes.length - 1].ref);
    outlinesDict.set(PDFName.of('Count'), PDFNumber.of(totalCount));

    // Register Outlines into Catalog
    pdfDoc.catalog.set(PDFName.of('Outlines'), outlinesRef);
    // Automatically open Document Outlines / Bookmarks panel in Acrobat Reader & browsers
    pdfDoc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines'));
  }

  return await pdfDoc.save();
}
