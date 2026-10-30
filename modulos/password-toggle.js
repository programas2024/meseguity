// password-toggle.js - Gestión del toggle de contraseña

// Función para inicializar el toggle de contraseña
function inicializarToggleContraseña() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle-btn');
    
    if (!passwordInput || !toggleButton) return;
    
    // Configurar tooltip inicial
    toggleButton.setAttribute('data-tooltip', 'Mostrar contraseña');
    
    // Función para cambiar el estado del toggle
    function togglePasswordVisibility() {
        const isPassword = passwordInput.type === 'password';
        
        // Cambiar tipo de input
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Cambiar icono
        const eyeIcon = toggleButton.querySelector('i');
        if (isPassword) {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
            toggleButton.classList.add('active');
            toggleButton.setAttribute('data-tooltip', 'Ocultar contraseña');
        } else {
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
            toggleButton.classList.remove('active');
            toggleButton.setAttribute('data-tooltip', 'Mostrar contraseña');
        }
        
        // Enfocar el input después del cambio
        passwordInput.focus();
        
        // Animación sutil
        toggleButton.style.transform = 'translateY(-50%) scale(1.1)';
        setTimeout(() => {
            toggleButton.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    }
    
    // Evento click en el botón
    toggleButton.addEventListener('click', togglePasswordVisibility);
    
    // Evento tecla Enter/Espacio en el botón
    toggleButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePasswordVisibility();
        }
    });
    
    // Mostrar/ocultar contraseña temporalmente al mantener presionado
    let holdTimeout;
    let isHolding = false;
    
    toggleButton.addEventListener('mousedown', () => {
        if (passwordInput.type === 'password') {
            holdTimeout = setTimeout(() => {
                isHolding = true;
                passwordInput.type = 'text';
            }, 500); // Mostrar después de 500ms de mantener presionado
        }
    });
    
    toggleButton.addEventListener('mouseup', () => {
        clearTimeout(holdTimeout);
        if (isHolding) {
            passwordInput.type = 'password';
            isHolding = false;
        }
    });
    
    toggleButton.addEventListener('mouseleave', () => {
        clearTimeout(holdTimeout);
        if (isHolding) {
            passwordInput.type = 'password';
            isHolding = false;
        }
    });
    
    // Función para verificar fortaleza de contraseña
    function verificarFortalezaContraseña(contraseña) {
        let fortaleza = 0;
        
        // Longitud mínima
        if (contraseña.length >= 8) fortaleza++;
        
        // Contiene números
        if (/\d/.test(contraseña)) fortaleza++;
        
        // Contiene mayúsculas y minúsculas
        if (/[a-z]/.test(contraseña) && /[A-Z]/.test(contraseña)) fortaleza++;
        
        // Contiene caracteres especiales
        if (/[^a-zA-Z0-9]/.test(contraseña)) fortaleza++;
        
        return fortaleza;
    }
    
    // Actualizar indicador de fortaleza
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const fortaleza = verificarFortalezaContraseña(this.value);
            const meter = document.querySelector('.strength-meter');
            const text = document.querySelector('.strength-text');
            
            if (meter && text) {
                meter.className = 'strength-meter';
                
                if (this.value.length === 0) {
                    meter.style.width = '0%';
                    text.textContent = '';
                } else if (fortaleza <= 1) {
                    meter.classList.add('weak');
                    text.textContent = 'Débil';
                    text.style.color = '#e74c3c';
                } else if (fortaleza <= 3) {
                    meter.classList.add('medium');
                    text.textContent = 'Media';
                    text.style.color = '#f39c12';
                } else {
                    meter.classList.add('strong');
                    text.textContent = 'Fuerte';
                    text.style.color = '#27ae60';
                }
            }
        });
    }
    
    console.log('✅ Toggle de contraseña inicializado');
}

// Hacer función disponible globalmente
window.inicializarToggleContraseña = inicializarToggleContraseña;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarToggleContraseña);
} else {
    inicializarToggleContraseña();
}