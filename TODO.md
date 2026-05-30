# TODO.md - BACKLOG PRIORIZADO Y TAREAS TÉCNICAS

---

## ESTRUCTURA DEL BACKLOG

```
PRIORIDAD: P0 (CRÍTICA) > P1 (ALTA) > P2 (MEDIA) > P3 (BAJA) > P4 (NICE-TO-HAVE)
ESTADO: [ ] NO INICIADA | [~] EN PROGRESO | [✓] COMPLETA
SPRINT: Sprint 1-12 (semanas 1-12)
```

---

## 🔴 SPRINT 1 (SEMANA 1-2): QUICK WINS

### P0 - CRÍTICAS

```
[  ] Urgency Messaging - Backend
ID: P0-001 | Estimado: 5 días | Sprint: 1
├─ Crear tabla `disponibilidad` en Supabase
├─ Agregar campo `last_reserved_at` a `salidas`
├─ API endpoint: GET /api/disponibilidad/:salida_id
├─ Actualizar `last_reserved_at` en cada POST /api/reservas
└─ Testing: Verificar que se actualiza cada reserva
Historia de usuario:
  "Como usuario, quiero ver cuántas plazas quedan (8/10) 
   para sentir que es una oportunidad escasa"

[  ] Urgency Messaging - Frontend
ID: P0-002 | Estimado: 3 días | Sprint: 1
├─ Componente PaqueteCard mejorado:
│  ├─ Mostrar "🔥 ÚLTIMAS 3 PLAZAS"
│  ├─ Contador visual ████████░░
│  ├─ "Reservado hace X minutos" con timestamp real
│  └─ Color rojo/naranja si <3 plazas
├─ Actualización en tiempo real (useEffect, polling cada 60s)
└─ Mobile responsive (fit en pantalla pequeña)

[  ] Recomendador Simple - 5 Preguntas
ID: P0-003 | Estimado: 5 días | Sprint: 1
├─ Componente Recomendador.jsx (React)
├─ State management (Zustand o Context)
├─ Lógica: mapear respuestas a filtros
├─ Query a Supabase con múltiples filtros
├─ Mostrar 4-5 paquetes ordenados por match
├─ Testing: Verificar que matches correctos
└─ A/B test: Mostrar vs no mostrar (control 50%)

[  ] Mini-form WhatsApp - Frontend
ID: P0-004 | Estimado: 3 días | Sprint: 1
├─ Reemplazar FormularioReserva antiguo
├─ Modal con 2 campos: nombre + WhatsApp
├─ Validación: nombre no vacío, whatsapp formato +54
├─ Botón de CTA: "CONTINUAR POR WHATSAPP"
├─ Generar link WhatsApp con texto pre-poblado
│  └─ wa.me/+5491150000000?text=ENCODED_MESSAGE
└─ Mostrar confirmación después de clic

[  ] Mini-form WhatsApp - Backend
ID: P0-005 | Estimado: 3 días | Sprint: 1
├─ API POST /api/reservas (crear pre-reserva)
├─ Generar número: RES-2026-00001 (auto-increment)
├─ Guardar: nombre, whatsapp, paquete, fecha, cantidad
├─ Estado inicial: 'pre-reserva'
├─ Email confirmación automático
├─ Webhook: recibir confirmación desde WhatsApp (futuro)
└─ Testing: Mock WhatsApp links

[  ] Fotos Reales - Sesión Fotográfica
ID: P0-006 | Estimado: 10 días | Sprint: 1 (paralelo)
├─ Contactar fotógrafo profesional
├─ Itinerario: Jujuy (5 días), Salta (3 días), extras
├─ Capturar:
│  ├─ Destinos principales
│  ├─ Detalles close-up
│  ├─ Vistas panorámicas
│  ├─ Actividades en acción
│  └─ Personas viajando (clientes previos)
├─ Post-producción: color grade, lighting
├─ Optimización: WebP, multiple sizes (480/800/1200px)
└─ Upload a Cloudinary (CDN automático)

[  ] Testimonios Video - Grabación
ID: P0-007 | Estimado: 10 días | Sprint: 1 (paralelo)
├─ Contactar 5-8 clientes recientes
├─ Coordinar: "Grabamos un video corto de tu experiencia"
├─ Preguntas guía:
│  ├─ ¿Cómo fue tu experiencia?
│  ├─ ¿Qué te gustó más?
│  ├─ ¿Lo recomendarías?
│  └─ Que diga nombre + destino + duración
├─ Grabación: iPhone, luz natural, 20-45 segundos
├─ Edición:
│  ├─ Cortes simples (quitar muletillas)
│  ├─ Subtítulos en español
│  ├─ Leyenda: "Nombre, Destino, Fecha"
│  └─ Música de fondo (royalty-free)
├─ Upload a Vimeo (no requiere YouTube login)
└─ Link embebido en web

[  ] Analytics Setup
ID: P0-008 | Estimado: 2 días | Sprint: 1
├─ Google Analytics 4
│  ├─ GA4 tag en Astro
│  ├─ Eventos: view_item, add_to_cart, purchase
│  ├─ User ID para logged-in users
│  └─ Conversion goal: reserva creada
├─ Google Search Console (GSC)
│  ├─ Verificar propiedad
│  ├─ Sitemap.xml
│  └─ Mobile usability
├─ Hotjar
│  ├─ Heatmaps (dónde hace clic)
│  ├─ Recordings (cómo navega)
│  └─ Surveys (satisfaction)
└─ Testing: Verificar que se trackean eventos

[  ] Deployment Inicial (Astro HTML a Netlify)
ID: P0-009 | Estimado: 1 día | Sprint: 1
├─ Crear proyecto Netlify
├─ Conectar GitHub repo
├─ Build command: astro build
├─ Deploy automático en cada push
├─ HTTPS y dominio personalizado
├─ Environment variables (.env)
└─ Testing: Deploy en staging primero

[  ] Migración contenido actual
ID: P0-010 | Estimado: 3 días | Sprint: 1
├─ Copiar paquetes de pucaraturismo.com.ar
├─ Actualizar precios (si hay cambios)
├─ Crear markdown files en src/content/destinos/
├─ Validar que todos los paquetes estén visibles
└─ Testing: Comparar sitio antiguo vs nuevo
```

