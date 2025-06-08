// Importación del modelo Usuario para gestionar los datos generales del usuario
import Usuario from "../models/usuarios.js";
// Importación de bcrypt para el cifrado seguro de contraseñas
import bcrypt from "bcrypt";
// Importación de nodemailer para el envío de correos electrónicos automáticos
import nodemailer from "nodemailer";

/**
 * Controlador para mostrar la página de ajustes del usuario.
 * Si el usuario no está autenticado, redirige al login.
 * Si está autenticado, renderiza la vista 'ajustes_usuario' con los datos actuales.
 */
export const mostrarAjustesUsuario = (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  res.render("ajustes_usuario", { usuario: req.session.usuario });
};

/**
 * Controlador para actualizar los ajustes del usuario.
 * Permite modificar datos personales y cambiar la contraseña.
 * Si se cambia la contraseña, se cifra y se envía un correo de confirmación.
 */
export const actualizarAjustesUsuario = async (req, res) => {
  try {
    // Obtener el ID del usuario desde la sesión
    const usuarioId = req.session.usuario.id;
    // Extraer los datos enviados desde el formulario
    const { nombre, apellido, email, telefono, nuevaContrasena } = req.body;

    // Actualizar los datos básicos del usuario
    await Usuario.update(
      { nombre, apellido, email, telefono },
      { where: { id: usuarioId } }
    );

    // Cambiar contraseña si se ha introducido una nueva válida
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

    // Actualiza la sesión con los nuevos datos del usuario
    const usuarioActualizado = await Usuario.findByPk(usuarioId);
    req.session.usuario = usuarioActualizado;

    // Redirigir de nuevo a la página de ajustes tras la actualización
    res.redirect("/usuario/ajustes");
  } catch (error) {
    res.status(500).send("Error al actualizar los ajustes");
  }
};