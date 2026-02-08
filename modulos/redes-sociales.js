// Módulo de redes sociales
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar si estamos en la página de configuración
    if (!document.querySelector('.app-container')) return;
    
    // Esperar un momento para asegurar que supabase esté cargado
    await esperarSupabase();
    
    // Inicializar redes sociales
    await initRedesSociales();
});

async function esperarSupabase() {
    // Esperar hasta que supabase esté disponible
    let intentos = 0;
    const maxIntentos = 10;
    
    while (!window.supabase && intentos < maxIntentos) {
        await new Promise(resolve => setTimeout(resolve, 500));
        intentos++;
    }
    
    if (!window.supabase) {
        throw new Error('No se pudo cargar Supabase. Verifica la conexión.');
    }
}

async function initRedesSociales() {
    try {
        // Verificar autenticación
        const { data: { user }, error: authError } = await window.supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('Error de autenticación:', authError);
            window.location.href = 'index.html';
            return;
        }
        
        console.log('Cargando redes sociales para:', user.email);
        
        // Verificar si existe la tabla redes_sociales, si no existe, crearla
        await verificarTablaRedesSociales();
        
        // Cargar redes sociales del usuario
        await cargarRedesSociales(user.id);
        
        // Configurar eventos del formulario
        configurarEventosFormularioRedes(user.id);
        
        // Configurar funciones globales
        window.toggleRedSocial = toggleRedSocial;
        window.actualizarEstadoRed = actualizarEstadoRed;
        window.limpiarRedes = limpiarRedes;
        
    } catch (error) {
        console.error('Error inicializando redes sociales:', error);
        mostrarAlertaRedes('error', 'Error al cargar las redes sociales: ' + error.message);
    }
}

async function verificarTablaRedesSociales() {
    try {
        // Intentar verificar si la tabla existe
        const { error } = await window.supabase
            .from('redes_sociales')
            .select('count')
            .limit(1);
        
        // Si hay error, la tabla probablemente no existe
        if (error && error.code === '42P01') {
            console.log('Tabla redes_sociales no existe. Debes crearla en Supabase.');
            // No intentamos crearla aquí ya que requiere permisos de superusuario
        }
        
    } catch (error) {
        console.log('Error verificando tabla redes_sociales:', error);
    }
}

async function cargarRedesSociales(userId) {
    try {
        // Obtener redes sociales del usuario
        const { data: redes, error } = await window.supabase
            .from('redes_sociales')
            .select('*')
            .eq('usuario_id', userId);
        
        if (error) {
            // Si la tabla no existe o hay error, usar datos vacíos
            console.log('Error cargando redes sociales:', error);
            inicializarRedesPorDefecto();
            return;
        }
        
        // Mapear redes sociales por nombre
        const redesMap = {};
        if (redes && redes.length > 0) {
            redes.forEach(red => {
                redesMap[red.nombre_red] = red;
            });
        }
        
        // Definir las redes sociales soportadas
        const redesSoportadas = [
            'facebook', 'instagram', 'twitter', 
            'tiktok', 'youtube', 'linkedin', 'github'
        ];
        
        // Configurar cada red social
        redesSoportadas.forEach(nombreRed => {
            const red = redesMap[nombreRed];
            
            if (red && red.activo && red.url) {
                // Red activa
                const input = document.getElementById(`input${capitalizeFirstLetter(nombreRed)}`);
                if (input) {
                    input.value = red.url;
                }
                toggleRedSocial(nombreRed, true);
            } else {
                // Red inactiva o sin datos
                toggleRedSocial(nombreRed, false);
            }
        });
        
    } catch (error) {
        console.error('Error cargando redes sociales:', error);
        inicializarRedesPorDefecto();
    }
}

function inicializarRedesPorDefecto() {
    // Inicializar todas las redes como inactivas
    const redesSoportadas = [
        'facebook', 'instagram', 'twitter', 
        'tiktok', 'youtube', 'linkedin', 'github'
    ];
    
    redesSoportadas.forEach(nombreRed => {
        toggleRedSocial(nombreRed, false);
    });
}

