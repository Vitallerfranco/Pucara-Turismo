<?php
/**
 * Pucara Turismo - Librerias compartidas del dashboard
 * Usado por admin/index.php, admin/acciones.php y api/paquetes.php
 * PHP 7.4+
 */

// No se accede directo por navegador
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'lib.php') {
    http_response_code(404);
    exit('No encontrado');
}

// ---------------------------------------------------------------------------
//  Configuracion
// ---------------------------------------------------------------------------
function pt_config()
{
    static $config = null;
    if ($config === null) {
        $ruta = __DIR__ . '/config.php';
        if (!file_exists($ruta)) {
            http_response_code(500);
            exit('Falta admin/config.php. Copia config.example.php y completa los datos de la base.');
        }
        $config = require $ruta;
    }
    return $config;
}

// ---------------------------------------------------------------------------
//  Base de datos
// ---------------------------------------------------------------------------
function pt_db()
{
    static $pdo = null;
    if ($pdo === null) {
        $c = pt_config()['db'];
        $dsn = "mysql:host={$c['host']};dbname={$c['nombre']};charset=utf8mb4";
        try {
            $pdo = new PDO($dsn, $c['usuario'], $c['clave'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            // No mostramos la contrasena ni el detalle al visitante
            error_log('Pucara DB: ' . $e->getMessage());
            http_response_code(500);
            exit('No se pudo conectar a la base de datos. Revisa los datos en admin/config.php.');
        }
    }
    return $pdo;
}

// ---------------------------------------------------------------------------
//  Helpers generales
// ---------------------------------------------------------------------------
/** Escapa para imprimir en HTML */
function h($v)
{
    return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Decodifica una columna TEXT que guarda un array JSON */
function pt_json_array($texto)
{
    if ($texto === null || $texto === '') return [];
    $d = json_decode($texto, true);
    return is_array($d) ? $d : [];
}

/** IP del visitante */
function pt_ip()
{
    return substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
}

/** Convierte un texto en slug url-friendly */
function pt_slug($texto)
{
    $t = (string) $texto;
    // Saca acentos
    $t = strtr($t, [
        'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n',
        'Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ü'=>'u','Ñ'=>'n',
    ]);
    $t = strtolower($t);
    $t = preg_replace('/[^a-z0-9]+/', '-', $t);
    $t = trim($t, '-');
    return $t === '' ? 'viaje' : substr($t, 0, 180);
}

/** Devuelve un slug libre, agregando -2, -3... si ya existe */
function pt_slug_libre($base, $id_actual = null)
{
    $db = pt_db();
    $slug = pt_slug($base);
    $intento = $slug;
    $n = 2;
    while (true) {
        $sql = 'SELECT id FROM pt_paquetes WHERE slug = ?';
        $params = [$intento];
        if ($id_actual !== null && $id_actual !== '') {
            $sql .= ' AND id <> ?';
            $params[] = $id_actual;
        }
        $st = $db->prepare($sql);
        $st->execute($params);
        if (!$st->fetch()) return $intento;
        $intento = $slug . '-' . $n;
        $n++;
        if ($n > 50) return $slug . '-' . substr(md5(uniqid('', true)), 0, 6);
    }
}

/** Proximo id de la serie pkg-NNN */
function pt_proximo_id()
{
    $db = pt_db();
    $max = $db->query(
        "SELECT MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)) AS n FROM pt_paquetes WHERE id LIKE 'pkg-%'"
    )->fetch();
    $n = (int) ($max['n'] ?? 100);
    if ($n < 100) $n = 100;
    return 'pkg-' . ($n + 1);
}

/** Registra una accion en el historial */
function pt_log($accion, $paquete_id = '', $detalle = '')
{
    try {
        $u = pt_usuario();
        $st = pt_db()->prepare(
            'INSERT INTO pt_actividad (usuario_id, email, accion, paquete_id, detalle, ip)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $st->execute([
            $u['id'] ?? null,
            $u['email'] ?? '',
            substr($accion, 0, 40),
            substr($paquete_id, 0, 32),
            substr($detalle, 0, 255),
            pt_ip(),
        ]);
    } catch (Throwable $e) {
        error_log('Pucara log: ' . $e->getMessage());
    }
}

// ---------------------------------------------------------------------------
//  Sesion y autenticacion
// ---------------------------------------------------------------------------
function pt_sesion_iniciar()
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'secure'   => $https,
        'samesite' => 'Lax',
    ]);
    session_name('pucara_admin');
    session_start();
}

