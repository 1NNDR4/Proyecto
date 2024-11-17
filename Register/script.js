document.addEventListener('DOMContentLoaded', () => {
    const registrarBtn = document.getElementById('registrarBtn');

    registrarBtn.addEventListener('click', async (e) => {
        e.preventDefault();  // Prevenir el envío tradicional del formulario

        // Obtener los datos del formulario
        const nombre = document.getElementById('nombres').value;
        const apellido = document.getElementById('apellidos').value;
        const email = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;

        // Validación simple de los campos
        if (!nombre || !apellido || !email || !contrasena) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Validar la longitud de la contraseña
        if (contrasena.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        // Crear el objeto con los datos para enviar (se asigna `usuario` por defecto)
        const data = {
            nombre: nombre,
            apellido: apellido,
            email: email,
            contraseña: contrasena,
            tipo_usuario: 'usuario'  // Asignar el rol como 'usuario' por defecto
        };

        try {
            // Enviar los datos al backend con fetch
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Leer la respuesta del servidor
            const result = await response.json();
            console.log(result); // Ver el resultado en la consola para debug

            if (response.status === 201) {
                alert('Usuario registrado con éxito');
                // Redirigir a la página de login
                window.location.href = '/login/login.html';  // Redirigir a la página de login
            } else {
                alert(result.message);  // Mostrar el mensaje de error
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            alert('Hubo un error al registrar el usuario. Inténtalo de nuevo.');
        }
    });
});


