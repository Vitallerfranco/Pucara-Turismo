<?php
/** Listado de viajes con buscador, filtros y acciones en lote */
$f = [
    'q'       => trim($_GET['q'] ?? ''),
    'estado'  => $_GET['estado'] ?? '',
    'destino' => $_GET['destino'] ?? '',
    'mes'     => $_GET['mes'] ?? '',
    'orden'   => $_GET['orden'] ?? 'fecha_asc',
];
$hay_filtro = ($f['q'] !== '' || $f['estado'] !== '' || $f['destino'] !== '' || $f['mes'] !== '');

$paquetes = pt_buscar_paquetes($f);
$total    = (int) pt_db()->query('SELECT COUNT(*) AS n FROM pt_paquetes')->fetch()['n'];
$hoy      = date('Y-m-d');
$ultima   = pt_estado('ultima_publicacion');

$titulo = 'Viajes';
$subtitulo = $total === 0
    ? 'Todavía no hay viajes cargados'
    : $total . ($total === 1 ? ' viaje cargado' : ' viajes cargados');
$acciones = '<a class="boton boton-primario" href="index.php?v=nuevo">Cargar un viaje</a>';
?>

<?php include __DIR__ . '/_publicacion.php'; ?>

<?php if ($total > 0): ?>
<form class="filtros" method="get" action="index.php" id="filtros">
  <input type="hidden" name="v" value="viajes">

  <div class="buscador">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input type="search" name="q" value="<?= h($f['q']) ?>" placeholder="Buscar por título o destino">
  </div>

  <select name="estado" data-envia>
    <option value="">Todos los estados</option>
    <option value="visibles" <?= $f['estado']==='visibles'?'selected':'' ?>>En la web</option>
    <option value="ocultos"  <?= $f['estado']==='ocultos' ?'selected':'' ?>>Ocultos</option>
    <option value="proximos" <?= $f['estado']==='proximos'?'selected':'' ?>>Por salir</option>
    <option value="vencidos" <?= $f['estado']==='vencidos'?'selected':'' ?>>Ya salieron</option>
  </select>

  <select name="destino" data-envia>
    <option value="">Todos los destinos</option>
    <?php foreach (pt_destinos() as $d): ?>
      <option value="<?= h($d['destino']) ?>" <?= $f['destino']===$d['destino']?'selected':'' ?>>
        <?= h(ucwords(str_replace('-', ' ', $d['destino']))) ?> (<?= (int)$d['n'] ?>)
      </option>
    <?php endforeach; ?>
  </select>

  <select name="mes" data-envia>
    <option value="">Cualquier mes</option>
    <?php foreach (pt_meses_con_salidas() as $m): ?>
      <option value="<?= h($m['mes']) ?>" <?= $f['mes']===$m['mes']?'selected':'' ?>>
        <?= h(pt_mes_largo($m['mes'])) ?> (<?= (int)$m['n'] ?>)
      </option>
    <?php endforeach; ?>
  </select>

  <select name="orden" data-envia>
    <option value="fecha_asc"   <?= $f['orden']==='fecha_asc'  ?'selected':'' ?>>Salida más próxima</option>
    <option value="fecha_desc"  <?= $f['orden']==='fecha_desc' ?'selected':'' ?>>Salida más lejana</option>
    <option value="precio_asc"  <?= $f['orden']==='precio_asc' ?'selected':'' ?>>Precio de menor a mayor</option>
    <option value="precio_desc" <?= $f['orden']==='precio_desc'?'selected':'' ?>>Precio de mayor a menor</option>
    <option value="titulo"      <?= $f['orden']==='titulo'     ?'selected':'' ?>>Título A-Z</option>
    <option value="nuevos"      <?= $f['orden']==='nuevos'     ?'selected':'' ?>>Cargados hace poco</option>
  </select>

  <button class="boton boton-ch">Buscar</button>
  <?php if ($hay_filtro): ?>
    <a class="boton boton-sutil boton-ch" href="index.php?v=viajes">Limpiar</a>
    <span class="filtros-resultado"><?= count($paquetes) ?> de <?= $total ?></span>
  <?php endif; ?>
</form>
<?php endif; ?>

<?php if ($total === 0): ?>
  <div class="tarjeta">
    <div class="vacio">
      <div class="vacio-icono">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
      </div>
      <h3>Empecemos por el primer viaje</h3>
      <p>Cargá una salida con su fecha, su precio y sus fotos. Después se publica en la web con un botón.</p>
      <a class="boton boton-primario" href="index.php?v=nuevo">Cargar un viaje</a>
    </div>
  </div>

