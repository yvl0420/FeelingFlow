// Controlador para renderizar la página de inicio
const paginaInicio = (req, res) => {
    // Renderiza la vista 'inicio' con los datos de título y clase para la plantilla
    res.render('inicio', { 
        titulo: 'Inicio',      // Título de la página
        clase: 'home'          // Clase CSS para personalización de la vista
    });
};

// Controlador para renderizar la página de inicio de sesión
const login = (req, res) => {
    // Renderiza la vista 'login' con los datos de título y clase para la plantilla
    res.render('login', { 
        titulo: 'Inicia Sesión',   // Título de la página
        clase: 'login'             // Clase CSS para personalización de la vista
    });
};

// Exporta los controladores para ser usados en las rutas
export { paginaInicio, login };