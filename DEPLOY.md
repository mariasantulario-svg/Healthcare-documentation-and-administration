# Cómo publicar la app (link público)

## Opción 1: Render.com (recomendado, gratis)

1. **Sube el código a GitHub** (si aún no está).
   - Si tu repo tiene la app dentro de una carpeta (por ejemplo `Health-Vocab-App/Health-Vocab-App`), anota esa ruta.

2. **Entra en [Render](https://render.com)** y crea cuenta (con GitHub).

3. **New → Web Service**.

4. **Conecta tu repo** de GitHub y elige el que tiene esta app.

5. **Configuración:**
   - **Name:** `health-vocab-app` (o el que quieras).
   - **Root Directory:** Si el código está en una subcarpeta (ej. `Health-Vocab-App`), ponla aquí. Si está en la raíz del repo, déjalo vacío.
   - **Runtime:** Node.
   - **Build Command:** `npm install && npm run build && npm run db:push`
   - **Start Command:** `npm start`
   - **Plan:** Free.

6. **Create Web Service.** Render instalará dependencias, hará el build y arrancará la app. La primera vez puede tardar unos minutos.

7. Al terminar te dará una URL tipo:  
   `https://health-vocab-app-xxxx.onrender.com`  
   Esa es la URL pública para compartir.

**Nota:** En el plan gratis la app “duerme” tras unos minutos sin visitas; la primera visita después de eso puede tardar ~50 s en cargar. La base SQLite se reinicia en cada redeploy (los datos se vuelven a crear con el seed al arrancar).

**Si falla el deploy:** Comprueba que **Root Directory** en Render coincida con la carpeta que contiene `package.json` (p. ej. `Health-Vocab-App` si tu repo tiene esa subcarpeta). Para que el vocabulario inicial se cargue, la carpeta `attached_assets` con el JSON debe estar dentro de esa raíz (incluida en el repo).

---

## Opción 2: Railway

1. Entra en [Railway](https://railway.app) y conecta GitHub.
2. **New Project → Deploy from GitHub repo** y elige el repo.
3. Si el código está en una subcarpeta, en **Settings** pon **Root Directory**.
4. Railway detecta Node y suele usar `npm install`, `npm run build` y `npm start`. Si no, configúralos igual que arriba.
5. En **Settings → Networking** activa **Generate Domain** para obtener la URL pública.

---

## Comprobar antes de desplegar

En tu máquina:

```bash
npm run build
npm start
```

Abre `http://localhost:5000`. Si todo va bien, el mismo build funcionará en Render o Railway.

---

## Ver visitas a la app

### Opción A: Google Analytics (recomendado, gratis)

1. Entra en [Google Analytics](https://analytics.google.com) y crea una cuenta si no tienes.
2. **Admin** (engranaje) → **Crear propiedad** → pon nombre (ej. "Health Vocab App") → **Siguiente** hasta tener la propiedad.
3. En **Flujos de datos** → **Añadir flujo** → **Web** → URL de tu app (ej. tu URL de Render) → **Crear flujo**.
4. Copia el **ID de medición** (formato `G-XXXXXXXXXX`).
5. En **Render** → tu servicio → **Environment** → **Add Environment Variable**: Key `VITE_GA_MEASUREMENT_ID`, Value el ID (ej. `G-XXXXXXXXXX`).
6. **Save Changes** y haz **Manual Deploy** para que el nuevo build use la variable.
7. En unas horas verás visitas en Google Analytics: **Informes** → **Adquisición** / **Participación**.

### Opción B: Métricas de Render

En el dashboard de Render, entra en tu **Web Service** y revisa la pestaña **Metrics** (si está disponible en tu plan). Ahí puedes ver peticiones y uso.