<?php elseif (!$paquetes): ?>
  <div class="tarjeta">
    <div class="vacio">
      <div class="vacio-icono">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </div>
      <h3>Ningún viaje coincide con esa búsqueda</h3>
      <p>Probá con otra palabra o sacá alguno de los filtros.</p>
      <a class="boton" href="index.php?v=viajes">Ver todos los viajes</a>
    </div>
  </div>

<?php else: ?>
  <div class="lista" id="lista">
    <div class="lista-encabezado">
      <label class="marcar" style="margin:0">
        <input type="checkbox" id="marcar-todos" aria-label="Marcar todos los viajes">
      </label>
      <span></span>
      <span>Viaje</span>
      <span>Sale</span>
      <span style="text-align:right">Precio</span>
      <span></span>
    </div>

    <?php foreach ($paquetes as $p):
      $vencido = $p['proxima_salida'] < $hoy;
      $t = strtotime($p['proxima_salida']);
      $sin_publicar = $ultima !== '' && $p['updated_at'] > $ultima;
    ?>
      <div class="viaje <?= $p['activo'] ? '' : 'oculta' ?>">
        <label class="marcar" style="margin:0">
          <input type="checkbox" class="marcar-viaje" value="<?= h($p['id']) ?>"
                 aria-label="Elegir <?= h($p['titulo']) ?>">
        </label>

        <?php if ($p['imagen_principal']): ?>
          <img class="miniatura" src="<?= h($p['imagen_principal']) ?>" alt="" loading="lazy">
        <?php else: ?>
          <div class="miniatura-vacia" title="Sin foto">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4 4 3 3-2 4 3"/></svg>
          </div>
        <?php endif; ?>

        <div class="viaje-datos">
          <a class="viaje-titulo" href="index.php?v=editar&amp;id=<?= urlencode($p['id']) ?>"><?= h($p['titulo']) ?></a>
          <div class="viaje-meta">
            <?php if (!$p['activo']): ?><span class="pildora oculta">Oculto</span><?php endif; ?>
            <?php if ($vencido && $p['activo']): ?><span class="pildora vencida">Ya salió</span><?php endif; ?>
            <?php if ($sin_publicar): ?><span class="pildora sin-publicar">Sin publicar</span><?php endif; ?>
            <span><?= h(ucwords(str_replace('-', ' ', $p['destino'] ?: 'sin destino'))) ?></span>
            <span><?= (int) $p['duracion_dias'] ?>d<?= (int) $p['duracion_noches'] ? '/' . (int) $p['duracion_noches'] . 'n' : '' ?></span>
          </div>
        </div>

        <div class="viaje-fecha <?= $vencido ? 'vencida' : '' ?>">
          <?= h(date('d/m/Y', $t)) ?>
          <small><?= h(pt_cuando($p['proxima_salida'])) ?></small>
        </div>

        <div class="viaje-precio">
          $<?= number_format((int) $p['precio_base'], 0, ',', '.') ?>
          <small>+ <?= number_format((int) $p['gastos_admin'], 0, ',', '.') ?> adm.</small>
        </div>

        <div class="viaje-acciones">
          <a class="boton boton-ch" href="index.php?v=editar&amp;id=<?= urlencode($p['id']) ?>">Editar</a>
          <form method="post" action="acciones.php" class="enlinea">
            <?= pt_csrf_campo() ?>
            <input type="hidden" name="accion" value="activar">
            <input type="hidden" name="id" value="<?= h($p['id']) ?>">
            <button class="icono-boton" title="<?= $p['activo'] ? 'Ocultar de la web' : 'Mostrar en la web' ?>"
                    aria-label="<?= $p['activo'] ? 'Ocultar de la web' : 'Mostrar en la web' ?>">
              <?php if ($p['activo']): ?>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.2A9.6 9.6 0 0 1 12 5c5 0 9 4.5 9 7a11 11 0 0 1-2.2 3.3M6.3 7.3C4 8.8 3 11 3 12c0 2.5 4 7 9 7a9.3 9.3 0 0 0 3.6-.7"/></svg>
              <?php else: ?>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="2.6"/></svg>
              <?php endif; ?>
            </button>
          </form>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="barra-lote" id="barra-lote" hidden>
    <span class="barra-lote-cuenta"><span id="cuenta-lote">0</span> elegidos</span>
    <button class="boton boton-ch" data-lote="ocultar">Ocultar de la web</button>
    <button class="boton boton-ch" data-lote="mostrar">Mostrar en la web</button>
    <button class="boton boton-ch boton-peligro" data-lote="borrar">Borrar</button>
    <button class="boton boton-ch boton-sutil" id="cancelar-lote" style="color:#fff">Cancelar</button>
  </div>

  <form method="post" action="acciones.php" id="form-lote" hidden>
    <?= pt_csrf_campo() ?>
    <input type="hidden" name="accion" value="lote">
    <input type="hidden" name="operacion" id="operacion-lote" value="">
  </form>
<?php endif; ?>
