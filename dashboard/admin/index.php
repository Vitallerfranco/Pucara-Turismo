<?php
/**
 * Pucara Turismo - Dashboard de viajes
 * Una sola pagina con varias vistas (?v=...). Los formularios postean a acciones.php
 */
require __DIR__ . '/lib.php';
pt_sesion_iniciar();

$v = $_GET['v'] ?? 'lista';
if (!pt_logueado()) $v = 'login';

$flash = pt_flash(null);
$form  = $_SESSION['pt_form'] ?? [];   // datos recuperados tras un error de validacion
unset($_SESSION['pt_form']);

// Paquete en edicion
$editando = null;
if ($v === 'editar') {
    $editando = pt_paquete($_GET['id'] ?? '');
    if (!$editando) { pt_flash('error', 'No se encontro ese viaje.'); header('Location: index.php'); exit; }
}

/** Valor de un campo del formulario: lo recuperado > lo de la base > el default */
function val($campo, $db_campo = null, $default = '')
{
    global $form, $editando;
    if (array_key_exists($campo, $form)) return $form[$campo];
    $k = $db_campo ?? $campo;
    if ($editando && array_key_exists($k, $editando)) return $editando[$k];
    return $default;
}

/** Arrays guardados como JSON -> texto para textarea */
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
        if (is_array($p) && isset($p[$clave])) return $p[$clave];
    }
    return $default;
}

$PUNTOS = ['Liniers','Haedo','Morón','Ituzaingó','Castelar','Palermo','Once','La Plata'];
$cfg = pt_config();
?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Panel de viajes · Pucará Turismo</title>
<link rel="stylesheet" href="estilos.css?v=1">
</head>
<body>

<?php if ($v === 'login'): ?>
<!-- ===================== LOGIN ===================== -->
<main class="login">
  <div class="login-caja">
    <h1>Pucará <span>Turismo</span></h1>
    <p class="login-sub">Panel de viajes</p>
    <?php if ($flash): ?><div class="flash <?= h($flash['tipo']) ?>"><?= h($flash['texto']) ?></div><?php endif; ?>
    <form method="post" action="acciones.php">
      <?= pt_csrf_campo() ?>
      <input type="hidden" name="accion" value="login">
      <label>Email
        <input type="email" name="email" required autocomplete="username" autofocus>
      </label>
      <label>Contraseña
        <input type="password" name="clave" required autocomplete="current-password">
      </label>
      <button type="submit" class="btn btn-primario btn-ancho">Entrar</button>
    </form>
  </div>
</main>

<?php else: ?>
<!-- ===================== APP ===================== -->
<header class="top">
  <div class="top-inner">
    <a class="logo" href="index.php">Pucará <span>Turismo</span></a>
    <nav>
      <a href="index.php" class="<?= in_array($v, ['lista'], true) ? 'on' : '' ?>">Viajes</a>
      <a href="index.php?v=nuevo" class="<?= $v === 'nuevo' ? 'on' : '' ?>">Nuevo viaje</a>
      <a href="index.php?v=politicas" class="<?= $v === 'politicas' ? 'on' : '' ?>">Políticas</a>
      <a href="index.php?v=actividad" class="<?= $v === 'actividad' ? 'on' : '' ?>">Historial</a>
      <?php if (pt_es_admin()): ?>
        <a href="index.php?v=usuarios" class="<?= $v === 'usuarios' ? 'on' : '' ?>">Usuarios</a>
      <?php endif; ?>
    </nav>
    <div class="top-user">
      <a href="index.php?v=cuenta" class="user"><?= h(pt_usuario()['nombre'] ?: pt_usuario()['email']) ?></a>
      <form method="post" action="acciones.php" class="inline">
        <?= pt_csrf_campo() ?><input type="hidden" name="accion" value="logout">
        <button class="btn btn-fantasma">Salir</button>
      </form>
    </div>
  </div>
</header>

<main class="wrap">
<?php if ($flash): ?><div class="flash <?= h($flash['tipo']) ?>"><?= h($flash['texto']) ?></div><?php endif; ?>

