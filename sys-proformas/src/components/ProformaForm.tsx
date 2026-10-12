import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Parte, Prioridad, ProformaBorrador } from '../types';
import { formatoMonto, totalItems, totalLinea } from '../lib/calculos';
import { CONDICIONES_PAGO, INCOTERMS, MONEDAS, TIPOS_ITEM, UNIDADES } from '../lib/defaults';
import { nuevoId } from '../lib/id';

interface Props {
  titulo: string;
  inicial: ProformaBorrador;
  onGuardar: (b: ProformaBorrador) => void;
  onCancelar: () => void;
}

type Errores = Record<string, string>;

const ETIQUETAS: Record<keyof Parte, string> = {
  nombre: 'Nombre', nombreComercial: 'Nombre comercial', nit: 'NIT', nrc: 'NRC', actividad: 'Actividad',
  correo: 'Correo', telefono: 'Teléfono', direccion: 'Dirección', pais: 'País', otro: 'Otro',
};
const CAMPOS_EXPORTADOR: (keyof Parte)[] = ['nombre', 'nit', 'nrc', 'actividad', 'correo', 'telefono', 'direccion'];
const CAMPOS_IMPORTADOR: (keyof Parte)[] = ['nombre', 'nombreComercial', 'otro', 'pais', 'direccion', 'telefono', 'correo', 'actividad'];

function validar(b: ProformaBorrador): Errores {
  const e: Errores = {};
  if (!b.titulo.trim()) e.titulo = 'El nombre de la tarea es obligatorio.';
  if (!b.numeroControl.trim()) e.numeroControl = 'El N° de control es obligatorio.';
  if (!b.paisDestino.trim()) e.paisDestino = 'Indica el país destino.';
  if (!b.exportador.nombre.trim()) e.exportador = 'El nombre del exportador es obligatorio.';
  if (!b.importador.nombre.trim()) e.importador = 'El nombre del importador es obligatorio.';
  if (b.items.length === 0) e.items = 'Agrega al menos un ítem.';
  else if (b.items.some((l) => !l.descripcion.trim() || !(l.cantidad > 0) || !(l.precioUnitario >= 0))) {
    e.items = 'Cada ítem necesita descripción, cantidad mayor a 0 y precio válido.';
  }
  return e;
}

function Campo({ id, etiqueta, error, children }: { id: string; etiqueta: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta">{etiqueta}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CamposParte({ prefijo, campos, valor, error, onCambiar }: {
  prefijo: string; campos: (keyof Parte)[]; valor: Parte; error?: string; onCambiar: (p: Parte) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {campos.map((c) => (
        <div key={c} className={c === 'direccion' ? 'sm:col-span-2' : ''}>
          <Campo id={`${prefijo}-${c}`} etiqueta={ETIQUETAS[c]} error={c === 'nombre' ? error : undefined}>
            <input
              id={`${prefijo}-${c}`}
              className={`campo ${c === 'nombre' && error ? 'campo-error' : ''}`}
              value={valor[c]}
              onChange={(e) => onCambiar({ ...valor, [c]: e.target.value })}
            />
          </Campo>
        </div>
      ))}
    </div>
  );
}

