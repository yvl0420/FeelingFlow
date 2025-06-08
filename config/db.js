// Importación del módulo Sequelize para la conexión y gestión de la base de datos MySQL
import { Sequelize } from "sequelize";

// Importación y configuración de dotenv para gestionar variables de entorno de forma segura
import dotenv from "dotenv";
dotenv.config();

/**
 * Configuración y creación de la instancia de Sequelize.
 * 
 * - process.env.CONEXION: Cadena de conexión a la base de datos, definida en el archivo .env.
 * - dialect: Especifica el tipo de base de datos (MySQL).
 * - port: Puerto por defecto de MySQL (3306).
 * - define.timestamps: Desactiva la creación automática de los campos createdAt y updatedAt en las tablas.
 * - pool: Configuración del pool de conexiones para optimizar el rendimiento:
 *    - max: Número máximo de conexiones simultáneas.
 *    - min: Número mínimo de conexiones.
 *    - acquire: Tiempo máximo (ms) que Sequelize intentará obtener una conexión antes de lanzar un error.
 *    - idle: Tiempo máximo (ms) que una conexión puede estar inactiva antes de ser liberada.
 */
const db = new Sequelize(
    process.env.CONEXION,
    {
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

// Exporta la instancia de la base de datos para ser utilizada en los modelos y controladores del proyecto
export default db;