import Usuario from "./usuarios.js";
import Medico from "./medicos.js";
import Horario from "./horarios.js";
import Cita from "./citas.js";
import Historial from "./historial.js";

// Relaciones de Cita
Cita.belongsTo(Medico, { foreignKey: "medico_id", as: "Medico" });
Cita.belongsTo(Horario, { foreignKey: "horario_id", as: "Horario" });
Cita.belongsTo(Usuario, { foreignKey: "paciente_id", as: "Paciente" });

// Relaciones de Medico
Medico.belongsTo(Usuario, { foreignKey: "usuario_id", as: "Usuario" });
Medico.hasMany(Horario, { foreignKey: 'medico_id' });

// Relaciones de Horario
Horario.belongsTo(Medico, { foreignKey: 'medico_id' });

//Relaciones de Historial
Historial.belongsTo(Usuario, { foreignKey: 'paciente_id', as: 'Paciente' });
Usuario.hasMany(Historial, { foreignKey: 'paciente_id', as: 'Historiales' });

// Exportar los modelos
export { Usuario, Medico, Horario, Cita,Historial };
