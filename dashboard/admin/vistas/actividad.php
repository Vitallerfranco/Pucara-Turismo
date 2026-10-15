<?php
/** Historial de lo que hizo cada usuario */
$filas = pt_db()->query('SELECT * FROM pt_actividad ORDER BY id DESC LIMIT 200')->fetchAll();

$nombres = [
  'crear' => 'Cargó un viaje', 'editar' => 'Editó un viaje', 'borrar' => 'Borró un viaje',
  'ocultar' => 'Ocultó un viaje', 'mostrar' => 'Volvió a mostrar un viaje', 'duplicar' => 'Duplicó un viaje',
  'publicar' => 'Publicó el sitio', 'publicar_error' => 'Intentó publicar y falló',
  'ocultar_vencidos' => 'Ocultó los vencidos', 'ocultar_lote' => 'Ocultó varios viajes',
  'mostrar_lote' => 'Mostró varios viajes', 'borrar_lote' => 'Borró varios viajes',
  'politicas' => 'Cambió las políticas', 'login' => 'Entró al panel', 'logout' => 'Cerró sesión',
  'clave' => 'Cambió su contraseña', 'usuario_nuevo' => 'Creó un usuario', 'usuario_borrar' => 'Borró un usuario',
];

$titulo = 'Historial';
$subtitulo = 'Las últimas 200 acciones en el panel';
?>
<?php if (!$filas): ?>
  <div class="tarjeta">
    <div class="vacio">
      <div class="vacio-icono">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
      </div>
      <h3>Todavía no hay movimientos</h3>
      <p>Acá queda registrado quién cargó, editó o borró cada viaje, y cuándo.</p>
    </div>
  </div>
<?php else: ?>
  <div class="tarjeta" style="overflow:hidden">
    <table class="tabla">
      <thead>
        <tr><th>Cuándo</th><th>Quién</th><th>Qué hizo</th><th>Viaje</th></tr>
      </thead>
      <tbody>
        <?php foreach ($filas as $a): ?>
          <tr>
            <td style="white-space:nowrap;color:var(--tinta-2)"><?= h(date('d/m/Y H:i', strtotime($a['created_at']))) ?></td>
            <td><?= h(explode('@', $a['email'])[0] ?: '—') ?></td>
            <td><?= h($nombres[$a['accion']] ?? $a['accion']) ?></td>
            <td style="color:var(--tinta-2)"><?= h($a['detalle'] ?: $a['paquete_id'] ?: '—') ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
<?php endif; ?>
