// informlogin.js - Información sobre Meseguity como plataforma de mensajería

// Configuración de características con colores azul/celeste
const FEATURES = [
    {
        icon: 'fas fa-comments',
        title: 'Chat en Tiempo Real',
        description: 'Mensajería instantánea con amigos y grupos. Envía textos, imágenes, videos y audios.',
        color: '#667eea'
    },
    {
        icon: 'fas fa-users',
        title: 'Comunidades Activas',
        description: 'Únete a grupos de interés, conoce gente nueva y comparte tus pasatiempos.',
        color: '#764ba2'
    },
    {
        icon: 'fas fa-gamepad',
        title: 'Juegos Multiplayer',
        description: 'Minijuegos integrados para competir con amigos y descubrir talentos ocultos.',
        color: '#9b59b6'
    },
    {
        icon: 'fas fa-brain',
        title: 'Desarrollo de Habilidades',
        description: 'Retos diarios y actividades para entrenar tus capacidades cognitivas y sociales.',
        color: '#3498db'
    },
    {
        icon: 'fas fa-trophy',
        title: 'Sistema de Logros',
        description: 'Desbloquea insignias y recompensas por tus interacciones y progreso.',
        color: '#f39c12'
    },
    {
        icon: 'fas fa-palette',
        title: 'Personalización Total',
        description: 'Temas, avatares y perfiles únicos para expresar tu personalidad.',
        color: '#e74c3c'
    }
];

