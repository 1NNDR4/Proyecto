document.addEventListener('DOMContentLoaded', function () {
    const notificationForm = document.getElementById('notificationForm');
    const notificationList = document.getElementById('notificationList');
    const eventForm = document.getElementById('eventForm');
    const eventList = document.getElementById('eventList');
    const toggleNotifications = document.getElementById('toggleNotifications');
    const toggleEvents = document.getElementById('toggleEvents');
    const notificationSection = document.getElementById('notificationSection');
    const eventSection = document.getElementById('eventSection');
    const backToMainButton = document.getElementById('backToMain');

    let notifications = [];
    let events = [];

    // Funcionalidad para desplegar secciones
    toggleNotifications.addEventListener('click', function() {
        const notificationContent = notificationSection.querySelector('.section-content');
        notificationContent.classList.toggle('hidden');
        this.classList.toggle('active');
        this.textContent = notificationContent.classList.contains('hidden') ? 'Mostrar Notificaciones' : 'Ocultar Notificaciones';
    });

    toggleEvents.addEventListener('click', function() {
        const eventContent = eventSection.querySelector('.section-content');
        eventContent.classList.toggle('hidden');
        this.classList.toggle('active');
        this.textContent = eventContent.classList.contains('hidden') ? 'Mostrar Eventos' : 'Ocultar Eventos';
    });

    // Funcionalidad para notificaciones
    notificationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value;
        const evento = document.getElementById('evento').value;
        const mensaje = document.getElementById('mensaje').value;

        try {
            const response = await fetch('http://localhost:3000/notificaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario_id: usuario, evento_id: evento, mensaje }),
            });

            if (!response.ok) {
                throw new Error('Error al crear la notificación');
            }

            await loadNotifications();
            notificationForm.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear la notificación');
        }
    });

    async function loadNotifications() {
        try {
            const response = await fetch('http://localhost:3000/notificaciones');
            if (!response.ok) {
                throw new Error('Error al cargar las notificaciones');
            }
            notifications = await response.json();
            renderNotifications();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar las notificaciones');
        }
    }

    function renderNotifications() {
        notificationList.innerHTML = '';
        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.classList.add('notification-item');
            notificationElement.innerHTML = `
                <h3>${notification.nombre_evento}</h3>
                <p>Usuario: ${notification.nombre_usuario} ${notification.apellido_usuario}</p>
                <p>${notification.mensaje}</p>
                <div class="notification-actions">
                    <button class="mark-read" data-id="${notification.notificacion_id}">${notification.leido ? 'Marcar como no leída' : 'Marcar como leída'}</button>
                    <button class="delete" data-id="${notification.notificacion_id}">Eliminar</button>
                </div>
            `;
            notificationList.appendChild(notificationElement);
        });

        document.querySelectorAll('.mark-read').forEach(button => {
            button.addEventListener('click', toggleReadStatus);
        });
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', deleteNotification);
        });
    }

    async function toggleReadStatus(e) {
        const notificationId = e.target.getAttribute('data-id');
        try {
            const response = await fetch(`http://localhost:3000/notificaciones/${notificationId}/read`, {
                method: 'PUT'
            });
            if (!response.ok) {
                throw new Error('Error al actualizar la notificación');
            }
            await loadNotifications();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar la notificación');
        }
    }

    async function deleteNotification(e) {
        const notificationId = e.target.getAttribute('data-id');
        try {
            const response = await fetch(`http://localhost:3000/notificaciones/${notificationId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Error al eliminar la notificación');
            }
            await loadNotifications();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la notificación');
        }
    }

    // Funcionalidad para eventos
    eventForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventPlace = document.getElementById('eventPlace').value;
        const eventDescription = document.getElementById('eventDescription').value;

        const eventData = { 
            nombre: eventName, 
            fecha: eventDate, 
            lugar: eventPlace, 
            descripcion: eventDescription 
        };

        try {
            let response;
            if (eventForm.dataset.editing) {
                response = await fetch(`http://localhost:3000/eventos/${eventForm.dataset.editing}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData),
                });
            } else {
                response = await fetch('http://localhost:3000/eventos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData),
                });
            }

            if (!response.ok) {
                throw new Error('Error al guardar el evento');
            }

            await loadEvents();
            eventForm.reset();
            eventForm.dataset.editing = '';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar el evento');
        }
    });

    async function loadEvents() {
        try {
            const response = await fetch('http://localhost:3000/eventos');
            if (!response.ok) {
                throw new Error('Error al cargar eventos');
            }
            events = await response.json();
            renderEvents();
            updateEventSelect();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar eventos');
        }
    }

    function renderEvents() {
        eventList.innerHTML = '';
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('event-item');
            eventElement.innerHTML = `
                <h3>${event.nombre}</h3>
                <p>Fecha: ${new Date(event.fecha).toLocaleString()}</p>
                <p>Lugar: ${event.lugar}</p>
                <p>${event.descripcion}</p>
                <div class="event-actions">
                    <button class="edit-event" data-id="${event.evento_id}">Editar</button>
                    <button class="delete-event" data-id="${event.evento_id}">Eliminar</button>
                </div>
            `;
            eventList.appendChild(eventElement);
        });

        document.querySelectorAll('.edit-event').forEach(button => {
            button.addEventListener('click', editEvent);
        });
        document.querySelectorAll('.delete-event').forEach(button => {
            button.addEventListener('click', deleteEvent);
        });
    }

    function updateEventSelect() {
        const eventSelect = document.getElementById('evento');
        eventSelect.innerHTML = '<option value="">Seleccione un evento</option>';
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.evento_id;
            option.textContent = event.nombre;
            eventSelect.appendChild(option);
        });
    }

    function editEvent(e) {
        const eventId = e.target.getAttribute('data-id');
        const event = events.find(ev => ev.evento_id == eventId);
        if (event) {
            document.getElementById('eventName').value = event.nombre;
            document.getElementById('eventDate').value = event.fecha.slice(0, 16); // Formato YYYY-MM-DDTHH:mm
            document.getElementById('eventPlace').value = event.lugar;
            document.getElementById('eventDescription').value = event.descripcion;
            eventForm.dataset.editing = eventId;
        }
    }

    async function deleteEvent(e) {
        const eventId = e.target.getAttribute('data-id');
        try {
            const response = await fetch(`http://localhost:3000/eventos/${eventId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Error al eliminar el evento');
            }
            await loadEvents();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el evento');
        }
    }

    // Cargar usuarios y eventos
    async function loadUsers() {
        try {
            const response = await fetch('http://localhost:3000/usuarios');
            if (!response.ok) {
                throw new Error('Error al cargar usuarios');
            }
            const users = await response.json();
            const userSelect = document.getElementById('usuario');
            userSelect.innerHTML = '<option value="">Seleccione un usuario</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.usuario_id;
                option.textContent = `${user.nombre} ${user.apellido}`;
                userSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar usuarios');
        }
    }

    // Inicializar la carga de datos
    loadUsers();
    loadEvents();
    loadNotifications();

    // Funcionalidad para volver a la página principal
    backToMainButton.addEventListener('click', function() {
        window.location.href = '/index.html'; // Asegúrate de que esta sea la ruta correcta a tu página principal
    });
});