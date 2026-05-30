export interface Destino {
  id: string;
  nombre: string;
  provincia: string;
  slug: string;
  descripcionCorta: string;
  descripcionLarga: string;
  imagen: string;
  atractivos: string[];
  mejorEpoca: string[];
  clima: {
    tempMin: number;
    tempMax: number;
    descripcion: string;
  };
}

export interface Paquete {
  id: string;
  slug: string;
  titulo: string;
  tipo: 'full_day' | 'escapada' | 'viaje_completo';
  destino: string;
  duracionDias: number;
  duracionNoches: number;
  precioBase: number;
  gastosAdmin: number;
  descripcionCorta: string;
  descripcionLarga: string;
  incluye: string[];
  imagenPrincipal: string;
  imagenes: string[];
  rating: number;
  reviews: number;
  cuposPorSalida: number;
  proximaSalida: string;
  frecuenciaSalidas: 'semanal' | 'quincenal' | 'mensual';
  tags: string[];
  itinerario: string[];
}

export interface Extra {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: 'transporte' | 'alojamiento' | 'seguro' | 'actividad';
  aplicableA: string[];
}

export interface RecomendadorAnswers {
  duracion: 'corta' | 'media' | 'larga' | null;
  tipo: string | null;
  presupuesto: 'bajo' | 'medio' | 'alto' | null;
  epoca: string | null;
  compania: string | null;
}

export interface Reserva {
  id: string;
  numeroReserva: string;
  paqueteId: string;
  usuarioId: string;
  cantidad: number;
  total: number;
  estado: 'pre-reserva' | 'confirmada' | 'pagada' | 'finalizada' | 'cancelada';
  fechaCreacion: Date;
  extras: Extra[];
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'cliente' | 'coordinador' | 'admin';
  fechaRegistro: Date;
}

export interface Disponibilidad {
  salidaId: string;
  cuposLibres: number;
  cuposTotales: number;
  ocupacion: number; // 0-100
  ultimaReservaHace: number; // minutos
}

export interface ChatMessage {
  id: string;
  reservaId: string;
  usuarioId: string;
  contenido: string;
  timestamp: Date;
  leido: boolean;
}

export interface MatchScore {
  paquete: Paquete;
  score: number; // 0-100
  razon: string;
}