<?php
// ---------------------------------------------------------------------------
if ($v === 'lista'):
    $paquetes = pt_paquetes(false);
    $sin_publicar = pt_cambios_sin_publicar();
    $ultima = pt_estado('ultima_publicacion');
    $hoy = date('Y-m-d');
?>
  <div class="cabecera">
    <div>
      <h1>Viajes</h1>
      <p class="sub"><?= count($paquetes) ?> en total ·
        <?= count(array_filter($paquetes, function ($p) { return $p['activo']; })) ?> visibles en la web</p>
    </div>
    <a href="index.php?v=nuevo" class="btn btn-primario">+ Nuevo viaje</a>
  </div>

  <?php
    $pub = pt_estado_publicacion();
    $auto = pt_publicacion_configurada();
    $actions = pt_url_actions();
  ?>
  <div class="publicar <?= h($pub['estado']) ?>">
    <div class="publicar-texto">
      <?php if ($pub['estado'] === 'publicando'): ?>
        <strong>Publicando el sitio…</strong>
        <span>Arrancó hace <?= $pub['minutos'] ?> <?= $pub['minutos'] === 1 ? 'minuto' : 'minutos' ?>.
          Suele tardar entre 2 y 4. Esta página se actualiza sola.</span>
      <?php elseif ($pub['estado'] === 'demorada'): ?>
        <strong>La publicación todavía no terminó.</strong>
        <span>Pasaron <?= $pub['minutos'] ?> minutos desde que la pediste, así que puede haber fallado.
          <?php if ($actions): ?><a href="<?= h($actions) ?>" target="_blank" rel="noopener">Mirá qué pasó en GitHub</a> y volvé a intentar.<?php endif; ?></span>
      <?php elseif ($pub['estado'] === 'pendiente'): ?>
        <strong><?= $sin_publicar ?> <?= $sin_publicar === 1 ? 'cambio' : 'cambios' ?> sin publicar.</strong>
        <span><?= $auto
          ? 'Ya están guardados. Apretá Publicar y en un par de minutos se ven en la web.'
          : 'Ya están guardados. Para que se vean en la web: npm run build y subir dist/ por FTP.' ?></span>
      <?php else: ?>
        <strong>Todo publicado.</strong>
        <span><?= $ultima
          ? 'Última publicación: ' . h(date('d/m/Y H:i', strtotime($ultima)))
          : 'Todavía no se publicó desde el panel.' ?></span>
      <?php endif; ?>
    </div>

    <div class="publicar-accion">
      <?php if ($auto): ?>
        <?php if ($pub['estado'] === 'publicando'): ?>
          <span class="publicando-chip">En curso…</span>
          <?php if ($actions): ?>
            <a class="btn btn-fantasma" href="<?= h($actions) ?>" target="_blank" rel="noopener">Ver progreso</a>
          <?php endif; ?>
        <?php else: ?>
          <form method="post" action="acciones.php" class="inline">
            <?= pt_csrf_campo() ?>
            <input type="hidden" name="accion" value="publicar">
            <button class="btn <?= $pub['estado'] === 'pendiente' || $pub['estado'] === 'demorada' ? 'btn-primario' : '' ?>">
              <?= $pub['estado'] === 'demorada' ? 'Reintentar publicación'
                 : ($pub['estado'] === 'pendiente' ? 'Publicar ahora' : 'Publicar de nuevo') ?>
            </button>
          </form>
        <?php endif; ?>
      <?php else: ?>
        <code>npm run build</code>
      <?php endif; ?>
    </div>
  </div>

  <?php if ($pub['estado'] === 'publicando'): ?>
  <script>
    // Mientras se publica, refresca sola para mostrar cuando termina
    setTimeout(function () { location.reload(); }, 20000);
  </script>
  <?php endif; ?>

  <?php if (!$paquetes): ?>
    <p class="vacio">Todavía no hay viajes cargados. Empezá con <a href="index.php?v=nuevo">Nuevo viaje</a>.</p>
  <?php else: ?>
  <div class="tabla">
    <?php foreach ($paquetes as $p):
      $pasado = $p['proxima_salida'] < $hoy;
      $nuevo_cambio = $ultima !== '' && $p['updated_at'] > $ultima;
    ?>
    <article class="fila <?= $p['activo'] ? '' : 'oculto' ?>">
      <div class="fila-foto">
        <?php if ($p['imagen_principal']): ?>
          <img src="<?= h($p['imagen_principal']) ?>" alt="" loading="lazy">
        <?php else: ?>
          <div class="sin-foto">sin foto</div>
        <?php endif; ?>
      </div>
      <div class="fila-datos">
        <h2><?= h($p['titulo']) ?></h2>
        <p class="meta">
          <span class="<?= $pasado ? 'rojo' : '' ?>">
            <?= h(date('d/m/Y', strtotime($p['proxima_salida']))) ?><?= $pasado ? ' · ya pasó' : '' ?>
          </span>
          · $<?= number_format((int) $p['precio_base'], 0, ',', '.') ?>
          · <?= h(str_replace('_', ' ', $p['tipo'])) ?>
          · <?= (int) $p['duracion_dias'] ?>d/<?= (int) $p['duracion_noches'] ?>n
        </p>
        <p class="etiquetas">
          <?php if (!$p['activo']): ?><span class="tag tag-off">Oculto</span><?php endif; ?>
          <?php if ($nuevo_cambio): ?><span class="tag tag-pend">Sin publicar</span><?php endif; ?>
          <span class="tag tag-id"><?= h($p['id']) ?></span>
        </p>
      </div>
      <div class="fila-acciones">
        <a class="btn" href="index.php?v=editar&id=<?= urlencode($p['id']) ?>">Editar</a>
        <a class="btn btn-fantasma" href="<?= h(rtrim($cfg['sitio_url'], '/')) ?>/paquetes/<?= h($p['slug']) ?>/" target="_blank" rel="noopener">Ver</a>
        <form method="post" action="acciones.php" class="inline">
          <?= pt_csrf_campo() ?>
          <input type="hidden" name="accion" value="activar">
          <input type="hidden" name="id" value="<?= h($p['id']) ?>">
          <button class="btn btn-fantasma"><?= $p['activo'] ? 'Ocultar' : 'Mostrar' ?></button>
        </form>
        <form method="post" action="acciones.php" class="inline">
          <?= pt_csrf_campo() ?>
          <input type="hidden" name="accion" value="duplicar">
          <input type="hidden" name="id" value="<?= h($p['id']) ?>">
          <button class="btn btn-fantasma">Duplicar</button>
        </form>
        <form method="post" action="acciones.php" class="inline"
              onsubmit="return confirm('¿Borrar definitivamente &quot;<?= h(addslashes($p['titulo'])) ?>&quot;? Esto no se puede deshacer.');">
          <?= pt_csrf_campo() ?>
          <input type="hidden" name="accion" value="borrar">
          <input type="hidden" name="id" value="<?= h($p['id']) ?>">
          <button class="btn btn-peligro">Borrar</button>
        </form>
      </div>
    </article>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>

