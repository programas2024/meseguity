// informacion.js - Módulo para mostrar información sobre Messergy

const Informacion = {
    // Inicializar el módulo
    inicializar: function() {
        console.log("ℹ️ Inicializando módulo de información...");
        this.configurarEventos();
    },

    // Configurar eventos del botón de información
    configurarEventos: function() {
        const btnInformacion = document.getElementById('btnInformacion');
        
        if (btnInformacion) {
            console.log("✅ Botón de información encontrado");
            btnInformacion.addEventListener('click', () => {
                this.mostrarInformacionApp();
            });
        } else {
            console.log("⚠️ Botón de información no encontrado");
        }
    },

    // Función para mostrar la información de la aplicación
    mostrarInformacionApp: function() {
        Swal.fire({
            title: '<h2 style="color: #667eea; margin-bottom: 20px;">🌟 Messergy</h2>',
            html: `
                <div class="informacion-app">
                    <div class="app-header">
                        <div class="app-logo">
                            <i class="fas fa-comments" style="font-size: 48px; color: #667eea;"></i>
                        </div>
                        <h3 style="color: #333; margin: 15px 0 10px 0;">Tu plataforma de comunicación y entretenimiento</h3>
                        <p style="color: #666; margin-bottom: 25px;">Conecta, comunica y diviértete con tus amigos</p>
                    </div>
                    
                    <div class="caracteristicas-grid">
                        <div class="caracteristica">
                            <div class="caracteristica-icono" style="background: #E3F2FD;">
                                <i class="fas fa-comment-dots" style="color: #1976D2;"></i>
                            </div>
                            <h4 style="color: #333; margin: 10px 0 5px 0;">Mensajes</h4>
                            <p style="color: #666; font-size: 14px;">Envía y recibe mensajes instantáneos</p>
                        </div>
                        
                        <div class="caracteristica">
                            <div class="caracteristica-icono" style="background: #E8F5E9;">
                                <i class="fas fa-reply" style="color: #388E3C;"></i>
                            </div>
                            <h4 style="color: #333; margin: 10px 0 5px 0;">Respuestas</h4>
                            <p style="color: #666; font-size: 14px;">Responde mensajes fácilmente</p>
                        </div>
                        
                        <div class="caracteristica">
                            <div class="caracteristica-icono" style="background: #FFF3E0;">
                                <i class="fas fa-users" style="color: #F57C00;"></i>
                            </div>
                            <h4 style="color: #333; margin: 10px 0 5px 0;">Grupos</h4>
                            <p style="color: #666; font-size: 14px;">Crea y administra tus grupos</p>
                        </div>
                        
                        <div class="caracteristica">
                            <div class="caracteristica-icono" style="background: #FCE4EC;">
                                <i class="fas fa-user-friends" style="color: #C2185B;"></i>
                            </div>
                            <h4 style="color: #333; margin: 10px 0 5px 0;">Amigos</h4>
                            <p style="color: #666; font-size: 14px;">Conecta y mantén tus amistades</p>
                        </div>
                        
                        <div class="caracteristica">
                            <div class="caracteristica-icono" style="background: #F3E5F5;">
                                <i class="fas fa-gamepad" style="color: #7B1FA2;"></i>
                            </div>
                            <h4 style="color: #333; margin: 10px 0 5px 0;">Juegos</h4>
                            <p style="color: #666; font-size: 14px;">Juegos divertidos para todos</p>
                        </div>
                        
                        <div class="caracteristica">
                            <div class="caracteristica-icono" style="background: #E0F7FA;">
                                <i class="fas fa-trophy" style="color: #0097A7;"></i>
                            </div>
                            <h4 style="color: #333; margin: 10px 0 5px 0;">Ranking</h4>
                            <p style="color: #666; font-size: 14px;">Sé el mejor en la tabla</p>
                        </div>
                    </div>
                    
                    <div class="app-stats" style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                        <h4 style="margin: 0 0 15px 0; text-align: center;">🏆 ¡Conviértete en el #1!</h4>
                        <p style="margin: 0; text-align: center; font-size: 15px; opacity: 0.9;">
                            Sube de nivel, gana puntos y demuestra que eres el mejor en Messergy
                        </p>
                    </div>
                    
                    <div class="app-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 13px; text-align: center; margin: 0;">
                            Messergy v1.0 • Conéctate, juega y domina
                        </p>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            closeButtonHtml: '&times;',
            width: 500,
            padding: '25px',
            customClass: {
                popup: 'popup-informacion',
                closeButton: 'close-button-informacion'
            },
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    },

    // Función para mostrar información sobre una característica específica
    mostrarDetalleCaracteristica: function(caracteristica) {
        const detalles = {
            mensajes: {
                titulo: '💬 Sistema de Mensajes',
                contenido: 'Envía mensajes instantáneos, imágenes y archivos. Organiza tus conversaciones y mantente conectado.'
            },
            grupos: {
                titulo: '👥 Grupos',
                contenido: 'Crea grupos personalizados, invita amigos y comparte momentos especiales. Administra permisos y roles.'
            },
            juegos: {
                titulo: '🎮 Juegos',
                contenido: 'Diversión garantizada con nuestra colección de juegos. Compite con amigos y sube en el ranking.'
            }
        };

        const detalle = detalles[caracteristica] || {
            titulo: '🌟 Messergy',
            contenido: 'La mejor plataforma de comunicación y entretenimiento.'
        };

        Swal.fire({
            title: detalle.titulo,
            text: detalle.contenido,
            icon: 'info',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#667eea',
            customClass: {
                popup: 'popup-detalle'
            }
        });
    }
};

// Auto-inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        Informacion.inicializar();
    }, 100);
});