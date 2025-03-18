import { Op } from "sequelize";
import Medico from "../models/medicos.js";
import Horario from "../models/horarios.js";
import Cita from "../models/citas.js";
import Usuario from "../models/usuarios.js";
import nodemailer from "nodemailer";

// Obtener los horarios en formato FullCalendar
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

        const horarios = await Horario.findAll({
            where: { medico_id: medicoId, disponible: true },
        });

        // Convertimos los horarios en formato que FullCalendar puede entender
        const eventos = horarios.map(horario => ({
            id: horario.id,
            title: "Disponible",
            start: `${horario.fecha}T${horario.hora_inicio}`,
            end: `${horario.fecha}T${horario.hora_fin}`,
            allDay: false
        }));

        res.render('reservar', { medico, eventos: JSON.stringify(eventos) });
    } catch (error) {
        console.error("Error al obtener los horarios:", error);
        res.status(500).send({ error: "Error al obtener los horarios" });
    }
};

// Procesar la reserva de cita desde el calendario
export const reservarCita = async (req, res) => {
    const { id } = req.params;
    const { horario_id } = req.body;

    console.log("Datos recibidos en el servidor:", req.body);

    if (!horario_id) {
        console.error("⚠️ Faltan datos necesarios para la reserva");
        return res.status(400).send("Faltan datos necesarios para la reserva");
    }

    try {
        const horarioSeleccionado = await Horario.findByPk(horario_id);

        if (!horarioSeleccionado || !horarioSeleccionado.disponible) {
            console.error("Horario no disponible");
            return res.status(400).send("Horario no disponible");
        }

        // Asegúrate de que req.session.usuario esté definido
        if (!req.session.usuario || !req.session.usuario.id) {
            console.error("Usuario no autenticado");
            return res.status(401).send("Usuario no autenticado");
        }

        const usuario = await Usuario.findByPk(req.session.usuario.id);

        if (!usuario) {
            console.error("⚠️ Usuario no encontrado");
            return res.status(400).send("Usuario no encontrado");
        }

        const cita = await Cita.create({
            medico_id: id,
            paciente_id: usuario.id,
            horario_id,
            estado: "pendiente",
        });

        await horarioSeleccionado.update({ disponible: false });

        // Obtener la información del médico
        const medico = await Medico.findByPk(id, {
            include: [{ model: Usuario, as: "Usuario", attributes: ["nombre", "apellido"] }],
        });

        if (!medico) {
            console.error("⚠️ Médico no encontrado");
            return res.status(400).send("Médico no encontrado");
        }

        // Configurar Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'prueba.yv1@gmail.com',
                pass: 'gmmu pmxh stpz fmsi'
            }
        });

        const mailOptions = {
            from: 'prueba.yv1@gmail.com',
            to: usuario.email,
            subject: 'Confirmación de Reserva de Cita',
            html: `<p>Estimado/a ${usuario.nombre},</p>
                   <p>Su cita ha sido reservada correctamente.</p>
                   <p>Detalles de la cita:</p>
                   <ul>
                       <li>Médico: Dr. ${medico.Usuario.nombre} ${medico.Usuario.apellido}</li>
                       <li>Especialidad: ${medico.especialidad}</li>
                       <li>Fecha: ${horarioSeleccionado.fecha}</li>
                       <li>Hora: ${horarioSeleccionado.hora_inicio} - ${horarioSeleccionado.hora_fin}</li>
                   </ul>
                   <p>Gracias por confiar en nosotros.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Error al enviar el correo electrónico:", error);
                return res.status(500).send("Error al enviar el correo electrónico");
            } else {
                console.log('Correo electrónico enviado: ' + info.response);
                res.send("Cita reservada con éxito");
            }
        });
    } catch (error) {
        console.error("❌ Error al reservar la cita:", error);
        res.status(500).send("Error al reservar la cita");
    }
};

// Buscar médicos con filtros (especialidad, ubicación y disponibilidad)
export const buscarMedicos = async (req, res) => {
    try {
        const { especialidad, ubicacion, disponibilidad, page = 1 } = req.query;
        const limit = 5;
        const offset = (page - 1) * limit;

        // Filtros dinámicos para la búsqueda
        const filtro = {};
        if (especialidad) filtro.especialidad = especialidad;
        if (ubicacion) filtro.ubicacion = { [Op.like]: `%${ubicacion}%` };
        if (disponibilidad) filtro.horario_disponible = disponibilidad;

        // Consulta paginada
        const { count, rows: medicos } = await Medico.findAndCountAll({
            where: filtro,
            limit,
            offset,
        });

        const totalPaginas = Math.ceil(count / limit);

        res.render("medicos", {
            titulo: "Buscar Médicos",
            clase: "medicos",
            medicos,
            especialidad,
            ubicacion,
            disponibilidad,
            totalPaginas,
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error al obtener los médicos:", error);
        res.status(500).send("Error al obtener los médicos");
    }
};