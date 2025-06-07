import { Op } from "sequelize";
import Horario from "../models/horarios.js";
import Medico from "../models/medicos.js";

// Mostrar horarios del médico
export const verHorarios = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
        if (!medico) return res.redirect('/panel');

        // BORRADO AUTOMÁTICO de horarios finalizados
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

        // PAGINACIÓN
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const { count, rows: horarios } = await Horario.findAndCountAll({
            where: { medico_id: medico.id },
            order: [['fecha', 'ASC']],
            limit,
            offset
        });

        const totalPaginas = Math.ceil(count / limit);

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

// Insertar nuevo horario
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

// Eliminar horario
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

// Editar horario
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