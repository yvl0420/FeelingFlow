import Usuario from "./usuarios.js";
import Medico from "./medicos.js";
import Horario from "./horarios.js";
import Cita from "./citas.js";
import Historial from "./historial.js";

// Relaciones de Cita
Cita.belongsTo(Medico, { foreignKey: "medico_id", as: "Medico" });
Cita.belongsTo(Horario, { foreignKey: "horario_id", as: "Horario" });
Cita.belongsTo(Usuario, { foreignKey: "paciente_id", as: "Paciente" });
Cita.belongsTo(Usuario, { as: "usuario", foreignKey: "paciente_id" });
Cita.belongsTo(Horario, { as: "horario", foreignKey: "horario_id" });

// Relaciones de Medico
Medico.belongsTo(Usuario, { foreignKey: "usuario_id", as: "Usuario" });
Medico.hasMany(Horario, { foreignKey: 'medico_id' });

// Relaciones de Horario
Horario.belongsTo(Medico, { foreignKey: 'medico_id' });

//Relaciones de Historial
Historial.belongsTo(Usuario, { foreignKey: 'paciente_id', as: 'Paciente' });
Historial.belongsTo(Medico, { foreignKey: 'medico_id', as: 'Medico' });
Historial.belongsTo(Cita, { foreignKey: 'cita_id', as: 'Cita' });

Usuario.hasMany(Historial, { foreignKey: 'paciente_id', as: 'Historiales' });
Medico.hasMany(Historial, { foreignKey: 'medico_id', as: 'Historiales' });
Cita.hasOne(Historial, { foreignKey: 'cita_id', as: 'Historial' });

// Exportar los modelos
export { Usuario, Medico, Horario, Cita,Historial };
