# Panel de viajes — Pucará Turismo

Dashboard para cargar, editar y borrar los viajes de la web **sin tocar código**.
Vive en tu propio hosting de DonWeb y usa la base MySQL de Ferozo. No hay servicios
externos ni costos nuevos.

---

## Cómo funciona

```
   Panel en el hosting            El build de Astro            El sitio
   pucaraturismo.com.ar/admin/    npm run build                pucaraturismo.com.ar
   ┌────────────────────┐         ┌──────────────────┐         ┌──────────────┐
   │ Cargás un viaje    │  ──►    │ prebuild baja    │  ──►    │ Páginas      │
   │ Subís las fotos    │         │ los viajes del   │         │ prerender.   │
   │ Guardás            │         │ hosting y        │         │ (SEO igual   │
   └────────────────────┘         │ regenera el JSON │         │  que hoy)    │
           │                      └──────────────────┘         └──────────────┘
           ▼                               ▲                          ▲
    MySQL (Ferozo)  ──  /api/paquetes.php ─┘                   subís dist/ por FTP
```

Los viajes pasan a vivir en **MySQL**. El archivo `src/data/paquetes.json` ya no se
edita a mano: se **regenera solo** en cada `npm run build`. Si el hosting no responde,
el build usa el último JSON que tenías y sigue funcionando.

---

## Puesta en marcha (una sola vez)

### Paso 1 — Crear la base de datos en Ferozo

1. Entrá al **Panel de Ferozo** (DonWeb) con tu usuario.
2. Buscá la sección **Bases de datos → MySQL** (según el panel puede decir
   "Administrador de bases de datos" o "MySQL").
3. Clic en **Crear base de datos**. Ponele un nombre fácil, por ejemplo `pucara_web`.
   Ferozo le agrega un prefijo con tu usuario: el nombre final queda algo como
   `tuusuario_pucara_web`. **Anotá el nombre completo.**
4. Si el panel te pide crear un **usuario de base de datos**, creá uno
   (ej. `pucara_admin`), ponele una contraseña larga y **anotala**.
5. Asignale a ese usuario **todos los permisos** sobre la base que creaste.

Al final tenés que tener estos cuatro datos anotados:

| Dato | Ejemplo |
|---|---|
| Host | `localhost` |
| Nombre de la base | `tuusuario_pucara_web` |
| Usuario | `tuusuario_pucara_admin` |
| Contraseña | la que pusiste |

> En hosting compartido el host casi siempre es `localhost`. Si Ferozo te muestra otro,
> usá el que te muestre.

### Paso 2 — Crear las tablas y cargar los 19 viajes actuales

1. En el panel de Ferozo abrí **phpMyAdmin** y seleccioná la base que creaste
   (en la columna izquierda).
2. Pestaña **Importar** → **Seleccionar archivo** → elegí `sql/01-schema.sql`
   de esta carpeta → **Importar**. Crea las tablas vacías.
3. Repetí con `sql/02-seed.sql`. Carga los **19 viajes** que ya están en la web,
   con sus fotos, itinerarios y condiciones.
4. Verificá: en la izquierda tienen que aparecer `pt_paquetes`, `pt_politicas`,
   `pt_usuarios`, `pt_actividad`, `pt_login_intentos` y `pt_estado`.
   `pt_paquetes` tiene que decir 19 filas.

> Si `02-seed.sql` da error de tamaño, importalo con la opción
> "Importación parcial" tildada, o subilo comprimido en .zip.

### Paso 3 — Configurar la conexión

1. En la carpeta `dashboard/admin/` copiá `config.example.php` y llamá a la copia
   **`config.php`**.
2. Abrilo con el editor y completá los datos del Paso 1:

```php
'db' => [
    'host'   => 'localhost',
    'nombre' => 'tuusuario_pucara_web',
    'usuario'=> 'tuusuario_pucara_admin',
    'clave'  => 'la-contrasena-de-la-base',
],
```

3. En `token_build` poné una cadena larga e inventada (letras y números, 40+
   caracteres). Guardala, la necesitás en el Paso 6.

