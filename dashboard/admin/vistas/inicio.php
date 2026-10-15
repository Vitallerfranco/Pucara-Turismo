<?php
/** Inicio: como esta la cartelera de salidas */
$e = pt_estadisticas();
$agenda = pt_agenda(6);
$reciente = pt_actividad_reciente(7);

$titulo = 'Inicio';
$subtitulo = 'Cómo está la cartelera de salidas hoy';
$acciones = '<a class="boton boton-primario" href="index.php?v=nuevo">Cargar un viaje</a>';
?>

<?php include __DIR__ . '/_publicacion.php'; ?>

<div class="metricas">
  <div class="metrica">
    <div class="metrica-valor"><?= $e['visibles'] ?></div>
    <div class="metrica-nombre">Viajes en la web</div>
    <div class="metrica-nota"><?= $e['ocultos'] ?> ocultos</div>
  </div>
  <div class="metrica destacada">
    <div class="metrica-valor"><?= $e['dias_para_proxima'] === null ? '—' : $e['dias_para_proxima'] ?></div>
    <div class="metrica-nombre"><?= $e['dias_para_proxima'] === 1 ? 'día para la próxima salida' : 'días para la próxima salida' ?></div>
    <div class="metrica-nota"><?= $e['proxima'] ? h(pt_fecha_larga($e['proxima']['proxima_salida'])) : 'No hay salidas cargadas' ?></div>
  </div>
  <div class="metrica <?= $e['vencidos_visibles'] > 0 ? 'alerta' : '' ?>">
    <div class="metrica-valor"><?= $e['vencidos_visibles'] ?></div>
    <div class="metrica-nombre">Vencidos a la vista</div>
    <div class="metrica-nota"><?= $e['vencidos_visibles'] > 0 ? 'Ya pasó la fecha' : 'Todo en orden' ?></div>
  </div>
  <div class="metrica">
    <div class="metrica-valor"><?= $e['sin_publicar'] ?></div>
    <div class="metrica-nombre">Cambios sin publicar</div>
    <div class="metrica-nota"><?= $e['sin_publicar'] > 0 ? 'Esperando la próxima publicación' : 'Nada pendiente' ?></div>
  </div>
</div>

<?php if ($e['vencidos_visibles'] > 0): ?>
<div class="aviso alerta">
  <div class="aviso-texto">
    <strong>Hay <?= $e['vencidos_visibles'] ?> <?= $e['vencidos_visibles'] === 1 ? 'viaje que ya salió' : 'viajes que ya salieron' ?> y siguen publicados</strong>
    <span>Un cliente que entra hoy los ve como disponibles. Ocultalos y publicá: quedan guardados por si repetís la salida.</span>
  </div>
  <form method="post" action="acciones.php" class="enlinea">
    <?= pt_csrf_campo() ?>
    <input type="hidden" name="accion" value="ocultar_vencidos">
    <button class="boton boton-primario">Ocultar <?= $e['vencidos_visibles'] ?> <?= $e['vencidos_visibles'] === 1 ? 'viaje' : 'viajes' ?></button>
  </form>
</div>
<?php endif; ?>

<div class="dos-columnas">
  <section class="tarjeta">
    <div class="tarjeta-cabecera">
      <h2>Próximas salidas</h2>
      <a class="boton boton-sutil boton-ch" href="index.php?v=viajes&amp;estado=proximos">Ver todas</a>
    </div>

    <?php if (!$agenda): ?>
      <div class="vacio">
        <div class="vacio-icono">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
        </div>
        <h3>No hay salidas por delante</h3>
        <p>Cargá el próximo viaje y va a aparecer acá con los días que faltan.</p>
        <a class="boton boton-primario" href="index.php?v=nuevo">Cargar un viaje</a>
      </div>
    <?php else: ?>
      <?php $abrev = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']; ?>
      <div class="agenda">
        <?php foreach ($agenda as $p): $t = strtotime($p['proxima_salida']); ?>
          <div class="agenda-fila">
            <div class="agenda-fecha">
              <div class="agenda-dia"><?= date('j', $t) ?></div>
              <div class="agenda-mes"><?= h($abrev[(int) date('n', $t) - 1]) ?></div>
            </div>
            <div class="agenda-datos">
              <a class="agenda-titulo" href="index.php?v=editar&amp;id=<?= urlencode($p['id']) ?>"><?= h($p['titulo']) ?></a>
              <div class="agenda-meta">
                <span>$<?= number_format((int) $p['precio_base'], 0, ',', '.') ?></span>
                <span><?= (int) $p['cupos_por_salida'] ?> cupos</span>
              </div>
            </div>
            <div class="agenda-cuando"><?= h(pt_cuando($p['proxima_salida'])) ?></div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </section>

  <section class="tarjeta">
    <div class="tarjeta-cabecera"><h2>Últimos movimientos</h2></div>
    <?php if (!$reciente): ?>
      <div class="vacio" style="padding:2rem 1rem">
        <p style="margin:0">Acá vas a ver quién cargó o editó cada viaje.</p>
      </div>
    <?php else: ?>
      <?php
        $nombres = [
          'crear' => 'cargó', 'editar' => 'editó', 'borrar' => 'borró',
          'ocultar' => 'ocultó', 'mostrar' => 'volvió a mostrar', 'duplicar' => 'duplicó',
          'publicar' => 'publicó el sitio', 'publicar_error' => 'intentó publicar',
          'ocultar_vencidos' => 'ocultó los vencidos', 'ocultar_lote' => 'ocultó varios',
          'mostrar_lote' => 'mostró varios', 'borrar_lote' => 'borró varios',
          'politicas' => 'cambió las políticas', 'login' => 'entró', 'logout' => 'salió',
          'clave' => 'cambió su contraseña', 'usuario_nuevo' => 'creó un usuario',
          'usuario_borrar' => 'borró un usuario',
        ];
      ?>
      <div class="registro">
        <?php foreach ($reciente as $a): ?>
          <div class="registro-fila">
            <div class="registro-que">
              <strong><?= h(explode('@', $a['email'])[0] ?: 'alguien') ?></strong>
              <?= h($nombres[$a['accion']] ?? $a['accion']) ?>
              <span class="registro-detalle"><?= h($a['detalle'] ?: $a['paquete_id']) ?></span>
            </div>
            <div class="registro-cuando"><?= h(date('d/m H:i', strtotime($a['created_at']))) ?></div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </section>
</div>
