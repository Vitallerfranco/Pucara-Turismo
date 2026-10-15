import React, { useState, useEffect, useRef, useCallback } from 'react';
import paquetesData from '@/data/paquetes.json';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Message {
 id: string;
 role: 'bot' | 'user';
 text: string;
 timestamp: Date;
 options?: string[];
}

interface LeadState {
 active: boolean;
 step: 'name' | 'phone' | 'done';
 name: string;
 phone: string;
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────
const WA = '5491134952847';
const BASE = '';

const paquetes = paquetesData.paquetes;
const politicas = paquetesData.politicasGlobales;

function formatPrice(n: number) {
 return '$' + n.toLocaleString('es-AR');
}

function fechaCorta(iso: string) {
 return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', {
 day: 'numeric', month: 'long', year: 'numeric',
 });
}

// ─── Motor de Intenciones ─────────────────────────────────────────────────────
type Intent =
 | 'saludo'
 | 'lista_paquetes'
 | 'precio'
 | 'como_reservar'
 | 'pago'
 | 'financiacion'
 | 'ninos'
 | 'single'
 | 'coche_cama'
 | 'puntos_subida'
 | 'que_incluye'
 | 'documentacion'
 | 'contacto'
 | 'resenas'
 | 'cupos'
 | 'promociones'
 | 'sena'
 | 'fechas'
 | 'recomendacion'
 | 'tipo_viaje'
 | 'comidas'
 | 'bebidas'
 | 'bus_servicios'
 | 'hotel_servicios'
 | 'seguro'
 | 'equipaje'
 | 'mascotas'
 | 'accesibilidad'
 | 'embarazo'
 | 'descuentos_grupos'
 | 'horarios'
 | 'ubicacion'
 | 'redes'
 | 'regalar'
 | 'clima_ropa'
 | 'excursiones'
 | 'coordinador'
 | 'factura'
 | 'despedida'
 | 'lead_contacto'
 | 'destino_mdp'
 | 'destino_colon'
 | 'destino_rio_hondo'
 | 'destino_san_bernardo'
 | 'destino_las_grutas'
 | 'destino_tandil'
 | 'destino_federacion'
 | 'destino_villa_elisa'
 | 'destino_rosario'
 | 'destino_san_pedro'
 | 'cancelacion'
 | 'sobre_pucara'
 | 'gracias'
 | 'no_entendido';

