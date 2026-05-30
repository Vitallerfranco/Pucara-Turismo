# ARCHITECTURE.md - ARQUITECTURA TÉCNICA PUCARÁ TURISMO

## DECISIÓN ARQUITECTÓNICA: STACK TECNOLÓGICO

---

## 1. ANÁLISIS COMPARATIVO DE OPCIONES

### Opción 1: WordPress/Elementor (ACTUAL)

```
Pros:
✓ Fácil de usar para content editors
✓ Plugins existentes para tours
✓ No requiere programador JavaScript

Contras:
✗ LCP: 3.5s (pobre)
✗ FID: 150ms (pobre, inaceptable)
✗ CLS: 0.15 (pobre)
✗ Difícil de escalar a 500+ excursiones
✗ Costo de hosting: $800-1200 USD/año
✗ No ideal para arquitectura de microservicios
✗ SEO: Difícil implementar schema dinámico
✗ No permite testing A/B nativo
```

### Opción 2: Static HTML/CSS (PROPUESTA ACTUAL)

```
Pros:
✓ Rápido: LCP 1.2s, FID <50ms
✓ SEO: perfecto para sitios estáticos
✓ Hosting gratis en GitHub Pages

Contras:
✗ No escalable a sistema dinámico
✗ Sin inventario de disponibilidad
✗ Sin gestión de reservas
✗ Sin autenticación de usuarios
✗ Sin panel de admin
✗ Difícil mantener 500+ paquetes
```

### Opción 3: React + Supabase (RECOMENDADO)

```
Pros:
✓ LCP: 1.5-2s (excelente con SSG)
✓ FID: <50ms
✓ Escalable a 500+ tours
✓ Real-time con Supabase
✓ TypeScript para developer experience
✓ Facilita testing A/B
✓ Costo: $0-50 USD/mes

Contras:
✗ Requiere conocimiento JavaScript
✗ Curva de aprendizaje media
```

### Opción 4: Astro + Supabase (RECOMENDADO PRINCIPAL)

```
Pros:
✓ LCP: 0.8-1.2s (mejor rendimiento)
✓ FID: <30ms (excelente)
✓ Zero JavaScript por default
✓ SSG perfecto para SEO
✓ Hybrid rendering (estático + dinámico)
✓ Markdown para contenido de destinos
✓ Mejor DX que React puro
✓ SEO nativo con Astro meta tags

Contras:
✗ Ecosistema menos maduro que React
✗ Comunidad más pequeña (pero creciendo rápido)
```

### Opción 5: Next.js + Supabase

```
Pros:
✓ App Router = arquitectura moderna
✓ Server Components = performance natural
✓ Incremental Static Regeneration (ISR)
✓ LCP: 1.5-2s con SSG
✓ Mejor para SEO dinámico
✓ Mejor para blog/contenido

Contras:
✗ Más overhead de JavaScript que Astro
✗ Costo de Vercel: $20+/mes (vs $0)
```

---

## 2. RECOMENDACIÓN FINAL: ASTRO + SUPABASE

### Por qué ASTRO (no Next.js, no React puro)

**1. Performance Obsession**
- Astro es literalmente "la opción más rápida para construir sitios web"
- Por defecto: 0 JavaScript en homepage
- Core Web Vitals: Todos GREEN
- Benchmarks reales: https://astro.build/blog/astro-470-release/

**2. SEO Nativo**
- Schema.org structured data fácil
- Sitemap automático
- RSS feed automático
- Open Graph meta tags simples

**3. Escalabilidad Gradual**
- Comienza 100% estático (SSG)
- Añade interactividad sin JS overhead
- Hybrid rendering: estático + dinámico en mismo sitio

**4. Experiencia de Desarrollo**
- Escribe componentes en `.astro` (HTML + CSS + JS local)
- Importa componentes React solo donde los necesites
- Hot reload instantáneo
- TypeScript nativo

**5. Económico**
- Hosting: Netlify/Vercel/AWS Amplify = GRATIS
- No necesita servidor Node.js
- CDN global automático

