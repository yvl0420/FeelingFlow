// Importación de operadores de Sequelize para búsquedas avanzadas
import { Op } from "sequelize";
// Importación del modelo Horario para gestionar los horarios de los médicos
import Horario from "../models/horarios.js";
// Importación del modelo Medico para identificar al médico logueado
import Medico from "../models/medicos.js";

/**
 * Controlador para mostrar los horarios del médico.
 * Realiza borrado automático de horarios finalizados y muestra los horarios activos con paginación.
 */
export const verHorarios = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        // Buscar el médico asociado al usuario logueado
        const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
        if (!medico) return res.redirect('/panel');

        // BORRADO AUTOMÁTICO de horarios finalizados (fecha pasada o ya terminados hoy)
        const ahora = new Date();
        await Horario.destroy({
            where: {
                medico_id: medico.id,
                [Op.or]: [
                    {
                        fecha: { [Op.lt]: ahora.toISOString().slice(0, 10) }
                    },
                    {
                        fecha: ahora.toISOString().slice(0, 10),
                        hora_fin: { [Op.lte]: ahora.toTimeString().slice(0, 8) }
                    }
                ]
            }
        });

        // PAGINACIÓN de los horarios activos
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        // Consulta paginada de horarios del médico
        const { count, rows: horarios } = await Horario.findAndCountAll({
            where: { medico_id: medico.id },
            order: [['fecha', 'ASC']],
            limit,
            offset
        });

        const totalPaginas = Math.ceil(count / limit);

        // Renderiza la vista de gestión de horarios
        res.render("gestionar_horarios", {
            usuario,
            horarios,
            totalPaginas,
            currentPage: page,
            count,
            limit
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar los horarios.");
    }
};

/**
 * Controlador para insertar un nuevo horario.
 * Permite al médico añadir un horario futuro disponible para citas.
 */
export const insertarHorario = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        const { fecha, hora_inicio, hora_fin, disponible } = req.body;
        const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
        if (!medico) return res.redirect('/panel');

        // Comprobar que la fecha y hora no son pasadas
        const fechaInicio = new Date(`${fecha}T${hora_inicio}`);
        if (fechaInicio < new Date()) {
            return res.status(400).send("No puedes agregar horarios en fechas pasadas.");
        }

        // Crear el nuevo horario
        await Horario.create({
            medico_id: medico.id,
            fecha,
            hora_inicio,
            hora_fin,
            disponible: disponible === "true"
        });
        res.redirect("/medico/horarios");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al insertar el horario.");
    }
};

/**
 * Controlador para eliminar un horario.
 * Solo permite eliminar horarios del propio médico.
 */
export const eliminarHorario = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        const { id } = req.params;
        const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
        if (!medico) return res.redirect('/panel');

        // Solo permite eliminar horarios del propio médico
        const horario = await Horario.findOne({ where: { id, medico_id: medico.id } });
        if (!horario) return res.redirect('/medico/horarios');

        await Horario.destroy({ where: { id } });
        res.redirect("/medico/horarios");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el horario.");
    }
};

/**
 * Controlador para editar un horario existente.
 * Solo permite editar horarios del propio médico.
 */
export const editarHorario = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        const { id } = req.params;
        const { fecha, hora_inicio, hora_fin, disponible } = req.body;
        const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
        if (!medico) return res.redirect('/panel');

        // Solo permite editar horarios del propio médico
        const horario = await Horario.findOne({ where: { id, medico_id: medico.id } });
        if (!horario) return res.redirect('/medico/horarios');

        await horario.update({
            fecha,
            hora_inicio,
            hora_fin,
            disponible: disponible === "true"
        });
        res.redirect("/medico/horarios");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el horario.");
    }
};