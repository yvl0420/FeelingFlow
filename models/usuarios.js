import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.js";

const Usuario = db.define(
    "usuarios",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        telefono: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipo_usuario: {
            type: DataTypes.ENUM("paciente", "medico", "admin"),
            allowNull: false,
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "usuarios",
        timestamps: false,
    }
);

export default Usuario;
