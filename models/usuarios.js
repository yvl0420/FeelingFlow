import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.js";

// Definición del modelo Usuario, que representa a un usuario del sistema (paciente, médico o admin)
const Usuario = db.define(
    "usuarios",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Identificador único autoincremental
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false, // Nombre del usuario (obligatorio)
        },
        apellido: {
            type: DataTypes.STRING,
            allowNull: false, // Apellido del usuario (obligatorio)
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false, // Correo electrónico (obligatorio)
            unique: true,     // No puede repetirse
        },
        telefono: {
            type: DataTypes.STRING, // Teléfono de contacto (opcional)
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false, // Contraseña cifrada (obligatorio)
        },
        tipo_usuario: {
            type: DataTypes.ENUM("paciente", "medico", "admin"),
            allowNull: false, // Tipo de usuario (paciente, médico o admin)
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW, // Fecha de registro automática
        },
    },
    {
        tableName: "usuarios", // Nombre de la tabla en la base de datos
        timestamps: false,
    }
);

export default Usuario;