### P1 - ALTAS

```
[  ] Setup inicial del proyecto Astro
ID: P1-001 | Estimado: 2 días | Sprint: 1
├─ npm create astro@latest
├─ Seleccionar template: blog (para content collections)
├─ Instalar: react, tailwind, typescript
├─ Configurar tsconfig.json (strict mode)
├─ Crear estructura de carpetas
│  └─ src/pages, src/components, src/content, src/lib
├─ Git initial commit
└─ Testing: npm run dev y verificar hot reload

[  ] Supabase Project Setup
ID: P1-002 | Estimado: 1 día | Sprint: 1
├─ Crear proyecto Supabase
├─ Generar API keys (public + service)
├─ Crear tablas: paquetes, salidas, destinos
├─ Insertar datos de prueba
├─ Configurar auth (Email/Password)
└─ Testing: Conectar desde Astro y hacer query

[  ] Tailwind CSS Setup
ID: P1-003 | Estimado: 1 día | Sprint: 1
├─ npm install -D tailwindcss postcss autoprefixer
├─ npx tailwindcss init -p
├─ Configurar template paths en tailwind.config.js
├─ Crear global styles.css
└─ Testing: Agregar clase de Tailwind y ver que funciona
```

---

## 🟡 SPRINT 2 (SEMANA 3-4): MVP FUNCIONAL

### P0 - CRÍTICAS

