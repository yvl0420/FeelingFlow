import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Medico from "./medicos.js";

const Horario = db.define("horarios", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    medico_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Medico,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: "horarios",
    timestamps: false,
});

export default Horario;
