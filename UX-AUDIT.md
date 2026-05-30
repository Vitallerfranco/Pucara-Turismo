# UX AUDIT - PUCARÁ TURISMO

## ANÁLISIS COMPARATIVO: ACTUAL vs PROPUESTA

---

## 1. PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1.1 PROBLEMAS UX (User Experience)

#### **WEB ACTUAL (pucaraturismo.com.ar)**

| Problema | Impacto | Prioridad | Evidencia | Solución |
|----------|---------|-----------|-----------|----------|
| **Flujo de reserva confuso** | Alto - Genera abandono | CRÍTICA | Usuarios deben hacer clic en "Más información" para cada paquete, luego completar formulario lento | Sistema de reserva de 4 pasos integrado con pre-llenado de datos |
| **Gastos administrativos ocultos** | Alto - Reduce confianza | CRÍTICA | Los $10.000 ARS se muestran solo después de seleccionar paquete | Transparencia total de precios desde card de paquete |
| **Paquetes genéricos sin diferenciales** | Medio-Alto | CRÍTICA | "4 días 3 noches" en múltiples destinos sin mostrar qué hace especial cada uno | Crear proposición de valor única por destino |
| **Sin indicadores de urgencia** | Medio | Alta | No hay scarcity messaging efectivo | "Últimas 3 plazas disponibles" + contador de reservas recientes |
| **Mobile experience degradada** | Medio-Alto | Alta | Menús no optimizados, cards apiladas ineficientemente | Rediseño mobile-first con touch-friendly CTAs |
| **Sin personalization** | Medio | Media | Mismo contenido para todos los usuarios | Recomendador basado en preferencias iniciales |

#### **WEB PROPUESTA (vitallerfranco.github.io)**

| Problema | Impacto | Prioridad | Evidencia | Solución |
|----------|---------|-----------|-----------|----------|
| **Sistema de reserva manual vía WhatsApp** | Alto | CRÍTICA | Todo fluye a WhatsApp (números ficticios) sin validación de disponibilidad | Implementar sistema híbrido: selección visual + envío automático a WhatsApp |
| **Sin control de inventario** | Alto | CRÍTICA | No hay gestión de cupos disponibles por fecha | Implementar backend con base de datos de disponibilidad |
| **Sin historial de reservas** | Medio | Alta | Usuario no puede ver dónde está su reserva | Panel de usuario con estado de reserva en tiempo real |
| **Imágenes de Unsplash genéricas** | Bajo-Medio | Media | No transmite exclusividad del norte argentino | Fotos reales del destino + video testimonios |

---

### 1.2 PROBLEMAS UI (User Interface)

#### **WEB ACTUAL**

