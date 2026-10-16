<?php
/**
 * Alta y edicion de un viaje.
 * Dos columnas: el contenido a la izquierda, lo que define la salida a la derecha.
 */
$es_nuevo = ($vista === 'nuevo');

/** Valor de un campo: lo que se escribió antes de un error > lo de la base > el default */
if (!function_exists('val')) {
    function val($campo, $db_campo = null, $default = '')
    {
        global $form, $editando;
        if (array_key_exists($campo, $form)) return $form[$campo];
        $k = $db_campo ?? $campo;
        if ($editando && array_key_exists($k, $editando)) return $editando[$k];
        return $default;
    }
    function val_lineas($campo, $db_campo)
    {
        global $form, $editando;
        if (array_key_exists($campo, $form)) return $form[$campo];
        if ($editando) return implode("\n", pt_json_array($editando[$db_campo]));
        return '';
    }
    function val_politica($campo, $clave, $default = '')
    {
        global $form, $editando;
        if (array_key_exists($campo, $form)) return $form[$campo];
        if ($editando) {
            $p = json_decode($editando['politicas'], true);
            if (is_array($p) && isset($p[$clave]) && $p[$clave] !== '') return $p[$clave];
        }
        return $default;
    }
}

$PUNTOS = [
  'Cruce Varela',
  'Rotonda Los Pinos',
  'Rotonda Lavallol',
  'Rotonda San Justo',
  'Ciudadela (Gral. Paz)',
  'Morón (frente al Plaza Oeste)',
  'Moreno (Axion Ruta 23 y Acceso Oeste)',
  'Tigre — Pacheco (Pdor. El Turista)',
];
$cfg = pt_config();
$pol = pt_politicas();

$imagenes = $editando ? pt_json_array($editando['imagenes']) : [];
$portada  = (string) val('imagen_principal', 'imagen_principal');
$puntos   = $editando ? pt_json_array($editando['puntos_de_subida']) : $PUNTOS;
if (isset($form['puntos_de_subida'])) $puntos = (array) $form['puntos_de_subida'];

$visible = array_key_exists('activo', $form)
    ? !empty($form['activo'])
    : ($es_nuevo ? false : (bool) $editando['activo']);

$titulo = $es_nuevo ? 'Cargar un viaje' : 'Editar viaje';
$subtitulo = $es_nuevo
    ? 'Con el título, la fecha y el precio ya se puede guardar. El resto lo completás cuando quieras.'
    : 'Guardado el ' . h(date('d/m/Y \a \l\a\s H:i', strtotime($editando['updated_at'])));
$acciones = '<a class="boton boton-sutil" href="index.php?v=viajes">Volver a la lista</a>';
?>

