// Importación de operadores de Sequelize para búsquedas avanzadas
import { Op } from "sequelize";
// Importación de nodemailer para el envío de correos electrónicos automáticos
import nodemailer from "nodemailer";
// Importación de los modelos principales del sistema
import Medico from "../models/medicos.js";
import Horario from "../models/horarios.js";
import Cita from "../models/citas.js";
import Usuario from "../models/usuarios.js";
// Importación de PDFKit para la generación de documentos PDF
import PDFDocument from "pdfkit";

/**
 * Controlador para mostrar las citas del médico.
 * Permite filtrar por estado y nombre del paciente, y paginar los resultados.
 */
export const verCitasMedico = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    // Buscar el médico asociado al usuario logueado
    const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
    if (!medico) return res.redirect("/panel_medico");

    // Filtros de búsqueda
    const estadoFiltro = req.query.estado || "";
    const nombre = req.query.nombre ? req.query.nombre.trim() : "";
    const whereEstado = { medico_id: medico.id };

    // Filtrado por estado si se selecciona uno específico
    if (estadoFiltro && estadoFiltro !== "todas") {
      whereEstado.estado = estadoFiltro;
    }
    
    // Filtrado por nombre de paciente si se introduce
    let whereUsuario = undefined;
    if (nombre) {
      whereUsuario = {
        [Op.or]: [
          { nombre: { [Op.like]: `%${nombre}%` } },
          { apellido: { [Op.like]: `%${nombre}%` } }
        ]
      };
    }

    // Paginación
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Consulta de citas con filtros y paginación
    const { count, rows: citas } = await Cita.findAndCountAll({
      where: whereEstado,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "apellido", "email", "telefono"],
          where: whereUsuario,
        },
        { model: Horario, as: "horario" },
      ],
      order: [
        [{ model: Horario, as: "horario" }, "fecha", "ASC"],
        [{ model: Horario, as: "horario" }, "hora_inicio", "ASC"],
      ],
      limit,
      offset,
    });

    const totalPaginas = Math.ceil(count / limit);

    // Renderiza la vista de citas del médico
    res.render("citas_medico", {
      usuario,
      citas,
      totalPaginas,
      currentPage: page,
      estadoFiltro,
      nombre,
    });
  } catch (error) {
    // En caso de error, muestra la vista vacía
    console.error(error);
    res.render("citas_medico", {
      usuario: req.session.usuario,
      citas: [],
      totalPaginas: 1,
      currentPage: 1,
      estadoFiltro: req.query.estado || "",
      nombre: req.query.nombre || "",
    });
  }
};

/**
 * Controlador para confirmar una cita por parte del médico.
 * Cambia el estado de la cita y envía un correo de confirmación al paciente.
 */
