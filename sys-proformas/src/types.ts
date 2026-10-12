export type Prioridad = 'alta' | 'media' | 'baja';
export type FiltroEstado = 'todas' | 'completadas' | 'pendientes';
export type FiltroPrioridad = 'todas' | Prioridad;
export type FiltroPeriodo = 'todos' | 'dia' | 'semana' | 'mes';

export interface LineaItem {
  id: string;
  cantidad: number;
  descripcion: string;
  unidad: string;
  precioUnitario: number;
}

export interface Parte {
  nombre: string;
  nombreComercial: string;
  nit: string;
  nrc: string;
  actividad: string;
  correo: string;
  telefono: string;
  direccion: string;
  pais: string;
  otro: string;
}

/** Una tarea del sistema: contiene los datos de la tarea y los de la proforma de exportación. */
export interface Proforma {
  id: string;
  // Datos de la tarea
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  completada: boolean;
  fechaLimite: string; // YYYY-MM-DD, vacío si no tiene
  creada: string; // ISO
  actualizada: string; // ISO
  // Datos de la proforma
  numeroControl: string;
  moneda: string;
  tipoItem: string;
  recintoFiscal: string;
  regimen: string;
  paisDestino: string;
  incoterm: string;
  condicionPago: string;
  exportador: Parte;
  importador: Parte;
  items: LineaItem[];
}

export type ProformaBorrador = Omit<Proforma, 'id' | 'creada' | 'actualizada' | 'completada'>;
