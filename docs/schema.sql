-- Pucará Turismo - PostgreSQL Schema
-- Ejecutar en Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT,
  rol TEXT DEFAULT 'cliente' CHECK (rol IN ('cliente', 'coordinador', 'admin')),
  fecha_registro TIMESTAMP DEFAULT now(),
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'bloqueado')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Destinos
CREATE TABLE destinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  provincia TEXT NOT NULL,
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  imagen TEXT,
  clima_min INT,
  clima_max INT,
  clima_descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Paquetes
CREATE TABLE paquetes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('full_day', 'escapada', 'viaje_completo')),
  destino_id UUID REFERENCES destinos(id),
  duracion_dias INT NOT NULL,
  duracion_noches INT NOT NULL,
  precio_base INT NOT NULL,
  gastos_admin INT NOT NULL,
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  imagen_principal TEXT,
  rating DECIMAL(3, 1) DEFAULT 0,
  reviews INT DEFAULT 0,
  cupos_por_salida INT DEFAULT 20,
  frecuencia_salidas TEXT DEFAULT 'semanal',
  activo BOOLEAN DEFAULT true,
  incluye TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Salidas (fechas específicas)
CREATE TABLE salidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paquete_id UUID NOT NULL REFERENCES paquetes(id),
  fecha_salida DATE NOT NULL,
  cupos_totales INT NOT NULL,
  cupos_disponibles INT NOT NULL,
  estado TEXT DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada', 'cancelada')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(paquete_id, fecha_salida)
);

-- Reservas
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_reserva TEXT UNIQUE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  salida_id UUID NOT NULL REFERENCES salidas(id),
  cantidad_pasajeros INT NOT NULL DEFAULT 1,
  precio_total INT NOT NULL,
  extras TEXT[] DEFAULT '{}',
  estado TEXT DEFAULT 'pre-reserva' CHECK (estado IN ('pre-reserva', 'confirmada', 'pagada', 'finalizada', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Disponibilidad (cache en tiempo real)
CREATE TABLE disponibilidad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salida_id UUID UNIQUE REFERENCES salidas(id),
  cupos_libres INT NOT NULL,
  ocupacion INT NOT NULL,
  ultima_reserva_hace INT,
  updated_at TIMESTAMP DEFAULT now()
);

-- Extras (servicios opcionales)
CREATE TABLE extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio INT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('transporte', 'alojamiento', 'seguro', 'actividad')),
  aplicable_a TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Chats / Mensajes
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reserva_id UUID REFERENCES reservas(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paquete_id UUID NOT NULL REFERENCES paquetes(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  reserva_id UUID REFERENCES reservas(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  contenido TEXT,
  respuesta TEXT,
  verificado BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Payment Logs (para historial de pagos)
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reserva_id UUID NOT NULL REFERENCES reservas(id),
  monto INT NOT NULL,
  metodo TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'completado', 'fallido')),
  referencia TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Row-Level Security (RLS)

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- Usuarios pueden ver su propia información
CREATE POLICY "usuarios_select_self" ON usuarios
  FOR SELECT USING (auth.uid()::text = id::text);

-- Usuarios pueden actualizar su propia información
CREATE POLICY "usuarios_update_self" ON usuarios
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Reservas: usuarios pueden ver las suyas
CREATE POLICY "reservas_select_own" ON reservas
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

-- Chats: usuarios pueden ver los suyos
CREATE POLICY "chats_select_own" ON chats
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

-- Pagos: usuarios pueden ver los suyos
CREATE POLICY "pagos_select_own" ON pagos
  FOR SELECT USING (
    auth.uid()::text = (
      SELECT usuario_id::text FROM reservas WHERE id = pagos.reserva_id
    )
  );

-- Reviews: públicos para leer
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);

-- Índices para performance
CREATE INDEX idx_paquetes_slug ON paquetes(slug);
CREATE INDEX idx_destinos_slug ON destinos(slug);
CREATE INDEX idx_salidas_paquete_id ON salidas(paquete_id);
CREATE INDEX idx_salidas_fecha ON salidas(fecha_salida);
CREATE INDEX idx_reservas_usuario_id ON reservas(usuario_id);
CREATE INDEX idx_reservas_salida_id ON reservas(salida_id);
CREATE INDEX idx_chats_usuario_id ON chats(usuario_id);
CREATE INDEX idx_reviews_paquete_id ON reviews(paquete_id);
CREATE INDEX idx_pagos_reserva_id ON pagos(reserva_id);

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_paquetes_updated_at BEFORE UPDATE ON paquetes
  FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_salidas_updated_at BEFORE UPDATE ON salidas
  FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_destinos_updated_at BEFORE UPDATE ON destinos
  FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

-- Datos iniciales (destinos)
INSERT INTO destinos (slug, nombre, provincia, descripcion_corta, clima_min, clima_max) VALUES
('jujuy-salinas', 'Salinas Grandes', 'Jujuy', 'Las salinas más grandes del mundo a 3,656m', 0, 15),
('jujuy-purmamarca', 'Purmamarca', 'Jujuy', 'Cerro de los Siete Colores y pueblo colonial', 10, 28),
('misiones-iguazu', 'Cataratas del Iguazú', 'Misiones', 'Maravilla natural con 275 cascadas', 15, 35),
('mendoza', 'Mendoza', 'Mendoza', 'Región de vinos y alta montaña', 5, 32),
('cordoba', 'Córdoba', 'Córdoba', 'Sierras cordobesas y pueblos coloniales', 8, 30);

-- Datos iniciales (paquetes) - Usar data/paquetes.json para referencia
-- Se pueden insertar vía API después de autenticación
