import type { FiltroPeriodo } from '../types';

const dos = (n: number) => String(n).padStart(2, '0');

/** Fecha local en formato YYYY-MM-DD (evita desfases por zona horaria). */
export function aTexto(d: Date): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** Semana de lunes a domingo que contiene la fecha dada. */
export function rangoSemana(hoy: Date): { desde: string; hasta: string } {
  const diaSemana = (hoy.getDay() + 6) % 7; // lunes = 0
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - diaSemana);
  const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
  return { desde: aTexto(lunes), hasta: aTexto(domingo) };
}

export function coincidePeriodo(fechaLimite: string, periodo: FiltroPeriodo, hoy: Date = new Date()): boolean {
  if (periodo === 'todos') return true;
  if (!fechaLimite) return false;
  if (periodo === 'dia') return fechaLimite === aTexto(hoy);
  if (periodo === 'mes') return fechaLimite.slice(0, 7) === aTexto(hoy).slice(0, 7);
  const { desde, hasta } = rangoSemana(hoy);
  return fechaLimite >= desde && fechaLimite <= hasta;
}

export function formatoFecha(fechaLimite: string): string {
  if (!fechaLimite) return 'Sin fecha';
  const [a, m, d] = fechaLimite.split('-');
  return `${d}/${m}/${a}`;
}
