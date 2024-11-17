// denuncia.js
document.addEventListener('DOMContentLoaded', function() {
    const denunciaForm = document.getElementById('denunciaForm');
    const token = localStorage.getItem('jwt_token');
  
    if (!token) {
      console.error('No se encontró el token en localStorage');
      alert('No has iniciado sesión. Por favor, inicia sesión para continuar.');
      window.location.href = '/login/login.html';
      return;
    }
  
    denunciaForm.addEventListener('submit', async function(event) {
      event.preventDefault();
  
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.error('El token ha desaparecido durante la sesión');
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.href = '/login/login.html';
        return;
      }
  
      const usuarioId = document.getElementById('usuario_id').value;
      const descripcion = document.getElementById('descripcion').value;
      const fecha = document.getElementById('fecha').value;
      const estado = document.getElementById('estado').value || 'pendiente';
  
      const data = {
        usuario_id: usuarioId,
        descripcion: descripcion,
        fecha: fecha,
        estado: estado
      };
  
      try {
        const response = await fetch('http://localhost:3000/denuncias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
  
        console.log('Respuesta del servidor:', response.status, response.statusText);
  
        if (response.status === 401) {
          console.error('Token inválido o expirado');
          alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
          localStorage.removeItem('jwt_token');
          window.location.href = '/login/login.html';
          return;
        }
  
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
  
        const result = await response.json();
        console.log('Respuesta del servidor:', result);
        alert(result.message);
        
        // Limpiar el formulario después de una denuncia exitosa
        denunciaForm.reset();
      } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Hubo un error al enviar la denuncia: ' + error.message);
      }
    });
  });