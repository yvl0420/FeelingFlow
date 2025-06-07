document.addEventListener("DOMContentLoaded", () => { 
    // Elementos del formulario
    const botonInicioSesion = document.getElementById("mostrarInicioSesion");
    const botonRegistro = document.getElementById("mostrarRegistro");
    const formularioInicioSesion = document.getElementById("formularioInicioSesion");
    const formularioRegistro = document.getElementById("formularioRegistro");

    // Campos adicionales para médicos
    const tipoUsuarioRegistro = document.getElementById("tipoUsuarioRegistro");
    const especialidadGrupo = document.getElementById("especialidadGrupo");
    const ubicacionGrupo = document.getElementById("ubicacionGrupo");
    const especialidad = document.getElementById("especialidad");
    const ubicacion = document.getElementById("ubicacion");

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
    if (botonInicioSesion && botonRegistro) {
        botonInicioSesion.addEventListener("click", () => cambiarFormulario("inicioSesion"));
        botonRegistro.addEventListener("click", () => cambiarFormulario("registro"));
    }

    // Mostrar/ocultar campos de especialidad y ubicación según tipo de usuario
    if (tipoUsuarioRegistro) {
        tipoUsuarioRegistro.addEventListener("change", function () {
            const isMedico = this.value === "medico";
            if (especialidadGrupo) especialidadGrupo.style.display = isMedico ? "block" : "none";
            if (ubicacionGrupo) ubicacionGrupo.style.display = isMedico ? "block" : "none";
        });
    }

    // --- AUTOCOMPLETADO DE UBICACIÓN ---
    if (ubicacion) {
        const listaSugerencias = document.getElementById("sugerencias-ubicacion");
        ubicacion.addEventListener("input", function () {
            const query = ubicacion.value;
            if (query.length < 3) {
                listaSugerencias.innerHTML = "";
                return;
            }
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=es`)
                .then(res => res.json())
                .then(data => {
                    listaSugerencias.innerHTML = "";
                    data.forEach(item => {
                        const li = document.createElement("li");
                        li.textContent = item.display_name;
                        li.tabIndex = 0;
                        li.addEventListener("mousedown", function () {
                            ubicacion.value = item.display_name;
                            listaSugerencias.innerHTML = "";
                        });
                        listaSugerencias.appendChild(li);
                    });
                });
        });

        ubicacion.addEventListener("blur", function () {
            setTimeout(() => { listaSugerencias.innerHTML = ""; }, 100);
        });
    }
    // --- FIN AUTOCOMPLETADO DE UBICACIÓN ---

    // MANEJAR REGISTRO DE USUARIO
    formularioRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Recoger los datos del formulario de registro
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const email = document.getElementById("email").value;
        const telefono = document.getElementById("telefono").value;
        const contrasena = document.getElementById("contrasenaRegistro").value;
        const tipo_usuario = tipoUsuarioRegistro.value;

        // Solo para médicos
        const datosUsuario = { nombre, apellido, email, telefono, contrasena, tipo_usuario };
        if (tipo_usuario === "medico") {
            datosUsuario.especialidad = especialidad.value;
            datosUsuario.ubicacion = ubicacion.value;
        }

        try {
            const response = await fetch('/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.json();
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                alert(data.error || 'Hubo un error al registrar el usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al registrar el usuario');
        }
    });

    // MANEJAR INICIO DE SESIÓN
    formularioInicioSesion.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("correoInicio").value;
        const contrasena = document.getElementById("contrasenaInicio").value;

        const datos = { email, contrasena };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const data = await response.json();
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                alert(data.error || 'Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al iniciar sesión');
        }
    });
});