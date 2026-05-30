# ROADMAP.md - PLAN DE IMPLEMENTACIÓN (12 SEMANAS)

---

## TIMELINE EJECUTIVO

```
SEMANA 1-2:   QUICK WINS (Fase Alpha)
SEMANA 3-4:   MVP FUNCIONAL (Fase Beta)
SEMANA 5-6:   OPTIMIZACIÓN (Fase Launch Prep)
SEMANA 7-8:   EXPERIENCIA AVANZADA
SEMANA 9-10:  ESCALADO Y RETARGETING
SEMANA 11-12: REFINAMIENTO Y GO-LIVE
```

---

## 📊 SEMANA 1-2: QUICK WINS (MÁXIMO IMPACTO, MÍNIMO ESFUERZO)

### Objetivo
Implementar cambios rápidos con ROI inmediato (+40-50% conversión)

### 🎯 TAREA 1.1: Urgency Messaging Dinámico (5 días)

**Qué se implementa:**
- Mostrar "Últimas X plazas" en cards
- Indicador visual de ocupación (8/10)
- "Reservado hace X minutos"
- Contador dinámico actualizando cada minuto

**Técnico:**
```typescript
// src/components/PaqueteCard.astro
const disponibilidad = await supabase
  .from('disponibilidad')
  .select('*')
  .eq('salida_id', salida.id)
  .single();

const tiempoDesdeUltimaReserva = 
  Math.floor((Date.now() - disponibilidad.last_reserved_at) / 60000);

export const prerender = false; // Dynamic rendering
```

**Impacto esperado:**
- +25-30% CTR en cards
- +15-20% conversión

**Completada:** ✓ Día 5

---

### 🎯 TAREA 1.2: Recomendador Simple (5 preguntas) (5 días)

**Qué se implementa:**
```
Quiz modal en homepage:
1. ¿Cuántos días? → Filtra duración
2. ¿Tipo viaje? → Filtra tags
3. ¿Presupuesto? → Filtra precio
4. ¿Cuándo? → Filtra épocas
5. ¿Con quién? → Filtra tipo viajero

RESULTADO: 4-5 paquetes con "Match Score"
```

**Técnico:**
```typescript
// src/components/Recomendador.jsx
function generarMatches(answers) {
  // Query con múltiples filtros
  const paquetes = await supabase
    .from('paquetes')
    .select('*')
    .eq('activo', true)
    // Aplicar filtros de answers
    .order('rating', { ascending: false })
    .limit(5);
  
  // Calcular match score
  const withScore = paquetes.map(p => ({
    ...p,
    match: calcularMatch(p, answers)
  }));
  
  return withScore.sort((a, b) => b.match - a.match);
}
```

**Impacto esperado:**
- +18-22% conversión a paquete
- -40% tiempo en búsqueda

**Completada:** ✓ Día 10

---

### 🎯 TAREA 1.3: Mini-form WhatsApp Mejorado (3 días)

**Qué se implementa:**
- Reemplazar formulario de 10+ campos por modal de 2 campos
- Nombre + WhatsApp
- Mensaje pre-poblado con detalles del paquete
- Confirmación inmediata

**UI:**
```
Modal:
┌─────────────────────────────────────┐
│ 🎉 Casi listo para tu viaje         │
├─────────────────────────────────────┤
│ Tu nombre: [FRANCO_____________]    │
│ WhatsApp: [+54 9 11 ___________]    │
│                                     │
│ ℹ️ Te enviaremos detalles y próx    │
│    pasos por WhatsApp en <5 min     │
│                                     │
│ [CONTINUAR →] [NO, GRACIAS]        │
└─────────────────────────────────────┘

Mensaje generado automáticamente:
"Hola, quiero reservar:
📌 Salinas Grandes
📅 15/07/2026
👥 4 pasajeros
💰 $290.000 x persona

¿Disponibilidad y próximos pasos?"
```

**Impacto esperado:**
- +50-60% form completion
- +40% conversión a reserva

**Completada:** ✓ Día 13

---

### 🎯 TAREA 1.4: Fotos Reales - Sesión Fotográfica (10 días)

**Qué se implementa:**
- Fotógrafo viaja a principales destinos
- Captura 150-200 fotos profesionales por destino
- Edición + optimización web

