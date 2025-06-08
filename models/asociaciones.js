// Importación de los modelos principales
import Usuario from "./usuarios.js";
import Medico from "./medicos.js";
import Horario from "./horarios.js";
import Cita from "./citas.js";
import Historial from "./historial.js";

// ===================== RELACIONES DE CITA =====================

// Una cita pertenece a un médico (relación directa)
Cita.belongsTo(Medico, { foreignKey: "medico_id", as: "Medico" });
// Una cita pertenece a un horario concreto
Cita.belongsTo(Horario, { foreignKey: "horario_id", as: "Horario" });
// Una cita pertenece a un usuario (paciente)
Cita.belongsTo(Usuario, { foreignKey: "paciente_id", as: "Paciente" });

// Alias alternativos para compatibilidad con controladores/vistas
Cita.belongsTo(Usuario, { as: "usuario", foreignKey: "paciente_id" });
Cita.belongsTo(Horario, { as: "horario", foreignKey: "horario_id" });

// ===================== RELACIONES DE MÉDICO =====================

// Un médico pertenece a un usuario (perfil)
Medico.belongsTo(Usuario, { foreignKey: "usuario_id", as: "Usuario" });
// Un médico tiene muchos horarios
Medico.hasMany(Horario, { foreignKey: 'medico_id' });

// ===================== RELACIONES DE HORARIO =====================

// Un horario pertenece a un médico
Horario.belongsTo(Medico, { foreignKey: 'medico_id' });

// ===================== RELACIONES DE HISTORIAL =====================

// Un historial pertenece a un paciente (usuario)
Historial.belongsTo(Usuario, { foreignKey: 'paciente_id', as: 'Paciente' });
// Un historial pertenece a un médico
Historial.belongsTo(Medico, { foreignKey: 'medico_id', as: 'Medico' });
// Un historial pertenece a una cita
Historial.belongsTo(Cita, { foreignKey: 'cita_id', as: 'Cita' });

// Un usuario puede tener muchos historiales (como paciente)
Usuario.hasMany(Historial, { foreignKey: 'paciente_id', as: 'Historiales' });
// Un médico puede tener muchos historiales
Medico.hasMany(Historial, { foreignKey: 'medico_id', as: 'Historiales' });
// Una cita puede tener un historial asociado
Cita.hasOne(Historial, { foreignKey: 'cita_id', as: 'Historial' });

// Exportar los modelos para uso global en la app
export { Usuario, Medico, Horario, Cita, Historial };