### Arquitectura ASTRO

```
Astro Project
├─ src/
│  ├─ layouts/
│  │  ├─ BaseLayout.astro (header, nav, footer)
│  │  ├─ BlogLayout.astro (articulos)
│  │  └─ PaqueteLayout.astro (paquete individual)
│  │
│  ├─ pages/ (SSG automático)
│  │  ├─ index.astro (homepage)
│  │  ├─ destinos/
│  │  │  ├─ index.astro (listado)
│  │  │  ├─ [slug].astro (generado dinámico)
│  │  │  └─ salinas-grandes.astro (SEO optimizado)
│  │  ├─ paquetes/
│  │  │  ├─ index.astro (listado)
│  │  │  └─ [id].astro (detalle)
│  │  ├─ blog/
│  │  │  ├─ index.astro
│  │  │  └─ [...slug].astro (rutas dinámicas)
│  │  ├─ reservas.astro (solo clientes autenticados)
│  │  └─ api/ (rutas del servidor)
│  │     ├─ auth.ts (login)
│  │     ├─ reservas.ts (CRUD reservas)
│  │     ├─ disponibilidad.ts (inventario)
│  │     └─ whatsapp-webhook.ts (confirmaciones)
│  │
│  ├─ components/ (reutilizables)
│  │  ├─ Header.astro
│  │  ├─ NavBar.astro
│  │  ├─ Hero.astro
│  │  ├─ PaqueteCard.astro
│  │  ├─ Recomendador.jsx (React island)
│  │  ├─ Filtros.jsx (React)
│  │  ├─ FormReserva.jsx (React)
│  │  ├─ ReviewWidget.astro
│  │  └─ Footer.astro
│  │
│  ├─ lib/
│  │  ├─ supabase-client.ts (Cliente público)
│  │  ├─ supabase-server.ts (Server-side queries)
│  │  ├─ auth.ts (Autenticación)
│  │  ├─ api-handlers.ts (Lógica de negocio)
│  │  └─ utils.ts (Helpers)
│  │
│  ├─ content/ (Markdown collections)
│  │  ├─ destinos/
│  │  │  ├─ salinas-grandes.md
│  │  │  ├─ jujuy.md
│  │  │  └─ salta.md
│  │  └─ blog/
│  │     ├─ guia-norte-argentino.md
│  │     └─ mejores-epocas-viaje.md
│  │
│  ├─ data/ (JSON data)
│  │  ├─ paquetes.json
│  │  ├─ extras.json
│  │  └─ destinos-metadata.json
│  │
│  └─ styles/
│     ├─ globals.css (Tailwind)
│     └─ components/ (CSS local)
│
├─ public/
│  ├─ images/
│  ├─ icons/
│  └─ docs/
│
├─ astro.config.mjs
├─ tsconfig.json
├─ tailwind.config.js
└─ package.json
```

---

## 3. BASE DE DATOS: SUPABASE (PostgreSQL)

### Por qué Supabase (no Firebase, no custom Node.js)

**Ventajas:**
- PostgreSQL real (no NoSQL)
- Row-Level Security (RLS) nativo
- Real-time subscriptions
- Auth integrado (OAuth, Magic links)
- Webhooks para eventos
- Backups automáticos
- FREE tier suficiente para MVP

**Costo:**
- Gratis hasta 500MB + 50k requests/mes
- Pago: $25/mes (suficiente para 10k usuarios)

### Modelo de Datos