> `config.php` tiene las credenciales, por eso está en `.gitignore` y **no se sube
> al repositorio**. Al hosting sí va.

### Paso 4 — Subir el panel por FTP

Con FileZilla, conectado a `ftp.pucaraturismo.com.ar`, subí a `public_html`:

```
public_html/
├── admin/            ← toda la carpeta dashboard/admin/ (incluido config.php)
├── api/              ← toda la carpeta dashboard/api/
└── uploads/
    └── paquetes/     ← vacía, con su .htaccess
```

Es decir: subís el **contenido** de `dashboard/` dentro de `public_html`.

Dos cosas importantes:

- Asegurate de que `uploads/paquetes` tenga permisos **755** (clic derecho →
  Permisos de archivo en FileZilla). Es donde se guardan las fotos.
- FileZilla sube archivos ocultos solo si está activado
  **Servidor → Forzar mostrar archivos ocultos**. Los `.htaccess` son importantes:
  verificá que lleguen.

### Paso 5 — Crear tu usuario

1. Abrí `https://pucaraturismo.com.ar/admin/instalar.php`.
2. Te muestra un diagnóstico: conexión a la base, tablas, viajes cargados, permisos
   de la carpeta de fotos y versión de PHP. Todo tiene que decir **OK**.
3. Completá tu email y una contraseña de 10 caracteres o más → **Crear usuario
   administrador**.
4. **Borrá `admin/instalar.php` del hosting.** Ya no lo necesitás.
5. Entrá a `https://pucaraturismo.com.ar/admin/` y logueate.
6. Desde **Usuarios** creale el acceso a tu papá (rol *Editor*: carga y edita viajes,
   pero no toca usuarios).

### Paso 6 — Conectar el proyecto Astro

1. En la raíz del proyecto, en tu archivo `.env` (si no existe, copiá `.env.example`),
   agregá:

```
PUCARA_API_URL=https://pucaraturismo.com.ar/api/paquetes.php
PUCARA_API_TOKEN=el-mismo-token-que-pusiste-en-config.php
```

2. Probá que funcione:

```bash
npm run sync
```

Tiene que decir algo como `Actualizado: 19 viajes escritos en src/data/paquetes.json`.
Si dice que no pudo bajar los viajes, revisá que `/api/paquetes.php` se abra en el
navegador y devuelva JSON.

---

## El día a día

### Cargar un viaje nuevo

1. Entrá a `pucaraturismo.com.ar/admin/` → **Nuevo viaje**.
2. Lo único obligatorio es **título, fecha de salida y precio**. Todo lo demás
   tiene valores por defecto.
3. Arrastrá las fotos en **Subir fotos nuevas** y elegí cuál es la portada.
4. **Crear viaje**.

El enlace de la página (`/paquetes/termas-de-colon-full-day-12-de-diciembre/`) se
genera solo desde el título.

### Truco: duplicar

Para una salida repetida (mismo destino, otra fecha), abrí el viaje anterior y
usá **Duplicar**. La copia nace **oculta**: le cambiás título y fecha, la marcás
como visible y listo. No vuelves a escribir el itinerario ni a subir las fotos.

### Sacar un viaje de la web

- **Ocultar** → deja de aparecer en el sitio pero queda guardado (podés volver
  a mostrarlo o duplicarlo más adelante). **Es lo que conviene** para salidas que
  ya pasaron.
- **Borrar** → lo elimina de la base y borra las fotos que habías subido. No se
  puede deshacer.

### Publicar los cambios en el sitio

El panel guarda al instante, pero el sitio es estático: hay que regenerarlo.
Con la publicación automática configurada (ver abajo), alcanza con apretar
**Publicar** en el panel: GitHub compila el sitio y lo sube solo por FTP.
Tarda entre 2 y 4 minutos, y el panel te muestra el estado.

Mientras no publiques, el panel te avisa cuántos cambios hay pendientes y
cada viaje modificado queda con la etiqueta **Sin publicar**.

