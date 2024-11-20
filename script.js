document.addEventListener('DOMContentLoaded', function() {
    const abrirMenuBtn = document.getElementById("abrir");
    const cerrarMenuBtn = document.getElementById("cerrar");
    const nav = document.getElementById("nav");
    const verMasBtn = document.getElementById('ver-mas-btn');
    const informacionAdicional = document.getElementById('informacion-adicional');
    const noticias = document.getElementById('noticias');
    const reportes = document.getElementById('reportes');
    const galerias = document.getElementById('galerias');
    const footer = document.getElementById('footer');
    const reportButton = document.getElementById('report-button');

    // Funcionalidad de alternar menú
    abrirMenuBtn.addEventListener("click", () => nav.classList.add("visible"));
    cerrarMenuBtn.addEventListener("click", () => nav.classList.remove("visible"));

    // Mostrar/Ocultar secciones adicionales
    verMasBtn.addEventListener('click', function(event) {
        event.preventDefault();
        const isHidden = informacionAdicional.style.display === 'none' || informacionAdicional.style.display === '';
        const displayValue = isHidden ? 'block' : 'none';

        [informacionAdicional, noticias, reportes, galerias, footer].forEach(el => el.style.display = displayValue);

        verMasBtn.textContent = isHidden ? 'Ver menos' : 'Ver más';
        
        if (isHidden) {
            informacionAdicional.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Funcionalidad del slider
    const items = document.querySelectorAll('.slider .list .item');
    const next = document.querySelector('.arrow-next');
    const prev = document.querySelector('.arrow-prev');
    const thumbnails = document.querySelectorAll('.thumbnail .item');
    let itemActive = 0;

    function showSlider() {
        document.querySelector('.slider .list .item.active').classList.remove('active');
        document.querySelector('.thumbnail .item.active').classList.remove('active');

        items[itemActive].classList.add('active');
        thumbnails[itemActive].classList.add('active');
        setPositionThumbnail();

        clearInterval(refreshInterval);
        refreshInterval = setInterval(() => next.click(), 10000);
    }

    next.onclick = () => {
        itemActive = (itemActive + 1) % items.length;
        showSlider();
    };

    prev.onclick = () => {
        itemActive = (itemActive - 1 + items.length) % items.length;
        showSlider();
    };

    function setPositionThumbnail() {
        const thumbnailActive = document.querySelector('.thumbnail .item.active');
        const rect = thumbnailActive.getBoundingClientRect();
        if (rect.left < 0 || rect.right > window.innerWidth) {
            thumbnailActive.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
        }
    }

    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            itemActive = index;
            showSlider();
        });
    });

    let refreshInterval = setInterval(() => next.click(), 10000);

    // Animación de flechas
    document.querySelectorAll(".arrow-main").forEach(arrow => {
        arrow.addEventListener("click", function(e) {
            e.preventDefault();
            if (!this.classList.contains("animate")) {
                this.classList.add("animate");
                setTimeout(() => this.classList.remove("animate"), 1600);
            }
        });
    });

    // Inicializar Swiper
    new Swiper('.envoltura', {    
        loop: true,
        spaceBetween: 30,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
        }
    });

    
    // Funciones de autenticación
    function verificarUsuarioConectado() {
        const token = localStorage.getItem('jwt_token');
        return token !== null && !tokenExpirado(token);
    }

    function tokenExpirado(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const tiempoExpiracion = payload.exp * 1000; // Convertir a milisegundos
            return Date.now() >= tiempoExpiracion;
        } catch (error) {
            console.error('Error al verificar la expiración del token:', error);
            return true; // Asume que el token ha expirado si hay un error
        }
    }

    function obtenerNombreUsuario() {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.email || 'Usuario desconocido';
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
        return 'Usuario desconocido';
    }

    function actualizarMensajeSesion() {
        if (verificarUsuarioConectado()) {
            mensajeSesion.textContent = 'Sesión iniciada con la cuenta: ' + obtenerNombreUsuario();
        } else {
            mensajeSesion.textContent = 'No has iniciado sesión';
        }
    }

    function cerrarSesion() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('tipo_usuario');
        actualizarMensajeSesion();
        window.location.href = '/index.html';
    }

    // Inicializar mensaje de sesión
    actualizarMensajeSesion();

    // Manejar clic en el botón de reporte
    botonReporte.addEventListener('click', function(evento) {
        evento.preventDefault();
        if (verificarUsuarioConectado()) {
            window.location.href = './Reportes/index.html';
        } else {
            window.location.href = './login/login.html';
        }
    });

    // Verificar si el usuario acaba de iniciar sesión y actualizar la UI en consecuencia
    const parametrosURL = new URLSearchParams(window.location.search);
    if (parametrosURL.get('login') === 'exitoso') {
        actualizarMensajeSesion();
        history.replaceState(null, '', window.location.pathname); // Eliminar parámetro de consulta
    }

    // Exponer función de cierre de sesión globalmente
    window.cerrarSesion = cerrarSesion;

    // ... (resto del código existente de la página principal)
});