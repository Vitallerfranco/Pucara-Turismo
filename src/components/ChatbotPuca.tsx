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
  | 'destino_mdp'
  | 'destino_colon'
  | 'destino_rio_hondo'
  | 'destino_san_bernardo'
  | 'destino_la_falda'
  | 'destino_uspallata'
  | 'destino_solos'
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
  if (/\b(la falda|cordoba|córdoba|sorrento|punilla)\b/.test(t)) return 'destino_la_falda';
  if (/\b(uspallata|mendoza|alta montana|alta montaña|aconcagua|cacheuta|potrerillos)\b/.test(t)) return 'destino_uspallata';
  if (/\b(solos|solas|solo|sola|sin pareja|sin acompanante)\b/.test(t)) return 'destino_solos';

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
        text: `¡Hola! 👋 Soy **Puca IA**, la asistente virtual de Pucará Turismo. ¿En qué puedo ayudarte hoy?`,
        options: ['Ver paquetes disponibles', '¿Cómo reservo?', '¿Cuánto sale?', 'Hablar con un asesor'],
      };

    case 'gracias':
      return {
        text: `¡De nada! Fue un placer ayudarte. Si tenés más preguntas o querés reservar, ¡escribime cuando quieras! 😊`,
        options: ['Ver paquetes', 'Hablar con un asesor'],
      };

    case 'lista_paquetes': {
      const proximos = paquetes.slice(0, 5);
      const lista = proximos
        .map(p => `• **${p.titulo}** — ${formatPrice(p.precioBase + p.gastosAdmin)} p/p`)
        .join('\n');
      return {
        text: `Tenemos **${paquetes.length} salidas confirmadas** para junio y julio 2026:\n\n${lista}\n\n¿Querés saber más de alguno en particular?`,
        options: ['Mar del Plata', 'Colón + Termas', 'Río Hondo', 'San Bernardo', 'La Falda / Mendoza'],
      };
    }

    case 'precio': {
      const rangos = {
        min: Math.min(...paquetes.map(p => p.precioBase + p.gastosAdmin)),
        max: Math.max(...paquetes.map(p => p.precioBase + p.gastosAdmin)),
      };
      return {
        text: `Los precios van desde **${formatPrice(rangos.min)}** hasta **${formatPrice(rangos.max)}** por persona en base doble.\n\nTodos incluyen bus, hotel y comidas según el paquete. ¿Querés ver el precio de algún destino específico?`,
        options: ['Precios Mar del Plata', 'Precios Colón', 'Precios La Falda', 'Ver todos los paquetes'],
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
        text: `¡Sí! Podés financiar tu viaje en cuotas con tarjeta de crédito. 💳\n\nLas condiciones de financiación pueden variar. Te recomiendo consultar con un asesor para conocer las opciones vigentes al momento de tu reserva.`,
        options: ['Hablar con un asesor por WhatsApp', 'Ver paquetes disponibles'],
      };

    case 'ninos':
      return {
        text: `¡Buenas noticias para las familias! 👶\n\n**Niños menores de 4 años** viajan **sin cargo** en el paquete. Solo abonan los gastos administrativos de **$10.000 por persona**.\n\nA partir de los 4 años se abona el precio completo del paquete. ¿Necesitás algo más?`,
        options: ['Ver paquetes familiares', '¿Cómo reservo?', 'Hablar con un asesor'],
      };

    case 'single':
      return {
        text: `Si preferís viajar en una **habitación individual** sin compartir, se aplica un **suplemento del 50% sobre el precio del paquete**.\n\nEjemplo: si el paquete sale $200.000, el suplemento single es $100.000 adicionales.\n\nEn el viaje especial de **Solos y Solas a Colón**, la habitación se asigna en doble con otro viajero del mismo sexo sin costo extra.`,
        options: ['Ver viaje Solos y Solas', '¿Cómo reservo?', 'Hablar con un asesor'],
      };

    case 'coche_cama':
      return {
        text: `Todos nuestros viajes van en **bus mix**. 🚌\n\nSi querés viajar en la **parte inferior del coche** (coche cama / butaca cama), el costo adicional es de **$10.000 por persona**, sujeto a disponibilidad.\n\n¡Consultá al reservar para asegurar tu lugar abajo!`,
        options: ['Ver paquetes disponibles', '¿Cómo reservo?', 'Hablar con un asesor'],
      };

    case 'puntos_subida':
      return {
        text: `Tenemos **múltiples puntos de subida** en el Gran Buenos Aires:\n\n📍 Liniers · Haedo · Morón · Ituzaingó · Castelar · Palermo · Once · La Plata\n\nNo necesitás ir hasta un solo punto. Consultá el punto más cercano a vos al reservar.`,
        options: ['¿Cómo reservo?', 'Ver paquetes', 'Hablar con un asesor'],
      };

    case 'que_incluye':
      return {
        text: `Cada paquete detalla exactamente qué incluye, pero en general nuestros viajes incluyen:\n\n✅ Bus mix con servicio a bordo\n✅ Alojamiento en hotel\n✅ Comidas según el paquete (desayuno, media pensión o pensión completa)\n✅ Coordinador de viaje\n✅ Algunas actividades o excursiones (según destino)\n\n¿Querés saber sobre un paquete específico?`,
        options: ['Ver Mar del Plata', 'Ver Colón + Termas', 'Ver La Falda', 'Ver Mendoza'],
      };

    case 'documentacion':
      return {
        text: `Para viajar dentro de Argentina solo necesitás:\n\n📋 **DNI vigente** (obligatorio)\n\nPara destinos que requieran seguro de viaje o documentación extra, te lo informamos al confirmar la reserva. ¿Tenés alguna duda más?`,
        options: ['¿Cómo reservo?', 'Ver destinos disponibles', 'Hablar con un asesor'],
      };

    case 'contacto':
      return {
        text: `Podés contactarnos por:\n\n💬 **WhatsApp:** +54 9 11 3495-2847 (respuesta en minutos)\n📸 **Instagram:** @pucaraturismo.ok\n📘 **Facebook:** Pucará Turismo\n✉️ **Email:** turismopucara@hotmail.com\n\n**Horarios:** Lun–Vie 9:00–19:00 hs · Sáb 9:00–13:00 hs\n\n¿Querés que te derive directamente?`,
        options: ['Abrir WhatsApp ahora', 'Ver página de contacto'],
      };

    case 'resenas':
      return {
        text: `Pucará Turismo tiene más de **480 reseñas en Google** con un promedio de **4.8 ⭐**\n\nAlgunas opiniones reales:\n\n*"Excelente viaje a Tilcara. Cumplen con todo lo ofrecido."* — Monica G.\n\n*"Vinimos muy felices y conformes con todos los servicios."* — Vanesa B.\n\n¡Podés leer todas las reseñas en nuestra web!`,
        options: ['Ver todas las reseñas', 'Ver paquetes disponibles', '¿Cómo reservo?'],
      };

    case 'cupos':
      return {
        text: `Los cupos son **limitados** en cada salida (entre 18 y 30 personas según el paquete).\n\nPara confirmar disponibilidad en tiempo real, te recomiendo escribir a nuestro WhatsApp — respondemos en minutos. ¡No dejes pasar tu fecha!`,
        options: ['Consultar disponibilidad por WhatsApp', 'Ver todos los paquetes'],
      };

    case 'promociones':
      return {
        text: `¡Tenemos promociones activas! 🎉\n\nLa mejor forma de estar al tanto de todas las ofertas es:\n\n• Seguirnos en **Instagram** @pucaraturismo.ok\n• Seguirnos en **Facebook** Pucará Turismo\n• Escribirnos por WhatsApp para consultar las promos del momento\n\n¿Querés que te pase el contacto directo?`,
        options: ['Abrir WhatsApp', 'Ver paquetes disponibles'],
      };

    case 'cancelacion':
      return {
        text: `Las condiciones de cancelación varían según cada paquete y el momento en que se solicite.\n\nTe recomiendo consultar con un asesor para conocer las condiciones específicas de tu reserva. Podés escribirnos por WhatsApp y te informamos en detalle.`,
        options: ['Hablar con un asesor por WhatsApp', '¿Cómo reservo?'],
      };

    case 'sobre_pucara':
      return {
        text: `**Pucará Turismo** es una agencia de viajes con más de **15 años** organizando viajes grupales por Argentina. 🏔️\n\nSomos **HAT Travel SRL** (Leg. 15157), habilitados oficialmente. Nos especializamos en paquetes con bus, hotel y comidas incluidas, con salidas desde el Gran Buenos Aires.\n\n480+ viajeros nos califican con 4.8 estrellas en Google.`,
        options: ['Ver paquetes disponibles', 'Leer reseñas', 'Hablar con un asesor'],
      };

    // Destinos específicos
    case 'destino_mdp': {
      const pkgs = paquetes.filter(p => p.destino === 'mar-del-plata');
      const lista = pkgs.map(p => `• **${p.titulo}** · ${fechaCorta(p.proximaSalida)} · ${formatPrice(p.precioBase + p.gastosAdmin)}`).join('\n');
      return {
        text: `Tenemos **${pkgs.length} salidas a Mar del Plata**:\n\n${lista}\n\nAlojamiento en Hotel Riazor ★★★, frente al Shopping. Pensión completa + show nocturno incluidos.`,
        options: ['¿Cómo reservo?', 'Ver todos los paquetes', 'Hablar con un asesor'],
      };
    }

    case 'destino_colon': {
      const pkgs = paquetes.filter(p => p.destino === 'colon-entre-rios');
      const lista = pkgs.map(p => `• **${p.titulo}** · ${fechaCorta(p.proximaSalida)} · ${formatPrice(p.precioBase + p.gastosAdmin)}`).join('\n');
      return {
        text: `Tenemos **${pkgs.length} salidas a Colón, Entre Ríos**:\n\n${lista}\n\nTodos incluyen las Termas de San José. Hotel a 100 metros de las termas y 200 metros del río Uruguay.`,
        options: ['Ver viaje Solos y Solas', '¿Cómo reservo?', 'Hablar con un asesor'],
      };
    }

    case 'destino_rio_hondo': {
      const pkg = paquetes.find(p => p.destino === 'rio-hondo');
      if (!pkg) return { text: 'Consultá con un asesor sobre disponibilidad para Río Hondo.' };
      return {
        text: `**${pkg.titulo}**\n\n📅 Salida: ${fechaCorta(pkg.proximaSalida)}\n⏱ ${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n💰 ${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}\n\n¿Te interesa reservar?`,
        options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
      };
    }

    case 'destino_san_bernardo': {
      const pkgs = paquetes.filter(p => p.destino === 'san-bernardo');
      const lista = pkgs.map(p => `• **${p.titulo}** · ${fechaCorta(p.proximaSalida)} · ${formatPrice(p.precioBase + p.gastosAdmin)}`).join('\n');
      return {
        text: `Tenemos **${pkgs.length} salidas a San Bernardo**:\n\n${lista}\n\nHostal del Sol Resort & Spa ★★★★ con pileta climatizada, gimnasio y cancha de deportes.`,
        options: ['¿Cómo reservo?', 'Hablar con un asesor'],
      };
    }

    case 'destino_la_falda': {
      const pkg = paquetes.find(p => p.destino === 'la-falda');
      if (!pkg) return { text: 'Consultá con un asesor sobre La Falda.' };
      return {
        text: `**${pkg.titulo}**\n\n📅 Salida: ${fechaCorta(pkg.proximaSalida)}\n⏱ ${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n💰 ${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\n${pkg.descripcionCorta}`,
        options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
      };
    }

    case 'destino_uspallata': {
      const pkg = paquetes.find(p => p.destino === 'mendoza');
      if (!pkg) return { text: 'Consultá con un asesor sobre Mendoza.' };
      return {
        text: `**${pkg.titulo}**\n\n📅 Salida: ${fechaCorta(pkg.proximaSalida)}\n⏱ ${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n💰 ${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\nMendoza en invierno: Aconcagua, Potrerillos y Termas de Cacheuta incluidas.`,
        options: ['Reservar por WhatsApp', '¿Qué incluye?', 'Ver todos los paquetes'],
      };
    }

    case 'destino_solos': {
      const pkg = paquetes.find(p => p.slug.includes('solos'));
      if (!pkg) return { text: 'Consultá con un asesor sobre el viaje de solos y solas.' };
      return {
        text: `**${pkg.titulo}**\n\n📅 Salida: ${fechaCorta(pkg.proximaSalida)}\n⏱ ${pkg.duracionDias} días / ${pkg.duracionNoches} noches\n💰 ${formatPrice(pkg.precioBase + pkg.gastosAdmin)} por persona\n\nEspecial para viajeros solos/as. Cena show con concurso de disfraces + Termas de San José incluidas. Habitación compartida sin suplemento.`,
        options: ['Reservar por WhatsApp', '¿Cómo reservo?', 'Ver todos los paquetes'],
      };
    }

    case 'no_entendido':
    default:
      return {
        text: `No tengo esa información específica. Para una consulta detallada, te recomiendo hablar directamente con uno de nuestros asesores — responden en minutos. 😊`,
        options: ['Hablar con un asesor por WhatsApp', 'Ver paquetes disponibles', '¿Cómo reservo?'],
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
        text: `¡Perfecto! Te abro WhatsApp ahora. 💬 Nuestros asesores están disponibles Lun–Vie 9:00–19:00 hs y los Sábados hasta las 13:00 hs.`,
      },
    };
  }

  if (opt.includes('ver paquetes') || opt.includes('todos los paquetes')) {
    return {
      action: () => window.location.href = `${BASE}/paquetes/`,
      response: { text: `Te llevo a la sección de paquetes ahora mismo. 👇` },
    };
  }

  if (opt.includes('reseñas') || opt.includes('ver todas las reseñas')) {
    return {
      action: () => window.location.href = `${BASE}/resenas/`,
      response: { text: `Acá podés leer todas las reseñas de nuestros viajeros. ⭐` },
    };
  }

  if (opt.includes('contacto') || opt.includes('página de contacto')) {
    return {
      action: () => window.location.href = `${BASE}/contacto/`,
      response: { text: `Te llevo a la página de contacto. 📋` },
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
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const greeting: Message = {
        id: 'greeting',
        role: 'bot',
        text: `¡Hola! 👋 Soy **Puca IA**, la asistente virtual de Pucará Turismo. Puedo ayudarte con reservas, destinos, formas de pago y cualquier duda sobre tu próximo viaje. ¿En qué puedo ayudarte?`,
        timestamp: new Date(),
        options: ['Ver paquetes disponibles', '¿Cómo reservo?', '¿Cuánto sale viajar?', 'Hablar con un asesor'],
      };
      setMessages([greeting]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, hasGreeted]);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), timestamp: new Date() }]);
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
        setLead(prev => ({ ...prev, name: text, step: 'phone' }));
        botReply(`Perfecto, ${text}! 😊 ¿Y cuál es tu número de teléfono o WhatsApp?`);
        return;
      }
      if (lead.step === 'phone') {
        const name = lead.name;
        const phone = text;
        setLead({ active: false, step: 'name', name: '', phone: '' });
        const waMsg = encodeURIComponent(`Hola Pucará Turismo! Me llamo ${name}, mi teléfono es ${phone}. Solicité contacto desde el chat de la web. ¡Quiero información sobre un viaje!`);
        setTimeout(() => window.open(`https://wa.me/${WA}?text=${waMsg}`, '_blank'), 500);
        botReply(`¡Gracias, ${name}! 🎉 Te abro WhatsApp ahora para que un asesor real tome tu consulta. ¡Respondemos rápido!`);
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
    if (text.toLowerCase().includes('quiero que me contacten') || text.toLowerCase().includes('dejame mis datos')) {
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

  return (
    <>
      {/* Tooltip de invitación */}
      {showTooltip && !isOpen && (
        <div
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
            <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>👋</span>
            <div>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, margin: '0 0 3px', lineHeight: 1.3 }}>
                ¿Te ayudo a encontrar tu viaje?
              </p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
                Soy Puca IA — respondé en segundos 🚀
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); dismissTooltip(); }}
              style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '0 0 0 4px', flexShrink: 0, fontSize: '14px', lineHeight: 1 }}
              aria-label="Cerrar"
            >✕</button>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => { setIsOpen(o => !o); dismissTooltip(); }}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir asistente Puca IA'}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '28px',
          width: '56px',
          height: '56px',
          background: isOpen ? '#1a1a1a' : 'linear-gradient(135deg, #f97316, #ea6c0a)',
          borderRadius: '50%',
          border: isOpen ? '1px solid #333' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(249,115,22,0.45)',
          zIndex: 9997,
          transition: 'all 0.25s ease',
          animation: 'wa-appear 0.4s ease 2s both',
        }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.64 1.15 5.01 3 6.72V21l3.72-1.86C9.77 19.7 10.87 20 12 20c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
            <circle cx="8" cy="11" r="1" fill="rgba(255,255,255,0.7)"/>
            <circle cx="12" cy="11" r="1" fill="rgba(255,255,255,0.7)"/>
            <circle cx="16" cy="11" r="1" fill="rgba(255,255,255,0.7)"/>
          </svg>
        )}

        {/* Badge de notificación */}
        {!isOpen && !hasGreeted && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '14px', height: '14px',
            background: '#ef4444', borderRadius: '50%',
            border: '2px solid #0a0a0a',
            animation: 'blink 2s infinite',
          }} />
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div
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
              flexShrink: 0, fontSize: '18px',
            }}>
              🤖
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
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '6px' }}>
                <div style={{
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #f97316, #ea6c0a)' : '#181818',
                  border: msg.role === 'bot' ? '1px solid #272727' : 'none',
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  padding: '10px 13px',
                  color: '#fff',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                }}>
                  {renderText(msg.text)}
                </div>

                {/* Opciones */}
                {msg.options && msg.role === 'bot' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '90%' }}>
                    {msg.options.map((opt) => (
                      <button
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
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: '#181818', border: '1px solid #272727',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '10px 14px', display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
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
                  background: input.trim() && !isTyping ? 'linear-gradient(135deg,#f97316,#ea6c0a)' : '#1a1a1a',
                  border: '1px solid ' + (input.trim() && !isTyping ? 'transparent' : '#272727'),
                  borderRadius: '50%',
                  cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={input.trim() && !isTyping ? 'white' : '#444'} strokeWidth="2.5">
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
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes tooltipAppear {
          from { opacity: 0; transform: scale(0.8) translateX(10px); }
          to   { opacity: 1; transform: scale(1) translateX(0); }
        }
      `}</style>
    </>
  );
}
