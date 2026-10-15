/**
 * Helpers de presentación de un viaje.
 *
 * Los títulos que carga el panel siguen siempre la misma forma:
 *   "<Lugar> — <Detalle> · <Cuándo>"   (el detalle es opcional)
 * Para la tarjeta necesitamos las tres partes por separado: el lugar va
 * grande, el detalle chico y el cuándo al lado del precio.
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export interface PartesTitulo {
  titular: string;
  subtitulo: string;
  cuando: string;
}

export function partesTitulo(titulo: string): PartesTitulo {
  const [lugarYDetalle = '', ...resto] = titulo.split(' · ');
  const cuando = resto.join(' · ').trim();

  const guion = lugarYDetalle.indexOf(' — ');
  let titular = lugarYDetalle.trim();
  let subtitulo = '';

  if (guion !== -1) {
    titular = lugarYDetalle.slice(0, guion).trim();
    subtitulo = lugarYDetalle.slice(guion + 3).trim();
  }

  // "Full Day" ya lo dice el sello de duración: no lo repetimos abajo del título
  if (/^full\s*day$/i.test(subtitulo)) subtitulo = '';

  return { titular, subtitulo, cuando };
}

export function duracionLabel(p: { tipo?: string; duracionDias: number; duracionNoches: number }): string {
  if (p.tipo === 'full_day' || (p.duracionDias <= 1 && !p.duracionNoches)) return 'Full day';
  const dias = `${p.duracionDias} ${p.duracionDias === 1 ? 'día' : 'días'}`;
  if (!p.duracionNoches) return dias;
  return `${dias} · ${p.duracionNoches} ${p.duracionNoches === 1 ? 'noche' : 'noches'}`;
}

/** "2026-11-26" → "26 de noviembre" */
export function fechaLarga(iso: string): string {
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a || !m || !d) return '';
  return `${d} de ${MESES[m - 1]}`;
}

/** "2026-11-26" → "26 nov" */
export function fechaCorta(iso: string): string {
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a || !m || !d) return '';
  return `${d} ${MESES[m - 1].slice(0, 3)}`;
}

/** Cómo viaja el grupo, leído de lo que incluye el paquete. */
export function transporte(incluye: string[] = []): string | null {
  const texto = incluye.join(' ').toLowerCase();
  if (texto.includes('bus') || texto.includes('micro') || texto.includes('combi')) return 'Bus';
  if (texto.includes('aéreo') || texto.includes('aereo') || texto.includes('vuelo')) return 'Avión';
  return null;
}

/** Días que faltan para la salida (negativo si ya pasó). */
export function diasHasta(iso: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a || !m || !d) return 0;
  const salida = new Date(a, m - 1, d);
  return Math.round((salida.getTime() - hoy.getTime()) / 86400000);
}
