# Casamiento Leo & Naza — Formulario de confirmación

Aplicación web estática conectada a Firebase Firestore. Los invitados completan el formulario desde cualquier dispositivo y los datos quedan guardados en tiempo real en la nube.

---

## Estructura del proyecto

```
casamiento.Leo-Naza/
├── public/
│   ├── index.html           # Formulario para invitados
│   ├── admin.html           # Panel de estadísticas (solo para Leo & Naza)
│   ├── styles.css
│   ├── form.js              # Lógica del formulario (escribe en Firestore)
│   ├── admin.js             # Lógica del panel (lee de Firestore)
│   └── firebase-config.js   # ← Pegás aquí tu config de Firebase
├── firebase.json            # Config Firebase Hosting
├── firestore.rules          # Reglas de seguridad Firestore
└── .firebaserc              # ID de tu proyecto Firebase
```

---

## Paso a paso para publicarlo

### 1. Crear el proyecto en Firebase

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Hacer clic en **"Agregar proyecto"** → ponerle un nombre (ej: `casamiento-leo-naza`)
3. Desactivar Google Analytics si no lo necesitás → **Crear proyecto**

### 2. Activar Firestore

1. En el menú lateral: **Compilación → Firestore Database**
2. Clic en **"Crear base de datos"**
3. Elegir **modo producción** → siguiente
4. Seleccionar la región `us-central` (o la más cercana) → **Listo**

### 3. Registrar la app web y copiar la configuración

1. En la pantalla principal del proyecto, clic en el ícono `</>`  (Web)
2. Ponerle un nombre (ej: `rsvp`) → **Registrar app**
3. Firebase te muestra un bloque `firebaseConfig = { ... }`
4. Copiar esos valores y pegarlos en `public/firebase-config.js`
5. También copiar el **Project ID** y pegarlo en `.firebaserc` reemplazando `REEMPLAZAR_CON_TU_PROJECT_ID`

### 4. Instalar Firebase CLI y hacer login

```bash
npm install -g firebase-tools
firebase login
```

### 5. Desplegar

```bash
firebase deploy
```

Firebase te da una URL del tipo `https://casamiento-leo-naza.web.app` — esa es la que compartís con los invitados.

El panel de estadísticas queda en `https://casamiento-leo-naza.web.app/admin.html` — solo para ustedes.

### 6. (Opcional) Dominio personalizado

En Firebase Console → **Hosting → Agregar dominio personalizado** → seguir los pasos para conectar tu dominio registrado.

---

## Qué pueden hacer los invitados (`/`)

- Confirmar asistencia (sí / no)
- Nombre, apellido, edad y género
- Teléfono y email opcionales
- Necesidades alimentarias (celiaquía, alergias, vegetariano, etc.)
- Canción y artista sugeridos para el baile

## Panel de estadísticas (`/admin.html`)

| Dato | Descripción |
|---|---|
| Total respuestas | Todos los que completaron el formulario |
| Confirmados / No asisten | — |
| Promedio de edad | Solo confirmados |
| Menores de 45 / Mayores de 60 | Solo confirmados |
| Mujeres / Hombres / Otro | Solo confirmados |
| Necesidades alimentarias | Cantidad con requerimientos especiales |
| Canciones sugeridas | Lista completa con quién la pidió |
| Tabla completa | Todos los datos de cada invitado |

Aplicación web para que los invitados confirmen asistencia, informen necesidades alimentarias y sugieran canciones para la noche del casamiento.

---

## Estructura del proyecto

```
casamiento.Leo-Naza/
├── server.js          # Backend con Express (API REST)
├── package.json
├── data/
│   └── rsvps.json     # Persistencia local (se crea automáticamente)
└── public/
    ├── index.html     # Página única: formulario + estadísticas
    ├── styles.css
    └── app.js
```

---

## Cómo correrlo localmente

```bash
npm install
node server.js
```

Luego abrí `http://localhost:3000` en el navegador.

---

## Cómo publicarlo para los invitados

Para que los invitados puedan acceder desde cualquier dispositivo necesitás desplegarlo en un servicio online. Las opciones más simples y gratuitas son:

### Opción A — Railway (recomendada)

1. Crear cuenta en [railway.app](https://railway.app)
2. Nuevo proyecto → "Deploy from GitHub repo" → seleccionar este repositorio
3. Railway detecta automáticamente que es Node.js y lo sube
4. En "Settings" configurar la variable de entorno: `PORT=3000`
5. Railway te da una URL pública tipo `https://casamiento-leo-naza.railway.app`
6. Compartís esa URL con los invitados

### Opción B — Render

1. Crear cuenta en [render.com](https://render.com)
2. Nuevo "Web Service" → conectar este repositorio
3. Build command: `npm install` — Start command: `node server.js`
4. Render genera una URL pública gratuita

---

## Qué pueden hacer los invitados

- Confirmar asistencia (sí / no)
- Indicar nombre, apellido, edad y género
- Dejar teléfono y email opcionales
- Aclarar necesidades alimentarias (vegetariano, celiaquía, alergias, etc.)
- Sugerir una canción y artista para el baile

---

## Qué ven ustedes (panel de estadísticas en la misma página)

| Dato | Descripción |
|---|---|
| Total de respuestas | Todos los que completaron el formulario |
| Confirmados | Los que dijeron que sí asisten |
| No asisten | Los que declinaron |
| Promedio de edad | Solo confirmados |
| Menores de 45 | Solo confirmados |
| Mayores de 60 | Solo confirmados |
| Mujeres / Hombres / Otro | Solo confirmados |
| Necesidades alimentarias | Cantidad de personas con requerimientos especiales |
| Canciones sugeridas | Lista completa con nombre del invitado |

El panel se actualiza en tiempo real con el botón **Actualizar** o automáticamente al enviar cada respuesta.

---

## API disponible

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/rsvps` | Lista completa de respuestas en JSON |
| `GET` | `/api/stats` | Estadísticas calculadas en JSON |
| `POST` | `/api/rsvps` | Registrar nueva respuesta |