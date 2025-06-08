// Importación de operadores de Sequelize para búsquedas avanzadas
import { Op } from "sequelize";
// Importación de modelos principales
import Medico from "../models/medicos.js";
import Horario from "../models/horarios.js";
import Usuario from "../models/usuarios.js";
import Cita from "../models/citas.js";

/**
 * Controlador para obtener los horarios de un médico concreto.
 * Devuelve los horarios disponibles en formato de eventos para el calendario.
 */
export const obtenerHorarios = async (req, res) => {
    try {
        const { id } = req.params;

        // Asegurarse de que el id es un número válido
        const medicoId = parseInt(id, 10);
        if (isNaN(medicoId)) {
            return res.status(400).send({ error: "ID de médico no válido" });
        }

        // Buscar al médico y sus datos de usuario
        const medico = await Medico.findByPk(medicoId, {
            include: [{ model: Usuario, as: "Usuario", attributes: ["nombre", "apellido"] }],
        });

        if (!medico) {
            return res.redirect(`/panel?mensaje=Médico no encontrado`);
        }

        // Obtener los horarios disponibles del médico
        const horarios = await Horario.findAll({
            where: { medico_id: medicoId, disponible: true },
        });

        // Convertir los horarios a formato de eventos para el calendario
        const eventos = horarios.map(horario => ({
            id: horario.id,
            title: "Disponible",
            start: `${horario.fecha}T${horario.hora_inicio}`,
            end: `${horario.fecha}T${horario.hora_fin}`,
            allDay: false
        }));

        // Renderizar la vista de reserva de cita
        res.render('reservar', { medico, eventos: JSON.stringify(eventos) });
    } catch (error) {
        console.error("Error al obtener los horarios:", error);
        res.status(500).send({ error: "Error al obtener los horarios" });
    }
};

/**
 * Controlador para buscar médicos con filtros de especialidad, ubicación y paginación.
 * Permite mostrar la lista de médicos según los filtros seleccionados.
 */
export const buscarMedicos = async (req, res) => {
    try {
        const { especialidad, ubicacion, page = 1 } = req.query;
        const limit = 5;
        const offset = (page - 1) * limit;

        // Construir filtro dinámico según los parámetros recibidos
        const filtro = {};
        if (especialidad) filtro.especialidad = especialidad;
        if (ubicacion) filtro.ubicacion = { [Op.like]: `%${ubicacion}%` };

        // Buscar médicos con los filtros y paginación
        const { count, rows: medicos } = await Medico.findAndCountAll({
            where: filtro,
            limit,
            offset,
            include: [{ model: Usuario, as: "Usuario", attributes: ["nombre", "apellido"] }]
        });

        const totalPaginas = Math.ceil(count / limit);

        // Renderizar la vista de búsqueda de médicos
        res.render("medicos", {
            titulo: "Buscar Médicos",
            clase: "medicos",
            medicos,
            especialidad,
            ubicacion,
            totalPaginas,
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error al obtener los médicos:", error);
        res.status(500).send("Error al obtener los médicos");
    }
};

/**
 * Controlador para listar los pacientes de un médico.
 * Permite filtrar por nombre y paginar los resultados.
 */
export const listarPacientesMedico = async (req, res) => {
    try {
        // Buscar el médico logueado por el usuario de la sesión
        const medico = await Medico.findOne({ where: { usuario_id: req.session.usuario.id } });
        if (!medico) return res.status(403).send("No autorizado");

        const { nombre = "", page = 1 } = req.query;
        const limit = 5;
        const offset = (page - 1) * limit;

        // Buscar todas las citas de este médico, incluyendo el paciente
        const citas = await Cita.findAll({
            where: { medico_id: medico.id },
            include: [{ model: Usuario, as: "Paciente" }]
        });

        // Extraer pacientes únicos de las citas
        const pacientesMap = {};
        citas.forEach(cita => {
            if (cita.Paciente) {
                pacientesMap[cita.Paciente.id] = cita.Paciente;
            }
        });
        let pacientes = Object.values(pacientesMap);

        // Filtrar por nombre o apellido si se ha introducido
        if (nombre.trim() !== "") {
            const nombreLower = nombre.trim().toLowerCase();
            pacientes = pacientes.filter(p =>
                (p.nombre && p.nombre.toLowerCase().includes(nombreLower)) ||
                (p.apellido && p.apellido.toLowerCase().includes(nombreLower))
            );
        }

        // Paginación manual de los pacientes
        const totalPacientes = pacientes.length;
        const totalPaginas = Math.ceil(totalPacientes / limit);
        const pacientesPagina = pacientes.slice(offset, offset + limit);

        // Renderizar la vista de pacientes del médico
        res.render("pacientes_medico", {
            pacientes: pacientesPagina,
            nombre,
            totalPaginas,
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).send("Error al cargar los pacientes");
    }
};