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
        const { especialidad, ubicacion, page = 1 } = req.query;
        const limit = 5;
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

// Procesar la cancelación de cita
export const cancelarCita = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la cita
        const cita = await Cita.findByPk(id, {
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
                    model: Usuario,
                    as: "Paciente",
                    attributes: ["nombre", "email"]
                },
                {
                    model: Horario,
                    as: "Horario",
                    attributes: ["id", "fecha", "hora_inicio", "hora_fin", "disponible"] // Asegúrate de incluir el campo 'id'
                }
            ]
        });

        if (!cita) {
            return res.status(404).json({ success: false, message: "Cita no encontrada" });
        }

        // Asegúrate de que el horario tiene un id
        const horarioId = cita.Horario.id;
        
        // Actualizar el horario a disponible
        await Horario.update({ disponible: true }, {
            where: { id: horarioId } // Aquí actualizamos el horario usando el id
        });

        // Eliminar la cita
        await cita.destroy();

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
            to: cita.Paciente.email,
            subject: 'Confirmación de Cancelación de Cita',
            html: `<p>Estimado/a ${cita.Paciente.nombre},</p>
                   <p>Su cita ha sido cancelada correctamente.</p>
                   <p>Detalles de la cita cancelada:</p>
                   <ul>
                       <li>Médico: Dr. ${cita.Medico.Usuario.nombre} ${cita.Medico.Usuario.apellido}</li>
                       <li>Especialidad: ${cita.Medico.especialidad}</li>
                       <li>Fecha: ${cita.Horario.fecha}</li>
                       <li>Hora: ${cita.Horario.hora_inicio} - ${cita.Horario.hora_fin}</li>
                   </ul>
                   <p>Gracias por confiar en nosotros.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Error al enviar el correo electrónico:", error);
                return res.status(500).send("Error al enviar el correo electrónico");
            } else {
                console.log('Correo electrónico enviado: ' + info.response);
                res.json({ success: true, message: "Cita cancelada con éxito y correo enviado" });
            }
        });
    } catch (error) {
        console.error("Error al cancelar la cita:", error);
        res.status(500).json({ success: false, message: "Error al cancelar la cita" });
    }
};

export const reprogramarCita = async (req, res) => {
    try {
        const { id } = req.params;  // ID de la cita a reprogramar
        const { nuevoHorarioId } = req.body;  // ID del nuevo horario seleccionado

        // Buscar la cita actual
        const cita = await Cita.findByPk(id, {
            include: [
                {
                    model: Medico,
                    as: "Medico",
                    include: [{ model: Usuario, as: "Usuario" }]
                },
                {
                    model: Usuario,
                    as: "Paciente",
                    attributes: ["nombre", "email"]
                },
                {
                    model: Horario,
                    as: "Horario",
                    attributes: ["id", "fecha", "hora_inicio", "hora_fin", "disponible"]
                }
            ]
        });

        if (!cita) {
            console.error("Cita no encontrada");
            return res.status(404).json({ success: false, message: "Cita no encontrada" });
        }

        // Verificar si el nuevo horario es válido
        const nuevoHorario = await Horario.findByPk(nuevoHorarioId);
        if (!nuevoHorario) {
            console.error("Nuevo horario no encontrado");
            return res.status(404).json({ success: false, message: "Nuevo horario no encontrado" });
        }

        // Verificar que el nuevo horario esté disponible
        if (!nuevoHorario.disponible) {
            console.error("El nuevo horario no está disponible");
            return res.status(400).json({ success: false, message: "El nuevo horario no está disponible" });
        }

        // Desmarcar el antiguo horario como disponible
        const horarioAnterior = cita.Horario;
        if (horarioAnterior) {
            await Horario.update({ disponible: true }, { where: { id: horarioAnterior.id } });
        }

        // Asignar el nuevo horario a la cita
        cita.horario_id = nuevoHorario.id;
        await cita.save();

        // Marcar el nuevo horario como no disponible
        await Horario.update({ disponible: false }, { where: { id: nuevoHorario.id } });

        // Enviar correo de confirmación de reprogramación
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'prueba.yv1@gmail.com',
                pass: 'gmmu pmxh stpz fmsi'
            }
        });

        const mailOptions = {
            from: 'prueba.yv1@gmail.com',
            to: cita.Paciente.email,
            subject: 'Confirmación de Reprogramación de Cita',
            html: `<p>Estimado/a ${cita.Paciente.nombre},</p>
                   <p>Su cita ha sido reprogramada correctamente.</p>
                   <p>Detalles de la cita reprogramada:</p>
                   <ul>
                       <li>Médico: Dr. ${cita.Medico.Usuario.nombre} ${cita.Medico.Usuario.apellido}</li>
                       <li>Especialidad: ${cita.Medico.especialidad}</li>
                       <li>Fecha: ${nuevoHorario.fecha}</li>
                       <li>Hora: ${nuevoHorario.hora_inicio} - ${nuevoHorario.hora_fin}</li>
                   </ul>
                   <p>Gracias por confiar en nosotros.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Error al enviar el correo electrónico:", error);
                return res.status(500).send("Error al enviar el correo electrónico");
            } else {
                console.log('Correo electrónico enviado: ' + info.response);
                res.json({ success: true, message: "Cita reprogramada con éxito y correo enviado" });
            }
        });

    } catch (error) {
        console.error("Error al reprogramar la cita:", error);
        res.status(500).json({ success: false, message: "Error al reprogramar la cita" });
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