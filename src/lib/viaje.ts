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
  // El cuándo va SIEMPRE al final, después del último " · ".
  // Partimos por el último separador, no por el primero: hay títulos que
  // usan el punto medio también en el detalle ("Florianópolis · Hotel X · 29 de noviembre").
  const corte = titulo.lastIndexOf(' · ');
  const lugarYDetalle = corte === -1 ? titulo : titulo.slice(0, corte);
  const cuando = corte === -1 ? '' : titulo.slice(corte + 3).trim();

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

/* ── Agrupado del listado ───────────────────────────────────────────────
   Los viajes "por mes" se agrupan solos por la fecha de salida; recitales,
   fin de año y verano 27 tienen bloque propio porque no son un mes.       */

export type Categoria = 'mes' | 'recital' | 'fin_de_ano' | 'verano27';

export interface Grupo<T> {
  clave: string;
  titulo: string;
  /** 'micro' | 'copa' | 'sol' | null — lo dibuja el componente */
  icono: 'micro' | 'copa' | 'sol' | null;
  orden: number;
  viajes: T[];
}

// Los meses ordenan por año*100+mes (ej. 202610), así que los bloques
// especiales van con números más altos para quedar siempre al final.
const ESPECIALES: Record<Exclude<Categoria, 'mes'>, { titulo: string; icono: Grupo<unknown>['icono']; orden: number }> = {
  recital:    { titulo: 'Recitales',   icono: 'micro', orden: 900_001 },
  fin_de_ano: { titulo: 'Fin de año',  icono: 'copa',  orden: 900_002 },
  verano27:   { titulo: 'Verano 2027', icono: 'sol',   orden: 900_003 },
};

/** Agrupa los viajes en bloques listos para renderizar, ya ordenados. */
export function agruparViajes<T extends { proximaSalida: string; categoria?: string }>(viajes: T[]): Grupo<T>[] {
  const grupos = new Map<string, Grupo<T>>();

  for (const v of viajes) {
    const cat = (v.categoria ?? 'mes') as Categoria;

    let clave: string, titulo: string, icono: Grupo<T>['icono'], orden: number;

    if (cat !== 'mes' && ESPECIALES[cat]) {
      ({ titulo, icono, orden } = ESPECIALES[cat]);
      clave = cat;
    } else {
      const [a, m] = String(v.proximaSalida).split('-').map(Number);
      const mes = MESES[(m || 1) - 1];
      clave = `${a}-${String(m).padStart(2, '0')}`;
      // "Octubre" si es de este año, "Enero 2027" si es de otro
      titulo = mes.charAt(0).toUpperCase() + mes.slice(1);
      const esteAnio = new Date().getFullYear();
      if (a !== esteAnio) titulo += ` ${a}`;
      icono = null;
      orden = a * 100 + (m || 0);
    }

    if (!grupos.has(clave)) grupos.set(clave, { clave, titulo, icono, orden, viajes: [] });
    grupos.get(clave)!.viajes.push(v);
  }

  for (const g of grupos.values()) {
    g.viajes.sort((a, b) => String(a.proximaSalida).localeCompare(String(b.proximaSalida)));
  }

  return [...grupos.values()].sort((a, b) => a.orden - b.orden);
}

/**
 * "Sale el 25 de octubre" pero "Sale en enero y febrero de 2027".
 * Si el texto arranca con un número es una fecha puntual; si arranca con el
 * nombre de un mes es un período.
 */
export function frasecuando(cuando: string): string {
  if (!cuando) return '';
  return /^\d/.test(cuando.trim()) ? `Sale el ${cuando}` : `Sale en ${cuando}`;
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
