
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import generateDiet from "./routes/generateDiet.js";

// Configuración de rutas de archivos ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';
dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log('Variables de entorno cargadas en server.js:', {
  PORT: process.env.PORT,
  HAS_OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY
});

const app = express();

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://nutrify-nine.vercel.app',
  'https://nutrify-s234.onrender.com',
  'https://nutrify-nine.vercel.app'
];

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  // Ruta al directorio de construcción del frontend
  const frontendPath = path.join(process.cwd(), '../frontend/dist');
  
  // Servir archivos estáticos
  app.use(express.static(frontendPath, {
    setHeaders: (res, path) => {
      // Configurar correctamente los tipos MIME
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  
  // Manejar rutas del frontend (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware para manejar preflight OPTIONS
app.options('*', cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'El servidor backend está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de verificación de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API
app.use("/api", generateDiet); // Esto hará que todas las rutas en generateDiet.js estén bajo /api

// Manejador de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Iniciar el servidor
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🟢 Servidor backend en ejecución`);
  console.log(`🔗 http://${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 ${new Date().toISOString()}\n`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection en:', promise, 'Razón:', reason);
  // Opcional: Cerrar el servidor y finalizar el proceso
  // server.close(() => {
  //   process.exit(1);
  // });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Opcional: Cerrar el servidor y finalizar el proceso
  // server.close(() => {
  //   process.exit(1);
  // });
});

// Manejo de señales de terminación
const gracefulShutdown = () => {
  console.log('\n🔴 Recibida señal de terminación. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado. Hasta pronto! 👋');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);