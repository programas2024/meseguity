/* =========================================================
   responsive-menu.js
   Añade un botón hamburguesa y convierte la barra lateral
   en un panel deslizante en pantallas pequeñas.
   ========================================================= */
(function () {
    'use strict';

    var BREAKPOINT = 900;

    function init() {
        var sidebar = document.querySelector('.app-container > .sidebar') ||
                      document.querySelector('.sidebar');
        var main = document.querySelector('.main-content');

        if (!sidebar || !main) return;

        // Evitar duplicados
        if (document.querySelector('.mobile-nav-toggle')) return;

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'mobile-nav-toggle';
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fas fa-bars"></i>';

        var overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        overlay.setAttribute('aria-hidden', 'true');

        var header = main.querySelector('.topbar .page-header') ||
                     main.querySelector('.content-header > div') ||
                     main.querySelector('.content-header') ||
                     main;

        header.insertBefore(toggle, header.firstChild);
        document.body.appendChild(overlay);

        function openNav() {
            sidebar.classList.add('open');
            overlay.classList.add('visible');
            document.body.classList.add('nav-open');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
            toggle.innerHTML = '<i class="fas fa-times"></i>';
        }

        function closeNav() {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
            document.body.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menú de navegación');
            toggle.innerHTML = '<i class="fas fa-bars"></i>';
        }

        function isMobile() {
            return window.matchMedia('(max-width: ' + BREAKPOINT + 'px)').matches;
        }

        toggle.addEventListener('click', function () {
            if (sidebar.classList.contains('open')) {
                closeNav();
            } else {
                openNav();
            }
        });

        overlay.addEventListener('click', closeNav);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNav();
        });

        // Cerrar al elegir una opción del menú
        sidebar.addEventListener('click', function (e) {
            if (!isMobile()) return;
            if (e.target.closest('a, button')) {
                setTimeout(closeNav, 150);
            }
        });

        window.addEventListener('resize', function () {
            if (!isMobile()) closeNav();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
