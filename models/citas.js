import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";
import Medico from "./medicos.js";
import Horario from "./horarios.js";

const Cita = db.define("citas", {
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
    horario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Horario,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    estado: {
        type: DataTypes.ENUM("pendiente", "confirmada", "cancelada"),
        defaultValue: "pendiente",
    },
}, {
    tableName: "citas",
    timestamps: false,
});

export default Cita;