import { useCallback, useEffect, useMemo, useState } from "react";
import type { Proforma, ProformaBorrador } from "./types";
import { useProformas } from "./hooks/useProformas";
import {
  borradorEjemplo,
  borradorVacio,
  siguienteNumeroControl,
} from "./lib/defaults";
import { coincidePeriodo } from "./lib/fechas";
import { descargarProformaPdf } from "./lib/pdf";
import ConfirmDialog from "./components/ConfirmDialog";
import Filters, { type ValoresFiltro } from "./components/Filters";
import ProformaCard from "./components/ProformaCard";
import ProformaForm from "./components/ProformaForm";

const FILTROS_INICIALES: ValoresFiltro = {
  busqueda: "",
  estado: "todas",
  prioridad: "todas",
  periodo: "todos",
};

type Formulario =
  | { modo: "nueva"; inicial: ProformaBorrador }
  | { modo: "editar"; id: string; inicial: ProformaBorrador };

const aBorrador = ({
  id: _id,
  creada: _c,
  actualizada: _a,
  completada: _co,
  ...resto
}: Proforma): ProformaBorrador => resto;

export default function App() {
  const {
    lista,
    errorGuardado,
    agregar,
    actualizar,
    eliminar,
    alternarCompletada,
  } = useProformas();
  const [filtros, setFiltros] = useState<ValoresFiltro>(FILTROS_INICIALES);
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [porEliminar, setPorEliminar] = useState<Proforma | null>(null);
  const [generandoId, setGenerandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(""), 3500);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const numeroSiguiente = () =>
    siguienteNumeroControl(lista.map((p) => p.numeroControl));

  const visibles = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase();
    return lista.filter(
      (p) =>
        (!texto || p.titulo.toLowerCase().includes(texto)) &&
        (filtros.estado === "todas" ||
          (filtros.estado === "completadas") === p.completada) &&
        (filtros.prioridad === "todas" || p.prioridad === filtros.prioridad) &&
        coincidePeriodo(p.fechaLimite, filtros.periodo),
    );
  }, [lista, filtros]);

  const pendientes = lista.filter((p) => !p.completada).length;

  const guardar = (b: ProformaBorrador) => {
    if (!formulario) return;
    if (formulario.modo === "nueva") {
      agregar(b);
      setAviso("Proforma creada.");
    } else {
      actualizar(formulario.id, b);
      setAviso("Proforma actualizada.");
    }
    setFormulario(null);
  };

  const confirmarEliminar = () => {
    if (!porEliminar) return;
    eliminar(porEliminar.id);
    setPorEliminar(null);
    setAviso("Proforma eliminada.");
  };

  const descargarPdf = async (p: Proforma) => {
    setGenerandoId(p.id);
    try {
      await descargarProformaPdf(p);
      setAviso("PDF generado.");
    } catch {
      setAviso(
        "No se pudo generar el PDF. Revisa los datos e inténtalo de nuevo.",
      );
    } finally {
      setGenerandoId(null);
    }
  };

  const cancelarFormulario = useCallback(() => setFormulario(null), []);
  const cancelarEliminar = useCallback(() => setPorEliminar(null), []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-700 bg-brand-900 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-4">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Logo"
            className="h-12 w-12 rounded-md bg-white object-contain p-1"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold leading-tight">
              Gestor de Proformas
            </h1>
            <p className="text-xs text-brand-100">
              {pendientes} pendientes · {lista.length - pendientes} completadas
              · {lista.length} en total
            </p>
          </div>
          <button
            type="button"
            className="btn bg-white text-brand-900 hover:bg-brand-50"
            onClick={() =>
              setFormulario({
                modo: "nueva",
                inicial: borradorVacio(numeroSiguiente()),
              })
            }
          >
            + Nueva proforma
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        {errorGuardado && (
          <p
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
          >
            No se pudo guardar en este navegador (almacenamiento lleno o
            bloqueado). Los cambios se perderán al cerrar la página.
          </p>
        )}

        <Filters valores={filtros} onCambiar={setFiltros} />

        {lista.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">Aún no hay proformas</h2>
            <p className="mt-1 text-sm text-slate-600">
              Crea la primera o carga la proforma de ejemplo del anexo para ver
              el PDF.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="btn-primario"
                onClick={() =>
                  setFormulario({
                    modo: "nueva",
                    inicial: borradorVacio(numeroSiguiente()),
                  })
                }
              >
                Crear proforma
              </button>
              <button
                type="button"
                className="btn-sec"
                onClick={() => {
                  agregar(borradorEjemplo(numeroSiguiente()));
                  setAviso("Ejemplo cargado.");
                }}
              >
                Cargar ejemplo
              </button>
            </div>
          </div>
        ) : visibles.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            Ninguna proforma coincide con los filtros.{" "}
            <button
              type="button"
              className="font-medium text-brand-700 underline"
              onClick={() => setFiltros(FILTROS_INICIALES)}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Lista de proformas">
            {visibles.map((p) => (
              <ProformaCard
                key={p.id}
                proforma={p}
                generandoPdf={generandoId === p.id}
                onAlternar={() => alternarCompletada(p.id)}
                onEditar={() =>
                  setFormulario({
                    modo: "editar",
                    id: p.id,
                    inicial: aBorrador(p),
                  })
                }
                onEliminar={() => setPorEliminar(p)}
                onPdf={() => void descargarPdf(p)}
              />
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-600">
        <strong>
          © {new Date().getFullYear()} by Hugo Jovel Web. Derechos reservados.
        </strong>
      </footer>

      {formulario && (
        <ProformaForm
          titulo={
            formulario.modo === "nueva" ? "Nueva proforma" : "Editar proforma"
          }
          inicial={formulario.inicial}
          onGuardar={guardar}
          onCancelar={cancelarFormulario}
        />
      )}
      {porEliminar && (
        <ConfirmDialog
          titulo="Eliminar proforma"
          mensaje={`¿Seguro que quieres eliminar "${porEliminar.titulo}"? Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
        />
      )}
      {aviso && (
        <div
          role="status"
          className="animar fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"
        >
          {aviso}
        </div>
      )}
    </div>
  );
}