<?php
// ---------------------------------------------------------------------------
elseif ($v === 'nuevo' || $v === 'editar'):
  $es_nuevo = ($v === 'nuevo');
  $imagenes_actuales = $editando ? pt_json_array($editando['imagenes']) : [];
  $puntos_elegidos = $editando ? pt_json_array($editando['puntos_de_subida']) : $PUNTOS;
  if (isset($form['puntos_de_subida'])) $puntos_elegidos = (array) $form['puntos_de_subida'];
  $pol = pt_politicas();
?>
  <div class="cabecera">
    <div>
      <h1><?= $es_nuevo ? 'Nuevo viaje' : 'Editar viaje' ?></h1>
      <?php if (!$es_nuevo): ?><p class="sub"><?= h($editando['id']) ?> · /paquetes/<?= h($editando['slug']) ?>/</p><?php endif; ?>
    </div>
    <a href="index.php" class="btn btn-fantasma">← Volver</a>
  </div>

  <form method="post" action="acciones.php" enctype="multipart/form-data" class="formulario">
    <?= pt_csrf_campo() ?>
    <input type="hidden" name="accion" value="guardar">
    <input type="hidden" name="id" value="<?= h($es_nuevo ? '' : $editando['id']) ?>">

    <!-- ---------- Lo basico ---------- -->
    <fieldset>
      <legend>Lo básico</legend>
      <label class="ancho">Título del viaje <span class="req">*</span>
        <input type="text" name="titulo" required maxlength="255"
               placeholder="Termas de San José — Full Day · 11 de Octubre"
               value="<?= h(val('titulo')) ?>">
        <small>Es el título que se ve en la tarjeta y en la página del viaje.</small>
      </label>

      <div class="grilla">
        <label>Fecha de salida <span class="req">*</span>
          <input type="date" name="proxima_salida" required value="<?= h(val('proxima_salida')) ?>">
        </label>
        <label>Precio por persona <span class="req">*</span>
          <input type="number" name="precio_base" required min="0" step="1000"
                 placeholder="139000" value="<?= h(val('precio_base')) ?>">
          <small>Base doble, sin gastos administrativos.</small>
        </label>
        <label>Gastos administrativos
          <input type="number" name="gastos_admin" min="0" step="1000"
                 value="<?= h(val('gastos_admin', 'gastos_admin', 10000)) ?>">
        </label>
      </div>

      <div class="grilla">
        <label>Tipo de viaje
          <?php $tipo_actual = val('tipo', 'tipo', 'full_day'); ?>
          <select name="tipo">
            <option value="full_day" <?= $tipo_actual === 'full_day' ? 'selected' : '' ?>>Full day (en el día)</option>
            <option value="escapada" <?= $tipo_actual === 'escapada' ? 'selected' : '' ?>>Escapada (1 o 2 noches)</option>
            <option value="viaje_completo" <?= $tipo_actual === 'viaje_completo' ? 'selected' : '' ?>>Viaje completo</option>
          </select>
        </label>
        <label>Días
          <input type="number" name="duracion_dias" min="1" value="<?= h(val('duracion_dias', 'duracion_dias', 1)) ?>">
        </label>
        <label>Noches
          <input type="number" name="duracion_noches" min="0" value="<?= h(val('duracion_noches', 'duracion_noches', 0)) ?>">
        </label>
      </div>

      <div class="grilla">
        <label>Destino
          <input type="text" name="destino" list="destinos" placeholder="colon-entre-rios"
                 value="<?= h(val('destino')) ?>">
          <datalist id="destinos">
            <?php foreach (pt_db()->query('SELECT DISTINCT destino FROM pt_paquetes ORDER BY destino')->fetchAll() as $d): ?>
              <option value="<?= h($d['destino']) ?>"></option>
            <?php endforeach; ?>
          </datalist>
          <small>Se usa para agrupar por destino. Todo junto y con guiones.</small>
        </label>
        <label>Cupos por salida
          <input type="number" name="cupos_por_salida" min="0" value="<?= h(val('cupos_por_salida', 'cupos_por_salida', 30)) ?>">
        </label>
        <label>Frecuencia
          <?php $fre = val('frecuencia_salidas', 'frecuencia_salidas', 'mensual'); ?>
          <select name="frecuencia_salidas">
            <?php foreach (['semanal','quincenal','mensual'] as $f): ?>
              <option value="<?= $f ?>" <?= $fre === $f ? 'selected' : '' ?>><?= ucfirst($f) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
      </div>

      <label class="check">
        <input type="checkbox" name="activo" value="1"
          <?= (array_key_exists('activo', $form) ? !empty($form['activo']) : ($es_nuevo ? true : $editando['activo'])) ? 'checked' : '' ?>>
        Mostrar este viaje en la web
      </label>
    </fieldset>

    <!-- ---------- Textos ---------- -->
    <fieldset>
      <legend>Textos</legend>
      <label class="ancho">Descripción corta
        <textarea name="descripcion_corta" rows="3" maxlength="600"
          placeholder="Full day a las Termas de San José con desayuno, merienda a bordo y entrada incluida."><?= h(val('descripcion_corta')) ?></textarea>
        <small>Es el texto que aparece en la tarjeta del listado. Dos o tres líneas.</small>
      </label>
      <label class="ancho">Descripción larga
        <textarea name="descripcion_larga" rows="6"><?= h(val('descripcion_larga')) ?></textarea>
        <small>El texto completo de la página del viaje.</small>
      </label>
      <div class="grilla-2">
        <label>Qué incluye <small>(uno por línea)</small>
          <textarea name="incluye" rows="8" placeholder="Bus semi cama con servicio a bordo&#10;Desayuno&#10;Coordinador de viaje"><?= h(val_lineas('incluye', 'incluye')) ?></textarea>
        </label>
        <label>Qué no incluye <small>(uno por línea)</small>
          <textarea name="no_incluye" rows="8" placeholder="Almuerzo&#10;Gastos personales"><?= h(val_lineas('no_incluye', 'no_incluye')) ?></textarea>
        </label>
      </div>
      <label class="ancho">Itinerario <small>(un paso por línea)</small>
        <textarea name="itinerario" rows="6"><?= h(val_lineas('itinerario', 'itinerario')) ?></textarea>
      </label>
      <label class="ancho">Etiquetas <small>(separadas por coma)</small>
        <input type="text" name="tags" placeholder="termas, relax, litoral, full day"
               value="<?= h(isset($form['tags']) ? $form['tags'] : ($editando ? implode(', ', pt_json_array($editando['tags'])) : '')) ?>">
      </label>
    </fieldset>

    <!-- ---------- Fotos ---------- -->
    <fieldset>
      <legend>Fotos</legend>
      <?php if ($imagenes_actuales): ?>
        <p class="ayuda">Elegí la portada y destildá las que quieras quitar.</p>
        <div class="fotos">
          <?php foreach ($imagenes_actuales as $i => $url): ?>
            <div class="foto">
              <img src="<?= h($url) ?>" alt="" loading="lazy">
              <input type="hidden" name="imagenes_actuales[]" value="<?= h($url) ?>">
              <label class="foto-radio">
                <input type="radio" name="imagen_principal" value="<?= h($url) ?>"
                  <?= (val('imagen_principal', 'imagen_principal') === $url || ($i === 0 && !val('imagen_principal', 'imagen_principal'))) ? 'checked' : '' ?>>
                Portada
              </label>
              <label class="foto-quitar">
                <input type="checkbox" name="quitar_foto[]" value="<?= h($url) ?>"> Quitar
              </label>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <label class="ancho">Subir fotos nuevas
        <input type="file" name="fotos[]" multiple accept="image/jpeg,image/png,image/webp">
        <small>JPG, PNG o WEBP, hasta <?= (int) $cfg['max_mb_imagen'] ?> MB cada una. Se guardan en el hosting automáticamente.</small>
      </label>

      <details>
        <summary>Usar fotos que ya están en el sitio</summary>
        <label class="ancho">Rutas <small>(una por línea, como <code>/termas-san-jose-1.jpg</code>)</small>
          <textarea name="imagenes_manuales" rows="3"></textarea>
        </label>
      </details>
    </fieldset>

    <!-- ---------- Puntos de subida y politicas ---------- -->
    <fieldset>
      <legend>Puntos de subida</legend>
      <div class="checks">
        <?php foreach ($PUNTOS as $punto): ?>
          <label class="check">
            <input type="checkbox" name="puntos_de_subida[]" value="<?= h($punto) ?>"
              <?= in_array($punto, $puntos_elegidos, true) ? 'checked' : '' ?>>
            <?= h($punto) ?>
          </label>
        <?php endforeach; ?>
      </div>
    </fieldset>

    <fieldset>
      <legend>Condiciones de este viaje</legend>
      <p class="ayuda">Si las dejás vacías se usan las políticas generales del sitio.</p>
      <label class="ancho">Precio en base doble
        <input type="text" name="pol_base_doble" value="<?= h(val_politica('pol_base_doble', 'precioEnBaseDoble', $pol['precioEnBaseDoble'] ?? '')) ?>">
      </label>
      <label class="ancho">Suplemento single
        <input type="text" name="pol_single" value="<?= h(val_politica('pol_single', 'suplementoSingle', $pol['suplementoSingle'] ?? '')) ?>">
      </label>
      <label class="ancho">Menores de 4 años
        <input type="text" name="pol_menores" value="<?= h(val_politica('pol_menores', 'menoresCuatroAnios', $pol['menoresCuatroAnios'] ?? '')) ?>">
      </label>
      <label class="ancho">Butaca cama
        <input type="text" name="pol_coche_cama" value="<?= h(val_politica('pol_coche_cama', 'cocheCama', $pol['cocheCama'] ?? '')) ?>">
      </label>
      <div class="grilla">
        <label>Suplemento single ($)
          <input type="number" name="suplemento_single" min="0" step="1000" value="<?= h(val('suplemento_single', 'suplemento_single', 0)) ?>">
        </label>
        <label>Butaca cama ($)
          <input type="number" name="coche_cama_extra" min="0" step="1000" value="<?= h(val('coche_cama_extra', 'coche_cama_extra', 10000)) ?>">
        </label>
      </div>
    </fieldset>

    <!-- ---------- Avanzado ---------- -->
    <details class="avanzado">
      <summary>Opciones avanzadas</summary>
      <div class="grilla">
        <label>Enlace de la página (slug)
          <input type="text" name="slug" placeholder="se genera solo desde el título" value="<?= h(val('slug')) ?>">
          <small>Si lo cambiás, la dirección anterior deja de funcionar.</small>
        </label>
        <label>Puntuación
          <input type="number" name="rating" min="0" max="5" step="0.1" value="<?= h(val('rating', 'rating', 4.8)) ?>">
        </label>
        <label>Cantidad de reseñas
          <input type="number" name="reviews" min="0" value="<?= h(val('reviews', 'reviews', 0)) ?>">
        </label>
      </div>
    </details>

    <div class="acciones-form">
      <button type="submit" class="btn btn-primario btn-grande">
        <?= $es_nuevo ? 'Crear viaje' : 'Guardar cambios' ?>
      </button>
      <a href="index.php" class="btn btn-fantasma">Cancelar</a>
    </div>
  </form>

