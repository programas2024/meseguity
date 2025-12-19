// ayulgin.js - Guía interactiva con iconos modernos y efectos especiales

// Iconos premium de Font Awesome 6
const PASOS_AYUDA = [
    {
        titulo: "Tu Correo Electrónico",
        descripcion: "Ingresa el email que usaste al registrarte en Meseguity.",
        icono: "fas fa-envelope-open-text",
        color: "#667eea",
        gradiente: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        emoji: ""
    },
    {
        titulo: "Tu Contraseña Secreta",
        descripcion: "Escribe tu contraseña con cuidado. ¡Es tu llave secreta!",
        icono: "fas fa-lock",
        color: "#00cec9",
        gradiente: "linear-gradient(135deg, #00cec9 0%, #81ecec 100%)",
        emoji: "",
        efectoExtra: true
    },
    {
        titulo: "El Ojito Mágico",
        descripcion: "Toca este icono para ver u ocultar tu contraseña.",
        icono: "fas fa-eye-low-vision",
        color: "#E74C3C",
        gradiente: "linear-gradient(135deg, #E74C3C 0%, #F39C12 100%)",
        emoji: ""
    },
    {
        titulo: "¡Entrar a la Diversión!",
        descripcion: "Presiona aquí para acceder a chats, juegos y amigos.",
        icono: "fas fa-door-open",
        color: "#27AE60",
        gradiente: "linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)",
        emoji: ""
    },
    {
        titulo: "Acceso con GitHub",
        descripcion: "Si tienes GitHub, úsalo para entrar más rápido.",
        icono: "fab fa-github",
        color: "#24292e",
        gradiente: "linear-gradient(135deg, #24292e 0%, #444d56 100%)",
        emoji: ""
    }
];

// Tips con iconos lindos
const TIPS_EXTRA = [
    { icono: "fas fa-user-plus", texto: "¿Nuevo? ¡Regístrate en segundos!", color: "#9b59b6" },
    { icono: "fas fa-question-circle", texto: "¿Problemas? Usa 'Recuperar contraseña'", color: "#3498db" },
    { icono: "fas fa-mobile-alt", texto: "Funciona perfecto en todos tus dispositivos", color: "#1abc9c" },
    { icono: "fas fa-gamepad", texto: "Después de entrar... ¡vienen los juegos!", color: "#e74c3c" },
    { icono: "fas fa-user-friends", texto: "Invita amigos y crea grupos divertidos", color: "#f39c12" },
    { icono: "fas fa-palette", texto: "Personaliza todo a tu estilo", color: "#e84393" }
];

// Iconos decorativos especiales
const ICONOS_DECORATIVOS = {
    inicio: "fas fa-sparkles",
    seguridad: "fas fa-shield-heart",
    ayuda: "fas fa-hands-helping",
    comunidad: "fas fa-users-between-lines"
};

// Función para crear icono con efecto 3D
function crearIcono3D(icono, color, tamaño = "50px", efecto = true, pasoEspecial = false) {
    const gradiente = color === "#24292e" 
        ? "linear-gradient(135deg, #24292e 0%, #444d56 100%)"
        : `linear-gradient(135deg, ${color} 0%, ${ajustarBrillo(color, -20)} 100%)`;
    
    let efectoExtra = '';
    
    // Efecto especial para el candado (segundo paso)
    if (pasoEspecial && icono.includes('lock')) {
        efectoExtra = `
            <div class="efecto-candado" style="
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                background: #FFD700;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #2C3E50;
                box-shadow: 0 3px 8px rgba(255, 215, 0, 0.4);
                animation: brillo-candado 2s infinite;
            ">
                <i class="fas fa-star"></i>
            </div>
            
            <div class="llave-candado" style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 14px;
                color: #FFD700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                animation: flotar-llave 3s infinite;
            ">
                <i class="fas fa-key"></i>
            </div>
        `;
    }
    
    return `
        <div class="icono-3d ${pasoEspecial ? 'candado-especial' : ''}" style="
            width: ${tamaño};
            height: ${tamaño};
            background: ${gradiente};
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: calc(${tamaño} * 0.5);
            color: white;
            margin: 0 auto 15px;
            ${efecto ? `
                box-shadow: 
                    0 8px 20px ${color}40,
                    0 0 0 2px ${color}20,
                    inset 0 2px 0 rgba(255,255,255,0.3);
                transform: perspective(500px) rotateX(5deg);
                transition: all 0.3s ease;
            ` : ''}
            position: relative;
            overflow: visible;
        ">
            <i class="${icono}"></i>
            
            ${efecto ? `
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 30%;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
                    border-radius: 15px 15px 0 0;
                "></div>
            ` : ''}
            
            ${efectoExtra}
        </div>
    `;
}

