import Historial from "../models/historial.js";
import Usuario from "../models/usuarios.js";
import PDFDocument from "pdfkit";

// Mostrar historial médico del usuario
export const verHistorial = async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        
        if (!usuarioId) {
            return res.status(401).send("No estás autenticado.");
        }

        const historial = await Historial.findAll({
            where: { paciente_id: usuarioId },
            order: [["fecha_registro", "DESC"]],
        });

        res.render("historial", { historial });
    } catch (error) {
        console.error("Error al obtener el historial médico:", error);
        res.status(500).send("Error interno del servidor");
    }
};

// Generar PDF del historial médico
export const generarHistorialPDF = async (req, res) => { 
    try {
        const usuarioId = req.user.id; // ID del usuario autenticado

        // Obtener historial del usuario
        const historial = await Historial.findAll({
            where: { paciente_id: usuarioId },
            include: [{ model: Usuario, as: "Paciente", attributes: ["nombre", "apellido"] }],
            order: [["fecha_registro", "DESC"]],
        });

        if (historial.length === 0) {
            return res.status(404).send("No hay historial disponible.");
        }

        // Crear PDF en memoria
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50, // Márgenes de 50
        });

        // Establecer el tipo de contenido como PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Historial_Medico_${usuarioId}.pdf`);

        doc.pipe(res); // Enviar el archivo PDF al cliente sin necesidad de guardarlo en el sistema de archivos

        // Establecer un título en la parte superior
        doc.fontSize(24).font("Helvetica-Bold").text("Historial Médico", {
            align: "center",
            underline: true
        });

        doc.moveDown(2); // Deja un espacio después del título

        // Agregar información del paciente
        doc.fontSize(14).font("Helvetica").text(`Paciente: ${historial[0].Paciente.nombre} ${historial[0].Paciente.apellido}`, {
            align: "left"
        });

        doc.moveDown(1);

        // Recorrer el historial y agregar cada registro
        historial.forEach((entry, index) => {
            doc
                .fontSize(16)
                .font("Helvetica-Bold")
                .text(`Diagnóstico ${index + 1}:`, { underline: true })
                .moveDown(0.5);
            
            // Fecha del registro
            doc.fontSize(12).text(`Fecha: ${entry.fecha_registro.toISOString().split("T")[0]}`, { align: "left" });

            // Diagnóstico
            doc.text(`Diagnóstico:`, { align: "left", underline: true });
            doc.fontSize(12).text(entry.diagnostico, {
                align: "justify"
            });

            // Tratamiento
            doc.text(`Tratamiento:`, { align: "left", underline: true });
            doc.fontSize(12).text(entry.tratamiento, {
                align: "justify"
            });

            doc.moveDown(2); // Espacio entre los registros
        });

        // Agregar una línea de separación al final
        doc.moveDown(2).strokeColor('#cccccc').lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.x, doc.y).stroke();

        // Finalizar el documento
        doc.end();
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        res.status(500).send("Error interno del servidor");
    }
};
