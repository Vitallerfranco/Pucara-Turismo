/**
 * Genera sql/03-carga-masiva.sql a partir de los viajes de los flyers.
 *
 * Los datos salen de las imagenes que paso Franco (carpeta destinos_pucara).
 * El SQL se importa en phpMyAdmin y usa ON DUPLICATE KEY UPDATE, asi que se
 * puede volver a correr sin duplicar nada.
 */
import { writeFile } from 'node:fs/promises';

/* Las 8 paradas reales, de la imagen "Paradas bus" */
export const PARADAS = [
  'Cruce Varela',
  'Rotonda Los Pinos',
  'Rotonda Lavallol',
  'Rotonda San Justo',
  'Ciudadela (Gral. Paz)',
  'Morón (frente al Plaza Oeste)',
  'Moreno (Axion Ruta 23 y Acceso Oeste)',
  'Tigre — Pacheco (Pdor. El Turista)',
];

export const TEXTO_PARADAS =
  'Contamos con 8 puntos de subida en el Gran Buenos Aires: Cruce Varela, ' +
  'Rotonda Los Pinos, Rotonda Lavallol, Rotonda San Justo, Ciudadela (Gral. Paz), ' +
  'Morón (frente al Plaza Oeste), Moreno (Axion Ruta 23 y Acceso Oeste) y ' +
  'Tigre — Pacheco (Pdor. El Turista). Los lugares de carga pueden sufrir ' +
  'modificaciones para un mejor servicio en el tiempo del recorrido.';

const BUS_SEMI = 'Bus semi cama con servicio a bordo';
const BUS_MIX = 'Bus mix con servicio a bordo';
const COORD = 'Coordinador durante todo el viaje';
const NO_INCLUYE_BASE = ['Gastos personales', 'Bebidas', 'Excursiones opcionales'];

/**
 * categoria: 'mes' | 'recital' | 'fin_de_ano' | 'verano27'
 * cuando: lo que se muestra al lado del precio ("25 de octubre", "12 y 19 de diciembre")
 */