/** Usuario logueado, o array vacio */
function pt_usuario()
{
    return $_SESSION['pt_usuario'] ?? [];
}

function pt_logueado()
{
    return !empty($_SESSION['pt_usuario']['id']);
}

function pt_es_admin()
{
    return (pt_usuario()['rol'] ?? '') === 'admin';
}

/** Corta la ejecucion si no hay sesion */
function pt_exigir_login()
{
    if (!pt_logueado()) {
        header('Location: index.php?v=login');
        exit;
    }
}

/** True si la IP esta bloqueada por intentos fallidos */
function pt_login_bloqueado()
{
    $cfg = pt_config();
    $st = pt_db()->prepare(
        'SELECT COUNT(*) AS n FROM pt_login_intentos
         WHERE ip = ? AND exito = 0 AND created_at > (NOW() - INTERVAL ? MINUTE)'
    );
    $st->execute([pt_ip(), (int) $cfg['minutos_bloqueo']]);
    $n = (int) ($st->fetch()['n'] ?? 0);
    return $n >= (int) $cfg['max_intentos'];
}

function pt_login_registrar($email, $exito)
{
    $st = pt_db()->prepare('INSERT INTO pt_login_intentos (ip, email, exito) VALUES (?, ?, ?)');
    $st->execute([pt_ip(), substr($email, 0, 190), $exito ? 1 : 0]);
}

/** Intenta loguear. Devuelve null si ok, o el mensaje de error. */
function pt_login($email, $clave)
{
    $email = trim((string) $email);
    if ($email === '' || $clave === '') return 'Completa el email y la contrasena.';

    if (pt_login_bloqueado()) {
        return 'Demasiados intentos fallidos. Espera unos minutos y volve a probar.';
    }

    $st = pt_db()->prepare('SELECT * FROM pt_usuarios WHERE email = ? AND activo = 1');
    $st->execute([$email]);
    $u = $st->fetch();

    if (!$u || !password_verify($clave, $u['password_hash'])) {
        pt_login_registrar($email, false);
        // Mensaje generico: no revelamos si el email existe
        return 'Email o contrasena incorrectos.';
    }

    pt_login_registrar($email, true);
    session_regenerate_id(true);
    $_SESSION['pt_usuario'] = [
        'id'     => (int) $u['id'],
        'email'  => $u['email'],
        'nombre' => $u['nombre'],
        'rol'    => $u['rol'],
    ];
    $up = pt_db()->prepare('UPDATE pt_usuarios SET ultimo_acceso = NOW() WHERE id = ?');
    $up->execute([(int) $u['id']]);
    pt_log('login');
    return null;
}

function pt_logout()
{
    pt_log('logout');
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        setcookie(session_name(), '', time() - 42000, '/');
    }
    session_destroy();
}

