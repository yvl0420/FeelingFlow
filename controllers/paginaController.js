const paginaInicio = (req, res) => {
    res.render('inicio', { 
        titulo: 'Inicio', 
        clase: 'home' 
    });
};

const login = (req, res) => {
    res.render('login', { 
        titulo: 'Inicia Sesión', 
        clase: 'login' 
    });
};



export { paginaInicio,login };
