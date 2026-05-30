# Pucará Turismo - Sitio Web

Plataforma de reserva de viajes al norte argentino. Construida con Astro 4.8 + React + Supabase.

## 🚀 Stack Tecnológico

- **Frontend**: Astro 4.8 (SSG + SSR híbrido)
- **UI Components**: React 18 (interactive islands)
- **Styling**: Tailwind CSS 3.4
- **Type Safety**: TypeScript (strict mode)
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **State**: Zustand
- **Linting**: Biome
- **Testing**: Vitest
- **Deployment**: Netlify (frontend)

## 📋 Requisitos

- Node.js 18+ 
- npm 9+
- Cuenta Supabase

## 🔧 Instalación

```bash
# Clone
git clone <repo>
cd pucara-turismo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con credenciales Supabase
```

## 🏃 Desarrollo

```bash
# Servidor de desarrollo (localhost:3000)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Formatear código
npm run format
```

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes Astro y React
│   ├── Header.astro
│   ├── Hero.astro
│   ├── PaqueteCard.astro
│   ├── Footer.astro
│   └── ... más componentes
├── layouts/           # Layouts base (BaseLayout.astro)
├── pages/             # Rutas automáticas de Astro
│   ├── index.astro    # Página de inicio
│   ├── paquetes/      # Catálogo de paquetes
│   ├── destinos/      # Listado de destinos
│   ├── blog/          # Blog articles
│   └── api/           # API endpoints
├── lib/               # Funciones utilitarias
│   ├── supabase.ts    # Cliente Supabase
│   └── utils.ts       # Helpers (formatters, etc)
├── types/             # TypeScript types
├── data/              # Datos estáticos JSON
│   ├── paquetes.json
│   ├── destinos.json
│   └── extras.json
└── styles/            # Estilos globales

tailwind.config.js      # Configuración de Tailwind
tsconfig.json          # TypeScript config
astro.config.mjs       # Config de Astro
```

## 🗄️ Base de Datos (Supabase)

### Tablas principales

1. **usuarios** - Clientes registrados
   - id, nombre, email, telefono, fecha_registro, rol

2. **paquetes** - Paquetes turísticos
   - id, slug, titulo, destino, duracion_dias, duracion_noches, precio_base, gastos_admin, etc.

3. **salidas** - Fechas y disponibilidad
   - id, paquete_id, fecha_salida, cupos_totales, cupos_disponibles, estado

4. **reservas** - Reservaciones de clientes
   - id, usuario_id, salida_id, cantidad_pasajeros, total, estado, fecha_creacion

5. **disponibilidad** - Cache de disponibilidad en tiempo real
   - salida_id, cupos_libres, ocupacion, ultima_reserva_hace

6. **destinos** - Información de destinos
   - id, slug, nombre, provincia, descripcion, imagen, clima, etc.

7. **extras** - Servicios opcionales
   - id, nombre, precio, tipo, aplicable_a (JSON)

8. **chats** - Mensajería cliente-coordinador
   - id, reserva_id, usuario_id, contenido, timestamp, leido

### Configurar Base de Datos

```sql
-- Ver archivo SQL de schema en docs/schema.sql
-- Ejecutar en Supabase SQL Editor
```

## 🔐 Variables de Entorno

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=...
WHATSAPP_BUSINESS_PHONE_ID=...
WHATSAPP_BUSINESS_ACCESS_TOKEN=...
```

## 📊 Rendimiento

Target Web Vitals:
- **LCP** (Largest Contentful Paint): < 1.2s
- **FID** (First Input Delay): < 50ms
- **CLS** (Cumulative Layout Shift): < 0.05

Optimizaciones:
- Zero JavaScript por defecto (Astro Islands)
- Lazy loading de imágenes
- CSS crítico inline
- Compresión de assets

## 🚀 Deployment a Netlify

1. Conectar repo a Netlify
2. Build command: `npm run build`
3. Publish directory: `dist/`
4. Agregar variables de entorno en Netlify
5. Auto-deploy en cada push a main

## 📝 Convenciones de Código

- **Componentes**: PascalCase (Header.astro, PaqueteCard.astro)
- **Funciones**: camelCase (formatPrice, getWhatsappLink)
- **Constantes**: UPPER_SNAKE_CASE
- **Variables**: camelCase
- **Archivos**: kebab-case.ts

## 🔍 Linting y Formatting

```bash
# Lint con Biome
npm run lint

# Auto-format con Biome
npm run format

# Ambos
npm run lint:fix
```

## 🧪 Testing

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## 📚 Documentación

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Decisiones técnicas
- [FEATURES.md](docs/FEATURES.md) - Roadmap de features
- [UX-AUDIT.md](docs/UX-AUDIT.md) - Análisis de UX
- [CRO-REPORT.md](docs/CRO-REPORT.md) - Estrategia de conversión

## 🤝 Contribuir

1. Crear feature branch: `git checkout -b feature/nombre`
2. Commit cambios: `git commit -am 'Add feature'`
3. Push: `git push origin feature/nombre`
4. PR a main

## 📞 Soporte

- WhatsApp: +54 9 11 5000-0000
- Email: dev@pucaraturismo.com

## 📄 Licencia

Privado - Pucará Turismo 2024