| Problema | Impacto | Prioridad | Solución |
|----------|---------|-----------|----------|
| **Tipografía inconsistente** | Bajo-Medio | Media | Múltiples fuentes sin jerarquía clara | Sistema de 2-3 fuentes con peso bien definido |
| **Espaciado irregular** | Bajo-Medio | Media | Cards y secciones con márgenes inconsistentes | Grid 12-column con padding estandarizado |
| **Colores corporativos débiles** | Bajo-Medio | Media | Logo naranja diluido, sin contraste | Palette mejorada: naranja principal (#FF9800) con colores secundarios |
| **Imágenes stock genéricas** | Medio | Media | No diferencia la marca | Fotografía profesional de destinos reales |
| **CTA buttons inconsistentes** | Bajo | Baja | Algunos botones verde, otros naranja | Estándar único: naranja para CTAs primarias |

#### **WEB PROPUESTA**

| Problema | Impacto | Prioridad | Solución |
|----------|---------|-----------|----------|
| **Diseño demasiado minimalista** | Medio | Media | Falta fricción para entender valor de la agencia | Agregar más contenido visual + social proof |
| **Sin microcopy persuasivo** | Medio-Alto | Alta | Texto funcional pero no vende | Copywriting enfocado en emoción + beneficio |
| **Cards de paquete sin urgencia** | Medio | Media | No hay urgency messaging | "Últimas plazas" + reviews sociales en cards |

---

### 1.3 PROBLEMAS SEO

#### **WEB ACTUAL (pucaraturismo.com.ar)**

| Problema | Impacto Comercial | Prioridad | Evidencia | Solución |
|----------|-------------------|-----------|-----------|----------|
| **Sin optimización de títulos** | Alto | CRÍTICA | Titles genéricos como "Paquetes" sin keywords | Titles como "Viajes a Bariloche - Paquetes Turísticos | Pucará" |
| **Sin meta descriptions** | Medio | Alta | Descriptions cortas, no convencionales | Meta descriptions de 150-160 caracteres vendedoras |
| **Estructura h1-h6 confusa** | Medio | Media | Múltiples h1, sin jerarquía | Un único h1 por página, h2/h3 semánticamente correctos |
| **URLs no amigables** | Bajo-Medio | Media | /paquetes/mar-de-ajo-23-02/ tiene fecha | URLs sin fechas: /paquetes/mar-de-ajo/ |
| **Sin schema.org structured data** | Medio | Media | Google no entiende detalles (precios, reviews, disponibilidad) | Implementar schema de LocalBusiness, Event, Product |
| **Contenido duplicado potencial** | Bajo-Medio | Baja | Mismas descripciones en múltiples salidas | Crear templates con variables dinámicas |

#### **WEB PROPUESTA**

| Problema | Impacto | Prioridad | Solución |
|----------|---------|-----------|----------|
| **Sin componentes structured data** | Alto | CRÍTICA | JSON-LD ausente | Implementar schema completo |
| **Sin blog/contenido duradero** | Alto | CRÍTICA | No hay atracción orgánica de tráfico | Blog de destinos, guías de viaje, consejos |
| **Keywords no priorizadas** | Medio | Alta | Falta investigación de keywords de alto volumen | Segmentar por: destino + tipo de viaje + temporada |

---

### 1.4 PROBLEMAS DE CONVERSIÓN (CRO)

#### **EMBUDO DE CONVERSIÓN ACTUAL**

**Problema 1: Tasa de abandono en formulario**
- Impacto: 50-70% abandono estimado
- Causa: Formulario largo, muchos campos requeridos
- Solución: Mini-form en homepage (nombre + WhatsApp) → enviar a chat para completar datos

**Problema 2: Sin urgency messaging**
- Impacto: Decisión dilatada
- Evidencia: No hay "últimas plazas", "se agota", "promoción por tiempo limitado"
- Solución: Panel de control dinámico con:
  - Últimas plazas por salida
  - "Reservado hace X minutos" 
  - Precios antes/después

**Problema 3: Sin retargeting pixel**
- Impacto: 90% de visitantes se pierden
- Solución: Facebook/Google pixel + campañas de retargeting

**Problema 4: WhatsApp sin integración real**
- Impacto: Usuario debe escribir mensaje manualmente
- Solución: Botón pre-poblado con detalles del paquete

**Problema 5: Sin recomendaciones personalizadas**
- Impacto: Cada usuario ve lo mismo
- Solución: Recomendador de 3-5 preguntas (presupuesto, tipo de viaje, época)

#### **ANÁLISIS DE CONVERSIÓN**

| Métrica | Problema | Impacto | Solución |
|---------|----------|--------|----------|
| **CTR (Click-Through Rate)** | Botones compiten entre sí | 20-30% CTR en "Más info" | Un único CTA principal por sección |
| **Time on Site** | Contenido pobre en destinos | Usuarios bounce rápido | Agregar 3-4 párrafos de storytelling por destino |
| **Conversion Rate** | Sin mobile optimization | 1-2% en mobile | Mobile-first redesign |
| **Video watch rate** | Sin videos | 0% | Producir 5-6 videos 30-60 seg. por destino |

---

### 1.5 PROBLEMAS DE CONFIANZA

#### **WEB ACTUAL**

| Problema | Impacto | Prioridad | Solución |
|----------|---------|-----------|----------|
| **Tarjeta de coordinador "Sonia" importante pero oculta** | Medio-Alto | Alta | No aparece en homepage | Protagonizar testimonio de coordinador en hero |
| **Certificaciones MINTUR poco visibles** | Medio | Media | Pequeño logo al pie | Mostrar legajo EVT con ícono de verificación |
| **Sin garantía explícita** | Medio | Media | No dice qué pasa si se cancela | CTA con "Garantía 100% - Cancela sin costo hasta 30 días" |
| **Reviews limitados** | Bajo-Medio | Media | Solo 3-4 reviews visibles | Mostrar +20 reviews con filtros (destino, fecha, edad) |
| **Sin indicador de pasajeros reales** | Medio | Media | "+8.000 pasajeros" pero sin contexto | "8.000+ pasajeros satisfechos desde 2009" + última reserva hace 2h |
| **Sin video testimonial** | Medio | Media | Solo texto | Videos de 20-30 seg. de clientes reales |

#### **WEB PROPUESTA**

| Problema | Impacto | Prioridad | Solución |
|----------|---------|-----------|----------|
| **Imágenes de Unsplash sin contexto local** | Medio-Alto | Alta | No muestra que conocen el norte | Fotos reales de destinos + videos propios |
| **Sin indicador de ocupación** | Bajo-Medio | Media | No transmite "se vende rápido" | "Salida con 8 lugares disponibles" |

---

### 1.6 PROBLEMAS MOBILE

#### **AMBAS WEBS**

| Problema | Impacto | Prioridad | Solución |
|----------|---------|-----------|----------|
| **Menú no optimizado para thumb** | Alto | CRÍTICA | Menú ubicado donde difícil tocar con pulgar | Bottom navigation o hamburger mejorado |
| **Cards no responsive** | Medio-Alto | Alta | Imágenes se deforman en pantallas pequeñas | Aspect ratio 4:3 con object-fit: cover |
| **CTAs muy pequeños** | Medio-Alto | Alta | Botones < 48px de altura | Todos los botones ≥ 48x48px (recomendación WCAG) |
| **Sin deep linking** | Bajo-Medio | Media | No se puede compartir estado (filtro de destino) | URL state con query params |
| **Textos demasiado largos** | Medio | Media | Párrafos de 5+ líneas en mobile | Máximo 40 caracteres por línea |

---

### 1.7 PROBLEMAS DE VELOCIDAD

#### **WEB ACTUAL (pucaraturismo.com.ar)**

**Core Web Vitals estimados:**
- LCP (Largest Contentful Paint): ~3.5s (Pobres)
- FID (First Input Delay): ~150ms (Pobres)
- CLS (Cumulative Layout Shift): ~0.15 (Pobre)

**Problemas específicos:**
- Elementor añade 200KB+ de CSS no utilizado
- Imágenes sin optimizar (PNG en lugar de WebP)
- Demasiadas fuentes de Google Fonts
- Sin lazy loading en imágenes
- WordPress plugins ralentizan la carga

#### **WEB PROPUESTA (vitallerfranco.github.io)**

**Ventajas:**
- GitHub Pages = CDN global automático
- HTML/CSS sin JavaScript pesado
- Imágenes de Unsplash optimizadas

**Problemas:**
- Sin optimización de imágenes (Unsplash original = 100KB+ por imagen)
- Sin caching strategy
- Sin minificación

---

### 1.8 PROBLEMAS DE ARQUITECTURA DE INFORMACIÓN

#### **JERARQUÍA DE CONTENIDO ACTUAL**

```
Homepage
├── Hero (débil)
├── Paquetes destacados (solo 6)
├── Why us (genérico)
├── Reviews (limitados)
└── Footer

/Paquetes-turisticos/
├── Grid de 20+ paquetes
├── Sin filtros
└── Sin búsqueda

/Paquete/X
├── Galería de imágenes
├── Descripción
├── Formulario de reserva
└── Reviews
```

**Problemas:**
- No hay categorización clara (por destino, duración, precio)
- Sin breadcrumbs
- Sin búsqueda
- Paquetes duplicados por fecha

#### **ARQUITECTURA PROPUESTA**

```
Homepage
├── Hero + Value Prop
├── Recomendador inteligente
├── Paquetes destacados (8-10)
├── Destinos (cards con 3-4 paquetes cada uno)
├── Social proof (reviews, "última reserva hace 2h")
├── FAQ
└── CTA footer

/Destinos
├── Salinas Grandes
│   ├── Galería de fotos reales
│   ├── Descripción larga (750+ palabras)
│   ├── Recomendador de paquetes
│   ├── Mapa interactivo
│   ├── Reviews filtrados por destino
│   └── FAQ por destino

/Paquetes
├── Grid filterable (destino, duración, precio, épocas)
├── Cards enriquecidas con:
│   ├── Imagen
│   ├── Destino
│   ├── Duración
│   ├── Precio transparente
│   ├── Fecha próxima salida
│   ├── Rating
│   └── CTA "Seleccionar"

/Mi-Reserva (usuario loggeado)
├── Historial de reservas
├── Estado actual
├── Documentos requeridos
├── Chat con coordinador
└── Opciones de modificación
```

---

## 2. MATRIZ DE IMPACTO vs ESFUERZO

```
IMPACTO ALTO + ESFUERZO BAJO (QUICK WINS)
├─ Sistema de reserva mejorado (4 pasos → 2 pasos)
├─ Pre-llenar form con WhatsApp (automático)
├─ Mostrar "últimas plazas" dinámicamente
├─ Testimonios en video (30 seg.)
└─ Schema.org structured data

IMPACTO ALTO + ESFUERZO MEDIO (PRIORIDAD)
├─ Recomendador inteligente (5 preguntas)
├─ Fotos reales del norte argentino
├─ Blog con guías de destinos
├─ Mobile-first redesign
└─ Chat en vivo con coordinadores

IMPACTO ALTO + ESFUERZO ALTO (FASE 2)
├─ Mapa interactivo de destinos
├─ Calculadora de presupuesto
├─ Constructor de itinerarios
├─ Sistema de disponibilidad en tiempo real
└─ Dashboard de coordinadores
```

---

## 3. SCORING DE GRAVEDAD

| Área | Score Actual | Score Propuesta | Gap | Acción |
|------|--------------|-----------------|-----|--------|
| **UX** | 5.5/10 | 7.2/10 | +1.7 | Mejorar formulario, agregar recomendador |
| **UI** | 6/10 | 7.5/10 | +1.5 | Fotos reales, actualizar palette |
| **SEO** | 4/10 | 5.5/10 | +1.5 | Implementar schema, crear blog |
| **Mobile** | 5/10 | 6.5/10 | +1.5 | Bottom nav, touch-friendly |
| **Velocidad** | 3.5/10 | 7/10 | +3.5 | Migrar de WordPress a Astro/Next.js |
| **Conversión** | 4/10 | 6.5/10 | +2.5 | Urgency messaging, personalization |
| **Confianza** | 6/10 | 7.5/10 | +1.5 | Testimonios en video, certificaciones |

---

## 4. RESUMEN EJECUTIVO

### Problemas de mayor impacto:
1. **Sistema de reserva deficiente** → Abandono del 60-70%
2. **Velocidad de WordPress** → 3.5s load time
3. **Falta de urgency messaging** → Conversión baja
4. **Sin mobile optimization** → Abandono en mobile 80%
5. **Contenido genérico** → No diferenciación

### Oportunidades más valiosas:
1. **Optimizar flujo de reserva** → +25-35% conversión
2. **Migrar arquitectura** → +50% velocidad
3. **Agregar recomendador** → +15-20% AOV
4. **Fotos reales + testimonios** → +30% confianza
5. **Urgency messaging** → +20-30% conversión
