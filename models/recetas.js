import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";
import Medico from "./medicos.js";

const Receta = db.define("recetas",
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
        medico_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Medico,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        medicamento: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dosis: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha_emision: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        tableName: "recetas",
        timestamps: false,
    }
);

export default Receta;