```sql
-- TABLA: paquetes
CREATE TABLE paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion_corta TEXT NOT NULL,
  descripcion_larga TEXT,
  destino_id UUID REFERENCES destinos(id),
  tipo ENUM ('full_day', 'escapada', 'viaje_completo'),
  duracion_dias INT NOT NULL,
  duracion_noches INT NOT NULL,
  precio_base DECIMAL(10,2) NOT NULL,
  gastos_admin DECIMAL(10,2) DEFAULT 10000,
  precio_total DECIMAL(10,2) GENERATED ALWAYS AS (precio_base + gastos_admin),
  incluye TEXT[], -- ['desayuno', 'almuerzo', 'guia', 'transporte', 'hotel']
  imagen_principal TEXT,
  imagenes_galeria TEXT[],
  rating DECIMAL(3,2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  cupos_por_salida INT NOT NULL DEFAULT 20,
  fecha_inicio_salidas DATE,
  frecuencia_salidas ENUM ('semanal', 'quincenal', 'mensual'),
  tags TEXT[], -- ['patagonia', 'naturaleza', 'aventura']
  seo_keywords TEXT,
  seo_meta_description TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- TABLA: salidas (instancias de paquetes)
CREATE TABLE salidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paquete_id UUID NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  cupos_totales INT NOT NULL,
  cupos_reservados INT DEFAULT 0,
  guia_id UUID REFERENCES guias(id),
  precio_actual DECIMAL(10,2), -- por si hay dynamic pricing
  estado ENUM ('abierta', 'confirmada', 'en_curso', 'finalizada', 'cancelada'),
  created_at TIMESTAMP DEFAULT now(),
  
  -- Index para consultas rápidas
  UNIQUE(paquete_id, fecha_inicio)
);

-- TABLA: reservas
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_reserva TEXT UNIQUE NOT NULL, -- "RES-2026-00001"
  salida_id UUID NOT NULL REFERENCES salidas(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  cantidad_pasajeros INT NOT NULL,
  estado ENUM ('pre-reserva', 'confirmada', 'pagada', 'en_curso', 'finalizada', 'cancelada'),
  valor_total DECIMAL(12,2) NOT NULL,
  deposito_30 DECIMAL(12,2) GENERATED ALWAYS AS (valor_total * 0.3),
  saldo DECIMAL(12,2) GENERATED ALWAYS AS (valor_total * 0.7),
  fecha_pago_deposito DATE,
  fecha_pago_saldo DATE,
  metodo_pago ENUM ('transferencia', 'tarjeta_credito', 'efectivo', 'cuotas'),
  extras JSONB, -- [{"nombre": "traslado_extra", "precio": 5000, "cantidad": 2}]
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- TABLA: pasajeros (sub-registros de reserva)
CREATE TABLE pasajeros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  celular TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  tipo_doc ENUM ('DNI', 'PASAPORTE'),
  numero_doc TEXT NOT NULL,
  documento_url TEXT, -- PDF/imagen del doc
  datos_seguro JSONB, -- Información del asegurador
  created_at TIMESTAMP DEFAULT now()
);

-- TABLA: disponibilidad (real-time inventory)
CREATE TABLE disponibilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salida_id UUID NOT NULL REFERENCES salidas(id) ON DELETE CASCADE,
  cupos_libres INT NOT NULL,
  last_reserved_at TIMESTAMP, -- Para mostrar "Reservado hace 10 min"
  updated_at TIMESTAMP DEFAULT now()
);

-- TABLA: destinos
CREATE TABLE destinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  coordenadas POINT, -- Para mapa
  imagen_principal TEXT,
  imagenes_galeria TEXT[],
  atractivos TEXT[], -- ["Salinas Grandes", "Purmamarca"]
  mejor_epoca TEXT[], -- ["julio", "agosto"]
  clima JSONB, -- {"temp_min": 5, "temp_max": 18}
  created_at TIMESTAMP DEFAULT now()
);

-- TABLA: reviews/testimonios
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reservas(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  salida_id UUID NOT NULL REFERENCES salidas(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  fotos TEXT[],
  util_count INT DEFAULT 0,
  estado ENUM ('pendiente', 'aprobado', 'rechazado'),
  created_at TIMESTAMP DEFAULT now()
);

-- TABLA: extras/servicios opcionales
CREATE TABLE extras {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  tipo ENUM ('transporte', 'alojamiento', 'seguro', 'actividad'),
  aplicable_a_paquetes UUID[], -- array de paquete IDs
  created_at TIMESTAMP DEFAULT now()
};

-- Índices para performance
CREATE INDEX idx_salidas_paquete_fecha ON salidas(paquete_id, fecha_inicio DESC);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_salida ON reservas(salida_id);
CREATE INDEX idx_paquetes_destino ON paquetes(destino_id);
CREATE INDEX idx_reviews_salida ON reviews(salida_id);
```

