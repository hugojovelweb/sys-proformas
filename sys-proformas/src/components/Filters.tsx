import type { FiltroEstado, FiltroPeriodo, FiltroPrioridad } from '../types';

export interface ValoresFiltro {
  busqueda: string;
  estado: FiltroEstado;
  prioridad: FiltroPrioridad;
  periodo: FiltroPeriodo;
}

interface Props {
  valores: ValoresFiltro;
  onCambiar: (v: ValoresFiltro) => void;
}

const ESTADOS: { valor: FiltroEstado; texto: string }[] = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'pendientes', texto: 'Pendientes' },
  { valor: 'completadas', texto: 'Completadas' },
];

export default function Filters({ valores, onCambiar }: Props) {
  const cambiar = <K extends keyof ValoresFiltro>(k: K, v: ValoresFiltro[K]) => onCambiar({ ...valores, [k]: v });

  return (
    <section aria-label="Filtros y búsqueda" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <label htmlFor="busqueda" className="etiqueta">Buscar por título</label>
          <input
            id="busqueda"
            type="search"
            className="campo"
            placeholder="Ej.: Taiwán"
            value={valores.busqueda}
            onChange={(e) => cambiar('busqueda', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filtro-prioridad" className="etiqueta">Prioridad</label>
          <select id="filtro-prioridad" className="campo" value={valores.prioridad} onChange={(e) => cambiar('prioridad', e.target.value as FiltroPrioridad)}>
            <option value="todas">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div>
          <label htmlFor="filtro-periodo" className="etiqueta">Fecha límite</label>
          <select id="filtro-periodo" className="campo" value={valores.periodo} onChange={(e) => cambiar('periodo', e.target.value as FiltroPeriodo)}>
            <option value="todos">Todas</option>
            <option value="dia">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {ESTADOS.map((e) => (
          <button
            key={e.valor}
            type="button"
            aria-pressed={valores.estado === e.valor}
            onClick={() => cambiar('estado', e.valor)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              valores.estado === e.valor ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {e.texto}
          </button>
        ))}
      </div>
    </section>
  );
}
