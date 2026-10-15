<?php
/** Politicas generales del sitio */
$pol = pt_politicas();
$campos = [
  'precioEnBaseDoble'  => ['Precio en base doble', 'Aparece en el listado y como valor por defecto de cada viaje nuevo.'],
  'suplementoSingle'   => ['Suplemento single', 'Qué paga quien no quiere compartir habitación.'],
  'menoresCuatroAnios' => ['Menores de 4 años', 'Cómo viajan los chicos más chicos.'],
  'cocheCama'          => ['Butaca cama', 'Costo de viajar en la parte inferior del micro.'],
  'tipoBus'            => ['Tipo de bus', 'Qué micro se usa y qué servicio tiene a bordo.'],
  'puntosDeSubida'     => ['Puntos de subida', 'Texto general sobre dónde sube la gente.'],
];

$titulo = 'Políticas generales';
$subtitulo = 'Las condiciones que se repiten en todos los viajes';
?>
<form method="post" action="acciones.php" style="max-width:720px">
  <?= pt_csrf_campo() ?>
  <input type="hidden" name="accion" value="politicas">

  <section class="tarjeta">
    <div class="tarjeta-cuerpo">
      <?php foreach ($campos as $clave => $c): ?>
        <label class="campo">
          <span><?= h($c[0]) ?></span>
          <textarea name="politica[<?= h($clave) ?>]" rows="2"><?= h($pol[$clave] ?? '') ?></textarea>
          <span class="ayuda"><?= h($c[1]) ?></span>
        </label>
      <?php endforeach; ?>
    </div>
  </section>

  <div class="linea-acciones" style="margin-top:1.25rem">
    <button class="boton boton-primario">Guardar políticas</button>
    <span class="filtros-resultado">Se ven en la web después de publicar.</span>
  </div>
</form>