export const confirmarCitaMedico = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    // Buscar el médico asociado al usuario logueado
    const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
    if (!medico) return res.status(403).send("No autorizado");

    // Buscar la cita por ID y comprobar que pertenece al médico
    const cita = await Cita.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: "usuario" },
        { model: Horario, as: "horario" },
      ],
    });
    if (!cita || cita.medico_id !== medico.id) return res.status(404).send("Cita no encontrada");

    // Actualizar estado de la cita
    await cita.update({ estado: "confirmada" });

    // Enviar correo al paciente notificando la confirmación
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "prueba.yv1@gmail.com", pass: "gmmu pmxh stpz fmsi" },
    });
    await transporter.sendMail({
      from: "prueba.yv1@gmail.com",
      to: cita.usuario.email,
      subject: "Cita confirmada",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
          <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
            <h2 style="color: #2196f3; margin-bottom: 16px;">Cita confirmada</h2>
            <p style="color: #222; font-size: 16px; margin-bottom: 18px;">
              Hola <b>${cita.usuario.nombre}</b>,
            </p>
            <p style="color: #444; font-size: 15px; margin-bottom: 18px;">
              Tu cita ha sido <b>confirmada</b> en <span style="color:#2196f3;">FeelingFlow</span>.
            </p>
            <div style="background: #f4f8fb; border-radius: 8px; padding: 18px 20px; margin-bottom: 18px; border: 1px solid #e3eaf1;">
              <p style="margin: 0 0 8px 0; color: #2196f3;"><b>Detalles de la cita:</b></p>
              <p style="margin: 0; color: #222;">
                <b>Fecha:</b> ${cita.horario.fecha}<br>
                <b>Hora:</b> ${cita.horario.hora_inicio} - ${cita.horario.hora_fin}<br>
                ${cita.motivo ? `<b>Motivo:</b> ${cita.motivo}<br>` : ""}
              </p>
            </div>
            <p style="color: #888; font-size: 14px; margin-bottom: 0;">
              Si tienes cualquier duda, puedes responder a este correo.<br>
              <span style="color:#2196f3;">El equipo de FeelingFlow</span>
            </p>
          </div>
        </div>
      `,
    });

    res.redirect("/medico/citas");
  } catch (error) {
    res.status(500).send("Error al confirmar la cita");
  }
};

/**
 * Controlador para cancelar una cita por parte del médico.
 * Cambia el estado de la cita, libera el horario y notifica al paciente por correo.
 */
export const cancelarCitaMedico = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
    if (!medico) return res.status(403).send("No autorizado");

    const cita = await Cita.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: "usuario" },
        { model: Horario, as: "horario" },
      ],
    });
    if (!cita || cita.medico_id !== medico.id) return res.status(404).send("Cita no encontrada");

    // Cambiar estado y liberar horario
    await cita.update({ estado: "cancelada" });
    await Horario.update(
      { disponible: true },
      { where: { id: cita.horario_id } }
    );

    // Enviar correo al paciente notificando la cancelación
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "prueba.yv1@gmail.com", pass: "gmmu pmxh stpz fmsi" },
    });
    await transporter.sendMail({
      from: "prueba.yv1@gmail.com",
      to: cita.usuario.email,
      subject: "Cita cancelada",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
          <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
            <h2 style="color: #FF4C4C; margin-bottom: 16px;">Cita cancelada</h2>
            <p style="color: #222; font-size: 16px; margin-bottom: 18px;">
              Hola <b>${cita.usuario.nombre}</b>,
            </p>
            <p style="color: #444; font-size: 15px; margin-bottom: 18px;">
              Tu cita ha sido <b>cancelada</b> por el médico en <span style="color:#2196f3;">FeelingFlow</span>.
            </p>
            <div style="background: #f4f8fb; border-radius: 8px; padding: 18px 20px; margin-bottom: 18px; border: 1px solid #e3eaf1;">
              <p style="margin: 0 0 8px 0; color: #FF4C4C;"><b>Detalles de la cita:</b></p>
              <p style="margin: 0; color: #222;">
                <b>Fecha:</b> ${cita.horario.fecha}<br>
                <b>Hora:</b> ${cita.horario.hora_inicio} - ${cita.horario.hora_fin}<br>
                ${cita.motivo ? `<b>Motivo:</b> ${cita.motivo}<br>` : ""}
              </p>
            </div>
            <p style="color: #888; font-size: 14px; margin-bottom: 0;">
              Si tienes cualquier duda, puedes responder a este correo.<br>
              <span style="color:#2196f3;">El equipo de FeelingFlow</span>
            </p>
          </div>
        </div>
      `,
    });

    res.redirect("/medico/citas");
  } catch (error) {
    res.status(500).send("Error al cancelar la cita");
  }
};

