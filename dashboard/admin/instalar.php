<?php
/**
 * Pucara Turismo - Instalador de un solo uso
 *
 * Sirve para crear el PRIMER usuario del panel sin tener que generar
 * hashes de contrasena a mano en phpMyAdmin.
 *
 * Solo funciona mientras no haya ningun usuario cargado.
 * Cuando termines, BORRA ESTE ARCHIVO del hosting.
 */
require __DIR__ . '/lib.php';
pt_sesion_iniciar();

$mensaje = null;
$tipo = 'error';
$listo = false;

// --- Diagnostico de la instalacion ----------------------------------------
$db_ok = false;
$tablas_ok = false;
$n_paquetes = 0;
$n_usuarios = 0;
$error_db = '';

try {
    pt_db();
    $db_ok = true;
    $t = pt_db()->query("SHOW TABLES LIKE 'pt_%'")->fetchAll();
    $tablas_ok = count($t) >= 6;
    if ($tablas_ok) {
        $n_paquetes = (int) pt_db()->query('SELECT COUNT(*) AS n FROM pt_paquetes')->fetch()['n'];
        $n_usuarios = (int) pt_db()->query('SELECT COUNT(*) AS n FROM pt_usuarios')->fetch()['n'];
    }
} catch (Throwable $e) {
    $error_db = $e->getMessage();
}

// --- Crear el primer usuario ----------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $tablas_ok) {
    pt_csrf_verificar();

    if ($n_usuarios > 0) {
        $mensaje = 'Ya existe un usuario. Por seguridad, borra instalar.php del hosting.';
    } else {
        $email  = trim($_POST['email'] ?? '');
        $nombre = trim($_POST['nombre'] ?? '');
        $clave  = $_POST['clave'] ?? '';
        $rep    = $_POST['clave_repetir'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $mensaje = 'Ese email no es valido.';
        } elseif (strlen($clave) < 10) {
            $mensaje = 'La contrasena tiene que tener al menos 10 caracteres.';
        } elseif ($clave !== $rep) {
            $mensaje = 'Las dos contrasenas no coinciden.';
        } else {
            $st = pt_db()->prepare(
                'INSERT INTO pt_usuarios (email, nombre, password_hash, rol) VALUES (?, ?, ?, ?)'
            );
            $st->execute([$email, $nombre, password_hash($clave, PASSWORD_DEFAULT), 'admin']);
            $listo = true;
            $tipo = 'ok';
            $mensaje = 'Usuario creado. Ya podes entrar al panel.';
            $n_usuarios = 1;
        }
    }
}
?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Instalación · Panel Pucará</title>
<link rel="stylesheet" href="estilos.css">
</head>
<body>
<main class="login">
  <div class="login-caja" style="max-width:520px">
    <h1>Pucará <span>Turismo</span></h1>
    <p class="login-sub">Instalación del panel</p>

    <!-- Diagnostico -->
    <table class="grid" style="margin-bottom:1.25rem">
      <tbody>
        <tr>
          <td>Conexión a la base</td>
          <td><?= $db_ok ? 'OK' : 'FALLA' ?></td>
        </tr>
        <tr>
          <td>Tablas del panel</td>
          <td><?= $tablas_ok ? 'OK' : 'faltan — importá sql/01-schema.sql' ?></td>
        </tr>
        <tr>
          <td>Viajes cargados</td>
          <td><?= $tablas_ok ? $n_paquetes . ($n_paquetes === 0 ? ' — importá sql/02-seed.sql' : '') : '—' ?></td>
        </tr>
        <tr>
          <td>Carpeta de fotos</td>
          <td><?= is_dir(pt_config()['ruta_uploads'])
                    ? (is_writable(pt_config()['ruta_uploads']) ? 'OK, se puede escribir' : 'existe pero sin permiso de escritura (poné 755)')
                    : 'no existe — creá uploads/paquetes' ?></td>
        </tr>
        <tr>
          <td>Versión de PHP</td>
          <td><?= h(PHP_VERSION) ?><?= version_compare(PHP_VERSION, '7.4', '<') ? ' — hace falta 7.4 o más' : '' ?></td>
        </tr>
      </tbody>
    </table>

    <?php if ($error_db): ?>
      <div class="flash error">No se pudo conectar a la base. Revisá los datos en <code>admin/config.php</code>.</div>
    <?php endif; ?>

    <?php if ($mensaje): ?>
      <div class="flash <?= h($tipo) ?>"><?= h($mensaje) ?></div>
    <?php endif; ?>

    <?php if ($listo || ($tablas_ok && $n_usuarios > 0)): ?>
      <div class="flash aviso">
        <strong>Último paso:</strong> borrá el archivo <code>admin/instalar.php</code> del hosting.
        Mientras exista, cualquiera puede ver este diagnóstico.
      </div>
      <a href="index.php" class="btn btn-primario btn-ancho">Entrar al panel</a>

    <?php elseif ($tablas_ok): ?>
      <p class="ayuda">Creá tu usuario administrador. Después podés agregar el de tu papá desde el panel.</p>
      <form method="post">
        <?= pt_csrf_campo() ?>
        <label>Email
          <input type="email" name="email" required value="<?= h($_POST['email'] ?? '') ?>" autofocus>
        </label>
        <label>Nombre
          <input type="text" name="nombre" value="<?= h($_POST['nombre'] ?? '') ?>">
        </label>
        <label>Contraseña
          <input type="password" name="clave" required minlength="10" autocomplete="new-password">
          <small>Mínimo 10 caracteres. Usá una que no uses en otro lado.</small>
        </label>
        <label>Repetir contraseña
          <input type="password" name="clave_repetir" required minlength="10" autocomplete="new-password">
        </label>
        <button class="btn btn-primario btn-ancho">Crear usuario administrador</button>
      </form>

    <?php else: ?>
      <p class="ayuda">
        Completá los pasos de arriba que figuran como faltantes y recargá esta página.
        El detalle está en <code>PUCARA-DASHBOARD.md</code>.
      </p>
    <?php endif; ?>
  </div>
</main>
</body>
</html>