const VIAJES = [
  // ───────────────────────── OCTUBRE ─────────────────────────
  {
    id: 'pkg-201', slug: 'san-bernardo-hostal-del-sol-24-31oct',
    lugar: 'San Bernardo', detalle: 'Hostal del Sol Resort & Spa ★★★★',
    cuando: '24 y 31 de octubre', salida: '2026-10-24',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'san-bernardo',
    dias: 2, noches: 1, precio: 135000, butaca: 10000, frecuencia: 'semanal',
    corta: 'Fin de semana en San Bernardo con alojamiento en el Hostal del Sol Resort & Spa ★★★★, con pileta climatizada, gimnasio y desayuno buffet.',
    larga: 'Escapada de sábado y domingo a San Bernardo. Te alojás en el Hostal del Sol Resort & Spa ★★★★, que tiene pileta climatizada, gimnasio, sala de juegos y cancha de fútbol y básquet. El desayuno es buffet. Viajamos en bus mix con servicio a bordo. El segundo día aprovechás la playa hasta que emprendemos el regreso a Buenos Aires por la tarde.',
    incluye: [BUS_MIX, '1 noche en Hostal del Sol Resort & Spa ★★★★', 'Desayuno buffet', 'Pileta climatizada, gimnasio y sala de juegos', 'Cancha de fútbol y básquet', COORD],
    foto: '/hostal-del-sol-1.jpg',
    fotos: ['/hostal-del-sol-1.jpg', '/hostal-del-sol-2.jpg', '/hostal-del-sol-3.jpg', '/hostal-del-sol-4.jpg'],
    tags: ['playa', 'fin de semana', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires en bus mix con servicio a bordo.',
      'Llegada a San Bernardo y desayuno buffet en el hotel. Día libre de playa.',
      'Segundo día de playa y regreso a Buenos Aires por la tarde.',
    ],
  },
  {
    id: 'pkg-202', slug: 'termas-san-jose-full-day-25oct',
    lugar: 'Termas de San José', detalle: 'Full Day',
    cuando: '25 de octubre', salida: '2026-10-25',
    categoria: 'mes', tipo: 'full_day', destino: 'colon-entre-rios',
    dias: 1, noches: 0, precio: 99000, antes: 110000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Full day a las Termas de San José, en Colón, con desayuno y merienda a bordo, entrada y traslado incluidos.',
    larga: 'Un día completo en las Termas de San José, en Colón, Entre Ríos. Salimos temprano desde el Gran Buenos Aires en bus semi cama con servicio a bordo, con desayuno y merienda a bordo. La entrada al complejo termal y el traslado están incluidos, y un coordinador acompaña al grupo durante toda la jornada.',
    incluye: [BUS_SEMI, 'Desayuno', 'Merienda a bordo', 'Entrada a Termas de San José', 'Traslado al complejo termal', COORD],
    foto: '/termas-san-jose-1.jpg',
    fotos: ['/termas-san-jose-1.jpg', '/termas-san-jose-2.jpg', '/termas-san-jose-4.jpg', '/termas-san-jose-5.jpg'],
    tags: ['termas', 'full day', 'litoral'],
    itinerario: [
      'Salida temprano desde los puntos de subida del Gran Buenos Aires. Desayuno a bordo.',
      'Llegada a Colón y día completo en las Termas de San José.',
      'Merienda a bordo y regreso a Buenos Aires por la noche.',
    ],
  },
  {
    id: 'pkg-203', slug: 'termas-villa-elisa-full-day-25oct',
    lugar: 'Termas de Villa Elisa', detalle: 'Full Day',
    cuando: '25 de octubre', salida: '2026-10-25',
    categoria: 'mes', tipo: 'full_day', destino: 'villa-elisa-entre-rios',
    dias: 1, noches: 0, precio: 110000, antes: 125000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Full day a las Termas de Villa Elisa, con entrada y traslado, desayuno y merienda a bordo.',
    larga: 'Día completo en el parque termal de Villa Elisa, uno de los más grandes de Entre Ríos, con piscinas al aire libre y climatizadas y mucho verde alrededor. Viajamos en bus semi cama con servicio a bordo, con desayuno y merienda a bordo, y la entrada y el traslado al complejo están incluidos.',
    incluye: [BUS_SEMI, 'Desayuno', 'Merienda a bordo', 'Entrada a las Termas de Villa Elisa', 'Traslado al complejo termal', COORD],
    foto: '/villa-elisa-1.jpg',
    fotos: ['/villa-elisa-1.jpg', '/villa-elisa-2.jpg', '/villa-elisa-3.jpg'],
    tags: ['termas', 'full day', 'litoral'],
    itinerario: [
      'Salida temprano desde los puntos de subida del Gran Buenos Aires. Desayuno a bordo.',
      'Llegada a Villa Elisa y día completo en el parque termal.',
      'Merienda a bordo y regreso a Buenos Aires por la noche.',
    ],
  },
  {
    id: 'pkg-204', slug: 'termas-colon-full-day-25oct',
    lugar: 'Termas de Colón', detalle: 'Full Day con almuerzo',
    cuando: '25 de octubre', salida: '2026-10-25',
    categoria: 'mes', tipo: 'full_day', destino: 'colon-entre-rios',
    dias: 1, noches: 0, precio: 115000, antes: 130000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Full day a las Termas de Colón con desayuno, almuerzo y merienda a bordo, entrada y traslado incluidos.',
    larga: 'Día completo en las Termas de Colón, sobre el río Uruguay, con piscinas termales al aire libre y cubiertas y toboganes para los chicos. Es el full day más completo: incluye desayuno, almuerzo y merienda a bordo, además de la entrada y el traslado al complejo. Viajamos en bus semi cama con servicio a bordo y coordinador.',
    incluye: [BUS_SEMI, 'Desayuno', 'Almuerzo', 'Merienda a bordo', 'Entrada a las Termas de Colón', 'Traslado al complejo termal', COORD],
    foto: '/termas-colon-1.jpg',
    fotos: ['/termas-colon-1.jpg', '/termas-colon-2.jpg'],
    tags: ['termas', 'full day', 'litoral'],
    itinerario: [
      'Salida temprano desde los puntos de subida del Gran Buenos Aires. Desayuno a bordo.',
      'Llegada a Colón, día completo en el complejo termal y almuerzo.',
      'Merienda a bordo y regreso a Buenos Aires por la noche.',
    ],
  },

  // ───────────────────────── NOVIEMBRE ─────────────────────────
  {
    id: 'pkg-205', slug: 'colon-san-jose-cena-show-07nov',
    lugar: 'Colón', detalle: 'Hotel Termas y Río + Cena Show',
    cuando: '7 de noviembre', salida: '2026-11-07',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'colon-entre-rios',
    dias: 2, noches: 1, precio: 175000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Dos días en Colón con media pensión, cena show y entrada a las Termas de San José incluida.',
    larga: 'Escapada de dos días a Colón, Entre Ríos. Te alojás en el Hotel Termas y Río, a 100 metros del complejo termal y 200 de la playa del río, con media pensión y una cena show. La entrada a las Termas de San José está incluida. Viajamos en bus semi cama con coordinador. El segundo día emprendemos el regreso a Buenos Aires a las 17:00 desde las termas.',
    incluye: [BUS_SEMI, '1 noche en Hotel Termas y Río', 'Media pensión', 'Cena show', 'Entrada a Termas de San José', 'Traslado al complejo termal', COORD],
    foto: '/hotel-termas-rio-1.jpg',
    fotos: ['/hotel-termas-rio-1.jpg', '/hotel-termas-rio-2.jpg', '/hotel-termas-rio-3.jpg'],
    tags: ['termas', 'cena show', 'litoral'],
    itinerario: [
      'Salida desde los puntos de subida del Gran Buenos Aires en bus semi cama.',
      'Llegada a Colón, check in en el Hotel Termas y Río y tarde libre. A la noche, cena show.',
      'Día en las Termas de San José y regreso a Buenos Aires a las 17:00.',
    ],
  },
  {
    id: 'pkg-206', slug: 'tandil-full-day-07nov',
    lugar: 'Tandil', detalle: 'Full Day con guía local',
    cuando: '7 de noviembre', salida: '2026-11-07',
    categoria: 'mes', tipo: 'full_day', destino: 'tandil',
    dias: 1, noches: 0, precio: 95000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Full day a Tandil con guía local: Cerro Centinela, Monte Calvario, Parque Independencia, Castillo Morisco, Dique del Fuerte y Piedra Movediza.',
    larga: 'Un día completo recorriendo Tandil con guía local. Visitamos el Cerro Centinela, el Monte Calvario, el lago y el Parque Independencia con su Castillo Morisco, el Dique del Fuerte y la Piedra Movediza, y paramos en un regional para llevarse quesos y salames. Viajamos en bus mix con coordinador y merienda a bordo.',
    incluye: [BUS_MIX, 'Guía local durante el recorrido', 'Merienda a bordo', 'Cerro Centinela y Monte Calvario', 'Parque Independencia y Castillo Morisco', 'Dique del Fuerte y Piedra Movediza', 'Parada en regional', COORD],
    foto: '/tandil-1.jpg',
    fotos: ['/tandil-1.jpg', '/tandil-3.jpg', '/tandil-4.jpg', '/tandil-5.jpg'],
    tags: ['sierra', 'full day', 'excursión'],
    itinerario: [
      'Salida temprano desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a Tandil y recorrido con guía local por los puntos clásicos de la ciudad.',
      'Parada en regional, merienda a bordo y regreso a Buenos Aires por la noche.',
    ],
  },
  {
    id: 'pkg-207', slug: 'mar-del-plata-riazor-nov',
    lugar: 'Mar del Plata', detalle: 'Hotel Riazor con pensión completa',
    cuando: '7, 14 y 28 de noviembre', salida: '2026-11-07',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'mar-del-plata',
    dias: 2, noches: 1, precio: 118000, butaca: 10000, frecuencia: 'semanal',
    corta: 'Dos días en Mar del Plata en el Hotel Riazor, frente al shopping, con pensión completa y show en el hotel.',
    larga: 'Escapada de dos días a Mar del Plata. Te alojás en el Hotel Riazor, frente al shopping y a 400 metros del centro Güemes, con pensión completa y show en el hotel. Viajamos en bus mix con servicio a bordo y coordinador permanente. El segundo día aprovechás la ciudad y emprendemos el regreso a Buenos Aires por la tarde.',
    incluye: [BUS_MIX, '1 noche en Hotel Riazor', 'Pensión completa', 'Show en el hotel', 'Coordinador permanente'],
    foto: '/hotel-riazor-1.jpg',
    fotos: ['/hotel-riazor-1.jpg', '/hotel-riazor-2.jpg', '/hotel-riazor-3.jpg', '/mar-del-plata-5.jpg'],
    tags: ['playa', 'fin de semana', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a Mar del Plata, desayuno en el hotel y día libre. A la noche, show en el hotel.',
      'Segundo día libre y regreso a Buenos Aires por la tarde.',
    ],
  },
  {
    id: 'pkg-208', slug: 'mar-del-plata-riazor-finde-largo-21nov',
    lugar: 'Mar del Plata', detalle: 'Finde largo en el Hotel Riazor',
    cuando: '21 de noviembre', salida: '2026-11-21',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'mar-del-plata',
    dias: 3, noches: 2, precio: 175000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Fin de semana largo en Mar del Plata, tres días en el Hotel Riazor con pensión completa y show en el hotel.',
    larga: 'Aprovechá el fin de semana largo de noviembre con tres días en Mar del Plata. Te alojás en el Hotel Riazor, frente al shopping y a 400 metros del centro Güemes, con pensión completa y show en el hotel. Viajamos en bus mix con servicio a bordo y coordinador permanente.',
    incluye: [BUS_MIX, '2 noches en Hotel Riazor', 'Pensión completa', 'Show en el hotel', 'Coordinador permanente'],
    foto: '/hotel-riazor-2.jpg',
    fotos: ['/hotel-riazor-2.jpg', '/hotel-riazor-1.jpg', '/hotel-riazor-4.jpg', '/mar-del-plata-5.jpg'],
    tags: ['playa', 'finde largo', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a Mar del Plata, desayuno en el hotel y día libre.',
      'Día completo en la ciudad y show en el hotel.',
      'Tercer día libre y regreso a Buenos Aires por la tarde.',
    ],
  },
  {
    id: 'pkg-209', slug: 'san-bernardo-hostal-del-sol-21nov',
    lugar: 'San Bernardo', detalle: 'Finde largo en el Hostal del Sol ★★★★',
    cuando: '21 de noviembre', salida: '2026-11-21',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'san-bernardo',
    dias: 3, noches: 2, precio: 240000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Tres días de fin de semana largo en San Bernardo, en el Hostal del Sol Resort & Spa ★★★★ con desayuno buffet.',
    larga: 'Fin de semana largo de tres días en San Bernardo, alojados en el Hostal del Sol Resort & Spa ★★★★. El hotel tiene pileta climatizada, gimnasio, sala de juegos y cancha de fútbol y básquet, y el desayuno es buffet. Viajamos en bus mix con servicio a bordo.',
    incluye: [BUS_MIX, '2 noches en Hostal del Sol Resort & Spa ★★★★', 'Desayuno buffet', 'Pileta climatizada, gimnasio y sala de juegos', 'Cancha de fútbol y básquet', COORD],
    foto: '/hostal-del-sol-2.jpg',
    fotos: ['/hostal-del-sol-2.jpg', '/hostal-del-sol-1.jpg', '/hostal-del-sol-3.jpg', '/san-bernardo.jpg'],
    tags: ['playa', 'finde largo', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a San Bernardo, desayuno buffet y día de playa.',
      'Día completo libre para disfrutar la playa y el hotel.',
      'Tercer día y regreso a Buenos Aires por la tarde.',
    ],
  },
  {
    id: 'pkg-210', slug: 'las-grutas-hotel-mareas-26nov',
    lugar: 'Las Grutas', detalle: 'Hotel Mareas ★★★',
    cuando: '26 de noviembre', salida: '2026-11-26',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'las-grutas',
    dias: 6, noches: 3, precio: 485000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Seis días en Las Grutas con media pensión en el Hotel Mareas ★★★ y excursión a Viedma y Carmen de Patagones incluida.',
    larga: 'Las Grutas, en Río Negro, tiene una de las mejores playas de Argentina: aguas cálidas y de un turquesa único en la costa patagónica. Te alojás en el Hotel Mareas ★★★, con pileta y a 300 metros de la playa, con media pensión. Incluye una excursión a Viedma y Carmen de Patagones. Viajamos en bus mix con servicio a bordo.',
    incluye: [BUS_MIX, '3 noches en Hotel Mareas ★★★', 'Media pensión', 'Pileta del hotel', 'Excursión a Viedma y Carmen de Patagones', COORD],
    foto: '/las-grutas-1.jpg',
    fotos: ['/las-grutas-1.jpg', '/las-grutas-2.jpg', '/las-grutas-3.jpg'],
    tags: ['playa', 'patagonia', 'excursión'],
    itinerario: [
      'Salida nocturna desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Día de viaje por la Patagonia. Llegada a Las Grutas y check in en el Hotel Mareas.',
      'Día de playa en Las Grutas.',
      'Excursión a Viedma y Carmen de Patagones.',
      'Último día de playa y salida de regreso.',
      'Llegada a Buenos Aires.',
    ],
  },
  {
    id: 'pkg-211', slug: 'canasvieiras-tropicanas-29nov',
    lugar: 'Canasvieiras', detalle: 'Florianópolis — Apart Hotel Tropicanas ★★★',
    cuando: '29 de noviembre', salida: '2026-11-29',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'canasvieiras-brasil',
    dias: 8, noches: 5, precio: 699000, butaca: 40000, frecuencia: 'mensual',
    corta: 'Ocho días en Canasvieiras, Florianópolis, con media pensión buffet en el Apart Hotel Tropicanas ★★★ con piletas.',
    larga: 'Canasvieiras es una de las playas más elegidas del norte de Florianópolis: mar calmo, arena blanca y todos los servicios a mano. Te alojás en el Apart Hotel Tropicanas ★★★, con piletas, en régimen de media pensión con desayuno y cena buffet. Viajamos en bus mix con servicio a bordo. Se necesita documentación vigente para salir del país.',
    incluye: [BUS_MIX, '5 noches en Apart Hotel Tropicanas ★★★', 'Media pensión con buffet', 'Piletas del hotel', COORD],
    noIncluye: ['Gastos personales', 'Bebidas', 'Excursiones opcionales', 'Tasas e impuestos de Brasil', 'Asistencia al viajero'],
    foto: '/canasvieiras-2.jpg',
    fotos: ['/canasvieiras-2.jpg', '/canasvieiras-3.jpg', '/canasvieiras-1.jpg', '/canasvieiras-6.jpg', '/canasvieiras-4.jpg'],
    tags: ['playa', 'brasil', 'internacional'],
    itinerario: [
      'Salida desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Día de viaje y cruce de frontera.',
      'Llegada a Canasvieiras y check in en el Apart Hotel Tropicanas.',
      'Días libres de playa en Canasvieiras, con desayuno y cena buffet en el hotel.',
      'Último día de playa y salida de regreso.',
      'Llegada a Buenos Aires.',
    ],
  },

  // ───────────────────────── DICIEMBRE ─────────────────────────
  {
    id: 'pkg-212', slug: 'mar-del-plata-riazor-05dic',
    lugar: 'Mar del Plata', detalle: 'Tres días en el Hotel Riazor',
    cuando: '5 de diciembre', salida: '2026-12-05',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'mar-del-plata',
    dias: 3, noches: 2, precio: 175000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Tres días en Mar del Plata en el Hotel Riazor, con pensión completa y show en el hotel.',
    larga: 'Tres días en Mar del Plata para arrancar diciembre. Te alojás en el Hotel Riazor, frente al shopping y a 400 metros del centro Güemes, con pensión completa y show en el hotel. Viajamos en bus mix con servicio a bordo y coordinador permanente.',
    incluye: [BUS_MIX, '2 noches en Hotel Riazor', 'Pensión completa', 'Show en el hotel', 'Coordinador permanente'],
    foto: '/hotel-riazor-3.jpg',
    fotos: ['/hotel-riazor-3.jpg', '/hotel-riazor-1.jpg', '/hotel-riazor-2.jpg', '/mar-del-plata-5.jpg'],
    tags: ['playa', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a Mar del Plata, desayuno en el hotel y día libre.',
      'Día completo en la ciudad y show en el hotel.',
      'Tercer día libre y regreso a Buenos Aires por la tarde.',
    ],
  },
  {
    id: 'pkg-213', slug: 'san-bernardo-hostal-del-sol-12dic',
    lugar: 'San Bernardo', detalle: 'Hostal del Sol Resort & Spa ★★★★',
    cuando: '12 de diciembre', salida: '2026-12-12',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'san-bernardo',
    dias: 2, noches: 1, precio: 150000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Fin de semana en San Bernardo en el Hostal del Sol Resort & Spa ★★★★ con desayuno buffet.',
    larga: 'Escapada de sábado y domingo a San Bernardo, alojados en el Hostal del Sol Resort & Spa ★★★★, con pileta climatizada, gimnasio, sala de juegos y cancha de fútbol y básquet. El desayuno es buffet. Viajamos en bus mix con servicio a bordo y el segundo día regresamos a Buenos Aires por la tarde.',
    incluye: [BUS_MIX, '1 noche en Hostal del Sol Resort & Spa ★★★★', 'Desayuno buffet', 'Pileta climatizada, gimnasio y sala de juegos', 'Cancha de fútbol y básquet', COORD],
    foto: '/hostal-del-sol-3.jpg',
    fotos: ['/hostal-del-sol-3.jpg', '/hostal-del-sol-1.jpg', '/hostal-del-sol-4.jpg', '/san-bernardo.jpg'],
    tags: ['playa', 'fin de semana', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a San Bernardo, desayuno buffet y día de playa.',
      'Segundo día de playa y regreso a Buenos Aires por la tarde.',
    ],
  },
  {
    id: 'pkg-214', slug: 'mar-del-plata-riazor-12-19dic',
    lugar: 'Mar del Plata', detalle: 'Hotel Riazor con pensión completa',
    cuando: '12 y 19 de diciembre', salida: '2026-12-12',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'mar-del-plata',
    dias: 2, noches: 1, precio: 119000, butaca: 10000, frecuencia: 'semanal',
    corta: 'Dos días en Mar del Plata en el Hotel Riazor, con pensión completa y show en el hotel.',
    larga: 'Escapada de dos días a Mar del Plata en diciembre. Te alojás en el Hotel Riazor, frente al shopping y a 400 metros del centro Güemes, con pensión completa y show en el hotel. Viajamos en bus mix con servicio a bordo. El segundo día aprovechás la ciudad y regresamos a Buenos Aires por la tarde.',
    incluye: [BUS_MIX, '1 noche en Hotel Riazor', 'Pensión completa', 'Show en el hotel', COORD],
    foto: '/hotel-riazor-4.jpg',
    fotos: ['/hotel-riazor-4.jpg', '/hotel-riazor-1.jpg', '/hotel-riazor-2.jpg', '/mar-del-plata-5.jpg'],
    tags: ['playa', 'fin de semana', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a Mar del Plata, desayuno en el hotel y día libre. A la noche, show en el hotel.',
      'Segundo día libre y regreso a Buenos Aires por la tarde.',
    ],
  },
  {
    id: 'pkg-215', slug: 'san-clemente-minerva-12-19dic',
    lugar: 'San Clemente', detalle: 'Hotel Minerva · a 150 m de la playa',
    cuando: '12 y 19 de diciembre', salida: '2026-12-12',
    categoria: 'mes', tipo: 'viaje_completo', destino: 'san-clemente',
    dias: 2, noches: 1, precio: 139000, antes: 146000, butaca: 10000, frecuencia: 'semanal',
    corta: 'Dos días en San Clemente con media pensión en el Hotel Minerva, en el centro y a 150 metros de la playa.',
    larga: 'Escapada de dos días a San Clemente del Tuyú. Te alojás en el Hotel Minerva, en pleno centro y a 150 metros de la playa, con media pensión. Viajamos en bus semi cama con servicio a bordo. El segundo día aprovechás la playa y emprendemos el regreso a Buenos Aires por la tarde.',
    incluye: [BUS_SEMI, '1 noche en Hotel Minerva', 'Media pensión', COORD],
    foto: '', // falta foto de San Clemente
    fotos: [],
    tags: ['playa', 'fin de semana', 'costa atlántica'],
    itinerario: [
      'Salida por la noche desde los puntos de subida del Gran Buenos Aires.',
      'Llegada a San Clemente, desayuno en el hotel y día de playa.',
      'Segundo día de playa y regreso a Buenos Aires por la tarde.',
    ],
  },

  // ───────────────────────── RECITALES ─────────────────────────
  {
    id: 'pkg-216', slug: 'recital-abel-pintos-concordia-19dic',
    lugar: 'Abel Pintos en Chajarí', detalle: 'Con Termas de Concordia en el día',
    cuando: '19 de diciembre', salida: '2026-12-19',
    categoria: 'recital', tipo: 'full_day', destino: 'concordia-entre-rios',
    dias: 1, noches: 0, precio: 195000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Recital de Abel Pintos en Chajarí con entrada general incluida, y de día las Termas de Concordia.',
    larga: 'Un día que arranca en las Termas de Concordia y termina con Abel Pintos en vivo. Salimos temprano desde el Gran Buenos Aires con desayuno y merienda a bordo. Pasamos el día en las Termas de Concordia, con entrada y traslado incluidos, y a la noche vamos a Chajarí, Entre Ríos, al recital, con entrada general incluida. El regreso es apenas termina el show.',
    incluye: [BUS_SEMI, 'Entrada general al recital de Abel Pintos', 'Desayuno', 'Merienda a bordo', 'Entrada a las Termas de Concordia', 'Traslado al complejo termal', COORD],
    foto: '', // falta foto de Concordia
    fotos: [],
    tags: ['recital', 'termas', 'litoral'],
    itinerario: [
      'Salida temprano desde los puntos de subida del Gran Buenos Aires. Desayuno a bordo.',
      'Día completo en las Termas de Concordia.',
      'Traslado a Chajarí y recital de Abel Pintos con entrada general.',
      'Regreso a Buenos Aires apenas termina el show.',
    ],
  },

  // ───────────────────────── FIN DE AÑO ─────────────────────────
  {
    id: 'pkg-217', slug: 'la-falda-sorrento-fin-de-ano-29dic',
    lugar: 'La Falda', detalle: 'Hotel Sorrento · Fin de año en las sierras',
    cuando: '29 de diciembre', salida: '2026-12-29',
    categoria: 'fin_de_ano', tipo: 'viaje_completo', destino: 'la-falda-cordoba',
    dias: 5, noches: 3, precio: 355000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Cinco días en las sierras de Córdoba para pasar el fin de año, con pensión completa y cena especial del 31 en el Hotel Sorrento.',
    larga: 'Pasá el fin de año en La Falda, en el valle de Punilla. Te alojás en el Hotel Sorrento, céntrico, con parque y pileta, en pensión completa más merienda. La noche del 31 hay cena especial, brindis de año nuevo, mesa de dulces, show y baile. Viajamos en bus mix con servicio a bordo.',
    incluye: [BUS_MIX, '3 noches en Hotel Sorrento', 'Pensión completa más merienda', 'Cena especial del 31 con brindis de año nuevo', 'Mesa de dulces, show y baile', 'Parque y pileta del hotel', COORD],
    foto: '/hotel-sorrento-1.jpg',
    fotos: ['/hotel-sorrento-1.jpg', '/la-falda-1.jpg', '/la-falda-2.jpg', '/la-falda-3.jpg'],
    tags: ['fin de año', 'sierra', 'córdoba'],
    itinerario: [
      'Salida nocturna desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Llegada a La Falda y check in en el Hotel Sorrento. Tarde libre.',
      'Día libre en las sierras.',
      'Noche del 31: cena especial, brindis de año nuevo, mesa de dulces, show y baile.',
      'Primer día del año libre y regreso a Buenos Aires.',
    ],
  },
  {
    id: 'pkg-218', slug: 'mar-del-plata-riazor-ano-nuevo-31dic',
    lugar: 'Mar del Plata', detalle: 'Año nuevo en el Hotel Riazor',
    cuando: '31 de diciembre', salida: '2026-12-31',
    categoria: 'fin_de_ano', tipo: 'viaje_completo', destino: 'mar-del-plata',
    dias: 4, noches: 3, precio: 236000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Cuatro días en Mar del Plata para año nuevo, con pensión completa y cena especial del 31 en el Hotel Riazor.',
    larga: 'Pasá el año nuevo en Mar del Plata. Te alojás en el Hotel Riazor, frente al shopping y a 400 metros del centro Güemes, con pensión completa. La noche del 31 hay cena especial, brindis de año nuevo, mesa de dulces, show y baile. Viajamos en bus mix con servicio a bordo.',
    incluye: [BUS_MIX, '3 noches en Hotel Riazor', 'Pensión completa', 'Cena especial del 31 con brindis de año nuevo', 'Mesa de dulces, show y baile', COORD],
    foto: '/mar-del-plata-5.jpg',
    fotos: ['/mar-del-plata-5.jpg', '/hotel-riazor-1.jpg', '/hotel-riazor-2.jpg', '/hotel-riazor-3.jpg'],
    tags: ['fin de año', 'playa', 'costa atlántica'],
    itinerario: [
      'Salida desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Llegada a Mar del Plata y check in en el Hotel Riazor.',
      'Noche del 31: cena especial, brindis de año nuevo, mesa de dulces, show y baile.',
      'Primer día del año libre en la ciudad.',
      'Último día y regreso a Buenos Aires.',
    ],
  },
  {
    id: 'pkg-219', slug: 'colon-termas-rio-ano-nuevo-31dic',
    lugar: 'Colón', detalle: 'Año nuevo en el Hotel Termas y Río',
    cuando: '31 de diciembre', salida: '2026-12-31',
    categoria: 'fin_de_ano', tipo: 'viaje_completo', destino: 'colon-entre-rios',
    dias: 4, noches: 3, precio: 350000, butaca: 10000, frecuencia: 'mensual',
    corta: 'Cuatro días en Colón para año nuevo, con media pensión, cenas show y entrada a las Termas de San José.',
    larga: 'Pasá el año nuevo en Colón, Entre Ríos. Te alojás en el Hotel Termas y Río, a 100 metros del complejo termal y 200 de la playa del río, con media pensión y cenas show. La entrada y el traslado a las Termas de San José están incluidos. La noche del 31 hay cena especial, brindis de año nuevo, mesa de dulces, show y baile. El regreso es el día 4 por la tarde desde las termas.',
    incluye: [BUS_SEMI, '3 noches en Hotel Termas y Río', 'Media pensión con cenas show', 'Cena especial del 31 con brindis de año nuevo', 'Mesa de dulces, show y baile', 'Entrada a Termas de San José', 'Traslado al complejo termal', COORD],
    foto: '/hotel-termas-rio-2.jpg',
    fotos: ['/hotel-termas-rio-2.jpg', '/hotel-termas-rio-1.jpg', '/hotel-termas-rio-3.jpg', '/termas-san-jose-1.jpg'],
    tags: ['fin de año', 'termas', 'litoral'],
    itinerario: [
      'Salida desde el Gran Buenos Aires en bus semi cama.',
      'Llegada a Colón y check in en el Hotel Termas y Río.',
      'Noche del 31: cena especial, brindis de año nuevo, mesa de dulces, show y baile.',
      'Primer día del año en las Termas de San José.',
      'Último día y regreso a Buenos Aires por la tarde desde las termas.',
    ],
  },

  // ───────────────────────── VERANO 27 ─────────────────────────
  {
    id: 'pkg-220', slug: 'mar-del-plata-riazor-verano-27',
    lugar: 'Mar del Plata', detalle: 'Hotel Riazor · temporada 2027',
    cuando: 'enero y febrero de 2027', salida: '2027-01-06',
    categoria: 'verano27', tipo: 'viaje_completo', destino: 'mar-del-plata',
    dias: 4, noches: 3, precio: 275000, butaca: 10000, frecuencia: 'semanal',
    salidas: 'Enero: 6, 9, 12, 15, 18, 21, 24, 27 y 30. Febrero: 2, 8, 11, 14, 17, 20, 23 y 26.',
    corta: 'Cuatro días en Mar del Plata durante el verano 2027, con pensión completa y show en el Hotel Riazor. Salidas cada tres días.',
    larga: 'Temporada de verano 2027 en Mar del Plata, con salidas cada tres días durante enero y febrero. Te alojás en el Hotel Riazor, frente al shopping y a 400 metros del centro Güemes, con pensión completa y show en el hotel. Viajamos en bus mix con servicio a bordo y coordinador permanente.',
    incluye: [BUS_MIX, '3 noches en Hotel Riazor', 'Pensión completa', 'Show en el hotel', 'Coordinador permanente'],
    foto: '/hotel-riazor-1.jpg',
    fotos: ['/hotel-riazor-1.jpg', '/hotel-riazor-2.jpg', '/hotel-riazor-3.jpg', '/mar-del-plata-5.jpg'],
    tags: ['verano 2027', 'playa', 'costa atlántica'],
    itinerario: [
      'Salida desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Llegada a Mar del Plata y check in en el Hotel Riazor.',
      'Días libres de playa, con pensión completa y show en el hotel.',
      'Último día y regreso a Buenos Aires.',
    ],
  },
  {
    id: 'pkg-221', slug: 'san-bernardo-stromboli-verano-27',
    lugar: 'San Bernardo', detalle: 'Hotel Stromboli o similar · temporada 2027',
    cuando: 'enero y febrero de 2027', salida: '2027-01-07',
    categoria: 'verano27', tipo: 'viaje_completo', destino: 'san-bernardo',
    dias: 4, noches: 3, precio: 245000, butaca: 10000, frecuencia: 'semanal',
    salidas: 'Enero: 7, 10, 13, 16, 19, 22, 25, 28 y 31. Febrero: 3, 9, 12, 15, 18, 21, 24 y 27.',
    corta: 'Cuatro días en San Bernardo durante el verano 2027, en el Hotel Stromboli o similar, sobre la peatonal y a 100 metros de la playa.',
    larga: 'Temporada de verano 2027 en San Bernardo, con salidas cada tres días durante enero y febrero. Te alojás en el Hotel Stromboli o similar, sobre la peatonal y a 100 metros de la playa, con desayuno. Viajamos en bus mix con coordinador en el bus. En destino, el ascenso y descenso se hace en la terminal de micros de la ciudad por disposición municipal.',
    incluye: [BUS_MIX, '3 noches en Hotel Stromboli o similar', 'Desayuno', 'Coordinador en el bus'],
    foto: '/san-bernardo.jpg',
    fotos: ['/san-bernardo.jpg', '/hostal-del-sol-1.jpg'],
    tags: ['verano 2027', 'playa', 'costa atlántica'],
    itinerario: [
      'Salida desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Llegada a San Bernardo y check in en el hotel.',
      'Días libres de playa, con desayuno en el hotel.',
      'Último día y regreso a Buenos Aires.',
    ],
  },
  {
    id: 'pkg-222', slug: 'santa-teresita-ezpeleta-verano-27',
    lugar: 'Santa Teresita', detalle: 'Hotel Ezpeleta o similar · temporada 2027',
    cuando: 'enero y febrero de 2027', salida: '2027-01-07',
    categoria: 'verano27', tipo: 'viaje_completo', destino: 'santa-teresita',
    dias: 4, noches: 3, precio: 230000, butaca: 10000, frecuencia: 'semanal',
    salidas: 'Enero: 7, 10, 13, 16, 19, 22, 25, 28 y 31. Febrero: 3, 9, 12, 15, 18, 21, 24 y 27.',
    corta: 'Cuatro días en Santa Teresita durante el verano 2027, en el Hotel Ezpeleta o similar, a 30 metros de la peatonal y 100 de la playa.',
    larga: 'Temporada de verano 2027 en Santa Teresita, con salidas cada tres días durante enero y febrero. Te alojás en el Hotel Ezpeleta o similar, a 30 metros de la peatonal y 100 de la playa, con desayuno. Viajamos en bus mix con coordinador en el bus. En destino, el ascenso y descenso se hace en la terminal de micros de la ciudad por disposición municipal.',
    incluye: [BUS_MIX, '3 noches en Hotel Ezpeleta o similar', 'Desayuno', 'Coordinador en el bus'],
    foto: '', // falta foto de Santa Teresita
    fotos: [],
    tags: ['verano 2027', 'playa', 'costa atlántica'],
    itinerario: [
      'Salida desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Llegada a Santa Teresita y check in en el hotel.',
      'Días libres de playa, con desayuno en el hotel.',
      'Último día y regreso a Buenos Aires.',
    ],
  },
  {
    id: 'pkg-223', slug: 'mar-de-ajo-oceano-verano-27',
    lugar: 'Mar de Ajó', detalle: 'Hotel Océano o similar · temporada 2027',
    cuando: 'enero y febrero de 2027', salida: '2027-01-07',
    categoria: 'verano27', tipo: 'viaje_completo', destino: 'mar-de-ajo',
    dias: 4, noches: 3, precio: 230000, butaca: 10000, frecuencia: 'semanal',
    salidas: 'Enero: 7, 10, 13, 16, 19, 22, 25, 28 y 31. Febrero: 3, 9, 12, 15, 18, 21, 24 y 27.',
    corta: 'Cuatro días en Mar de Ajó durante el verano 2027, en el Hotel Océano o similar, a 300 metros de la playa.',
    larga: 'Temporada de verano 2027 en Mar de Ajó, con salidas cada tres días durante enero y febrero. Te alojás en el Hotel Océano o similar, a 300 metros de la playa y 200 de la peatonal, con desayuno. Viajamos en bus mix con coordinador en el bus. En destino, el ascenso y descenso se hace en la terminal de micros de la ciudad por disposición municipal.',
    incluye: [BUS_MIX, '3 noches en Hotel Océano o similar', 'Desayuno', 'Coordinador en el bus'],
    foto: '', // falta foto de Mar de Ajo
    fotos: [],
    tags: ['verano 2027', 'playa', 'costa atlántica'],
    itinerario: [
      'Salida desde el Gran Buenos Aires en bus mix con servicio a bordo.',
      'Llegada a Mar de Ajó y check in en el hotel.',
      'Días libres de playa, con desayuno en el hotel.',
      'Último día y regreso a Buenos Aires.',
    ],
  },
];

