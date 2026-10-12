import type { Parte, ProformaBorrador } from '../types';
import { nuevoId } from './id';

export const MONEDAS = ['USD'];
export const UNIDADES = ['Unidad', 'Kilogramo', 'Libra', 'Caja', 'Docena', 'Metro', 'Litro'];
export const CONDICIONES_PAGO = ['Contado', 'Crédito'];
export const TIPOS_ITEM = ['Bienes', 'Servicios', 'Bienes y Servicios'];
export const INCOTERMS = [
  '01 - EXW- EN FABRICA', '02 - FCA- LIBRE TRANSPORTISTA', '03 - CPT- TRANSPORTE PAGADO HASTA',
  '04 - CIP- TRANSPORTE Y SEGURO PAGADO HASTA', '05 - DAP- ENTREGADA EN LUGAR', '06 - DPU- ENTREGADA Y DESCARGADA',
  '07 - DDP- ENTREGADA DERECHOS PAGADOS', '08 - FAS- LIBRE AL COSTADO DEL BUQUE', '09 - FOB- LIBRE ABORDO',
  '10 - CFR- COSTO Y FLETE', '11 - CIF- COSTO, SEGURO Y FLETE',
];

export const parteVacia = (): Parte => ({
  nombre: '', nombreComercial: '', nit: '', nrc: '', actividad: '', correo: '',
  telefono: '', direccion: '', pais: '', otro: '',
});

/** Datos del exportador tomados de la proforma de ejemplo del anexo. Editables en cada proforma. */
export const exportadorPorDefecto = (): Parte => ({
  ...parteVacia(),
  nombre: 'Granja La Unica',
  nit: '056462721',
  nrc: '3497202',
  actividad: 'Cría de iguanas y garrobos',
  correo: 'victorreyesrivera2021@gmail.com',
  telefono: '64493708',
  direccion:
    'Calle Principal, Cton. El Pedregal Lotif. Las Brisas, Distrito de El Rosario La Paz Centro, Departamento de La Paz, La Paz Centro, La Paz',
});

export const borradorVacio = (numeroControl: string): ProformaBorrador => ({
  titulo: '', descripcion: '', prioridad: 'media', fechaLimite: '',
  numeroControl, moneda: 'USD', tipoItem: 'Bienes', recintoFiscal: '', regimen: '',
  paisDestino: '', incoterm: INCOTERMS[8], condicionPago: 'Contado',
  exportador: exportadorPorDefecto(), importador: parteVacia(),
  items: [{ id: nuevoId(), cantidad: 1, descripcion: '', unidad: 'Unidad', precioUnitario: 0 }],
});

/** Reproduce la proforma del anexo para validar el formato del PDF. */
export const borradorEjemplo = (numeroControl: string): ProformaBorrador => ({
  ...borradorVacio(numeroControl),
  titulo: 'Proforma exportación Taiwán - Tortugas de candado',
  descripcion: 'Proforma de ejemplo basada en el anexo de la tarea.',
  prioridad: 'alta',
  recintoFiscal: 'Aérea De Comalapa',
  regimen: 'Exportación Definitiva, Exportación Definitiva, Régimen Común',
  paisDestino: 'Taiwan, Provincia de China (TW)',
  importador: {
    ...parteVacia(),
    nombre: 'QIN JIN TRADING CO., LTD.',
    nombreComercial: 'QIN JIN TRADING CO., LTD.',
    otro: '00',
    pais: 'Taiwan, Provincia de China (TW)',
    direccion: '3 F., No. 14, Ln 103, Fuxiang St., Tucheng Dist., New Taipei City 236029, Taiwan (R.O.C.)',
    telefono: '77866505',
    correo: 'victorreyesrivera2021@gmail.com',
    actividad: 'IMPORTADOR-EXPORTADOR',
  },
  items: [
    { id: nuevoId(), cantidad: 1000, descripcion: 'TORTUGAS DE CANDADO (KINOSTERNON SCORPIOIDES)', unidad: 'Unidad', precioUnitario: 15 },
  ],
});

export const siguienteNumeroControl = (existentes: string[]): string => {
  const max = existentes.reduce((m, n) => Math.max(m, Number.parseInt(n, 10) || 0), 0);
  return String(max + 1).padStart(10, '0');
};