<?php
// ---------------------------------------------------------------------------
elseif ($v === 'politicas'):
  $pol = pt_politicas();
  $etiquetas = [
    'precioEnBaseDoble'  => 'Precio en base doble',
    'suplementoSingle'   => 'Suplemento single',
    'menoresCuatroAnios' => 'Menores de 4 años',
    'cocheCama'          => 'Butaca cama',
    'tipoBus'            => 'Tipo de bus',
    'puntosDeSubida'     => 'Puntos de subida',
  ];
?>
  <div class="cabecera"><h1>Políticas generales</h1></div>
  <p class="ayuda">Son los textos que se muestran en el listado de paquetes y como valores por defecto de cada viaje nuevo.</p>
  <form method="post" action="acciones.php" class="formulario">
    <?= pt_csrf_campo() ?>
    <input type="hidden" name="accion" value="politicas">
    <fieldset>
      <?php foreach ($etiquetas as $clave => $etiqueta): ?>
        <label class="ancho"><?= h($etiqueta) ?>
          <textarea name="politica[<?= h($clave) ?>]" rows="2"><?= h($pol[$clave] ?? '') ?></textarea>
        </label>
      <?php endforeach; ?>
    </fieldset>
    <div class="acciones-form">
      <button class="btn btn-primario btn-grande">Guardar políticas</button>
    </div>
  </form>

