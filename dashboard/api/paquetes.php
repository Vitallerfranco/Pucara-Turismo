<?php
/**
 * Pucara Turismo - Endpoint publico de paquetes
 *
 * GET  /api/paquetes.php
 *      Devuelve el JSON con la misma forma que src/data/paquetes.json,
 *      con los viajes activos ordenados por fecha de salida.
 *      Lo consume el build de Astro (scripts/sync-paquetes.mjs).
 *
 * POST /api/paquetes.php?marcar_publicado=1  (header X-Pucara-Token)
 *      Marca el sitio como publicado para que el panel deje de avisar
 *      "cambios sin publicar".
 */
require __DIR__ . '/../admin/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, max-age=0');

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ---------------------------------------------------------------------------
//  Marcar como publicado (lo llama el script de build)
// ---------------------------------------------------------------------------
if ($metodo === 'POST' && isset($_GET['marcar_publicado'])) {
    $esperado = (string) pt_config()['token_build'];
    $recibido = (string) ($_SERVER['HTTP_X_PUCARA_TOKEN'] ?? $_GET['token'] ?? '');

    if ($esperado === '' || $esperado === 'CAMBIAME_POR_UNA_CADENA_LARGA_Y_ALEATORIA') {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'El token del build no esta configurado en admin/config.php']);
        exit;
    }
    if (!hash_equals($esperado, $recibido)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Token invalido']);
        exit;
    }

    $ahora = date('Y-m-d H:i:s');
    pt_estado('ultima_publicacion', $ahora);
    echo json_encode(['ok' => true, 'publicado_en' => $ahora], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metodo no permitido']);
    exit;
}

// ---------------------------------------------------------------------------
//  Lectura publica
// ---------------------------------------------------------------------------
try {
    $filas = pt_paquetes(true);
    $paquetes = array_map('pt_paquete_a_json', $filas);

    echo json_encode([
        'politicasGlobales' => pt_politicas(),
        'paquetes'          => $paquetes,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    error_log('Pucara api: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error leyendo los paquetes']);
}
