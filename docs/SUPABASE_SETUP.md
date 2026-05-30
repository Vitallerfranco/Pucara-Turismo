# Guía de Configuración - Supabase

Instrucciones paso a paso para configurar Pucará Turismo en Supabase.

## 1. Crear Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Completa el formulario:
   - **Name**: `pucaraturismo`
   - **Database Password**: (guarda en lugar seguro)
   - **Region**: `South America (São Paulo)` o más cercano
   - **Pricing Plan**: `Free` (para desarrollo)
4. Espera a que se cree el proyecto (~2 minutos)

## 2. Obtener Credenciales

1. Una vez creado, ve a **Settings → API**
2. Copia estas credenciales:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` key → `PUBLIC_SUPABASE_ANON_KEY`

## 3. Configurar Archivo .env

1. Copia `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

2. Abre `.env.local` y actualiza:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Verifica que `.env.local` está en `.gitignore` (no lo comitees)

## 4. Crear Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia todo el contenido de `docs/schema.sql`
4. Pégalo en el editor
5. Haz clic en "Run" y espera a que se ejecute

Verifica que se crearon las tablas:
- usuarios
- destinos
- paquetes
- salidas
- reservas
- disponibilidad
- extras
- chats
- reviews
- pagos

## 5. Insertar Datos Iniciales

### Destinos (ejecuta este SQL):

```sql
INSERT INTO destinos (slug, nombre, provincia, descripcion_corta, clima_min, clima_max, clima_descripcion, imagen) VALUES
('jujuy-salinas', 'Salinas Grandes', 'Jujuy', 'Las salinas más grandes del mundo a 3,656m', 0, 15, 'Frío en invierno, templado en verano', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'),
('jujuy-purmamarca', 'Purmamarca', 'Jujuy', 'Cerro de los Siete Colores y pueblo colonial', 10, 28, 'Clima templado todo el año', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'),
('misiones-iguazu', 'Cataratas del Iguazú', 'Misiones', 'Maravilla natural con 275 cascadas', 15, 35, 'Tropical, lluvia todo el año', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'),
('mendoza', 'Mendoza', 'Mendoza', 'Región de vinos y alta montaña', 5, 32, 'Seco, variaciones según altitud', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80'),
('cordoba', 'Córdoba', 'Córdoba', 'Sierras cordobesas y pueblos coloniales', 8, 30, 'Templado, ideal todo el año', 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=800&q=80');
```

### Paquetes (ejecuta este SQL):

```sql
INSERT INTO paquetes (slug, titulo, tipo, duracion_dias, duracion_noches, precio_base, gastos_admin, descripcion_corta, imagen_principal, rating, cupos_por_salida, frecuencia_salidas) VALUES
('salinas-grandes-5d', 'Salinas Grandes', 'viaje_completo', 5, 4, 280000, 10000, 'Aventura a las Salinas más grandes del mundo', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop', 4.9, 20, 'semanal'),
('iguazu-4d', 'Cataratas del Iguazú', 'viaje_completo', 4, 3, 320000, 10000, 'Las Siete Maravillas', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop', 5.0, 15, 'quincenal'),
('full-day-tigre-delta', 'Full Day: Tigre y Delta', 'full_day', 1, 0, 28000, 6000, 'Mañana de excursión al Tigre', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop', 4.8, 30, 'semanal'),
('mendoza-alta-montana', 'Mendoza y Alta Montaña', 'viaje_completo', 5, 4, 310000, 10000, 'Vinos premium y Aconcagua', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&h=800&fit=crop', 4.95, 18, 'quincenal'),
('cordoba-sierras', 'Córdoba y Sierras', 'viaje_completo', 4, 3, 195000, 10000, 'Sierras de Córdoba', 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=1200&h=800&fit=crop', 4.7, 25, 'semanal'),
('full-day-colonia', 'Full Day: Colonia del Sacramento', 'full_day', 1, 0, 45000, 6000, 'Viaje a Uruguay', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop', 4.6, 25, 'semanal');
```

## 6. Configurar Autenticación

1. Ve a **Authentication → Providers**
2. Habilita:
   - **Email/Password**: Required
   - **Google** (optional):
     - Ve a [Google Cloud Console](https://console.cloud.google.com)
     - Crea un OAuth 2.0 Client ID
     - Copia `Client ID` y `Client Secret` a Supabase

3. En **Authentication → Email**, personaliza:
   - Email templates
   - Redirect URLs

## 7. Configurar Row-Level Security (RLS)

Supabase crea políticas básicas. Verifica que estén activas en **Auth → Policies**

Políticas clave:
- ✅ Usuarios solo ven su propia información
- ✅ Reservas solo visibles al usuario que las creó
- ✅ Reviews públicos para lectura
- ✅ Chats solo para usuario + coordinator

## 8. Test de Conexión

```bash
# En terminal del proyecto
npm install

# Inicia servidor
npm run dev

# Prueba endpoint
curl http://localhost:3000/api/destinos
```

Deberías recibir JSON con todos los destinos.

## 9. Variáveis de Ambiente Completas

Actualiza `.env.local` con todos los servicios:

```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (optional, para payments)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# SendGrid (optional, para emails)
SENDGRID_API_KEY=...

# WhatsApp (optional)
WHATSAPP_BUSINESS_PHONE_ID=...
WHATSAPP_BUSINESS_ACCESS_TOKEN=...

# Analytics (optional)
GOOGLE_ANALYTICS_ID=...
HOTJAR_ID=...
```

## 10. Conectar a la Aplicación

1. Supabase ya está configurado en `src/lib/supabase.ts`
2. Los endpoints de API ya usan el cliente Supabase
3. Verifica que `.env.local` esté en `src/`

## Verificación Rápida

Ejecuta estos pasos para confirmar que todo funciona:

```bash
# 1. Build
npm run build

# 2. Preview
npm run preview

# 3. Abre en navegador
http://localhost:3000

# 4. Prueba cada sección:
# - Homepage (/ )
# - Paquetes (/paquetes)
# - Destinos (/destinos)
# - API (/api/paquetes, /api/destinos)
```

## Troubleshooting

### Error: "Supabase credentials not found"
- Verifica que `.env.local` existe en la raíz
- Verifica que `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` están correctos
- Reinicia servidor (`npm run dev`)

### Error de CORS
- En Supabase, ve a **Settings → API**
- Añade tu dominio a **CORS Allowed Origins**
- Ejemplo: `http://localhost:3000`, `https://tudominio.com`

### Tablas no creadas
- Verifica que el SQL ejecutó sin errores en Supabase SQL Editor
- Busca mensajes de error en la consola
- Intenta ejecutar `docs/schema.sql` nuevamente

### Auth no funciona
- Verifica que tienes habilitado Email/Password en Providers
- Confirma que el usuario está verificado en Supabase
- Limpia cookies del navegador

## Próximos Pasos

1. ✅ Supabase configurado
2. ⬜ Implementar auth en frontend
3. ⬜ Crear dashboard de admin
4. ⬜ Integrar Stripe para pagos
5. ⬜ Configurar SendGrid para emails

---

**Documentación oficial**: [docs.supabase.com](https://docs.supabase.com)
**Comunidad**: [Discord Supabase](https://discord.supabase.com)
