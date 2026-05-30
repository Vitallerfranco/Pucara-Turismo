export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function getTimeAgo(timestamp: string | Date): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return 'hace menos de 1 minuto';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} horas`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
  
  return formatDate(then);
}

export function slug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateReservationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `RES-${year}-${random}`;
}

export function calculateOccupancy(booked: number, total: number): number {
  return Math.round((booked / total) * 100);
}

export function calculateOccupancyColor(occupancy: number): 'green' | 'yellow' | 'red' {
  if (occupancy < 50) return 'green';
  if (occupancy < 80) return 'yellow';
  return 'red';
}

export function whatsappMessage(paquete: any, cantidad: number = 1, extras: any[] = []): string {
  const extrasText = extras.length > 0 
    ? `\nExtras:\n${extras.map(e => `• ${e.nombre}`).join('\n')}`
    : '';
  
  return `Hola, quiero reservar:
📌 ${paquete.titulo}
📅 ${formatDateShort(paquete.proximaSalida)}
👥 ${cantidad} pasajero(s)
💰 $${formatPrice(paquete.precioBase + paquete.gastosAdmin)}

¿Disponibilidad y próximos pasos?${extrasText}`;
}

export function encodeWhatsappMessage(message: string): string {
  return encodeURIComponent(message);
}

export function getWhatsappLink(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeWhatsappMessage(message)}`;
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function isPastDate(date: string | Date): boolean {
  return new Date(date) < new Date();
}

export function daysUntil(date: string | Date): number {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function calculateTotalPrice(basePrice: number, gastosAdmin: number, cantidad: number, extras: any[] = []): number {
  const baseTotal = (basePrice + gastosAdmin) * cantidad;
  const extrasTotal = extras.reduce((sum, extra) => sum + (extra.precio * cantidad), 0);
  return baseTotal + extrasTotal;
}

export function getMatchScore(paquete: any, answers: any): number {
  let score = 0;

  // Duration match
  if (answers.duracion === 'corta' && paquete.duracionDias <= 2) score += 25;
  else if (answers.duracion === 'media' && paquete.duracionDias >= 3 && paquete.duracionDias <= 4) score += 25;
  else if (answers.duracion === 'larga' && paquete.duracionDias >= 5) score += 25;

  // Type match
  if (answers.tipo && paquete.tags.includes(answers.tipo)) score += 25;

  // Budget match
  const totalPrice = paquete.precioBase + paquete.gastosAdmin;
  if (answers.presupuesto === 'bajo' && totalPrice <= 100000) score += 25;
  else if (answers.presupuesto === 'medio' && totalPrice > 100000 && totalPrice <= 250000) score += 25;
  else if (answers.presupuesto === 'alto' && totalPrice > 250000) score += 25;

  // Rating bonus
  score += Math.round((paquete.rating / 5) * 25);

  return Math.min(score, 100);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+|0)?[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

export function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s-()]/g, '');
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('0')) {
      normalized = '+54' + normalized.slice(1);
    } else if (normalized.startsWith('54')) {
      normalized = '+' + normalized;
    } else {
      normalized = '+54' + normalized;
    }
  }
  return normalized;
}
