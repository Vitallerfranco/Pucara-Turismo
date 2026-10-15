<?php
/**
 * Pucara Turismo - Configuracion del dashboard
 *
 * COPIAR ESTE ARCHIVO COMO config.php Y COMPLETAR CON TUS DATOS.
 * config.php nunca se sube al repositorio (esta en .gitignore).
 */

return [
    // --- Base de datos MySQL de Ferozo -------------------------------------
    // Los datos exactos los ves en el panel de Ferozo > Bases de datos MySQL.
    // En hosting compartido el host casi siempre es 'localhost'.
    'db' => [
        'host'   => 'localhost',
        'nombre' => 'NOMBRE_DE_TU_BASE',
        'usuario'=> 'USUARIO_DE_TU_BASE',
        'clave'  => 'CONTRASENA_DE_TU_BASE',
    ],

    // --- Token para el build ----------------------------------------------
    // Lo usa el script de sync (npm run build) para marcar el sitio como
    // publicado. Inventa una cadena larga y aleatoria y ponela igual en
    // el archivo .env del proyecto Astro (PUCARA_API_TOKEN).
    'token_build' => 'CAMBIAME_POR_UNA_CADENA_LARGA_Y_ALEATORIA',


    // --- Publicacion automatica (boton "Publicar" del panel) ---------------
    // El panel le pide a GitHub Actions que compile el sitio y lo suba por
    // FTP a DonWeb. Como crear el token esta en PUCARA-DASHBOARD.md.
    'github' => [
        'owner'  => 'Vitallerfranco',
        'repo'   => 'Pucara-Turismo',
        'evento' => 'publicar',
        // Token de GitHub con permiso de Contents: escritura
        'token'  => 'PEGAR_EL_TOKEN_DE_GITHUB',
    ],

    // --- Sitio -------------------------------------------------------------
    'sitio_url'   => 'https://pucaraturismo.com.ar',
    // Carpeta publica donde se guardan las fotos subidas (relativa a admin/)
    'ruta_uploads'=> __DIR__ . '/../uploads/paquetes',
    // URL publica de esa misma carpeta
    'url_uploads' => '/uploads/paquetes',

    // --- Seguridad ---------------------------------------------------------
    // Intentos fallidos de login permitidos por IP antes de bloquear
    'max_intentos'      => 8,
    // Minutos que dura el bloqueo
    'minutos_bloqueo'   => 15,
    // Peso maximo por foto, en MB
    'max_mb_imagen'     => 8,
];
