document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');

  if (!loginForm) {
    console.error('Formulario de login no encontrado');
    return;
  }

  loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = event.target.email.value;
    const contraseña = event.target.contraseña.value;

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, contraseña })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        localStorage.setItem('token', data.token); // Guarda el token en localStorage

        // Redirecciona según el tipo de usuario
        if (data.tipo_usuario === 'admin') {
          window.location.href = '/Notificaciones/index.html'; // Página para admin
        } else {
          window.location.href = '/index.html'; // Página para usuario regular
        }
      } else {
        alert(data.message); // Muestra mensaje de error
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  });
});