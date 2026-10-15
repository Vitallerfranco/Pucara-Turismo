/**
 * Pucara Turismo - Sincroniza los viajes desde el hosting al proyecto
 *
 *   node scripts/sync-paquetes.mjs            -> baja los paquetes y reescribe src/data/paquetes.json
 *   node scripts/sync-paquetes.mjs --publicado -> le avisa al panel que el sitio ya se subio
 *
 * Se ejecuta solo antes de cada build (hook "prebuild" de package.json).
 *
 * Si el hosting no responde, NO rompe el build: avisa y deja el paquetes.json
 * que ya estaba en el proyecto, asi siempre se puede compilar sin internet.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'src/data/paquetes.json');
const respaldo = join(raiz, 'src/data/paquetes.backup.json');

// ---------------------------------------------------------------------------
//  Lee el .env sin dependencias
// ---------------------------------------------------------------------------
function leerEnv() {
  const env = { ...process.env };
  for (const archivo of ['.env', '.env.local']) {
    const ruta = join(raiz, archivo);
    if (!existsSync(ruta)) continue;
    for (const linea of readFileSync(ruta, 'utf8').split('\n')) {
      const l = linea.trim();
      if (!l || l.startsWith('#')) continue;
      const i = l.indexOf('=');
      if (i === -1) continue;
      const clave = l.slice(0, i).trim();
      let valor = l.slice(i + 1).trim();
      if (
        (valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))
      ) {
        valor = valor.slice(1, -1);
      }
      if (!(clave in process.env)) env[clave] = valor;
    }
  }
  return env;
}

const env = leerEnv();
const API = (env.PUCARA_API_URL || 'https://pucaraturismo.com.ar/api/paquetes.php').replace(/\/$/, '');
const TOKEN = env.PUCARA_API_TOKEN || '';
const TIMEOUT = Number(env.PUCARA_API_TIMEOUT || 15000);

const log = (...a) => console.log('[paquetes]', ...a);
const aviso = (...a) => console.warn('[paquetes]', ...a);

/** fetch con timeout */
async function pedir(url, opciones = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    return await fetch(url, { ...opciones, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
//  Modo "--publicado": avisa al panel que el sitio ya esta online
// ---------------------------------------------------------------------------
async function marcarPublicado() {
  if (!TOKEN) {
    aviso('Falta PUCARA_API_TOKEN en el .env, no se puede marcar como publicado.');
    process.exit(1);
  }
  try {
    const r = await pedir(`${API}?marcar_publicado=1`, {
      method: 'POST',
      headers: { 'X-Pucara-Token': TOKEN },
    });
    const cuerpo = await r.json().catch(() => ({}));
    if (!r.ok || !cuerpo.ok) {
      aviso(`No se pudo marcar como publicado (HTTP ${r.status}): ${cuerpo.error || 'sin detalle'}`);
      process.exit(1);
    }
    log(`Listo: el panel ya no avisa cambios pendientes (${cuerpo.publicado_en}).`);
  } catch (e) {
    aviso('No se pudo contactar al hosting:', e.message);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
//  Validacion: mejor dejar los datos viejos que escribir basura
// ---------------------------------------------------------------------------
function validar(data) {
  if (!data || typeof data !== 'object') return 'la respuesta no es un objeto';
  if (!Array.isArray(data.paquetes)) return 'falta el array "paquetes"';
  if (data.paquetes.length === 0) return 'la lista de paquetes vino vacia';
  if (!data.politicasGlobales || typeof data.politicasGlobales !== 'object') {
    return 'faltan las politicas globales';
  }
  for (const p of data.paquetes) {
    for (const campo of ['id', 'slug', 'titulo', 'proximaSalida']) {
      if (!p[campo]) return `el paquete ${p.id || '(sin id)'} no tiene "${campo}"`;
    }
    if (!Array.isArray(p.incluye) || !Array.isArray(p.imagenes)) {
      return `el paquete ${p.id} tiene campos de lista mal formados`;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
//  Sincronizacion
// ---------------------------------------------------------------------------
async function sincronizar() {
  log(`Bajando viajes de ${API}`);

  let data;
  try {
    const r = await pedir(API, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    data = await r.json();
  } catch (e) {
    aviso('--------------------------------------------------------------');
    aviso(`No se pudieron bajar los viajes: ${e.message}`);
    aviso('Se compila con los datos que ya estaban en src/data/paquetes.json.');
    aviso('Revisa que el hosting responda y que PUCARA_API_URL sea correcta.');
    aviso('--------------------------------------------------------------');
    return;
  }

  const error = validar(data);
  if (error) {
    aviso('--------------------------------------------------------------');
    aviso(`Los datos que devolvio el hosting no son validos: ${error}`);
    aviso('Se compila con los datos que ya estaban en src/data/paquetes.json.');
    aviso('--------------------------------------------------------------');
    return;
  }

  // Ordena por fecha de salida, igual que espera el sitio
  data.paquetes.sort((a, b) => String(a.proximaSalida).localeCompare(String(b.proximaSalida)));

  // Respaldo del anterior, por si hay que volver atras
  if (existsSync(destino)) {
    try { copyFileSync(destino, respaldo); } catch { /* no es critico */ }
  }

  const json = JSON.stringify(data, null, 2) + '\n';
  const anterior = existsSync(destino) ? readFileSync(destino, 'utf8') : '';
  if (anterior === json) {
    log(`Sin cambios: ${data.paquetes.length} viajes.`);
    return;
  }

  writeFileSync(destino, json, 'utf8');
  log(`Actualizado: ${data.paquetes.length} viajes escritos en src/data/paquetes.json`);

  const hoy = new Date().toISOString().slice(0, 10);
  const pasados = data.paquetes.filter((p) => String(p.proximaSalida) < hoy);
  if (pasados.length) {
    aviso(`Ojo: ${pasados.length} viaje(s) con fecha ya pasada siguen visibles en la web:`);
    for (const p of pasados) aviso(`   - ${p.proximaSalida} · ${p.titulo}`);
    aviso('   Si ya no viajan, ocultalos desde el panel.');
  }
}

// ---------------------------------------------------------------------------
if (process.argv.includes('--publicado')) {
  await marcarPublicado();
} else {
  await sincronizar();
}