function detectIntent(text: string): Intent {
 const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

 if (/\b(hola|buenas|buenos|saludos|hey|buen dia|buenas tardes|buenas noches)\b/.test(t)) return 'saludo';
 if (/\b(gracias|muchas gracias|grax|ok gracias|perfecto|excelente|genial)\b/.test(t)) return 'gracias';

 // Destinos
 if (/\b(mar del plata|mdp|plata|finde largo|invierno mdp)\b/.test(t)) return 'destino_mdp';
 if (/\b(colon|colón|entre rios|entre ríos|termas de san jose|san jose)\b/.test(t)) return 'destino_colon';
 if (/\b(rio hondo|río hondo|termas de rio hondo|hondo|santiago del estero)\b/.test(t)) return 'destino_rio_hondo';
 if (/\b(san bernardo|hostal del sol|bernardo)\b/.test(t)) return 'destino_san_bernardo';
 if (/\b(las grutas|grutas|rio negro|río negro|patagonia|mareas)\b/.test(t)) return 'destino_las_grutas';
 if (/\b(tandil|piedra movediza|cerro centinela|sierras|salame)\b/.test(t)) return 'destino_tandil';
 if (/\b(federacion|federación|los angelitos)\b/.test(t)) return 'destino_federacion';
 if (/\b(villa elisa)\b/.test(t)) return 'destino_villa_elisa';
 if (/\b(rosario|san nicolas|san nicolás|monumento a la bandera|parana|paraná)\b/.test(t)) return 'destino_rosario';
 if (/\b(san pedro|howard johnson)\b/.test(t)) return 'destino_san_pedro';

 // Consultas específicas (más puntuales primero)
 if (/\b(sena|seña|senia|cuanto de sena|cuanto es la sena|reservar con sena|adelanto|deposito|reserva minima|cuanto para reservar|cuanto se abona para reservar)\b/.test(t)) return 'sena';
 if (/\b(fecha|fechas|cuando sale|cuando salen|proxima salida|proximas salidas|que dia sale|que dias salen|calendario|cronograma|proximos viajes|que fechas)\b/.test(t)) return 'fechas';
 if (/\b(recomenda|recomienda|recomendacion|que me conviene|no se a donde|adonde ir|a donde ir|sugerencia|que elijo|ayudame a elegir|cual me conviene|no se que elegir)\b/.test(t)) return 'recomendacion';
 if (/\b(playa|termas|termal|sierra|sierras|montana|montaña|relax|descanso|naturaleza)\b/.test(t)) return 'tipo_viaje';
 if (/\b(comida|comidas|vegetariano|vegana|vegano|celiaco|celíaco|sin tacc|dieta|alergia|alergico|media pension|pension completa|regimen|que se come)\b/.test(t)) return 'comidas';
 if (/\b(bebida|bebidas|alcohol|vino|gaseosa|trago|barra libre)\b/.test(t)) return 'bebidas';
 if (/\b(el bus|en el bus|bano|baño|aire acondicionado|enchufe|pantalla|cargador|como es el bus|el colectivo|el micro|servicio a bordo)\b/.test(t)) return 'bus_servicios';
 if (/\b(hotel|hoteles|pileta|piscina|estrellas|wifi|internet|donde nos alojamos|donde dormimos|el alojamiento)\b/.test(t)) return 'hotel_servicios';
 if (/\b(seguro|asistencia al viajero|cobertura|emergencia medica|obra social)\b/.test(t)) return 'seguro';
 if (/\b(equipaje|valija|valijas|maleta|bolso|cuanto puedo llevar|bodega)\b/.test(t)) return 'equipaje';
 if (/\b(mascota|perro|gato|animal)\b/.test(t)) return 'mascotas';
 if (/\b(silla de ruedas|movilidad reducida|discapacidad|accesible|accesibilidad|rampa)\b/.test(t)) return 'accesibilidad';
 if (/\b(embaraz|panza)\b/.test(t)) return 'embarazo';
 if (/\b(grupo|grupos|contingente|contingentes|jubilado|jubilados|estudiante|estudiantes|colegio|colegios|empresa|empresas|egresados|somos varios|somos muchos|descuento grupal)\b/.test(t)) return 'descuentos_grupos';
 if (/\b(horario|horarios|a que hora|hora de salida|hora de regreso|abren|cierran|atienden)\b/.test(t)) return 'horarios';
 if (/\b(direccion|dirección|donde queda|oficina|local|ituzaingo|sucursal|como llego a la agencia|donde estan ubicados)\b/.test(t)) return 'ubicacion';
 if (/\b(instagram|facebook|redes|red social|tiktok|seguirlos)\b/.test(t)) return 'redes';
 if (/\b(regalar|regalo|gift|voucher|obsequio|sorprender)\b/.test(t)) return 'regalar';
 if (/\b(que llevar|que llevo|clima|el tiempo|ropa|abrigo|frio|frío|calor|que ropa|hace frio)\b/.test(t)) return 'clima_ropa';
 if (/\b(excursion|excursiones|paseo|paseos|actividad|actividades|opcional|opcionales|que se hace)\b/.test(t)) return 'excursiones';
 if (/\b(coordinador|guia|guía|acompanante|acompañante|nos acompana|nos acompaña)\b/.test(t)) return 'coordinador';
 if (/\b(factura|facturacion|facturación|comprobante|recibo|factura a|factura b)\b/.test(t)) return 'factura';
 if (/\b(chau|adios|adiós|nos vemos|hasta luego|hasta pronto|me voy)\b/.test(t)) return 'despedida';
 if (/\b(que me contacten|quiero que me contacten|dejame mis datos|contactenme|contactame|llamenme|que me llamen|dejo mis datos)\b/.test(t)) return 'lead_contacto';

 // Consultas
 if (/\b(paquete|paquetes|viaje|viajes|destino|destinos|ver|listar|que tienen|cuales tienen|opciones)\b/.test(t)) return 'lista_paquetes';
 if (/\b(precio|costo|vale|cuanto|cuánto|cuanto sale|tarifa|valor)\b/.test(t)) return 'precio';
 if (/\b(como reservo|reservar|reserva|como hago|como compro|comprar|sacar|asegurar lugar)\b/.test(t)) return 'como_reservar';
 if (/\b(pago|pagar|efectivo|transferencia|tarjeta|mercado pago|debito|credito)\b/.test(t)) return 'pago';
 if (/\b(cuota|cuotas|financ|plan|financiar|pagar en cuotas)\b/.test(t)) return 'financiacion';
 if (/\b(nino|niño|niñ|bebe|bebé|menor|chico|kid|hijo|hija|4 anos|menores)\b/.test(t)) return 'ninos';
 if (/\b(single|solo|habitacion individual|hab individual|habitacion privada|sin compartir)\b/.test(t)) return 'single';
 if (/\b(coche cama|cochе cama|parte de abajo|asiento cama|cama del bus|butaca cama)\b/.test(t)) return 'coche_cama';
 if (/\b(donde subo|punto de subida|subida|salida|de donde|de que lugar|desde donde)\b/.test(t)) return 'puntos_subida';
 if (/\b(incluye|incluido|que trae|que viene|que tiene)\b/.test(t)) return 'que_incluye';
 if (/\b(documentacion|documentación|dni|pasaporte|que necesito traer|que llevar|equipaje)\b/.test(t)) return 'documentacion';
 if (/\b(contacto|contactar|hablar|asesor|persona|humano|whatsapp|wpp|telefono|llamar)\b/.test(t)) return 'contacto';
 if (/\b(reseña|resena|opinion|opiniones|comentario|como son|confiable|confianza)\b/.test(t)) return 'resenas';
 if (/\b(cupo|cupos|lugar|lugares|disponibilidad|quedan|hay lugar)\b/.test(t)) return 'cupos';
 if (/\b(promo|promocion|descuento|oferta|mas barato|rebaja)\b/.test(t)) return 'promociones';
 if (/\b(cancelar|cancelacion|cancelación|devolucion|devolución|baja)\b/.test(t)) return 'cancelacion';
 if (/\b(quienes|quién es|que es pucara|pucara turismo|empresa|agencia|cuantos anos|historia)\b/.test(t)) return 'sobre_pucara';

 return 'no_entendido';
}

