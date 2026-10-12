import { describe, expect, it } from 'vitest';
import { coincidePeriodo, rangoSemana } from './fechas';

const hoy = new Date(2026, 9, 10); // sábado 10/oct/2026

describe('periodos', () => {
  it('semana de lunes a domingo', () => {
    expect(rangoSemana(hoy)).toEqual({ desde: '2026-10-05', hasta: '2026-10-11' });
  });
  it('filtra por día, semana y mes', () => {
    expect(coincidePeriodo('2026-10-10', 'dia', hoy)).toBe(true);
    expect(coincidePeriodo('2026-10-11', 'dia', hoy)).toBe(false);
    expect(coincidePeriodo('2026-10-05', 'semana', hoy)).toBe(true);
    expect(coincidePeriodo('2026-10-12', 'semana', hoy)).toBe(false);
    expect(coincidePeriodo('2026-10-31', 'mes', hoy)).toBe(true);
    expect(coincidePeriodo('2026-11-01', 'mes', hoy)).toBe(false);
    expect(coincidePeriodo('', 'mes', hoy)).toBe(false);
    expect(coincidePeriodo('', 'todos', hoy)).toBe(true);
  });
});