/* ── Armado del SQL ─────────────────────────────────────────────────── */
const esc = (v) => String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const txt = (v) => `'${esc(v)}'`;
const json = (v) => `'${esc(JSON.stringify(v))}'`;

function fila(v) {
  const titulo = v.detalle
    ? `${v.lugar} — ${v.detalle} · ${v.cuando}`
    : `${v.lugar} · ${v.cuando}`;

  // Si hay varias fechas, se aclaran al final de la descripcion larga
  const larga = v.salidas ? `${v.larga}\n\nSalidas: ${v.salidas}` : v.larga;

  const politicas = {};
  if (v.antes) politicas.precioAnterior = v.antes;
  if (v.salidas) politicas.salidas = v.salidas;

  return `(${[
    txt(v.id), txt(v.slug), txt(titulo), txt(v.tipo), txt(v.destino),
    v.dias, v.noches, v.precio, 10000, 0, v.butaca ?? 10000,
    txt(v.corta), txt(larga),
    json(v.incluye), json(v.noIncluye ?? NO_INCLUYE_BASE),
    txt(v.foto ?? ''), json(v.fotos ?? []),
    4.8, 0, 30, txt(v.salida), txt(v.frecuencia),
    json(v.tags), json(v.itinerario), json(PARADAS), json(politicas),
    txt(v.categoria), 1,
  ].join(', ')})`;
}

