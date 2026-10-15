# 🚀 Guía de Deploy — pucaraturismo.com.ar en Don Web

## PASO 1 — Build del sitio

En tu terminal, dentro de la carpeta del proyecto:

```bash
npm install          # solo si hay paquetes nuevos (@astrojs/sitemap)
npm run build        # genera la carpeta dist/
```

La carpeta `dist/` contiene todo el sitio estático listo para subir.

---

## PASO 2 — Borrar WordPress del hosting

1. Ingresá al **Panel de Control de Don Web** (cPanel)
2. Abrí **Administrador de Archivos** → entrá a `public_html`
3. Seleccioná TODOS los archivos y carpetas de WordPress:
   - `wp-admin/`, `wp-content/`, `wp-includes/`
   - `wp-config.php`, `wp-login.php`, `index.php`, `.htaccess`, `xmlrpc.php`
   - y cualquier otro archivo de WordPress
4. **Eliminá todo** (clic derecho → Delete)
5. Si tenés base de datos MySQL de WordPress, podés borrarla desde
   **cPanel → MySQL Databases** (opcional, no afecta la nueva web)

---

## PASO 3 — Subir el sitio nuevo

### Opción A: FTP con FileZilla (recomendado)

1. Descargá **FileZilla** (gratis): https://filezilla-project.org/
2. En Don Web → **Panel de Control → FTP** → creá una cuenta FTP
   o usá las credenciales de cPanel directamente
3. Conectate con:
   - Host: `ftp.pucaraturismo.com.ar`
   - Usuario: tu usuario de FTP
   - Contraseña: tu contraseña
   - Puerto: `21`
4. Navegá a `public_html` en el servidor (panel derecho)
5. En tu computadora (panel izquierdo) abrí la carpeta `dist/` del proyecto
6. Seleccioná **todo el contenido** de `dist/` y arrastralo a `public_html`

### Opción B: Administrador de Archivos de cPanel

1. Ingresá al cPanel → **Administrador de Archivos**
2. Entrá a `public_html`
3. Usá el botón **Subir** para subir un ZIP del contenido de `dist/`
4. Una vez subido, descomprimí el ZIP en `public_html`

---

## PASO 4 — Verificar el dominio

El dominio `pucaraturismo.com.ar` ya está en Don Web, así que debería
apuntar automáticamente al hosting. Verificá en el **panel de dominio**
que los nameservers apuntan a Don Web.

Si el sitio no carga, en **cPanel → Dominios** asegurate de que
`pucaraturismo.com.ar` esté apuntando a `public_html`.

---

## PASO 5 — SSL (HTTPS) — OBLIGATORIO para SEO y seguridad

1. En cPanel buscá **SSL/TLS** o **Let's Encrypt SSL**
2. Instalá el certificado gratuito para `pucaraturismo.com.ar` y `www.pucaraturismo.com.ar`
3. Activá **"Force HTTPS"** para redirigir todo el tráfico HTTP a HTTPS

---

## PASO 6 — Cloudflare (recomendado)

Don Web te ofrece Cloudflare gratis. Activalo desde el panel:
- Protección DDoS
- CDN global (carga más rápida)
- Certificado SSL adicional
- Caché automático

---

## EMAIL MARKETING — Recomendaciones

### 🥇 MailerLite (TOP recomendación para Pucará)
- **Gratis** hasta 1.000 suscriptores y 12.000 emails/mes
- Interfaz en español, muy fácil de usar
- Automatizaciones, landing pages y formularios incluidos
- Perfecto para campañas de "nueva salida confirmada" o "promoción de invierno"
- https://www.mailerlite.com

### 🥈 Brevo (ex-Sendinblue)
- **Gratis** hasta 300 emails/día (ilimitados contactos)
- Muy buena entregabilidad en Argentina
- Tiene SMS marketing también
- https://www.brevo.com

### 🥉 Mailchimp
- **Gratis** hasta 500 contactos
- El más conocido pero con menos funciones en el plan gratis
- https://mailchimp.com

### Cómo usar el email marketing para Pucará:
1. Crear lista de suscriptores desde el popup de la web
2. Enviar campaña cuando haya una salida nueva confirmada
3. Campaña de "última oportunidad" cuando queden pocos cupos
4. Newsletter mensual con destinos y promociones
5. Campaña de vacaciones de invierno en mayo/junio

---

## SEGURIDAD — Checklist

### En Don Web / cPanel:
- [ ] **SSL activo** (Let's Encrypt) — HTTPS obligatorio
- [ ] **Cloudflare activado** — protección DDoS y CDN
- [ ] **Contraseña fuerte** en cPanel (mínimo 16 caracteres, con símbolos)
- [ ] **2FA activado** en tu cuenta Don Web
- [ ] **Backup automático diario** — contratar o configurar en Don Web (lo tienen disponible)

### Para el sitio Astro (estático):
- El sitio estático es intrínsecamente más seguro que WordPress — no hay PHP, no hay base de datos expuesta, no hay plugins vulnerables
- No hay panel de administración que hackear
- Asegurate de no subir el archivo `.env` al servidor (solo subís `dist/`)

### Monitoreo:
- **UptimeRobot** (gratis): te avisa por email/WhatsApp si el sitio cae
  https://uptimerobot.com
- **Google Search Console** (gratis): monitoreá el SEO y errores de indexación
  https://search.google.com/search-console

### .htaccess recomendado:
Creá un archivo `.htaccess` en `public_html` con este contenido para mayor seguridad:

```apache
# Forzar HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Headers de seguridad
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Comprimir archivos para mayor velocidad
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Cache de archivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## Resumen del flujo completo

```
npm run build
    ↓
dist/ generado
    ↓
FileZilla → subir dist/* a public_html en Don Web
    ↓
SSL activado en cPanel
    ↓
Cloudflare activado
    ↓
pucaraturismo.com.ar 🟢 LIVE
```

¡El sitio debería estar en línea en minutos después de subir los archivos!
