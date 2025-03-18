import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.js";
import Usuario from "./usuarios.js";

const Notificacion = db.define("notificaciones",
    {
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
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.ENUM("cita", "recordatorio", "mensaje"),
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM("pendiente", "visto"),
            defaultValue: "pendiente",
        },
        fecha_envio: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "notificaciones",
        timestamps: false,
    }
);

export default Notificacion;
