import { describe, expect, it } from 'vitest';
import { formatoMonto, totalItems } from './calculos';

describe('calculos', () => {
  it('suma líneas con redondeo a 2 decimales', () => {
    const items = [
      { id: 'a', cantidad: 1000, descripcion: 'x', unidad: 'Unidad', precioUnitario: 15 },
      { id: 'b', cantidad: 3, descripcion: 'y', unidad: 'Unidad', precioUnitario: 0.1 },
    ];
    expect(totalItems(items)).toBe(15000.3);
  });
  it('formatea igual que el PDF de ejemplo', () => {
    expect(formatoMonto(15000)).toBe('$15000.00');
  });
});