**Destinos prioritarios:**
1. Salinas Grandes (Jujuy) - 150 fotos
2. Jujuy Centro (Purmamarca, Tilcara) - 150 fotos
3. Salta (Cafayate, Valles) - 150 fotos
4. Adicionales (Mendoza, Iguazu) - 100 fotos

**Proceso:**
- Día 1-5: Fotógrafo en terreno
- Día 6-8: Selección de mejores (500 fotos)
- Día 9-10: Edición + optimización

**Completada:** ✓ Día 12 (puede correr en paralelo)

---

### 🎯 TAREA 1.5: Testimonios en Video (10 días)

**Qué se implementa:**
- Contactar clientes recientes
- Grabar videos 20-45 seg de cada uno
- Edición básica + subtítulos
- Upload a Vimeo/YouTube

**Proceso:**
- Día 1-3: Contactar + coordinar (5-10 clientes)
- Día 4-8: Grabación (teléfono, auténtico)
- Día 9-10: Edición + upload

**Completada:** ✓ Día 12 (paralelo)

---

### 📈 RESULTADOS ESPERADOS SEMANA 1-2

```
Métrica                 | Antes | Después | Lift
─────────────────────────┼───────┼─────────┼─────
Bounce rate             | 68%   | 55%     | -13pp
Time on site            | 2min  | 2.5min  | +25%
Cards CTR               | 20%   | 50%     | +150%
Form completion         | 40%   | 90%     | +125%
Paquete CTR             | 15%   | 40%     | +167%
Conversión reserva      | 3.5%  | 5.5%    | +57%
─────────────────────────┴───────┴─────────┴─────

Revenue esperado: $49M → $65M/mes (+32%)
```

---

## 📊 SEMANA 3-4: MVP FUNCIONAL (ARQUITECTURA BASE)

### Objetivo
Tener plataforma funcional con sistema de reservas real

### 🎯 TAREA 2.1: Setup Astro + Supabase (5 días)

**Qué se implementa:**
```
Project setup:
✓ Proyecto Astro con TypeScript
✓ Tailwind CSS configurado
✓ Proyecto Supabase (PostgreSQL)
✓ Schema de BDD (paquetes, salidas, reservas)
✓ Auth setup (email + Google OAuth)
✓ GitHub + CI/CD (Netlify deploy automático)
```

**Completada:** ✓ Día 19

---

### 🎯 TAREA 2.2: Componentes Base (5 días)

**Qué se implementa:**
```
Header/Nav: Logo, menú, CTA WhatsApp
Hero: Nuevo copy + CTA + urgency messaging
Footer: Links, redes, contacto
Card de paquete: Mejora con metadata
Breadcrumbs: Para navegación
```

**Completada:** ✓ Día 24

---

### 🎯 TAREA 2.3: Páginas Estáticas (SSG) (3 días)

**Qué se implementa:**
```
/ (Homepage)
/destinos (Listado)
/destinos/salinas-grandes (Detail)
/paquetes (Listado)
/paquetes/[id] (Detail)
/blog (Listado articulos)
/blog/[slug] (Articulo)
/faq
/sobre-nosotros
/contacto
```

**Completada:** ✓ Día 27

---

### 🎯 TAREA 2.4: Sistema de Autenticación (3 días)

**Qué se implementa:**
```
✓ Email + contraseña
✓ Google OAuth
✓ Magic Link (opcional)
✓ JWT token management
✓ Refresh token strategy
✓ Logout
```

**Completada:** ✓ Día 30

---

### 🎯 TAREA 2.5: APIs Base (5 días)

**Qué se implementa:**
```
GET    /api/paquetes
GET    /api/paquetes/:id
GET    /api/destinos
POST   /api/auth/login
POST   /api/auth/register
GET    /api/usuario/perfil
```

**Completada:** ✓ Día 30

---

### 📈 RESULTADOS ESPERADOS SEMANA 3-4

```
Métrica                 | Esperado
─────────────────────────┼──────────
Arquitectura lista      | ✓ 100%
Deployment automático   | ✓ Netlify
LCP (homepage)          | ~1.5s ✓
FID                     | <50ms ✓
Usuarios pueden login   | ✓ Sí
───────────────────────────────────
```

---

## 📊 SEMANA 5-6: OPTIMIZACIÓN (MVP RESERVAS)

### Objetivo
Sistema de reservas funcional end-to-end

### 🎯 TAREA 3.1: Sistema de Reservas (5 días)