function configurarEventosFormularioRedes(userId) {
    const form = document.getElementById('formRedesSociales');
    
    if (!form) {
        console.log('Formulario de redes sociales no encontrado');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Mostrar estado de carga
            const submitBtn = form.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;
            
            // Guardar todas las redes sociales
            await guardarRedesSociales(userId);
            
            // Mostrar mensaje de éxito
            mostrarAlertaRedes('success', 'Redes sociales guardadas correctamente');
            
        } catch (error) {
            console.error('Error guardando redes sociales:', error);
            mostrarAlertaRedes('error', 'Error al guardar las redes sociales: ' + error.message);
        } finally {
            // Restaurar botón
            const submitBtn = form.querySelector('.btn-primary');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Redes';
                submitBtn.disabled = false;
            }
        }
    });
}

async function guardarRedesSociales(userId) {
    const redesSoportadas = [
        'facebook', 'instagram', 'twitter', 
        'tiktok', 'youtube', 'linkedin', 'github'
    ];
    
    for (const nombreRed of redesSoportadas) {
        const input = document.getElementById(`input${capitalizeFirstLetter(nombreRed)}`);
        if (!input) continue;
        
        const url = input.value.trim();
        const elemento = document.getElementById(`redes${capitalizeFirstLetter(nombreRed)}`);
        const toggleBtn = elemento?.querySelector('.btn-toggle-red');
        const activo = toggleBtn?.classList.contains('active') || false;
        
        if (activo && url) {
            // Validar URL básica
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                throw new Error(`URL inválida para ${nombreRed}. Debe empezar con http:// o https://`);
            }
            
            // Preparar datos de la red social
            const redSocialData = {
                usuario_id: userId,
                nombre_red: nombreRed,
                url: url,
                activo: true,
                updated_at: new Date().toISOString()
            };
            
            try {
                // Verificar si ya existe
                const { data: existe, error: selectError } = await window.supabase
                    .from('redes_sociales')
                    .select('id')
                    .eq('usuario_id', userId)
                    .eq('nombre_red', nombreRed)
                    .maybeSingle();
                
                if (selectError && selectError.code !== 'PGRST116') {
                    console.error('Error verificando red social:', selectError);
                    // Continuar con la siguiente red
                    continue;
                }
                
                if (existe) {
                    // Actualizar
                    const { error: updateError } = await window.supabase
                        .from('redes_sociales')
                        .update(redSocialData)
                        .eq('id', existe.id);
                    
                    if (updateError) {
                        console.error(`Error actualizando ${nombreRed}:`, updateError);
                    }
                } else {
                    // Insertar
                    redSocialData.created_at = new Date().toISOString();
                    const { error: insertError } = await window.supabase
                        .from('redes_sociales')
                        .insert(redSocialData);
                    
                    if (insertError) {
                        console.error(`Error insertando ${nombreRed}:`, insertError);
                    }
                }
                
            } catch (error) {
                console.error(`Error procesando ${nombreRed}:`, error);
                // Continuar con la siguiente red
            }
            
        } else {
            // Desactivar la red
            try {
                const { data: existe } = await window.supabase
                    .from('redes_sociales')
                    .select('id')
                    .eq('usuario_id', userId)
                    .eq('nombre_red', nombreRed)
                    .maybeSingle();
                
                if (existe) {
                    const { error } = await window.supabase
                        .from('redes_sociales')
                        .update({ activo: false, updated_at: new Date().toISOString() })
                        .eq('id', existe.id);
                    
                    if (error) {
                        console.error(`Error desactivando ${nombreRed}:`, error);
                    }
                }
            } catch (error) {
                console.error(`Error desactivando ${nombreRed}:`, error);
            }
        }
    }
}