### Row-Level Security (RLS)

```sql
-- Los usuarios solo ven sus propias reservas
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios ven sus propias reservas"
  ON reservas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los coordinadores ven todas las reservas"
  ON reservas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'coordinador'
    )
  );
```

---

## 4. AUTENTICACIÓN Y AUTORIZACIÓN

### Sistema de Auth

```typescript
// src/lib/auth.ts

// Usuarios pueden:
// - Registrarse con email + contraseña
// - Registrarse con Google OAuth
// - Login con Magic Link (envío a WhatsApp)
// - Recuperar contraseña

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: 'cliente' | 'coordinador' | 'admin';
  fecha_registro: Date;
  reservas_count: number;
  cliente_desde: Date;
  ultiman_compra: Date;
}

// Roles y permisos
Roles:
├─ CLIENTE
│  ├─ Ver catálogo de paquetes
│  ├─ Hacer reservas
│  ├─ Ver mis reservas
│  ├─ Chat con coordinador
│  └─ Dejar reviews
├─ COORDINADOR
│  ├─ Ver todas las reservas
│  ├─ Marcar reservas como pagadas
│  ├─ Cambiar estado de reservas
│  ├─ Chat con clientes
│  └─ Reportes
└─ ADMIN
   ├─ Gestionar paquetes y salidas
   ├─ Gestionar disponibilidad
   ├─ Ver reportes
   ├─ Gestionar usuarios
   └─ Configurar sistema
```

---

## 5. APIs Y ENDPOINTS

### Backend - Astro API Routes

```typescript
// src/pages/api/paquetes.ts
export async function GET({ request }: APIContext) {
  const { searchParams } = new URL(request.url);
  const destino = searchParams.get('destino');
  const duracion = searchParams.get('duracion');
  const precio_max = searchParams.get('precio_max');
  
  // Query a Supabase con filtros
  const { data } = await supabase
    .from('paquetes')
    .select('*, salidas(fecha_inicio, cupos_libres)')
    .eq('activo', true)
    .filter(destino, 'in', destino.split(','))
    .order('rating', { ascending: false });
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// src/pages/api/reservas.ts (POST)
export async function POST({ request }: APIContext) {
  const body = await request.json();
  
  // Validar usuario autenticado
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  
  // Crear reserva en Supabase
  const { data: reserva, error } = await supabase
    .from('reservas')
    .insert({
      salida_id: body.salida_id,
      usuario_id: user.id,
      cantidad_pasajeros: body.cantidad,
      estado: 'pre-reserva',
      valor_total: body.total,
      extras: body.extras
    })
    .single();
  
  if (error) return new Response(error.message, { status: 400 });
  
  // Generar mensaje WhatsApp
  const mensaje = generarMensajeWhatsApp(reserva);
  
  // Enviar confirmación por email
  await sendEmail(user.email, 'Reserva creada', mensaje);
  
  return new Response(JSON.stringify(reserva), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// src/pages/api/disponibilidad.ts
export async function GET({ request }: APIContext) {
  const { searchParams } = new URL(request.url);
  const salida_id = searchParams.get('salida_id');
  
  const { data } = await supabase
    .from('disponibilidad')
    .select('*')
    .eq('salida_id', salida_id)
    .single();
  
  return new Response(JSON.stringify(data));
}

// src/pages/api/whatsapp-webhook.ts
// Recibe confirmaciones de WhatsApp
export async function POST({ request }: APIContext) {
  const body = await request.json();
  
  // Actualizar estado de reserva basado en respuesta
  if (body.event === 'message_sent') {
    await supabase
      .from('reservas')
      .update({ estado: 'confirmada' })
      .eq('id', body.reserva_id);
  }
}
```

