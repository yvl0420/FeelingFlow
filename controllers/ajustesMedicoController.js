// Importación del modelo Medico para gestionar los datos específicos del médico
import Medico from "../models/medicos.js";
// Importación del modelo Usuario para gestionar los datos generales del usuario
import Usuario from "../models/usuarios.js";
// Importación de las asociaciones entre modelos (relaciones entre tablas)
import "../models/asociaciones.js";
// Importación de bcrypt para el cifrado seguro de contraseñas
import bcrypt from "bcrypt";
// Importación de nodemailer para el envío de correos electrónicos automáticos
import nodemailer from "nodemailer";

/**
 * Controlador para mostrar la página de ajustes del médico.
 * Obtiene los datos del médico y del usuario asociado a partir de la sesión.
 * Renderiza la vista 'ajustes_medico' con los datos obtenidos.
 */
export const mostrarAjustesMedico = async (req, res) => {
  try {
    // Obtener el ID del usuario desde la sesión
    const usuarioId = req.session.usuario.id;
    // Buscar el médico asociado a este usuario, incluyendo los datos del usuario
    const medico = await Medico.findOne({
      where: { usuario_id: usuarioId },
      include: [{ model: Usuario, as: "Usuario" }],
    });
    console.log("Medico encontrado:", medico);
    // Renderizar la vista de ajustes del médico con los datos obtenidos
    res.render("ajustes_medico", { medico });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al cargar los ajustes");
  }
};

/**
 * Controlador para actualizar los ajustes del médico.
 * Permite modificar datos personales, especialidad, ubicación y contraseña.
 * Si se cambia la contraseña, se cifra y se envía un correo de confirmación.
 */
export const actualizarAjustesMedico = async (req, res) => {
  try {
    // Obtener el ID del usuario desde la sesión
    const usuarioId = req.session.usuario.id;
    // Extraer los datos enviados desde el formulario
    const {
      nombre,
      apellido,
      email,
      telefono,
      especialidad,
      ubicacion,
      nuevaContrasena,
    } = req.body;

    // Actualizar los datos generales del usuario
    await Usuario.update(
      { nombre, apellido, email, telefono },
      { where: { id: usuarioId } }
    );

    // Actualizar los datos específicos del médico
    await Medico.update(
      { especialidad, ubicacion },
      { where: { usuario_id: usuarioId } }
    );

    // Si se ha introducido una nueva contraseña válida, se cifra y se actualiza
    if (nuevaContrasena && nuevaContrasena.length >= 8) {
      const hash = await bcrypt.hash(nuevaContrasena, 10);
      await Usuario.update({ password: hash }, { where: { id: usuarioId } });

      // Configuración del transporte de correo usando nodemailer (Gmail)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "prueba.yv1@gmail.com",
          pass: "gmmu pmxh stpz fmsi", // Contraseña de aplicación de Gmail
        },
      });

      // Opciones del correo de confirmación de cambio de contraseña
      const mailOptions = {
        from: "prueba.yv1@gmail.com",
        to: email,
        subject: "Contraseña cambiada correctamente",
        html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
        <h2 style="color: #2196f3; margin-bottom: 16px;">¡Hola ${nombre}!</h2>
        <p style="color: #222; font-size: 16px; margin-bottom: 24px;">
          Tu contraseña ha sido <b>cambiada correctamente</b> en <span style="color:#2196f3;">FeelingFlow</span>.
        </p>
        <p style="color: #444; font-size: 15px;">
          Si <b>no has realizado este cambio</b>, contacta con soporte inmediatamente.
        </p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 14px;">
          Un saludo,<br>
          <span style="color:#2196f3;">El equipo de FeelingFlow</span>
        </p>
      </div>
    </div>
    `,
      };

      // Enviar el correo de confirmación
      await transporter.sendMail(mailOptions);
    }

    // Redirigir de nuevo a la página de ajustes tras la actualización
    res.redirect("/medico/ajustes");
  } catch (error) {
    res.status(500).send("Error al actualizar los ajustes");
  }
};