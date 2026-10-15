/**
 * Genera las variantes .webp de las fotos de public/ y reescribe el manifiesto
 * que usa webpSrcset().
 *
 * Por que existe: las tarjetas usan <picture> con un <source> .webp. Si ese
 * archivo no esta, el navegador NO cae al .jpg: muestra la foto rota. El
 * manifiesto estaba commiteado pero los .webp no, asi que dependiamos de una
 * subida manual vieja al hosting. Esto los vuelve a generar en cada build.
 *
 * Los .webp quedan fuera del repo (ver .gitignore): son artefactos de build.
 */
import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(process.cwd());
const PUBLIC = path.join(RAIZ, 'public');
const MANIFIESTO = path.join(RAIZ, 'src', 'data', 'img-manifest.json');

// Los anchos que realmente pide el sitio en sus atributos sizes
const ANCHOS = [400, 800, 1280];
const CALIDAD = 72;

const aviso = (m) => console.log(`[webp] ${m}`);

async function main() {
  if (!existsSync(PUBLIC)) {
    aviso('no hay carpeta public/, no hay nada que hacer');
    return;
  }

  const archivos = (await readdir(PUBLIC)).filter((f) => /\.jpe?g$/i.test(f));
  if (!archivos.length) {
    aviso('no hay fotos .jpg en public/');
    await writeFile(MANIFIESTO, '{}\n');
    return;
  }

  const manifiesto = {};
  let generadas = 0;
  let reusadas = 0;

  for (const archivo of archivos) {
    const origen = path.join(PUBLIC, archivo);
    const base = archivo.replace(/\.jpe?g$/i, '');
    const clave = `/${archivo}`;

    let meta;
    try {
      meta = await sharp(origen).metadata();
    } catch {
      aviso(`no pude leer ${archivo}, la salteo`);
      continue;
    }
    if (!meta.width) continue;

    // Nunca agrandamos una foto: solo anchos menores o iguales al original.
    const anchos = ANCHOS.filter((a) => a <= meta.width);
    if (!anchos.includes(meta.width) && anchos.length === 0) anchos.push(meta.width);

    const hechos = [];
    for (const ancho of anchos) {
      const destino = path.join(PUBLIC, `${base}-${ancho}.webp`);

      // Si ya existe y es mas nuevo que el original, no lo rehacemos
      if (existsSync(destino)) {
        const [a, b] = await Promise.all([stat(destino), stat(origen)]);
        if (a.mtimeMs >= b.mtimeMs) { hechos.push(ancho); reusadas++; continue; }
      }

      await sharp(origen).resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: CALIDAD })
        .toFile(destino);
      hechos.push(ancho);
      generadas++;
    }

    if (hechos.length) manifiesto[clave] = hechos;
  }

  await mkdir(path.dirname(MANIFIESTO), { recursive: true });
  await writeFile(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n');

  aviso(`${Object.keys(manifiesto).length} fotos en el manifiesto · ${generadas} variantes nuevas · ${reusadas} ya estaban`);
}

main().catch((e) => {
  // Que no se caiga el build por esto: sin manifiesto, el sitio usa los .jpg
  console.error('[webp] fallo generando variantes:', e.message);
  process.exit(0);
});