/**
 * Controlador para obtener los horarios disponibles para reprogramar una cita.
 * Devuelve los horarios libres del médico asociado a la cita.
 */
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { citaId } = req.params;
    const cita = await Cita.findByPk(citaId);
    if (!cita)
      return res
        .status(404)
        .json({ success: false, message: "Cita no encontrada" });

    // Buscar horarios disponibles del médico
    const horariosDisponibles = await Horario.findAll({
      where: {
        medico_id: cita.medico_id,
        disponible: true,
      },
      order: [
        ["fecha", "ASC"],
        ["hora_inicio", "ASC"],
      ],
    });

    res.json({
      success: true,
      horarios: horariosDisponibles.map((h) => h.get({ plain: true })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los horarios disponibles",
    });
  }
};

/**
 * Controlador para reprogramar una cita por parte del médico.
 * Cambia el horario de la cita, actualiza la disponibilidad y notifica al paciente.
 */
export const reprogramarCitaMedico = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
    if (!medico) return res.status(403).send("No autorizado");

    const { id } = req.params;
    const { nuevoHorarioId } = req.body;

    const cita = await Cita.findByPk(id, {
      include: [
        { model: Usuario, as: "usuario" },
        { model: Horario, as: "horario" },
      ],
    });
    if (!cita || cita.medico_id !== medico.id) return res.status(404).send("Cita no encontrada");

    // Marcar el horario anterior como disponible
    await Horario.update(
      { disponible: true },
      { where: { id: cita.horario_id } }
    );

    // Asignar el nuevo horario y marcarlo como no disponible
    cita.horario_id = nuevoHorarioId;
    await cita.save();
    await Horario.update(
      { disponible: false },
      { where: { id: nuevoHorarioId } }
    );

    // Enviar correo al paciente notificando la reprogramación
    const nuevoHorario = await Horario.findByPk(nuevoHorarioId);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "prueba.yv1@gmail.com", pass: "gmmu pmxh stpz fmsi" },
    });
    await transporter.sendMail({
      from: "prueba.yv1@gmail.com",
      to: cita.usuario.email,
      subject: "Cita reprogramada",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
          <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
            <h2 style="color: #2196f3; margin-bottom: 16px;">Cita reprogramada</h2>
            <p style="color: #222; font-size: 16px; margin-bottom: 18px;">
              Hola <b>${cita.usuario.nombre}</b>,
            </p>
            <p style="color: #444; font-size: 15px; margin-bottom: 18px;">
              Tu cita ha sido <b>reprogramada</b> en <span style="color:#2196f3;">FeelingFlow</span>.
            </p>
            <div style="background: #f4f8fb; border-radius: 8px; padding: 18px 20px; margin-bottom: 18px; border: 1px solid #e3eaf1;">
              <p style="margin: 0 0 8px 0; color: #2196f3;"><b>Nuevos detalles de la cita:</b></p>
              <p style="margin: 0; color: #222;">
                <b>Fecha:</b> ${nuevoHorario.fecha}<br>
                <b>Hora:</b> ${nuevoHorario.hora_inicio} - ${nuevoHorario.hora_fin}<br>
                ${cita.motivo ? `<b>Motivo:</b> ${cita.motivo}<br>` : ""}
              </p>
            </div>
            <p style="color: #888; font-size: 14px; margin-bottom: 0;">
              Si tienes cualquier duda, puedes responder a este correo.<br>
              <span style="color:#2196f3;">El equipo de FeelingFlow</span>
            </p>
          </div>
        </div>
      `,
    });

    res.redirect("/medico/citas");
  } catch (error) {
    res.status(500).send("Error al reprogramar la cita");
  }
};

/**
 * Controlador para obtener las citas del paciente (vista "mis citas").
 * Permite paginar los resultados.
 */
export const obtenerCitasUsuario = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const { count, rows: citas } = await Cita.findAndCountAll({
      where: { paciente_id: usuarioId },
      include: [
        {
          model: Medico,
          as: "Medico",
          include: [{ model: Usuario, as: "Usuario" }],
        },
        { model: Horario, as: "Horario" },
      ],
      order: [
        [{ model: Horario, as: "Horario" }, "fecha", "ASC"],
        [{ model: Horario, as: "Horario" }, "hora_inicio", "ASC"],
      ],
      limit,
      offset,
    });

    const totalPaginas = Math.ceil(count / limit);

    // Renderiza la vista de citas del usuario
    res.render("misCitas", {
      citas,
      totalPaginas,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener las citas del usuario");
  }
};

/**
 * Controlador para rechazar una cita por parte del médico.
 * Cambia el estado de la cita, libera el horario y notifica al paciente.
 */
export const rechazarCitaMedico = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: "usuario" },
        { model: Horario, as: "horario" },
      ],
    });
    if (!cita) return res.status(404).send("Cita no encontrada");

    await cita.update({ estado: "cancelada" });
    await Horario.update(
      { disponible: true },
      { where: { id: cita.horario_id } }
    );

    // Enviar correo al paciente notificando el rechazo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "prueba.yv1@gmail.com", pass: "gmmu pmxh stpz fmsi" },
    });
    await transporter.sendMail({
      from: "prueba.yv1@gmail.com",
      to: cita.usuario.email,
      subject: "Cita rechazada",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
          <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
            <h2 style="color: #FF4C4C; margin-bottom: 16px;">Cita rechazada</h2>
            <p style="color: #222; font-size: 16px; margin-bottom: 18px;">
              Hola <b>${cita.usuario.nombre}</b>,
            </p>
            <p style="color: #444; font-size: 15px; margin-bottom: 18px;">
              Tu cita ha sido <b>rechazada</b> por el médico en <span style="color:#2196f3;">FeelingFlow</span>.
            </p>
            <div style="background: #f4f8fb; border-radius: 8px; padding: 18px 20px; margin-bottom: 18px; border: 1px solid #e3eaf1;">
              <p style="margin: 0 0 8px 0; color: #FF4C4C;"><b>Detalles de la cita:</b></p>
              <p style="margin: 0; color: #222;">
                <b>Fecha:</b> ${cita.horario.fecha}<br>
                <b>Hora:</b> ${cita.horario.hora_inicio} - ${cita.horario.hora_fin}<br>
                ${cita.motivo ? `<b>Motivo:</b> ${cita.motivo}<br>` : ""}
              </p>
            </div>
            <p style="color: #888; font-size: 14px; margin-bottom: 0;">
              Si tienes cualquier duda, puedes responder a este correo.<br>
              <span style="color:#2196f3;">El equipo de FeelingFlow</span>
            </p>
          </div>
        </div>
      `,
    });

    res.redirect("/medico/citas");
  } catch (error) {
    res.status(500).send("Error al rechazar la cita");
  }
};

