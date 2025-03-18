import { Router } from "express";
import { paginaInicio, login } from "../controllers/paginaController.js";
import { registrarUsuario, loginUsuario, autenticarUsuario } from "../controllers/usuarioController.js";
import { buscarMedicos, obtenerHorarios, reservarCita } from "../controllers/medicoController.js";

const router = Router();

// Ruta para mostrar el panel de usuario
router.get("/panel", autenticarUsuario, (req, res) => {
    res.render("panel", { usuario: req.session.usuario });
});

// Rutas de autenticación
router.get("/", paginaInicio);
router.get("/login", login);
router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

// Rutas para buscar médicos
router.get("/medicos", buscarMedicos); // Ruta para buscar médicos

// Ruta para obtener horarios de un médico
router.get("/horarios/:id", obtenerHorarios);
router.post("/reservar/:id", autenticarUsuario, reservarCita); 

// Cerrar sesión
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;