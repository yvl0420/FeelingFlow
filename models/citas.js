import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";
import Medico from "./medicos.js";
import Horario from "./horarios.js";

// Definición del modelo Cita, que representa una cita médica en el sistema
const Cita = db.define("citas", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Identificador único autoincremental
    },
    paciente_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Relaciona la cita con el paciente (usuario)
        references: {
            model: Usuario,
            key: "id",
        },
        onDelete: "CASCADE", // Si el usuario se elimina, se eliminan sus citas
    },
    medico_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Relaciona la cita con el médico
        references: {
            model: Medico,
            key: "id",
        },
        onDelete: "CASCADE", // Si el médico se elimina, se eliminan sus citas
    },
    horario_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Relaciona la cita con un horario concreto
        references: {
            model: Horario,
            key: "id",
        },
        onDelete: "CASCADE", // Si el horario se elimina, se eliminan las citas asociadas
    },
    motivo: {
        type: DataTypes.STRING(255),
        allowNull: true, // Motivo de la cita (opcional)
    },
    estado: {
        // Estado de la cita: pendiente, confirmada, cancelada o finalizada
        type: DataTypes.ENUM("pendiente", "confirmada", "cancelada", "finalizada"),
        defaultValue: "pendiente",
    },
}, {
    tableName: "citas", // Nombre de la tabla en la base de datos
    timestamps: false, 
});

export default Cita;