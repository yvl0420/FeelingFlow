import { Router } from "express";

// Controladores principales
import { paginaInicio, login } from "../controllers/paginaController.js";
import { registrarUsuario, loginUsuario, autenticarUsuario } from "../controllers/usuarioController.js";
import { buscarMedicos, obtenerHorarios, listarPacientesMedico } from "../controllers/medicoController.js";
import { reservarCita, cancelarCita, reprogramarCita } from "../controllers/reservaController.js";
import { 
    obtenerCitasUsuario, 
    obtenerHorariosDisponibles, 
    verCitasMedico, 
    confirmarCitaMedico, 
    cancelarCitaMedico,
    reprogramarCitaMedico,
    rechazarCitaMedico,
    descargarCitasPDF,
    descargarCitasUsuarioPDF
} from "../controllers/citaController.js";
import { 
    verHistorial, 
    verHistorialPaciente, 
    agregarHistorial
} from "../controllers/historialController.js";
import { verHorarios, insertarHorario, eliminarHorario, editarHorario } from "../controllers/horarioController.js";
import { mostrarAjustesMedico, actualizarAjustesMedico } from "../controllers/ajustesMedicoController.js";
import { mostrarAjustesUsuario, actualizarAjustesUsuario } from "../controllers/ajustesUsuarioController.js";

const router = Router();

// Paneles
router.get("/panel", autenticarUsuario, (req, res) => {
    res.render("panel", { usuario: req.session.usuario });
});
router.get("/panel_medico", autenticarUsuario, (req, res) => {
    res.render("panel_medico", { usuario: req.session.usuario });
});

// Autenticación
router.get("/", paginaInicio);
router.get("/login", login);
router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

// Búsqueda de médicos y horarios
router.get("/medicos", buscarMedicos);
router.get("/horarios/:id", autenticarUsuario, obtenerHorarios);
router.get("/medico/pacientes", autenticarUsuario, listarPacientesMedico);

// Gestión de citas (usuario)
router.post("/reservar/:id", autenticarUsuario, reservarCita);
router.post("/cancelar-cita/:id", autenticarUsuario, cancelarCita);
router.post("/reprogramar-cita/:id", autenticarUsuario, reprogramarCita);
router.get("/mis-citas", autenticarUsuario, obtenerCitasUsuario);
router.get("/mis-citas/pdf", autenticarUsuario, descargarCitasUsuarioPDF);

// Gestión de citas (médico)
router.get("/medico/citas", autenticarUsuario, verCitasMedico);
router.post("/medico/citas/:id/confirmar", autenticarUsuario, confirmarCitaMedico);
router.post("/medico/citas/:id/cancelar", autenticarUsuario, cancelarCitaMedico);
router.post("/medico/citas/:id/reprogramar", autenticarUsuario, reprogramarCitaMedico);
router.get("/medico/citas/:citaId/horarios-disponibles", autenticarUsuario, obtenerHorariosDisponibles);
router.post("/medico/citas/:id/rechazar", autenticarUsuario, rechazarCitaMedico);

router.get("/citas/pdf", autenticarUsuario, descargarCitasPDF);

// Historial médico
router.get("/historial", autenticarUsuario, verHistorial);
router.get("/medico/historial/:id", autenticarUsuario, verHistorialPaciente);
router.post("/medico/historial/agregar", autenticarUsuario, agregarHistorial);

// Gestión de horarios del médico
router.get("/medico/horarios", autenticarUsuario, verHorarios);
router.post("/medico/horarios", autenticarUsuario, insertarHorario);
router.post("/medico/horarios/eliminar/:id", autenticarUsuario, eliminarHorario);
router.post("/medico/horarios/editar/:id", autenticarUsuario, editarHorario);

// Ajustes
router.get("/medico/ajustes", autenticarUsuario, mostrarAjustesMedico);
router.post("/medico/ajustes", autenticarUsuario, actualizarAjustesMedico);
router.get("/usuario/ajustes", autenticarUsuario, mostrarAjustesUsuario);
router.post("/usuario/ajustes", autenticarUsuario, actualizarAjustesUsuario);

// Cerrar sesión
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;