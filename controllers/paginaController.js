// Controlador para renderizar la página de inicio
const paginaInicio = (req, res) => {
    // Renderiza la vista 'inicio'
    res.render('inicio', { 
        titulo: 'Inicio', 
        clase: 'home' 
    });
};

// Controlador para renderizar la página de inicio de sesión
const login = (req, res) => {
    res.render('login', { 
        titulo: 'Inicia Sesión', 
        clase: 'login' 
    });
};



export { paginaInicio,login };