// ─── Respuestas ───────────────────────────────────────────────────────────────
function getResponse(intent: Intent): { text: string; options?: string[] } {
 switch (intent) {

 case 'saludo':
 return {
 text: `¡Hola! Soy **Puca IA**, la asistente virtual de Pucará Turismo. ¿En qué puedo ayudarte hoy?`,
 options: ['Ver paquetes disponibles', '¿Cómo reservo?', '¿Cuánto sale?', 'Hablar con un asesor'],
 };

 case 'gracias':
 return {
 text: `¡De nada! Fue un placer ayudarte. Si tenés más preguntas o querés reservar, ¡escribime cuando quieras! `,
 options: ['Ver paquetes', 'Hablar con un asesor'],
 };

 case 'lista_paquetes': {
 const proximos = paquetes.slice(0, 5);
 const lista = proximos
.map(p => `• **${p.titulo}** — ${formatPrice(p.precioBase + p.gastosAdmin)} p/p`)
.join('\n');
 return {
 text: `Tenemos **${paquetes.length} salidas confirmadas** de septiembre a noviembre 2026:\n\n${lista}\n\n¿Querés saber más de alguno en particular?`,
 options: ['Mar del Plata', 'Colón + Termas', 'Río Hondo', 'San Bernardo', 'Las Grutas', 'Tandil'],
 };
 }

 case 'precio': {
 const rangos = {
 min: Math.min(...paquetes.map(p => p.precioBase + p.gastosAdmin)),
 max: Math.max(...paquetes.map(p => p.precioBase + p.gastosAdmin)),
 };
 return {
 text: `Los precios van desde **${formatPrice(rangos.min)}** hasta **${formatPrice(rangos.max)}** por persona en base doble.\n\nTodos incluyen bus, hotel y comidas según el paquete. ¿Querés ver el precio de algún destino específico?`,
 options: ['Precios Mar del Plata', 'Precios Colón', 'Precios Las Grutas', 'Ver todos los paquetes'],
 };
 }

 case 'como_reservar':
 return {
 text: `Reservar es muy simple:\n\n1. **Elegís** el paquete y la fecha que más te gusten\n2. **Escribís** a nuestro WhatsApp o usás el botón de reserva\n3. **Confirmamos** disponibilidad en minutos\n4. **Abonás** la seña para asegurar tu lugar\n\n¡Listo! Tu lugar queda reservado. ¿Querés que te pase a un asesor ahora?`,
 options: ['Reservar por WhatsApp', '¿Qué documentación necesito?', '¿Cómo pago?'],
 };

 case 'pago':
 return {
 text: `Aceptamos varias formas de pago:\n\n• **Efectivo** — con descuento especial\n• **Transferencia bancaria / CVU**\n• **Tarjeta de débito y crédito**\n• **Mercado Pago**\n\nConsultá con nuestros asesores las condiciones vigentes. ¿Necesitás más info?`,
 options: ['¿Puedo pagar en cuotas?', 'Hablar con un asesor', '¿Cómo reservo?'],
 };

 case 'financiacion':
 return {
 text: `¡Sí! Podés financiar tu viaje en cuotas con tarjeta de crédito.\n\nLas condiciones de financiación pueden variar. Te recomiendo consultar con un asesor para conocer las opciones vigentes al momento de tu reserva.`,
 options: ['Hablar con un asesor por WhatsApp', 'Ver paquetes disponibles'],
 };

 case 'ninos':
 return {
 text: `¡Buenas noticias para las familias!\n\n**Niños menores de 4 años** viajan **sin cargo** en el paquete. Solo abonan los gastos administrativos de **$10.000 por persona**.\n\nA partir de los 4 años se abona el precio completo del paquete. ¿Necesitás algo más?`,
 options: ['Ver paquetes familiares', '¿Cómo reservo?', 'Hablar con un asesor'],
 };

 case 'single':
 return {
 text: `Si preferís viajar en una **habitación individual** sin compartir, se aplica un **suplemento del 50% sobre el precio del paquete**.\n\nEjemplo: si el paquete sale $200.000, el suplemento single es $100.000 adicionales.\n\nEn los viajes en el día (full day) no aplica, porque no hay alojamiento.`,
 options: ['Ver paquetes disponibles', '¿Cómo reservo?', 'Hablar con un asesor'],
 };

 case 'coche_cama':
 return {
 text: `Todos nuestros viajes van en **bus mix**.\n\nSi querés viajar en la **parte inferior del coche** (coche cama / butaca cama), el costo adicional es de **$10.000 por persona**, sujeto a disponibilidad.\n\n¡Consultá al reservar para asegurar tu lugar abajo!`,
 options: ['Ver paquetes disponibles', '¿Cómo reservo?', 'Hablar con un asesor'],
 };

 case 'puntos_subida':
 return {
 text: `Tenemos **múltiples puntos de subida** en el Gran Buenos Aires:\n\nLiniers · Haedo · Morón · Ituzaingó · Castelar · Palermo · Once · La Plata\n\nNo necesitás ir hasta un solo punto. Consultá el punto más cercano a vos al reservar.`,
 options: ['¿Cómo reservo?', 'Ver paquetes', 'Hablar con un asesor'],
 };

 case 'que_incluye':
 return {
 text: `Cada paquete detalla exactamente qué incluye, pero en general nuestros viajes incluyen:\n\nBus mix con servicio a bordo\nAlojamiento en hotel\nComidas según el paquete (desayuno, media pensión o pensión completa)\nCoordinador de viaje\nAlgunas actividades o excursiones (según destino)\n\n¿Querés saber sobre un paquete específico?`,
 options: ['Ver Mar del Plata', 'Ver Colón + Termas', 'Ver Las Grutas', 'Ver Tandil'],
 };

 case 'documentacion':
 return {
 text: `Para viajar dentro de Argentina solo necesitás:\n\n**DNI vigente** (obligatorio)\n\nPara destinos que requieran seguro de viaje o documentación extra, te lo informamos al confirmar la reserva. ¿Tenés alguna duda más?`,
 options: ['¿Cómo reservo?', 'Ver destinos disponibles', 'Hablar con un asesor'],
 };

 case 'contacto':
 return {
 text: `Podés contactarnos por:\n\n**WhatsApp:** +54 9 11 3495-2847 (respuesta en minutos)\n**Instagram:** @pucaraturismo.ok\n**Facebook:** Pucará Turismo\n**Email:** info@pucaraturismo.com.ar\n\n**Horarios:** Lun–Vie 9:00–19:00 hs · Sáb 9:00–13:00 hs\n\n¿Querés que te derive directamente?`,
 options: ['Abrir WhatsApp ahora', 'Ver página de contacto'],
 };

 case 'resenas':
 return {
 text: `Pucará Turismo tiene más de **480 reseñas en Google** con un promedio de **4.8 **\n\nAlgunas opiniones reales:\n\n*"Excelente viaje a Tilcara. Cumplen con todo lo ofrecido."* — Monica G.\n\n*"Vinimos muy felices y conformes con todos los servicios."* — Vanesa B.\n\n¡Podés leer todas las reseñas en nuestra web!`,
 options: ['Ver todas las reseñas', 'Ver paquetes disponibles', '¿Cómo reservo?'],
 };

 case 'cupos':
 return {
 text: `Los cupos son **limitados** en cada salida (entre 18 y 30 personas según el paquete).\n\nPara confirmar disponibilidad en tiempo real, te recomiendo escribir a nuestro WhatsApp — respondemos en minutos. ¡No dejes pasar tu fecha!`,
 options: ['Consultar disponibilidad por WhatsApp', 'Ver todos los paquetes'],
 };

 case 'promociones':
 return {
 text: `¡Tenemos promociones activas!\n\nLa mejor forma de estar al tanto de todas las ofertas es:\n\n• Seguirnos en **Instagram** @pucaraturismo.ok\n• Seguirnos en **Facebook** Pucará Turismo\n• Escribirnos por WhatsApp para consultar las promos del momento\n\n¿Querés que te pase el contacto directo?`,
 options: ['Abrir WhatsApp', 'Ver paquetes disponibles'],
 };

 case 'cancelacion':
 return {
 text: `Las condiciones de cancelación varían según cada paquete y el momento en que se solicite.\n\nTe recomiendo consultar con un asesor para conocer las condiciones específicas de tu reserva. Podés escribirnos por WhatsApp y te informamos en detalle.`,
 options: ['Hablar con un asesor por WhatsApp', '¿Cómo reservo?'],
 };

 case 'sobre_pucara':
 return {
 text: `**Pucará Turismo** es una agencia de viajes con más de **15 años** organizando viajes grupales por Argentina.\n\nSomos **HAT Travel SRL** (Leg. 15157), habilitados oficialmente. Nos especializamos en paquetes con bus, hotel y comidas incluidas, con salidas desde el Gran Buenos Aires.\n\n480+ viajeros nos califican con 4.8 estrellas en Google.`,
 options: ['Ver paquetes disponibles', 'Leer reseñas', 'Hablar con un asesor'],
 };

 // Destinos específicos
 case 'destino_mdp': {
 const pkgs = paquetes.filter(p => p.destino === 'mar-del-plata');
 const lista = pkgs.map(p => `• **${p.titulo}** · ${fechaCorta(p.proximaSalida)} · ${formatPrice(p.precioBase + p.gastosAdmin)}`).join('\n');
 return {
 text: `Tenemos **${pkgs.length} salidas a Mar del Plata**:\n\n${lista}\n\nAlojamiento en Hotel Riazor, frente al Shopping. Pensión completa + show nocturno incluidos.`,
 options: ['¿Cómo reservo?', 'Ver todos los paquetes', 'Hablar con un asesor'],
 };
 }

 case 'destino_colon': {
 const pkgs = paquetes.filter(p => p.destino === 'colon-entre-rios');
 const lista = pkgs.map(p => `• **${p.titulo}** · ${fechaCorta(p.proximaSalida)} · ${formatPrice(p.precioBase + p.gastosAdmin)}`).join('\n');
 return {
 text: `Tenemos **${pkgs.length} salidas a Colón, Entre Ríos** (incluye full days y viajes con noche):\n\n${lista}\n\nLa mayoría incluyen las Termas de San José o de Colón. Hoteles a metros de las termas y del río Uruguay.`,
 options: ['¿Cómo reservo?', 'Ver todos los paquetes', 'Hablar con un asesor'],
 };
 }

 case 'destino_rio_hondo': {
 const pkg = paquetes.find(p => p.destino === 'rio-hondo');
 if (!pkg) return { text: 'Consultá con un asesor sobre disponibilidad para Río Hondo.' };
 return {
 text: `**${pkg.titulo}**\n\nSalida: ${fechaCorta(pkg.proximaSalida)}\n${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}\n\n¿Te interesa reservar?`,
 options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
 };
 }

 case 'destino_san_bernardo': {
 const pkgs = paquetes.filter(p => p.destino === 'san-bernardo');
 const lista = pkgs.map(p => `• **${p.titulo}** · ${fechaCorta(p.proximaSalida)} · ${formatPrice(p.precioBase + p.gastosAdmin)}`).join('\n');
 return {
 text: `Tenemos **${pkgs.length} salidas a San Bernardo**:\n\n${lista}\n\nHostal del Sol Resort & Spa con pileta climatizada, gimnasio y cancha de deportes.`,
 options: ['¿Cómo reservo?', 'Hablar con un asesor'],
 };
 }

 case 'destino_las_grutas': {
 const pkg = paquetes.find(p => p.destino === 'las-grutas');
 if (!pkg) return { text: 'Consultá con un asesor sobre Las Grutas.', options: ['Hablar con un asesor', 'Ver todos los paquetes'] };
 return {
 text: `**${pkg.titulo}**\n\nSalida: ${fechaCorta(pkg.proximaSalida)}\n${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}\n\n¿Te interesa reservar?`,
 options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
 };
 }

 case 'destino_tandil': {
 const pkg = paquetes.find(p => p.destino === 'tandil');
 if (!pkg) return { text: 'Consultá con un asesor sobre Tandil.', options: ['Hablar con un asesor', 'Ver todos los paquetes'] };
 return {
 text: `**${pkg.titulo}**\n\nSalida: ${fechaCorta(pkg.proximaSalida)}\n${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}`,
 options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
 };
 }

 case 'destino_federacion': {
 const pkg = paquetes.find(p => p.destino === 'federacion-entre-rios');
 if (!pkg) return { text: 'Consultá con un asesor sobre Federación.', options: ['Hablar con un asesor', 'Ver todos los paquetes'] };
 return {
 text: `**${pkg.titulo}**\n\nSalida: ${fechaCorta(pkg.proximaSalida)}\n${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}`,
 options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
 };
 }

 case 'destino_villa_elisa': {
 const pkg = paquetes.find(p => p.destino === 'villa-elisa-entre-rios');
 if (!pkg) return { text: 'Consultá con un asesor sobre Villa Elisa.', options: ['Hablar con un asesor', 'Ver todos los paquetes'] };
 return {
 text: `**${pkg.titulo}**\n\nSalida: ${fechaCorta(pkg.proximaSalida)}\n${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}`,
 options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
 };
 }

 case 'destino_rosario': {
 const pkg = paquetes.find(p => p.destino === 'rosario-santa-fe');
 if (!pkg) return { text: 'Consultá con un asesor sobre Rosario & San Nicolás.', options: ['Hablar con un asesor', 'Ver todos los paquetes'] };
 return {
 text: `**${pkg.titulo}**\n\nSalida: ${fechaCorta(pkg.proximaSalida)}\n${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}`,
 options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
 };
 }

 case 'destino_san_pedro': {
 const pkg = paquetes.find(p => p.destino === 'san-pedro');
 if (!pkg) return { text: 'Consultá con un asesor sobre San Pedro.', options: ['Hablar con un asesor', 'Ver todos los paquetes'] };
 return {
 text: `**${pkg.titulo}**\n\nSalida: ${fechaCorta(pkg.proximaSalida)}\n${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}`,
 options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
 };
 }

 case 'sena':
 return {
 text: `Para asegurar tu lugar se abona una **seña** y el resto lo podés completar hasta unos días antes de la salida.\n\nEl monto exacto de la seña depende de cada paquete — un asesor te lo confirma al reservar, junto con las formas de pago.`,
 options: ['Reservar por WhatsApp', '¿Cómo pago?', 'Ver paquetes disponibles'],
 };

 case 'fechas': {
 const proximos = paquetes.slice(0, 6);
 const lista = proximos.map(p => `• **${p.titulo.split('·')[0].trim()}** — ${fechaCorta(p.proximaSalida)}`).join('\n');
 return {
 text: `Estas son algunas de nuestras próximas salidas:\n\n${lista}\n\nMar del Plata y San Bernardo tienen salidas casi todos los fines de semana. Decime un destino y te paso todas sus fechas.`,
 options: ['Mar del Plata', 'Colón + Termas', 'San Bernardo', 'Ver todos los paquetes'],
 };
 }

 case 'recomendacion':
 case 'tipo_viaje':
 return {
 text: `¡Te ayudo a elegir! Tenemos para todos los gustos:\n\n**Playa** — Mar del Plata, San Bernardo, Las Grutas\n**Termas / relax** — Colón, San José, Federación, Villa Elisa, Río Hondo\n**Sierras / naturaleza** — Tandil\n**En el día (full day) y especiales** — Rosario & San Nicolás, San José + La Konga\n\n¿Cuál te tienta? También podés usar el **Recomendador** de la web.`,
 options: ['Mar del Plata', 'Río Hondo', 'Las Grutas', 'Ver todos los paquetes'],
 };

 case 'comidas':
 return {
 text: `Según el paquete, la comida puede ser **desayuno**, **media pensión** (desayuno + cena) o **pensión completa** (desayuno, almuerzo y cena) — algunos suman merienda.\n\nEn el detalle de cada viaje dice exactamente qué incluye. Si sos **vegetariano/a, celíaco/a** o tenés alguna dieta especial, avisanos al reservar y lo coordinamos con el hotel.`,
 options: ['¿Qué incluye cada paquete?', 'Ver paquetes disponibles', 'Hablar con un asesor'],
 };

 case 'bebidas':
 return {
 text: `Las **bebidas de las comidas no están incluidas**, salvo que el paquete lo aclare. Podés consumirlas aparte en el hotel.\n\nEn las cenas show suele haber servicio de barra opcional. Consultá el detalle de cada viaje.`,
 options: ['Ver paquetes disponibles', '¿Qué incluye?', 'Hablar con un asesor'],
 };

 case 'bus_servicios':
 return {
 text: `Viajamos en **bus mix con servicio a bordo**.\n\nSi querés la parte de abajo del coche (**butaca cama**), son $10.000 extra por persona, según disponibilidad. Para dudas puntuales sobre el equipamiento del coche de tu salida, consultá con un asesor.`,
 options: ['¿Puntos de subida?', '¿Cómo reservo?', 'Hablar con un asesor'],
 };

 case 'hotel_servicios':
 return {
 text: `Trabajamos con hoteles seleccionados en cada destino, por ejemplo:\n\nHotel Riazor — Mar del Plata\nHostal del Sol Resort & Spa — San Bernardo\nHotel Mareas — Las Grutas\nHotel Termas & Río — Colón\n\nLos servicios (pileta, desayuno, etc.) están detallados en cada paquete.`,
 options: ['Ver Mar del Plata', 'Ver San Bernardo', 'Ver todos los paquetes'],
 };

 case 'seguro':
 return {
 text: `Para viajes dentro de Argentina **no es obligatorio** un seguro, pero si querés podés sumar **asistencia al viajero** opcional.\n\nEscribinos y te la cotizamos para tu salida.`,
 options: ['Hablar con un asesor', 'Ver paquetes disponibles'],
 };

 case 'equipaje':
 return {
 text: `Podés llevar tu **equipaje en la bodega del bus** más un **bolso de mano** para el viaje.\n\nSi viajás con equipaje extra o algo especial (por ejemplo cochecito o equipo deportivo), avisanos al reservar y lo coordinamos.`,
 options: ['¿Qué documentación necesito?', '¿Cómo reservo?', 'Hablar con un asesor'],
 };

 case 'mascotas':
 return {
 text: `Por lo general los buses y hoteles **no admiten mascotas**, salvo casos puntuales.\n\nSi es tu caso, escribinos por WhatsApp y lo consultamos con el transporte y el hotel de tu salida.`,
 options: ['Hablar con un asesor', 'Ver paquetes disponibles'],
 };

 case 'accesibilidad':
 return {
 text: `Podemos coordinar viajes para pasajeros con **movilidad reducida**, pero depende del bus y el hotel de cada salida.\n\nContanos tu caso por WhatsApp y lo organizamos para que viajes cómodo/a.`,
 options: ['Hablar con un asesor', 'Ver paquetes disponibles'],
 };

 case 'embarazo':
 return {
 text: `En la mayoría de los destinos podés viajar embarazada.\n\nTe recomendamos consultar con tu médico según las semanas de gestación y avisarnos al reservar para ubicarte lo más cómoda posible.`,
 options: ['Hablar con un asesor', 'Ver paquetes disponibles'],
 };

 case 'descuentos_grupos':
 return {
 text: `¡Sí! Armamos salidas para **grupos, contingentes, colegios, empresas y egresados**, con tarifas especiales según la cantidad de pasajeros.\n\nContanos cuántos son y a dónde quieren ir, y te preparamos una cotización a medida.`,
 options: ['Hablar con un asesor por WhatsApp', 'Ver paquetes disponibles'],
 };

 case 'horarios':
 return {
 text: ` **Atención:** Lun–Vie 9:00–19:00 hs · Sáb 9:00–13:00 hs.\n\nEl **horario de salida y regreso** de cada viaje te lo confirmamos al reservar (la mayoría sale de noche y regresa a la tarde/noche).`,
 options: ['¿Puntos de subida?', 'Hablar con un asesor', 'Ver paquetes'],
 };

 case 'ubicacion':
 return {
 text: `Somos **HAT Travel SRL** (Leg. 15157).\n\nEstamos en **Zufriategui 830, Local 4 — Ituzaingó centro**, Buenos Aires. También atendemos todo por WhatsApp e Instagram, así que no hace falta que vengas.`,
 options: ['Abrir WhatsApp ahora', 'Ver página de contacto'],
 };

 case 'redes':
 return {
 text: `Seguinos para ver promos y fotos reales de los viajes:\n\n**Instagram:** @pucaraturismo.ok\n**Facebook:** Pucará Turismo\n\nY por WhatsApp respondemos al toque. `,
 options: ['Abrir WhatsApp', 'Ver paquetes disponibles'],
 };

 case 'regalar':
 return {
 text: `¡Podés **regalar un viaje**!\n\nSe puede abonar a nombre de otra persona o armarte un voucher de regalo. Escribinos por WhatsApp y lo preparamos.`,
 options: ['Hablar con un asesor', 'Ver paquetes disponibles'],
 };

 case 'clima_ropa':
 return {
 text: `Depende del destino y la fecha:\n\n• **Termas y playa** malla, protector solar y algo liviano.\n• **Tandil / sierras** sumá abrigo para la noche.\n\nAl confirmar tu salida te damos recomendaciones según el clima esperado.`,
 options: ['Ver paquetes disponibles', '¿Qué documentación necesito?'],
 };

 case 'excursiones':
 return {
 text: `Muchos paquetes ya incluyen **excursiones o entradas** (termas, cena show, city tour, etc.).\n\nEn el detalle de cada viaje ves qué está incluido y qué es opcional. ¿Querés que te muestre alguno?`,
 options: ['Colón + Termas', 'Ver todos los paquetes', 'Hablar con un asesor'],
 };

 case 'coordinador':
 return {
 text: `Sí, todos los viajes van con un **coordinador de Pucará** que te acompaña durante toda la salida.\n\nEn algunos destinos sumamos **guía local** (por ejemplo en Tandil).`,
 options: ['Ver paquetes disponibles', '¿Cómo reservo?'],
 };

 case 'factura':
 return {
 text: `Emitimos comprobante por tu reserva.\n\nSi necesitás **factura A** o algún dato fiscal en particular, avisale al asesor al momento de abonar y te lo preparamos.`,
 options: ['Hablar con un asesor', '¿Cómo pago?'],
 };

 case 'despedida':
 return {
 text: `¡Gracias por escribir! Cuando quieras avanzar estoy acá, o podés escribirnos directamente por WhatsApp. ¡Que tengas un gran viaje!`,
 options: ['Ver paquetes disponibles', 'Abrir WhatsApp'],
 };

 case 'lead_contacto':
 return {
 text: `¡Genial! Dejame tu **nombre** y un asesor te contacta enseguida por WhatsApp. `,
 };

 case 'no_entendido':
 default:
 return {
 text: `No estoy segura de haber entendido. Puedo ayudarte con:\n\n• Destinos y fechas de salida\n• Precios, seña y formas de pago\n• Qué incluye cada viaje (bus, hotel, comidas)\n• Puntos de subida, equipaje y más\n\n¿Sobre qué querés saber? También te puedo pasar con un asesor.`,
 options: ['Ver paquetes disponibles', '¿Cómo reservo?', 'Hablar con un asesor'],
 };
 }
}

