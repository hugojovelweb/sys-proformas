import { useEffect, useRef } from 'react';

interface Props {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmDialog({ titulo, mensaje, textoConfirmar, onConfirmar, onCancelar }: Props) {
  const botonCancelar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    botonCancelar.current?.focus();
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && onCancelar();
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [onCancelar]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancelar}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-mensaje"
        className="animar w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-titulo" className="text-lg font-semibold">{titulo}</h2>
        <p id="confirm-mensaje" className="mt-2 text-sm text-slate-600">{mensaje}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button ref={botonCancelar} type="button" className="btn-sec" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="btn-peligro" onClick={onConfirmar}>{textoConfirmar}</button>
        </div>
      </div>
    </div>
  );
}