**Qué se implementa:**
```
PASO 1: Seleccionar paquete + fecha
POST /api/reservas → Crear pre-reserva
Estado: 'pre-reserva'

PASO 2: Seleccionar pasajeros + extras
PUT /api/reservas/:id → Actualizar cantidad

PASO 3: Mini-form (nombre + WhatsApp)
PUT /api/reservas/:id → Actualizar contacto
Generar número de reserva: RES-2026-00001

PASO 4: Confirmación + envío WhatsApp
GET /api/whatsapp-link → Mensaje pre-poblado
Usuario abre WhatsApp
```

**Completada:** ✓ Día 35

---

### 🎯 TAREA 3.2: Panel "Mi Reserva" (5 días)

**Qué se implementa:**
```
GET /api/usuario/reservas/:id

Mostrar:
- Número de reserva
- Estado actual
- Detalles del paquete
- Opciones de pago
- Documentos requeridos
- Chat con coordinador
- Próximos pasos
```

**Completada:** ✓ Día 40

---

### 🎯 TAREA 3.3: Notificaciones Automáticas (3 días)

**Qué se implementa:**
```
Email automáticos:
- Día 1: Reserva creada + número
- Día 3: "Completa tus datos"
- Día 5: "Opciones de pago"
- Día 14: "Se acerca tu viaje"
- Día 0: "¡Buen viaje!"

WhatsApp automáticos (vía Twilio):
- "Tu coordinadora Sonia está lista para ayudarte"
```

**Completada:** ✓ Día 43

---

### 🎯 TAREA 3.4: Testing & QA (4 días)

**Qué se implementa:**
```
✓ Tests unitarios (Vitest)
✓ Tests E2E (Playwright)
✓ Performance testing (Lighthouse)
✓ Security testing (OWASP Top 10)
✓ Cross-browser testing
```

**Completada:** ✓ Día 27

---

### 📈 RESULTADOS ESPERADOS SEMANA 5-6

```
Métrica                     | Esperado
──────────────────────────────┼──────────
MVP Reservas funcional      | ✓ 100%
Usuarios pueden reservar    | ✓ Sí
Email automáticos           | ✓ 100%
Test coverage               | ✓ 70%+
Conversión estimada         | ~6.5%
───────────────────────────────────────

Revenue esperado: $49M → $95M/mes (+94%)
```

---

## 📊 SEMANA 7-8: EXPERIENCIA AVANZADA

### Objetivo
Funcionalidades que diferencian vs competencia

### 🎯 TAREA 4.1: Mapa Interactivo (4 días)

**Qué implementar:**
```
- Mapbox GL integrado
- Markers por destino
- Click → expande card con paquetes
- Filtros: clima, actividad, duración
```

**Completada:** ✓ Día 52

---

### 🎯 TAREA 4.2: Calculadora de Presupuesto (3 días)

**Qué implementar:**
```
- Slider duración → precio actualiza
- Selector pasajeros → precio total
- Checkboxes extras → suma al total
- Desglose transparente
```

**Completada:** ✓ Día 55

---

### 🎯 TAREA 4.3: Chat en Vivo (Sonia) (4 días)

**Qué implementar:**
```
- Widget en esquina inferior derecha
- Historial de chat guardado
- Notificación a Sonia en Slack
- Response time <5 min
- Escalation a Tawk.to o Intercom
```

**Completada:** ✓ Día 59

---

### 🎯 TAREA 4.4: Optimización SEO (3 días)

**Qué implementar:**
```
✓ Títulos y meta descriptions
✓ Schema.org (LocalBusiness, Product, Event)
✓ Sitemap.xml automático
✓ robots.txt
✓ Open Graph tags
✓ Canonical tags
✓ Structured data para reviews
```

**Completada:** ✓ Día 62

---

### 📈 RESULTADOS ESPERADOS SEMANA 7-8

```
Métrica                     | Esperado
──────────────────────────────┼──────────
Engagement time              | +35%
Pages per session            | 5.5 ↑
Organic traffic              | 40% (blog)
Chat satisfaction            | 90%+
Conversión estimada          | ~7.5%
───────────────────────────────────────

Revenue esperado: $49M → $125M/mes (+155%)
```

---

## 📊 SEMANA 9-10: ESCALADO Y RETARGETING

### Objetivo
Traer usuarios perdidos de vuelta + crecer traffic