Si preferís hacerlo a mano, o todavía no configuraste el botón:

```bash
npm run build        # baja los viajes del panel y genera dist/
# subís dist/ por FTP
npm run publicado    # el panel deja de marcar cambios pendientes
```

> ⚠️ **Al subir `dist/` nunca uses la opción de borrar archivos que no están en el
> origen** (sincronización espejo). Te borraría `admin/`, `api/` y las fotos de
> `uploads/`. Subir y sobrescribir está bien. El workflow automático ya está
> hecho así: sube y sobrescribe, nunca borra.

---

## Configurar el botón Publicar

### ⚠️ Antes que nada: GitHub tiene que estar al día

El botón hace que **GitHub** compile el sitio, no tu computadora. Eso significa
que lo que se publica es **el código que está en la rama principal del
repositorio**, no el de tu disco.

Antes de usar el botón por primera vez, asegurate de que la rama `main` tenga
todo tu trabajo:

```bash
git status                 # mirá qué quedó sin commitear
git add .
git commit -m "panel de viajes + ultimos cambios del sitio"
git push origin <tu-rama>
# después, en GitHub: abrí un Pull Request de tu rama hacia main y mergealo
```

Si apretás Publicar con `main` desactualizada, el sitio en vivo **vuelve atrás**
a esa versión vieja. Es el único riesgo real de este sistema, y se evita con un
merge.

El archivo `.github/workflows/publicar-donweb.yml` también tiene que estar en
`main`: GitHub solo escucha el pedido del panel si el workflow está en la rama
principal.

### Paso 1 — Crear el token de GitHub

1. En GitHub: foto de perfil → **Settings** → abajo de todo **Developer settings**
   → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Completá:
   - **Token name**: `panel-pucara`
   - **Expiration**: 1 año (anotá cuándo vence; después hay que renovarlo)
   - **Repository access**: *Only select repositories* → `Pucara-Turismo`
   - **Permissions** → *Repository permissions* → **Contents**: cambiá a
     **Read and write**. Es el único permiso que hace falta.
3. **Generate token** y copiá el valor (empieza con `github_pat_`). Se muestra
   una sola vez.
4. Pegalo en `admin/config.php` del hosting (administrador de archivos → lápiz):

```php
'github' => [
    'owner'  => 'Vitallerfranco',
    'repo'   => 'Pucara-Turismo',
    'evento' => 'publicar',
    'token'  => 'github_pat_...',   // acá
],
```

### Paso 2 — Cargar los secrets del FTP en GitHub

En el repo: **Settings → Secrets and variables → Actions → New repository secret**.
Creá estos cuatro:

| Nombre | Valor |
|---|---|
| `FTP_SERVER` | `ftp.pucaraturismo.com.ar` |
| `FTP_USERNAME` | tu usuario de FTP de Ferozo |
| `FTP_PASSWORD` | tu contraseña de FTP |
| `FTP_DIR` | `/public_html/` (con las dos barras) |
| `PUCARA_API_TOKEN` | el mismo `token_build` que está en `admin/config.php` |

> El `FTP_DIR` depende de tu cuenta: si al conectarte por FileZilla ya entrás
> directo a la carpeta del sitio, puede ser `/`. Fijate en FileZilla qué ruta
> muestra el panel derecho cuando ves `index.html`.

### Paso 3 — Probarlo

1. En GitHub, pestaña **Actions** → *Publicar sitio en DonWeb* → **Run workflow**.
   Así verificás el FTP sin depender del panel.
2. Si sale verde, andá al panel y apretá **Publicar**. Tiene que pasar a
   *Publicando el sitio…* y, cuando termina, a *Todo publicado*.

### Si algo falla

El panel te va a decir el motivo cuando GitHub rechace el pedido:

| Mensaje | Qué pasa |
|---|---|
| *GitHub rechazó el token (401)* | El token venció o está mal copiado. |
| *GitHub denegó el permiso (403)* | Al token le falta **Contents: Read and write**. |
| *GitHub no encontró el repositorio (404)* | Mal el `owner`/`repo`, o el token no tiene acceso a ese repo. |
| *GitHub rechazó el pedido (422)* | El workflow no está en la rama principal. |

