// configuracion.js
// Archivo principal de configuración

// Variables globales
let usuarioActual = null;
let seccionActual = 'perfil';
let redesSociales = {
    facebook: { activa: false, url: '' },
    instagram: { activa: false, url: '' },
    twitter: { activa: false, url: '' },
    tiktok: { activa: false, url: '' },
    youtube: { activa: false, url: '' },
    linkedin: { activa: false, url: '' },
    github: { activa: false, url: '' }
};

// Función para mostrar alertas
function mostrarAlerta(tipo, mensaje, tiempo = 3000) {
    Swal.fire({
        icon: tipo,
        title: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: tiempo,
        timerProgressBar: true,
        background: '#f8fafd',
        color: '#333'
    });
}

// Función para cambiar entre secciones
function mostrarSeccion(seccion) {
    seccionActual = seccion;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.config-content').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const seccionId = 'seccion' + seccion.charAt(0).toUpperCase() + seccion.slice(1);
    const seccionElemento = document.getElementById(seccionId);
    if (seccionElemento) {
        seccionElemento.classList.add('active');
    }
    
    // Activar el botón correspondiente
    const botonId = 'btn' + seccion.charAt(0).toUpperCase() + seccion.slice(1);
    const botonElemento = document.getElementById(botonId);
    if (botonElemento) {
        botonElemento.classList.add('active');
    }
    
    // Actualizar título de la página
    const titulos = {
        'perfil': 'Configuración de Perfil',
        'redes': 'Redes Sociales',
        'seguridad': 'Seguridad de la Cuenta'
    };
    
    const tituloPagina = document.getElementById('tituloPagina');
    if (tituloPagina && titulos[seccion]) {
        tituloPagina.textContent = titulos[seccion];
    }
    
    // Cargar datos específicos de la sección
    if (seccion === 'redes') {
        cargarRedesSociales();
    }
}

// Configurar funciones básicas de la página
function configurarEventosBasicos() {
    console.log("⚙️ Configurando eventos básicos...");
    
    // Botón de ayuda (contextual según sección)
    const btnAyuda = document.getElementById('btnAyuda');
    if (btnAyuda) {
        btnAyuda.addEventListener('click', mostrarAyuda);
    }

    // Botón de soporte (contacto)
    const btnSoporte = document.getElementById('btnSoporte');
    if (btnSoporte) {
        btnSoporte.addEventListener('click', mostrarSoporte);
    }

    // Configurar logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            const confirmacion = await Swal.fire({
                title: '🚪 Cerrar Sesión',
                text: '¿Estás seguro de que quieres cerrar sesión?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            });
            
            if (confirmacion.isConfirmed) {
                try {
                    await cerrarSesion();
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                }
            }
        });
    }

    // Cambiar avatar
    const btnChangeAvatar = document.getElementById('btnChangeAvatar');
    if (btnChangeAvatar) {
        btnChangeAvatar.addEventListener('click', mostrarModalCambiarAvatar);
    }

    console.log("✅ Eventos básicos configurados");
}

// Función para cerrar sesión
async function cerrarSesion() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Redirigir a login
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mostrarAlerta('error', 'Error al cerrar sesión: ' + error.message);
    }
}

