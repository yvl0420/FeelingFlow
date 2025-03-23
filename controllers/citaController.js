import { Op } from "sequelize";
import Medico from "../models/medicos.js";
import Horario from "../models/horarios.js";
import Cita from "../models/citas.js";
import Usuario from "../models/usuarios.js";

export const obtenerCitasUsuario = async (req, res) => {
    try {
        // Verifica que el id del paciente esté disponible en la sesión
        if (!req.session.usuario || !req.session.usuario.id) {
            return res.status(401).send("Usuario no autenticado");
        }

        console.log("Paciente ID:", req.session.usuario.id);

        // Realiza la consulta a la base de datos
        const citas = await Cita.findAll({
            where: { paciente_id: req.session.usuario.id },
            include: [
                {
                    model: Medico,
                    as: "Medico",
                    include: [
                        {
                            model: Usuario,
                            as: "Usuario", 
                            attributes: ["nombre", "apellido"]
                        }
                    ]
                },
                {
                    model: Horario,
                    as: "Horario",
                    attributes: ["fecha", "hora_inicio", "hora_fin"]
                }
            ]
        });

        // Verifica las citas obtenidas en la consola
        console.log("Citas obtenidas:", citas);

        // Si las citas son instancias de Sequelize, conviértelas a un formato plano
        const citasFormateadas = citas.map(cita => cita.get({ plain: true }));

        console.log("Citas formateadas:", citasFormateadas);

        // Renderiza la vista con las citas
        res.render('misCitas', { citas: citasFormateadas });
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).send("Hubo un error al obtener las citas.");
    }
};

export const obtenerHorariosDisponibles = async (req, res) => {
    try {
        const { citaId } = req.params;

        // Buscar la cita actual
        const cita = await Cita.findByPk(citaId, {
            include: [
                {
                    model: Medico,
                    as: "Medico",
                    include: [{ model: Usuario, as: "Usuario" }]
                }
            ]
        });

        if (!cita) {
            return res.status(404).json({ success: false, message: "Cita no encontrada" });
        }

        // Obtener los horarios disponibles del médico
        const horariosDisponibles = await Horario.findAll({
            where: {
                medico_id: cita.Medico.id,
                disponible: true,  // Filtra solo los horarios disponibles
            },
            order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']],
        });

        res.json({ success: true, horarios: horariosDisponibles.map(horario => horario.get({ plain: true })) });
    } catch (error) {
        console.error("Error al obtener los horarios disponibles:", error);
        res.status(500).json({ success: false, message: "Error al obtener los horarios disponibles" });
    }
};