/**
 * Controlador para descargar las citas del médico en PDF.
 * Utiliza PDFKit para generar un documento con las citas filtradas.
 */
export const descargarCitasPDF = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
    if (!medico) return res.status(403).send("No autorizado");

    // Filtro por estado
    const estadoFiltro = req.query.estado || "todas";
    const whereEstado = { medico_id: medico.id };
    if (estadoFiltro && estadoFiltro !== "todas") {
      whereEstado.estado = estadoFiltro;
    }

    // Traer citas según filtro
    const citas = await Cita.findAll({
      where: whereEstado,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "apellido", "email", "telefono"],
        },
        { model: Horario, as: "horario" },
      ],
      order: [
        [{ model: Horario, as: "horario" }, "fecha", "ASC"],
        [{ model: Horario, as: "horario" }, "hora_inicio", "ASC"],
      ],
    });

    // PDFKit: generación del PDF con las citas
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=citas_medico.pdf"
    );
    doc.pipe(res);

    // Título y subtítulo
    doc
      .fontSize(20)
      .fillColor("#0d6efd")
      .font("Helvetica-Bold")
      .text("Citas de mis pacientes", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("#333")
      .font("Helvetica")
      .text(
        `Filtro: ${
          estadoFiltro.charAt(0).toUpperCase() + estadoFiltro.slice(1)
        }`,
        { align: "center" }
      )
      .moveDown(1);

    // Tabla de citas
    const tableTop = doc.y;
    const itemHeight = 22;
    const columns = [
      { label: "Nº", width: 30 },
      { label: "Paciente", width: 120 },
      { label: "Fecha", width: 75 },
      { label: "Hora", width: 110 },
      { label: "Estado", width: 70 },
      { label: "Motivo", width: 140 },
    ];

    // Encabezado de la tabla
    let x = doc.options.margin;
    doc
      .rect(
        x,
        tableTop,
        columns.reduce((a, c) => a + c.width, 0),
        itemHeight
      )
      .fill("#0d6efd");
    columns.forEach((col) => {
      doc
        .fillColor("#fff")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(col.label, x + 5, tableTop + 6, {
          width: col.width - 10,
          align: "left",
        });
      x += col.width;
    });

    // Filas de la tabla
    let y = tableTop + itemHeight;
    citas.forEach((cita, i) => {
      x = doc.options.margin;
      const fillColor = i % 2 === 0 ? "#f8f9fa" : "#e9ecef";

      // Prepara los textos de cada celda
      const paciente = cita.usuario
        ? `${cita.usuario.nombre} ${cita.usuario.apellido}`
        : "";
      const fecha = cita.horario ? cita.horario.fecha : "";
      const hora = cita.horario
        ? `${cita.horario.hora_inicio} - ${cita.horario.hora_fin}`
        : "";
      const estado = cita.estado || "";
      const motivo = cita.motivo || "";

      const row = [
        (i + 1).toString(),
        paciente,
        fecha,
        hora,
        estado.charAt(0).toUpperCase() + estado.slice(1),
        motivo,
      ];

      // Calcula la altura máxima de la fila según el texto más largo
      let maxHeight = itemHeight;
      row.forEach((text, idx) => {
        const height = doc.heightOfString(text, {
          width: columns[idx].width - 10,
          align: "left",
          fontSize: 11,
        });
        if (height + 14 > maxHeight) maxHeight = height + 14;
      });

      doc
        .rect(
          x,
          y,
          columns.reduce((a, c) => a + c.width, 0),
          maxHeight
        )
        .fill(fillColor);

      // Escribe cada celda
      x = doc.options.margin;
      columns.forEach((col, idx) => {
        doc
          .fillColor("#212529")
          .font("Helvetica")
          .fontSize(11)
          .text(row[idx], x + 5, y + 7, {
            width: col.width - 10,
            align: "left",
          });
        x += col.width;
      });

      y += maxHeight;

      // Salto de página si no cabe la fila
      if (y + itemHeight > doc.page.height - doc.options.margin) {
        doc.addPage();
        y = doc.options.margin;
      }
    });

    // Mensaje si no hay citas
    if (citas.length === 0) {
      doc
        .fillColor("#212529")
        .font("Helvetica")
        .fontSize(12)
        .text(
          "No hay citas para mostrar con este filtro.",
          doc.options.margin,
          y + 10
        );
    }

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).send("Error generando el PDF");
  }
};

