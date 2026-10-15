-- ============================================================================
--  Pucara Turismo - Dashboard de viajes
--  Schema MySQL para importar en phpMyAdmin (Ferozo / DonWeb)
--  Compatible con MySQL 5.6.5+ y MariaDB 10.x
--  Prefijo pt_ para no chocar con tablas viejas de WordPress (wp_)
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '-03:00';

-- ----------------------------------------------------------------------------
--  Viajes / paquetes
--  Los campos que en el JSON son arrays se guardan como JSON en TEXT,
--  asi funciona igual en MySQL 5.6 (que no tiene tipo JSON nativo).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pt_paquetes (
  id                 VARCHAR(32)  NOT NULL,
  slug               VARCHAR(190) NOT NULL,
  titulo             VARCHAR(255) NOT NULL,
  tipo               ENUM('full_day','escapada','viaje_completo') NOT NULL DEFAULT 'full_day',
  destino            VARCHAR(190) NOT NULL DEFAULT '',
  duracion_dias      SMALLINT     NOT NULL DEFAULT 1,
  duracion_noches    SMALLINT     NOT NULL DEFAULT 0,
  precio_base        INT          NOT NULL DEFAULT 0,
  gastos_admin       INT          NOT NULL DEFAULT 10000,
  suplemento_single  INT          NOT NULL DEFAULT 0,
  coche_cama_extra   INT          NOT NULL DEFAULT 10000,
  descripcion_corta  TEXT         NOT NULL,
  descripcion_larga  MEDIUMTEXT   NOT NULL,
  incluye            TEXT         NOT NULL,  -- JSON array
  no_incluye         TEXT         NOT NULL,  -- JSON array
  imagen_principal   VARCHAR(255) NOT NULL DEFAULT '',
  imagenes           TEXT         NOT NULL,  -- JSON array
  rating             DECIMAL(2,1) NOT NULL DEFAULT 4.8,
  reviews            INT          NOT NULL DEFAULT 0,
  cupos_por_salida   SMALLINT     NOT NULL DEFAULT 30,
  proxima_salida     DATE         NOT NULL,
  frecuencia_salidas ENUM('semanal','quincenal','mensual') NOT NULL DEFAULT 'mensual',
  tags               TEXT         NOT NULL,  -- JSON array
  itinerario         TEXT         NOT NULL,  -- JSON array
  puntos_de_subida   TEXT         NOT NULL,  -- JSON array
  politicas          TEXT         NOT NULL,  -- JSON object
  -- activo = 0 lo saca de la web sin borrarlo de la base
  activo             TINYINT(1)   NOT NULL DEFAULT 1,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY pt_paquetes_slug (slug),
  KEY pt_paquetes_salida (proxima_salida),
  KEY pt_paquetes_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
--  Politicas globales del sitio (precio en base doble, single, menores, etc.)
--  Clave/valor para poder agregar nuevas sin tocar la estructura.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pt_politicas (
  clave      VARCHAR(64) NOT NULL,
  valor      TEXT        NOT NULL,
  orden      SMALLINT    NOT NULL DEFAULT 0,
  updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
--  Usuarios del dashboard (Franco + papa)
--  La contrasena se guarda hasheada con password_hash() de PHP, nunca en texto.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pt_usuarios (
  id            INT          NOT NULL AUTO_INCREMENT,
  email         VARCHAR(190) NOT NULL,
  nombre        VARCHAR(120) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  rol           ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  ultimo_acceso DATETIME     NULL DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY pt_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
--  Registro de actividad: quien creo, edito o borro cada viaje
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pt_actividad (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  usuario_id INT          NULL DEFAULT NULL,
  email      VARCHAR(190) NOT NULL DEFAULT '',
  accion     VARCHAR(40)  NOT NULL,
  paquete_id VARCHAR(32)  NOT NULL DEFAULT '',
  detalle    VARCHAR(255) NOT NULL DEFAULT '',
  ip         VARCHAR(45)  NOT NULL DEFAULT '',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY pt_actividad_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
--  Intentos de login, para frenar ataques de fuerza bruta
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pt_login_intentos (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  ip         VARCHAR(45)  NOT NULL DEFAULT '',
  email      VARCHAR(190) NOT NULL DEFAULT '',
  exito      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY pt_login_ip (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
--  Estado interno (ultima vez que se publico el sitio, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pt_estado (
  clave      VARCHAR(64) NOT NULL,
  valor      TEXT        NOT NULL,
  updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO pt_estado (clave, valor) VALUES ('ultima_publicacion', '')
  ON DUPLICATE KEY UPDATE clave = clave;
