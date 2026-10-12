import type { Prioridad, Proforma } from '../types';
import { formatoMonto, totalItems } from '../lib/calculos';
import { formatoFecha } from '../lib/fechas';

interface Props {
  proforma: Proforma;
  generandoPdf: boolean;
  onAlternar: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onPdf: () => void;
}

const ESTILO_PRIORIDAD: Record<Prioridad, string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-800',
  baja: 'bg-sky-100 text-sky-700',
};

export default function ProformaCard({ proforma: p, generandoPdf, onAlternar, onEditar, onEliminar, onPdf }: Props) {
  return (
    <li className="animar flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start">
      <input
        type="checkbox"
        checked={p.completada}
        onChange={onAlternar}
        aria-label={`Marcar "${p.titulo}" como ${p.completada ? 'pendiente' : 'completada'}`}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-brand-600"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-base font-semibold ${p.completada ? 'text-slate-400 line-through' : ''}`}>{p.titulo}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ESTILO_PRIORIDAD[p.prioridad]}`}>{p.prioridad}</span>
          {p.completada && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Completada</span>}
        </div>
        {p.descripcion && <p className="mt-1 text-sm text-slate-600">{p.descripcion}</p>}
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
          <div><dt className="font-semibold">N° control</dt><dd>{p.numeroControl}</dd></div>
          <div><dt className="font-semibold">Importador</dt><dd className="truncate">{p.importador.nombre || '—'}</dd></div>
          <div><dt className="font-semibold">Fecha límite</dt><dd>{formatoFecha(p.fechaLimite)}</dd></div>
          <div><dt className="font-semibold">Total</dt><dd className="font-semibold text-slate-700">{formatoMonto(totalItems(p.items))} {p.moneda}</dd></div>
        </dl>
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-col">
        <button type="button" className="btn-primario" onClick={onPdf} disabled={generandoPdf}>
          {generandoPdf ? 'Generando…' : 'Descargar PDF'}
        </button>
        <button type="button" className="btn-sec" onClick={onEditar}>Editar</button>
        <button type="button" className="btn-sec text-red-600 hover:bg-red-50" onClick={onEliminar}>Eliminar</button>
      </div>
    </li>
  );
}
