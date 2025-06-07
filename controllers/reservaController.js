import Cita from "../models/citas.js";
import Horario from "../models/horarios.js";
import Medico from "../models/medicos.js";
import Usuario from "../models/usuarios.js";
import nodemailer from "nodemailer";

// Procesar la reserva de cita desde el calendario
export const reservarCita = async (req, res) => {
    const { id } = req.params; // Id del médico
    const { horario_id, motivo } = req.body; // Id del horario seleccionado y motivo

    console.log("Datos recibidos en el servidor:", req.body);

    if (!horario_id || !motivo || motivo.trim() === "") {
        console.error("Faltan datos necesarios para la reserva");
        return res.status(400).send("Faltan datos necesarios para la reserva");
    }

    try {
        // Buscar el horario seleccionado
        const horarioSeleccionado = await Horario.findByPk(horario_id);

        // Verificar si el horario está disponible
        if (!horarioSeleccionado || !horarioSeleccionado.disponible) {
            console.error("Horario no disponible");
            return res.status(400).send("Horario no disponible");
        }

        // Verificar si el usuario está autenticado
        if (!req.session.usuario || !req.session.usuario.id) {
            console.error("Usuario no autenticado");
            return res.status(401).send("Usuario no autenticado");
        }

        // Buscar al usuario
        const usuario = await Usuario.findByPk(req.session.usuario.id);

        if (!usuario) {
            console.error("Usuario no encontrado");
            return res.status(400).send("Usuario no encontrado");
        }

        // Crear la cita con motivo
        const cita = await Cita.create({
            medico_id: id,
            paciente_id: usuario.id,
            horario_id,
            motivo,
            estado: "pendiente",
        });

        // Marcar el horario como no disponible
        await horarioSeleccionado.update({ disponible: false });

        // Obtener la información del médico
        const medico = await Medico.findByPk(id, {
            include: [{ model: Usuario, as: "Usuario", attributes: ["nombre", "apellido"] }],
        });

        if (!medico) {
            console.error("Médico no encontrado");
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

        // Correo con algo de CSS para mejor visualización
        const mailOptions = {
            from: 'prueba.yv1@gmail.com',
            to: usuario.email,
            subject: 'Confirmación de Reserva de Cita',
            html: `
                <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
                    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,86,179,0.08); padding: 24px;">
                        <h2 style="color: #0056b3; text-align: center; margin-bottom: 18px;">Reserva Confirmada</h2>
                        <p>Estimado/a <b>${usuario.nombre}</b>,</p>
                        <p>Su cita ha sido reservada correctamente.</p>
                        <p style="margin-bottom: 10px;"><b>Detalles de la cita:</b></p>
                        <ul style="list-style: none; padding: 0;">
                            <li><b>Médico:</b> Dr. ${medico.Usuario.nombre} ${medico.Usuario.apellido}</li>
                            <li><b>Especialidad:</b> ${medico.especialidad}</li>
                            <li><b>Fecha:</b> ${horarioSeleccionado.fecha}</li>
                            <li><b>Hora:</b> ${horarioSeleccionado.hora_inicio} - ${horarioSeleccionado.hora_fin}</li>
                            <li><b>Motivo:</b> ${motivo}</li>
                        </ul>
                        <p style="margin-top: 18px; color: #888;">Gracias por confiar en nosotros.</p>
                    </div>
                </div>
            `
        };

        //Enviar el correo electrónico
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo electrónico:", error);
                return res.status(500).send("Error al enviar el correo electrónico");
            } else {
                console.log('Correo electrónico enviado: ' + info.response);
                res.send("Cita reservada con éxito");
            }
        });
    } catch (error) {
        console.error("Error al reservar la cita:", error);
        res.status(500).send("Error al reservar la cita");
    }
};

//Procesar la cancelación de cita
export const cancelarCita = async (req, res) => {
    try {
        const { id } = req.params; //Id de la cita a cancelar

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
                    attributes: ["id", "fecha", "hora_inicio", "hora_fin", "disponible"]
                }
            ]
        });

        //Verificar si la cita existe
        if (!cita) {
            return res.status(404).json({ success: false, message: "Cita no encontrada" });
        }

        // Obtener el ID del horario de la cita
        const horarioId = cita.Horario.id;

        //Actualizar el horario a disponible
        await Horario.update({ disponible: true }, {
            where: { id: horarioId }
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

        // Correo con algo de CSS para mejor visualización
        const mailOptions = {
            from: 'prueba.yv1@gmail.com',
            to: cita.Paciente.email,
            subject: 'Confirmación de Cancelación de Cita',
            html: `
                <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
                    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,86,179,0.08); padding: 24px;">
                        <h2 style="color: #FF4C4C; text-align: center; margin-bottom: 18px;">Cita Cancelada</h2>
                        <p>Estimado/a <b>${cita.Paciente.nombre}</b>,</p>
                        <p>Su cita ha sido cancelada correctamente.</p>
                        <p style="margin-bottom: 10px;"><b>Detalles de la cita cancelada:</b></p>
                        <ul style="list-style: none; padding: 0;">
                            <li><b>Médico:</b> Dr. ${cita.Medico.Usuario.nombre} ${cita.Medico.Usuario.apellido}</li>
                            <li><b>Especialidad:</b> ${cita.Medico.especialidad}</li>
                            <li><b>Fecha:</b> ${cita.Horario.fecha}</li>
                            <li><b>Hora:</b> ${cita.Horario.hora_inicio} - ${cita.Horario.hora_fin}</li>
                            ${cita.motivo ? `<li><b>Motivo:</b> ${cita.motivo}</li>` : ""}
                        </ul>
                        <p style="margin-top: 18px; color: #888;">Gracias por confiar en nosotros.</p>
                    </div>
                </div>
            `
        };

        //Enviar el correo electrónico
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo electrónico:", error);
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

//Función para reprogramar una cita
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

        // Verificar si la cita existe
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

        // Correo con algo de CSS para mejor visualización
        const mailOptions = {
            from: 'prueba.yv1@gmail.com',
            to: cita.Paciente.email,
            subject: 'Confirmación de Reprogramación de Cita',
            html: `
                <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
                    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,86,179,0.08); padding: 24px;">
                        <h2 style="color: #0056b3; text-align: center; margin-bottom: 18px;">Cita Reprogramada</h2>
                        <p>Estimado/a <b>${cita.Paciente.nombre}</b>,</p>
                        <p>Su cita ha sido reprogramada correctamente.</p>
                        <p style="margin-bottom: 10px;"><b>Detalles de la cita reprogramada:</b></p>
                        <ul style="list-style: none; padding: 0;">
                            <li><b>Médico:</b> Dr. ${cita.Medico.Usuario.nombre} ${cita.Medico.Usuario.apellido}</li>
                            <li><b>Especialidad:</b> ${cita.Medico.especialidad}</li>
                            <li><b>Fecha:</b> ${nuevoHorario.fecha}</li>
                            <li><b>Hora:</b> ${nuevoHorario.hora_inicio} - ${nuevoHorario.hora_fin}</li>
                            ${cita.motivo ? `<li><b>Motivo:</b> ${cita.motivo}</li>` : ""}
                        </ul>
                        <p style="margin-top: 18px; color: #888;">Gracias por confiar en nosotros.</p>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo electrónico:", error);
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