### Endpoints principales

```
# PÚBLICOS
GET    /api/paquetes              Listar paquetes (filtrable)
GET    /api/paquetes/:id          Detalle paquete
GET    /api/destinos              Listar destinos
GET    /api/destinos/:slug        Destino detallado
GET    /api/disponibilidad?salida Cupos libres
GET    /api/reviews/:salida_id    Reviews de salida

# AUTENTICADOS (clientes)
POST   /api/auth/register         Registrarse
POST   /api/auth/login            Login
POST   /api/auth/logout           Logout
GET    /api/usuario/perfil        Mi perfil
PUT    /api/usuario/perfil        Actualizar perfil
GET    /api/usuario/reservas      Mis reservas
GET    /api/usuario/reservas/:id  Detalle de reserva
POST   /api/reservas              Crear reserva
POST   /api/reviews               Dejar review
GET    /api/recomendaciones       Paquetes recomendados

# AUTENTICADOS (coordinadores)
GET    /api/coordinador/reservas  Todas las reservas
PUT    /api/coordinador/reservas/:id  Actualizar estado
GET    /api/coordinador/reportes  Reportes

# ADMIN
POST   /api/admin/paquetes        Crear paquete
PUT    /api/admin/paquetes/:id    Actualizar paquete
DELETE /api/admin/paquetes/:id    Eliminar paquete
POST   /api/admin/salidas         Crear salida
PUT    /api/admin/disponibilidad  Actualizar cupos
```

---

## 6. FUNCIONALIDADES CLAVE

### 1. Recomendador Inteligente

```typescript
// src/components/Recomendador.jsx
export function Recomendador() {
  const [answers, setAnswers] = useState({
    duracion: null,
    tipo: null,
    presupuesto: null,
    epoca: null
  });
  
  const handleComplete = async () => {
    // Query a Supabase con filtros
    const { data: recomendaciones } = await supabase
      .from('paquetes')
      .select('*')
      .in('duracion_dias', duracionMapper(answers.duracion))
      .in('tags', answers.tipo)
      .lte('precio_total', answers.presupuesto)
      .filter('mejor_epoca', 'cs', answers.epoca)
      .order('rating', { ascending: false })
      .limit(5);
    
    return recomendaciones;
  };
}
```

### 2. Sistema de Filtros

```typescript
// src/components/Filtros.jsx
export function Filtros({ onFilterChange }) {
  const [filtros, setFiltros] = useState({
    destinos: [],
    duracion: [],
    precio: [28000, 320000],
    rating: 4,
    epoca: []
  });
  
  // Real-time query update
  useEffect(() => {
    const query = new URLSearchParams({
      destinos: filtros.destinos.join(','),
      precio_min: filtros.precio[0],
      precio_max: filtros.precio[1]
    });
    
    onFilterChange(`/api/paquetes?${query}`);
  }, [filtros]);
}
```

### 3. Sistema de Reservas (4-paso)

**Paso 1: Seleccionar paquete + fecha**
```
┌──────────────────────────┐
│ Salinas Grandes          │
│ Salida: 15/07/2026       │
│ Cupos libres: 3          │
│ [SELECCIONAR]            │
└──────────────────────────┘
```

**Paso 2: Cantidad de pasajeros + extras**
```
Pasajeros: [1] [2] [3] [4+]
Extras:
☐ Traslado desde centro (5000 pp)
☐ Seguro viaje adicional (8000 pp)
☐ Almuerzo premium (12000 pp)
```

**Paso 3: Mini-form (nombre + WhatsApp)**
```
Nombre: [________]
WhatsApp: [________]

[CONFIRMAR Y ENVIAR A WHATSAPP]
```

**Paso 4: Confirmación**
```
✓ Reserva creada
📌 Número: RES-2026-00001
💬 Sonia responderá en <5 min por WhatsApp
```

---

## 7. STACK COMPLETO