<?php
// ---------------------------------------------------------------------------
elseif ($v === 'actividad'):
  $filas = pt_db()->query('SELECT * FROM pt_actividad ORDER BY created_at DESC LIMIT 200')->fetchAll();
?>
  <div class="cabecera"><h1>Historial</h1></div>
  <?php if (!$filas): ?><p class="vacio">Sin actividad todavía.</p><?php else: ?>
  <table class="grid">
    <thead><tr><th>Cuándo</th><th>Quién</th><th>Qué hizo</th><th>Viaje</th></tr></thead>
    <tbody>
      <?php foreach ($filas as $f): ?>
      <tr>
        <td><?= h(date('d/m/Y H:i', strtotime($f['created_at']))) ?></td>
        <td><?= h($f['email']) ?></td>
        <td><?= h($f['accion']) ?></td>
        <td><?= h($f['paquete_id'] ? $f['paquete_id'] . ' · ' . $f['detalle'] : $f['detalle']) ?></td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>

<?php
// ---------------------------------------------------------------------------
elseif ($v === 'cuenta'):
?>
  <div class="cabecera"><h1>Mi cuenta</h1></div>
  <p class="ayuda"><?= h(pt_usuario()['email']) ?> · rol <?= h(pt_usuario()['rol']) ?></p>
  <form method="post" action="acciones.php" class="formulario estrecho">
    <?= pt_csrf_campo() ?>
    <input type="hidden" name="accion" value="clave">
    <fieldset>
      <legend>Cambiar contraseña</legend>
      <label>Contraseña actual<input type="password" name="clave_actual" required autocomplete="current-password"></label>
      <label>Contraseña nueva<input type="password" name="clave_nueva" required minlength="10" autocomplete="new-password"></label>
      <label>Repetir la nueva<input type="password" name="clave_repetir" required minlength="10" autocomplete="new-password"></label>
    </fieldset>
    <div class="acciones-form"><button class="btn btn-primario">Cambiar contraseña</button></div>
  </form>

