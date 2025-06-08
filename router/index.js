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

// ===================== PANEL DE USUARIO Y MÉDICO =====================

// Panel principal del usuario
router.get("/panel", autenticarUsuario, (req, res) => {
    res.render("panel", { usuario: req.session.usuario });
});
// Panel principal del médico
router.get("/panel_medico", autenticarUsuario, (req, res) => {
    res.render("panel_medico", { usuario: req.session.usuario });
});

// ===================== AUTENTICACIÓN Y REGISTRO =====================

router.get("/", paginaInicio);
router.get("/login", login);
router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

// ===================== BÚSQUEDA DE MÉDICOS Y HORARIOS =====================

// Buscar médicos con filtros
router.get("/medicos", buscarMedicos);
// Obtener horarios disponibles de un médico concreto
router.get("/horarios/:id", autenticarUsuario, obtenerHorarios);
// Listar pacientes de un médico
router.get("/medico/pacientes", autenticarUsuario, listarPacientesMedico);

// ===================== GESTIÓN DE CITAS (USUARIO) =====================

// Reservar una cita
router.post("/reservar/:id", autenticarUsuario, reservarCita);
// Cancelar una cita
router.post("/cancelar-cita/:id", autenticarUsuario, cancelarCita);
// Reprogramar una cita
router.post("/reprogramar-cita/:id", autenticarUsuario, reprogramarCita);
// Ver citas del usuario
router.get("/mis-citas", autenticarUsuario, obtenerCitasUsuario);
// Descargar citas del usuario en PDF
router.get("/mis-citas/pdf", autenticarUsuario, descargarCitasUsuarioPDF);

// ===================== GESTIÓN DE CITAS (MÉDICO) =====================

// Ver citas del médico
router.get("/medico/citas", autenticarUsuario, verCitasMedico);
// Confirmar cita
router.post("/medico/citas/:id/confirmar", autenticarUsuario, confirmarCitaMedico);
// Cancelar cita
router.post("/medico/citas/:id/cancelar", autenticarUsuario, cancelarCitaMedico);
// Reprogramar cita
router.post("/medico/citas/:id/reprogramar", autenticarUsuario, reprogramarCitaMedico);
// Obtener horarios disponibles para reprogramar
router.get("/medico/citas/:citaId/horarios-disponibles", autenticarUsuario, obtenerHorariosDisponibles);
// Rechazar cita
router.post("/medico/citas/:id/rechazar", autenticarUsuario, rechazarCitaMedico);
// Descargar todas las citas en PDF
router.get("/citas/pdf", autenticarUsuario, descargarCitasPDF);

// ===================== HISTORIAL MÉDICO =====================

// Ver historial del usuario (paciente)
router.get("/historial", autenticarUsuario, verHistorial);
// Ver historial de un paciente (acceso médico)
router.get("/medico/historial/:id", autenticarUsuario, verHistorialPaciente);
// Agregar entrada al historial (médico)
router.post("/medico/historial/agregar", autenticarUsuario, agregarHistorial);

// ===================== GESTIÓN DE HORARIOS DEL MÉDICO =====================

// Ver horarios del médico
router.get("/medico/horarios", autenticarUsuario, verHorarios);
// Insertar nuevo horario
router.post("/medico/horarios", autenticarUsuario, insertarHorario);
// Eliminar horario
router.post("/medico/horarios/eliminar/:id", autenticarUsuario, eliminarHorario);
// Editar horario
router.post("/medico/horarios/editar/:id", autenticarUsuario, editarHorario);

// ===================== AJUSTES DE USUARIO Y MÉDICO =====================

// Ajustes del médico
router.get("/medico/ajustes", autenticarUsuario, mostrarAjustesMedico);
router.post("/medico/ajustes", autenticarUsuario, actualizarAjustesMedico);
// Ajustes del usuario
router.get("/usuario/ajustes", autenticarUsuario, mostrarAjustesUsuario);
router.post("/usuario/ajustes", autenticarUsuario, actualizarAjustesUsuario);

// ===================== CERRAR SESIÓN =====================

router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;