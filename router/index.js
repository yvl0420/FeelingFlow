import { Router } from "express";
import { paginaInicio, login } from "../controllers/paginaController.js";
import { registrarUsuario, loginUsuario, autenticarUsuario } from "../controllers/usuarioController.js";
import { buscarMedicos, obtenerHorarios } from "../controllers/medicoController.js";
import { reservarCita, cancelarCita, reprogramarCita } from "../controllers/reservaController.js";
import { obtenerCitasUsuario, obtenerHorariosDisponibles } from "../controllers/citaController.js";
import { verHistorial, generarHistorialPDF } from "../controllers/historialController.js";

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

// Rutas para gestionar citas
router.post("/reservar/:id", autenticarUsuario, reservarCita);
router.post("/cancelar-cita/:id", autenticarUsuario, cancelarCita);
router.post("/reprogramar-cita/:id", autenticarUsuario, reprogramarCita);

// Ruta para obtener las citas del usuario
router.get("/mis-citas", autenticarUsuario, obtenerCitasUsuario);

// Ruta para obtener los horarios disponibles para reprogramar una cita
router.get("/horarios-disponibles/:citaId", autenticarUsuario, obtenerHorariosDisponibles);

// Rutas para el historial
router.get("/historial", autenticarUsuario, verHistorial);
router.get("/historial/generar-pdf", autenticarUsuario, generarHistorialPDF);

// Cerrar sesión
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;