Si la publicación arranca pero no termina, el panel te lo marca después de 12
minutos con un enlace para ver qué pasó en GitHub Actions. Lo más común ahí son
las credenciales de FTP.

---

## Qué hace cada archivo

| Archivo | Para qué |
|---|---|
| `sql/01-schema.sql` | Crea las tablas. Se importa una sola vez. |
| `sql/02-seed.sql` | Carga los 19 viajes actuales. Se importa una sola vez. |
| `dashboard/admin/` | El panel. Va a `public_html/admin/`. |
| `dashboard/admin/config.php` | Tus credenciales. **No se sube al repo.** |
| `dashboard/admin/instalar.php` | Crea el primer usuario. **Borrar después de usar.** |
| `dashboard/api/paquetes.php` | Le entrega los viajes al build. Va a `public_html/api/`. |
| `dashboard/uploads/paquetes/` | Las fotos que subís desde el panel. |
| `scripts/sync-paquetes.mjs` | Baja los viajes antes de cada build. Corre solo. |
| `scripts/generar-seed.mjs` | Regenera el seed desde el JSON, si alguna vez hace falta. |

Comandos nuevos en `package.json`:

| Comando | Qué hace |
|---|---|
| `npm run build` | Baja los viajes del panel y genera `dist/` (el sync corre solo antes). |
| `npm run sync` | Solo baja los viajes, sin compilar. |
| `npm run publicado` | Le avisa al panel que ya subiste el sitio. |
| `npm run seed` | Regenera `sql/02-seed.sql` desde `src/data/paquetes.json`. |

---

## Si algo falla

**El panel da error 500 al abrirlo.**
Es casi siempre el `.htaccess`. Renombrá `admin/.htaccess` a `admin/.htaccess-off`
y probá de nuevo: si carga, tu hosting no permite alguna de esas directivas.
Dejalo desactivado y avisame para ajustarlo.

**"No se pudo conectar a la base de datos".**
Los datos de `admin/config.php` no coinciden con los de Ferozo. Ojo con el prefijo
del usuario: casi nunca es solo `pucara_admin`, es `tuusuario_pucara_admin`.
Abrí `admin/instalar.php` (si todavía existe) para ver el diagnóstico.

**Las fotos no se suben.**
`uploads/paquetes` tiene que existir y tener permisos 755. El diagnóstico del
instalador te lo dice.

**`npm run sync` dice que no pudo bajar los viajes.**
Abrí `https://pucaraturismo.com.ar/api/paquetes.php` en el navegador. Si no devuelve
JSON, el problema está en el hosting (ruta mal subida o `config.php` incompleto).
Mientras tanto el build sigue funcionando con los últimos datos descargados.

**Cargué un viaje y no se ve en la web.**
Faltó regenerar el sitio: `npm run build` y subir `dist/`. Fijate también que el
viaje esté marcado como visible.

---

## Seguridad

Lo que ya está cubierto:

- Contraseñas guardadas con `password_hash()` (bcrypt), nunca en texto plano.
- Bloqueo por fuerza bruta: 8 intentos fallidos por IP y queda bloqueado 15 minutos.
- Token CSRF en todos los formularios.
- Todas las consultas a la base son preparadas (no hay SQL inyectable).
- Las fotos se validan de verdad con `getimagesize()`: un `.php` renombrado a
  `.jpg` se rechaza. Se guardan con nombre aleatorio y en una carpeta donde
  está prohibido ejecutar código.
- El panel tiene `noindex`: no aparece en Google.
- Cookies de sesión `HttpOnly` y `Secure` sobre HTTPS.

Lo que depende de vos:

- Usá una contraseña larga y distinta a las que usás en otros lados.
- Borrá `instalar.php` después de la instalación.
- No subas `config.php` a GitHub (ya está en `.gitignore`).
- Hacé de vez en cuando un backup de la base desde phpMyAdmin → Exportar.
