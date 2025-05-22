
# Diet Generator App

Generador de dietas diarias personalizadas mediante IA (OpenRouter).

## Tecnologías
- Backend: Node.js + Express
- Frontend: React (Vite)
- IA: OpenRouter (modelo gratuito `mistral-7b-instruct`)

---

## Cómo usar en local

### 1. Clonar el proyecto
```bash
git clone <url>
cd diet-generator-app
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env  # Añade tu API KEY
node server.js
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## Variables de entorno

### `.env` en backend:
```
OPENROUTER_API_KEY=tu_api_key_aqui
```

---

## Despliegue gratuito

### Backend en Render

1. Sube `backend/` a un repo en GitHub.
2. Ve a [https://render.com](https://render.com) > "New Web Service".
3. Conecta tu repo y configura:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `node server.js`
   - Env var: `OPENROUTER_API_KEY=tu_clave`
4. Deploy.

### Frontend en Vercel

1. Sube `frontend/` a un repo.
2. Ve a [https://vercel.com](https://vercel.com)
3. Importa el repo, añade esta variable:
   - `VITE_BACKEND_URL=https://TU_BACKEND_RENDER/render-url`
4. Deploy.

En `App.jsx` cambia el endpoint:
```js
const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate-diet`, { ... })
```

---

## Créditos
Desarrollado con amor y proteína.
