<?php
/**
 * Pucara Turismo - Procesa los formularios del dashboard y vuelve a index.php
 * Todo lo que escribe en la base pasa por aca.
 */
require __DIR__ . '/lib.php';
pt_sesion_iniciar();

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

/** Vuelve al dashboard con un mensaje */
function volver($a, $tipo = 'ok', $texto = '')
{
    if ($texto !== '') pt_flash($tipo, $texto);
    header('Location: index.php' . ($a ? '?' . $a : ''));
    exit;
}

/** Convierte un textarea (una cosa por linea) en array limpio */
function lineas($texto)
{
    $t = str_replace("\r\n", "\n", (string) $texto);
    $out = [];
    foreach (explode("\n", $t) as $l) {
        $l = trim($l);
        if ($l !== '') $out[] = $l;
    }
    return $out;
}

/** Convierte "uno, dos, tres" en array */
function comas($texto)
{
    $out = [];
    foreach (explode(',', (string) $texto) as $l) {
        $l = trim($l);
        if ($l !== '') $out[] = $l;
    }
    return $out;
}

// ===========================================================================
//  LOGIN / LOGOUT  (no requieren sesion previa)
// ===========================================================================
if ($accion === 'login') {
    pt_csrf_verificar();
    $error = pt_login($_POST['email'] ?? '', $_POST['clave'] ?? '');
    if ($error !== null) {
        pt_flash('error', $error);
        volver('v=login');
    }
    volver('');
}

if ($accion === 'logout') {
    pt_csrf_verificar();
    pt_logout();
    volver('v=login', 'ok', 'Sesion cerrada.');
}

// ===========================================================================
//  A partir de aca, todo exige estar logueado
// ===========================================================================
pt_exigir_login();
pt_csrf_verificar();

