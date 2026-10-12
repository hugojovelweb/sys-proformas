import type { LineaItem } from '../types';

export const redondear2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const totalLinea = (l: Pick<LineaItem, 'cantidad' | 'precioUnitario'>): number =>
  redondear2(l.cantidad * l.precioUnitario);

export const totalItems = (items: LineaItem[]): number =>
  redondear2(items.reduce((acc, l) => acc + totalLinea(l), 0));

/** Mismo formato del PDF de ejemplo: $15000.00 (sin separador de miles). */
export const formatoMonto = (n: number): string => `$${n.toFixed(2)}`;