<?php
// ---------------------------------------------------------------------------
elseif ($v === 'usuarios' && pt_es_admin()):
  $usuarios = pt_db()->query('SELECT * FROM pt_usuarios ORDER BY created_at ASC')->fetchAll();
?>
  <div class="cabecera"><h1>Usuarios</h1></div>
  <table class="grid">
    <thead><tr><th>Email</th><th>Nombre</th><th>Rol</th><th>Último acceso</th><th></th></tr></thead>
    <tbody>
      <?php foreach ($usuarios as $u): ?>
      <tr>
        <td><?= h($u['email']) ?></td>
        <td><?= h($u['nombre']) ?></td>
        <td><?= h($u['rol']) ?></td>
        <td><?= $u['ultimo_acceso'] ? h(date('d/m/Y H:i', strtotime($u['ultimo_acceso']))) : '—' ?></td>
        <td>
          <?php if ((int) $u['id'] !== (int) pt_usuario()['id']): ?>
          <form method="post" action="acciones.php" class="inline"
                onsubmit="return confirm('¿Borrar el usuario <?= h(addslashes($u['email'])) ?>?');">
            <?= pt_csrf_campo() ?>
            <input type="hidden" name="accion" value="usuario_borrar">
            <input type="hidden" name="uid" value="<?= (int) $u['id'] ?>">
            <button class="btn btn-peligro btn-chico">Borrar</button>
          </form>
          <?php endif; ?>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>

  <form method="post" action="acciones.php" class="formulario estrecho">
    <?= pt_csrf_campo() ?>
    <input type="hidden" name="accion" value="usuario_nuevo">
    <fieldset>
      <legend>Agregar usuario</legend>
      <label>Email<input type="email" name="email" required></label>
      <label>Nombre<input type="text" name="nombre"></label>
      <label>Contraseña<input type="password" name="clave" required minlength="10" autocomplete="new-password">
        <small>Mínimo 10 caracteres. Después la puede cambiar desde Mi cuenta.</small></label>
      <label>Rol
        <select name="rol">
          <option value="editor">Editor (carga y edita viajes)</option>
          <option value="admin">Administrador (además maneja usuarios)</option>
        </select>
      </label>
    </fieldset>
    <div class="acciones-form"><button class="btn btn-primario">Crear usuario</button></div>
  </form>

<?php else: ?>
  <p class="vacio">No tenés permiso para ver esta sección.</p>
<?php endif; ?>
</main>
<?php endif; ?>

</body>
</html>