<form method="post" action="acciones.php" enctype="multipart/form-data" class="formulario" id="form-viaje">
  <?= pt_csrf_campo() ?>
  <input type="hidden" name="accion" value="guardar">
  <input type="hidden" name="id" value="<?= h($es_nuevo ? '' : $editando['id']) ?>">

  <!-- ====================== Columna principal ====================== -->
  <div class="formulario-columna">

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>El viaje</h2></div>
      <div class="tarjeta-cuerpo">
        <label class="campo">
          <span>Título <em class="obligatorio" title="Obligatorio">*</em></span>
          <input type="text" name="titulo" required maxlength="255" value="<?= h(val('titulo')) ?>"
                 placeholder="Termas de San José — Full Day · 12 de diciembre">
          <span class="ayuda">Es lo primero que lee el cliente. Conviene que diga destino y fecha.</span>
        </label>

        <label class="campo">
          <span>Resumen</span>
          <textarea name="descripcion_corta" rows="3" maxlength="600"
            placeholder="Full day a las termas con desayuno, merienda a bordo y entrada incluida."><?= h(val('descripcion_corta')) ?></textarea>
          <span class="ayuda">Dos o tres líneas. Aparece en la tarjeta del listado.</span>
        </label>

        <label class="campo">
          <span>Descripción completa</span>
          <textarea name="descripcion_larga" rows="7"><?= h(val('descripcion_larga')) ?></textarea>
          <span class="ayuda">El texto largo de la página del viaje.</span>
        </label>
      </div>
    </section>

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>Qué incluye</h2></div>
      <div class="tarjeta-cuerpo">
        <div class="rejilla-2">
          <label class="campo">
            <span>Incluye</span>
            <textarea name="incluye" rows="8" placeholder="Bus semi cama&#10;Desayuno&#10;Coordinador"><?= h(val_lineas('incluye','incluye')) ?></textarea>
            <span class="ayuda">Uno por línea.</span>
          </label>
          <label class="campo">
            <span>No incluye</span>
            <textarea name="no_incluye" rows="8" placeholder="Almuerzo&#10;Gastos personales"><?= h(val_lineas('no_incluye','no_incluye')) ?></textarea>
            <span class="ayuda">Uno por línea.</span>
          </label>
        </div>
        <label class="campo">
          <span>Itinerario</span>
          <textarea name="itinerario" rows="5" placeholder="Salida 5:00 desde los puntos de subida&#10;Llegada y día completo en las termas&#10;Regreso por la noche"><?= h(val_lineas('itinerario','itinerario')) ?></textarea>
          <span class="ayuda">Un momento del día por línea.</span>
        </label>
      </div>
    </section>

    <!-- ====================== Fotos ====================== -->
    <section class="tarjeta">
      <div class="tarjeta-cabecera">
        <h2>Fotos</h2>
        <span class="filtros-resultado" id="cuenta-fotos"><?= count($imagenes) ?></span>
      </div>
      <div class="tarjeta-cuerpo">
        <?php if ($imagenes): ?>
          <p class="ayuda" style="margin:0 0 .7rem">
            La primera es la portada. Movelas con las flechas para cambiar el orden en la galería.
          </p>
          <div class="fotos" id="fotos">
            <?php foreach ($imagenes as $i => $url):
              $es_portada = $portada !== '' ? ($portada === $url) : ($i === 0);
            ?>
              <div class="foto <?= $es_portada ? 'portada' : '' ?>" data-foto>
                <input type="hidden" name="imagenes_actuales[]" value="<?= h($url) ?>">
                <?php if ($es_portada): ?><span class="foto-marca" data-marca>Portada</span><?php endif; ?>
                <img src="<?= h($url) ?>" alt="" loading="lazy">
                <div class="foto-pie">
                  <div class="foto-mover">
                    <button type="button" class="icono-boton" data-mover="-1" title="Mover antes" aria-label="Mover antes">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button type="button" class="icono-boton" data-mover="1" title="Mover después" aria-label="Mover después">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                  <label class="marcar" style="margin:0;font-size:.74rem" title="Quitar esta foto">
                    <input type="checkbox" name="quitar_foto[]" value="<?= h($url) ?>" data-quitar>
                    Quitar
                  </label>
                </div>
                <input type="radio" name="imagen_principal" value="<?= h($url) ?>" <?= $es_portada ? 'checked' : '' ?> hidden data-portada>
              </div>
            <?php endforeach; ?>
          </div>
          <hr style="border:none;border-top:1px solid var(--linea);margin:1.1rem 0">
        <?php endif; ?>

        <label class="campo">
          <span><?= $imagenes ? 'Sumar más fotos' : 'Subir fotos' ?></span>
          <input type="file" name="fotos[]" multiple accept="image/jpeg,image/png,image/webp">
          <span class="ayuda">JPG, PNG o WEBP, hasta <?= (int) $cfg['max_mb_imagen'] ?> MB cada una.</span>
        </label>

        <details>
          <summary>Usar fotos que ya están en el sitio</summary>
          <label class="campo" style="margin-top:.7rem">
            <span>Rutas</span>
            <textarea name="imagenes_manuales" rows="3" placeholder="/termas-san-jose-1.jpg"></textarea>
            <span class="ayuda">Una por línea, como aparecen en la web.</span>
          </label>
        </details>
      </div>
    </section>

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>Puntos de subida</h2></div>
      <div class="tarjeta-cuerpo">
        <div class="marcar-grupo">
          <?php foreach ($PUNTOS as $punto): ?>
            <label class="marcar">
              <input type="checkbox" name="puntos_de_subida[]" value="<?= h($punto) ?>"
                     <?= in_array($punto, $puntos, true) ? 'checked' : '' ?>>
              <?= h($punto) ?>
            </label>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>Condiciones de este viaje</h2></div>
      <div class="tarjeta-cuerpo">
        <p class="ayuda" style="margin:0 0 .9rem">Si las dejás como están, se usan las políticas generales del sitio.</p>
        <label class="campo">
          <span>Precio en base doble</span>
          <input type="text" name="pol_base_doble" value="<?= h(val_politica('pol_base_doble','precioEnBaseDoble', $pol['precioEnBaseDoble'] ?? '')) ?>">
        </label>
        <label class="campo">
          <span>Suplemento single</span>
          <input type="text" name="pol_single" value="<?= h(val_politica('pol_single','suplementoSingle', $pol['suplementoSingle'] ?? '')) ?>">
        </label>
        <label class="campo">
          <span>Menores de 4 años</span>
          <input type="text" name="pol_menores" value="<?= h(val_politica('pol_menores','menoresCuatroAnios', $pol['menoresCuatroAnios'] ?? '')) ?>">
        </label>
        <label class="campo">
          <span>Butaca cama</span>
          <input type="text" name="pol_coche_cama" value="<?= h(val_politica('pol_coche_cama','cocheCama', $pol['cocheCama'] ?? '')) ?>">
        </label>
      </div>
    </section>

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>Dónde aparece en la web</h2></div>
      <div class="tarjeta-cuerpo">
        <label class="campo">
          <span>Categoría</span>
          <select name="categoria">
            <?php
              $cat_actual = isset($form['categoria'])
                ? $form['categoria']
                : ($editando ? ($editando['categoria'] ?? 'mes') : 'mes');
              $CATEGORIAS = [
                'mes'        => 'Por mes (según la fecha de salida)',
                'verano27'   => 'Verano 2027',
                'fin_de_ano' => 'Fin de año',
                'recital'    => 'Recitales',
              ];
              foreach ($CATEGORIAS as $clave => $texto):
            ?>
              <option value="<?= h($clave) ?>" <?= $cat_actual === $clave ? 'selected' : '' ?>><?= h($texto) ?></option>
            <?php endforeach; ?>
          </select>
          <span class="ayuda">Define en qué bloque del listado se muestra. Los de "por mes" se agrupan solos según la fecha.</span>
        </label>
      </div>
    </section>

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>Para buscadores</h2></div>
      <div class="tarjeta-cuerpo">
        <label class="campo">
          <span>Etiquetas</span>
          <input type="text" name="tags" placeholder="termas, relax, litoral, full day"
                 value="<?= h(isset($form['tags']) ? $form['tags'] : ($editando ? implode(', ', pt_json_array($editando['tags'])) : '')) ?>">
          <span class="ayuda">Separadas por coma. Ayudan al buscador del sitio.</span>
        </label>
        <div class="rejilla">
          <label class="campo">
            <span>Dirección de la página</span>
            <input type="text" name="slug" placeholder="se arma sola con el título" value="<?= h(val('slug')) ?>">
            <span class="ayuda">Si la cambiás, el enlace anterior deja de funcionar.</span>
          </label>
          <label class="campo">
            <span>Puntuación</span>
            <input type="number" name="rating" min="0" max="5" step="0.1" value="<?= h(val('rating','rating',4.8)) ?>">
          </label>
          <label class="campo">
            <span>Reseñas</span>
            <input type="number" name="reviews" min="0" value="<?= h(val('reviews','reviews',0)) ?>">
          </label>
        </div>
      </div>
    </section>
  </div>

  <!-- ====================== Columna lateral ====================== -->
  <aside class="formulario-lateral">

    <section class="tarjeta">
      <div class="tarjeta-cuerpo">
        <label class="interruptor" style="margin-bottom:.9rem">
          <input type="checkbox" name="activo" value="1" <?= $visible ? 'checked' : '' ?>>
          <span>
            Mostrar en la web
            <small><?= $es_nuevo
              ? 'Dejalo apagado si todavía lo estás armando.'
              : 'Apagalo para sacarlo del sitio sin borrarlo.' ?></small>
          </span>
        </label>

        <button type="submit" class="boton boton-primario boton-gr boton-ancho">
          <?= $es_nuevo ? 'Crear viaje' : 'Guardar cambios' ?>
        </button>
        <?php if (!$es_nuevo): ?>
          <p class="ayuda" style="text-align:center;margin:.6rem 0 0">
            Los cambios se ven en la web cuando publiques.
          </p>
        <?php endif; ?>
      </div>
    </section>

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>Salida y precio</h2></div>
      <div class="tarjeta-cuerpo">
        <label class="campo">
          <span>Fecha de salida <em class="obligatorio" title="Obligatorio">*</em></span>
          <input type="date" name="proxima_salida" required value="<?= h(val('proxima_salida')) ?>">
        </label>

        <div class="rejilla">
          <label class="campo">
            <span>Precio <em class="obligatorio" title="Obligatorio">*</em></span>
            <input type="number" name="precio_base" id="precio_base" required min="0" step="1000"
                   placeholder="139000" value="<?= h(val('precio_base')) ?>">
          </label>
          <label class="campo">
            <span>Gastos adm.</span>
            <input type="number" name="gastos_admin" id="gastos_admin" min="0" step="1000"
                   value="<?= h(val('gastos_admin','gastos_admin',10000)) ?>">
          </label>
        </div>

        <div class="precio-vivo" id="precio-vivo" aria-live="polite">
          <div class="precio-linea"><span>Por persona</span><span id="pv-base">—</span></div>
          <div class="precio-linea"><span>Gastos administrativos</span><span id="pv-adm">—</span></div>
          <div class="precio-linea total"><span>Paga cada pasajero</span><span id="pv-total">—</span></div>
          <div class="precio-linea" style="color:var(--tinta-3)"><span>Con habitación single</span><span id="pv-single">—</span></div>
        </div>

        <div class="rejilla" style="margin-top:1rem">
          <label class="campo">
            <span>Suplemento single</span>
            <input type="number" name="suplemento_single" id="suplemento_single" min="0" step="1000"
                   value="<?= h(val('suplemento_single','suplemento_single',0)) ?>">
          </label>
          <label class="campo">
            <span>Butaca cama</span>
            <input type="number" name="coche_cama_extra" min="0" step="1000"
                   value="<?= h(val('coche_cama_extra','coche_cama_extra',10000)) ?>">
          </label>
        </div>
      </div>
    </section>

    <section class="tarjeta">
      <div class="tarjeta-cabecera"><h2>Cómo es el viaje</h2></div>
      <div class="tarjeta-cuerpo">
        <?php $tipo_actual = val('tipo','tipo','full_day'); ?>
        <label class="campo">
          <span>Tipo</span>
          <select name="tipo">
            <option value="full_day"       <?= $tipo_actual==='full_day'?'selected':'' ?>>Full day, en el día</option>
            <option value="escapada"       <?= $tipo_actual==='escapada'?'selected':'' ?>>Escapada, una o dos noches</option>
            <option value="viaje_completo" <?= $tipo_actual==='viaje_completo'?'selected':'' ?>>Viaje completo</option>
          </select>
        </label>

        <label class="campo">
          <span>Destino</span>
          <input type="text" name="destino" list="lista-destinos" placeholder="colon-entre-rios" value="<?= h(val('destino')) ?>">
          <datalist id="lista-destinos">
            <?php foreach (pt_destinos() as $d): ?>
              <option value="<?= h($d['destino']) ?>"></option>
            <?php endforeach; ?>
          </datalist>
          <span class="ayuda">Todo junto y con guiones. Agrupa los viajes del mismo lugar.</span>
        </label>

        <div class="rejilla">
          <label class="campo">
            <span>Días</span>
            <input type="number" name="duracion_dias" min="1" value="<?= h(val('duracion_dias','duracion_dias',1)) ?>">
          </label>
          <label class="campo">
            <span>Noches</span>
            <input type="number" name="duracion_noches" min="0" value="<?= h(val('duracion_noches','duracion_noches',0)) ?>">
          </label>
        </div>

        <div class="rejilla">
          <label class="campo">
            <span>Cupos</span>
            <input type="number" name="cupos_por_salida" min="0" value="<?= h(val('cupos_por_salida','cupos_por_salida',30)) ?>">
          </label>
          <?php $fre = val('frecuencia_salidas','frecuencia_salidas','mensual'); ?>
          <label class="campo">
            <span>Frecuencia</span>
            <select name="frecuencia_salidas">
              <?php foreach (['semanal'=>'Semanal','quincenal'=>'Quincenal','mensual'=>'Mensual'] as $k=>$v): ?>
                <option value="<?= $k ?>" <?= $fre===$k?'selected':'' ?>><?= $v ?></option>
              <?php endforeach; ?>
            </select>
          </label>
        </div>
      </div>
    </section>
  </aside>
