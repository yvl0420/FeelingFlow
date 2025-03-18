document.addEventListener("DOMContentLoaded", () => { 
    // Elementos del formulario
    const botonInicioSesion = document.getElementById("mostrarInicioSesion");
    const botonRegistro = document.getElementById("mostrarRegistro");
    const formularioInicioSesion = document.getElementById("formularioInicioSesion");
    const formularioRegistro = document.getElementById("formularioRegistro");

    // Función para cambiar entre formularios
    function cambiarFormulario(mostrar) {
        if (mostrar === "inicioSesion") {
            formularioInicioSesion.classList.add("activo");
            formularioRegistro.classList.remove("activo");
            botonInicioSesion.classList.add("activo");
            botonRegistro.classList.remove("activo");
        } else {
            formularioRegistro.classList.add("activo");
            formularioInicioSesion.classList.remove("activo");
            botonRegistro.classList.add("activo");
            botonInicioSesion.classList.remove("activo");
        }
    }

    // Event Listeners para cambiar de formulario
    botonInicioSesion.addEventListener("click", () => cambiarFormulario("inicioSesion"));
    botonRegistro.addEventListener("click", () => cambiarFormulario("registro"));

    //MANEJAR REGISTRO DE USUARIO
    formularioRegistro.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita recargar la página

        // Recoger los datos del formulario de registro
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const email = document.getElementById("email").value;
        const telefono = document.getElementById("telefono").value;
        const contrasena = document.getElementById("contrasenaRegistro").value;
        const tipo_usuario = document.getElementById("tipoUsuarioRegistro").value;

        // Crear objeto con los datos
        const datosUsuario = { nombre, apellido, email, telefono, contrasena, tipo_usuario };

        try {
            // Enviar los datos al servidor
            const response = await fetch('/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });

            if (response.redirected) {
                window.location.href = response.url; // Redirige al panel si el registro es exitoso
            } else {
                const data = await response.json();
                alert(data.error || 'Hubo un error al registrar el usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al registrar el usuario');
        }
    });

    //MANEJAR INICIO DE SESIÓN
    formularioInicioSesion.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita recargar la página

        // Recoger los datos del formulario de login
        const email = document.getElementById("correoInicio").value;
        const contrasena = document.getElementById("contrasenaInicio").value;

        const datos = { email, contrasena };

        try {
            // Enviar datos al servidor
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (response.redirected) {
                window.location.href = response.url; // Redirige al panel si el login es exitoso
            } else {
                const data = await response.json();
                alert(data.error || 'Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al iniciar sesión');
        }
    });
});
