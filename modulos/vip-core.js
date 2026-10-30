// ============================================
// CONFIGURACIÓN Y CONSTANTES GLOBALES
// ============================================

const SUPABASE_URL = 'https://enmiomqkkdlmodrjmfak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubWlvbXFra2RsbW9kcmptZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA0OTEsImV4cCI6MjA4MDk3NjQ5MX0.HeiJGnnkUjutlZkMTopFK7AIRZzRLxBTXvWk96OcAxg';

let supabaseClient = null;

// Datos globales del usuario VIP
window.datosUsuarioVIP = {
    id: null,
    puntos: 0,
    corazones: 0,
    diamantes: 0,
    diamantesCanjeables: 0,
    nivel: 1,
    avatar_url: null,
    streakActual: 0,
    tituloActivo: null,
    estiloMensajeActivo: null
};

const LIMITES = {
    PUNTOS_MAX: 10000,
    CORAZONES_MAX: 100,
    DIAMANTES_MAX: 1000,
    NIVELES: [
        { min: 0, max: 100, nivel: 1, nombre: "Novato" },
        { min: 101, max: 300, nivel: 2, nombre: "Aprendiz" },
        { min: 301, max: 700, nivel: 3, nombre: "Experto" },
        { min: 701, max: 1500, nivel: 4, nombre: "Maestro" },
        { min: 1501, max: 10000, nivel: 5, nombre: "Leyenda VIP" }
    ]
};

// ============================================
// INICIALIZACIÓN SUPABASE
// ============================================

async function inicializarSupabase() {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: true, storage: localStorage }
        });
        console.log('Supabase inicializado correctamente');
        return supabaseClient;
    } catch (error) {
        console.error('Error inicializando Supabase:', error);
        throw error;
    }
}

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

