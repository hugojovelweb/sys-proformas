/** crypto.randomUUID solo existe en contextos seguros (https o localhost); se deja un respaldo para http por red local. */
export function nuevoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