</form>

<?php if (!$es_nuevo): ?>
<!-- Acciones que no son "guardar": viven fuera del formulario principal -->
<div class="dos-columnas" style="margin-top:1.25rem">
  <section class="tarjeta">
    <div class="tarjeta-cabecera"><h2>Repetir esta salida</h2></div>
    <div class="tarjeta-cuerpo">
      <p class="ayuda" style="margin:0 0 .8rem">
        Copia el viaje entero con sus fotos e itinerario. La copia nace oculta para que la revises.
      </p>
      <form method="post" action="acciones.php">
        <?= pt_csrf_campo() ?>
        <input type="hidden" name="accion" value="duplicar">
        <input type="hidden" name="id" value="<?= h($editando['id']) ?>">
        <div class="rejilla-2">
          <label class="campo">
            <span>Fecha de la nueva salida</span>
            <input type="date" name="nueva_fecha" value="<?= h(date('Y-m-d', strtotime($editando['proxima_salida'] . ' +1 month'))) ?>">
          </label>
          <label class="campo">
            <span>Título de la copia</span>
            <input type="text" name="nuevo_titulo" placeholder="<?= h($editando['titulo']) ?> (copia)">
          </label>
        </div>
        <button class="boton">Duplicar viaje</button>
      </form>
    </div>
  </section>

  <section class="tarjeta">
    <div class="tarjeta-cabecera"><h2>Este viaje</h2></div>
    <div class="tarjeta-cuerpo">
      <div class="linea-acciones" style="margin-bottom:1rem">
        <a class="boton" href="<?= h(rtrim($cfg['sitio_url'],'/') . '/paquetes/' . $editando['slug'] . '/') ?>"
           target="_blank" rel="noopener">Ver en la web</a>
        <span class="filtros-resultado"><?= h($editando['id']) ?></span>
      </div>
      <form method="post" action="acciones.php"
            onsubmit="return confirm('Se borra «<?= h(addslashes($editando['titulo'])) ?>» y sus fotos. Esto no se puede deshacer.\n\n¿Seguro? Si solo querés sacarlo de la web, usá Ocultar.');">
        <?= pt_csrf_campo() ?>
        <input type="hidden" name="accion" value="borrar">
        <input type="hidden" name="id" value="<?= h($editando['id']) ?>">
        <button class="boton boton-peligro">Borrar viaje</button>
      </form>
    </div>
  </section>
</div>
<?php endif; ?>