### 🎯 TAREA 5.1: Google Ads Retargeting (2 días)

**Qué implementar:**
```
Segmento 1: Visitaron pero no vieron paquetes
├─ Anuncio: "Empieza en 2 minutos"
├─ Budget: 30% ($30k)

Segmento 2: Vieron paquetes pero no reservaron
├─ Anuncio: "Últimas plazas disponibles"
├─ Budget: 50% ($50k)

Segmento 3: Abandonaron form
├─ Anuncio: "¿Dudas? Chat en vivo"
├─ Budget: 20% ($20k)

Total budget: $100k/mes
```

**Completada:** ✓ Día 65

---

### 🎯 TAREA 5.2: Facebook/Instagram Ads (3 días)

**Qué implementar:**
```
Campaña 1: Carrito abandonado
├─ Creative: Imagen del paquete
├─ Oferta: "Completa tu reserva"
├─ Budget: $30k/mes

Campaña 2: Lookalike (clientes pasados)
├─ Creative: Testimonios en video
├─ Oferta: "Referido = 10% descuento"
├─ Budget: $20k/mes

Campaña 3: Awareness (top of funnel)
├─ Creative: Fotos reales destinos
├─ Oferta: "Descubre el norte argentino"
├─ Budget: $20k/mes

Total: $70k/mes
```

**Completada:** ✓ Día 68

---

### 🎯 TAREA 5.3: Email Remarketing (2 días)

**Qué implementar:**
```
Segmento 1: No vieron paquetes (24h)
├─ Subject: "Tu viaje perfecto espera"
├─ CTA: Ir a paquetes

Segmento 2: Vieron pero no reservaron (48h)
├─ Subject: "Última oportunidad - Salida 15/07"
├─ CTA: Reservar ahora

Segmento 3: Form iniciado pero no completó (24h)
├─ Subject: "¿Necesitas ayuda?"
├─ CTA: Chat con Sonia

Segmento 4: Ex-clientes (30+ días)
├─ Subject: "Bienvenido de vuelta"
├─ CTA: Ver nuevos destinos
```

**Completada:** ✓ Día 70

---

### 🎯 TAREA 5.4: Analytics + Dashboard (3 días)

**Qué implementar:**
```
✓ Google Analytics 4 setup
✓ Eventos: reserva, form submit, video play
✓ Conversion tracking
✓ Cohorte analysis
✓ Dashboard (Looker Studio)
  - Daily revenue
  - Conversion funnel
  - Traffic sources
  - CAC por canal
```

**Completada:** ✓ Día 73

---

### 📈 RESULTADOS ESPERADOS SEMANA 9-10

```
Métrica                     | Esperado
──────────────────────────────┼──────────
Traffic total               | +50%
Google Ads conversión       | 5%+
Facebook ROAS               | 4:1+
Email open rate             | 35%+
Email CTR                   | 8%+
Conversión total            | ~8.5%
───────────────────────────────────────

Revenue esperado: $49M → $175M/mes (+257%)
```

---

## 📊 SEMANA 11-12: REFINAMIENTO Y GO-LIVE

### Objetivo
Pulir detalles, entrenar equipo, lanzar al público

### 🎯 TAREA 6.1: Pulido UX (2 días)

**Qué implementar:**
```
✓ Revisar heatmaps (Hotjar)
✓ Arreglar friction points
✓ Mobile testing exhaustivo
✓ Accesibilidad (WCAG 2.1 AA)
✓ Rendimiento final
```

**Completada:** ✓ Día 79

---

### 🎯 TAREA 6.2: Entrenamiento de coordinadores (1 día)

**Qué implementar:**
```
- Cómo usar panel de coordinador
- Responder chats en vivo
- Procesar pagos
- Enviar documentos
- Actualizar estado de reservas
- Reportes
```

**Completada:** ✓ Día 80

---

### 🎯 TAREA 6.3: Comunicación con clientes (1 día)

**Qué implementar:**
```
- Email: "Nuevo sistema de reservas disponible"
- WhatsApp: Anuncio a clientes recientes
- Social: Instagram/TikTok teaser
- Landing page: Explicar cambios
```

**Completada:** ✓ Día 81

---

### 🎯 TAREA 6.4: GO-LIVE (1 día)

**Qué implementar:**
```
- DNS pointing a Netlify
- Backups finales
- Monitoreo 24/7 (primeras 24h)
- Documentación de troubleshooting
- On-call response (primeros 3 días)
```