// ─── Opciones especiales (con acciones) ──────────────────────────────────────
function handleSpecialOption(option: string): { action?: () => void; response?: { text: string; options?: string[] } } {
 const opt = option.toLowerCase();

 if (opt.includes('whatsapp') || opt.includes('asesor') || opt.includes('reservar por whats')) {
 return {
 action: () => window.open(`https://wa.me/${WA}?text=Hola%20Pucará%20Turismo%2C%20me%20comunico%20desde%20el%20chat%20de%20la%20web.%20Quisiera%20consultar%20sobre%20un%20viaje.`, '_blank'),
 response: {
 text: `¡Perfecto! Te abro WhatsApp ahora. Nuestros asesores están disponibles Lun–Vie 9:00–19:00 hs y los Sábados hasta las 13:00 hs.`,
 },
 };
 }

 if (opt.includes('ver paquetes') || opt.includes('todos los paquetes')) {
 return {
 action: () => window.location.href = `${BASE}/paquetes/`,
 response: { text: `Te llevo a la sección de paquetes ahora mismo. ` },
 };
 }

 if (opt.includes('reseñas') || opt.includes('ver todas las reseñas')) {
 return {
 action: () => window.location.href = `${BASE}/resenas/`,
 response: { text: `Acá podés leer todas las reseñas de nuestros viajeros. ` },
 };
 }

 if (opt.includes('contacto') || opt.includes('página de contacto')) {
 return {
 action: () => window.location.href = `${BASE}/contacto/`,
 response: { text: `Te llevo a la página de contacto. ` },
 };
 }

 return {};
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ChatbotPuca() {
 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState<Message[]>([]);
 const [input, setInput] = useState('');
 const [isTyping, setIsTyping] = useState(false);
 const [lead, setLead] = useState<LeadState>({ active: false, step: 'name', name: '', phone: '' });
 const [hasGreeted, setHasGreeted] = useState(false);
 const [showTooltip, setShowTooltip] = useState(false);
 const [tooltipDismissed, setTooltipDismissed] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);
 const inputRef = useRef<HTMLInputElement>(null);

 // Mostrar tooltip después de 4 segundos si el chat no fue abierto
 useEffect(() => {
 if (tooltipDismissed || hasGreeted) return;
 const t = setTimeout(() => setShowTooltip(true), 4000);
 return () => clearTimeout(t);
 }, [tooltipDismissed, hasGreeted]);

 const dismissTooltip = () => {
 setShowTooltip(false);
 setTooltipDismissed(true);
 };

 // Scroll al último mensaje
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages, isTyping]);

 // Saludo inicial al abrir
 useEffect(() => {
 if (isOpen &&!hasGreeted) {
 setHasGreeted(true);
 const greeting: Message = {
 id: 'greeting',
 role: 'bot',
 text: `¡Hola! Soy **Puca IA**, la asistente virtual de Pucará Turismo. Puedo ayudarte con reservas, destinos, formas de pago y cualquier duda sobre tu próximo viaje. ¿En qué puedo ayudarte?`,
 timestamp: new Date(),
 options: ['Ver paquetes disponibles', '¿Cómo reservo?', '¿Cuánto sale viajar?', 'Hablar con un asesor'],
 };
 setMessages([greeting]);
 setTimeout(() => inputRef.current?.focus(), 300);
 }
 }, [isOpen, hasGreeted]);

 const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
 setMessages(prev => [...prev, {...msg, id: Date.now().toString(), timestamp: new Date() }]);
 }, []);

 const botReply = useCallback((text: string, options?: string[]) => {
 setIsTyping(true);
 const delay = Math.min(600 + text.length * 8, 2000);
 setTimeout(() => {
 setIsTyping(false);
 addMessage({ role: 'bot', text, options });
 }, delay);
 }, [addMessage]);

 // Procesar mensaje del usuario
 const processMessage = useCallback((text: string) => {
 addMessage({ role: 'user', text });
 setInput('');

 // Flujo de captura de lead
 if (lead.active) {
 if (lead.step === 'name') {
 setLead(prev => ({...prev, name: text, step: 'phone' }));
 botReply(`Perfecto, ${text}! ¿Y cuál es tu número de teléfono o WhatsApp?`);
 return;
 }
 if (lead.step === 'phone') {
 const name = lead.name;
 const phone = text;
 setLead({ active: false, step: 'name', name: '', phone: '' });
 const waMsg = encodeURIComponent(`Hola Pucará Turismo! Me llamo ${name}, mi teléfono es ${phone}. Solicité contacto desde el chat de la web. ¡Quiero información sobre un viaje!`);
 setTimeout(() => window.open(`https://wa.me/${WA}?text=${waMsg}`, '_blank'), 500);
 botReply(`¡Gracias, ${name}! Te abro WhatsApp ahora para que un asesor real tome tu consulta. ¡Respondemos rápido!`);
 return;
 }
 }

 // Opciones especiales
 const special = handleSpecialOption(text);
 if (special.action || special.response) {
 if (special.response) botReply(special.response.text, special.response.options);
 if (special.action) setTimeout(special.action, 1200);
 return;
 }

 // Detectar intent y responder
 const intent = detectIntent(text);

 // Trigger de captura de lead
 if (intent === 'lead_contacto' || text.toLowerCase().includes('quiero que me contacten') || text.toLowerCase().includes('dejame mis datos')) {
 setLead({ active: true, step: 'name', name: '', phone: '' });
 botReply(`¡Con gusto! Para que un asesor te contacte, necesito algunos datos. ¿Cuál es tu nombre?`);
 return;
 }

 const response = getResponse(intent);
 botReply(response.text, response.options);
 }, [lead, addMessage, botReply]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!input.trim()) return;
 processMessage(input.trim());
 };

 const handleOption = (option: string) => {
 processMessage(option);
 };

 // Renderizar texto con **negrita**
 function renderText(text: string) {
 const parts = text.split(/(\*\*[^*]+\*\*)/g);
 return parts.map((part, i) => {
 if (part.startsWith('**') && part.endsWith('**')) {
 return <strong key={i}>{part.slice(2, -2)}</strong>;
 }
 return <span key={i}>{part}</span>;
 });
 }

 return (<>
 {/* Tooltip de invitación */}
 {showTooltip &&!isOpen && (<div
 style={{
 position: 'fixed',
 bottom: '108px',
 right: '92px',
 background: '#1a1a1a',
 border: '1px solid rgba(249,115,22,0.35)',
 borderRadius: '14px 14px 4px 14px',
 padding: '10px 14px',
 maxWidth: '210px',
 zIndex: 9997,
 boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
 animation: 'tooltipAppear 0.35s cubic-bezier(0.34,1.56,0.64,1)',
 cursor: 'pointer',
 }}
 onClick={() => { dismissTooltip(); setIsOpen(true); }}
 >
 {/* Flecha apuntando al botón */}
 <div style={{
 position: 'absolute',
 bottom: '-8px',
 right: '14px',
 width: 0, height: 0,
 borderLeft: '8px solid transparent',
 borderRight: '0px solid transparent',
 borderTop: '8px solid rgba(249,115,22,0.35)',
 }} />
 <div style={{
 position: 'absolute',
 bottom: '-6px',
 right: '15px',
 width: 0, height: 0,
 borderLeft: '7px solid transparent',
 borderRight: '0px solid transparent',
 borderTop: '7px solid #1a1a1a',
 }} />

 <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
 <span style={{ lineHeight: 1, flexShrink: 0, color: '#f97316', display: 'inline-flex' }}>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
 </svg>
 </span>
 <div>
 <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, margin: '0 0 3px', lineHeight: 1.3 }}>
 ¿Te ayudo a encontrar tu viaje?
 </p>
 <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
 Soy Puca IA — respondé en segundos 
 </p>
 </div>
 <button
 onClick={e => { e.stopPropagation(); dismissTooltip(); }}
 style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '0 0 0 4px', flexShrink: 0, fontSize: '14px', lineHeight: 1 }}
 aria-label="Cerrar"
 ></button>
 </div>
 </div>
 )}

 {/* Botón flotante */}
 <button
 onClick={() => { setIsOpen(o =>!o); dismissTooltip(); }}
 aria-label={isOpen? 'Cerrar chat': 'Abrir asistente Puca IA'}
 style={{
 position: 'fixed',
 bottom: '96px',
 right: '28px',
 width: '56px',
 height: '56px',
 background: isOpen? '#1a1a1a': 'linear-gradient(135deg, #f97316, #ea6c0a)',
 borderRadius: '50%',
 border: isOpen? '1px solid #333': 'none',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 cursor: 'pointer',
 boxShadow: isOpen? '0 4px 20px rgba(0,0,0,0.4)': '0 4px 20px rgba(249,115,22,0.45)',
 zIndex: 9997,
 transition: 'all 0.25s ease',
 animation: 'wa-appear 0.4s ease 2s both',
 }}
 >
 {isOpen? (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
 <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
 </svg>
 ): (<svg width="24" height="24" viewBox="0 0 24 24" fill="white">
 <path d="M12 2C6.48 2 2 6.03 2 11c0 2.64 1.15 5.01 3 6.72V21l3.72-1.86C9.77 19.7 10.87 20 12 20c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
 <circle cx="8" cy="11" r="1" fill="rgba(255,255,255,0.7)"/>
 <circle cx="12" cy="11" r="1" fill="rgba(255,255,255,0.7)"/>
 <circle cx="16" cy="11" r="1" fill="rgba(255,255,255,0.7)"/>
 </svg>
 )}

 {/* Badge de notificación */}
 {!isOpen &&!hasGreeted && (<span style={{
 position: 'absolute', top: '-2px', right: '-2px',
 width: '14px', height: '14px',
 background: '#ef4444', borderRadius: '50%',
 border: '2px solid #0a0a0a',
 animation: 'blink 2s infinite',
 }} />
 )}
 </button>

 {/* Ventana del chat */}
 {isOpen && (<div
 style={{
 position: 'fixed',
 bottom: '164px',
 right: '28px',
 width: 'min(380px, calc(100vw - 24px))',
 height: '520px',
 background: '#0d0d0d',
 border: '1px solid #222',
 borderRadius: '20px',
 display: 'flex',
 flexDirection: 'column',
 zIndex: 9996,
 boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
 overflow: 'hidden',
 animation: 'chatSlideIn 0.25s ease',
 }}
 >
 {/* Header */}
 <div style={{
 background: 'linear-gradient(135deg, #1a1a1a, #111)',
 borderBottom: '1px solid #222',
 padding: '14px 18px',
 display: 'flex',
 alignItems: 'center',
 gap: '12px',
 flexShrink: 0,
 }}>
 <div style={{
 width: '40px', height: '40px', borderRadius: '50%',
 background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 flexShrink: 0,
 }}>
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
 <line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/>
 </svg>
 </div>
 <div style={{ flex: 1 }}>
 <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0 }}>Puca IA</p>
 <p style={{ color: '#25d366', fontSize: '11px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
 <span style={{ width: '6px', height: '6px', background: '#25d366', borderRadius: '50%', display: 'inline-block', animation: 'blink 2s infinite' }} />
 En línea · Respuesta inmediata
 </p>
 </div>
 <button
 onClick={() => setIsOpen(false)}
 style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px' }}
 aria-label="Cerrar"
 >
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
 <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
 </svg>
 </button>
 </div>

 {/* Mensajes */}
 <div style={{
 flex: 1, overflowY: 'auto', padding: '16px 14px',
 display: 'flex', flexDirection: 'column', gap: '12px',
 scrollbarWidth: 'thin',
 scrollbarColor: '#222 transparent',
 }}>
 {messages.map((msg) => (<div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user'? 'flex-end': 'flex-start', gap: '6px' }}>
 <div style={{
 maxWidth: '85%',
 background: msg.role === 'user'? 'linear-gradient(135deg, #f97316, #ea6c0a)': '#181818',
 border: msg.role === 'bot'? '1px solid #272727': 'none',
 borderRadius: msg.role === 'user'? '16px 4px 16px 16px': '4px 16px 16px 16px',
 padding: '10px 13px',
 color: '#fff',
 fontSize: '13px',
 lineHeight: '1.6',
 whiteSpace: 'pre-line',
 }}>
 {renderText(msg.text)}
 </div>

 {/* Opciones */}
 {msg.options && msg.role === 'bot' && (<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '90%' }}>
 {msg.options.map((opt) => (<button
 key={opt}
 onClick={() => handleOption(opt)}
 style={{
 background: 'transparent',
 border: '1px solid rgba(249,115,22,0.4)',
 color: '#fb923c',
 borderRadius: '20px',
 padding: '5px 12px',
 fontSize: '11px',
 fontWeight: 600,
 cursor: 'pointer',
 transition: 'all 0.15s',
 whiteSpace: 'nowrap',
 }}
 onMouseEnter={e => {
 (e.target as HTMLButtonElement).style.background = 'rgba(249,115,22,0.12)';
 (e.target as HTMLButtonElement).style.borderColor = '#f97316';
 }}
 onMouseLeave={e => {
 (e.target as HTMLButtonElement).style.background = 'transparent';
 (e.target as HTMLButtonElement).style.borderColor = 'rgba(249,115,22,0.4)';
 }}
 >
 {opt}
 </button>
 ))}
 </div>
 )}
 </div>
 ))}

 {/* Typing indicator */}
 {isTyping && (<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <div style={{
 background: '#181818', border: '1px solid #272727',
 borderRadius: '4px 16px 16px 16px',
 padding: '10px 14px', display: 'flex', gap: '4px', alignItems: 'center',
 }}>
 {[0, 1, 2].map(i => (<span key={i} style={{
 width: '6px', height: '6px', borderRadius: '50%', background: '#555',
 animation: `typingDot 1.2s ${i * 0.2}s infinite`,
 display: 'inline-block',
 }} />
 ))}
 </div>
 </div>
 )}

 <div ref={messagesEndRef} />
 </div>

 {/* Input */}
 <div style={{ borderTop: '1px solid #1a1a1a', padding: '12px 14px', flexShrink: 0 }}>
 <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
 <input
 ref={inputRef}
 value={input}
 onChange={e => setInput(e.target.value)}
 placeholder="Escribí tu consulta..."
 disabled={isTyping}
 style={{
 flex: 1,
 background: '#161616',
 border: '1px solid #272727',
 borderRadius: '20px',
 padding: '9px 15px',
 color: '#fff',
 fontSize: '13px',
 outline: 'none',
 transition: 'border-color 0.15s',
 }}
 onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
 onBlur={e => (e.target.style.borderColor = '#272727')}
 />
 <button
 type="submit"
 disabled={!input.trim() || isTyping}
 style={{
 width: '36px', height: '36px',
 background: input.trim() &&!isTyping? 'linear-gradient(135deg,#f97316,#ea6c0a)': '#1a1a1a',
 border: '1px solid ' + (input.trim() &&!isTyping? 'transparent': '#272727'),
 borderRadius: '50%',
 cursor: input.trim() &&!isTyping? 'pointer': 'default',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 transition: 'all 0.15s', flexShrink: 0,
 }}
 >
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
 stroke={input.trim() &&!isTyping? 'white': '#444'} strokeWidth="2.5">
 <line x1="22" y1="2" x2="11" y2="13"/>
 <polygon points="22 2 15 22 11 13 2 9 22 2"/>
 </svg>
 </button>
 </form>
 <p style={{ textAlign: 'center', fontSize: '10px', color: '#333', marginTop: '8px', marginBottom: 0 }}>
 Puca IA · Pucará Turismo — {new Date().getFullYear()}
 </p>
 </div>
 </div>
 )}

 <style>{`
 @keyframes chatSlideIn {
 from { opacity: 0; transform: translateY(16px) scale(0.97); }
 to { opacity: 1; transform: translateY(0) scale(1); }
 }
 @keyframes typingDot {
 0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
 30% { transform: translateY(-5px); opacity: 1; }
 }
 @keyframes tooltipAppear {
 from { opacity: 0; transform: scale(0.8) translateX(10px); }
 to { opacity: 1; transform: scale(1) translateX(0); }
 }
 `}</style>
 </>
 );
}