const columnas = [
  'id', 'slug', 'titulo', 'tipo', 'destino',
  'duracion_dias', 'duracion_noches', 'precio_base', 'gastos_admin',
  'suplemento_single', 'coche_cama_extra',
  'descripcion_corta', 'descripcion_larga',
  'incluye', 'no_incluye', 'imagen_principal', 'imagenes',
  'rating', 'reviews', 'cupos_por_salida', 'proxima_salida', 'frecuencia_salidas',
  'tags', 'itinerario', 'puntos_de_subida', 'politicas', 'categoria', 'activo',
];

const actualiza = columnas
  .filter((c) => c !== 'id')
  .map((c) => `  ${c} = VALUES(${c})`)
  .join(',\n');

const sql = `-- ============================================================================
-- Pucará Turismo — carga masiva de la temporada
--
-- 23 viajes sacados de los flyers de la carpeta destinos_pucara.
-- Se puede volver a importar las veces que haga falta: usa ON DUPLICATE KEY
-- UPDATE, asi que actualiza los que ya estan en vez de duplicarlos.
--
-- Importar en phpMyAdmin: elegi la base, pestaña Importar, subi este archivo.
-- ============================================================================

SET NAMES utf8mb4;

-- ── 1. Columna de categoria ────────────────────────────────────────────────
-- Agrupa el listado de la web: por mes, verano 27, fin de año o recital.
-- El IF evita el error si ya existe de una importacion anterior.
SET @existe := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pt_paquetes' AND COLUMN_NAME = 'categoria'
);
SET @sentencia := IF(@existe = 0,
  "ALTER TABLE pt_paquetes ADD COLUMN categoria VARCHAR(20) NOT NULL DEFAULT 'mes' AFTER tags",
  'SELECT 1');
PREPARE p FROM @sentencia; EXECUTE p; DEALLOCATE PREPARE p;

-- ── 2. Los viajes ──────────────────────────────────────────────────────────
INSERT INTO pt_paquetes
  (${columnas.join(', ')})
VALUES
${VIAJES.map(fila).join(',\n')}
ON DUPLICATE KEY UPDATE
${actualiza};

-- ── 3. Paradas nuevas para los viajes que ya estaban cargados ──────────────
-- La imagen "Paradas bus" reemplaza la lista vieja (Liniers, Haedo, etc.)
UPDATE pt_paquetes SET puntos_de_subida = ${json(PARADAS)};

-- ── 4. El recital que ya estaba cargado queda en su categoria ──────────────
UPDATE pt_paquetes SET categoria = 'recital'
  WHERE titulo LIKE '%Recital%' OR titulo LIKE '%Konga%';

-- ── 5. Politica general con el texto de los puntos de subida ───────────────
INSERT INTO pt_politicas (clave, valor, orden) VALUES
  ('puntosDeSubida', ${txt(TEXTO_PARADAS)}, 60)
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- Listo. ${VIAJES.length} viajes cargados.
`;

