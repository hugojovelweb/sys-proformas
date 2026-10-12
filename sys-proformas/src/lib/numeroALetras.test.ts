import { describe, expect, it } from 'vitest';
import { enteroALetras, montoALetras } from './numeroALetras';

describe('montoALetras', () => {
  it('convierte el total del PDF de ejemplo (antes: "fuera de rango")', () => {
    expect(montoALetras(15000)).toBe('QUINCE MIL CON 00/100 DÓLARES');
  });
  it('maneja centavos y redondeo', () => {
    expect(montoALetras(1234.5)).toBe('MIL DOSCIENTOS TREINTA Y CUATRO CON 50/100 DÓLARES');
    expect(montoALetras(0.999)).toBe('UNO CON 00/100 DÓLARES');
  });
  it('rechaza valores inválidos', () => {
    expect(montoALetras(-1)).toBe('NÚMERO FUERA DE RANGO');
    expect(montoALetras(Number.NaN)).toBe('NÚMERO FUERA DE RANGO');
    expect(montoALetras(1_000_000_000)).toBe('NÚMERO FUERA DE RANGO');
  });
});

describe('enteroALetras', () => {
  it.each([
    [0, 'CERO'], [1, 'UNO'], [21, 'VEINTIUNO'], [100, 'CIEN'], [101, 'CIENTO UNO'],
    [1000, 'MIL'], [21000, 'VEINTIÚN MIL'], [101000, 'CIENTO UN MIL'], [1_000_000, 'UN MILLÓN'],
    [2_000_001, 'DOS MILLONES UNO'], [999_999_999, 'NOVECIENTOS NOVENTA Y NUEVE MILLONES NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE'],
  ])('%i -> %s', (n, esperado) => {
    expect(enteroALetras(n)).toBe(esperado);
  });
});