export default function ProformaForm({ titulo, inicial, onGuardar, onCancelar }: Props) {
  const [b, setB] = useState<ProformaBorrador>(inicial);
  const [errores, setErrores] = useState<Errores>({});

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && onCancelar();
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [onCancelar]);

  const set = <K extends keyof ProformaBorrador>(k: K, v: ProformaBorrador[K]) => setB((prev) => ({ ...prev, [k]: v }));
  const setItem = (id: string, cambios: Partial<ProformaBorrador['items'][number]>) =>
    set('items', b.items.map((l) => (l.id === id ? { ...l, ...cambios } : l)));

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const err = validar(b);
    setErrores(err);
    if (Object.keys(err).length === 0) {
      onGuardar({ ...b, titulo: b.titulo.trim(), descripcion: b.descripcion.trim() });
    }
  };

  const seccion = 'rounded-lg border border-slate-200 p-4';
  const tituloSeccion = 'mb-3 text-sm font-bold uppercase tracking-wide text-brand-700';

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-6" onClick={onCancelar}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-titulo"
        noValidate
        onSubmit={guardar}
        onClick={(e) => e.stopPropagation()}
        className="animar w-full max-w-3xl space-y-4 rounded-xl bg-white p-4 shadow-xl sm:p-6"
      >
        <h2 id="form-titulo" className="text-xl font-bold">{titulo}</h2>

        <fieldset className={seccion}>
          <legend className={tituloSeccion}>Tarea</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Campo id="titulo" etiqueta="Nombre" error={errores.titulo}>
                <input id="titulo" autoFocus className={`campo ${errores.titulo ? 'campo-error' : ''}`} value={b.titulo} onChange={(e) => set('titulo', e.target.value)} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Campo id="descripcion" etiqueta="Descripción">
                <textarea id="descripcion" rows={2} className="campo" value={b.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
              </Campo>
            </div>
            <Campo id="prioridad" etiqueta="Prioridad">
              <select id="prioridad" className="campo" value={b.prioridad} onChange={(e) => set('prioridad', e.target.value as Prioridad)}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </Campo>
            <Campo id="fechaLimite" etiqueta="Fecha límite">
              <input id="fechaLimite" type="date" className="campo" value={b.fechaLimite} onChange={(e) => set('fechaLimite', e.target.value)} />
            </Campo>
          </div>
        </fieldset>

        <fieldset className={seccion}>
          <legend className={tituloSeccion}>Datos de exportación</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo id="numeroControl" etiqueta="N° de control" error={errores.numeroControl}>
              <input id="numeroControl" className={`campo ${errores.numeroControl ? 'campo-error' : ''}`} value={b.numeroControl} onChange={(e) => set('numeroControl', e.target.value)} />
            </Campo>
            <Campo id="moneda" etiqueta="Moneda">
              <select id="moneda" className="campo" value={b.moneda} onChange={(e) => set('moneda', e.target.value)}>
                {MONEDAS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Campo>
            <Campo id="tipoItem" etiqueta="Tipo ítem exportación">
              <select id="tipoItem" className="campo" value={b.tipoItem} onChange={(e) => set('tipoItem', e.target.value)}>
                {TIPOS_ITEM.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Campo>
            <Campo id="recintoFiscal" etiqueta="Recinto fiscal (CAT-027)">
              <input id="recintoFiscal" className="campo" value={b.recintoFiscal} onChange={(e) => set('recintoFiscal', e.target.value)} />
            </Campo>
            <Campo id="regimen" etiqueta="Régimen (CAT-028)">
              <input id="regimen" className="campo" value={b.regimen} onChange={(e) => set('regimen', e.target.value)} />
            </Campo>
            <Campo id="paisDestino" etiqueta="País destino" error={errores.paisDestino}>
              <input id="paisDestino" className={`campo ${errores.paisDestino ? 'campo-error' : ''}`} value={b.paisDestino} onChange={(e) => set('paisDestino', e.target.value)} />
            </Campo>
            <Campo id="incoterm" etiqueta="Incoterm (CAT-031)">
              <select id="incoterm" className="campo" value={b.incoterm} onChange={(e) => set('incoterm', e.target.value)}>
                {INCOTERMS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Campo>
            <Campo id="condicionPago" etiqueta="Condición de pago">
              <select id="condicionPago" className="campo" value={b.condicionPago} onChange={(e) => set('condicionPago', e.target.value)}>
                {CONDICIONES_PAGO.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Campo>
          </div>
        </fieldset>

        <fieldset className={seccion}>
          <legend className={tituloSeccion}>Exportador</legend>
          <CamposParte prefijo="exp" campos={CAMPOS_EXPORTADOR} valor={b.exportador} error={errores.exportador} onCambiar={(p) => set('exportador', p)} />
        </fieldset>

        <fieldset className={seccion}>
          <legend className={tituloSeccion}>Importador</legend>
          <CamposParte prefijo="imp" campos={CAMPOS_IMPORTADOR} valor={b.importador} error={errores.importador} onCambiar={(p) => set('importador', p)} />
        </fieldset>

        <fieldset className={seccion}>
          <legend className={tituloSeccion}>Detalles de exportación</legend>
          <div className="space-y-3">
            {b.items.map((l, i) => (
              <div key={l.id} className="grid grid-cols-2 gap-2 rounded-md bg-slate-50 p-3 sm:grid-cols-12">
                <div className="col-span-2 sm:col-span-5">
                  <label htmlFor={`desc-${l.id}`} className="etiqueta">Descripción {i + 1}</label>
                  <input id={`desc-${l.id}`} className="campo" value={l.descripcion} onChange={(e) => setItem(l.id, { descripcion: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`cant-${l.id}`} className="etiqueta">Cant.</label>
                  <input id={`cant-${l.id}`} type="number" min="0" step="any" className="campo" value={l.cantidad} onChange={(e) => setItem(l.id, { cantidad: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`uni-${l.id}`} className="etiqueta">Unidad</label>
                  <select id={`uni-${l.id}`} className="campo" value={l.unidad} onChange={(e) => setItem(l.id, { unidad: e.target.value })}>
                    {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`prec-${l.id}`} className="etiqueta">Precio unit.</label>
                  <input id={`prec-${l.id}`} type="number" min="0" step="0.01" className="campo" value={l.precioUnitario} onChange={(e) => setItem(l.id, { precioUnitario: Number(e.target.value) })} />
                </div>
                <div className="flex items-end justify-between gap-2 sm:col-span-1">
                  <span className="text-xs font-semibold text-slate-600">{formatoMonto(totalLinea(l))}</span>
                  <button type="button" className="btn-sec px-2 py-1 text-red-600" aria-label={`Quitar ítem ${i + 1}`} onClick={() => set('items', b.items.filter((x) => x.id !== l.id))}>✕</button>
                </div>
              </div>
            ))}
          </div>
          {errores.items && <p role="alert" className="mt-2 text-xs text-red-600">{errores.items}</p>}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              className="btn-sec"
              onClick={() => set('items', [...b.items, { id: nuevoId(), cantidad: 1, descripcion: '', unidad: 'Unidad', precioUnitario: 0 }])}
            >
              + Agregar ítem
            </button>
            <p className="text-sm font-bold">Total: {formatoMonto(totalItems(b.items))} {b.moneda}</p>
          </div>
        </fieldset>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-sec" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn-primario">Guardar</button>
        </div>
      </form>
    </div>
  );
}