await writeFile('sql/03-carga-masiva.sql', sql);
console.log(`sql/03-carga-masiva.sql · ${VIAJES.length} viajes`);

/* ── Copia local para ver el sitio sin depender del hosting ──────────────
   El sitio real se compila con lo que devuelve el panel; esto es solo el
   respaldo que usa src/data/paquetes.json cuando la API no responde.      */
if (process.argv.includes('--json')) {
  const paquetes = VIAJES.map((v) => ({
    id: v.id,
    slug: v.slug,
    titulo: v.detalle ? `${v.lugar} — ${v.detalle} · ${v.cuando}` : `${v.lugar} · ${v.cuando}`,
    tipo: v.tipo,
    destino: v.destino,
    duracionDias: v.dias,
    duracionNoches: v.noches,
    precioBase: v.precio,
    gastosAdmin: 10000,
    suplementoSingle: 0,
    cocheCamaExtra: v.butaca ?? 10000,
    descripcionCorta: v.corta,
    descripcionLarga: v.salidas ? `${v.larga}\n\nSalidas: ${v.salidas}` : v.larga,
    incluye: v.incluye,
    noIncluye: v.noIncluye ?? NO_INCLUYE_BASE,
    imagenPrincipal: v.foto ?? '',
    imagenes: v.fotos ?? [],
    rating: 4.8,
    reviews: 0,
    cuposPorSalida: 30,
    proximaSalida: v.salida,
    frecuenciaSalidas: v.frecuencia,
    tags: v.tags,
    categoria: v.categoria,
    itinerario: v.itinerario,
    puntosDeSubida: PARADAS,
    politicas: {},
  }));

  const politicasGlobales = {
    precioEnBaseDoble: 'Todos los precios publicados son por persona en base doble (habitación compartida con otra persona).',
    suplementoSingle: 'Si preferís habitación privada sin compartir, se aplica un suplemento del 50% sobre el precio del paquete.',
    menoresCuatroAnios: 'Los niños menores de 4 años viajan sin cargo en el paquete — solo abonan los gastos administrativos ($10.000 por persona).',
    cocheCama: 'Todos nuestros viajes se realizan en bus mix. Si deseás viajar en la parte inferior del coche (butaca cama), el costo adicional es de $10.000 por persona.',
    tipoBus: 'Bus mix con servicio a bordo. La parte inferior (butaca cama) tiene costo adicional de $10.000 por persona.',
    puntosDeSubida: TEXTO_PARADAS,
  };

  await writeFile('src/data/paquetes.json', JSON.stringify({ politicasGlobales, paquetes }, null, 2) + '\n');
  console.log(`src/data/paquetes.json · ${paquetes.length} viajes (respaldo local)`);
}

const porCategoria = VIAJES.reduce((a, v) => ({ ...a, [v.categoria]: (a[v.categoria] ?? 0) + 1 }), {});
console.log('por categoria:', porCategoria);
const sinFoto = VIAJES.filter((v) => !v.foto).map((v) => v.lugar);
if (sinFoto.length) console.log('sin foto:', sinFoto.join(', '));
