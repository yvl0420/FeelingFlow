import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Medico from "./medicos.js";

// Definición del modelo Horario, que representa un bloque de tiempo disponible de un médico
const Horario = db.define("horarios", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Identificador único autoincremental
    },
    medico_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Relaciona el horario con el médico
        references: {
            model: Medico,
            key: "id",
        },
        onDelete: "CASCADE", // Si el médico se elimina, se eliminan sus horarios
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false, // Fecha del horario (YYYY-MM-DD)
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false, // Hora de inicio del bloque horario
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false, // Hora de fin del bloque horario
    },
    disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Indica si el horario está disponible para reservar
    },
}, {
    tableName: "horarios", // Nombre de la tabla en la base de datos
    timestamps: false, 
});

export default Horario;