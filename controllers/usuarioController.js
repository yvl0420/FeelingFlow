import Usuario from '../models/usuarios.js';
import Medico from '../models/medicos.js';
import bcrypt from 'bcryptjs';

/**
 * Middleware para verificar si el usuario está autenticado.
 * Si no hay sesión, redirige a login. Si hay, añade el usuario a req.user.
 */
const autenticarUsuario = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    req.user = req.session.usuario;
    next();
};

/**
 * Controlador para registrar un nuevo usuario o médico.
 * Si el tipo es médico, crea también el registro en la tabla médicos.
 */
const registrarUsuario = async (req, res) => {
    const { nombre, apellido, email, telefono, contrasena, tipo_usuario, especialidad, ubicacion } = req.body;

    try {
        // Comprobar si el correo ya está registrado
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Cifrar la contraseña antes de guardar
        const contrasenaCifrada = await bcrypt.hash(contrasena, 10);

        // Crear usuario en la base de datos
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            telefono,
            password: contrasenaCifrada,
            tipo_usuario,
        });

        // Si es médico, crear registro en tabla médicos
        if (tipo_usuario === "medico") {
            await Medico.create({
                usuario_id: nuevoUsuario.id,
                especialidad,
                ubicacion,
            });
            req.session.usuario = nuevoUsuario;
            return res.json({ redirect: "/panel_medico" });
        }

        // Guardar usuario en sesión y redirigir a panel normal
        req.session.usuario = nuevoUsuario;
        res.json({ redirect: "/panel" });
    } catch (error) {
        console.error('Error en registrarUsuario:', error);
        res.status(500).json({ error: 'Hubo un problema al registrar el usuario', detalle: error.message });
    }
};

/**
 * Controlador para iniciar sesión.
 * Verifica credenciales y redirige según el tipo de usuario.
 */
const loginUsuario = async (req, res) => {
    const { email, contrasena } = req.body;

    try {
        // Buscar usuario por email
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Comparar contraseña cifrada
        const esValido = await bcrypt.compare(contrasena, usuario.password);
        if (!esValido) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        req.session.usuario = usuario;

        // Si el usuario tiene perfil de médico, responde con la URL de panel médico
        const medico = await Medico.findOne({ where: { usuario_id: usuario.id } });
        if (medico) {
            return res.json({ redirect: "/panel_medico" });
        } else {
            return res.json({ redirect: "/panel" });
        }
    } catch (error) {
        console.error('Error en loginUsuario:', error);
        res.status(500).json({ error: 'Hubo un problema al iniciar sesión', detalle: error.message });
    }
};

// Exportar los controladores para uso en rutas
export { autenticarUsuario, registrarUsuario, loginUsuario };