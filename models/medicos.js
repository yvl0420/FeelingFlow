import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";

// Definición del modelo Medico, que representa a un médico en el sistema
const Medico = db.define("medicos", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Identificador único autoincremental
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Relaciona el médico con el usuario (perfil)
        references: {
            model: Usuario,
            key: "id",
        },
        onDelete: "CASCADE", // Si el usuario se elimina, se elimina el médico
    },
    especialidad: {
        type: DataTypes.STRING,
        allowNull: false, // Especialidad médica (obligatoria)
    },
    ubicacion: {
        type: DataTypes.STRING, // Ubicación o centro donde atiende el médico
    },
}, {
    tableName: "medicos", // Nombre de la tabla en la base de datos
    timestamps: false, 
});

export default Medico;