// Función para mostrar información sobre Meseguity
function mostrarInformacionMeseguity() {
    const featuresHTML = FEATURES.map(feature => `
        <div class="feature-card">
            <div class="feature-icon" style="background: ${feature.color}">
                <i class="${feature.icon}"></i>
            </div>
            <div class="feature-content">
                <h4>${feature.title}</h4>
                <p>${feature.description}</p>
            </div>
        </div>
    `).join('');

    Swal.fire({
        title: '<div class="modal-header"><i class="fas fa-info-circle"></i> Descubre Meseguity</div>',
        html: `
            <div class="platform-info">
                <!-- Hero Section -->
                <div class="hero-banner">
                    <div class="hero-content">
                        <div class="hero-icon">
                            <i class="fas fa-comment-dots"></i>
                        </div>
                        <h3>Conecta, Juega y Crece</h3>
                        <p class="hero-subtitle">La plataforma de mensajería que transforma conversaciones en experiencias únicas</p>
                    </div>
                </div>
                
                <!-- Stats Cards -->
                <div class="stats-container">
                    <div class="stat-card">
                        <i class="fas fa-bolt" style="color: #667eea"></i>
                        <div class="stat-content">
                            <span class="stat-value">Rápido</span>
                            <span class="stat-label">y optimizado</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-shield-alt" style="color: #764ba2"></i>
                        <div class="stat-content">
                            <span class="stat-value">Seguro</span>
                            <span class="stat-label">y privado</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-smile" style="color: #f39c12"></i>
                        <div class="stat-content">
                            <span class="stat-value">Divertido</span>
                            <span class="stat-label">y social</span>
                        </div>
                    </div>
                </div>
                
                <!-- Mission -->
                <div class="mission-section">
                    <h4><i class="fas fa-bullseye"></i> Nuestra Visión</h4>
                    <p>Crear un espacio digital donde cada conversación sea una oportunidad para descubrir, aprender y conectar de manera significativa con personas alrededor del mundo.</p>
                </div>
                
                <!-- Features -->
                <div class="features-header">
                    <h4><i class="fas fa-star"></i> Características Exclusivas</h4>
                    <p>Todo lo que necesitas en una sola plataforma</p>
                </div>
                
                <div class="features-grid">
                    ${featuresHTML}
                </div>
                
                <!-- Benefits -->
                <div class="benefits-section">
                    <h4><i class="fas fa-heart"></i> ¿Por qué elegir Meseguity?</h4>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <i class="fas fa-adjust"></i>
                            <span>100% libre de anuncios</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-sync-alt"></i>
                            <span>Sincronización multiplataforma</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-headset"></i>
                            <span>Soporte 24/7 disponible</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-mobile-alt"></i>
                            <span>Optimizado para móviles</span>
                        </div>
                    </div>
                </div>
                
                <!-- CTA Final -->
                <div class="final-cta">
                    <div class="cta-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <div class="cta-text">
                        <h5>¡Comienza tu aventura ahora!</h5>
                        <p>Regístrate en segundos y descubre una nueva forma de conectar</p>
                    </div>
                </div>
            </div>
        `,
        width: '850px',
        padding: '0',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '<i class="fas fa-play-circle"></i> Explorar Plataforma',
        confirmButtonColor: '#667eea',
        background: '#ffffff',
        backdrop: 'rgba(102, 126, 234, 0.1)',
        customClass: {
            popup: 'sweet-popup-ayuda meseguity-modal',
            title: 'modal-title-custom',
            htmlContainer: 'modal-content-custom',
            confirmButton: 'sweet-confirm-ayuda meseguity-confirm-btn',
            closeButton: 'modal-close-custom'
        },
        didOpen: () => {
            const style = document.createElement('style');
            style.textContent = `
                /* Título del modal */
                .modal-title-custom {
                    width: 100% !important;
                    text-align: center !important;
                    margin: 0 !important;
                    padding: 25px 0 !important;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    color: white !important;
                    font-size: 24px !important;
                    font-weight: 700 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    position: relative !important;
                }
                
                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                }
                
                .modal-header i {
                    font-size: 28px;
                }
                
                /* BOTÓN DE CERRAR - GRANDE Y LLAMATIVO */
                .modal-close-custom {
                    position: absolute !important;
                    top: 15px !important;
                    right: 15px !important;
                    width: 40px !important;
                    height: 40px !important;
                    font-size: 40px !important;
                    color: white !important;
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(255, 77, 77, 0.9)) !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                    cursor: pointer !important;
                    opacity: 1 !important;
                    z-index: 9999 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border: 3px solid rgba(255, 255, 255, 0.5) !important;
                    box-shadow: 
                        0 8px 25px rgba(255, 107, 107, 0.4),
                        0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
                    font-weight: 300 !important;
                    line-height: 0 !important;
                }
                
                .modal-close-custom:hover {
                    background: linear-gradient(135deg, #ff6b6b, #ff5252) !important;
                    color: white !important;
                    transform: scale(1.15) rotate(90deg) !important;
                    opacity: 1 !important;
                    border-color: white !important;
                    box-shadow: 
                        0 12px 35px rgba(255, 107, 107, 0.6),
                        0 0 0 2px rgba(255, 255, 255, 0.2) inset !important;
                }
                
                .modal-close-custom:active {
                    transform: scale(0.9) rotate(90deg) !important;
                }
                
                /* Efecto de pulso en hover */
                .modal-close-custom::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    animation: close-pulse 1.5s infinite;
                    opacity: 0;
                }
                
                @keyframes close-pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.3);
                        opacity: 0;
                    }
                }
                
                .modal-close-custom:hover::after {
                    animation: close-pulse 0.8s infinite;
                }
                
                /* Animación de entrada para el botón de cerrar */
                @keyframes closeButtonEntrance {
                    0% {
                        transform: scale(0) rotate(-180deg);
                        opacity: 0;
                    }
                    70% {
                        transform: scale(1.2) rotate(10deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }
                
                .modal-close-custom {
                    animation: closeButtonEntrance 0.6s ease-out forwards;
                }
                
                /* Contenido del modal */
                .modal-content-custom {
                    padding: 0 !important;
                    max-height: 65vh !important;
                    overflow-y: auto !important;
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
                }
                
                .platform-info {
                    padding: 30px;
                }
                
                /* Hero Banner */
                .hero-banner {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                    border-radius: 20px;
                    padding: 30px;
                    text-align: center;
                    margin-bottom: 30px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                }
                
                .hero-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                    color: white;
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
                }
                
                .hero-banner h3 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 26px;
                    font-weight: 700;
                }
                
                .hero-subtitle {
                    margin: 0;
                    color: #7f8c8d;
                    font-size: 16px;
                    line-height: 1.6;
                    max-width: 600px;
                    margin: 0 auto;
                }
                
                /* Stats Container */
                .stats-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .stat-card {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
                }
                
                .stat-card i {
                    font-size: 32px;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(102, 126, 234, 0.1);
                    border-radius: 12px;
                }
                
                .stat-content {
                    display: flex;
                    flex-direction: column;
                }
                
                .stat-value {
                    font-weight: 700;
                    color: #2c3e50;
                    font-size: 18px;
                }
                
                .stat-label {
                    color: #7f8c8d;
                    font-size: 14px;
                }
                
                /* Mission Section */
                .mission-section {
                    background: white;
                    border-radius: 15px;
                    padding: 25px;
                    margin-bottom: 30px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                }
                
                .mission-section h4 {
                    margin: 0 0 15px 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 20px;
                }
                
                .mission-section h4 i {
                    color: #667eea;
                }
                
                .mission-section p {
                    margin: 0;
                    color: #5d6d7e;
                    line-height: 1.7;
                    font-size: 15px;
                }
                
                /* Features Header */
                .features-header {
                    text-align: center;
                    margin: 30px 0;
                }
                
                .features-header h4 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .features-header p {
                    margin: 0;
                    color: #7f8c8d;
                    font-size: 16px;
                }
                
                /* Features Grid */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 20px;
                    margin: 20px 0 30px;
                }
                
                .feature-card {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
                }
                
                .feature-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: white;
                    flex-shrink: 0;
                }
                
                .feature-content h4 {
                    margin: 0 0 8px 0;
                    color: #2c3e50;
                    font-size: 18px;
                }
                
                .feature-content p {
                    margin: 0;
                    color: #5d6d7e;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                /* Benefits Section */
                .benefits-section {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                    border-radius: 15px;
                    padding: 25px;
                    margin: 30px 0;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                }
                
                .benefits-section h4 {
                    margin: 0 0 20px 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 20px;
                }
                
                .benefits-section h4 i {
                    color: #667eea;
                }
                
                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }
                
                .benefit-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    background: white;
                    border-radius: 10px;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    transition: all 0.3s ease;
                }
                
                .benefit-item:hover {
                    transform: translateX(5px);
                    background: rgba(255, 255, 255, 0.9);
                }
                
                .benefit-item i {
                    color: #667eea;
                    font-size: 18px;
                    width: 30px;
                }
                
                .benefit-item span {
                    color: #5d6d7e;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                /* Final CTA */
                .final-cta {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 15px;
                    padding: 25px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    color: white;
                    margin-top: 30px;
                }
                
                .cta-icon {
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }
                
                .cta-text h5 {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                }
                
                .cta-text p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 14px;
                }
                
                /* Botón de confirmación personalizado */
                .meseguity-confirm-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 14px 35px !important;
                    font-weight: 600 !important;
                    font-size: 16px !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3) !important;
                    margin-top: 20px !important;
                }
                
                .meseguity-confirm-btn:hover {
                    transform: translateY(-3px) !important;
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
                    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .meseguity-modal {
                        width: 95% !important;
                        margin: 10px !important;
                    }
                    
                    .platform-info {
                        padding: 20px;
                        max-height: 60vh;
                    }
                    
                    .stats-container {
                        grid-template-columns: 1fr;
                    }
                    
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .benefits-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .modal-title-custom {
                        font-size: 20px !important;
                        padding: 20px 0 !important;
                    }
                    
                    .hero-banner {
                        padding: 20px;
                    }
                    
                    .hero-banner h3 {
                        font-size: 22px;
                    }
                    
                    .hero-icon {
                        width: 70px;
                        height: 70px;
                        font-size: 35px;
                    }
                    
                    .final-cta {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .meseguity-confirm-btn {
                        width: 90% !important;
                        padding: 12px 20px !important;
                        font-size: 15px !important;
                    }
                    
                    /* BOTÓN DE CERRAR RESPONSIVE */
                    .modal-close-custom {
                        top: 10px !important;
                        right: 10px !important;
                        width: 50px !important;
                        height: 50px !important;
                        font-size: 35px !important;
                        border-width: 2px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .modal-close-custom {
                        top: 8px !important;
                        right: 8px !important;
                        width: 45px !important;
                        height: 45px !important;
                        font-size: 32px !important;
                    }
                }
                
                /* Animaciones */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .stat-card, .feature-card, .benefit-item {
                    animation: fadeInUp 0.5s ease forwards;
                    opacity: 0;
                }
                
                .stat-card:nth-child(1) { animation-delay: 0.1s; }
                .stat-card:nth-child(2) { animation-delay: 0.2s; }
                .stat-card:nth-child(3) { animation-delay: 0.3s; }
                .feature-card:nth-child(1) { animation-delay: 0.1s; }
                .feature-card:nth-child(2) { animation-delay: 0.2s; }
                .feature-card:nth-child(3) { animation-delay: 0.3s; }
                .feature-card:nth-child(4) { animation-delay: 0.4s; }
                .feature-card:nth-child(5) { animation-delay: 0.5s; }
                .feature-card:nth-child(6) { animation-delay: 0.6s; }
            `;
            document.head.appendChild(style);
            
            // Asegurar que el botón tenga la X correcta
            setTimeout(() => {
                const closeBtn = document.querySelector('.swal2-close');
                if (closeBtn) {
                    closeBtn.innerHTML = '×';
                    closeBtn.style.fontSize = '40px';
                    closeBtn.style.lineHeight = '1';
                }
            }, 50);
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const infoButton = document.getElementById('infoButton');
    if (infoButton) {
        infoButton.addEventListener('click', mostrarInformacionMeseguity);
        console.log('✅ Botón de información configurado');
        
        // Añadir animación suave al botón
        infoButton.style.animation = 'help-pulse 2s infinite';
        
        // Asegurar que el botón tenga la clase correcta
        infoButton.classList.add('floating-help-button');
    }
});

// Hacer función disponible globalmente
window.mostrarInformacionMeseguity = mostrarInformacionMeseguity;