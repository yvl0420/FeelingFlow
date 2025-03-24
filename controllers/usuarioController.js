import Usuario from '../models/usuarios.js';
import bcrypt from 'bcryptjs';

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
        // Verificar si el correo electrónico ya está registrado
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Cifrar la contraseña
        const contrasenaCifrada = await bcrypt.hash(contrasena, 10);

        // Crear un nuevo usuario en la base de datos
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

        //Redirigir al panel de usuario
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
        // Buscar al usuario por su correo electrónico
        const usuario = await Usuario.findOne({ where: { email } });

        //Verificar si existe
        if (!usuario) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Comparar la contraseña ingresada con la contraseña cifrada
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