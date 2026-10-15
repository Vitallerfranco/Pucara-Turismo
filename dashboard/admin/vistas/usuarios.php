<?php
/** Usuarios del panel (solo administradores) */
$usuarios = pt_db()->query('SELECT * FROM pt_usuarios ORDER BY created_at ASC')->fetchAll();
$yo = (int) pt_usuario()['id'];

$titulo = 'Usuarios';
$subtitulo = count($usuarios) . (count($usuarios) === 1 ? ' persona con acceso' : ' personas con acceso');
?>
<div class="dos-columnas">
  <section class="tarjeta" style="overflow:hidden">
    <div class="tarjeta-cabecera"><h2>Quién entra al panel</h2></div>
    <table class="tabla">
      <thead><tr><th>Persona</th><th>Permisos</th><th>Última entrada</th><th></th></tr></thead>
      <tbody>
        <?php foreach ($usuarios as $u): ?>
          <tr>
            <td>
              <strong><?= h($u['nombre'] ?: explode('@', $u['email'])[0]) ?></strong>
              <?php if ((int) $u['id'] === $yo): ?>
                <span class="pildora visible" style="margin-left:.3rem">vos</span>
              <?php endif; ?>
              <div style="color:var(--tinta-3);font-size:.8rem"><?= h($u['email']) ?></div>
            </td>
            <td><?= $u['rol'] === 'admin' ? 'Administrador' : 'Editor' ?></td>
            <td style="color:var(--tinta-2);white-space:nowrap">
              <?= $u['ultimo_acceso'] ? h(date('d/m/Y H:i', strtotime($u['ultimo_acceso']))) : 'Nunca entró' ?>
            </td>
            <td style="text-align:right">
              <?php if ((int) $u['id'] !== $yo): ?>
                <form method="post" action="acciones.php" class="enlinea"
                      onsubmit="return confirm('¿Sacarle el acceso a <?= h(addslashes($u['email'])) ?>?');">
                  <?= pt_csrf_campo() ?>
                  <input type="hidden" name="accion" value="usuario_borrar">
                  <input type="hidden" name="uid" value="<?= (int) $u['id'] ?>">
                  <button class="boton boton-ch boton-peligro">Quitar</button>
                </form>
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </section>

  <section class="tarjeta">
    <div class="tarjeta-cabecera"><h2>Dar acceso a alguien</h2></div>
    <div class="tarjeta-cuerpo">
      <form method="post" action="acciones.php">
        <?= pt_csrf_campo() ?>
        <input type="hidden" name="accion" value="usuario_nuevo">
        <label class="campo">
          <span>Email</span>
          <input type="email" name="email" required placeholder="papa@pucaraturismo.com.ar">
        </label>
        <label class="campo">
          <span>Nombre</span>
          <input type="text" name="nombre" placeholder="Lea">
        </label>
        <label class="campo">
          <span>Contraseña</span>
          <input type="password" name="clave" required minlength="10" autocomplete="new-password">
          <span class="ayuda">Mínimo 10 caracteres. Después la puede cambiar desde Mi cuenta.</span>
        </label>
        <label class="campo">
          <span>Permisos</span>
          <select name="rol">
            <option value="editor">Editor — carga y publica viajes</option>
            <option value="admin">Administrador — además maneja usuarios</option>
          </select>
        </label>
        <button class="boton boton-primario">Crear acceso</button>
      </form>
    </div>
  </section>
</div>
