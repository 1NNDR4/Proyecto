document.addEventListener('DOMContentLoaded', function() {
    const formularioDenuncia = document.getElementById('formularioDenuncia');
    const divMensaje = document.getElementById('mensaje');
    const seccionAdmin = document.getElementById('seccionAdmin');
    const listaDenuncias = document.getElementById('listaDenuncias');
  
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = '/login/login.html';
        return;
    }
  
    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, esError = false) {
        divMensaje.textContent = mensaje;
        divMensaje.className = `mt-4 text-center p-2 rounded ${esError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        divMensaje.classList.remove('hidden');
    }
  
    // Manejar el envío del formulario de denuncia
    formularioDenuncia.addEventListener('submit', async function(evento) {
        evento.preventDefault();
  
        const descripcion = document.getElementById('descripcion').value;
  
        try {
            const respuesta = await fetch('http://localhost:3000/denuncias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ descripcion })
            });
  
            if (respuesta.status === 401) {
                localStorage.removeItem('jwt_token');
                window.location.href = '/login/login.html';
                return;
            }
  
            if (!respuesta.ok) {
                throw new Error(`Error en la solicitud: ${respuesta.status} ${respuesta.statusText}`);
            }
  
            const resultado = await respuesta.json();
            mostrarMensaje(resultado.message);
            formularioDenuncia.reset();
  
            // Si el usuario es admin, actualizar la lista de denuncias
            if (esAdmin()) {
                cargarDenuncias();
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            mostrarMensaje('Hubo un error al enviar la denuncia: ' + error.message, true);
        }
    });
  
    // Función para verificar si el usuario es admin
    function esAdmin() {
        const tipoUsuario = localStorage.getItem('tipo_usuario');
        return tipoUsuario === 'admin';
    }
  
    // Cargar y mostrar denuncias para administradores
    async function cargarDenuncias() {
        if (!esAdmin()) return;
  
        try {
            const respuesta = await fetch('http://localhost:3000/denuncias', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
  
            if (!respuesta.ok) {
                throw new Error(`Error al cargar denuncias: ${respuesta.status} ${respuesta.statusText}`);
            }
  
            const denuncias = await respuesta.json();
            mostrarDenuncias(denuncias);
        } catch (error) {
            console.error('Error al cargar denuncias:', error);
        }
    }
  
    // Mostrar denuncias en el panel de administración
    function mostrarDenuncias(denuncias) {
        listaDenuncias.innerHTML = '';
        denuncias.forEach(denuncia => {
            const elementoDenuncia = document.createElement('div');
            elementoDenuncia.className = 'bg-gray-50 p-4 rounded-lg shadow';
            elementoDenuncia.innerHTML = `
                <p class="font-bold">Usuario: ${denuncia.nombre} ${denuncia.apellido}</p>
                <p>Descripción: ${denuncia.descripcion}</p>
                <p>Fecha: ${new Date(denuncia.fecha).toLocaleString()}</p>
                <p>Estado: ${denuncia.estado}</p>
                <button class="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" 
                        onclick="actualizarEstadoDenuncia(${denuncia.denuncia_id}, '${denuncia.estado === 'pendiente' ? 'resuelta' : 'pendiente'}')">
                    Cambiar a ${denuncia.estado === 'pendiente' ? 'Resuelta' : 'Pendiente'}
                </button>
            `;
            listaDenuncias.appendChild(elementoDenuncia);
        });
    }
  
    // Función para actualizar el estado de una denuncia
    window.actualizarEstadoDenuncia = async function(denunciaId, nuevoEstado) {
        try {
            const respuesta = await fetch(`http://localhost:3000/denuncias/${denunciaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
  
            if (!respuesta.ok) {
                throw new Error(`Error al actualizar denuncia: ${respuesta.status} ${respuesta.statusText}`);
            }
  
            mostrarMensaje('Estado de la denuncia actualizado correctamente');
            cargarDenuncias();
        } catch (error) {
            console.error('Error al actualizar denuncia:', error);
            mostrarMensaje('Error al actualizar el estado de la denuncia', true);
        }
    };
  
    // Inicialización
    if (esAdmin()) {
        seccionAdmin.classList.remove('hidden');
        cargarDenuncias();
    }
  });