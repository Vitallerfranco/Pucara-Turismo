<?php
/** Tira con el estado de publicacion del sitio. La usan inicio y viajes. */
$pub     = pt_estado_publicacion();
$auto    = pt_publicacion_configurada();
$actions = pt_url_actions();
$ultima  = pt_estado('ultima_publicacion');
$pend    = pt_cambios_sin_publicar();
?>
<div class="publicacion">
  <div class="publicacion-estado">
    <span class="punto <?= $pub['estado'] === 'al_dia' ? 'al-dia' : h($pub['estado']) ?>"></span>
    <div class="publicacion-texto">
      <?php if ($pub['estado'] === 'publicando'): ?>
        <strong>Publicando el sitio</strong>
        <span>Arrancó hace <?= $pub['minutos'] ?> <?= $pub['minutos'] === 1 ? 'minuto' : 'minutos' ?>. Esta página se actualiza sola.</span>
      <?php elseif ($pub['estado'] === 'demorada'): ?>
        <strong>La publicación no terminó</strong>
        <span>Pasaron <?= $pub['minutos'] ?> minutos, así que puede haber fallado<?php
          if ($actions): ?>: <a href="<?= h($actions) ?>" target="_blank" rel="noopener">ver qué pasó</a><?php endif; ?>.</span>
      <?php elseif ($pub['estado'] === 'pendiente'): ?>
        <strong><?= $pend ?> <?= $pend === 1 ? 'cambio sin publicar' : 'cambios sin publicar' ?></strong>
        <span><?= $auto
          ? 'Están guardados acá. Publicá para que se vean en la web.'
          : 'Están guardados acá. Corré npm run build y subí dist/ para que se vean.' ?></span>
      <?php else: ?>
        <strong>La web está al día</strong>
        <span><?= $ultima
          ? 'Última publicación: ' . h(date('d/m/Y \a \l\a\s H:i', strtotime($ultima)))
          : 'Todavía no publicaste desde el panel.' ?></span>
      <?php endif; ?>
    </div>
  </div>

  <div class="linea-acciones">
    <?php if ($auto): ?>
      <?php if ($pub['estado'] === 'publicando'): ?>
        <?php if ($actions): ?>
          <a class="boton boton-ch" href="<?= h($actions) ?>" target="_blank" rel="noopener">Ver progreso</a>
        <?php endif; ?>
      <?php else: ?>
        <form method="post" action="acciones.php" class="enlinea">
          <?= pt_csrf_campo() ?>
          <input type="hidden" name="accion" value="publicar">
          <button class="boton <?= in_array($pub['estado'], ['pendiente','demorada'], true) ? 'boton-primario' : '' ?>">
            <?= $pub['estado'] === 'demorada' ? 'Reintentar' : ($pub['estado'] === 'pendiente' ? 'Publicar ahora' : 'Publicar de nuevo') ?>
          </button>
        </form>
      <?php endif; ?>
    <?php else: ?>
      <code>npm run build</code>
    <?php endif; ?>
  </div>
</div>
<?php if ($pub['estado'] === 'publicando'): ?>
<script>setTimeout(function(){ location.reload(); }, 20000);</script>
<?php endif; ?>
