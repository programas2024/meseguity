// informlogin.js - Información sobre Meseguity como plataforma de mensajería

// Configuración de características
const FEATURES = [
    {
        icon: 'fas fa-comments',
        title: 'Chat en Tiempo Real',
        description: 'Mensajería instantánea con amigos y grupos. Envía textos, imágenes, videos y audios.'
    },
    {
        icon: 'fas fa-users',
        title: 'Comunidades Activas',
        description: 'Únete a grupos de interés, conoce gente nueva y comparte tus pasatiempos.'
    },
    {
        icon: 'fas fa-gamepad',
        title: 'Juegos Multiplayer',
        description: 'Minijuegos integrados para competir con amigos y descubrir talentos ocultos.'
    },
    {
        icon: 'fas fa-brain',
        title: 'Desarrollo de Habilidades',
        description: 'Retos diarios y actividades para entrenar tus capacidades cognitivas y sociales.'
    },
    {
        icon: 'fas fa-trophy',
        title: 'Sistema de Logros',
        description: 'Desbloquea insignias y recompensas por tus interacciones y progreso.'
    },
    {
        icon: 'fas fa-palette',
        title: 'Personalización Total',
        description: 'Temas, avatares y perfiles únicos para expresar tu personalidad.'
    }
];

// Función para mostrar información sobre Meseguity
function mostrarInformacionMeseguity() {
    const featuresHTML = FEATURES.map(feature => `
        <div class="feature-card">
            <div class="feature-icon">
                <i class="${feature.icon}"></i>
            </div>
            <div class="feature-content">
                <h4>${feature.title}</h4>
                <p>${feature.description}</p>
            </div>
        </div>
    `).join('');

    Swal.fire({
        title: 'Bienvenido a Meseguity',
        html: `
            <div class="platform-info">
                <div class="info-header">
                    <h3><i class="fas fa-heart"></i> Más que un chat, es una experiencia</h3>
                    <p class="subtitle">Conecta, juega, crece y diviértete en una sola plataforma</p>
                </div>
                
                <div class="info-section">
                    <h4><i class="fas fa-bullseye"></i> Nuestra Misión</h4>
                    <p>Crear un espacio donde las conexiones humanas se fortalezcan a través de la diversión, 
                    el aprendizaje mutuo y el descubrimiento de talentos.</p>
                </div>
                
                <div class="features-grid">
                    ${featuresHTML}
                </div>
                
                <div class="info-section">
                    <h4><i class="fas fa-star"></i> ¿Por qué elegir Meseguity?</h4>
                    <div class="benefits">
                        <div class="benefit">
                            <i class="fas fa-smile"></i>
                            <span>100% Libre de anuncios</span>
                        </div>
                        <div class="benefit">
                            <i class="fas fa-shield-alt"></i>
                            <span>Privacidad garantizada</span>
                        </div>
                        <div class="benefit">
                            <i class="fas fa-globe"></i>
                            <span>Comunidad global</span>
                        </div>
                        <div class="benefit">
                            <i class="fas fa-mobile-alt"></i>
                            <span>Disponible en todos los dispositivos</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4><i class="fas fa-users"></i> Perfecto para:</h4>
                    <div class="audience">
                        <div class="audience-item">
                            <i class="fas fa-user-friends"></i>
                            <p><strong>Personas sociables</strong> que quieren expandir su círculo</p>
                        </div>
                        <div class="audience-item">
                            <i class="fas fa-gamepad"></i>
                            <p><strong>Gamers casuales</strong> que buscan diversión ligera</p>
                        </div>
                        <div class="audience-item">
                            <i class="fas fa-graduation-cap"></i>
                            <p><strong>Curiosos</strong> que quieren desarrollar nuevas habilidades</p>
                        </div>
                        <div class="audience-item">
                            <i class="fas fa-hands-helping"></i>
                            <p><strong>Comunidades</strong> que buscan un espacio propio</p>
                        </div>
                    </div>
                </div>
                
                <div class="cta-section">
                    <div class="security-badge">
                        <i class="fas fa-lock"></i>
                        <span>Conexiones seguras y moderadas</span>
                    </div>
                    <p class="small-text">Únete a miles de usuarios que ya están disfrutando de Meseguity</p>
                </div>
            </div>
        `,
        width: '800px',
        padding: '0',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '¡Quiero explorar!',
        confirmButtonColor: '#4A6491',
        backdrop: 'rgba(44, 62, 80, 0.6)',
        customClass: {
            popup: 'platform-modal',
            title: 'platform-title',
            htmlContainer: 'platform-content',
            confirmButton: 'platform-confirm-btn'
        },
        didOpen: () => {
            // Añadir estilos dinámicos
            const style = document.createElement('style');
            style.textContent = `
                .platform-modal {
                    border-radius: 20px;
                    overflow: hidden;
                }
                
                .platform-info {
                    padding: 30px;
                    max-height: 70vh;
                    overflow-y: auto;
                }
                
                .info-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .info-header h3 {
                    color: #2C3E50;
                    margin-bottom: 10px;
                    font-size: 24px;
                }
                
                .subtitle {
                    color: #4A6491;
                    font-size: 16px;
                    margin: 0;
                }
                
                .info-section {
                    margin: 25px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 15px;
                }
                
                .info-section h4 {
                    color: #2C3E50;
                    margin-bottom: 15px;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin: 25px 0;
                }
                
                .feature-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                    transition: transform 0.3s ease;
                }
                
                .feature-card:hover {
                    transform: translateY(-5px);
                }
                
                .feature-icon {
                    background: linear-gradient(135deg, #4A6491, #2C3E50);
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    flex-shrink: 0;
                }
                
                .feature-content h4 {
                    margin: 0 0 8px 0;
                    color: #2C3E50;
                    font-size: 16px;
                }
                
                .feature-content p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .benefits {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .benefit {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: white;
                    border-radius: 10px;
                }
                
                .benefit i {
                    color: #4A6491;
                    font-size: 18px;
                }
                
                .audience {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }
                
                .audience-item {
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                }
                
                .audience-item i {
                    color: #E74C3C;
                    font-size: 20px;
                    margin-top: 5px;
                }
                
                .audience-item p {
                    margin: 0;
                    font-size: 14px;
                }
                
                .cta-section {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #f0f0f0;
                }
                
                .small-text {
                    font-size: 13px;
                    color: #888;
                    margin-top: 15px;
                }
                
                @media (max-width: 768px) {
                    .platform-modal {
                        width: 95% !important;
                    }
                    
                    .platform-info {
                        padding: 20px;
                        max-height: 60vh;
                    }
                    
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .benefits, .audience {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    });
}

// Función para inicializar el botón de información
function inicializarBotonInformacion() {
    if (!document.querySelector('.info-button')) {
        const infoButton = document.createElement('button');
        infoButton.className = 'info-button';
        infoButton.innerHTML = '<i class="fas fa-info"></i>';
        infoButton.title = 'Descubre Meseguity';
        infoButton.setAttribute('aria-label', 'Información sobre la plataforma');
        
        // Insertar en el contenedor
        const loginContainer = document.querySelector('.login-container');
        if (loginContainer) {
            loginContainer.appendChild(infoButton);
        } else {
            document.body.appendChild(infoButton);
            infoButton.style.position = 'fixed';
        }
        
        // Agregar evento
        infoButton.addEventListener('click', mostrarInformacionMeseguity);
        
        // Añadir animación de entrada
        setTimeout(() => {
            infoButton.style.animation = 'fadeIn 0.5s ease';
        }, 1000);
        
        console.log('✅ Botón de información inicializado');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        inicializarBotonInformacion();
        // Añadir burbujas animadas
        crearBurbujasAnimadas();
    });
} else {
    inicializarBotonInformacion();
    crearBurbujasAnimadas();
}

// Función para crear burbujas animadas
function crearBurbujasAnimadas() {
    const background = document.createElement('div');
    background.className = 'background-animation';
    
    for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        background.appendChild(bubble);
    }
    
    document.body.prepend(background);
}

// Hacer funciones disponibles globalmente
window.mostrarInformacionMeseguity = mostrarInformacionMeseguity;
window.inicializarBotonInformacion = inicializarBotonInformacion;