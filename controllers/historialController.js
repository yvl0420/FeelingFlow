// Importación de operadores de Sequelize para búsquedas avanzadas
import { Op } from "sequelize";
// Importación de los modelos necesarios
import Historial from "../models/historial.js";
import Horario from "../models/horarios.js";
import Usuario from "../models/usuarios.js";
import Medico from "../models/medicos.js";
import Cita from "../models/citas.js";

/**
 * Controlador para ver el historial del paciente (acceso del propio paciente).
 * Muestra el historial médico paginado, incluyendo información del médico y de la cita finalizada.
 */
export const verHistorial = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Total de entradas en el historial del paciente
    const totalEntradas = await Historial.count({ where: { paciente_id: usuarioId } });

    // Consulta paginada de historiales, incluyendo médico y cita finalizada
    const historiales = await Historial.findAll({
      where: { paciente_id: usuarioId },
      include: [
        {
          model: Medico,
          as: "Medico",
          include: [{ model: Usuario, as: "Usuario" }],
        },
        {
          model: Cita,
          as: "Cita",
          where: { estado: "finalizada" },
          required: false,
          include: [{ model: Horario, as: "Horario" }]
        },
      ],
      order: [["fecha_registro", "DESC"]],
      limit,
      offset
    });

    const totalPaginas = Math.ceil(totalEntradas / limit);

    // Renderiza la vista del historial del usuario
    res.render("historial_usuario", {
      historiales,
      totalEntradas,
      totalPaginas,
      currentPage: page
    });
  } catch (error) {
    res.status(500).send("Error al cargar el historial");
  }
};

/**
 * Controlador para ver el historial de un paciente (acceso del médico).
 * Permite al médico consultar las citas finalizadas y el historial médico del paciente.
 */
export const verHistorialPaciente = async (req, res) => {
  try {
    const pacienteId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Buscar el paciente por su ID
    const paciente = await Usuario.findByPk(pacienteId);
    if (!paciente) {
      // Si no existe, renderiza la vista vacía
      return res.render("historial_medico", {
        paciente: null,
        citasPasadas: [],
        historiales: [],
        totalPaginas: 1,
        currentPage: 1
      });
    }

    // Total de citas finalizadas del paciente
    const totalEntradas = await Cita.count({
      where: {
        paciente_id: pacienteId,
        estado: "finalizada"
      }
    });

    // Citas finalizadas paginadas, incluyendo médico y horario
    const citasPasadas = await Cita.findAll({
      where: {
        paciente_id: pacienteId,
        estado: "finalizada"
      },
      include: [
        {
          model: Medico,
          as: "Medico",
          include: [{ model: Usuario, as: "Usuario" }]
        },
        {
          model: Horario,
          as: "Horario"
        }
      ],
      order: [
        [{ model: Horario, as: "Horario" }, "fecha", "DESC"],
        [{ model: Horario, as: "Horario" }, "hora_inicio", "DESC"]
      ],
      limit,
      offset
    });

    // Todos los historiales del paciente (para buscar diagnóstico/tratamiento por cita)
    const historiales = await Historial.findAll({
      where: { paciente_id: pacienteId },
      include: [
        {
          model: Medico,
          as: "Medico",
          include: [{ model: Usuario, as: "Usuario" }],
        },
        {
          model: Cita,
          as: "Cita",
          include: [{ model: Horario, as: "Horario" }],
        },
      ],
      order: [["fecha_registro", "DESC"]],
    });

    const totalPaginas = Math.ceil(totalEntradas / limit);

    // Renderiza la vista del historial del paciente para el médico
    res.render("historial_medico", {
      paciente,
      citasPasadas,
      historiales,
      totalPaginas,
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar el historial del paciente");
  }
};

/**
 * Controlador para añadir una entrada al historial (solo el médico puede hacerlo).
 * Registra diagnóstico y tratamiento asociados a una cita y paciente.
 */
export const agregarHistorial = async (req, res) => {
  try {
    const { paciente_id, cita_id, diagnostico, tratamiento } = req.body;
    // Buscar el médico que está logueado
    const medico = await Medico.findOne({
      where: { usuario_id: req.session.usuario.id },
    });
    if (!medico) return res.status(403).send("No autorizado");

    // Crear nueva entrada en el historial
    await Historial.create({
      paciente_id,
      medico_id: medico.id,
      cita_id: cita_id || null,
      diagnostico,
      tratamiento,
    });
    res.redirect(`/medico/historial/${paciente_id}`);
  } catch (error) {
    res.status(500).send("Error al agregar historial");
  }
};