// ---------------------------------------------------------------------------
//  CSRF
// ---------------------------------------------------------------------------
function pt_csrf_token()
{
    if (empty($_SESSION['pt_csrf'])) {
        $_SESSION['pt_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['pt_csrf'];
}

function pt_csrf_campo()
{
    return '<input type="hidden" name="_csrf" value="' . h(pt_csrf_token()) . '">';
}

function pt_csrf_verificar()
{
    $enviado = $_POST['_csrf'] ?? '';
    if (!is_string($enviado) || !hash_equals(pt_csrf_token(), $enviado)) {
        http_response_code(400);
        exit('Token de seguridad invalido. Volve a cargar la pagina e intenta de nuevo.');
    }
}

// ---------------------------------------------------------------------------
//  Mensajes flash entre redirecciones
// ---------------------------------------------------------------------------
function pt_flash($tipo, $texto = null)
{
    if ($texto === null) {
        $f = $_SESSION['pt_flash'] ?? null;
        unset($_SESSION['pt_flash']);
        return $f;
    }
    $_SESSION['pt_flash'] = ['tipo' => $tipo, 'texto' => $texto];
    return null;
}

// ---------------------------------------------------------------------------
//  Paquetes: lectura y conversion al formato del sitio
// ---------------------------------------------------------------------------
/** Convierte una fila de la base al objeto camelCase que consume el sitio */
function pt_paquete_a_json(array $f)
{
    return [
        'id'                => $f['id'],
        'slug'              => $f['slug'],
        'titulo'            => $f['titulo'],
        'tipo'              => $f['tipo'],
        'destino'           => $f['destino'],
        'duracionDias'      => (int) $f['duracion_dias'],
        'duracionNoches'    => (int) $f['duracion_noches'],
        'precioBase'        => (int) $f['precio_base'],
        'gastosAdmin'       => (int) $f['gastos_admin'],
        'suplementoSingle'  => (int) $f['suplemento_single'],
        'cocheCamaExtra'    => (int) $f['coche_cama_extra'],
        'descripcionCorta'  => $f['descripcion_corta'],
        'descripcionLarga'  => $f['descripcion_larga'],
        'incluye'           => pt_json_array($f['incluye']),
        'noIncluye'         => pt_json_array($f['no_incluye']),
        'imagenPrincipal'   => $f['imagen_principal'],
        'imagenes'          => pt_json_array($f['imagenes']),
        'rating'            => (float) $f['rating'],
        'reviews'           => (int) $f['reviews'],
        'cuposPorSalida'    => (int) $f['cupos_por_salida'],
        'proximaSalida'     => $f['proxima_salida'],
        'frecuenciaSalidas' => $f['frecuencia_salidas'],
        'tags'              => pt_json_array($f['tags']),
        'itinerario'        => pt_json_array($f['itinerario']),
        'puntosDeSubida'    => pt_json_array($f['puntos_de_subida']),
        'politicas'         => (function ($p) {
            $d = json_decode($p ?? '', true);
            return is_array($d) ? $d : [];
        })($f['politicas']),
    ];
}

/** Todos los paquetes. $solo_activos para el sitio publico. */
function pt_paquetes($solo_activos = true)
{
    $sql = 'SELECT * FROM pt_paquetes';
    if ($solo_activos) $sql .= ' WHERE activo = 1';
    $sql .= ' ORDER BY proxima_salida ASC, id ASC';
    return pt_db()->query($sql)->fetchAll();
}

function pt_paquete($id)
{
    $st = pt_db()->prepare('SELECT * FROM pt_paquetes WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

/** Politicas globales como array clave => valor */
function pt_politicas()
{
    $filas = pt_db()->query('SELECT clave, valor FROM pt_politicas ORDER BY orden ASC')->fetchAll();
    $out = [];
    foreach ($filas as $f) $out[$f['clave']] = $f['valor'];
    return $out;
}

function pt_estado($clave, $valor = null)
{
    if ($valor === null) {
        $st = pt_db()->prepare('SELECT valor FROM pt_estado WHERE clave = ?');
        $st->execute([$clave]);
        $f = $st->fetch();
        return $f ? $f['valor'] : '';
    }
    $st = pt_db()->prepare(
        'INSERT INTO pt_estado (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)'
    );
    $st->execute([$clave, $valor]);
    return $valor;
}

/** Cuantos viajes se tocaron despues de la ultima publicacion */
function pt_cambios_sin_publicar()
{
    $ultima = pt_estado('ultima_publicacion');
    if ($ultima === '') {
        return (int) pt_db()->query('SELECT COUNT(*) AS n FROM pt_paquetes')->fetch()['n'];
    }
    $st = pt_db()->prepare('SELECT COUNT(*) AS n FROM pt_paquetes WHERE updated_at > ?');
    $st->execute([$ultima]);
    return (int) $st->fetch()['n'];
}

// ---------------------------------------------------------------------------
//  Busqueda, filtros y orden del listado
// ---------------------------------------------------------------------------
/**
 * Devuelve los viajes aplicando los filtros del listado.
 * $f: ['q' => texto, 'estado' => ..., 'destino' => ..., 'mes' => 'YYYY-MM', 'orden' => ...]
 */
function pt_buscar_paquetes(array $f = [])
{
    $hoy = date('Y-m-d');
    $where = [];
    $params = [];

    $q = trim((string) ($f['q'] ?? ''));
    if ($q !== '') {
        $where[] = '(titulo LIKE ? OR destino LIKE ? OR slug LIKE ? OR descripcion_corta LIKE ?)';
        $like = '%' . $q . '%';
        array_push($params, $like, $like, $like, $like);
    }

    switch ($f['estado'] ?? '') {
        case 'visibles':
            $where[] = 'activo = 1';
            break;
        case 'ocultos':
            $where[] = 'activo = 0';
            break;
        case 'vencidos':
            $where[] = 'proxima_salida < ?';
            $params[] = $hoy;
            break;
        case 'proximos':
            $where[] = 'proxima_salida >= ?';
            $params[] = $hoy;
            break;
        case 'vencidos_visibles':  // los que hay que resolver
            $where[] = 'proxima_salida < ? AND activo = 1';
            $params[] = $hoy;
            break;
    }

    $destino = trim((string) ($f['destino'] ?? ''));
    if ($destino !== '') {
        $where[] = 'destino = ?';
        $params[] = $destino;
    }

    $mes = trim((string) ($f['mes'] ?? ''));
    if (preg_match('/^\d{4}-\d{2}$/', $mes)) {
        $where[] = "DATE_FORMAT(proxima_salida, '%Y-%m') = ?";
        $params[] = $mes;
    }

    $ordenes = [
        'fecha_asc'   => 'proxima_salida ASC, id ASC',
        'fecha_desc'  => 'proxima_salida DESC, id DESC',
        'precio_asc'  => 'precio_base ASC',
        'precio_desc' => 'precio_base DESC',
        'titulo'      => 'titulo ASC',
        'nuevos'      => 'created_at DESC',
    ];
    $orden = $ordenes[$f['orden'] ?? ''] ?? $ordenes['fecha_asc'];

    $sql = 'SELECT * FROM pt_paquetes';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY ' . $orden;

    $st = pt_db()->prepare($sql);
    $st->execute($params);
    return $st->fetchAll();
}

/** Destinos cargados, para el filtro */
function pt_destinos()
{
    return pt_db()->query(
        "SELECT destino, COUNT(*) AS n FROM pt_paquetes
         WHERE destino <> '' GROUP BY destino ORDER BY destino"
    )->fetchAll();
}

/** Meses con salidas, para el filtro */
function pt_meses_con_salidas()
{
    return pt_db()->query(
        "SELECT DATE_FORMAT(proxima_salida, '%Y-%m') AS mes, COUNT(*) AS n
         FROM pt_paquetes GROUP BY mes ORDER BY mes ASC"
    )->fetchAll();
}

// ---------------------------------------------------------------------------
//  Numeros para la pantalla de inicio
// ---------------------------------------------------------------------------
function pt_estadisticas()
{
    $hoy = date('Y-m-d');
    $db = pt_db();

    $st = $db->prepare(
        'SELECT
            COUNT(*) AS total,
            SUM(activo = 1) AS visibles,
            SUM(activo = 0) AS ocultos,
            SUM(proxima_salida < ? AND activo = 1) AS vencidos_visibles,
            SUM(proxima_salida >= ?) AS proximos
         FROM pt_paquetes'
    );
    $st->execute([$hoy, $hoy]);
    $e = $st->fetch() ?: [];

    foreach (['total','visibles','ocultos','vencidos_visibles','proximos'] as $k) {
        $e[$k] = (int) ($e[$k] ?? 0);
    }

    // Proxima salida confirmada
    $st = $db->prepare(
        'SELECT titulo, proxima_salida, slug FROM pt_paquetes
         WHERE activo = 1 AND proxima_salida >= ?
         ORDER BY proxima_salida ASC LIMIT 1'
    );
    $st->execute([$hoy]);
    $e['proxima'] = $st->fetch() ?: null;

    $e['dias_para_proxima'] = null;
    if ($e['proxima']) {
        $d = (new DateTime($hoy))->diff(new DateTime($e['proxima']['proxima_salida']));
        $e['dias_para_proxima'] = (int) $d->days;
    }

    $e['sin_publicar'] = pt_cambios_sin_publicar();
    return $e;
}

/** Las proximas N salidas visibles, para la agenda del inicio */
function pt_agenda($limite = 6)
{
    $st = pt_db()->prepare(
        'SELECT id, titulo, slug, proxima_salida, precio_base, cupos_por_salida, imagen_principal
         FROM pt_paquetes
         WHERE activo = 1 AND proxima_salida >= ?
         ORDER BY proxima_salida ASC LIMIT ' . (int) $limite
    );
    $st->execute([date('Y-m-d')]);
    return $st->fetchAll();
}

/** Ultimas acciones, para el inicio */
function pt_actividad_reciente($limite = 6)
{
    return pt_db()->query(
        'SELECT * FROM pt_actividad ORDER BY id DESC LIMIT ' . (int) $limite
    )->fetchAll();
}

// ---------------------------------------------------------------------------
//  Fechas en castellano
// ---------------------------------------------------------------------------
function pt_fecha_larga($fecha)
{
    $meses = [1=>'enero','febrero','marzo','abril','mayo','junio','julio',
              'agosto','septiembre','octubre','noviembre','diciembre'];
    $t = strtotime($fecha);
    if (!$t) return '';
    return date('j', $t) . ' de ' . $meses[(int) date('n', $t)];
}

function pt_mes_largo($ym)
{
    $meses = [1=>'enero','febrero','marzo','abril','mayo','junio','julio',
              'agosto','septiembre','octubre','noviembre','diciembre'];
    [$a, $m] = array_pad(explode('-', $ym), 2, '1');
    $nombre = $meses[(int) $m] ?? $ym;
    return ucfirst($nombre) . ' ' . $a;
}

/** "en 3 dias", "manana", "hoy", "hace 12 dias" */
function pt_cuando($fecha)
{
    $hoy = new DateTime(date('Y-m-d'));
    $d = new DateTime(substr($fecha, 0, 10));
    $dias = (int) $hoy->diff($d)->format('%r%a');
    if ($dias === 0) return 'hoy';
    if ($dias === 1) return 'mañana';
    if ($dias === -1) return 'ayer';
    if ($dias > 1)  return 'en ' . $dias . ' días';
    return 'hace ' . abs($dias) . ' días';
}

// ---------------------------------------------------------------------------
//  Publicacion del sitio (GitHub Actions -> FTP a DonWeb)
// ---------------------------------------------------------------------------
/** ¿Esta configurada la publicacion automatica? */
function pt_publicacion_configurada()
{
    $g = pt_config()['github'] ?? [];
    return !empty($g['owner']) && !empty($g['repo']) && !empty($g['token'])
        && strpos($g['token'], 'PEGAR') === false;
}

/** URL de la pagina de Actions, para que puedas mirar el progreso */
function pt_url_actions()
{
    $g = pt_config()['github'] ?? [];
    if (empty($g['owner']) || empty($g['repo'])) return '';
    return 'https://github.com/' . $g['owner'] . '/' . $g['repo'] . '/actions';
}

/**
 * Le pide a GitHub que compile y suba el sitio.
 * Devuelve null si salio bien, o el mensaje de error.
 */
function pt_publicar_sitio()
{
    if (!pt_publicacion_configurada()) {
        return 'La publicacion automatica no esta configurada en admin/config.php.';
    }
    $g = pt_config()['github'];

    // Evita disparar dos compilaciones seguidas sin querer
    $ultimo = pt_estado('publicacion_pedida');
    if ($ultimo !== '' && (time() - strtotime($ultimo)) < 90) {
        return 'Recien pediste una publicacion. Espera un momento a que termine.';
    }

    $url = 'https://api.github.com/repos/' . rawurlencode($g['owner']) . '/'
         . rawurlencode($g['repo']) . '/dispatches';
    $cuerpo = json_encode(['event_type' => $g['evento'] ?? 'publicar']);
    $cabeceras = [
        'Accept: application/vnd.github+json',
        'Authorization: Bearer ' . $g['token'],
        'X-GitHub-Api-Version: 2022-11-28',
        'Content-Type: application/json',
        'User-Agent: PucaraPanel',
    ];

    $codigo = 0;
    $respuesta = '';

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $cuerpo,
            CURLOPT_HTTPHEADER     => $cabeceras,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
        ]);
        $respuesta = (string) curl_exec($ch);
        $codigo = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $errc = curl_error($ch);
        curl_close($ch);
        if ($codigo === 0) return 'No se pudo contactar a GitHub: ' . $errc;
    } else {
        $ctx = stream_context_create(['http' => [
            'method'        => 'POST',
            'header'        => implode("\r\n", $cabeceras),
            'content'       => $cuerpo,
            'timeout'       => 20,
            'ignore_errors' => true,
        ]]);
        $respuesta = (string) @file_get_contents($url, false, $ctx);
        foreach (($http_response_header ?? []) as $h) {
            if (preg_match('#^HTTP/\S+\s+(\d+)#', $h, $m)) $codigo = (int) $m[1];
        }
        if ($codigo === 0) return 'No se pudo contactar a GitHub.';
    }

    if ($codigo === 204) {
        pt_estado('publicacion_pedida', date('Y-m-d H:i:s'));
        return null;
    }
    if ($codigo === 401) return 'GitHub rechazo el token (401). Revisa que no haya vencido.';
    if ($codigo === 403) return 'GitHub denego el permiso (403). El token necesita permiso de Contents: escritura.';
    if ($codigo === 404) return 'GitHub no encontro el repositorio (404). Revisa owner y repo en config.php, y que el token tenga acceso.';
    if ($codigo === 422) return 'GitHub rechazo el pedido (422). Revisa que el workflow este en la rama principal.';

    $detalle = '';
    $d = json_decode($respuesta, true);
    if (is_array($d) && !empty($d['message'])) $detalle = ' - ' . $d['message'];
    return 'GitHub respondio ' . $codigo . $detalle;
}

/**
 * Estado de la publicacion:
 *  'sin_configurar' | 'publicando' | 'demorada' | 'pendiente' | 'al_dia'
 */
function pt_estado_publicacion()
{
    $pedida = pt_estado('publicacion_pedida');
    $ultima = pt_estado('ultima_publicacion');

    if ($pedida !== '' && ($ultima === '' || $pedida > $ultima)) {
        $minutos = (int) floor((time() - strtotime($pedida)) / 60);
        return [
            'estado'  => $minutos >= 12 ? 'demorada' : 'publicando',
            'minutos' => $minutos,
        ];
    }
    return [
        'estado'  => pt_cambios_sin_publicar() > 0 ? 'pendiente' : 'al_dia',
        'minutos' => 0,
    ];
}

// ---------------------------------------------------------------------------
//  Subida de imagenes
// ---------------------------------------------------------------------------
/**
 * Valida y guarda una imagen subida.
 * Devuelve ['ok' => true, 'url' => '/uploads/paquetes/...'] o ['ok' => false, 'error' => '...']
 */
function pt_guardar_imagen(array $archivo)
{
    $cfg = pt_config();

    if (!isset($archivo['error']) || is_array($archivo['error'])) {
        return ['ok' => false, 'error' => 'Subida invalida.'];
    }
    switch ($archivo['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            return ['ok' => false, 'error' => 'La foto es demasiado pesada.'];
        case UPLOAD_ERR_NO_FILE:
            return ['ok' => false, 'error' => 'No elegiste ninguna foto.'];
        default:
            return ['ok' => false, 'error' => 'No se pudo subir la foto.'];
    }

    $max = ((int) $cfg['max_mb_imagen']) * 1024 * 1024;
    if ($archivo['size'] > $max) {
        return ['ok' => false, 'error' => 'La foto supera los ' . (int) $cfg['max_mb_imagen'] . ' MB.'];
    }

    // Validacion real: tiene que ser una imagen de verdad, no solo la extension
    $info = @getimagesize($archivo['tmp_name']);
    if ($info === false) {
        return ['ok' => false, 'error' => 'El archivo no es una imagen valida.'];
    }
    $permitidos = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG  => 'png',
        IMAGETYPE_WEBP => 'webp',
    ];
    $tipo = $info[2] ?? null;
    if (!isset($permitidos[$tipo])) {
        return ['ok' => false, 'error' => 'Formato no permitido. Usa JPG, PNG o WEBP.'];
    }
    $ext = $permitidos[$tipo];

    $dir = rtrim($cfg['ruta_uploads'], '/');
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
        return ['ok' => false, 'error' => 'No existe la carpeta uploads/paquetes y no se pudo crear.'];
    }
    if (!is_writable($dir)) {
        return ['ok' => false, 'error' => 'La carpeta uploads/paquetes no tiene permisos de escritura.'];
    }

    // Nombre aleatorio: evita sobrescribir y evita nombres maliciosos
    $nombre = date('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $ext;
    $destino = $dir . '/' . $nombre;

    if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
        return ['ok' => false, 'error' => 'No se pudo guardar la foto en el servidor.'];
    }
    @chmod($destino, 0644);

    return ['ok' => true, 'url' => rtrim($cfg['url_uploads'], '/') . '/' . $nombre, 'archivo' => $nombre];
}

