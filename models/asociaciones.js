import Usuario from "./usuarios.js";
import Medico from "./medicos.js";

// Definir asociaciones después de importar ambos modelos
Usuario.hasOne(Medico, { foreignKey: "usuario_id", as: "Medico" });
Medico.belongsTo(Usuario, { foreignKey: "usuario_id", as: "Usuario" });

export { Usuario, Medico };
