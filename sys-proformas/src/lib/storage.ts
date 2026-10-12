import type { Proforma } from '../types';

export const CLAVE_STORAGE = 'gestor-proformas:v1';

function esProforma(x: unknown): x is Proforma {
  if (typeof x !== 'object' || x === null) return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.titulo === 'string' &&
    typeof p.completada === 'boolean' &&
    Array.isArray(p.items) &&
    typeof p.exportador === 'object' && p.exportador !== null &&
    typeof p.importador === 'object' && p.importador !== null
  );
}

/** Carga las tareas guardadas; si los datos faltan o están corruptos devuelve []. */
export function cargarProformas(): Proforma[] {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return [];
    const datos: unknown = JSON.parse(crudo);
    return Array.isArray(datos) ? datos.filter(esProforma) : [];
  } catch {
    return [];
  }
}

/** Devuelve false si no se pudo guardar (cuota llena, modo privado, etc.). */
export function guardarProformas(lista: Proforma[]): boolean {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
    return true;
  } catch {
    return false;
  }
}
