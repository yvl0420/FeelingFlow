import { Sequelize } from "sequelize";

const db = new Sequelize(
    'yvlujan_proyecto',
    'alumno',
    'AlumnoSanz$1',
    {
        host: 'iasanz.synology.me',
        port: 3306,
        dialect: 'mysql',
        define: {
            timestamps: false,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

export default db;