/**
 * ¿Hay otro viaje usando esta foto?
 * Importante por los viajes duplicados: comparten las mismas fotos,
 * y borrar la copia no tiene que dejar al original sin imagenes.
 */
function pt_imagen_en_uso($url, $excepto_id = null)
{
    $sql = 'SELECT COUNT(*) AS n FROM pt_paquetes
            WHERE (imagen_principal = ? OR imagenes LIKE ?)';
    $params = [$url, '%"' . str_replace(['%', '_'], ['\\%', '\\_'], $url) . '"%'];
    if ($excepto_id !== null && $excepto_id !== '') {
        $sql .= ' AND id <> ?';
        $params[] = $excepto_id;
    }
    $st = pt_db()->prepare($sql);
    $st->execute($params);
    return ((int) $st->fetch()['n']) > 0;
}

/**
 * Borra una foto del disco, solo si:
 *  - esta dentro de uploads/paquetes (nunca toca las imagenes originales del sitio)
 *  - ningun otro viaje la esta usando
 */
function pt_borrar_imagen_si_libre($url, $excepto_id = null)
{
    if (pt_imagen_en_uso($url, $excepto_id)) return false;
    return pt_borrar_imagen($url);
}

/** Borra una foto subida (solo dentro de uploads/paquetes) */
function pt_borrar_imagen($url)
{
    $cfg = pt_config();
    $base = rtrim($cfg['url_uploads'], '/') . '/';
    if (strpos($url, $base) !== 0) return false; // no toca imagenes del sitio original
    $nombre = basename($url);
    $ruta = rtrim($cfg['ruta_uploads'], '/') . '/' . $nombre;
    if (is_file($ruta)) return @unlink($ruta);
    return false;
}
