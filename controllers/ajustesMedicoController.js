import Medico from "../models/medicos.js";
import Usuario from "../models/usuarios.js";
import "../models/asociaciones.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Mostrar ajustes
export const mostrarAjustesMedico = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const medico = await Medico.findOne({
      where: { usuario_id: usuarioId },
      include: [{ model: Usuario, as: "Usuario" }],
    });
    console.log("Medico encontrado:", medico);
    res.render("ajustes_medico", { medico });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al cargar los ajustes");
  }
};

// Actualizar ajustes
export const actualizarAjustesMedico = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const {
      nombre,
      apellido,
      email,
      telefono,
      especialidad,
      ubicacion,
      nuevaContrasena,
    } = req.body;

    // Actualizar usuario
    await Usuario.update(
      { nombre, apellido, email, telefono },
      { where: { id: usuarioId } }
    );

    // Actualizar médico
    await Medico.update(
      { especialidad, ubicacion },
      { where: { usuario_id: usuarioId } }
    );

    // Cambiar contraseña si se ha introducido una nueva
    if (nuevaContrasena && nuevaContrasena.length >= 8) {
      const hash = await bcrypt.hash(nuevaContrasena, 10);
      await Usuario.update({ password: hash }, { where: { id: usuarioId } });

      // Enviar correo de confirmación
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "prueba.yv1@gmail.com",
          pass: "gmmu pmxh stpz fmsi",
        },
      });

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

      await transporter.sendMail(mailOptions);
    }

    res.redirect("/medico/ajustes");
  } catch (error) {
    res.status(500).send("Error al actualizar los ajustes");
  }
};
