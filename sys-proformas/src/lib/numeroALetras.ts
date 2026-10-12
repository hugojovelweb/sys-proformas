const UNIDADES = [
  'CERO', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ',
  'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
  'VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS',
  'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE',
];
const DECENAS = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
];

export const MAXIMO_ENTERO = 999_999_999;

/** Convierte 1..999 a palabras. */
function menorQueMil(n: number): string {
  if (n === 100) return 'CIEN';
  const centena = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (centena > 0) partes.push(CENTENAS[centena]);
  if (resto > 0) {
    if (resto < 30) {
      partes.push(UNIDADES[resto]);
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u > 0 ? `${DECENAS[d]} Y ${UNIDADES[u]}` : DECENAS[d]);
    }
  }
  return partes.join(' ');
}

/** "UNO" -> "UN" y "VEINTIUNO" -> "VEINTIÚN" cuando precede a MIL o MILLONES. */
function apocopar(texto: string): string {
  return texto.replace(/VEINTIUNO$/, 'VEINTIÚN').replace(/UNO$/, 'UN');
}

export function enteroALetras(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > MAXIMO_ENTERO) return 'NÚMERO FUERA DE RANGO';
  if (n === 0) return 'CERO';
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (millones > 0) partes.push(millones === 1 ? 'UN MILLÓN' : `${apocopar(menorQueMil(millones))} MILLONES`);
  if (miles > 0) partes.push(miles === 1 ? 'MIL' : `${apocopar(menorQueMil(miles))} MIL`);
  if (resto > 0) partes.push(menorQueMil(resto));
  return partes.join(' ');
}

/** Ej.: 15000 -> "QUINCE MIL CON 00/100 DÓLARES". */
export function montoALetras(monto: number, moneda = 'USD'): string {
  if (!Number.isFinite(monto) || monto < 0) return 'NÚMERO FUERA DE RANGO';
  const centavosTotales = Math.round(monto * 100);
  const entero = Math.floor(centavosTotales / 100);
  const centavos = String(centavosTotales % 100).padStart(2, '0');
  const letras = enteroALetras(entero);
  if (letras === 'NÚMERO FUERA DE RANGO') return letras;
  const nombreMoneda = moneda === 'USD' ? 'DÓLARES' : moneda;
  return `${letras} CON ${centavos}/100 ${nombreMoneda}`;
}
