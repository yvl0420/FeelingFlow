import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";
import Medico from "./medicos.js";
import Cita from "./citas.js";

// Definición del modelo Historial, que representa una entrada en el historial médico de un paciente
const Historial = db.define("historial",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Identificador único autoincremental
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // Relaciona el historial con el paciente (usuario)
            references: {
                model: Usuario,
                key: "id",
            },
            onDelete: "CASCADE", // Si el usuario se elimina, se eliminan sus historiales
        },
        medico_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // Relaciona el historial con el médico
            references: {
                model: Medico,
                key: "id",
            },
            onDelete: "CASCADE", // Si el médico se elimina, se eliminan sus historiales
        },
        cita_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // Puede estar asociado a una cita (opcional)
            references: {
                model: Cita,
                key: "id",
            },
            onDelete: "SET NULL", // Si la cita se elimina, el historial queda sin cita asociada
        },
        diagnostico: {
            type: DataTypes.TEXT,
            allowNull: false, // Diagnóstico realizado por el médico
        },
        tratamiento: {
            type: DataTypes.TEXT,
            allowNull: false, // Tratamiento recomendado o realizado
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW, // Fecha de creación del historial
        },
    },
    {
        tableName: "historial", // Nombre de la tabla en la base de datos
        timestamps: false, 
    }
);

export default Historial;