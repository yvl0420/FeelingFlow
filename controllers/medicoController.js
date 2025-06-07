import { Op } from "sequelize";
import Medico from "../models/medicos.js";
import Horario from "../models/horarios.js";
import Usuario from "../models/usuarios.js";
import Cita from "../models/citas.js";

//Función para obtener los horarios de un médico
export const obtenerHorarios = async (req, res) => {
    try {
        const { id } = req.params;

        // Asegurarse de que el id es un número
        const medicoId = parseInt(id, 10);
        if (isNaN(medicoId)) {
            return res.status(400).send({ error: "ID de médico no válido" });
        }

        // Buscar al médico y sus horarios disponibles
        const medico = await Medico.findByPk(medicoId, {
            include: [{ model: Usuario, as: "Usuario", attributes: ["nombre", "apellido"] }],
        });

        if (!medico) {
            return res.redirect(`/panel?mensaje=Médico no encontrado`);
        }

        //Obtener los horarios disponibles del médico
        const horarios = await Horario.findAll({
            where: { medico_id: medicoId, disponible: true },
        });

        // Convertir los horarios a un formato adecuado para el calendario
        const eventos = horarios.map(horario => ({
            id: horario.id,
            title: "Disponible",
            start: `${horario.fecha}T${horario.hora_inicio}`,
            end: `${horario.fecha}T${horario.hora_fin}`,
            allDay: false
        }));

        // Renderizar la vista de reservar
        res.render('reservar', { medico, eventos: JSON.stringify(eventos) });
    } catch (error) {
        console.error("Error al obtener los horarios:", error);
        res.status(500).send({ error: "Error al obtener los horarios" });
    }
};

// Función para buscar médicos con filtros (especialidad, ubicación y disponibilidad)
export const buscarMedicos = async (req, res) => {
    try {
        const { especialidad, ubicacion, page = 1 } = req.query;
        const limit = 5;
        const offset = (page - 1) * limit;

        const filtro = {};
        if (especialidad) filtro.especialidad = especialidad;
        if (ubicacion) filtro.ubicacion = { [Op.like]: `%${ubicacion}%` };

        const { count, rows: medicos } = await Medico.findAndCountAll({
            where: filtro,
            limit,
            offset,
            include: [{ model: Usuario, as: "Usuario", attributes: ["nombre", "apellido"] }]
        });

        const totalPaginas = Math.ceil(count / limit);

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

export const listarPacientesMedico = async (req, res) => {
    try {
        const medico = await Medico.findOne({ where: { usuario_id: req.session.usuario.id } });
        if (!medico) return res.status(403).send("No autorizado");

        const { nombre = "", page = 1 } = req.query;
        const limit = 5;
        const offset = (page - 1) * limit;

        // Buscar pacientes únicos que tengan citas con este médico
        const citas = await Cita.findAll({
            where: { medico_id: medico.id },
            include: [{ model: Usuario, as: "Paciente" }]
        });

        // Extraer pacientes únicos y filtrar por nombre si corresponde
        const pacientesMap = {};
        citas.forEach(cita => {
            if (cita.Paciente) {
                pacientesMap[cita.Paciente.id] = cita.Paciente;
            }
        });
        let pacientes = Object.values(pacientesMap);

        // Filtrar por nombre (nombre o apellido)
        if (nombre.trim() !== "") {
            const nombreLower = nombre.trim().toLowerCase();
            pacientes = pacientes.filter(p =>
                (p.nombre && p.nombre.toLowerCase().includes(nombreLower)) ||
                (p.apellido && p.apellido.toLowerCase().includes(nombreLower))
            );
        }

        // Paginación manual
        const totalPacientes = pacientes.length;
        const totalPaginas = Math.ceil(totalPacientes / limit);
        const pacientesPagina = pacientes.slice(offset, offset + limit);

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