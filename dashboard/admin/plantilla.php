<?php
/**
 * Pucara Turismo - Estructura de la pagina del panel
 * Espera: $titulo, $subtitulo, $acciones (html), $contenido (html), $vista
 */
if (!function_exists('pt_db')) { http_response_code(404); exit; }

$u = pt_usuario();
$inicial = strtoupper(mb_substr($u['nombre'] ?: $u['email'], 0, 1, 'UTF-8'));
$flash = $GLOBALS['pt_flash_actual'] ?? null;
$pendientes = pt_cambios_sin_publicar();

function pt_menu_item($clave, $texto, $icono, $vista_actual, $marcador = 0, $clase = '')
{
    $activo = $clave === $vista_actual ? 'activo' : '';
    $href = $clave === 'inicio' ? 'index.php' : 'index.php?v=' . $clave;
    echo '<a class="' . $activo . ' ' . $clase . '" href="' . h($href) . '">' . $icono
       . '<span>' . h($texto) . '</span>';
    if ($marcador > 0) echo '<span class="marcador">' . (int) $marcador . '</span>';
    echo '</a>';
}

$ico = [
  'inicio'    => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  'viajes'    => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  'politicas' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  'actividad' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  'usuarios'  => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M21 20v-2a4 4 0 0 0-3-3.87"/></svg>',
  'cuenta'    => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>',
];
?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#ffffff">
<title><?= h($titulo ?? 'Panel') ?> · Pucará Turismo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" href="isotipo.png">
<link rel="stylesheet" href="estilos.css?v=3">
</head>
<body>
<div class="app">

  <aside class="lateral">
    <div class="marca">
      <img class="marca-logo" src="logo.png" alt="Pucará Turismo" width="250" height="125">
    </div>

    <nav class="menu">
      <?php
        pt_menu_item('inicio',    'Inicio',    $ico['inicio'],    $vista);
        pt_menu_item('viajes',    'Viajes',    $ico['viajes'],    $vista, $pendientes);
        pt_menu_item('politicas', 'Políticas', $ico['politicas'], $vista, 0, 'solo-escritorio');
        pt_menu_item('actividad', 'Historial', $ico['actividad'], $vista);
        if (pt_es_admin()) pt_menu_item('usuarios', 'Usuarios', $ico['usuarios'], $vista, 0, 'solo-escritorio');
        echo '<div class="menu-cuenta"></div>';
        pt_menu_item('cuenta', 'Mi cuenta', $ico['cuenta'], $vista);
      ?>
    </nav>

    <div class="pie-lateral">
      <div class="avatar"><?= h($inicial) ?></div>
      <div class="pie-datos">
        <div class="pie-nombre"><?= h($u['nombre'] ?: $u['email']) ?></div>
        <div class="pie-rol"><?= $u['rol'] === 'admin' ? 'Administrador' : 'Editor' ?></div>
      </div>
      <form method="post" action="acciones.php" class="enlinea">
        <?= pt_csrf_campo() ?><input type="hidden" name="accion" value="logout">
        <button class="icono-boton" title="Cerrar sesión" aria-label="Cerrar sesión">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </form>
    </div>
  </aside>

  <main class="principal">
    <header class="encabezado">
      <div class="encabezado-texto">
        <h1><?= h($titulo ?? '') ?></h1>
        <?php if (!empty($subtitulo)): ?><p><?= $subtitulo ?></p><?php endif; ?>
      </div>
      <?php if (!empty($acciones)): ?>
        <div class="encabezado-acciones"><?= $acciones ?></div>
      <?php endif; ?>
    </header>

    <div class="cuerpo">
      <?php if ($flash): ?>
        <div class="aviso flash <?= h($flash['tipo']) ?>">
          <div class="aviso-texto"><?= h($flash['texto']) ?></div>
        </div>
      <?php endif; ?>
      <?= $contenido ?>
    </div>
  </main>
</div>
<script src="app.js?v=3" defer></script>
</body>
</html>
