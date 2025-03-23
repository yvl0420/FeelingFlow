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

app.use(session({
    secret: "secretoSeguro", 
    resave: false,
    saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(express.static('public'));

// Rutas
app.use("/", router);

//Vistas
app.set('view engine', 'ejs'); 
app.set('views', './views');


// Iniciar servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