```
[  ] Sistema de Autenticación Completo
ID: P0-011 | Estimado: 3 días | Sprint: 2
├─ Supabase Auth setup
├─ Página /auth/register (email + password)
├─ Página /auth/login
├─ Página /auth/forgot-password
├─ Supabase client (public + server)
├─ Middleware de autenticación
├─ JWT token management
├─ Logout functionality
└─ Testing: Crear usuario, login, verificar token

[  ] Homepage Rediseñado
ID: P0-012 | Estimado: 4 días | Sprint: 2
├─ Hero section:
│  ├─ Imagen background
│  ├─ Texto principal: "El mejor viaje al norte argentino"
│  ├─ Subtexto: "Salinas Grandes, Jujuy, Salta... sin estrés"
│  ├─ CTA principal: "VER MIS DESTINOS"
│  └─ Urgency: "Últimas 3 salidas este mes"
├─ Recomendador widget
├─ Paquetes destacados (8-10 cards mejoradas)
├─ Social proof (últimas reservas, rating)
├─ Testimonios video (1 destacado)
├─ Why us section
├─ Footer
└─ Testing: Mobile responsive, lighthouse >90

[  ] API de Paquetes
ID: P0-013 | Estimado: 2 días | Sprint: 2
├─ GET /api/paquetes
│  └─ Filtros: destino, duración, precio, rating
├─ GET /api/paquetes/:id
│  └─ Incluir: destino, salidas próximas, reviews
├─ Validación de parámetros
├─ Rate limiting (100 req/min)
└─ Testing: Postman requests, verificar datos

[  ] Página de Paquetes (Listado)
ID: P0-014 | Estimado: 3 días | Sprint: 2
├─ Grid de paquetes (responsive)
├─ Cards mejoradas con:
│  ├─ Imagen
│  ├─ Destino
│  ├─ Duración
│  ├─ Precio transparente
│  ├─ Rating
│  ├─ Últimas plazas
│  └─ CTA
├─ Filtros básicos (destino, duración)
├─ Ordenamiento (precio, rating, fecha)
└─ Testing: Mobile, filtros funcionan

[  ] Página de Paquete (Detalle)
ID: P0-015 | Estimado: 3 días | Sprint: 2
├─ Galería de fotos (carousel)
├─ Descripción larga
├─ Itinerario día por día
├─ Qué incluye (checkmarks)
├─ Próximas salidas (tabla)
├─ Precio transparente (con gastos)
├─ Reviews de clientes
├─ CTA: "RESERVAR AHORA"
└─ Testing: Todas las fotos cargan, links funcionan

[  ] Sistema de Reservas - Backend
ID: P0-016 | Estimado: 4 días | Sprint: 2
├─ POST /api/reservas (crear)
│  ├─ Validar usuario autenticado
│  ├─ Validar que exista salida + cupos
│  ├─ Generar número RES-2026-00001
│  ├─ Crear registro en tabla `reservas`
│  ├─ Enviar email de confirmación
│  └─ Retornar JSON con detalles
├─ GET /api/usuario/reservas (mis reservas)
├─ GET /api/usuario/reservas/:id (detalle)
├─ PUT /api/usuario/reservas/:id (actualizar estado)
├─ DELETE /api/usuario/reservas/:id (cancelar)
└─ Testing: Crear reserva, verificar email, verificar DB

[  ] Panel "Mi Reserva" - Frontend
ID: P0-017 | Estimado: 3 días | Sprint: 2
├─ Página /reservas/:id (solo user propietario)
├─ Mostrar:
│  ├─ Número de reserva
│  ├─ Estado actual (visual indicator)
│  ├─ Detalles paquete
│  ├─ Pasajeros
│  ├─ Total a pagar
│  ├─ Próximos pasos
│  ├─ Opciones de pago
│  └─ Chat con coordinador
├─ Acciones: modificar cantidad, cancelar, descargar PDF
└─ Testing: Only logged-in users, correct reserva shown
```

### P1 - ALTAS

```
[  ] Destinos - Listado
ID: P1-004 | Estimado: 2 días | Sprint: 2
├─ Página /destinos
├─ Cards de cada destino con:
│  ├─ Imagen principal
│  ├─ Nombre
│  ├─ Descripción corta (2 líneas)
│  ├─ "X paquetes disponibles"
│  └─ CTA: "Ver paquetes"
├─ Ordenamiento: alfabético, popuridad
└─ Testing: Cards responsive

[  ] Breadcrumbs
ID: P1-005 | Estimado: 1 día | Sprint: 2
├─ Componente Breadcrumb.astro
├─ Home > Destinos > Jujuy > Salinas Grandes
├─ Links funcionales
└─ Testing: Navegación correcta

[  ] Footer Mejorado
ID: P1-006 | Estimado: 1 día | Sprint: 2
├─ Columnas: Destinos, Agencia, Contacto, Legal
├─ Links a pages
├─ Redes sociales
├─ Copyright y legales
└─ Testing: Todos los links funcionan
```

---

## 🟠 SPRINT 3 (SEMANA 5-6): OPTIMIZACIÓN MVP

### P0 - CRÍTICAS

