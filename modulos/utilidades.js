// modulos/utilidades.js
const Utilidades = {
    // ===============================
    // FUNCIONES DE MANEJO DE USUARIOS
    // ===============================
    
    obtenerIniciales(nombreCompleto) {
        try {
            if (!nombreCompleto || typeof nombreCompleto !== 'string') {
                return '?';
            }
            
            const nombres = nombreCompleto.trim().split(' ').filter(n => n.length > 0);
            
            if (nombres.length === 0) return '?';
            if (nombres.length === 1) return nombres[0].charAt(0).toUpperCase();
            
            const inicialNombre = nombres[0].charAt(0).toUpperCase();
            const inicialApellido = nombres[nombres.length - 1].charAt(0).toUpperCase();
            
            return inicialNombre + inicialApellido;
        } catch (error) {
            console.error('Error en obtenerIniciales:', error);
            return '?';
        }
    },

    obtenerNombreCompleto(usuario) {
        try {
            if (!usuario) return 'Usuario';
            
            if (typeof usuario === 'string') return usuario;
            
            if (usuario.nombre && usuario.apellidos) {
                return `${usuario.nombre} ${usuario.apellidos}`;
            }
            
            if (usuario.nombre) return usuario.nombre;
            if (usuario.email) return usuario.email.split('@')[0];
            
            return 'Usuario';
        } catch (error) {
            console.error('Error en obtenerNombreCompleto:', error);
            return 'Usuario';
        }
    },

    // ===============================
    // FUNCIONES DE FECHAS Y TIEMPO
    // ===============================
    
    formatearFecha(fechaISO, incluirHora = true) {
        try {
            if (!fechaISO) return 'N/A';
            
            const fecha = new Date(fechaISO);
            
            if (isNaN(fecha.getTime())) {
                return 'Fecha inválida';
            }
            
            const opcionesFecha = {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            };
            
            const opcionesHora = {
                hour: '2-digit',
                minute: '2-digit'
            };
            
            let fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);
            
            if (incluirHora) {
                const horaFormateada = fecha.toLocaleTimeString('es-ES', opcionesHora);
                fechaFormateada += `, ${horaFormateada}`;
            }
            
            return fechaFormateada;
        } catch (error) {
            console.error('Error en formatearFecha:', error);
            return 'N/A';
        }
    },

    formatearFechaRelativa(fechaISO) {
        try {
            if (!fechaISO) return 'N/A';
            
            const fecha = new Date(fechaISO);
            const ahora = new Date();
            const diferenciaMs = ahora - fecha;
            const diferenciaMin = Math.floor(diferenciaMs / (1000 * 60));
            const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
            const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
            
            if (diferenciaMin < 1) return 'Ahora mismo';
            if (diferenciaMin < 60) return `Hace ${diferenciaMin} min`;
            if (diferenciaHoras < 24) return `Hace ${diferenciaHoras} h`;
            if (diferenciaDias === 1) return 'Ayer';
            if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
            
            return this.formatearFecha(fechaISO, false);
        } catch (error) {
            console.error('Error en formatearFechaRelativa:', error);
            return this.formatearFecha(fechaISO);
        }
    },

    // ===============================
    // FUNCIONES DE ALERTAS Y MODALES
    // ===============================
    
    mostrarAlerta(titulo, mensaje, tipo = 'info', config = {}) {
        try {
            if (!Swal) {
                console.warn('SweetAlert2 no está disponible');
                alert(`${titulo}: ${mensaje}`);
                return Promise.resolve();
            }
            
            const configBase = {
                title: titulo,
                text: mensaje,
                icon: tipo,
                confirmButtonText: config.confirmButtonText || 'OK',
                confirmButtonColor: config.confirmButtonColor || '#1a73e8',
                background: 'white',
                color: '#202124',
                customClass: {
                    popup: 'messenger-swal',
                    title: 'messenger-swal-title',
                    htmlContainer: 'messenger-swal-content',
                    confirmButton: 'messenger-swal-btn'
                }
            };
            
            return Swal.fire({ ...configBase, ...config });
        } catch (error) {
            console.error('Error en mostrarAlerta:', error);
            alert(`${titulo}: ${mensaje}`);
            return Promise.resolve();
        }
    },

    mostrarConfirmacion(titulo, texto, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar') {
        try {
            if (!Swal) {
                const confirmar = confirm(`${titulo}: ${texto}\n\nPresiona OK para confirmar o Cancelar.`);
                return Promise.resolve({ isConfirmed: confirmar, isDenied: false, isDismissed: !confirmar });
            }
            
            return Swal.fire({
                title: titulo,
                text: texto,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#1a73e8',
                cancelButtonColor: '#5f6368',
                confirmButtonText: textoConfirmar,
                cancelButtonText: textoCancelar,
                background: 'white',
                color: '#202124',
                customClass: {
                    popup: 'messenger-swal',
                    title: 'messenger-swal-title',
                    htmlContainer: 'messenger-swal-content',
                    confirmButton: 'messenger-swal-btn',
                    cancelButton: 'messenger-swal-cancel-btn'
                }
            });
        } catch (error) {
            console.error('Error en mostrarConfirmacion:', error);
            const confirmar = confirm(`${titulo}: ${texto}`);
            return Promise.resolve({ isConfirmed: confirmar, isDenied: false, isDismissed: !confirmar });
        }
    },

    mostrarCargando(titulo = 'Cargando...', texto = 'Por favor espera') {
        try {
            if (!Swal) {
                console.log(titulo);
                return { close: () => console.log('Carga completada') };
            }
            
            return Swal.fire({
                title: titulo,
                text: texto,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
                background: 'white',
                color: '#202124',
                customClass: {
                    popup: 'messenger-swal',
                    title: 'messenger-swal-title',
                    htmlContainer: 'messenger-swal-content'
                }
            });
        } catch (error) {
            console.error('Error en mostrarCargando:', error);
            return { close: () => {} };
        }
    },

    cerrarAlerta() {
        try {
            if (Swal) {
                Swal.close();
            }
        } catch (error) {
            console.error('Error en cerrarAlerta:', error);
        }
    },

    // ===============================
    // FUNCIONES DE VALIDACIÓN
    // ===============================
    
    validarEmail(email) {
        try {
            if (!email) return false;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email.trim());
        } catch (error) {
            console.error('Error en validarEmail:', error);
            return false;
        }
    },

    validarPassword(password) {
        try {
            if (!password) return { valido: false, mensaje: 'La contraseña es requerida' };
            if (password.length < 6) return { valido: false, mensaje: 'Mínimo 6 caracteres' };
            return { valido: true, mensaje: 'Contraseña válida' };
        } catch (error) {
            console.error('Error en validarPassword:', error);
            return { valido: false, mensaje: 'Error validando contraseña' };
        }
    },

    // ===============================
    // FUNCIONES DE MANEJO DE DATOS
    // ===============================
    
    debounce(funcion, espera) {
        let timeout;
        return function ejecutada(...args) {
            const contexto = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => funcion.apply(contexto, args), espera);
        };
    },

    // ===============================
    // FUNCIONES DE UI/UX
    // ===============================
    
    plantillaEstadoVacio(icono = 'inbox', titulo = 'No hay elementos', mensaje = 'No se encontraron resultados') {
        return `
            <div class="empty-state animate__animated animate__fadeIn">
                <div class="empty-state-icon">
                    <i class="fas fa-${icono} fa-4x"></i>
                </div>
                <h3 class="empty-state-title">${titulo}</h3>
                <p class="empty-state-message">${mensaje}</p>
            </div>
        `;
    },

    mostrarErrorConexion() {
        return this.mostrarAlerta(
            'Error de conexión',
            'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
            'error'
        );
    },

    // ===============================
    // FUNCIONES DE FORMATEO
    // ===============================
    
    truncarTexto(texto, longitudMaxima = 100) {
        try {
            if (!texto || typeof texto !== 'string') return '';
            if (texto.length <= longitudMaxima) return texto;
            
            return texto.substring(0, longitudMaxima).trim() + '...';
        } catch (error) {
            console.error('Error en truncarTexto:', error);
            return '';
        }
    },

    formatearNumero(numero) {
        try {
            if (numero === undefined || numero === null) return '0';
            
            const num = Number(numero);
            if (isNaN(num)) return '0';
            
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1).replace('.0', '') + 'K';
            }
            
            return num.toString();
        } catch (error) {
            console.error('Error en formatearNumero:', error);
            return '0';
        }
    },

    // ===============================
    // FUNCIONES DE ALMACENAMIENTO
    // ===============================
    
    guardarEnLocalStorage(clave, valor) {
        try {
            localStorage.setItem(`messenger_${clave}`, JSON.stringify(valor));
            return true;
        } catch (error) {
            console.error('Error en guardarEnLocalStorage:', error);
            return false;
        }
    },

    obtenerDeLocalStorage(clave, valorPorDefecto = null) {
        try {
            const item = localStorage.getItem(`messenger_${clave}`);
            return item ? JSON.parse(item) : valorPorDefecto;
        } catch (error) {
            console.error('Error en obtenerDeLocalStorage:', error);
            return valorPorDefecto;
        }
    },

    eliminarDeLocalStorage(clave) {
        try {
            localStorage.removeItem(`messenger_${clave}`);
            return true;
        } catch (error) {
            console.error('Error en eliminarDeLocalStorage:', error);
            return false;
        }
    },

    // ===============================
    // FUNCIONES DE NAVEGACIÓN
    // ===============================
    
    redirigirConRetraso(url, retrasoMs = 2000) {
        setTimeout(() => {
            window.location.href = url;
        }, retrasoMs);
    },

    // ===============================
    // FUNCIONES DE DEPURACIÓN
    // ===============================
    
    debug(mensaje, datos = null) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`🔍 DEBUG [${new Date().toLocaleTimeString()}]: ${mensaje}`, datos || '');
        }
    },

    // ===============================
    // INICIALIZACIÓN
    // ===============================
    
    inicializar() {
        // Agregar estilos CSS para las alertas si no existen
        if (!document.querySelector('#utilidades-estilos')) {
            const estilos = document.createElement('style');
            estilos.id = 'utilidades-estilos';
            estilos.textContent = `
                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #5f6368;
                }
                
                .empty-state-icon {
                    color: #dadce0;
                    margin-bottom: 20px;
                }
                
                .empty-state-title {
                    font-size: 18px;
                    font-weight: 500;
                    margin-bottom: 10px;
                    color: #3c4043;
                }
                
                .empty-state-message {
                    font-size: 14px;
                    max-width: 300px;
                    margin: 0 auto;
                    line-height: 1.5;
                }
                
                .messenger-swal {
                    background: white !important;
                    color: #202124 !important;
                    border-radius: 16px !important;
                    border: 1px solid #dadce0 !important;
                }
                
                .messenger-swal-title {
                    color: #202124 !important;
                    font-weight: 500 !important;
                    font-size: 24px !important;
                }
                
                .messenger-swal-content {
                    color: #5f6368 !important;
                    font-size: 15px !important;
                }
                
                .messenger-swal-btn {
                    background: #1a73e8 !important;
                    color: white !important;
                    border: none !important;
                    padding: 12px 24px !important;
                    border-radius: 8px !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                
                .messenger-swal-btn:hover {
                    background: #0d62d9 !important;
                    transform: translateY(-1px) !important;
                }
                
                .messenger-swal-cancel-btn {
                    background: #5f6368 !important;
                    color: white !important;
                }
            `;
            document.head.appendChild(estilos);
        }
        
        console.log('✅ Utilidades inicializadas correctamente');
    }
};

// Inicializar cuando se carga el módulo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Utilidades.inicializar();
    });
} else {
    Utilidades.inicializar();
}

// Hacer disponible globalmente
window.Utilidades = Utilidades;

// Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utilidades;
}