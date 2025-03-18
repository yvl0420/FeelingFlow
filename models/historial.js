import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";

const Historial = db.define("historial",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        diagnostico: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        tratamiento: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "historial",
        timestamps: false,
    }
);

export default Historial;