```
[  ] Email Automáticos
ID: P0-018 | Estimado: 3 días | Sprint: 3
├─ Setup Sendgrid (SMTP)
├─ Templates:
│  ├─ Reserva creada: número, próximos pasos
│  ├─ Confirmación completada: detalles
│  ├─ Recordatorio pago: monto, opciones
│  ├─ Bienvenida viaje: checklist, documentos
│  └─ Feedback post-viaje: survey
├─ Automation:
│  ├─ Trigger: POST /api/reservas → email
│  ├─ Scheduled: +3 días, +14 días, +0 días
│  └─ Cron jobs
└─ Testing: Revisar emails en bandeja

[  ] Integración WhatsApp (Twilio)
ID: P0-019 | Estimado: 3 días | Sprint: 3
├─ Crear cuenta Twilio
├─ Obtener número de teléfono
├─ Webhook para recibir mensajes
├─ Enviar confirmación por WhatsApp
├─ Guardar conversation history
├─ Notificar a Sonia de nuevas reservas
└─ Testing: Enviar y recibir mensajes

[  ] Panel "Mis Reservas" (Listado)
ID: P0-020 | Estimado: 2 días | Sprint: 3
├─ Página /usuario/reservas
├─ Tabla de reservas:
│  ├─ Número de reserva
│  ├─ Paquete
│  ├─ Fecha de viaje
│  ├─ Estado
│  └─ Acción: ver detalles
├─ Filtros: estado, fecha
└─ Testing: Mostrar solo reservas del usuario

[  ] SEO Base
ID: P0-021 | Estimado: 2 días | Sprint: 3
├─ Configurar meta tags globales
├─ Actualizar titles por página
├─ Meta descriptions (150-160 chars)
├─ Open Graph (og:title, og:image, og:description)
├─ Canonical tags
├─ robots.txt
├─ sitemap.xml (auto-generado)
└─ Testing: GSC, crawler verificar estructura

[  ] Performance Optimization
ID: P0-022 | Estimado: 3 días | Sprint: 3
├─ Image optimization:
│  ├─ Convertir a WebP
│  ├─ Multiple sizes (srcset)
│  ├─ Lazy loading
│  └─ CDN (Cloudinary)
├─ CSS minificación (automático Astro)
├─ JavaScript bundle:
│  ├─ Eliminar JS innecesario
│  ├─ Code splitting por ruta
│  └─ Defer scripts no-críticos
├─ Caching headers (Netlify)
└─ Testing: Lighthouse >90, LCP <1.5s

[  ] Testing Completo
ID: P0-023 | Estimado: 4 días | Sprint: 3
├─ Unit tests (Vitest):
│  ├─ Funciones utilitarias
│  ├─ Lógica de cálculos
│  └─ Filtrado de paquetes
├─ E2E tests (Playwright):
│  ├─ User signup flow
│  ├─ Create reservation flow
│  ├─ Login/logout
│  └─ Payment options
├─ Coverage: >70%
└─ Testing: Run tests en CI/CD (GitHub Actions)
```

### P1 - ALTAS

```
[  ] Documentación de API
ID: P1-007 | Estimado: 2 días | Sprint: 3
├─ OpenAPI/Swagger spec
├─ Ejemplos de requests/responses
├─ Errores y códigos HTTP
├─ Rate limiting info
└─ Deploy en /docs

[  ] Blog - Setup
ID: P1-008 | Estimado: 1 día | Sprint: 3
├─ Crear carpeta src/content/blog/
├─ Template de post (frontmatter + markdown)
├─ Página /blog (listado)
├─ Página /blog/[slug] (post individual)
└─ Testing: Crear post de prueba, verificar rendering
```

---

## 🟢 SPRINT 4 (SEMANA 7-8): EXPERIENCIA AVANZADA

### P1 - ALTAS