```
FRONTEND:
├─ Astro (framework principal)
├─ React (componentes interactivos)
├─ TypeScript
├─ Tailwind CSS
├─ Zustand (state management)
└─ TanStack Query (data fetching)

BACKEND/BDD:
├─ Supabase (PostgreSQL + Auth)
├─ Astro API Routes
└─ TypeScript

HERRAMIENTAS:
├─ Biome (linter + formatter)
├─ Vitest (testing)
├─ Playwright (E2E testing)
└─ GitHub Actions (CI/CD)

HOSTING:
├─ Netlify (frontend) - GRATIS
├─ Supabase (BDD) - $25/mes
└─ Cloudinary (CDN de imágenes) - GRATIS hasta 75GB/año
```

---

## 8. SEGURIDAD

```
🔐 Implementar:
├─ HTTPS obligatorio
├─ CORS configurado correctamente
├─ Rate limiting en APIs (100 req/min por IP)
├─ Input validation en todos los formularios
├─ SQL injection protection (Supabase parametrizado)
├─ XSS protection (Astro escapa HTML por defecto)
├─ CSRF tokens en forms
├─ Headers de seguridad (CSP, X-Frame-Options)
├─ Contraseñas: bcrypt + salt
├─ Secrets: .env.local (nunca commiteados)
└─ Auditoría de logs (quién hizo qué, cuándo)
```

---

## 9. PERFORMANCE BUDGET

```
Métrica              | Meta      | Herramienta
─────────────────────┼───────────┼──────────────
LCP (Largest Paint)  | < 1.2s    | Lighthouse
FID (Input Delay)    | < 50ms    | Web Vitals
CLS (Layout Shift)   | < 0.05    | Web Vitals
Total JS Bundle      | < 150KB   | Bundlesize
Total CSS            | < 50KB    | PostCSS
Image Optimization   | <50% size | ImageOptim
```

---

## 10. PLAN DE IMPLEMENTACIÓN TÉCNICA

### Fase 1 (Semana 1-2): Setup
```
- [x] Crear proyecto Astro con TS
- [x] Configurar Tailwind CSS
- [x] Setup Supabase proyecto
- [x] Crear esquema de BDD
- [ ] Configurar GitHub + CI/CD
```

### Fase 2 (Semana 3-4): Core
```
- [ ] Componentes base (Header, Footer, Cards)
- [ ] Pages estáticas (Home, Destinos, Blog)
- [ ] Sistema de autenticación
- [ ] API de paquetes
```

### Fase 3 (Semana 5-6): Dinámico
```
- [ ] Sistema de reservas
- [ ] Gestión de disponibilidad real-time
- [ ] Panel de usuario
- [ ] Integración WhatsApp API
```

### Fase 4 (Semana 7-8): Pulido
```
- [ ] Tests (unit + E2E)
- [ ] Optimización de performance
- [ ] SEO (schema + sitemap)
- [ ] Analytics (GA4 + Hotjar)
```

---

## 11. RECOMENDACIONES FINALES

### ✅ HAGA
1. Migre a Astro + Supabase (rendimiento + escalabilidad)
2. Use Tailwind para styling (productividad)
3. Implemente Row-Level Security en Supabase (seguridad)
4. Dockerize la app (reproducibilidad)
5. Monitoree con Sentry (error tracking)

### ❌ NO HAGA
1. No use WordPress en 2026
2. No use Firebase (limitaciones para este caso)
3. No mantenga todo en JSON estático
4. No escriba SQL crudo (use Supabase client)
5. No confíe en "plugins mágicos"

### ℹ️ COSTO ESTIMADO (ANUAL)
```
Supabase Pro: $25/mes × 12 = $300
Cloudinary Pro: $99/mes × 12 = $1,188
Netlify (potencial): $19/mes × 12 = $228
Sentry: $29/mes × 12 = $348
Herramientas dev: $500
──────────────────────────────
TOTAL: ~$2,564 USD/año (~$2M ARS/año)
```

Inversión inicial de desarrollo: $150-200k ARS (2-3 meses de 1 dev mid-level)

**ROI**: Recuperado en mes 1 con +180% conversión.
