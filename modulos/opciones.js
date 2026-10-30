// opciones.js - Módulo para gestionar el menú de opciones/ajustes

const Opciones = {
    // Inicializar el módulo
    inicializar: function() {
        console.log("⚙️ Inicializando módulo de opciones...");
        this.configurarEventos();
    },

    // Configurar eventos del botón de ajustes
    configurarEventos: function() {
        const btnAjustes = document.getElementById('btnAjustes');
        
        if (btnAjustes) {
            console.log("✅ Botón de ajustes encontrado");
            btnAjustes.addEventListener('click', () => {
                this.mostrarMenuAjustes();
            });
        } else {
            console.log("⚠️ Botón de ajustes no encontrado");
        }
    },

    // Función para mostrar el menú de ajustes
    mostrarMenuAjustes: function() {
        Swal.fire({
            title: 'Opciones',
            html: `
                <div class="menu-ajustes">
                    <div class="ajuste-opcion" onclick="Opciones.redirigirAJuegos()">
                        <div class="ajuste-icono" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="fas fa-gamepad"></i>
                        </div>
                        <div class="ajuste-contenido">
                            <h4>Juegos</h4>
                            <p>Accede a los juegos disponibles</p>
                        </div>
                        <div class="ajuste-flecha">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="separador-ajustes"></div>
                    
                    <div class="ajuste-opcion" onclick="Opciones.redirigirARango()">
                        <div class="ajuste-icono" style="background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="ajuste-contenido">
                            <h4>Rango</h4>
                            <p>Consulta tu progreso y ranking</p>
                        </div>
                        <div class="ajuste-flecha">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="separador-ajustes"></div>
                    
                    <div class="ajuste-opcion" onclick="Opciones.redirigirALogros()">
                        <div class="ajuste-icono" style="background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);">
                            <i class="fas fa-medal"></i>
                        </div>
                        <div class="ajuste-contenido">
                            <h4>Logros</h4>
                            <p>Desbloquea y visualiza tus logros</p>
                        </div>
                        <div class="ajuste-flecha">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            closeButtonHtml: '&times;',
            width: 400,
            padding: '0',
            customClass: {
                popup: 'popup-ajustes',
                closeButton: 'close-button-ajustes'
            }
        });
    },

    // Funciones de redirección
    redirigirAJuegos: function() {
        Swal.close();
        window.location.href = 'juegos.html';
    },

    redirigirARango: function() {
        Swal.close();
        window.location.href = 'rango.html';
    },

    redirigirALogros: function() {
        Swal.close();
        window.location.href = 'logros.html';
    }
};

// Auto-inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que otros módulos estén cargados
    setTimeout(() => {
        Opciones.inicializar();
    }, 100);
});