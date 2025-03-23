import Usuario from '../models/usuarios.js';
import bcrypt from 'bcrypt';

// Autenticación del usuario
export const autenticarUsuario = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect("/login"); // Si no hay usuario en la sesión, redirige al login
    }
    req.user = req.session.usuario;
    next();
};

//Función para registrar un usuario
const registrarUsuario = async (req, res) => {
    const { nombre, apellido, email, telefono, contrasena, tipo_usuario } = req.body;
    
    try {
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        const contrasenaCifrada = await bcrypt.hash(contrasena, 10);

        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            telefono,
            password: contrasenaCifrada,
            tipo_usuario,
        });

        // Guardar usuario en sesión
        req.session.usuario = nuevoUsuario; 

        res.redirect("/panel");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Hubo un problema al registrar el usuario' });
    }
};

//Función para iniciar sesión
const loginUsuario = async (req, res) => {
    const { email, contrasena } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const esValido = await bcrypt.compare(contrasena, usuario.password);
        if (!esValido) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Guardar usuario en sesión
        req.session.usuario = usuario; 

        res.redirect("/panel"); // Redirigir al panel de usuario
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Hubo un problema al iniciar sesión' });
    }
};

export { registrarUsuario, loginUsuario };