// ---------------------------------------------------------------------------
//  Guardar viaje (nuevo o edicion)
// ---------------------------------------------------------------------------
if ($accion === 'guardar') {
    $id       = trim($_POST['id'] ?? '');
    $es_nuevo = ($id === '');
    $titulo   = trim($_POST['titulo'] ?? '');
    $salida   = trim($_POST['proxima_salida'] ?? '');
    $precio   = (int) ($_POST['precio_base'] ?? 0);

    // --- Validaciones minimas ---------------------------------------------
    $errores = [];
    if ($titulo === '')                                   $errores[] = 'Falta el titulo del viaje.';
    if ($salida === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $salida)) $errores[] = 'Falta la fecha de salida.';
    if ($precio <= 0)                                     $errores[] = 'El precio tiene que ser mayor a cero.';

    if ($errores) {
        $_SESSION['pt_form'] = $_POST;   // para no perder lo escrito
        volver($es_nuevo ? 'v=nuevo' : 'v=editar&id=' . urlencode($id), 'error', implode(' ', $errores));
    }

    // --- Fotos -------------------------------------------------------------
    // 1) las que ya estaban y no se marcaron para quitar
    $quitar   = $_POST['quitar_foto'] ?? [];
    $imagenes = [];
    foreach (($_POST['imagenes_actuales'] ?? []) as $url) {
        $url = trim((string) $url);
        if ($url === '' || in_array($url, $quitar, true)) continue;
        $imagenes[] = $url;
    }
    // 2) rutas escritas a mano (fotos que ya estan en el hosting)
    foreach (lineas($_POST['imagenes_manuales'] ?? '') as $url) {
        $imagenes[] = $url;
    }
    // 3) las nuevas que se suben en este guardado
    $avisos = [];
    if (!empty($_FILES['fotos']['name'][0])) {
        $total = count($_FILES['fotos']['name']);
        for ($i = 0; $i < $total; $i++) {
            if (($_FILES['fotos']['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) continue;
            $uno = [
                'name'     => $_FILES['fotos']['name'][$i],
                'type'     => $_FILES['fotos']['type'][$i],
                'tmp_name' => $_FILES['fotos']['tmp_name'][$i],
                'error'    => $_FILES['fotos']['error'][$i],
                'size'     => $_FILES['fotos']['size'][$i],
            ];
            $r = pt_guardar_imagen($uno);
            if ($r['ok']) {
                $imagenes[] = $r['url'];
            } else {
                $avisos[] = $_FILES['fotos']['name'][$i] . ': ' . $r['error'];
            }
        }
    }
    $imagenes = array_values(array_unique($imagenes));

    // Foto de portada: la elegida, o la primera disponible
    $principal = trim($_POST['imagen_principal'] ?? '');
    if ($principal === '' || !in_array($principal, $imagenes, true)) {
        $principal = $imagenes[0] ?? '';
    }

    // --- Slug --------------------------------------------------------------
    $slug_pedido = trim($_POST['slug'] ?? '');
    $slug = pt_slug_libre($slug_pedido !== '' ? $slug_pedido : $titulo, $es_nuevo ? null : $id);

    // --- Datos -------------------------------------------------------------
    $campos = [
        'slug'               => $slug,
        'titulo'             => $titulo,
        'tipo'               => in_array($_POST['tipo'] ?? '', ['full_day','escapada','viaje_completo'], true)
                                  ? $_POST['tipo'] : 'full_day',
        'destino'            => pt_slug($_POST['destino'] ?? ''),
        'duracion_dias'      => max(1, (int) ($_POST['duracion_dias'] ?? 1)),
        'duracion_noches'    => max(0, (int) ($_POST['duracion_noches'] ?? 0)),
        'precio_base'        => $precio,
        'gastos_admin'       => max(0, (int) ($_POST['gastos_admin'] ?? 10000)),
        'suplemento_single'  => max(0, (int) ($_POST['suplemento_single'] ?? 0)),
        'coche_cama_extra'   => max(0, (int) ($_POST['coche_cama_extra'] ?? 10000)),
        'descripcion_corta'  => trim($_POST['descripcion_corta'] ?? ''),
        'descripcion_larga'  => trim($_POST['descripcion_larga'] ?? ''),
        'incluye'            => json_encode(lineas($_POST['incluye'] ?? ''), JSON_UNESCAPED_UNICODE),
        'no_incluye'         => json_encode(lineas($_POST['no_incluye'] ?? ''), JSON_UNESCAPED_UNICODE),
        'imagen_principal'   => $principal,
        'imagenes'           => json_encode($imagenes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'rating'             => min(5, max(0, (float) ($_POST['rating'] ?? 4.8))),
        'reviews'            => max(0, (int) ($_POST['reviews'] ?? 0)),
        'cupos_por_salida'   => max(0, (int) ($_POST['cupos_por_salida'] ?? 30)),
        'proxima_salida'     => $salida,
        'frecuencia_salidas' => in_array($_POST['frecuencia_salidas'] ?? '', ['semanal','quincenal','mensual'], true)
                                  ? $_POST['frecuencia_salidas'] : 'mensual',
        'tags'               => json_encode(comas($_POST['tags'] ?? ''), JSON_UNESCAPED_UNICODE),
        'itinerario'         => json_encode(lineas($_POST['itinerario'] ?? ''), JSON_UNESCAPED_UNICODE),
        'puntos_de_subida'   => json_encode(array_values(array_filter(
                                  (array) ($_POST['puntos_de_subida'] ?? []),
                                  function ($p) { return trim((string) $p) !== ''; }
                                )), JSON_UNESCAPED_UNICODE),
        'politicas'          => json_encode([
                                  'precioEnBaseDoble'  => trim($_POST['pol_base_doble'] ?? ''),
                                  'suplementoSingle'   => trim($_POST['pol_single'] ?? ''),
                                  'menoresCuatroAnios' => trim($_POST['pol_menores'] ?? ''),
                                  'cocheCama'          => trim($_POST['pol_coche_cama'] ?? ''),
                                ], JSON_UNESCAPED_UNICODE),
        'activo'             => !empty($_POST['activo']) ? 1 : 0,
    ];

    try {
        if ($es_nuevo) {
            $id = pt_proximo_id();
            $cols = array_keys($campos);
            $sql  = 'INSERT INTO pt_paquetes (id, ' . implode(', ', $cols) . ') VALUES (?, '
                  . implode(', ', array_fill(0, count($cols), '?')) . ')';
            $st = pt_db()->prepare($sql);
            $st->execute(array_merge([$id], array_values($campos)));
            pt_log('crear', $id, $titulo);
            $msg = 'Listo, ya quedó cargado: ' . $titulo;
        } else {
            $sets = implode(', ', array_map(function ($c) { return "$c = ?"; }, array_keys($campos)));
            $st = pt_db()->prepare("UPDATE pt_paquetes SET $sets WHERE id = ?");
            $st->execute(array_merge(array_values($campos), [$id]));
            pt_log('editar', $id, $titulo);
            $msg = 'Cambios guardados.';
        }
    } catch (PDOException $e) {
        error_log('Pucara guardar: ' . $e->getMessage());
        $_SESSION['pt_form'] = $_POST;
        volver($es_nuevo ? 'v=nuevo' : 'v=editar&id=' . urlencode($id), 'error',
            'No se pudo guardar en la base. Revisa que el enlace (slug) no este repetido.');
    }

    // Las fotos que se quitaron: si ningun otro viaje las usa, se borran del disco
    foreach ($quitar as $url) {
        pt_borrar_imagen_si_libre((string) $url);
    }

    unset($_SESSION['pt_form']);
    if ($avisos) $msg .= ' | Fotos que no se pudieron subir: ' . implode(' / ', $avisos);
    // Al crear vas a la lista para verlo en contexto; al editar te quedás en el viaje
    volver($es_nuevo ? 'v=viajes' : 'v=editar&id=' . urlencode($id),
           $avisos ? 'aviso' : 'ok', $msg);
}

// ---------------------------------------------------------------------------
//  Borrar viaje
// ---------------------------------------------------------------------------
if ($accion === 'borrar') {
    $id = trim($_POST['id'] ?? '');
    $p  = pt_paquete($id);
    if (!$p) volver('', 'error', 'Ese viaje ya no existe.');

    $st = pt_db()->prepare('DELETE FROM pt_paquetes WHERE id = ?');
    $st->execute([$id]);

    // Recien ahora borra las fotos del disco, y solo las que no use otro viaje
    // (los viajes duplicados comparten fotos con el original)
    foreach (pt_json_array($p['imagenes']) as $url) {
        pt_borrar_imagen_si_libre($url);
    }
    pt_log('borrar', $id, $p['titulo']);
    volver('', 'ok', 'Viaje borrado: ' . $p['titulo']);
}

// ---------------------------------------------------------------------------
//  Mostrar / ocultar viaje en la web (sin borrarlo)
// ---------------------------------------------------------------------------
if ($accion === 'activar') {
    $id = trim($_POST['id'] ?? '');
    $p  = pt_paquete($id);
    if (!$p) volver('', 'error', 'Ese viaje ya no existe.');
    $nuevo = $p['activo'] ? 0 : 1;
    $st = pt_db()->prepare('UPDATE pt_paquetes SET activo = ? WHERE id = ?');
    $st->execute([$nuevo, $id]);
    pt_log($nuevo ? 'mostrar' : 'ocultar', $id, $p['titulo']);
    volver('', 'ok', $nuevo
        ? 'El viaje vuelve a mostrarse en la web.'
        : 'El viaje queda oculto en la web (no se borro).');
}

// ---------------------------------------------------------------------------
//  Duplicar viaje (util: mismo destino, otra fecha)
// ---------------------------------------------------------------------------
if ($accion === 'duplicar') {
    $id = trim($_POST['id'] ?? '');
    $p  = pt_paquete($id);
    if (!$p) volver('', 'error', 'Ese viaje ya no existe.');

    $nuevo_id = pt_proximo_id();
    $fecha  = trim($_POST['nueva_fecha'] ?? '');
    $titulo = trim($_POST['nuevo_titulo'] ?? '');

    $p['id'] = $nuevo_id;
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        $p['proxima_salida'] = $fecha;
    }
    $p['titulo'] = $titulo !== '' ? $titulo : $p['titulo'] . ' (copia)';
    // El slug sale del titulo nuevo, asi la copia tiene su propia direccion
    $p['slug']   = pt_slug_libre($p['titulo']);
    $p['activo'] = 0; // la copia nace oculta hasta que la revises
    unset($p['created_at'], $p['updated_at']);

    $cols = array_keys($p);
    $sql = 'INSERT INTO pt_paquetes (' . implode(', ', $cols) . ') VALUES ('
         . implode(', ', array_fill(0, count($cols), '?')) . ')';
    $st = pt_db()->prepare($sql);
    $st->execute(array_values($p));
    pt_log('duplicar', $nuevo_id, 'copia de ' . $id);
    volver('v=editar&id=' . urlencode($nuevo_id), 'ok',
        'Copia creada, por ahora oculta. Revisala y marcala como visible cuando este lista.');
}

// ---------------------------------------------------------------------------
//  Publicar el sitio (dispara la compilacion en GitHub Actions)
// ---------------------------------------------------------------------------
if ($accion === 'publicar') {
    $error = pt_publicar_sitio();
    if ($error !== null) {
        pt_log('publicar_error', '', substr($error, 0, 200));
        volver('', 'error', $error);
    }
    pt_log('publicar', '', 'publicacion disparada');
    volver('', 'ok', 'Publicacion iniciada. En un par de minutos el sitio queda actualizado.');
}

// ---------------------------------------------------------------------------
//  Acciones sobre varios viajes a la vez
// ---------------------------------------------------------------------------
if ($accion === 'lote') {
    $ids = (array) ($_POST['ids'] ?? []);
    $ids = array_values(array_filter(array_map('strval', $ids), function ($v) { return $v !== ''; }));
    $op  = $_POST['operacion'] ?? '';

    if (!$ids) volver('v=viajes', 'aviso', 'No elegiste ningún viaje.');
    if (count($ids) > 200) volver('v=viajes', 'error', 'Son demasiados viajes de una vez.');

    $marcas = implode(',', array_fill(0, count($ids), '?'));
    $n = count($ids);

    if ($op === 'ocultar' || $op === 'mostrar') {
        $valor = $op === 'mostrar' ? 1 : 0;
        $st = pt_db()->prepare("UPDATE pt_paquetes SET activo = ? WHERE id IN ($marcas)");
        $st->execute(array_merge([$valor], $ids));
        pt_log($op . '_lote', '', $n . ' viajes');
        $msg = $op === 'mostrar'
            ? $n . ($n === 1 ? ' viaje vuelve' : ' viajes vuelven') . ' a verse en la web.'
            : $n . ($n === 1 ? ' viaje oculto' : ' viajes ocultos') . '. Siguen guardados acá.';
        volver('v=viajes', 'ok', $msg);
    }

    if ($op === 'borrar') {
        // Primero junta las fotos, despues borra, despues limpia el disco
        $st = pt_db()->prepare("SELECT imagenes FROM pt_paquetes WHERE id IN ($marcas)");
        $st->execute($ids);
        $fotos = [];
        foreach ($st->fetchAll() as $fila) {
            foreach (pt_json_array($fila['imagenes']) as $url) $fotos[] = $url;
        }

        $st = pt_db()->prepare("DELETE FROM pt_paquetes WHERE id IN ($marcas)");
        $st->execute($ids);

        foreach (array_unique($fotos) as $url) pt_borrar_imagen_si_libre($url);

        pt_log('borrar_lote', '', $n . ' viajes');
        volver('v=viajes', 'ok', $n . ($n === 1 ? ' viaje borrado.' : ' viajes borrados.'));
    }

    volver('v=viajes', 'error', 'Esa acción no existe.');
}

// ---------------------------------------------------------------------------
//  Ocultar de una todos los viajes cuya fecha ya paso
// ---------------------------------------------------------------------------
if ($accion === 'ocultar_vencidos') {
    $st = pt_db()->prepare(
        'UPDATE pt_paquetes SET activo = 0 WHERE proxima_salida < ? AND activo = 1'
    );
    $st->execute([date('Y-m-d')]);
    $n = $st->rowCount();
    pt_log('ocultar_vencidos', '', $n . ' viajes');
    $msg = $n
        ? $n . ($n === 1 ? ' viaje vencido quedó oculto' : ' viajes vencidos quedaron ocultos')
          . '. Acordate de publicar para que salgan de la web.'
        : 'No hay viajes vencidos a la vista.';
    volver('', $n ? 'ok' : 'aviso', $msg);
}

// ---------------------------------------------------------------------------
//  Politicas globales del sitio
// ---------------------------------------------------------------------------
if ($accion === 'politicas') {
    $valores = $_POST['politica'] ?? [];
    $st = pt_db()->prepare(
        'INSERT INTO pt_politicas (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)'
    );
    foreach ($valores as $clave => $valor) {
        $clave = preg_replace('/[^A-Za-z0-9_]/', '', (string) $clave);
        if ($clave === '') continue;
        $st->execute([$clave, trim((string) $valor)]);
    }
    pt_log('politicas', '', 'actualizadas');
    volver('v=politicas', 'ok', 'Politicas actualizadas.');
}

// ---------------------------------------------------------------------------
//  Cambiar mi contrasena
// ---------------------------------------------------------------------------
if ($accion === 'clave') {
    $actual = $_POST['clave_actual'] ?? '';
    $nueva  = $_POST['clave_nueva'] ?? '';
    $rep    = $_POST['clave_repetir'] ?? '';

    $st = pt_db()->prepare('SELECT password_hash FROM pt_usuarios WHERE id = ?');
    $st->execute([pt_usuario()['id']]);
    $u = $st->fetch();

    if (!$u || !password_verify($actual, $u['password_hash'])) {
        volver('v=cuenta', 'error', 'La contrasena actual no es correcta.');
    }
    if (strlen($nueva) < 10) {
        volver('v=cuenta', 'error', 'La contrasena nueva tiene que tener al menos 10 caracteres.');
    }
    if ($nueva !== $rep) {
        volver('v=cuenta', 'error', 'Las dos contrasenas nuevas no coinciden.');
    }
    $up = pt_db()->prepare('UPDATE pt_usuarios SET password_hash = ? WHERE id = ?');
    $up->execute([password_hash($nueva, PASSWORD_DEFAULT), pt_usuario()['id']]);
    pt_log('clave', '', 'cambio de contrasena');
    volver('v=cuenta', 'ok', 'Contrasena actualizada.');
}

// ---------------------------------------------------------------------------
//  Usuarios (solo rol admin)
// ---------------------------------------------------------------------------
if ($accion === 'usuario_nuevo') {
    if (!pt_es_admin()) volver('v=usuarios', 'error', 'Solo un administrador puede crear usuarios.');
    $email  = trim($_POST['email'] ?? '');
    $nombre = trim($_POST['nombre'] ?? '');
    $clave  = $_POST['clave'] ?? '';
    $rol    = ($_POST['rol'] ?? 'editor') === 'admin' ? 'admin' : 'editor';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) volver('v=usuarios', 'error', 'Ese email no es valido.');
    if (strlen($clave) < 10) volver('v=usuarios', 'error', 'La contrasena tiene que tener al menos 10 caracteres.');

    try {
        $st = pt_db()->prepare(
            'INSERT INTO pt_usuarios (email, nombre, password_hash, rol) VALUES (?, ?, ?, ?)'
        );
        $st->execute([$email, $nombre, password_hash($clave, PASSWORD_DEFAULT), $rol]);
        pt_log('usuario_nuevo', '', $email);
    } catch (PDOException $e) {
        volver('v=usuarios', 'error', 'Ya existe un usuario con ese email.');
    }
    volver('v=usuarios', 'ok', 'Usuario creado: ' . $email);
}

if ($accion === 'usuario_borrar') {
    if (!pt_es_admin()) volver('v=usuarios', 'error', 'Solo un administrador puede borrar usuarios.');
    $uid = (int) ($_POST['uid'] ?? 0);
    if ($uid === (int) pt_usuario()['id']) volver('v=usuarios', 'error', 'No podes borrar tu propio usuario.');
    $st = pt_db()->prepare('DELETE FROM pt_usuarios WHERE id = ?');
    $st->execute([$uid]);
    pt_log('usuario_borrar', '', 'uid ' . $uid);
    volver('v=usuarios', 'ok', 'Usuario borrado.');
}

volver('', 'error', 'Accion desconocida.');