```
[  ] Mapa Interactivo
ID: P1-009 | Estimado: 4 días | Sprint: 4
├─ Mapbox GL JS integrado
├─ Destinos como markers
├─ Click marker → expande card:
│  ├─ Foto
│  ├─ 3-4 paquetes principales
│  ├─ Rating
│  └─ CTA "Ver todos"
├─ Filtros: clima, actividad
├─ Responsive (mobile-friendly)
└─ Testing: Click markers, filtros, mobile

[  ] Calculadora Presupuesto
ID: P1-010 | Estimado: 3 días | Sprint: 4
├─ Componente interactivo:
│  ├─ Slider duración (1-30 días)
│  ├─ Selector pasajeros (1-20)
│  ├─ Checkboxes extras (traslado, seguro)
│  ├─ Select Clase (economy/business/premium)
│  └─ Real-time total price
├─ Desglose transparente
├─ Share resultado por WhatsApp
└─ Testing: Todos los combos de precios

[  ] Chat en Vivo (Coordinador)
ID: P1-011 | Estimado: 4 días | Sprint: 4
├─ Widget Tawk.to o Intercom
├─ Integración con Sonia (coordinadora)
├─ Notificación automática en Slack
├─ Historial guardado
├─ Canned responses para preguntas frecuentes
├─ Business hours: 07:00-22:00
└─ Testing: Enviar mensajes, verificar notificación

[  ] Blog - Contenido
ID: P1-012 | Estimado: 5 días | Sprint: 4
├─ 20 posts de contenido:
│  ├─ 10x "Guía de destino" (Salinas, Jujuy, Salta, etc)
│  ├─ 5x "Consejos de viaje"
│  ├─ 3x "Mejores épocas"
│  ├─ 2x "Testimonios expandidos"
│  └─ Cada uno: 1500-2000 palabras, SEO optimizado
├─ Categorías y tags
├─ Búsqueda por keyword
└─ Testing: Verificar rendimiento con muchos posts

[  ] Optimización SEO Avanzada
ID: P1-013 | Estimado: 3 días | Sprint: 4
├─ Schema.org structured data:
│  ├─ LocalBusiness (para agencia)
│  ├─ Product (para paquetes)
│  ├─ AggregateRating (reviews)
│  ├─ Event (salidas/fechas)
│  └─ BreadcrumbList (navegación)
├─ JSON-LD implementado en Astro
├─ Validación en Schema.org validator
└─ Testing: Google Rich Results preview

[  ] Testimonios - Integración
ID: P1-014 | Estimado: 2 días | Sprint: 4
├─ Videos embebidos en:
│  ├─ Homepage (1 destacado)
│  ├─ Página de destino (2-3)
│  ├─ Página de paquete (2-3)
│  └─ Página de reviews
├─ Autoplay sin sonido (mobile-friendly)
├─ Subtítulos
└─ Testing: Videos cargan, caption accuracy
```

### P2 - MEDIANAS

```
[  ] Social Media Integration
ID: P2-001 | Estimado: 2 días | Sprint: 4
├─ Share buttons (WhatsApp, Facebook, Instagram)
├─ Open Graph meta tags (corrected)
├─ Instagram feed embed (opcional)
└─ Testing: Share links funcionan
```

---

## 🔵 SPRINT 5 (SEMANA 9-10): RETARGETING Y ESCALADO

### P1 - ALTAS

```
[  ] Google Ads Setup (Retargeting)
ID: P1-015 | Estimado: 2 días | Sprint: 5
├─ Google Ads Conversion Tracking
├─ Remarketing Lists (RLSA)
│  ├─ Visitaron homepage pero no paquetes
│  ├─ Vieron paquetes pero no reservaron
│  ├─ Iniciaron form pero abandonaron
│  └─ Ex-clientes (lookalike potential)
├─ Crear 3 campañas de retargeting
├─ Budget: $100k/mes
└─ Testing: Verificar que tracking funciona

[  ] Facebook/Instagram Ads Setup
ID: P1-016 | Estimado: 2 días | Sprint: 5
├─ Facebook Pixel en web
├─ Custom audiences:
│  ├─ Carrito abandonado
│  ├─ Visitantes web (pixel)
│  ├─ Email list (upload)
│  └─ Lookalike de clientes
├─ Crear 3 campañas
├─ Budget: $70k/mes
└─ Testing: Pixel firing correctamente

[  ] Email Retargeting
ID: P1-017 | Estimado: 2 días | Sprint: 5
├─ Segmentos automáticos basados en comportamiento:
│  ├─ No vieron paquetes (24h)
│  ├─ Vieron pero no reservaron (48h)
│  ├─ Form iniciado pero abandonado (24h)
│  ├─ Ex-clientes (mensual)
│  └─ Referidos potenciales (después de viaje)
├─ Flows de email automático
├─ A/B testing de subject lines
└─ Testing: Emails se disparan en momentos correctos

[  ] Dashboard de Métricas
ID: P1-018 | Estimado: 3 días | Sprint: 5
├─ Google Analytics 4 dashboard:
│  ├─ Daily revenue
│  ├─ Conversion funnel (vista → paquete → reserva)
│  ├─ Traffic sources
│  ├─ Device breakdown
│  └─ Cohort analysis
├─ Looker Studio (informe visual)
├─ Exportable a Excel/PDF
└─ Testing: Datos correctos vs realidad

[  ] Monitoreo y Alertas
ID: P1-019 | Estimado: 2 días | Sprint: 5
├─ Sentry (error tracking)
├─ Uptime monitoring (Pingdom)
├─ Performance monitoring (Vercel Analytics)
├─ Alertas por:
│  ├─ Conversión cae >20%
│  ├─ Error rate >1%
│  ├─ Response time >1s
│  └─ Downtime
└─ Notificaciones a Slack
```