**Completada:** ✓ Día 82

---

### 📈 RESULTADOS ESPERADOS SEMANA 11-12

```
Métrica                     | Esperado
──────────────────────────────┼──────────
Bugs en producción           | <5
Response time (P95)          | <500ms
Uptime                       | 99.9%
Usuarios activos             | 500+/semana
Satisfacción (NPS)           | 60+
───────────────────────────────────────

Revenue esperado: $49M → $210M/mes (+329%)
```

---

## 📊 IMPACTO TOTAL (12 SEMANAS)

### Conversión Progression

```
Semana 1-2:   3.5% → 5.5%  (+57%)
Semana 3-4:   5.5% → 6.0%  (+9%)
Semana 5-6:   6.0% → 6.5%  (+8%)
Semana 7-8:   6.5% → 7.5%  (+15%)
Semana 9-10:  7.5% → 8.5%  (+13%)
Semana 11-12: 8.5% → 8.8%  (+4%)

TOTAL: 3.5% → 8.8% (+151%)
```

### Revenue Progression

```
Baseline: $49M/mes

Semana 2:  $65M  (+32%)
Semana 4:  $75M  (+53%)
Semana 6:  $95M  (+94%)
Semana 8:  $125M (+155%)
Semana 10: $175M (+257%)
Semana 12: $210M (+329%)

Total incremental (12 semanas): ~$1,800M de revenue nuevo
```

### Investment vs Return

```
Inversión:
├─ Desarrollo: $200k (12 semanas, 1 dev)
├─ Marketing/CRO: $150k (Google + Facebook ads)
├─ Fotos + videos: $35k
├─ Herramientas: $20k
└─ Total: $405k

ROI (12 semanas):
├─ Incremental revenue: $1,800M
├─ Profit margin (típico): 35% = $630M
├─ ROI: 155,000%

Payback period: <1 día
```

---

## 🎯 DEPENDENCIAS Y RIESGOS

### Dependencias Críticas

```
1. Fotos reales disponibles ANTES de semana 2
   → Si no: usar fotos de Unsplash mejoradas
   
2. Testimonios en video ANTES de semana 2
   → Si no: usar testimonios de texto con rating
   
3. Equipo de 1 dev full-stack disponible
   → Si no: contratar o extender timeline a 16 semanas
   
4. Sonia (coordinadora) disponible para chat en vivo
   → Si no: contratar support agent adicional
```

### Riesgos Potenciales

```
RIESGO ALTO:
- Desarrollo atrasa (mitigación: hire 2nd dev)
- Supabase downtime (mitigación: backup manual)

RIESGO MEDIO:
- Clientes confundidos con nuevo sistema
  (mitigación: email clarity + FAQ)
- Falta de contenido blog
  (mitigación: contratar copywriter freelance)

RIESGO BAJO:
- Google Ads bajo ROAS
  (mitigación: ajustar targeting + copy)
```

---

## ✅ SUCCESS CRITERIA

```
SEMANA 2:
✓ Urgency messaging en vivo
✓ Form completion >85%
✓ Conversión >5%

SEMANA 4:
✓ MVP funcional
✓ 100+ reservas procesadas
✓ 0 bugs críticos

SEMANA 8:
✓ Conversión >7%
✓ Mapa + calculadora working
✓ Chat <5min response time

SEMANA 12:
✓ Conversión >8.5%
✓ 500+ usuarios/semana
✓ NPS >60
✓ 99.9% uptime
```

---

## 📋 PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 CRÍTICO (No postergar)
1. Mini-form WhatsApp
2. Recomendador simple
3. Urgency messaging
4. Sistema de reservas base

### 🟡 IMPORTANTE (Semana 5-8)
5. Mapa interactivo
6. Calculadora presupuesto
7. Chat en vivo
8. SEO completo

### 🟢 VALOR AGREGADO (Semana 9+)
9. Constructor itinerarios
10. IA Recomendador
11. Programa de referidos

---

## 📞 CONTACTO POST-IMPLEMENTACIÓN

```
Durante primeras 30 días:
- On-call 24/7 (dev): <1h response
- Daily standup: 10:00 AM
- Weekly review: Friday

Después de 30 días:
- Soporte business hours (8-18)
- Weekly optimization meeting
- Monthly roadmap review
```