// Función para mostrar modal de cambiar avatar con más opciones y diseño
function mostrarModalCambiarAvatar() {
    // Configurar avatares predefinidos con diferentes estilos
    const avatarPredefinidos = [
        // Letras con diferentes colores
        { id: 'A', color: '#3B82F6', texto: 'A', tipo: 'letra', estilo: 'simple' },
        { id: 'B', color: '#10B981', texto: 'B', tipo: 'letra', estilo: 'simple' },
        { id: 'C', color: '#F59E0B', texto: 'C', tipo: 'letra', estilo: 'simple' },
        { id: 'D', color: '#EF4444', texto: 'D', tipo: 'letra', estilo: 'simple' },
        { id: 'E', color: '#8B5CF6', texto: 'E', tipo: 'letra', estilo: 'simple' },
        { id: 'F', color: '#EC4899', texto: 'F', tipo: 'letra', estilo: 'simple' },
        { id: 'G', color: '#06B6D4', texto: 'G', tipo: 'letra', estilo: 'simple' },
        { id: 'H', color: '#84CC16', texto: 'H', tipo: 'letra', estilo: 'simple' },
        { id: 'I', color: '#F97316', texto: 'I', tipo: 'letra', estilo: 'simple' },
        { id: 'J', color: '#6366F1', texto: 'J', tipo: 'letra', estilo: 'simple' },
        { id: 'K', color: '#14B8A6', texto: 'K', tipo: 'letra', estilo: 'simple' },
        { id: 'L', color: '#F43F5E', texto: 'L', tipo: 'letra', estilo: 'simple' },
        { id: 'M', color: '#8B5CF6', texto: 'M', tipo: 'letra', estilo: 'simple' },
        { id: 'N', color: '#3B82F6', texto: 'N', tipo: 'letra', estilo: 'simple' },
        { id: 'O', color: '#10B981', texto: 'O', tipo: 'letra', estilo: 'simple' },
        { id: 'P', color: '#F59E0B', texto: 'P', tipo: 'letra', estilo: 'simple' },
        { id: 'Q', color: '#EF4444', texto: 'Q', tipo: 'letra', estilo: 'simple' },
        { id: 'R', color: '#8B5CF6', texto: 'R', tipo: 'letra', estilo: 'simple' },
        { id: 'S', color: '#10B981', texto: 'S', tipo: 'letra', estilo: 'simple' },
        { id: 'T', color: '#3B82F6', texto: 'T', tipo: 'letra', estilo: 'simple' },
        { id: 'U', color: '#F97316', texto: 'U', tipo: 'letra', estilo: 'simple' },
        { id: 'V', color: '#EC4899', texto: 'V', tipo: 'letra', estilo: 'simple' },
        { id: 'W', color: '#06B6D4', texto: 'W', tipo: 'letra', estilo: 'simple' },
        { id: 'X', color: '#8B5CF6', texto: 'X', tipo: 'letra', estilo: 'simple' },
        { id: 'Y', color: '#10B981', texto: 'Y', tipo: 'letra', estilo: 'simple' },
        { id: 'Z', color: '#F59E0B', texto: 'Z', tipo: 'letra', estilo: 'simple' },
        
        // Letras en negrita
        { id: 'A-bold', color: '#1D4ED8', texto: '𝐀', tipo: 'letra', estilo: 'bold' },
        { id: 'B-bold', color: '#047857', texto: '𝐁', tipo: 'letra', estilo: 'bold' },
        { id: 'C-bold', color: '#D97706', texto: '𝐂', tipo: 'letra', estilo: 'bold' },
        { id: 'D-bold', color: '#DC2626', texto: '𝐃', tipo: 'letra', estilo: 'bold' },
        { id: 'E-bold', color: '#7C3AED', texto: '𝐄', tipo: 'letra', estilo: 'bold' },
        { id: 'F-bold', color: '#DB2777', texto: '𝐅', tipo: 'letra', estilo: 'bold' },
        
        // Números
        { id: '1', color: '#3B82F6', texto: '1', tipo: 'numero', estilo: 'simple' },
        { id: '2', color: '#10B981', texto: '2', tipo: 'numero', estilo: 'simple' },
        { id: '3', color: '#F59E0B', texto: '3', tipo: 'numero', estilo: 'simple' },
        { id: '4', color: '#EF4444', texto: '4', tipo: 'numero', estilo: 'simple' },
        { id: '5', color: '#8B5CF6', texto: '5', tipo: 'numero', estilo: 'simple' },
        { id: '6', color: '#EC4899', texto: '6', tipo: 'numero', estilo: 'simple' },
        { id: '7', color: '#06B6D4', texto: '7', tipo: 'numero', estilo: 'simple' },
        { id: '8', color: '#84CC16', texto: '8', tipo: 'numero', estilo: 'simple' },
        { id: '9', color: '#F97316', texto: '9', tipo: 'numero', estilo: 'simple' },
        { id: '0', color: '#6366F1', texto: '0', tipo: 'numero', estilo: 'simple' },
        
        // Números en negrita
        { id: '1-bold', color: '#1E40AF', texto: '𝟏', tipo: 'numero', estilo: 'bold' },
        { id: '2-bold', color: '#065F46', texto: '𝟐', tipo: 'numero', estilo: 'bold' },
        { id: '3-bold', color: '#92400E', texto: '𝟑', tipo: 'numero', estilo: 'bold' },
        
        // Emojis de caras y expresiones
        { id: 'smile', color: '#FBBF24', texto: '🙂', tipo: 'emoji', estilo: 'simple' },
        { id: 'laugh', color: '#F59E0B', texto: '😄', tipo: 'emoji', estilo: 'simple' },
        { id: 'wink', color: '#FCD34D', texto: '😉', tipo: 'emoji', estilo: 'simple' },
        { id: 'cool', color: '#3B82F6', texto: '😎', tipo: 'emoji', estilo: 'simple' },
        { id: 'love', color: '#EC4899', texto: '😍', tipo: 'emoji', estilo: 'simple' },
        { id: 'kiss', color: '#F472B6', texto: '😘', tipo: 'emoji', estilo: 'simple' },
        { id: 'tongue', color: '#10B981', texto: '😛', tipo: 'emoji', estilo: 'simple' },
        { id: 'surprise', color: '#06B6D4', texto: '😲', tipo: 'emoji', estilo: 'simple' },
        { id: 'thinking', color: '#6B7280', texto: '🤔', tipo: 'emoji', estilo: 'simple' },
        { id: 'sleep', color: '#8B5CF6', texto: '😴', tipo: 'emoji', estilo: 'simple' },
        { id: 'sick', color: '#84CC16', texto: '🤒', tipo: 'emoji', estilo: 'simple' },
        { id: 'nerd', color: '#8B5CF6', texto: '🤓', tipo: 'emoji', estilo: 'simple' },
        { id: 'clown', color: '#EF4444', texto: '🤡', tipo: 'emoji', estilo: 'simple' },
        { id: 'robot', color: '#6B7280', texto: '🤖', tipo: 'emoji', estilo: 'simple' },
        { id: 'alien', color: '#10B981', texto: '👽', tipo: 'emoji', estilo: 'simple' },
        { id: 'ghost', color: '#C7D2FE', texto: '👻', tipo: 'emoji', estilo: 'simple' },
        { id: 'poo', color: '#92400E', texto: '💩', tipo: 'emoji', estilo: 'simple' },
        
        // Emojis de manos y gestos
        { id: 'thumbs-up', color: '#10B981', texto: '👍', tipo: 'emoji', estilo: 'simple' },
        { id: 'thumbs-down', color: '#EF4444', texto: '👎', tipo: 'emoji', estilo: 'simple' },
        { id: 'victory', color: '#3B82F6', texto: '✌️', tipo: 'emoji', estilo: 'simple' },
        { id: 'ok', color: '#84CC16', texto: '👌', tipo: 'emoji', estilo: 'simple' },
        { id: 'peace', color: '#8B5CF6', texto: '✌', tipo: 'emoji', estilo: 'simple' },
        { id: 'clap', color: '#F59E0B', texto: '👏', tipo: 'emoji', estilo: 'simple' },
        { id: 'wave', color: '#06B6D4', texto: '👋', tipo: 'emoji', estilo: 'simple' },
        { id: 'pray', color: '#EC4899', texto: '🙏', tipo: 'emoji', estilo: 'simple' },
        { id: 'muscle', color: '#F97316', texto: '💪', tipo: 'emoji', estilo: 'simple' },
        { id: 'heart-hands', color: '#F472B6', texto: '🫶', tipo: 'emoji', estilo: 'simple' },
        
        // Emojis de objetos y símbolos
        { id: 'star', color: '#F59E0B', texto: '⭐', tipo: 'emoji', estilo: 'simple' },
        { id: 'heart', color: '#EF4444', texto: '❤️', tipo: 'emoji', estilo: 'simple' },
        { id: 'fire', color: '#F97316', texto: '🔥', tipo: 'emoji', estilo: 'simple' },
        { id: 'sun', color: '#F59E0B', texto: '☀️', tipo: 'emoji', estilo: 'simple' },
        { id: 'moon', color: '#6366F1', texto: '🌙', tipo: 'emoji', estilo: 'simple' },
        { id: 'cloud', color: '#C7D2FE', texto: '☁️', tipo: 'emoji', estilo: 'simple' },
        { id: 'rainbow', color: '#8B5CF6', texto: '🌈', tipo: 'emoji', estilo: 'simple' },
        { id: 'coffee', color: '#92400E', texto: '☕', tipo: 'emoji', estilo: 'simple' },
        { id: 'music', color: '#EC4899', texto: '🎵', tipo: 'emoji', estilo: 'simple' },
        { id: 'book', color: '#3B82F6', texto: '📚', tipo: 'emoji', estilo: 'simple' },
        { id: 'computer', color: '#6B7280', texto: '💻', tipo: 'emoji', estilo: 'simple' },
        { id: 'phone', color: '#10B981', texto: '📱', tipo: 'emoji', estilo: 'simple' },
        { id: 'camera', color: '#3B82F6', texto: '📷', tipo: 'emoji', estilo: 'simple' },
        { id: 'key', color: '#F59E0B', texto: '🔑', tipo: 'emoji', estilo: 'simple' },
        { id: 'lock', color: '#6B7280', texto: '🔒', tipo: 'emoji', estilo: 'simple' },
        { id: 'light-bulb', color: '#FBBF24', texto: '💡', tipo: 'emoji', estilo: 'simple' },
        { id: 'money', color: '#84CC16', texto: '💰', tipo: 'emoji', estilo: 'simple' },
        { id: 'gift', color: '#EC4899', texto: '🎁', tipo: 'emoji', estilo: 'simple' },
        { id: 'ball', color: '#EF4444', texto: '⚽', tipo: 'emoji', estilo: 'simple' },
        { id: 'car', color: '#3B82F6', texto: '🚗', tipo: 'emoji', estilo: 'simple' },
        { id: 'plane', color: '#06B6D4', texto: '✈️', tipo: 'emoji', estilo: 'simple' },
        { id: 'rocket', color: '#8B5CF6', texto: '🚀', tipo: 'emoji', estilo: 'simple' },
        
        // Emojis de animales
        { id: 'cat', color: '#F97316', texto: '🐱', tipo: 'emoji', estilo: 'simple' },
        { id: 'dog', color: '#92400E', texto: '🐶', tipo: 'emoji', estilo: 'simple' },
        { id: 'panda', color: '#000000', texto: '🐼', tipo: 'emoji', estilo: 'simple' },
        { id: 'fox', color: '#F97316', texto: '🦊', tipo: 'emoji', estilo: 'simple' },
        { id: 'lion', color: '#F59E0B', texto: '🦁', tipo: 'emoji', estilo: 'simple' },
        { id: 'tiger', color: '#F97316', texto: '🐯', tipo: 'emoji', estilo: 'simple' },
        { id: 'bear', color: '#92400E', texto: '🐻', tipo: 'emoji', estilo: 'simple' },
        { id: 'rabbit', color: '#C7D2FE', texto: '🐰', tipo: 'emoji', estilo: 'simple' },
        { id: 'owl', color: '#92400E', texto: '🦉', tipo: 'emoji', estilo: 'simple' },
        { id: 'bird', color: '#3B82F6', texto: '🐦', tipo: 'emoji', estilo: 'simple' },
        { id: 'fish', color: '#06B6D4', texto: '🐠', tipo: 'emoji', estilo: 'simple' },
        { id: 'whale', color: '#3B82F6', texto: '🐋', tipo: 'emoji', estilo: 'simple' },
        { id: 'dolphin', color: '#06B6D4', texto: '🐬', tipo: 'emoji', estilo: 'simple' },
        { id: 'turtle', color: '#10B981', texto: '🐢', tipo: 'emoji', estilo: 'simple' },
        { id: 'snake', color: '#84CC16', texto: '🐍', tipo: 'emoji', estilo: 'simple' },
        { id: 'bug', color: '#10B981', texto: '🐛', tipo: 'emoji', estilo: 'simple' },
        { id: 'butterfly', color: '#8B5CF6', texto: '🦋', tipo: 'emoji', estilo: 'simple' },
        
        // Formas geométricas
        { id: 'circle', color: '#3B82F6', texto: '●', tipo: 'forma', estilo: 'simple' },
        { id: 'square', color: '#10B981', texto: '■', tipo: 'forma', estilo: 'simple' },
        { id: 'triangle', color: '#F59E0B', texto: '▲', tipo: 'forma', estilo: 'simple' },
        { id: 'diamond', color: '#8B5CF6', texto: '◆', tipo: 'forma', estilo: 'simple' },
        { id: 'star-shape', color: '#F59E0B', texto: '★', tipo: 'forma', estilo: 'simple' },
        { id: 'heart-shape', color: '#EF4444', texto: '♥', tipo: 'forma', estilo: 'simple' },
        { id: 'spade', color: '#000000', texto: '♠', tipo: 'forma', estilo: 'simple' },
        { id: 'club', color: '#000000', texto: '♣', tipo: 'forma', estilo: 'simple' },
        { id: 'plus', color: '#10B981', texto: '➕', tipo: 'forma', estilo: 'simple' },
        { id: 'minus', color: '#EF4444', texto: '➖', tipo: 'forma', estilo: 'simple' },
        { id: 'multiply', color: '#F59E0B', texto: '✖️', tipo: 'forma', estilo: 'simple' },
        { id: 'divide', color: '#3B82F6', texto: '➗', tipo: 'forma', estilo: 'simple' },
        
        // Símbolos especiales
        { id: 'yin-yang', color: '#000000', texto: '☯', tipo: 'símbolo', estilo: 'simple' },
        { id: 'peace-symbol', color: '#3B82F6', texto: '☮', tipo: 'símbolo', estilo: 'simple' },
        { id: 'infinity', color: '#8B5CF6', texto: '∞', tipo: 'símbolo', estilo: 'simple' },
        { id: 'check', color: '#10B981', texto: '✓', tipo: 'símbolo', estilo: 'simple' },
        { id: 'cross', color: '#EF4444', texto: '✗', tipo: 'símbolo', estilo: 'simple' },
        { id: 'question', color: '#F59E0B', texto: '?', tipo: 'símbolo', estilo: 'simple' },
        { id: 'exclamation', color: '#EF4444', texto: '!', tipo: 'símbolo', estilo: 'simple' },
        { id: 'at', color: '#EC4899', texto: '@', tipo: 'símbolo', estilo: 'simple' },
        { id: 'hashtag', color: '#3B82F6', texto: '#', tipo: 'símbolo', estilo: 'simple' },
        { id: 'ampersand', color: '#F97316', texto: '&', tipo: 'símbolo', estilo: 'simple' }
    ];

    // Marcos disponibles
    const marcos = [
        { id: 'ninguno', nombre: 'Sin marco', estilo: 'none', color: 'transparent' },
        { id: 'simple', nombre: 'Marco simple', estilo: 'solid', color: '#E5E7EB' },
        { id: 'colorido', nombre: 'Marco colorido', estilo: 'gradient', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'dorado', nombre: 'Marco dorado', estilo: 'gold', color: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)' },
        { id: 'punteado', nombre: 'Marco punteado', estilo: 'dotted', color: '#3B82F6' },
        { id: 'rayado', nombre: 'Marco rayado', estilo: 'dashed', color: '#10B981' },
        { id: 'doble', nombre: 'Marco doble', estilo: 'double', color: '#EF4444' },
        { id: 'neon', nombre: 'Marco neón', estilo: 'neon', color: '#06B6D4' },
        { id: 'brillante', nombre: 'Marco brillante', estilo: 'glow', color: '#EC4899' }
    ];

    // Efectos disponibles
    const efectos = [
        { id: 'ninguno', nombre: 'Sin efecto', estilo: 'none' },
        { id: 'sombra', nombre: 'Sombra suave', estilo: 'shadow' },
        { id: 'brillo', nombre: 'Brillo interno', estilo: 'glow' },
        { id: 'gradiente', nombre: 'Gradiente', estilo: 'gradient' },
        { id: 'textura', nombre: 'Textura', estilo: 'texture' },
        { id: 'borde-circular', nombre: 'Borde circular', estilo: 'circular' },
        { id: 'borde-redondeado', nombre: 'Borde redondeado', estilo: 'rounded' },
        { id: 'reflejo', nombre: 'Reflejo', estilo: 'reflection' },
        { id: 'profundidad', nombre: 'Profundidad 3D', estilo: '3d' }
    ];

    // Combinaciones predefinidas
    const combinaciones = [
        { id: 'combo1', nombre: 'Clásico', avatarId: 'A', marcoId: 'simple', efectoId: 'sombra' },
        { id: 'combo2', nombre: 'Moderno', avatarId: '😎', marcoId: 'colorido', efectoId: 'gradiente' },
        { id: 'combo3', nombre: 'Elegante', avatarId: '◆', marcoId: 'dorado', efectoId: 'brillo' },
        { id: 'combo4', nombre: 'Divertido', avatarId: '🤖', marcoId: 'neon', efectoId: 'brillo' },
        { id: 'combo5', nombre: 'Minimalista', avatarId: '●', marcoId: 'ninguno', efectoId: 'ninguno' },
        { id: 'combo6', nombre: 'Creativo', avatarId: '🎨', marcoId: 'punteado', efectoId: 'textura' },
        { id: 'combo7', nombre: 'Futurista', avatarId: '🚀', marcoId: 'brillante', efectoId: 'neon' },
        { id: 'combo8', nombre: 'Natural', avatarId: '🌿', marcoId: 'simple', efectoId: 'borde-redondeado' }
    ];

    // Función para codificar texto a base64 de manera segura
    function safeBtoa(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    // Función para codificar HTML (definirla antes de usarla)
    function encodeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Función para decodificar HTML
    function decodeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    }

    // Variables globales para el estado
    let avatarSeleccionado = null;
    let marcoSeleccionado = marcos[0];
    let efectoSeleccionado = efectos[0];
    let combinacionSeleccionada = null;

    // Generar HTML para los avatares usando encodeHtml
    const avatarOptionsHTML = avatarPredefinidos.map(avatar => {
        const encodedText = encodeHtml(avatar.texto);
        return `
        <div class="avatar-item" data-avatar-id="${avatar.id}" 
             data-avatar-type="${avatar.tipo}" 
             data-avatar-text="${encodedText}"
             data-avatar-color="${avatar.color}"
             data-avatar-estilo="${avatar.estilo}"
             style="width: 45px; height: 45px; background: ${avatar.color}; 
                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                    color: white; font-size: ${avatar.tipo === 'emoji' || avatar.tipo === 'forma' ? '18px' : '16px'}; 
                    cursor: pointer; transition: all 0.3s; margin: 3px; border: 2px solid transparent;"
             title="${avatar.texto} (${avatar.tipo})">
            ${avatar.texto}
        </div>
        `;
    }).join('');

    // Generar HTML para los marcos
    const marcosHTML = marcos.map(marco => `
        <div class="marco-item" data-marco-id="${marco.id}" 
             style="padding: 10px; border-radius: 8px; cursor: pointer; 
                    border: 2px solid ${marco.id === 'ninguno' ? '#E5E7EB' : 'transparent'};
                    background: ${marco.id === 'ninguno' ? '#F9FAFB' : 'white'};
                    transition: all 0.3s; margin: 5px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; 
                        border: ${marco.estilo === 'solid' ? '3px solid ' + marco.color : 
                                 marco.estilo === 'gradient' ? '3px solid ' + marco.color :
                                 marco.estilo === 'dotted' ? '3px dotted ' + marco.color :
                                 marco.estilo === 'dashed' ? '3px dashed ' + marco.color :
                                 marco.estilo === 'double' ? '6px double ' + marco.color :
                                 'none'};
                        ${marco.estilo === 'neon' ? `box-shadow: 0 0 10px ${marco.color}, 0 0 20px ${marco.color}80; border: 3px solid ${marco.color};` : ''}
                        ${marco.estilo === 'glow' ? `box-shadow: 0 0 15px ${marco.color}80; border: 3px solid ${marco.color};` : ''}
                        margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <div style="width: 25px; height: 25px; background: #3B82F6; border-radius: 50%;"></div>
            </div>
            <p style="text-align: center; margin: 5px 0 0 0; font-size: 11px; color: #4B5563;">
                ${marco.nombre}
            </p>
        </div>
    `).join('');

    // Generar HTML para los efectos
    const efectosHTML = efectos.map(efecto => `
        <div class="efecto-item" data-efecto-id="${efecto.id}" 
             style="padding: 10px; border-radius: 8px; cursor: pointer; 
                    border: 2px solid #E5E7EB; background: white;
                    transition: all 0.3s; margin: 5px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; 
                        background: #3B82F6; margin: 0 auto; display: flex; 
                        align-items: center; justify-content: center;
                        ${efecto.estilo === 'shadow' ? 'box-shadow: 0 4px 15px rgba(0,0,0,0.2);' : ''}
                        ${efecto.estilo === 'glow' ? 'box-shadow: inset 0 0 20px rgba(255,255,255,0.5);' : ''}
                        ${efecto.estilo === 'gradient' ? 'background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);' : ''}
                        ${efecto.estilo === 'texture' ? 'background-image: radial-gradient(circle, transparent 20%, #1D4ED8 100%);' : ''}
                        ${efecto.estilo === 'circular' ? 'border-radius: 50%;' : ''}
                        ${efecto.estilo === 'rounded' ? 'border-radius: 25%;' : ''}
                        ${efecto.estilo === 'reflection' ? 'background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #3B82F6 100%);' : ''}
                        ${efecto.estilo === '3d' ? 'box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2);' : ''}">
                <div style="color: white; font-size: 18px;">✓</div>
            </div>
            <p style="text-align: center; margin: 5px 0 0 0; font-size: 11px; color: #4B5563;">
                ${efecto.nombre}
            </p>
        </div>
    `).join('');

    // Generar HTML para las combinaciones
    const combinacionesHTML = combinaciones.map(combo => {
        const avatar = avatarPredefinidos.find(a => a.id === combo.avatarId) || avatarPredefinidos[0];
        const marco = marcos.find(m => m.id === combo.marcoId) || marcos[0];
        const efecto = efectos.find(e => e.id === combo.efectoId) || efectos[0];
        
        return `
        <div class="combinacion-item" data-combinacion-id="${combo.id}" 
             style="padding: 15px; border-radius: 10px; cursor: pointer; 
                    border: 2px solid #E5E7EB; background: white;
                    transition: all 0.3s; margin: 5px;"
             data-avatar-id="${avatar.id}"
             data-marco-id="${marco.id}"
             data-efecto-id="${efecto.id}">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; 
                            background: ${avatar.color}; display: flex; 
                            align-items: center; justify-content: center;
                            color: white; font-size: 20px;
                            border: ${marco.estilo === 'solid' ? '3px solid ' + marco.color : 
                                     marco.estilo === 'gradient' ? '3px solid ' + marco.color :
                                     marco.estilo === 'dotted' ? '3px dotted ' + marco.color :
                                     marco.estilo === 'dashed' ? '3px dashed ' + marco.color :
                                     marco.estilo === 'double' ? '6px double ' + marco.color :
                                     'none'};
                            ${efecto.estilo === 'shadow' ? 'box-shadow: 0 4px 15px rgba(0,0,0,0.2);' : ''}
                            ${efecto.estilo === 'glow' ? 'box-shadow: inset 0 0 20px rgba(255,255,255,0.5);' : ''}
                            ${efecto.estilo === 'gradient' ? 'background: linear-gradient(135deg, ' + avatar.color + ' 0%, ' + darkenColor(avatar.color, 20) + ' 100%);' : ''}
                            ${efecto.estilo === 'texture' ? 'background-image: radial-gradient(circle, transparent 20%, ' + darkenColor(avatar.color, 20) + ' 100%);' : ''}
                            ${efecto.estilo === 'circular' ? 'border-radius: 50%;' : ''}
                            ${efecto.estilo === 'rounded' ? 'border-radius: 25%;' : ''}
                            ${efecto.estilo === 'reflection' ? 'background: linear-gradient(135deg, ' + avatar.color + ' 0%, ' + darkenColor(avatar.color, 20) + ' 50%, ' + avatar.color + ' 100%);' : ''}
                            ${efecto.estilo === '3d' ? 'box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2);' : ''}
                            ${marco.estilo === 'neon' ? `box-shadow: 0 0 10px ${marco.color}, 0 0 20px ${marco.color}80; border: 3px solid ${marco.color};` : ''}
                            ${marco.estilo === 'glow' ? `box-shadow: 0 0 15px ${marco.color}80; border: 3px solid ${marco.color};` : ''}">
                    ${avatar.texto}
                </div>
                <div style="flex: 1;">
                    <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">
                        ${combo.nombre}
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #6B7280;">
                        ${avatar.texto} • ${marco.nombre} • ${efecto.nombre}
                    </p>
                </div>
                <div style="color: #3B82F6; font-size: 18px;">
                    →
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Agrupar por tipo para el filtro
    const tiposUnicos = [...new Set(avatarPredefinidos.map(a => a.tipo))];

    Swal.fire({
        title: '🎨 Personalizar Avatar',
        html: `
            <div style="text-align: center; padding: 20px; max-width: 100%;">
                <!-- Vista previa del avatar con controles -->
                <div style="margin-bottom: 30px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                        padding: 25px; border-radius: 15px; border: 2px dashed #cbd5e1;">
                    <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
                        <i class="fas fa-eye"></i> Vista Previa
                    </h3>
                    
                    <div id="avatarPreviewContainer" style="position: relative; display: inline-block;">
                        <div id="avatarPreview" 
                             style="width: 120px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                    margin: 0 auto; transition: all 0.5s; font-size: 48px; color: white;
                                    position: relative; z-index: 2;">
                            <i class="fas fa-user-circle" style="color: white;"></i>
                        </div>
                        <div id="marcoPreview" style="position: absolute; top: -10px; left: -10px; 
                             width: 140px; height: 140px; border-radius: 50%; z-index: 1; pointer-events: none;">
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button id="btnRandomAvatar" style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); 
                                color: white; border: none; padding: 10px 15px; border-radius: 8px; 
                                cursor: pointer; transition: all 0.3s; font-size: 13px; font-weight: 500;">
                            <i class="fas fa-random"></i> Aleatorio
                        </button>
                        <button id="btnResetAvatar" style="background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); 
                                color: white; border: none; padding: 10px 15px; border-radius: 8px; 
                                cursor: pointer; transition: all 0.3s; font-size: 13px; font-weight: 500;">
                            <i class="fas fa-undo"></i> Reiniciar
                        </button>
                    </div>
                </div>
                
                <!-- Pestañas -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; background: #f3f4f6; border-radius: 10px; padding: 5px; margin-bottom: 15px;">
                        <button class="tab-btn active" data-tab="avatares" 
                                style="flex: 1; padding: 12px; border: none; border-radius: 8px; 
                                       background: white; color: #111827; font-weight: 600; cursor: pointer;
                                       box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <i class="fas fa-user-circle"></i> Avatares
                        </button>
                        <button class="tab-btn" data-tab="marcos" 
                                style="flex: 1; padding: 12px; border: none; border-radius: 8px; 
                                       background: transparent; color: #6B7280; font-weight: 500; cursor: pointer;">
                            <i class="fas fa-square"></i> Marcos
                        </button>
                        <button class="tab-btn" data-tab="efectos" 
                                style="flex: 1; padding: 12px; border: none; border-radius: 8px; 
                                       background: transparent; color: #6B7280; font-weight: 500; cursor: pointer;">
                            <i class="fas fa-magic"></i> Efectos
                        </button>
                        <button class="tab-btn" data-tab="combinaciones" 
                                style="flex: 1; padding: 12px; border: none; border-radius: 8px; 
                                       background: transparent; color: #6B7280; font-weight: 500; cursor: pointer;">
                            <i class="fas fa-palette"></i> Combinaciones
                        </button>
                    </div>
                </div>
                
                <!-- Contenido de las pestañas -->
                <div id="tabContent">
                    <!-- Pestaña Avatares -->
                    <div id="avataresTab" class="tab-content active" style="display: block;">
                        <!-- Filtros y búsqueda -->
                        <div style="margin-bottom: 15px; background: #f8fafc; padding: 15px; border-radius: 10px;">
                            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                <input type="text" id="avatarSearch" placeholder="🔍 Buscar por nombre, letra o emoji..." 
                                       style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; outline: none; font-size: 14px;">
                                <select id="avatarFilter" style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; outline: none; font-size: 14px;">
                                    <option value="todos">Todos los tipos</option>
                                    ${tiposUnicos.map(tipo => 
                                        `<option value="${tipo}">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <!-- Filtro rápido -->
                            <div style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap; margin-top: 10px;">
                                <button class="filter-btn active" data-filter="todos"
                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                               background: #3B82F6; color: white; cursor: pointer; 
                                               transition: all 0.3s; font-size: 12px;">Todos</button>
                                <button class="filter-btn" data-filter="letra"
                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                               background: #e5e7eb; color: #4b5563; cursor: pointer; 
                                               transition: all 0.3s; font-size: 12px;">Letras</button>
                                <button class="filter-btn" data-filter="emoji"
                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                               background: #e5e7eb; color: #4b5563; cursor: pointer; 
                                               transition: all 0.3s; font-size: 12px;">Emojis</button>
                                <button class="filter-btn" data-filter="numero"
                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                               background: #e5e7eb; color: #4b5563; cursor: pointer; 
                                               transition: all 0.3s; font-size: 12px;">Números</button>
                                <button class="filter-btn" data-filter="forma"
                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                               background: #e5e7eb; color: #4b5563; cursor: pointer; 
                                               transition: all 0.3s; font-size: 12px;">Formas</button>
                                <button class="filter-btn" data-filter="símbolo"
                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                               background: #e5e7eb; color: #4b5563; cursor: pointer; 
                                               transition: all 0.3s; font-size: 12px;">Símbolos</button>
                            </div>
                        </div>
                        
                        <!-- Grid de avatares -->
                        <div id="avatarGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(55px, 1fr)); gap: 8px; 
                             max-height: 300px; overflow-y: auto; padding: 15px; background: white; 
                             border-radius: 10px; border: 2px solid #f1f5f9;">
                            ${avatarOptionsHTML}
                        </div>
                    </div>
                    
                    <!-- Pestaña Marcos -->
                    <div id="marcosTab" class="tab-content" style="display: none;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; 
                             max-height: 300px; overflow-y: auto; padding: 15px; background: white; 
                             border-radius: 10px; border: 2px solid #f1f5f9;">
                            ${marcosHTML}
                        </div>
                    </div>
                    
                    <!-- Pestaña Efectos -->
                    <div id="efectosTab" class="tab-content" style="display: none;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; 
                             max-height: 300px; overflow-y: auto; padding: 15px; background: white; 
                             border-radius: 10px; border: 2px solid #f1f5f9;">
                            ${efectosHTML}
                        </div>
                    </div>
                    
                    <!-- Pestaña Combinaciones -->
                    <div id="combinacionesTab" class="tab-content" style="display: none;">
                        <div style="max-height: 300px; overflow-y: auto; padding: 15px; background: white; 
                             border-radius: 10px; border: 2px solid #f1f5f9;">
                            ${combinacionesHTML}
                        </div>
                    </div>
                </div>
                
                <!-- Información y estadísticas -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                        <p style="color: #0369a1; margin: 0; font-size: 13px; text-align: left; font-weight: 500;">
                            <i class="fas fa-info-circle"></i> 
                            <span id="avatarStats">Selecciona un avatar para comenzar</span>
                        </p>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <p style="color: #92400e; margin: 0; font-size: 13px; text-align: left; font-weight: 500;">
                            <i class="fas fa-lightbulb"></i> 
                            Prueba combinaciones predefinidas para resultados sorprendentes
                        </p>
                    </div>
                </div>
            </div>
        `,
        width: 700,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '💾 Guardar Avatar',
        cancelButtonText: '✕ Cancelar',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        showCloseButton: true,
        background: '#ffffff',
        preConfirm: async () => {
            if (!avatarSeleccionado) {
                Swal.showValidationMessage('Por favor, selecciona un avatar primero');
                return false;
            }
            
            const avatarId = avatarSeleccionado.getAttribute('data-avatar-id');
            const avatarText = decodeHtml(avatarSeleccionado.getAttribute('data-avatar-text'));
            const avatarColor = avatarSeleccionado.getAttribute('data-avatar-color');
            const marcoId = marcoSeleccionado.id;
            const efectoId = efectoSeleccionado.id;
            
            return { 
                avatarId, 
                avatarText, 
                avatarColor,
                marcoId,
                efectoId
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const avatarData = result.value;
            
            try {
                // Obtener usuario actual
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    throw new Error('Usuario no autenticado');
                }
                
                // Aplicar marco y efecto al SVG
                let marcoStyle = '';
                switch(marcoSeleccionado.estilo) {
                    case 'solid':
                        marcoStyle = `stroke:${marcoSeleccionado.color};stroke-width:8;`;
                        break;
                    case 'dotted':
                        marcoStyle = `stroke:${marcoSeleccionado.color};stroke-width:8;stroke-dasharray:5,5;`;
                        break;
                    case 'dashed':
                        marcoStyle = `stroke:${marcoSeleccionado.color};stroke-width:8;stroke-dasharray:10,5;`;
                        break;
                    case 'double':
                        marcoStyle = `stroke:${marcoSeleccionado.color};stroke-width:3;stroke-dasharray:none;`;
                        break;
                }
                
                // Aplicar efecto al fondo
                let backgroundStyle = '';
                switch(efectoSeleccionado.estilo) {
                    case 'gradient':
                        backgroundStyle = `fill:url(#gradient);`;
                        break;
                    case 'texture':
                        backgroundStyle = `fill:${avatarData.avatarColor};filter:url(#texture);`;
                        break;
                    default:
                        backgroundStyle = `fill:${avatarData.avatarColor};`;
                }
                
                // Crear URL del avatar con efectos
                const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:${avatarData.avatarColor};stop-opacity:1" />
                            <stop offset="100%" style="stop-color:${darkenColor(avatarData.avatarColor, 30)};stop-opacity:1" />
                        </linearGradient>
                        <filter id="texture">
                            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/>
                            <feColorMatrix in="turbulence" type="saturate" values="0.3"/>
                            <feBlend in="SourceGraphic" in2="turbulence" mode="multiply"/>
                        </filter>
                        ${marcoSeleccionado.estilo === 'gradient' ? 
                        `<linearGradient id="marcoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>` : ''}
                    </defs>
                    
                    <!-- Fondo principal -->
                    <circle cx="100" cy="100" r="90" style="${backgroundStyle}"/>
                    
                    <!-- Marco -->
                    ${marcoSeleccionado.id !== 'ninguno' ? 
                    `<circle cx="100" cy="100" r="95" style="fill:none;${marcoStyle}${marcoSeleccionado.estilo === 'gradient' ? 'stroke:url(#marcoGradient);' : ''}"/>` : ''}
                    
                    <!-- Texto/Emoji -->
                    <text x="100" y="110" font-family="Arial, sans-serif" font-size="70" 
                          fill="white" text-anchor="middle" dominant-baseline="middle">
                        ${encodeHtml(avatarData.avatarText)}
                    </text>
                    
                    <!-- Efectos adicionales -->
                    ${efectoSeleccionado.estilo === 'shadow' ? 
                    `<circle cx="102" cy="102" r="90" style="fill:rgba(0,0,0,0.1);"/>` : ''}
                    
                    ${efectoSeleccionado.estilo === 'glow' ? 
                    `<circle cx="100" cy="100" r="90" style="fill:url(#gradient);filter:blur(5px);opacity:0.3;"/>` : ''}
                </svg>`;
                
                // Codificar a base64 de manera segura
                const base64SVG = safeBtoa(svgContent);
                const avatarUrl = `data:image/svg+xml;base64,${base64SVG}`;
                
                console.log('Actualizando avatar para usuario:', user.id);
                
                // Actualizar en la tabla usuarios
                const { data, error } = await supabase
                    .from('usuarios')
                    .update({ 
                        avatar_url: avatarUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id)
                    .select()
                    .single();
                
                if (error) {
                    console.error('Error de Supabase:', error);
                    throw error;
                }
                
                console.log('Avatar actualizado correctamente:', data);
                
                // Mostrar mensaje de éxito y recargar página
                Swal.fire({
                    icon: 'success',
                    title: '¡Avatar guardado!',
                    text: 'El avatar se ha actualizado correctamente.',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    timer: 1500,
                    timerProgressBar: true
                }).then(() => {
                    // Recargar la página después de guardar
                    window.location.reload();
                });
                
            } catch (error) {
                console.error('Error completo al actualizar avatar:', error);
                mostrarAlerta('error', `Error al guardar el avatar: ${error.message}`);
            }
        }
    });

    // Configurar eventos después de mostrar el modal
    setTimeout(() => {
        // Funciones auxiliares
        function actualizarVistaPrevia() {
            const avatarPreview = document.getElementById('avatarPreview');
            const marcoPreview = document.getElementById('marcoPreview');
            
            if (avatarSeleccionado) {
                const avatarText = decodeHtml(avatarSeleccionado.getAttribute('data-avatar-text'));
                const avatarColor = avatarSeleccionado.getAttribute('data-avatar-color');
                const avatarTipo = avatarSeleccionado.getAttribute('data-avatar-type');
                
                // Actualizar avatar
                avatarPreview.innerHTML = avatarText;
                avatarPreview.style.fontSize = avatarTipo === 'emoji' ? '48px' : '40px';
                
                // Aplicar efecto seleccionado
                switch(efectoSeleccionado.estilo) {
                    case 'shadow':
                        avatarPreview.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                        break;
                    case 'glow':
                        avatarPreview.style.boxShadow = `inset 0 0 30px rgba(255,255,255,0.5), 0 0 20px ${avatarColor}80`;
                        break;
                    case 'gradient':
                        avatarPreview.style.background = `linear-gradient(135deg, ${avatarColor} 0%, ${darkenColor(avatarColor, 20)} 100%)`;
                        break;
                    case 'texture':
                        avatarPreview.style.backgroundImage = `radial-gradient(circle, transparent 30%, ${darkenColor(avatarColor, 20)} 100%)`;
                        break;
                    case 'circular':
                        avatarPreview.style.borderRadius = '50%';
                        break;
                    case 'rounded':
                        avatarPreview.style.borderRadius = '30%';
                        break;
                    default:
                        avatarPreview.style.background = avatarColor;
                        avatarPreview.style.boxShadow = 'none';
                        avatarPreview.style.borderRadius = '50%';
                }
                
                // Aplicar marco seleccionado
                marcoPreview.innerHTML = '';
                marcoPreview.style.border = 'none';
                marcoPreview.style.boxShadow = 'none';
                marcoPreview.style.background = 'none';
                
                if (marcoSeleccionado.id !== 'ninguno') {
                    switch(marcoSeleccionado.estilo) {
                        case 'solid':
                            marcoPreview.style.border = `8px solid ${marcoSeleccionado.color}`;
                            break;
                        case 'gradient':
                            marcoPreview.style.border = `8px solid`;
                            marcoPreview.style.borderImage = marcoSeleccionado.color;
                            marcoPreview.style.borderImageSlice = 1;
                            break;
                        case 'dotted':
                            marcoPreview.style.border = `8px dotted ${marcoSeleccionado.color}`;
                            break;
                        case 'dashed':
                            marcoPreview.style.border = `8px dashed ${marcoSeleccionado.color}`;
                            break;
                        case 'double':
                            marcoPreview.style.border = `6px double ${marcoSeleccionado.color}`;
                            break;
                        case 'neon':
                            marcoPreview.style.border = `8px solid ${marcoSeleccionado.color}`;
                            marcoPreview.style.boxShadow = `0 0 15px ${marcoSeleccionado.color}, 0 0 30px ${marcoSeleccionado.color}80`;
                            break;
                        case 'glow':
                            marcoPreview.style.border = `8px solid ${marcoSeleccionado.color}`;
                            marcoPreview.style.boxShadow = `0 0 20px ${marcoSeleccionado.color}80`;
                            break;
                    }
                }
                
                // Actualizar estadísticas
                const avatarStats = document.getElementById('avatarStats');
                const avatarTipoTexto = avatarSeleccionado.getAttribute('data-avatar-type');
                avatarStats.innerHTML = `Avatar seleccionado: <strong>${avatarText}</strong> (${avatarTipoTexto})`;
            }
        }
        
        function seleccionarAvatar(element) {
            // Remover selección anterior
            document.querySelectorAll('.avatar-item').forEach(item => {
                item.classList.remove('selected');
                item.style.transform = 'scale(1)';
                item.style.boxShadow = 'none';
                item.style.borderColor = 'transparent';
            });
            
            // Aplicar selección nueva
            element.classList.add('selected');
            element.style.transform = 'scale(1.1)';
            element.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            element.style.borderColor = '#3B82F6';
            
            avatarSeleccionado = element;
            actualizarVistaPrevia();
        }
        
        function seleccionarMarco(element) {
            const marcoId = element.getAttribute('data-marco-id');
            marcoSeleccionado = marcos.find(m => m.id === marcoId);
            
            // Remover selección anterior
            document.querySelectorAll('.marco-item').forEach(item => {
                item.style.borderColor = '#E5E7EB';
                item.style.background = 'white';
            });
            
            // Aplicar selección nueva
            element.style.borderColor = '#3B82F6';
            element.style.background = '#EFF6FF';
            
            actualizarVistaPrevia();
        }
        
        function seleccionarEfecto(element) {
            const efectoId = element.getAttribute('data-efecto-id');
            efectoSeleccionado = efectos.find(e => e.id === efectoId);
            
            // Remover selección anterior
            document.querySelectorAll('.efecto-item').forEach(item => {
                item.style.borderColor = '#E5E7EB';
                item.style.background = 'white';
            });
            
            // Aplicar selección nueva
            element.style.borderColor = '#3B82F6';
            element.style.background = '#EFF6FF';
            
            actualizarVistaPrevia();
        }
        
        function aplicarCombinacion(element) {
            const avatarId = element.getAttribute('data-avatar-id');
            const marcoId = element.getAttribute('data-marco-id');
            const efectoId = element.getAttribute('data-efecto-id');
            
            // Seleccionar avatar
            const avatarElement = document.querySelector(`.avatar-item[data-avatar-id="${avatarId}"]`);
            if (avatarElement) {
                seleccionarAvatar(avatarElement);
                avatarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Seleccionar marco
            const marcoElement = document.querySelector(`.marco-item[data-marco-id="${marcoId}"]`);
            if (marcoElement) {
                // Cambiar a pestaña de marcos
                cambiarTab('marcos');
                setTimeout(() => seleccionarMarco(marcoElement), 100);
            }
            
            // Seleccionar efecto
            const efectoElement = document.querySelector(`.efecto-item[data-efecto-id="${efectoId}"]`);
            if (efectoElement) {
                // Cambiar a pestaña de efectos
                cambiarTab('efectos');
                setTimeout(() => seleccionarEfecto(efectoElement), 100);
            }
            
            // Remover selección anterior de combinaciones
            document.querySelectorAll('.combinacion-item').forEach(item => {
                item.style.borderColor = '#E5E7EB';
                item.style.background = 'white';
            });
            
            // Aplicar selección nueva
            element.style.borderColor = '#3B82F6';
            element.style.background = '#EFF6FF';
        }
        
        function cambiarTab(tabName) {
            // Ocultar todos los contenidos
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Mostrar contenido seleccionado
            document.getElementById(`${tabName}Tab`).style.display = 'block';
            
            // Actualizar botones de pestaña
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'transparent';
                btn.style.color = '#6B7280';
                btn.style.fontWeight = '500';
                btn.style.boxShadow = 'none';
            });
            
            const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
            activeBtn.classList.add('active');
            activeBtn.style.background = 'white';
            activeBtn.style.color = '#111827';
            activeBtn.style.fontWeight = '600';
            activeBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
        
        // Configurar eventos de los avatares
        document.querySelectorAll('.avatar-item').forEach(avatar => {
            avatar.addEventListener('click', function() {
                seleccionarAvatar(this);
            });
        });
        
        // Configurar eventos de los marcos
        document.querySelectorAll('.marco-item').forEach(marco => {
            marco.addEventListener('click', function() {
                seleccionarMarco(this);
            });
        });
        
        // Configurar eventos de los efectos
        document.querySelectorAll('.efecto-item').forEach(efecto => {
            efecto.addEventListener('click', function() {
                seleccionarEfecto(this);
            });
        });
        
        // Configurar eventos de las combinaciones
        document.querySelectorAll('.combinacion-item').forEach(combo => {
            combo.addEventListener('click', function() {
                aplicarCombinacion(this);
            });
        });
        
        // Configurar botones de pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                cambiarTab(tabName);
            });
        });
        
        // Configurar botones de filtro rápido
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filterType = this.getAttribute('data-filter');
                
                // Actualizar apariencia de botones
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.style.background = '#e5e7eb';
                    b.style.color = '#4b5563';
                });
                
                this.style.background = '#3B82F6';
                this.style.color = 'white';
                
                // Aplicar filtro
                document.querySelectorAll('.avatar-item').forEach(item => {
                    const type = item.getAttribute('data-avatar-type');
                    
                    if (filterType === 'todos' || type === filterType) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
        
        // Función de búsqueda
        const avatarSearch = document.getElementById('avatarSearch');
        if (avatarSearch) {
            avatarSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('.avatar-item').forEach(item => {
                    const text = decodeHtml(item.getAttribute('data-avatar-text')).toLowerCase();
                    const id = item.getAttribute('data-avatar-id').toLowerCase();
                    const type = item.getAttribute('data-avatar-type').toLowerCase();
                    
                    if (text.includes(searchTerm) || id.includes(searchTerm) || type.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Función de filtro por tipo
        const avatarFilter = document.getElementById('avatarFilter');
        if (avatarFilter) {
            avatarFilter.addEventListener('change', function() {
                const filterType = this.value;
                document.querySelectorAll('.avatar-item').forEach(item => {
                    const type = item.getAttribute('data-avatar-type');
                    
                    if (filterType === 'todos' || type === filterType) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Botón de avatar aleatorio
        const btnRandomAvatar = document.getElementById('btnRandomAvatar');
        if (btnRandomAvatar) {
            btnRandomAvatar.addEventListener('click', function() {
                // Avatar aleatorio
                const avatares = document.querySelectorAll('.avatar-item');
                const randomAvatar = avatares[Math.floor(Math.random() * avatares.length)];
                seleccionarAvatar(randomAvatar);
                
                // Marco aleatorio
                const marcosElements = document.querySelectorAll('.marco-item');
                const randomMarco = marcosElements[Math.floor(Math.random() * marcosElements.length)];
                seleccionarMarco(randomMarco);
                
                // Efecto aleatorio
                const efectosElements = document.querySelectorAll('.efecto-item');
                const randomEfecto = efectosElements[Math.floor(Math.random() * efectosElements.length)];
                seleccionarEfecto(randomEfecto);
                
                // Cambiar a vista previa
                cambiarTab('avatares');
                
                mostrarAlerta('info', '¡Avatar aleatorio generado!');
            });
        }
        
        // Botón de reiniciar
        const btnResetAvatar = document.getElementById('btnResetAvatar');
        if (btnResetAvatar) {
            btnResetAvatar.addEventListener('click', function() {
                // Resetear selecciones
                avatarSeleccionado = null;
                marcoSeleccionado = marcos[0];
                efectoSeleccionado = efectos[0];
                
                // Resetear vista previa
                const avatarPreview = document.getElementById('avatarPreview');
                const marcoPreview = document.getElementById('marcoPreview');
                
                avatarPreview.innerHTML = '<i class="fas fa-user-circle" style="color: white;"></i>';
                avatarPreview.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                avatarPreview.style.boxShadow = 'none';
                avatarPreview.style.borderRadius = '50%';
                avatarPreview.style.fontSize = '48px';
                
                marcoPreview.style.border = 'none';
                marcoPreview.style.boxShadow = 'none';
                marcoPreview.style.background = 'none';
                
                // Resetear selecciones visuales
                document.querySelectorAll('.avatar-item, .marco-item, .efecto-item, .combinacion-item').forEach(item => {
                    item.classList.remove('selected');
                    item.style.transform = 'scale(1)';
                    item.style.boxShadow = 'none';
                    item.style.borderColor = '#E5E7EB';
                    item.style.background = 'white';
                });
                
                // Resetear estadísticas
                document.getElementById('avatarStats').textContent = 'Selecciona un avatar para comenzar';
                
                mostrarAlerta('info', 'Avatar reiniciado a valores por defecto');
            });
        }
        
        // Seleccionar primer avatar por defecto
        const primerAvatar = document.querySelector('.avatar-item');
        if (primerAvatar) {
            seleccionarAvatar(primerAvatar);
        }
        
        // Seleccionar primer marco por defecto
        const primerMarco = document.querySelector('.marco-item[data-marco-id="ninguno"]');
        if (primerMarco) {
            seleccionarMarco(primerMarco);
        }
        
        // Seleccionar primer efecto por defecto
        const primerEfecto = document.querySelector('.efecto-item[data-efecto-id="ninguno"]');
        if (primerEfecto) {
            seleccionarEfecto(primerEfecto);
        }
        
    }, 100);
}

// Función para oscurecer color (para gradientes)
function darkenColor(color, percent) {
    // Si el color ya está en formato hexadecimal
    if (color.startsWith('#')) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    
    // Si es un color RGB
    if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g).map(Number);
        const r = Math.floor(rgb[0] * (100 - percent) / 100);
        const g = Math.floor(rgb[1] * (100 - percent) / 100);
        const b = Math.floor(rgb[2] * (100 - percent) / 100);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    return color;
}

// Función auxiliar para mostrar alertas
function mostrarAlerta(tipo, mensaje) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
    
    Toast.fire({
        icon: tipo,
        title: mensaje
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("🚀 Inicializando página de configuración...");
        
        // 1. Cargar datos del usuario
        await cargarDatosUsuario();
        
        // 2. Verificar/crear tabla de redes sociales
        await crearTablaRedesSociales();
        
        // 3. Configurar eventos básicos
        configurarEventosBasicos();
        
        // 4. Configurar eventos específicos
        configurarEventosPerfil();
        configurarEventosRedesSociales();
        configurarEventosSeguridad();
        
        console.log("✅ Página de configuración inicializada correctamente");
        
    } catch (error) {
        console.error('❌ Error al inicializar configuración:', error);
        mostrarAlerta('error', 'Error al inicializar la configuración');
    }
});