// Función para ajustar brillo de color
function ajustarBrillo(color, porcentaje) {
    let hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.max(0, Math.min(255, r + porcentaje));
    g = Math.max(0, Math.min(255, g + porcentaje));
    b = Math.max(0, Math.min(255, b + porcentaje));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Función para crear card con efecto neumórfico
function crearCardNeumorfismo(contenido, color, destacado = false) {
    return `
        <div class="card-neumorfico" style="
            background: ${destacado ? '#ffffff' : '#f8f9fa'};
            border-radius: 20px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 
                ${destacado ? 
                    `20px 20px 40px ${color}20, 
                    -20px -20px 40px rgba(255,255,255,0.8)` 
                    : 
                    `8px 8px 16px ${color}15, 
                    -8px -8px 16px rgba(255,255,255,0.7)`
                };
            border: 1px solid ${color}10;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        ">
            ${destacado ? `
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: ${color};
                    background-size: 200% 100%;
                    animation: gradient-flow 2s ease infinite;
                "></div>
            ` : ''}
            ${contenido}
        </div>
    `;
}

// Función principal con diseño HERMOSO
function mostrarAyudaLogin() {
    const estiloPersonalizado = `
        <style>
            .ayuda-lindo {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .titulo-principal {
                font-size: 28px;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .icono-titulo {
                font-size: 40px;
                animation: float 3s ease-in-out infinite;
            }
            
            .subtitulo {
                text-align: center;
                color: #666;
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.5;
            }
            
            .grid-iconos {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin: 25px 0;
            }
            
            .card-icono {
                background: white;
                border-radius: 20px;
                padding: 25px;
                text-align: center;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                position: relative;
                overflow: hidden;
            }
            
            .card-candado {
                background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%) !important;
                border: 2px solid #00cec930 !important;
                position: relative;
                overflow: visible;
            }
            
            .card-icono:hover {
                transform: translateY(-5px);
                border-color: #667eea20;
                box-shadow: 0 15px 30px rgba(102, 126, 234, 0.15);
            }
            
            .card-candado:hover {
                transform: translateY(-8px) !important;
                box-shadow: 
                    0 20px 40px rgba(0, 206, 201, 0.2),
                    0 0 0 2px rgba(0, 206, 201, 0.1) !important;
            }
            
            .numero-paso {
                position: absolute;
                top: 10px;
                left: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
            }
            
            .emoji-decoracion {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 20px;
                opacity: 0.7;
            }
            
            .texto-paso {
                margin-top: 15px;
            }
            
            .texto-paso h4 {
                color: #2C3E50;
                margin-bottom: 8px;
                font-size: 18px;
                font-weight: 600;
            }
            
            .texto-paso p {
                color: #666;
                font-size: 14px;
                line-height: 1.5;
                margin: 0;
            }
            
            .seccion-tips {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 20px;
                padding: 25px;
                margin-top: 30px;
            }
            
            .titulo-tips {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #2C3E50;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
            }
            
            .grid-tips {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .tip-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 15px;
                background: white;
                border-radius: 12px;
                transition: all 0.3s ease;
            }
            
            .tip-item:hover {
                transform: translateX(5px);
                background: #f0f4ff;
            }
            
            .icono-tip {
                width: 35px;
                height: 35px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: white;
                flex-shrink: 0;
            }
            
            .boton-ayuda {
                width: 100%;
                padding: 15px;
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: 600;
                border-radius: 15px;
                cursor: pointer;
                margin-top: 20px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 16px;
            }
            
            .boton-ayuda:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            
            /* Animaciones especiales para el candado */
            .icono-3d.candado-especial {
                animation: latido-candado 2s infinite;
            }
            
            .card-candado::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                background: linear-gradient(45deg, 
                    transparent 0%, 
                    rgba(0, 206, 201, 0.05) 50%, 
                    transparent 100%);
                border-radius: 25px;
                z-index: -1;
                animation: brillo-fondo 4s infinite;
            }
            
            .card-candado::after {
                content: '¡Tu llave secreta!';
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: #2C3E50;
                color: white;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                opacity: 0;
                transition: opacity 0.3s ease;
                white-space: nowrap;
                pointer-events: none;
            }
            
            .card-candado:hover::after {
                opacity: 1;
            }
            
            .card-candado:hover .icono-3d.candado-especial {
                animation: latido-candado-rapido 1s infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes gradient-flow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes brillo-candado {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 3px 8px rgba(255, 215, 0, 0.4);
                }
                50% { 
                    transform: scale(1.1);
                    box-shadow: 0 5px 12px rgba(255, 215, 0, 0.6);
                }
            }
            
            @keyframes flotar-llave {
                0%, 100% { 
                    transform: translateX(-50%) translateY(0);
                }
                50% { 
                    transform: translateX(-50%) translateY(-5px);
                }
            }
            
            @keyframes latido-candado {
                0%, 100% { 
                    transform: perspective(500px) rotateX(5deg) scale(1); 
                    box-shadow: 0 8px 20px rgba(0, 206, 201, 0.4);
                }
                50% { 
                    transform: perspective(500px) rotateX(5deg) scale(1.05); 
                    box-shadow: 0 12px 25px rgba(0, 206, 201, 0.6);
                }
            }
            
            @keyframes latido-candado-rapido {
                0%, 100% { transform: perspective(500px) rotateX(5deg) scale(1.05); }
                50% { transform: perspective(500px) rotateX(5deg) scale(1.1); }
            }
            
            @keyframes brillo-fondo {
                0%, 100% { 
                    opacity: 0;
                }
                50% { 
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .grid-iconos {
                    grid-template-columns: 1fr;
                }
                
                .grid-tips {
                    grid-template-columns: 1fr;
                }
                
                .titulo-principal {
                    font-size: 24px;
                }
                
                .card-candado::after {
                    font-size: 10px;
                    top: -25px;
                    padding: 4px 8px;
                }
            }
        </style>
    `;

    const contenidoHTML = `
        ${estiloPersonalizado}
        
        <div class="ayuda-lindo">
            <div class="titulo-principal">
                <span class="icono-titulo">💫</span>
                Guía para Iniciar Sesión
                <span class="icono-titulo">✨</span>
            </div>
            
            <p class="subtitulo">
                Sigue estos pasos simples para entrar a tu mundo de diversión y amigos
            </p>
            
            <div class="grid-iconos">
                ${PASOS_AYUDA.map((paso, index) => `
                    <div class="card-icono ${index === 1 ? 'card-candado' : ''}">
                        <span class="numero-paso">${index + 1}</span>
                        <span class="emoji-decoracion">${paso.emoji}</span>
                        
                        ${crearIcono3D(paso.icono, paso.color, '60px', true, index === 1)}
                        
                        <div class="texto-paso">
                            <h4>${paso.titulo}</h4>
                            <p>${paso.descripcion}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="seccion-tips">
                <div class="titulo-tips">
                    <i class="fas fa-lightbulb" style="color: #f39c12;"></i>
                    Consejos Útiles
                </div>
                
                <div class="grid-tips">
                    ${TIPS_EXTRA.map(tip => `
                        <div class="tip-item">
                            <div class="icono-tip" style="background: ${tip.color};">
                                <i class="${tip.icono}"></i>
                            </div>
                            <span>${tip.texto}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="seccion-problemas">
                ${crearCardNeumorfismo(`
                    <div style="text-align: center; padding: 20px;">
                        ${crearIcono3D(ICONOS_DECORATIVOS.ayuda, '#3498db', '50px', false)}
                        <h4 style="color: #2C3E50; margin: 15px 0 10px;">¿Necesitas más ayuda?</h4>
                        <p style="color: #666; margin-bottom: 15px;">
                            Escribe a <strong>ayuda@meseguity.com</strong> o visita nuestro centro de ayuda
                        </p>
                        <button class="boton-ayuda" onclick="window.open('#', '_blank')">
                            <i class="fas fa-external-link-alt"></i>
                            Centro de Ayuda
                        </button>
                    </div>
                `, '#3498db', true)}
            </div>
        </div>
    `;

    Swal.fire({
        title: '',
        html: contenidoHTML,
        width: '850px',
        padding: '30px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '¡Entendido, voy a intentar!',
        confirmButtonColor: '#667eea',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        customClass: {
            popup: 'sweet-popup-ayuda',
            confirmButton: 'sweet-confirm-ayuda'
        },
        didOpen: () => {
            // Añadir efecto hover a las cards
            const cards = document.querySelectorAll('.card-icono');
            cards.forEach(card => {
                const icono3d = card.querySelector('.icono-3d');
                card.addEventListener('mouseenter', () => {
                    if (icono3d) {
                        icono3d.style.transform = 'perspective(500px) rotateX(5deg) scale(1.1)';
                        icono3d.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
                    }
                });
                card.addEventListener('mouseleave', () => {
                    if (icono3d) {
                        icono3d.style.transform = 'perspective(500px) rotateX(5deg)';
                        icono3d.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }
                });
            });
            
            // Añadir animación a los iconos del título
            const iconosTitulo = document.querySelectorAll('.icono-titulo');
            iconosTitulo.forEach((icono, index) => {
                icono.style.animationDelay = `${index * 0.5}s`;
            });
        }
    });
}

// Función para crear botón de ayuda en la página
function crearBotonAyuda() {
    // Crear botón flotante
    const botonAyuda = document.createElement('button');
    botonAyuda.id = 'floatingHelpBtn';
    botonAyuda.innerHTML = `
        <i class="fas fa-question-circle"></i>
        <span>¿Cómo entro?</span>
    `;
    botonAyuda.title = 'Ayuda para iniciar sesión';
    
    // Estilos del botón
    botonAyuda.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 15px 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
    `;
    
    // Estilos para el hover
    const estiloHover = `
        #floatingHelpBtn:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @media (max-width: 768px) {
            #floatingHelpBtn {
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                font-size: 14px;
            }
            
            #floatingHelpBtn span {
                display: none;
            }
            
            #floatingHelpBtn i {
                font-size: 20px;
            }
        }
    `;
    
    // Añadir estilos
    const styleSheet = document.createElement('style');
    styleSheet.textContent = estiloHover;
    document.head.appendChild(styleSheet);
    
    // Añadir evento
    botonAyuda.addEventListener('click', mostrarAyudaLogin);
    
    // Insertar en el documento
    document.body.appendChild(botonAyuda);
    
    console.log('✅ Botón de ayuda flotante creado');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        crearBotonAyuda();
    });
} else {
    crearBotonAyuda();
}

// Hacer funciones disponibles globalmente
window.mostrarAyudaLogin = mostrarAyudaLogin;
window.crearBotonAyuda = crearBotonAyuda;