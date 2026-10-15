/* ==========================================================================
   Pucará Turismo — Panel de viajes
   Todo lo de acá es ayuda, no requisito: si falla el JS, el panel sigue
   funcionando con formularios comunes.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var pesos = function (n) {
    return '$' + (Number(n) || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  };

  /* ---------------------------------------------------------------- filtros
     Los desplegables buscan solos; el texto espera a que apretes Enter.     */
  $$('#filtros [data-envia]').forEach(function (el) {
    el.addEventListener('change', function () { $('#filtros').submit(); });
  });

  /* ------------------------------------------------------- elegir en lote */
  var barra = $('#barra-lote');
  if (barra) {
    var formLote = $('#form-lote');
    var cuenta   = $('#cuenta-lote');
    var todos    = $('#marcar-todos');

    var elegidos = function () { return $$('.marcar-viaje').filter(function (c) { return c.checked; }); };

    var refrescar = function () {
      var n = elegidos().length;
      cuenta.textContent = n;
      barra.hidden = n === 0;
      $$('.marcar-viaje').forEach(function (c) {
        c.closest('.viaje').classList.toggle('elegido', c.checked);
      });
      if (todos) {
        var total = $$('.marcar-viaje').length;
        todos.checked = n > 0 && n === total;
        todos.indeterminate = n > 0 && n < total;
      }
    };

    $$('.marcar-viaje').forEach(function (c) { c.addEventListener('change', refrescar); });

    if (todos) {
      todos.addEventListener('change', function () {
        $$('.marcar-viaje').forEach(function (c) { c.checked = todos.checked; });
        refrescar();
      });
    }

    $('#cancelar-lote').addEventListener('click', function () {
      $$('.marcar-viaje').forEach(function (c) { c.checked = false; });
      refrescar();
    });

    $$('[data-lote]').forEach(function (b) {
      b.addEventListener('click', function () {
        var op = b.getAttribute('data-lote');
        var ids = elegidos().map(function (c) { return c.value; });
        if (!ids.length) return;

        if (op === 'borrar') {
          var aviso = ids.length === 1
            ? 'Se borra 1 viaje y sus fotos. Esto no se puede deshacer.'
            : 'Se borran ' + ids.length + ' viajes y sus fotos. Esto no se puede deshacer.';
          if (!confirm(aviso + '\n\n¿Seguir? Si solo querés sacarlos de la web, usá Ocultar.')) return;
        }

        $('#operacion-lote').value = op;
        $$('input[name="ids[]"]', formLote).forEach(function (i) { i.remove(); });
        ids.forEach(function (id) {
          var i = document.createElement('input');
          i.type = 'hidden'; i.name = 'ids[]'; i.value = id;
          formLote.appendChild(i);
        });
        formLote.submit();
      });
    });

    refrescar();
  }

  /* ------------------------------------------------------------ las fotos */
  var fotos = $('#fotos');
  if (fotos) {
    var marcarPortada = function (caja) {
      $$('[data-foto]', fotos).forEach(function (f) {
        var esta = f === caja;
        f.classList.toggle('portada', esta);
        $('[data-portada]', f).checked = esta;
        var marca = $('[data-marca]', f);
        if (esta && !marca) {
          marca = document.createElement('span');
          marca.className = 'foto-marca';
          marca.setAttribute('data-marca', '');
          marca.textContent = 'Portada';
          f.insertBefore(marca, f.firstChild);
        } else if (!esta && marca) {
          marca.remove();
        }
      });
    };

    fotos.addEventListener('click', function (ev) {
      var caja = ev.target.closest('[data-foto]');
      if (!caja) return;

      var mover = ev.target.closest('[data-mover]');
      if (mover) {
        var dir = Number(mover.getAttribute('data-mover'));
        if (dir < 0 && caja.previousElementSibling) {
          fotos.insertBefore(caja, caja.previousElementSibling);
        } else if (dir > 0 && caja.nextElementSibling) {
          fotos.insertBefore(caja.nextElementSibling, caja);
        }
        return;
      }

      if (ev.target.tagName === 'IMG') marcarPortada(caja);
    });

    fotos.addEventListener('change', function (ev) {
      if (!ev.target.matches('[data-quitar]')) return;
      ev.target.closest('[data-foto]').classList.toggle('quitada', ev.target.checked);
    });

    $$('[data-foto] img', fotos).forEach(function (img) {
      img.style.cursor = 'pointer';
      img.title = 'Usar como portada';
    });
  }

  /* ------------------------------------------------- el precio, en vivo */
  var base = $('#precio_base');
  if (base) {
    var adm    = $('#gastos_admin');
    var single = $('#suplemento_single');

    var calcular = function () {
      var b = Number(base.value) || 0;
      var a = adm ? (Number(adm.value) || 0) : 0;
      var s = single ? (Number(single.value) || 0) : 0;
      $('#pv-base').textContent  = b ? pesos(b) : '—';
      $('#pv-adm').textContent   = a ? pesos(a) : '—';
      $('#pv-total').textContent = (b || a) ? pesos(b + a) : '—';
      $('#pv-single').textContent = s ? pesos(b + a + s) : 'sin suplemento';
    };

    [base, adm, single].forEach(function (el) {
      if (el) el.addEventListener('input', calcular);
    });
    calcular();
  }

  /* --------------------------- fotos que ya no estan en el hosting */
  $$('.miniatura').forEach(function (img) {
    img.addEventListener('error', function () {
      var hueco = document.createElement('div');
      hueco.className = 'miniatura-vacia';
      hueco.title = 'No encontré esta foto en el hosting';
      img.replaceWith(hueco);
    });
  });

  /* ------------------------------------- avisar si te vas con cambios */
  var formViaje = $('#form-viaje');
  if (formViaje) {
    var sucio = false;
    formViaje.addEventListener('input', function () { sucio = true; });
    formViaje.addEventListener('submit', function () { sucio = false; });
    window.addEventListener('beforeunload', function (ev) {
      if (!sucio) return;
      ev.preventDefault();
      ev.returnValue = '';
    });
  }
})();