/**
 * Controlador para descargar las citas del usuario en PDF.
 * Utiliza PDFKit para generar un documento con las citas filtradas.
 */
export const descargarCitasUsuarioPDF = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;

    // Filtro por estado (opcional)
    const estadoFiltro = req.query.estado || "todas";
    const whereEstado = { paciente_id: usuarioId };
    if (estadoFiltro && estadoFiltro !== "todas") {
      whereEstado.estado = estadoFiltro;
    }

    // Traer citas del usuario
    const citas = await Cita.findAll({
      where: whereEstado,
      include: [
        {
          model: Medico,
          as: "Medico",
          include: [{ model: Usuario, as: "Usuario" }],
        },
        { model: Horario, as: "Horario" },
      ],
      order: [
        [{ model: Horario, as: "Horario" }, "fecha", "ASC"],
        [{ model: Horario, as: "Horario" }, "hora_inicio", "ASC"],
      ],
    });

    // PDFKit: generación del PDF con las citas
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=mis_citas.pdf");
    doc.pipe(res);

    // Título y subtítulo
    doc
      .fontSize(20)
      .fillColor("#0d6efd")
      .font("Helvetica-Bold")
      .text("Mis Citas", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("#333")
      .font("Helvetica")
      .text(
        `Filtro: ${estadoFiltro.charAt(0).toUpperCase() + estadoFiltro.slice(1)}`,
        { align: "center" }
      )
      .moveDown(1);

    // Tabla de citas
    const tableTop = doc.y;
    const itemHeight = 22;
    const columns = [
      { label: "Nº", width: 25 },
      { label: "Médico", width: 90 },
      { label: "Especialidad", width: 65 },
      { label: "Fecha", width: 65 },
      { label: "Hora", width: 80 },
      { label: "Estado", width: 65 },
      { label: "Motivo", width: 110 }
    ];

    // Encabezado de la tabla
    let x = doc.options.margin;
    doc
      .rect(
        x,
        tableTop,
        columns.reduce((a, c) => a + c.width, 0),
        itemHeight
      )
      .fill("#0d6efd");
    columns.forEach((col) => {
      doc
        .fillColor("#fff")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(col.label, x + 5, tableTop + 6, {
          width: col.width - 10,
          align: "left",
        });
      x += col.width;
    });

    // Filas de la tabla
    let y = tableTop + itemHeight;
    citas.forEach((cita, i) => {
      x = doc.options.margin;
      const fillColor = i % 2 === 0 ? "#f8f9fa" : "#e9ecef";

      // Prepara los textos de cada celda
      const medico =
        cita.Medico && cita.Medico.Usuario
          ? `${cita.Medico.Usuario.nombre} ${cita.Medico.Usuario.apellido}`
          : "";
      const especialidad = cita.Medico ? cita.Medico.especialidad : "";
      const fecha = cita.Horario ? cita.Horario.fecha : "";
      const hora = cita.Horario
        ? `${cita.Horario.hora_inicio} - ${cita.Horario.hora_fin}`
        : "";
      const estado = cita.estado || "";
      const motivo = cita.motivo || "";

      const row = [
        (i + 1).toString(),
        medico,
        especialidad,
        fecha,
        hora,
        estado.charAt(0).toUpperCase() + estado.slice(1),
        motivo,
      ];

      // Calcula la altura máxima de la fila según el texto más largo
      let maxHeight = itemHeight;
      row.forEach((text, idx) => {
        const height = doc.heightOfString(text, {
          width: columns[idx].width - 10,
          align: "left",
          fontSize: 10,
        });
        if (height + 14 > maxHeight) maxHeight = height + 14;
      });

      doc
        .rect(
          x,
          y,
          columns.reduce((a, c) => a + c.width, 0),
          maxHeight
        )
        .fill(fillColor);

      // Escribe cada celda
      x = doc.options.margin;
      columns.forEach((col, idx) => {
        doc
          .fillColor("#212529")
          .font("Helvetica")
          .fontSize(10)
          .text(row[idx], x + 5, y + 7, {
            width: col.width - 10,
            align: "left",
          });
        x += col.width;
      });

      y += maxHeight;

      // Salto de página si no cabe la fila
      if (y + itemHeight > doc.page.height - doc.options.margin) {
        doc.addPage();
        y = doc.options.margin;
      }
    });

    // Mensaje si no hay citas
    if (citas.length === 0) {
      doc
        .fillColor("#212529")
        .font("Helvetica")
        .fontSize(12)
        .text(
          "No hay citas para mostrar con este filtro.",
          doc.options.margin,
          y + 10
        );
    }

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).send("Error generando el PDF");
  }
};