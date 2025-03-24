import { Op } from "sequelize";
import Medico from "../models/medicos.js";
import Horario from "../models/horarios.js";
import Usuario from "../models/usuarios.js";

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
        const limit = 5; // Número de resultados por página
        const offset = (page - 1) * limit;

        // Filtros dinámicos para la búsqueda
        const filtro = {};
        if (especialidad) filtro.especialidad = especialidad;
        if (ubicacion) filtro.ubicacion = { [Op.like]: `%${ubicacion}%` };

        // Consulta paginada
        const { count, rows: medicos } = await Medico.findAndCountAll({
            where: filtro,
            limit,
            offset,
        });

        const totalPaginas = Math.ceil(count / limit);// Calcular el número total de páginas

        // Renderizar la vista de búsqueda de médicos con los resultados obtenidos
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