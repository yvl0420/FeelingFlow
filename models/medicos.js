import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";

const Medico = db.define("medicos", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    especialidad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ubicacion: {
        type: DataTypes.STRING,
    },
}, {
    tableName: "medicos",
    timestamps: false,
});

export default Medico;