function mostrarSeccionVIP(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.vip-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Desactivar todos los botones de navegación
    document.querySelectorAll('.vip-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const seccionId = `seccion${seccion.charAt(0).toUpperCase() + seccion.slice(1)}`;
    const seccionElement = document.getElementById(seccionId);
    
    if (seccionElement) {
        seccionElement.classList.add('active');
        
        // Activar botón correspondiente
        const btnElement = document.querySelector(`.vip-nav-btn[onclick*="${seccion}"]`);
        if (btnElement) {
            btnElement.classList.add('active');
        }
        
        // Actualizar título principal
        const titles = {
            'inicio': 'Dashboard VIP',
            'puntos': 'Mis Puntos VIP',
            'corazones': 'Mis Corazones',
            'diamantes': 'Mis Diamantes',
            'recompensas': 'Recompensas Disponibles',
            'mensajes': 'Estilos de Mensaje',
            'titulos': 'Títulos VIP',
            'historial': 'Historial VIP',
            'logros': 'Logros VIP',
            'config': 'Configuración VIP'
        };
        
        const titleElement = document.getElementById('vipMainTitle');
        if (titleElement) {
            titleElement.textContent = titles[seccion] || 'Dashboard VIP';
        }
        
        // Cargar contenido específico de la sección
        cargarContenidoSeccion(seccion);
    }
    
    // Cerrar sidebar en móviles
    if (window.innerWidth <= 992) {
        const sidebar = document.getElementById('vipSidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }
}

function cargarContenidoSeccion(seccion) {
    switch(seccion) {
        case 'titulos':
            cargarTitulos();
            break;
        case 'mensajes':
            cargarEstilosMensaje();
            break;
        case 'historial':
            cargarHistorial();
            break;
        case 'logros':
            cargarLogros();
            break;
        default:
            // No requiere carga adicional
            break;
    }
}

// ============================================
// CONFIGURACIÓN DE EVENTOS
// ============================================

function configurarEventos() {
    // Toggle sidebar móvil
    const mobileToggle = document.getElementById('mobileToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('vipSidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }
    
    // Configurar eventos de las tarjetas de estadísticas
    document.addEventListener('click', function(e) {
        if (e.target.closest('.stat-card-compact.puntos')) {
            mostrarPuntosVIP();
        } else if (e.target.closest('.stat-card-compact.corazones')) {
            mostrarCorazonesVIP();
        } else if (e.target.closest('.stat-card-compact.diamantes')) {
            mostrarDiamantesVIP();
        } else if (e.target.closest('.stat-card-compact.nivel')) {
            mostrarNivelVIP();
        }
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function calcularNivel(puntos) {
    for (let nivelInfo of LIMITES.NIVELES) {
        if (puntos >= nivelInfo.min && puntos <= nivelInfo.max) {
            return nivelInfo.nivel;
        }
    }
    return 1;
}

function actualizarEstadisticas() {
    const stats = [
        { 
            tipo: 'puntos', 
            icono: 'fas fa-star', 
            titulo: 'Puntos VIP', 
            valor: window.datosUsuarioVIP.puntos,
            onClick: 'mostrarPuntosVIP'
        },
        { 
            tipo: 'corazones', 
            icono: 'fas fa-heart', 
            titulo: 'Corazones', 
            valor: window.datosUsuarioVIP.corazones,
            onClick: 'mostrarCorazonesVIP'
        },
        { 
            tipo: 'diamantes', 
            icono: 'fas fa-gem', 
            titulo: 'Diamantes', 
            valor: window.datosUsuarioVIP.diamantesCanjeables,
            onClick: 'mostrarDiamantesVIP'
        },
        { 
            tipo: 'nivel', 
            icono: 'fas fa-trophy', 
            titulo: 'Nivel VIP', 
            valor: window.datosUsuarioVIP.nivel,
            onClick: 'mostrarNivelVIP'
        }
    ];
    
    const statsContainer = document.getElementById('vipStatsCompact');
    if (statsContainer) {
        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-card-compact ${stat.tipo}">
                <div class="stat-icon-compact">
                    <i class="${stat.icono}"></i>
                </div>
                <div class="stat-info-compact">
                    <h3>${stat.titulo}</h3>
                    <div class="stat-value-compact">${stat.valor}</div>
                </div>
            </div>
        `).join('');
    }
}

// ============================================
// FUNCIONES DE INFORMACIÓN (SIMPLIFICADAS)
// ============================================

function mostrarPuntosVIP() {
    Swal.fire({
        title: '⭐ Mis Puntos VIP',
        html: `Actualmente tienes <strong>${window.datosUsuarioVIP.puntos} puntos</strong>`,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

function mostrarCorazonesVIP() {
    Swal.fire({
        title: '❤️ Mis Corazones',
        html: `Actualmente tienes <strong>${window.datosUsuarioVIP.corazones} corazones</strong>`,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

function mostrarDiamantesVIP() {
    Swal.fire({
        title: '💎 Mis Diamantes',
        html: `Actualmente tienes <strong>${window.datosUsuarioVIP.diamantesCanjeables} diamantes</strong>`,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

function mostrarNivelVIP() {
    Swal.fire({
        title: '🏆 Mi Nivel VIP',
        html: `Actualmente eres nivel <strong>${window.datosUsuarioVIP.nivel}</strong>`,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

function mostrarInformacionVIP() {
    Swal.fire({
        title: 'ℹ️ Información del Sistema VIP',
        html: `
            <div style="text-align: left; padding: 10px;">
                <p><strong>Sistema de Recompensas Messery VIP</strong></p>
                <p>Acumula puntos, corazones y diamantes para desbloquear recompensas exclusivas.</p>
                <p>• <strong>Puntos:</strong> Para recompensas generales</p>
                <p>• <strong>Corazones:</strong> Por actividad social</p>
                <p>• <strong>Diamantes:</strong> Para compras premium</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

function mostrarSoporte() {
    Swal.fire({
        title: '🛟 Soporte VIP',
        html: `
            <div style="text-align: left; padding: 10px;">
                <p><strong>¿Necesitas ayuda?</strong></p>
                <p>• <strong>Email:</strong> soporte@messery.com</p>
                <p>• <strong>Discord:</strong> discord.gg/messery</p>
                <p>• <strong>Horario:</strong> 9:00 - 18:00 UTC</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}