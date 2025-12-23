// Módulo de redes sociales
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de configuración
    if (!document.querySelector('.app-container')) return;
    
    // Inicializar cuando el DOM esté completamente cargado
    initRedesSociales();
});

async function initRedesSociales() {
    try {
        // Esperar a que el módulo de conexión esté listo
        if (!window.supabase) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('Error de autenticación:', authError);
            window.location.href = 'index.html';
            return;
        }
        
        // Verificar si existe la tabla redes_sociales, si no existe, crearla
        await verificarTablaRedesSociales();
        
        // Cargar redes sociales del usuario
        await cargarRedesSociales(user.id);
        
        // Configurar eventos del formulario
        configurarEventosFormularioRedes(user.id);
        
    } catch (error) {
        console.error('Error inicializando redes sociales:', error);
        mostrarAlerta('error', 'Error al cargar las redes sociales');
    }
}

async function verificarTablaRedesSociales() {
    try {
        // Intentar crear la tabla si no existe
        const { error } = await supabase.rpc('crear_tabla_redes_sociales');
        
        // Si el RPC no existe, intentar crear la tabla manualmente
        if (error && error.message.includes('function')) {
            console.log('Creando tabla redes_sociales...');
            // La creación de tablas normalmente se hace desde SQL en Supabase
            // Por ahora, solo continuamos
        }
    } catch (error) {
        console.log('Asumiendo que la tabla redes_sociales existe');
    }
}

async function cargarRedesSociales(userId) {
    try {
        // Obtener redes sociales del usuario
        const { data: redes, error } = await supabase
            .from('redes_sociales')
            .select('*')
            .eq('usuario_id', userId);
        
        if (error) {
            // Si la tabla no existe, usar datos vacíos
            console.log('Tabla redes_sociales no encontrada, usando valores por defecto');
            inicializarRedesPorDefecto();
            return;
        }
        
        // Mapear redes sociales por nombre
        const redesMap = {};
        redes.forEach(red => {
            redesMap[red.nombre_red] = red;
        });
        
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
                document.getElementById(`input${capitalizeFirstLetter(nombreRed)}`).value = red.url;
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
    
    if (!form) return;
    
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
            mostrarAlerta('success', 'Redes sociales guardadas correctamente');
            
        } catch (error) {
            console.error('Error guardando redes sociales:', error);
            mostrarAlerta('error', 'Error al guardar las redes sociales: ' + error.message);
        } finally {
            // Restaurar botón
            const submitBtn = form.querySelector('.btn-primary');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Redes';
            submitBtn.disabled = false;
        }
    });
}

async function guardarRedesSociales(userId) {
    const redesSoportadas = [
        'facebook', 'instagram', 'twitter', 
        'tiktok', 'youtube', 'linkedin', 'github'
    ];
    
    const operaciones = [];
    
    for (const nombreRed of redesSoportadas) {
        const input = document.getElementById(`input${capitalizeFirstLetter(nombreRed)}`);
        const url = input.value.trim();
        const activo = document.querySelector(`#redes${capitalizeFirstLetter(nombreRed)} .btn-toggle-red`).classList.contains('active');
        
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
            
            // Verificar si ya existe
            const { data: existe } = await supabase
                .from('redes_sociales')
                .select('id')
                .eq('usuario_id', userId)
                .eq('nombre_red', nombreRed)
                .single();
            
            if (existe) {
                // Actualizar
                const { error } = await supabase
                    .from('redes_sociales')
                    .update(redSocialData)
                    .eq('id', existe.id);
                
                if (error) throw error;
            } else {
                // Insertar
                redSocialData.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('redes_sociales')
                    .insert(redSocialData);
                
                if (error) throw error;
            }
        } else if (activo && !url) {
            // Desactivar si está activo pero sin URL
            const { data: existe } = await supabase
                .from('redes_sociales')
                .select('id')
                .eq('usuario_id', userId)
                .eq('nombre_red', nombreRed)
                .single();
            
            if (existe) {
                const { error } = await supabase
                    .from('redes_sociales')
                    .update({ activo: false })
                    .eq('id', existe.id);
                
                if (error) throw error;
            }
        } else {
            // Desactivar completamente
            const { data: existe } = await supabase
                .from('redes_sociales')
                .select('id')
                .eq('usuario_id', userId)
                .eq('nombre_red', nombreRed)
                .single();
            
            if (existe) {
                const { error } = await supabase
                    .from('redes_sociales')
                    .update({ activo: false })
                    .eq('id', existe.id);
                
                if (error) throw error;
            }
        }
    }
}

// Función para activar/desactivar una red social
function toggleRedSocial(red, forzarEstado = null) {
    const elemento = document.getElementById(`redes${capitalizeFirstLetter(red)}`);
    const toggleBtn = elemento.querySelector('.btn-toggle-red');
    const statusIndicator = document.getElementById(`status${capitalizeFirstLetter(red)}`);
    const statusText = document.getElementById(`statusText${capitalizeFirstLetter(red)}`);
    const input = document.getElementById(`input${capitalizeFirstLetter(red)}`);
    
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
    const toggleBtn = elemento.querySelector('.btn-toggle-red');
    const statusIndicator = document.getElementById(`status${capitalizeFirstLetter(red)}`);
    const statusText = document.getElementById(`statusText${capitalizeFirstLetter(red)}`);
    
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
                input.value = '';
                toggleRedSocial(nombreRed, false);
            });
            
            mostrarAlerta('success', 'Todas las redes sociales han sido limpiadas');
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}