### P2 - MEDIANAS

```
[  ] Programa de Referidos
ID: P2-002 | Estimado: 4 días | Sprint: 5
├─ Crear tabla `referidos` en Supabase
├─ Panel de referidos para usuarios
├─ Código único por usuario (PUCARA_FRANCO123)
├─ Tracking de referidos
├─ Rewards: $5k descuento siguiente viaje
├─ Share buttons pre-populated con código
└─ Testing: Crear referido, verificar reward
```

---

## 🔵 SPRINT 6 (SEMANA 11-12): REFINAMIENTO Y GO-LIVE

### P0 - CRÍTICAS

```
[  ] QA Final y Bug Fixing
ID: P0-024 | Estimado: 2 días | Sprint: 6
├─ Hotjar heatmaps review
├─ Identificar friction points
├─ Arreglar bugs encontrados
├─ Performance review (Lighthouse)
├─ Mobile testing exhaustivo
├─ Accesibilidad (WCAG 2.1 AA)
├─ Cross-browser testing
└─ Testing: 0 bugs críticos, 100% funcionalidad

[  ] Data Migration
ID: P0-025 | Estimado: 1 día | Sprint: 6
├─ Backup de Supabase (export)
├─ Backup de uploads (Cloudinary)
├─ Documentación del schema
├─ Plan de rollback
└─ Testing: Restore y verificar integridad

[  ] Training y Documentación
ID: P0-026 | Estimado: 2 días | Sprint: 6
├─ Crear documentación técnica:
│  ├─ Setup del proyecto
│  ├─ Arquitectura general
│  ├─ API reference
│  ├─ Database schema
│  └─ Deployment process
├─ Crear documentación de usuario:
│  ├─ Cómo usar dashboard de coordinador
│  ├─ Cómo procesar pagos
│  ├─ Cómo responder chats
│  ├─ Cómo crear nuevas salidas
│  └─ Troubleshooting
├─ Video tutorial (15 min)
└─ Training session con Sonia (1h)

[  ] GO-LIVE
ID: P0-027 | Estimado: 1 día | Sprint: 6
├─ Cambiar DNS a Netlify
├─ Verificar que todo carga
├─ Test de todas las funcionalidades
├─ Confirmar emails se envían
├─ Monitor 24/7 (primeras 24h)
├─ Comunicación a clientes (email + WhatsApp)
├─ Crear página "Bienvenida a nuevo sistema"
└─ On-call response 48h después del launch
```

### P1 - ALTAS

```
[  ] Entrenamiento Coordinadores
ID: P1-020 | Estimado: 1 día | Sprint: 6
├─ Session 1: Panel de coordinador (30 min)
├─ Session 2: Chat en vivo (15 min)
├─ Session 3: Procesamiento de pagos (30 min)
├─ Q&A session (30 min)
└─ Documentation compartida (Notion)

[  ] Comunicación de Launch
ID: P1-021 | Estimado: 1 día | Sprint: 6
├─ Email a clientes: "Nuevo sistema de reservas"
├─ WhatsApp: Anuncio a clientes recientes
├─ Instagram story: Teaser
├─ Blog post: "Mejoras en plataforma"
└─ FAQ actualizado con procesos nuevos
```

---

## 📋 BACKLOG ADICIONAL (Fase 2 - Post-Go-Live)

### P2 - MEDIANAS (POST-SPRINT 6)

```
[  ] Constructor de Itinerarios (Drag-Drop)
Estimado: 8 días

[  ] IA Recomendador (Machine Learning)
Estimado: 10 días

[  ] App Mobile (React Native)
Estimado: 30 días

[  ] Integración Vuelos y Hoteles
Estimado: 7 días

[  ] Marketplace (múltiples agencias)
Estimado: 20 días
```

