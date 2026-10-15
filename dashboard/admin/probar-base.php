<?php
/**
 * Pucara Turismo - Diagnostico de conexion a MySQL (TEMPORAL)
 * Muestra el error exacto que devuelve la base, sin mostrar la contrasena.
 * BORRAR ESTE ARCHIVO cuando termines.
 */
header('Content-Type: text/html; charset=utf-8');

$ruta = __DIR__ . '/config.php';
if (!file_exists($ruta)) {
    exit('<h2>No existe admin/config.php</h2>');
}
$cfg = require $ruta;
$c = $cfg['db'];

$clave = (string) $c['clave'];
$riesgosos = [];
foreach (["'" => "comilla simple", '\\' => 'barra invertida', '"' => 'comilla doble'] as $ch => $nombre) {
    if (strpos($clave, $ch) !== false) $riesgosos[] = $nombre;
}
?>
<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Diagnóstico de base</title>
<style>
body{font-family:system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;line-height:1.6}
table{border-collapse:collapse;width:100%;margin:1rem 0}
td{border-bottom:1px solid #ddd;padding:.5rem}
td:first-child{color:#666;width:45%}
.ok{color:#15803d;font-weight:600}.mal{color:#b91c1c;font-weight:600}
pre{background:#f4f4f4;padding:1rem;border-radius:8px;overflow:auto;white-space:pre-wrap}
.caja{background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:1rem;margin:1rem 0}
</style></head><body>
<h1>Diagnóstico de conexión</h1>

<h2>Lo que dice tu config.php</h2>
<table>
<tr><td>Host</td><td><code><?= htmlspecialchars($c['host']) ?></code></td></tr>
<tr><td>Nombre de la base</td><td><code><?= htmlspecialchars($c['nombre']) ?></code></td></tr>
<tr><td>Usuario</td><td><code><?= htmlspecialchars($c['usuario']) ?></code></td></tr>
<tr><td>Contraseña</td><td><?= strlen($clave) ?> caracteres
  <?= $clave === 'PEGAR_CONTRASENA_DE_FEROZO' ? '<span class="mal">— ¡todavía es el texto de ejemplo!</span>' : '' ?>
  <?= $riesgosos ? '<span class="mal">— contiene ' . implode(' y ', $riesgosos) . ', puede romper el archivo</span>' : '' ?>
</td></tr>
<tr><td>Extensión pdo_mysql</td><td><?= extension_loaded('pdo_mysql')
  ? '<span class="ok">disponible</span>' : '<span class="mal">NO disponible</span>' ?></td></tr>
</table>

<h2>Resultado de la conexión</h2>
<?php
$dsn = "mysql:host={$c['host']};dbname={$c['nombre']};charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $c['usuario'], $c['clave'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo '<p class="ok">CONECTA CORRECTAMENTE.</p>';
    $t = $pdo->query("SHOW TABLES LIKE 'pt_%'")->fetchAll(PDO::FETCH_COLUMN);
    echo '<p>Tablas del panel encontradas: <strong>' . count($t) . '</strong> '
       . ($t ? '(' . htmlspecialchars(implode(', ', $t)) . ')' : '— falta importar sql/01-schema.sql') . '</p>';
    echo '<p><a href="instalar.php">Ir al instalador</a></p>';
} catch (PDOException $e) {
    $msg = $e->getMessage();
    echo '<p class="mal">NO CONECTA.</p><pre>' . htmlspecialchars($msg) . '</pre>';

    echo '<div class="caja"><strong>Qué significa:</strong><br>';
    if (stripos($msg, 'Unknown database') !== false) {
        echo 'El <strong>nombre de la base</strong> está mal escrito o no existe.
              Fijate el nombre exacto en Ferozo → Bases de datos (incluye el prefijo <code>c2880065_</code>).';
    } elseif (stripos($msg, 'Access denied') !== false) {
        echo 'El <strong>usuario o la contraseña</strong> no coinciden, o ese usuario
              <strong>no está asignado</strong> a esa base. En Ferozo → Bases de datos → botón
              <em>Usuarios</em> de esa base, verificá que el usuario figure asignado con todos los permisos.
              Si dudás de la contraseña, cambiala desde Ferozo y pegá la nueva en config.php.';
    } elseif (stripos($msg, 'Connection refused') !== false || stripos($msg, 'No such file') !== false
           || stripos($msg, 'getaddrinfo') !== false || stripos($msg, 'Unknown MySQL server host') !== false) {
        echo 'El <strong>host</strong> no es el correcto. Probá con <code>localhost</code>, y si no,
              fijate qué host te indica Ferozo en la sección de bases de datos.';
    } else {
        echo 'Error no habitual: copiame el texto de arriba tal cual.';
    }
    echo '</div>';
}
?>
<p style="color:#b91c1c"><strong>Acordate de borrar este archivo</strong> (<code>admin/probar-base.php</code>) cuando termines.</p>
</body></html>
