<?php
/**
 * Pucara Turismo - Panel de viajes
 * Router: resuelve la vista, la renderiza en memoria y la mete en la plantilla.
 */
require __DIR__ . '/lib.php';
pt_sesion_iniciar();

if (!pt_logueado()) {
    $GLOBALS['pt_flash_actual'] = pt_flash(null);
    include __DIR__ . '/vistas/ingreso.php';
    exit;
}

$vistas = ['inicio', 'viajes', 'nuevo', 'editar', 'politicas', 'actividad', 'cuenta', 'usuarios'];
$vista = $_GET['v'] ?? 'inicio';
if (!in_array($vista, $vistas, true)) $vista = 'inicio';
if ($vista === 'usuarios' && !pt_es_admin()) $vista = 'inicio';

$archivo = ($vista === 'nuevo' || $vista === 'editar') ? 'formulario' : $vista;

$GLOBALS['pt_flash_actual'] = pt_flash(null);
$form = $_SESSION['pt_form'] ?? [];
unset($_SESSION['pt_form']);

$editando = null;
if ($vista === 'editar') {
    $editando = pt_paquete($_GET['id'] ?? '');
    if (!$editando) {
        pt_flash('error', 'No encontré ese viaje. Puede que lo hayas borrado.');
        header('Location: index.php?v=viajes');
        exit;
    }
}

$titulo = '';
$subtitulo = '';
$acciones = '';

ob_start();
include __DIR__ . '/vistas/' . $archivo . '.php';
$contenido = ob_get_clean();

include __DIR__ . '/plantilla.php';
