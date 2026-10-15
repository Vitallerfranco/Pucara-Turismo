<?php
/** Pantalla de ingreso (pagina completa, sin menu) */
$flash = $GLOBALS['pt_flash_actual'] ?? null;
?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Entrar · Panel de Pucará Turismo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="estilos.css?v=2">
</head>
<body>
<main class="ingreso">
  <div class="ingreso-caja">
    <div class="ingreso-marca">
      <div class="marca-pico">P</div>
      <div>
        <h1>Pucará Turismo</h1>
        <div class="marca-sub">Panel de viajes</div>
      </div>
    </div>

    <?php if ($flash): ?>
      <div class="aviso flash <?= h($flash['tipo']) ?>" style="margin-bottom:1rem">
        <div class="aviso-texto"><?= h($flash['texto']) ?></div>
      </div>
    <?php endif; ?>

    <div class="tarjeta">
      <div class="tarjeta-cuerpo">
        <form method="post" action="acciones.php">
          <?= pt_csrf_campo() ?>
          <input type="hidden" name="accion" value="login">
          <label class="campo">
            <span>Email</span>
            <input type="email" name="email" required autocomplete="username" autofocus>
          </label>
          <label class="campo">
            <span>Contraseña</span>
            <input type="password" name="clave" required autocomplete="current-password">
          </label>
          <button class="boton boton-primario boton-gr boton-ancho">Entrar</button>
        </form>
      </div>
    </div>
  </div>
</main>
</body>
</html>
