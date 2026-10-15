/**
 * Genera sql/02-seed.sql a partir de src/data/paquetes.json
 * Uso: node scripts/generar-seed.mjs
 * Sirve para la carga inicial y para regenerar el seed si hace falta.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(raiz, 'src/data/paquetes.json'), 'utf8'));

/** Escapa un string para MySQL (comillas simples) */
function q(valor) {
  if (valor === null || valor === undefined) return "''";
  const s = String(valor)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
  return `'${s}'`;
}

/** Guarda un array/objeto como JSON escapado */
function j(valor) {
  return q(JSON.stringify(valor ?? []));
}

const lineas = [];
lineas.push('-- ============================================================================');
lineas.push('--  Pucara Turismo - Carga inicial de los paquetes que ya estaban en el sitio');
lineas.push(`--  Generado automaticamente desde src/data/paquetes.json (${data.paquetes.length} viajes)`);
lineas.push('--  Importar DESPUES de 01-schema.sql');
lineas.push('-- ============================================================================');
lineas.push('');
lineas.push('SET NAMES utf8mb4;');
lineas.push('');

// --- Politicas globales -----------------------------------------------------
const etiquetas = {
  precioEnBaseDoble: 'Precio en base doble',
  suplementoSingle: 'Suplemento single',
  menoresCuatroAnios: 'Menores de 4 anios',
  cocheCama: 'Coche cama',
  tipoBus: 'Tipo de bus',
  puntosDeSubida: 'Puntos de subida',
};
lineas.push('-- Politicas globales del sitio');
const politicas = Object.entries(data.politicasGlobales || {});
politicas.forEach(([clave, valor], i) => {
  lineas.push(
    `INSERT INTO pt_politicas (clave, valor, orden) VALUES (${q(clave)}, ${q(valor)}, ${i * 10})`
  );
  lineas.push('  ON DUPLICATE KEY UPDATE valor = VALUES(valor), orden = VALUES(orden);');
});
lineas.push('');

// --- Paquetes ---------------------------------------------------------------
lineas.push('-- Paquetes');
for (const p of data.paquetes) {
  const campos = [
    ['id', q(p.id)],
    ['slug', q(p.slug)],
    ['titulo', q(p.titulo)],
    ['tipo', q(p.tipo || 'full_day')],
    ['destino', q(p.destino || '')],
    ['duracion_dias', Number(p.duracionDias) || 1],
    ['duracion_noches', Number(p.duracionNoches) || 0],
    ['precio_base', Number(p.precioBase) || 0],
    ['gastos_admin', Number(p.gastosAdmin) || 0],
    ['suplemento_single', Number(p.suplementoSingle) || 0],
    ['coche_cama_extra', Number(p.cocheCamaExtra) || 0],
    ['descripcion_corta', q(p.descripcionCorta || '')],
    ['descripcion_larga', q(p.descripcionLarga || '')],
    ['incluye', j(p.incluye)],
    ['no_incluye', j(p.noIncluye)],
    ['imagen_principal', q(p.imagenPrincipal || '')],
    ['imagenes', j(p.imagenes)],
    ['rating', Number(p.rating) || 4.8],
    ['reviews', Number(p.reviews) || 0],
    ['cupos_por_salida', Number(p.cuposPorSalida) || 30],
    ['proxima_salida', q(p.proximaSalida)],
    ['frecuencia_salidas', q(p.frecuenciaSalidas || 'mensual')],
    ['tags', j(p.tags)],
    ['itinerario', j(p.itinerario)],
    ['puntos_de_subida', j(p.puntosDeSubida)],
    ['politicas', j(p.politicas ?? {})],
    ['activo', 1],
  ];
  lineas.push(`INSERT INTO pt_paquetes (${campos.map(([c]) => c).join(', ')}) VALUES`);
  lineas.push(`  (${campos.map(([, v]) => v).join(', ')})`);
  // Si se vuelve a importar, actualiza en vez de fallar
  const updates = campos
    .filter(([c]) => c !== 'id')
    .map(([c]) => `${c} = VALUES(${c})`)
    .join(', ');
  lineas.push(`  ON DUPLICATE KEY UPDATE ${updates};`);
  lineas.push('');
}

const salida = lineas.join('\n');
writeFileSync(join(raiz, 'sql/02-seed.sql'), salida, 'utf8');
console.log(`sql/02-seed.sql generado: ${data.paquetes.length} paquetes, ${politicas.length} politicas, ${(salida.length / 1024).toFixed(1)} KB`);
