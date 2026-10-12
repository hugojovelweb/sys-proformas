import { useCallback, useEffect, useState } from 'react';
import type { Proforma, ProformaBorrador } from '../types';
import { cargarProformas, guardarProformas } from '../lib/storage';
import { nuevoId } from '../lib/id';

export function useProformas() {
  const [lista, setLista] = useState<Proforma[]>(() => cargarProformas());
  const [errorGuardado, setErrorGuardado] = useState(false);

  useEffect(() => {
    setErrorGuardado(!guardarProformas(lista));
  }, [lista]);

  const agregar = useCallback((b: ProformaBorrador) => {
    const ahora = new Date().toISOString();
    setLista((prev) => [{ ...b, id: nuevoId(), completada: false, creada: ahora, actualizada: ahora }, ...prev]);
  }, []);

  const actualizar = useCallback((id: string, b: ProformaBorrador) => {
    setLista((prev) => prev.map((p) => (p.id === id ? { ...p, ...b, actualizada: new Date().toISOString() } : p)));
  }, []);

  const eliminar = useCallback((id: string) => setLista((prev) => prev.filter((p) => p.id !== id)), []);

  const alternarCompletada = useCallback((id: string) => {
    setLista((prev) => prev.map((p) => (p.id === id ? { ...p, completada: !p.completada, actualizada: new Date().toISOString() } : p)));
  }, []);

  return { lista, errorGuardado, agregar, actualizar, eliminar, alternarCompletada };
}
