import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { BRAND } from '@/configs/brand';
import type { EntityNode } from '@/features/editor/types';
import { formatDate, slugify } from '@/lib/utils';

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1280;

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportError';
  }
}

/**
 * Encuadra el diagrama completo antes de capturarlo. Sin este ajuste la imagen
 * saldría recortada a lo que se ve en pantalla en lugar de al diagrama entero.
 */
async function renderDiagramImage(nodes: EntityNode[]): Promise<string> {
  const viewportElement = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!viewportElement) {
    throw new ExportError('No se encontró el área de trabajo para exportar.');
  }
  if (nodes.length === 0) {
    throw new ExportError('El diagrama está vacío. Agrega al menos un elemento antes de exportar.');
  }

  const bounds = getNodesBounds(nodes);
  const viewport = getViewportForBounds(bounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.2, 2.5, 0.12);

  return toPng(viewportElement, {
    backgroundColor: '#ffffff',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    pixelRatio: 2,
    style: {
      width: `${IMAGE_WIDTH}px`,
      height: `${IMAGE_HEIGHT}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  });
}

function triggerDownload(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export type ExportMeta = {
  projectName: string;
  toolName: string;
  authorName: string;
  notes?: string;
};

export async function exportDiagramAsPng(nodes: EntityNode[], meta: ExportMeta): Promise<void> {
  const dataUrl = await renderDiagramImage(nodes);
  triggerDownload(dataUrl, `${slugify(meta.projectName) || 'diagrama'}.png`);
}

export async function exportDiagramAsPdf(nodes: EntityNode[], meta: ExportMeta): Promise<void> {
  const dataUrl = await renderDiagramImage(nodes);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;

  pdf.setFillColor(23, 133, 120);
  pdf.rect(0, 0, pageWidth, 18, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.text(meta.projectName, margin, 11.5);
  pdf.setFontSize(9);
  pdf.text(meta.toolName, pageWidth - margin, 11.5, { align: 'right' });

  const imageTop = 18 + margin;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - imageTop - 16;
  const ratio = Math.min(availableWidth / IMAGE_WIDTH, availableHeight / IMAGE_HEIGHT);
  const drawWidth = IMAGE_WIDTH * ratio;
  const drawHeight = IMAGE_HEIGHT * ratio;

  pdf.addImage(
    dataUrl,
    'PNG',
    (pageWidth - drawWidth) / 2,
    imageTop,
    drawWidth,
    drawHeight,
    undefined,
    'FAST',
  );

  pdf.setTextColor(120, 130, 145);
  pdf.setFontSize(8);
  pdf.text(
    `Elaborado por ${meta.authorName} · ${formatDate(new Date().toISOString())}`,
    margin,
    pageHeight - 7,
  );
  pdf.text(`${BRAND.name} · ${BRAND.tagline}`, pageWidth - margin, pageHeight - 7, {
    align: 'right',
  });

  if (meta.notes?.trim()) {
    pdf.setTextColor(70, 80, 95);
    pdf.setFontSize(9);
    pdf.text(pdf.splitTextToSize(meta.notes.trim(), availableWidth), margin, pageHeight - 14);
  }

  pdf.save(`${slugify(meta.projectName) || 'diagrama'}.pdf`);
}
