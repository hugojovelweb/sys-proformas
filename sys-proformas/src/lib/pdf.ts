import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Parte, Proforma } from '../types';
import { formatoMonto, totalItems, totalLinea } from './calculos';
import { montoALetras } from './numeroALetras';

type RGB = [number, number, number];
const VERDE: RGB = [27, 122, 47];
const GRIS: RGB = [235, 235, 235];
const MARGEN = 12;

interface Logo { data: string; formato: 'PNG' | 'JPEG'; ancho: number; alto: number }
interface Linea { t: string; b?: boolean }
type DocConTabla = jsPDF & { lastAutoTable?: { finalY: number } };

/** Carga /logo.png (carpeta public). Si no existe o falla, el PDF se genera sin logo. */
async function cargarLogo(): Promise<Logo | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}logo.png`);
    if (!res.ok) return null;
    const blob = await res.blob();
    const data = await new Promise<string>((ok, fallo) => {
      const lector = new FileReader();
      lector.onload = () => ok(String(lector.result));
      lector.onerror = () => fallo(lector.error);
      lector.readAsDataURL(blob);
    });
    const dim = await new Promise<{ w: number; h: number }>((ok, fallo) => {
      const img = new Image();
      img.onload = () => ok({ w: img.width, h: img.height });
      img.onerror = () => fallo(new Error('logo inválido'));
      img.src = data;
    });
    return { data, formato: data.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG', ancho: dim.w, alto: dim.h };
  } catch {
    return null;
  }
}

const con = (etiqueta: string, valor: string): Linea | null => (valor.trim() ? { t: `${etiqueta}: ${valor}` } : null);
const sinNulos = (ls: (Linea | null)[]): Linea[] => ls.filter((l): l is Linea => l !== null);

const lineasExportador = (e: Parte): Linea[] =>
  sinNulos([{ t: e.nombre, b: true }, con('NIT', e.nit), con('NRC', e.nrc), con('Actividad', e.actividad), con('Correo', e.correo)]);

const lineasImportador = (i: Parte): Linea[] =>
  sinNulos([
    con('Nombre', i.nombre), con('Nombre Comercial', i.nombreComercial), con('Otro', i.otro), con('País', i.pais),
    con('Dirección', i.direccion), con('Teléfono', i.telefono), con('Correo', i.correo), con('Actividad', i.actividad),
  ]);

/** Genera el PDF con el mismo formato de la proforma de ejemplo del anexo. */
export async function crearPdfProforma(p: Proforma): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const logo = await cargarLogo();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ancho = W - MARGEN * 2;
  let y = MARGEN + 3;

  const asegurar = (alto: number) => {
    if (y + alto > H - MARGEN) { doc.addPage(); y = MARGEN; }
  };
  const seccion = (texto: string) => {
    asegurar(14);
    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...VERDE);
    doc.text(texto, W / 2, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 3;
  };
  const finTabla = () => (doc as DocConTabla).lastAutoTable?.finalY ?? y;

  // Encabezado del exportador
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(0, 0, 0);
  doc.text(p.exportador.nombre, MARGEN, y);
  y += 4.5;
  doc.setFontSize(7);
  const dir = [p.exportador.direccion, p.exportador.telefono ? `Tel: ${p.exportador.telefono}` : ''].filter(Boolean).join(' | ');
  const dirLineas = doc.splitTextToSize(dir, ancho) as string[];
  doc.text(dirLineas, MARGEN, y);
  y += dirLineas.length * 3 + 5;

  seccion('FACTURA DE EXPORTACIÓN PROFORMA');
  y += 2;

  // Caja de control + logo
  const altoCaja = 30;
  doc.setDrawColor(...VERDE).setLineWidth(0.3).rect(MARGEN, y, ancho, altoCaja);
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(0, 0, 0);
  doc.text(`N° Control: ${p.numeroControl}`, MARGEN + 4, y + 7);
  doc.text(`Moneda: ${p.moneda}`, MARGEN + 4, y + altoCaja - 5);
  if (logo) {
    const h = 22;
    const w = (h * logo.ancho) / logo.alto;
    doc.addImage(logo.data, logo.formato, W / 2 - w / 2, y + 4, w, h);
  }
  y += altoCaja + 8;

  // Datos de exportación
  seccion('DATOS DE EXPORTACIÓN');
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    body: [
      ['Tipo item exportación:', p.tipoItem],
      ['Recinto fiscal (CAT-027):', p.recintoFiscal],
      ['Régimen (CAT-028):', p.regimen],
      ['País destino:', p.paisDestino],
      ['Incoterm (CAT-031):', p.incoterm],
    ],
    styles: { fontSize: 9, cellPadding: 1.8, lineColor: [210, 210, 210], lineWidth: 0.2, textColor: [0, 0, 0] },
    columnStyles: { 0: { fillColor: GRIS, fontStyle: 'bold', cellWidth: ancho * 0.36 } },
    margin: { left: MARGEN, right: MARGEN },
  });
  y = finTabla() + 7;

  // Exportador / importador
  const mitad = ancho / 2;
  doc.setFont('helvetica', 'normal').setFontSize(9);
  const envolver = (ls: Linea[]) => ls.map((l) => ({ b: l.b, partes: doc.splitTextToSize(l.t, mitad - 8) as string[] }));
  const colE = envolver(lineasExportador(p.exportador));
  const colI = envolver(lineasImportador(p.importador));
  const altoCol = (c: ReturnType<typeof envolver>) => 12 + c.reduce((a, l) => a + l.partes.length * 4.3, 0);
  const altoPartes = Math.max(altoCol(colE), altoCol(colI)) + 2;
  asegurar(altoPartes + 4);
  doc.setFillColor(...GRIS).setDrawColor(90, 90, 90).setLineWidth(0.3).rect(MARGEN, y, ancho, altoPartes, 'FD');
  doc.line(MARGEN + mitad, y, MARGEN + mitad, y + altoPartes);
  const dibujarColumna = (x: number, titulo: string, col: ReturnType<typeof envolver>) => {
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...VERDE);
    doc.text(titulo, x, y + 7);
    doc.setFontSize(9).setTextColor(0, 0, 0);
    let cy = y + 13;
    for (const l of col) {
      doc.setFont('helvetica', l.b ? 'bold' : 'normal');
      doc.text(l.partes, x, cy);
      cy += l.partes.length * 4.3;
    }
  };
  dibujarColumna(MARGEN + 4, 'DATOS DEL EXPORTADOR', colE);
  dibujarColumna(MARGEN + mitad + 4, 'DATOS DEL IMPORTADOR', colI);
  y += altoPartes + 8;

  // Detalles
  seccion('DETALLES DE EXPORTACIÓN');
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['CANT.', 'DESCRIPCIÓN', 'UNIDAD', 'PRECIO UNIT.', 'TOTAL']],
    body: p.items.map((l) => [String(l.cantidad), l.descripcion, l.unidad, formatoMonto(l.precioUnitario), formatoMonto(totalLinea(l))]),
    styles: { fontSize: 9, cellPadding: 2, lineColor: [90, 90, 90], lineWidth: 0.2, textColor: [0, 0, 0] },
    headStyles: { fillColor: GRIS, textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'center', cellWidth: 28 },
      4: { halign: 'center', cellWidth: 28 },
    },
    margin: { left: MARGEN, right: MARGEN },
  });
  y = finTabla() + 7;

  // Totales
  const total = totalItems(p.items);
  const wIzq = ancho * 0.64;
  doc.setFont('helvetica', 'normal').setFontSize(9);
  const letras = doc.splitTextToSize(montoALetras(total, p.moneda), wIzq - 8) as string[];
  const altoTotales = 7 + 5.5 + letras.length * 4.3 + 5 + 5.5 + 9 + 4;
  asegurar(altoTotales + 4);
  doc.setDrawColor(...VERDE).setLineWidth(0.3).rect(MARGEN, y, ancho, altoTotales);
  doc.line(MARGEN + wIzq, y, MARGEN + wIzq, y + altoTotales);
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...VERDE);
  doc.text('TOTAL EN LETRAS:', MARGEN + 4, y + 7);
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(0, 0, 0);
  let cy = y + 12.5;
  doc.text(letras, MARGEN + 4, cy);
  cy += letras.length * 4.3 + 5;
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...VERDE);
  doc.text('CONDICIÓN DE PAGO:', MARGEN + 4, cy);
  cy += 5.5;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(0, 0, 0);
  doc.text(p.condicionPago, MARGEN + 4, cy);
  doc.text(`- Efectivo: ${formatoMonto(total)}`, MARGEN + 4, cy + 4.5);
  const xDer = MARGEN + wIzq + 3;
  const xFin = MARGEN + ancho - 3;
  doc.text('SUMAS:', xDer, y + 6);
  doc.text(formatoMonto(total), xFin, y + 6, { align: 'right' });
  doc.setFillColor(...GRIS).setDrawColor(...VERDE);
  doc.rect(xDer, y + 8.5, xFin - xDer, 6.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', xDer + 1, y + 13);
  doc.text(formatoMonto(total), xFin - 1, y + 13, { align: 'right' });

  // Pie de página
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${paginas}`, W / 2, H - 6, { align: 'center' });
  }
  return doc;
}

export async function descargarProformaPdf(p: Proforma): Promise<void> {
  const doc = await crearPdfProforma(p);
  const seguro = p.numeroControl.replace(/[^A-Za-z0-9_-]/g, '') || 'sin-numero';
  doc.save(`Proforma-${seguro}.pdf`);
}
