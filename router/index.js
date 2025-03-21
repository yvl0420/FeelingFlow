import { Router } from "express";
import { paginaInicio, login } from "../controllers/paginaController.js";
import { registrarUsuario, loginUsuario, autenticarUsuario } from "../controllers/usuarioController.js";
import { buscarMedicos, obtenerHorarios, reservarCita, cancelarCita, obtenerCitasUsuario, reprogramarCita, obtenerHorariosDisponibles } from "../controllers/medicoController.js";

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
router.get("/medicos", buscarMedicos);

// Ruta para obtener horarios de un médico
router.get("/horarios/:id", autenticarUsuario, obtenerHorarios);
router.post("/reservar/:id", autenticarUsuario, reservarCita);

// Ruta para cancelar una cita
router.post("/cancelar-cita/:id", autenticarUsuario, cancelarCita);

// Ruta para obtener las citas del usuario
router.get("/mis-citas", autenticarUsuario, obtenerCitasUsuario);

// Ruta para obtener los horarios disponibles para reprogramar una cita
router.get("/horarios-disponibles/:citaId", autenticarUsuario, obtenerHorariosDisponibles);

// Ruta para reprogramar una cita
router.post("/reprogramar-cita/:id", autenticarUsuario, reprogramarCita);

// Cerrar sesión
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;