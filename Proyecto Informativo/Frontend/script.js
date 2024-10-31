document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu-button');
    const menu = document.getElementById('menu');
    const verMasBtn = document.getElementById('ver-mas-btn');
    const informacionAdicional = document.getElementById('informacion-adicional');
    const informacionAdicional2 = document.getElementById('informacion-adicional-2');
    const informacionAdicional3 = document.getElementById('informacion-adicional-3');
    const container = document.getElementById('container');

    // Mostrar/Ocultar el menú
    menuButton.addEventListener('click', function() {
        menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
    });

    // Mostrar/Ocultar la sección de información adicional, login y noticias
    verMasBtn.addEventListener('click', function(event) {
        event.preventDefault();
        const isHidden = informacionAdicional.style.display === 'none' || informacionAdicional.style.display === '';
        
        informacionAdicional.style.display = isHidden ? 'block' : 'none';
        container.style.display = isHidden ? 'block' : 'none';
        informacionAdicional2.style.display = isHidden ? 'block' : 'none';
        informacionAdicional3.style.display = isHidden ? 'block' : 'none';

        verMasBtn.textContent = isHidden ? 'Ver menos' : 'Ver más';
        
        if (isHidden) {
            informacionAdicional.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
