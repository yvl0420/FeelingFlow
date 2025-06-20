import express from 'express';
import db from "./config/db.js";
import router from "./router/index.js";
import "./models/asociaciones.js";
import session from "express-session";

const app = express();
const port = process.env.PORT || 3000;

// Conectar a la base de datos
db.sync()
    .then(() => console.log('Conectado a la base de datos'))
    .catch((err) => console.error('Error al conectar a la base de datos:', err));

// Configuración de sesiones
app.use(session({
    secret: "secretoSeguro",
    resave: false,
    saveUninitialized: false
}));

// Middlewares para parsear datos y servir archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Rutas principales
app.use("/", router);

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', './views');

// Iniciar servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));