<?php
/** Mi cuenta: datos y cambio de contraseña */
$u = pt_usuario();
$st = pt_db()->prepare('SELECT ultimo_acceso, created_at FROM pt_usuarios WHERE id = ?');
$st->execute([$u['id']]);
$datos = $st->fetch() ?: [];

$titulo = 'Mi cuenta';
$subtitulo = h($u['email']);
?>
<div class="dos-columnas">
  <section class="tarjeta">
    <div class="tarjeta-cabecera"><h2>Cambiar contraseña</h2></div>
    <div class="tarjeta-cuerpo">
      <form method="post" action="acciones.php">
        <?= pt_csrf_campo() ?>
        <input type="hidden" name="accion" value="clave">
        <label class="campo">
          <span>Contraseña actual</span>
          <input type="password" name="clave_actual" required autocomplete="current-password">
        </label>
        <label class="campo">
          <span>Contraseña nueva</span>
          <input type="password" name="clave_nueva" required minlength="10" autocomplete="new-password">
          <span class="ayuda">Mínimo 10 caracteres. Que no sea la que usás en otro lado.</span>
        </label>
        <label class="campo">
          <span>Repetir la nueva</span>
          <input type="password" name="clave_repetir" required minlength="10" autocomplete="new-password">
        </label>
        <button class="boton boton-primario">Cambiar contraseña</button>
      </form>
    </div>
  </section>

  <section class="tarjeta">
    <div class="tarjeta-cabecera"><h2>Tus datos</h2></div>
    <div class="tarjeta-cuerpo">
      <div class="precio-linea"><span>Nombre</span><span><?= h($u['nombre'] ?: '—') ?></span></div>
      <div class="precio-linea"><span>Email</span><span><?= h($u['email']) ?></span></div>
      <div class="precio-linea"><span>Permisos</span><span><?= $u['rol'] === 'admin' ? 'Administrador' : 'Editor' ?></span></div>
      <div class="precio-linea"><span>Última entrada</span><span><?= !empty($datos['ultimo_acceso']) ? h(date('d/m/Y H:i', strtotime($datos['ultimo_acceso']))) : '—' ?></span></div>
      <div class="precio-linea"><span>Cuenta creada</span><span><?= !empty($datos['created_at']) ? h(date('d/m/Y', strtotime($datos['created_at']))) : '—' ?></span></div>
      <p class="ayuda" style="margin-top:1rem">
        <?= $u['rol'] === 'admin'
          ? 'Como administrador podés crear y borrar usuarios desde la sección Usuarios.'
          : 'Como editor podés cargar, editar y publicar viajes. Los usuarios los maneja un administrador.' ?>
      </p>
    </div>
  </section>
</div>