---

## 🎯 DEPENDENCY MAP

```
Semana 1-2 (Quick Wins)
  ├─ Fotos reales ─────┐
  ├─ Testimonios video─┼─→ Semana 3-4 (Homepage)
  ├─ Setup Astro ──────┤
  └─ Analytics ────────┘

Semana 3-4 (MVP)
  ├─ Auth ─────────────────────────┐
  ├─ API de paquetes ──────────────┼─→ Semana 5-6 (Optimización)
  ├─ Sistema de reservas backend ──┤
  └─ Panel de usuario ─────────────┘

Semana 5-6 (Optimización)
  ├─ Testing ──────────────────────┐
  ├─ Performance optimization ─────┼─→ Semana 7-8 (Avanzada)
  ├─ SEO ──────────────────────────┤
  └─ Email automation ─────────────┘

Semana 7-8 (Avanzada)
  ├─ Chat en vivo ─────────────────┐
  ├─ Blog contenido ───────────────┼─→ Semana 9-10 (Retargeting)
  └─ Mapa + Calculadora ──────────┘

Semana 9-10 (Retargeting)
  └─ Ads setup ────────────────────→ Semana 11-12 (Launch)
```

---

## 📊 METRICS & KPIS A TRACKEAR

```
POR SPRINT:
├─ Semana 1-2: Conversión 3.5% → 5.5%
├─ Semana 3-4: Conversión 5.5% → 6.0%
├─ Semana 5-6: Conversión 6.0% → 6.5%
├─ Semana 7-8: Conversión 6.5% → 7.5%
├─ Semana 9-10: Conversión 7.5% → 8.5%
└─ Semana 11-12: Conversión 8.5% → 8.8%+

KPIs GENERALES:
├─ CTR cards: 20% → 50%+
├─ Form completion: 40% → 90%+
├─ Time on site: 2min → 4min+
├─ Bounce rate: 68% → 40%
├─ Email open rate: 20% → 35%+
├─ Chat satisfaction: N/A → 90%+
└─ NPS score: N/A → 60+
```

---

## ⚠️ RIESGOS IDENTIFICADOS

```
RIESGO: Dev atrasa
├─ Probabilidad: MEDIA
├─ Impacto: ALTO (timeline +2 semanas)
└─ Mitigación: Contratar 2nd dev si es necesario

RIESGO: Supabase downtime
├─ Probabilidad: BAJA
├─ Impacto: ALTO (reservas no se procesan)
└─ Mitigación: Backup automático, plan de rollback

RIESGO: Clientes confundidos con nuevo sistema
├─ Probabilidad: MEDIA
├─ Impacto: MEDIO (soporte extra)
└─ Mitigación: Email clarity, FAQ, video tutorial

RIESGO: Ads bajo ROAS
├─ Probabilidad: MEDIA
├─ Impacto: MEDIO (presupuesto se pierde)
└─ Mitigación: Daily monitoring, quick optimization
```

---

## ✅ ACCEPTANCE CRITERIA

```
SPRINT 1-2 DONE cuando:
[ ] Urgency messaging en vivo en 100% de cards
[ ] Form completion rate >85%
[ ] Conversión alcanza 5.5%
[ ] Testimonios video playables
[ ] Fotos reales visibles en web

SPRINT 3-4 DONE cuando:
[ ] Sistema de reservas funcionando end-to-end
[ ] Emails automáticos enviándose
[ ] Chat en vivo respondiendo
[ ] Blog con 10+ posts publicados
[ ] SEO score >85

SPRINT 5-6 DONE cuando:
[ ] Ads retargeting funcionando
[ ] Dashboard de métricas en vivo
[ ] 0 bugs críticos
[ ] NPS >60
[ ] GO-LIVE exitoso con <5% error rate
```

---

## 📞 CONTACT & ESCALATION

```
DURANTE DESARROLLO:
Daily standup: 10:00 AM
Weekly review: Friday 15:00

DURANTE LAUNCH:
On-call 24/7: Dev
Response time: <1h para críticas
Post-launch support: 48 horas

DESPUÉS:
Soporte business hours: 9-18
Weekly optimization meeting
Monthly roadmap review
```
