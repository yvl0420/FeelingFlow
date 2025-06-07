import { Op } from "sequelize";
import Historial from "../models/historial.js";
import Horario from "../models/horarios.js";
import Usuario from "../models/usuarios.js";
import Medico from "../models/medicos.js";
import Cita from "../models/citas.js";

// Ver historial del paciente (para el paciente)
export const verHistorial = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Total de entradas
    const totalEntradas = await Historial.count({ where: { paciente_id: usuarioId } });

    // Historiales paginados
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

// Ver historial de un paciente (para el médico)
export const verHistorialPaciente = async (req, res) => {
  try {
    const pacienteId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const paciente = await Usuario.findByPk(pacienteId);
    if (!paciente) {
      return res.render("historial_medico", {
        paciente: null,
        citasPasadas: [],
        historiales: [],
        totalPaginas: 1,
        currentPage: 1
      });
    }

    // Total de citas finalizadas
    const totalEntradas = await Cita.count({
      where: {
        paciente_id: pacienteId,
        estado: "finalizada"
      }
    });

    // Citas finalizadas paginadas
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

// Añadir entrada al historial (solo médico)
export const agregarHistorial = async (req, res) => {
  try {
    const { paciente_id, cita_id, diagnostico, tratamiento } = req.body;
    const medico = await Medico.findOne({
      where: { usuario_id: req.session.usuario.id },
    });
    if (!medico) return res.status(403).send("No autorizado");

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