// Función para activar/desactivar una red social
function toggleRedSocial(red, forzarEstado = null) {
    const elemento = document.getElementById(`redes${capitalizeFirstLetter(red)}`);
    if (!elemento) return;
    
    const toggleBtn = elemento.querySelector('.btn-toggle-red');
    const statusIndicator = document.getElementById(`status${capitalizeFirstLetter(red)}`);
    const statusText = document.getElementById(`statusText${capitalizeFirstLetter(red)}`);
    const input = document.getElementById(`input${capitalizeFirstLetter(red)}`);
    
    if (!toggleBtn || !statusIndicator || !statusText || !input) return;
    
    if (forzarEstado !== null) {
        // Forzar estado específico
        if (forzarEstado) {
            toggleBtn.classList.add('active');
            statusIndicator.style.backgroundColor = '#4caf50';
            statusText.textContent = 'Conectado';
            input.disabled = false;
        } else {
            toggleBtn.classList.remove('active');
            statusIndicator.style.backgroundColor = '#f44336';
            statusText.textContent = 'No conectado';
            input.disabled = true;
        }
    } else {
        // Alternar estado actual
        if (toggleBtn.classList.contains('active')) {
            toggleBtn.classList.remove('active');
            statusIndicator.style.backgroundColor = '#f44336';
            statusText.textContent = 'No conectado';
            input.disabled = true;
        } else {
            toggleBtn.classList.add('active');
            statusIndicator.style.backgroundColor = '#4caf50';
            statusText.textContent = 'Conectado';
            input.disabled = false;
            
            // Enfocar el input si está vacío
            if (!input.value.trim()) {
                input.focus();
            }
        }
    }
    
    // Actualizar estado visual
    actualizarEstadoRed(red, input.value);
}

// Función para actualizar el estado visual de una red social
function actualizarEstadoRed(red, url) {
    const elemento = document.getElementById(`redes${capitalizeFirstLetter(red)}`);
    if (!elemento) return;
    
    const toggleBtn = elemento.querySelector('.btn-toggle-red');
    const statusIndicator = document.getElementById(`status${capitalizeFirstLetter(red)}`);
    const statusText = document.getElementById(`statusText${capitalizeFirstLetter(red)}`);
    
    if (!toggleBtn || !statusIndicator || !statusText) return;
    
    if (toggleBtn.classList.contains('active')) {
        if (url && url.trim() !== '') {
            statusIndicator.style.backgroundColor = '#4caf50';
            statusText.textContent = 'Conectado';
        } else {
            statusIndicator.style.backgroundColor = '#ff9800';
            statusText.textContent = 'Sin URL';
        }
    }
}

// Función para limpiar todas las redes
function limpiarRedes() {
    Swal.fire({
        title: '¿Limpiar todas las redes?',
        text: 'Se eliminarán todas las URLs de redes sociales',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const redesSoportadas = [
                'facebook', 'instagram', 'twitter', 
                'tiktok', 'youtube', 'linkedin', 'github'
            ];
            
            redesSoportadas.forEach(nombreRed => {
                const input = document.getElementById(`input${capitalizeFirstLetter(nombreRed)}`);
                if (input) {
                    input.value = '';
                }
                toggleRedSocial(nombreRed, false);
            });
            
            mostrarAlertaRedes('success', 'Todas las redes sociales han sido limpiadas');
        }
    });
}

function mostrarAlertaRedes(tipo, mensaje) {
    // Usar las alertas existentes en la página o SweetAlert como fallback
    const alertSuccess = document.getElementById('alertSuccess');
    const alertError = document.getElementById('alertError');
    
    if (alertSuccess && alertError) {
        // Usar el sistema de alertas de configuracion.js
        if (typeof window.mostrarAlerta === 'function') {
            window.mostrarAlerta(tipo, mensaje);
        } else {
            // Fallback directo
            if (tipo === 'success') {
                alertSuccess.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
                alertSuccess.style.display = 'flex';
                alertError.style.display = 'none';
                setTimeout(() => {
                    alertSuccess.style.display = 'none';
                }, 5000);
            } else {
                alertError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
                alertError.style.display = 'flex';
                alertSuccess.style.display = 'none';
            }
        }
    } else {
        // Usar SweetAlert
        if (tipo === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: mensaje,
                timer: 3000
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje
            });
        }
    }
}

function capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

// Exportar funciones para uso global
window.initRedesSociales = initRedesSociales;