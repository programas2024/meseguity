// Módulo de configuración de perfil
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM cargado, iniciando configuración...');
    
    // Verificar si estamos en la página de configuración
    if (!document.querySelector('.app-container')) {
        console.log('No es la página de configuración');
        return;
    }
    
    // Inicializar configuración con verificación mejorada
    await initConfiguracionMejorado();
});

async function initConfiguracionMejorado() {
    try {
        console.log('=== INICIALIZANDO CONFIGURACIÓN ===');
        
        // Verificar que Supabase JS esté cargado
        if (typeof supabase === 'undefined' && typeof window.supabase === 'undefined') {
            console.error('Supabase JS no está cargado');
            await cargarSupabaseManual();
        }
        
        // Usar supabase globalmente disponible
        const supabaseClient = window.supabase || supabase;
        
        if (!supabaseClient) {
            throw new Error('No se pudo obtener el cliente Supabase');
        }
        
        console.log('Cliente Supabase obtenido:', supabaseClient);
        
        // Verificar métodos disponibles
        if (!supabaseClient.auth) {
            console.warn('Módulo auth no disponible directamente, verificando estructura...');
            
            // Intentar diferentes formas de acceder al auth
            if (supabaseClient.client && supabaseClient.client.auth) {
                console.log('Auth encontrado en supabase.client.auth');
                window.supabase = supabaseClient.client;
            } else if (supabaseClient.default && supabaseClient.default.auth) {
                console.log('Auth encontrado en supabase.default.auth');
                window.supabase = supabaseClient.default;
            } else {
                // Intentar crear un cliente nuevo
                await crearClienteSupabase();
                return initConfiguracionMejorado();
            }
        }
        
        // Ahora window.supabase debería estar correcto
        console.log('Verificando autenticación...');
        
        // Intentar obtener usuario
        let user = null;
        let authError = null;
        
        try {
            const { data: authData, error } = await window.supabase.auth.getUser();
            user = authData?.user;
            authError = error;
        } catch (e) {
            console.error('Excepción al obtener usuario:', e);
            authError = e;
        }
        
        if (authError) {
            console.error('Error de autenticación:', authError);
            
            // Verificar si es un error de JWT (sesión expirada)
            if (authError.message && (
                authError.message.includes('JWT') || 
                authError.message.includes('token') ||
                authError.message.includes('session')
            )) {
                console.log('Sesión expirada, redirigiendo a login');
                window.location.href = 'index.html';
                return;
            }
            
            // Intentar obtener sesión actual
            try {
                const { data: sessionData } = await window.supabase.auth.getSession();
                if (sessionData?.session?.user) {
                    user = sessionData.session.user;
                    console.log('Usuario obtenido de sesión:', user.email);
                }
            } catch (sessionError) {
                console.error('Error obteniendo sesión:', sessionError);
            }
        }
        
        if (!user) {
            console.error('Usuario no autenticado');
            
            // Verificar si hay sesión almacenada localmente
            const sessionToken = localStorage.getItem('supabase.auth.token');
            if (sessionToken) {
                console.log('Token encontrado en localStorage, intentando restaurar sesión');
                try {
                    await window.supabase.auth.refreshSession();
                    // Volver a intentar
                    return initConfiguracionMejorado();
                } catch (refreshError) {
                    console.error('Error refrescando sesión:', refreshError);
                }
            }
            
            // Redirigir a login después de breve espera
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
            mostrarAlerta('error', 'Sesión no válida. Redirigiendo al login...');
            return;
        }
        
        console.log('Usuario autenticado:', user.email, 'ID:', user.id);
        
        // Cargar datos del usuario
        await cargarDatosUsuario(user);
        
        // Configurar eventos del formulario
        configurarEventosFormulario(user);
        
        // Configurar eventos de los botones
        configurarEventosBotones(user);
        
        // Configurar función global para cambiar secciones
        window.mostrarSeccion = mostrarSeccion;
        
        // Mostrar la sección de perfil por defecto
        mostrarSeccion('perfil');
        
        console.log('=== CONFIGURACIÓN INICIALIZADA CORRECTAMENTE ===');
        
    } catch (error) {
        console.error('Error crítico en inicialización:', error);
        mostrarErrorConexion(error);
    }
}

async function cargarSupabaseManual() {
    console.log('Intentando cargar Supabase manualmente...');
    
    // Verificar si ya está cargado desde CDN
    if (typeof window.createClient !== 'undefined') {
        console.log('Función createClient disponible');
        return;
    }
    
    // Verificar si el script de Supabase está cargado
    const supabaseScript = document.querySelector('script[src*="supabase-js"]');
    if (!supabaseScript) {
        console.error('Script de Supabase no encontrado en la página');
        
        // Crear elemento para mostrar error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f44336;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <strong>Error de carga:</strong> No se pudo cargar la biblioteca de Supabase.
            <button onclick="window.location.reload()" style="margin-left: 20px; padding: 5px 15px; background: white; color: #f44336; border: none; border-radius: 3px; cursor: pointer;">
                Recargar
            </button>
        `;
        document.body.appendChild(errorDiv);
        
        throw new Error('Biblioteca Supabase no cargada');
    }
    
    // Esperar a que se cargue el script
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (typeof window.supabase !== 'undefined' || typeof supabase !== 'undefined') {
                clearInterval(checkInterval);
                console.log('Supabase cargado después de espera');
                resolve();
            }
        }, 100);
        
        // Timeout después de 5 segundos
        setTimeout(() => {
            clearInterval(checkInterval);
            console.error('Timeout esperando carga de Supabase');
            resolve();
        }, 5000);
    });
}

async function crearClienteSupabase() {
    console.log('Creando nuevo cliente Supabase...');
    
    try {
        // Intentar obtener las credenciales de algún lugar
        let supabaseUrl = '';
        let supabaseKey = '';
        
        // Buscar en variables globales
        if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
            supabaseUrl = window.SUPABASE_URL;
            supabaseKey = window.SUPABASE_ANON_KEY;
        } 
        // Buscar en meta tags
        else if (document.querySelector('meta[name="supabase-url"]')) {
            supabaseUrl = document.querySelector('meta[name="supabase-url"]').content;
            supabaseKey = document.querySelector('meta[name="supabase-key"]').content;
        }
        // Buscar en data attributes
        else if (document.body.dataset.supabaseUrl) {
            supabaseUrl = document.body.dataset.supabaseUrl;
            supabaseKey = document.body.dataset.supabaseKey;
        }
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('No se encontraron credenciales de Supabase');
            throw new Error('Credenciales de Supabase no configuradas');
        }
        
        console.log('Credenciales encontradas, creando cliente...');
        
        // Crear cliente usando la función global si existe
        if (typeof window.createClient === 'function') {
            window.supabase = window.createClient(supabaseUrl, supabaseKey);
            console.log('Cliente creado con createClient');
        } 
        // Usar supabase.createClient si está disponible
        else if (typeof supabase !== 'undefined' && supabase.createClient) {
            window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
            console.log('Cliente creado con supabase.createClient');
        }
        // Usar @supabase/supabase-js v2
        else if (typeof window.supabase !== 'undefined') {
            // Ya debería estar disponible
            console.log('Cliente Supabase ya disponible');
        }
        else {
            throw new Error('No se pudo crear el cliente Supabase');
        }
        
    } catch (error) {
        console.error('Error creando cliente Supabase:', error);
        throw error;
    }
}

async function cargarDatosUsuario(user) {
    try {
        console.log('Cargando datos del usuario desde Supabase...');
        
        // Obtener datos del usuario desde la tabla public.usuarios
        const { data: usuario, error } = await window.supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (error) {
            console.error('Error cargando datos del usuario:', error);
            
            // Si el usuario no existe en la tabla, crearlo
            if (error.code === 'PGRST116') {
                console.log('Usuario no existe en tabla, creando...');
                await crearUsuarioEnTabla(user);
                // Recargar datos
                return cargarDatosUsuario(user);
            }
            
            // Si es otro error, usar datos básicos del usuario de auth
            console.log('Usando datos básicos de auth');
            usarDatosBasicos(user);
            return;
        }
        
        console.log('Datos de usuario cargados:', usuario);
        
        // Llenar información básica
        const userNameElement = document.getElementById('configUserName');
        const userEmailElement = document.getElementById('configUserEmail');
        
        if (userNameElement) {
            userNameElement.textContent = 
                usuario.nombre && usuario.apellidos 
                    ? `${usuario.nombre} ${usuario.apellidos}`
                    : usuario.email || user.email;
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = usuario.email || user.email;
        }
        
        // Llenar formulario
        const elementos = {
            'configNombre': usuario.nombre || '',
            'configApellidos': usuario.apellidos || '',
            'configEmail': usuario.email || user.email || '',
            'configTelefono': usuario.telefono || '',
            'configFechaNacimiento': usuario.fecha_nacimiento ? 
                new Date(usuario.fecha_nacimiento).toISOString().split('T')[0] : '',
            'configGenero': usuario.genero || '',
            'configPais': usuario.pais || '',
            'configCiudad': usuario.ciudad || '',
            'configTipoCuenta': usuario.tipo_cuenta || 'personal',
            'configBiografia': usuario.biografia || ''
        };
        
        Object.keys(elementos).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.value = elementos[id];
                }
            }
        });
        
        // Checkboxes
        const checkboxes = {
            'configRecibirNotificaciones': usuario.recibir_notificaciones !== false,
            'configMostrarEnLinea': usuario.mostrar_en_linea !== false,
            'configPerfilPublico': usuario.perfil_publico === true
        };
        
        Object.keys(checkboxes).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.checked = checkboxes[id];
            }
        });
        
        // Cargar estadísticas
        await cargarEstadisticas(user.id);
        
        // Configurar avatar si existe
        if (usuario.avatar_url) {
            configurarAvatar(usuario.avatar_url);
        }
        
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        // Usar datos básicos como fallback
        usarDatosBasicos(user);
        mostrarAlerta('error', 'Error al cargar los datos del perfil. Usando información básica.');
    }
}

function usarDatosBasicos(user) {
    try {
        console.log('Usando datos básicos del usuario');
        
        // Llenar información básica
        const userNameElement = document.getElementById('configUserName');
        const userEmailElement = document.getElementById('configUserEmail');
        
        if (userNameElement) {
            userNameElement.textContent = user.email;
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
        
        // Llenar email en formulario
        const emailElement = document.getElementById('configEmail');
        if (emailElement) {
            emailElement.value = user.email;
        }
        
        // Establecer valores por defecto para estadísticas
        ['statMensajes', 'statAmigos', 'statGrupos'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '0';
            }
        });
        
    } catch (error) {
        console.error('Error usando datos básicos:', error);
    }
}

async function crearUsuarioEnTabla(user) {
    try {
        const nuevoUsuario = {
            id: user.id,
            email: user.email,
            nombre: user.user_metadata?.name || '',
            apellidos: user.user_metadata?.last_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { error } = await window.supabase
            .from('usuarios')
            .insert(nuevoUsuario);
        
        if (error) throw error;
        
        console.log('Usuario creado en tabla public.usuarios');
        
    } catch (error) {
        console.error('Error creando usuario en tabla:', error);
        throw error;
    }
}

async function cargarEstadisticas(userId) {
    try {
        console.log('Cargando estadísticas...');
        
        // Contar mensajes del usuario
        try {
            const { count: mensajesCount, error: mensajesError } = await window.supabase
                .from('mensajes')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', userId);
            
            if (!mensajesError) {
                const element = document.getElementById('statMensajes');
                if (element) {
                    element.textContent = mensajesCount || 0;
                }
            }
        } catch (e) {
            console.log('Tabla mensajes no encontrada, usando valor por defecto');
            const element = document.getElementById('statMensajes');
            if (element) {
                element.textContent = '0';
            }
        }
        
        // Contar amigos (asumiendo una tabla de amigos)
        try {
            const { count: amigosCount, error: amigosError } = await window.supabase
                .from('amistades')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', userId)
                .eq('estado', 'aceptado');
            
            if (!amigosError) {
                const element = document.getElementById('statAmigos');
                if (element) {
                    element.textContent = amigosCount || 0;
                }
            }
        } catch (e) {
            console.log('Tabla amigos no encontrada, usando valor por defecto');
            const element = document.getElementById('statAmigos');
            if (element) {
                element.textContent = '0';
            }
        }
        
        // Contar grupos (asumiendo una tabla de miembros_grupo)
        try {
            const { count: gruposCount, error: gruposError } = await window.supabase
                .from('miembros_grupo')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', userId);
            
            if (!gruposError) {
                const element = document.getElementById('statGrupos');
                if (element) {
                    element.textContent = gruposCount || 0;
                }
            }
        } catch (e) {
            console.log('Tabla miembros_grupo no encontrada, usando valor por defecto');
            const element = document.getElementById('statGrupos');
            if (element) {
                element.textContent = '0';
            }
        }
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mantener valores por defecto
        ['statMensajes', 'statAmigos', 'statGrupos'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '0';
            }
        });
    }
}

function configurarAvatar(avatarUrl) {
    const avatarElement = document.getElementById('configAvatar');
    if (!avatarElement) return;
    
    avatarElement.innerHTML = '';
    
    if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Avatar del usuario';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        avatarElement.appendChild(img);
    } else {
        const icon = document.createElement('i');
        icon.className = 'fas fa-user-circle';
        icon.style.fontSize = '100%';
        avatarElement.appendChild(icon);
    }
    
    // Agregar botón de cambio
    const changeBtn = document.createElement('button');
    changeBtn.className = 'btn-change-avatar';
    changeBtn.id = 'btnChangeAvatar';
    changeBtn.innerHTML = '<i class="fas fa-camera"></i>';
    changeBtn.onclick = cambiarAvatar;
    avatarElement.appendChild(changeBtn);
}

function configurarEventosFormulario(user) {
    const form = document.getElementById('formConfiguracion');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Mostrar estado de carga
            const submitBtn = form.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;
            
            // Preparar datos para actualizar
            const datosActualizados = {
                nombre: document.getElementById('configNombre')?.value.trim() || '',
                apellidos: document.getElementById('configApellidos')?.value.trim() || '',
                telefono: document.getElementById('configTelefono')?.value.trim() || null,
                fecha_nacimiento: document.getElementById('configFechaNacimiento')?.value || null,
                genero: document.getElementById('configGenero')?.value || null,
                pais: document.getElementById('configPais')?.value.trim() || null,
                ciudad: document.getElementById('configCiudad')?.value.trim() || null,
                tipo_cuenta: document.getElementById('configTipoCuenta')?.value || 'personal',
                biografia: document.getElementById('configBiografia')?.value.trim() || null,
                recibir_notificaciones: document.getElementById('configRecibirNotificaciones')?.checked || true,
                mostrar_en_linea: document.getElementById('configMostrarEnLinea')?.checked || true,
                perfil_publico: document.getElementById('configPerfilPublico')?.checked || false,
                updated_at: new Date().toISOString()
            };
            
            // Validaciones básicas
            if (!datosActualizados.nombre || !datosActualizados.apellidos) {
                throw new Error('Nombre y apellidos son obligatorios');
            }
            
            // Actualizar en Supabase
            const { error } = await window.supabase
                .from('usuarios')
                .update(datosActualizados)
                .eq('id', user.id);
            
            if (error) throw error;
            
            // Actualizar nombre en la interfaz
            const userNameElement = document.getElementById('configUserName');
            if (userNameElement) {
                userNameElement.textContent = 
                    `${datosActualizados.nombre} ${datosActualizados.apellidos}`;
            }
            
            // Mostrar mensaje de éxito
            mostrarAlerta('success', 'Perfil actualizado correctamente');
            
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            mostrarAlerta('error', 'Error al guardar los cambios: ' + error.message);
        } finally {
            // Restaurar botón
            const submitBtn = form.querySelector('.btn-primary');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
                submitBtn.disabled = false;
            }
        }
    });
}

function configurarEventosBotones(user) {
    // Botón de eliminar cuenta
    const btnEliminar = document.getElementById('btnEliminarCuenta');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', function() {
            confirmarEliminarCuenta(user);
        });
    }
    
    // Botón de cambio de avatar (se crea dinámicamente)
    
    // Botones de ayuda y soporte
    const btnAyuda = document.getElementById('btnAyuda');
    if (btnAyuda) {
        btnAyuda.addEventListener('click', function() {
            window.open('ayuda.html', '_blank');
        });
    }
    
    const btnSoporte = document.getElementById('btnSoporte');
    if (btnSoporte) {
        btnSoporte.addEventListener('click', function() {
            window.open('mailto:soporte@messery.com', '_blank');
        });
    }
    
    // Botón de cerrar sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async function() {
            try {
                const { error } = await window.supabase.auth.signOut();
                if (error) throw error;
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error cerrando sesión:', error);
                mostrarAlerta('error', 'Error al cerrar sesión');
            }
        });
    }
    
    // Botón de eliminar cuenta en sección seguridad
    const btnEliminarSeguridad = document.getElementById('btnEliminarCuentaSeguridad');
    if (btnEliminarSeguridad) {
        btnEliminarSeguridad.addEventListener('click', function() {
            confirmarEliminarCuenta(user);
        });
    }
}

async function cambiarAvatar() {
    try {
        const { data: { user } } = await window.supabase.auth.getUser();
        
        Swal.fire({
            title: 'Cambiar Avatar',
            html: `
                <div style="text-align: center;">
                    <p>Selecciona una opción para tu avatar:</p>
                    <button id="btnUploadAvatar" class="btn-primary" style="margin: 5px; padding: 10px 20px;">
                        <i class="fas fa-upload"></i> Subir Imagen
                    </button>
                    <button id="btnSelectDefault" class="btn-secondary" style="margin: 5px; padding: 10px 20px;">
                        <i class="fas fa-user-circle"></i> Avatar por defecto
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            didOpen: () => {
                document.getElementById('btnUploadAvatar').onclick = () => {
                    Swal.close();
                    subirImagenAvatar(user);
                };
                document.getElementById('btnSelectDefault').onclick = () => {
                    Swal.close();
                    seleccionarAvatarPorDefecto(user);
                };
            }
        });
        
    } catch (error) {
        console.error('Error cambiando avatar:', error);
        mostrarAlerta('error', 'Error al cambiar el avatar');
    }
}

async function subirImagenAvatar(user) {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                mostrarAlerta('error', 'La imagen debe ser menor a 5MB');
                return;
            }
            
            Swal.fire({
                title: 'Subiendo imagen...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            try {
                // Crear nombre único para el archivo
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;
                
                // Subir a Supabase Storage
                const { error: uploadError } = await window.supabase.storage
                    .from('usuarios')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });
                
                if (uploadError) throw uploadError;
                
                // Obtener URL pública
                const { data: { publicUrl } } = window.supabase.storage
                    .from('usuarios')
                    .getPublicUrl(filePath);
                
                // Actualizar en la base de datos
                const { error: updateError } = await window.supabase
                    .from('usuarios')
                    .update({ avatar_url: publicUrl })
                    .eq('id', user.id);
                
                if (updateError) throw updateError;
                
                Swal.close();
                
                // Actualizar visualmente
                configurarAvatar(publicUrl);
                
                mostrarAlerta('success', 'Avatar actualizado correctamente');
                
            } catch (error) {
                Swal.close();
                console.error('Error subiendo imagen:', error);
                mostrarAlerta('error', 'Error al subir la imagen: ' + error.message);
            }
        };
        
        input.click();
        
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        mostrarAlerta('error', 'Error al subir la imagen');
    }
}

async function seleccionarAvatarPorDefecto(user) {
    try {
        Swal.fire({
            title: '¿Eliminar avatar personalizado?',
            text: 'Se restaurará el avatar por defecto',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await window.supabase
                    .from('usuarios')
                    .update({ avatar_url: null })
                    .eq('id', user.id);
                
                if (error) throw error;
                
                configurarAvatar(null);
                mostrarAlerta('success', 'Avatar restaurado al valor por defecto');
            }
        });
        
    } catch (error) {
        console.error('Error eliminando avatar:', error);
        mostrarAlerta('error', 'Error al restaurar avatar');
    }
}

async function confirmarEliminarCuenta(user) {
    Swal.fire({
        title: '¿Eliminar cuenta?',
        html: `
            <div style="text-align: left;">
                <p><strong>Esta acción es irreversible</strong></p>
                <p>Se eliminarán permanentemente:</p>
                <ul>
                    <li>Todos tus datos personales</li>
                    <li>Tus mensajes y conversaciones</li>
                    <li>Tus amigos y grupos</li>
                    <li>Toda tu actividad</li>
                </ul>
                <p>Escribe <strong>ELIMINAR</strong> para confirmar:</p>
                <input type="text" id="confirmText" class="swal2-input" placeholder="ELIMINAR">
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar mi cuenta',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const confirmText = document.getElementById('confirmText');
            if (!confirmText || confirmText.value !== 'ELIMINAR') {
                Swal.showValidationMessage('Debes escribir ELIMINAR para confirmar');
                return false;
            }
            return true;
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Eliminando cuenta...',
                    text: 'Por favor espera',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Eliminar usuario (esto también eliminará en auth.users debido al cascade)
                const { error } = await window.supabase
                    .from('usuarios')
                    .delete()
                    .eq('id', user.id);
                
                if (error) throw error;
                
                // Cerrar sesión
                await window.supabase.auth.signOut();
                
                Swal.close();
                
                Swal.fire({
                    title: 'Cuenta eliminada',
                    text: 'Tu cuenta ha sido eliminada permanentemente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.href = 'index.html';
                });
                
            } catch (error) {
                Swal.close();
                console.error('Error eliminando cuenta:', error);
                mostrarAlerta('error', 'Error al eliminar la cuenta');
            }
        }
    });
}

function mostrarAlerta(tipo, mensaje) {
    const alertSuccess = document.getElementById('alertSuccess');
    const alertError = document.getElementById('alertError');
    
    // Verificar que los elementos existen
    if (!alertSuccess || !alertError) {
        console.log('Elementos de alerta no encontrados');
        // Mostrar alerta alternativa
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
        return;
    }
    
    if (tipo === 'success') {
        // Buscar el span dentro de la alerta
        const successSpan = alertSuccess.querySelector('span');
        if (successSpan) {
            successSpan.textContent = mensaje;
        } else {
            // Si no hay span, poner el texto directamente
            alertSuccess.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
        }
        alertSuccess.style.display = 'flex';
        alertError.style.display = 'none';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            alertSuccess.style.display = 'none';
        }, 5000);
    } else {
        // Buscar el span dentro de la alerta
        const errorSpan = alertError.querySelector('span');
        if (errorSpan) {
            errorSpan.textContent = mensaje;
        } else {
            // Si no hay span, poner el texto directamente
            alertError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        }
        alertError.style.display = 'flex';
        alertSuccess.style.display = 'none';
    }
}

function mostrarErrorConexion(error) {
    console.error('Mostrando error de conexión:', error);
    
    Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        html: `
            <div style="text-align: left; max-height: 300px; overflow-y: auto;">
                <p><strong>No se pudo conectar con el servidor:</strong></p>
                <p style="color: #666; font-size: 14px;">${error.message || 'Error desconocido'}</p>
                
                <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                    <p style="margin: 0 0 10px 0;"><strong>Posibles soluciones:</strong></p>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li>Verifica tu conexión a internet</li>
                        <li>Recarga la página</li>
                        <li>Limpia la caché del navegador</li>
                        <li>Verifica que las credenciales de Supabase sean correctas</li>
                    </ol>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button id="btnRecargarPagina" class="btn-primary" style="padding: 8px 16px;">
                        <i class="fas fa-sync-alt"></i> Recargar Página
                    </button>
                    <button id="btnVerConsola" class="btn-secondary" style="padding: 8px 16px;">
                        <i class="fas fa-terminal"></i> Ver Consola
                    </button>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: 500,
        didOpen: () => {
            document.getElementById('btnRecargarPagina').onclick = () => {
                window.location.reload();
            };
            
            document.getElementById('btnVerConsola').onclick = () => {
                // Abrir herramientas de desarrollador (no funciona en todos los navegadores)
                console.log('Por favor abre la consola del navegador (F12)');
                Swal.fire({
                    icon: 'info',
                    title: 'Consola del Navegador',
                    text: 'Presiona F12 para abrir las herramientas de desarrollador y ver los errores detallados.',
                    confirmButtonText: 'Entendido'
                });
            };
        }
    });
}

// Función para cambiar entre secciones
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.config-content').forEach(div => {
        div.classList.remove('active');
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const seccionId = `seccion${capitalizeFirstLetter(seccion)}`;
    const seccionElement = document.getElementById(seccionId);
    if (seccionElement) {
        seccionElement.classList.add('active');
    }
    
    // Activar botón correspondiente
    const botonId = `btn${capitalizeFirstLetter(seccion)}`;
    const botonElement = document.getElementById(botonId);
    if (botonElement) {
        botonElement.classList.add('active');
    }
    
    // Actualizar título
    const titulos = {
        perfil: 'Configuración de Perfil',
        redes: 'Redes Sociales',
        seguridad: 'Seguridad'
    };
    const tituloElement = document.getElementById('tituloPagina');
    if (tituloElement) {
        tituloElement.textContent = titulos[seccion] || 'Configuración';
    }
    
    // Si es la sección de redes, inicializar esa sección
    if (seccion === 'redes' && typeof window.initRedesSociales === 'function') {
        setTimeout(() => {
            window.initRedesSociales();
        }, 100);
    }
}

function capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

// Función para depuración - verifica el estado de Supabase
window.verificarSupabase = function() {
    console.log('=== VERIFICACIÓN DE SUPABASE ===');
    console.log('1. window.supabase:', window.supabase ? '✅ Disponible' : '❌ No disponible');
    
    if (window.supabase) {
        console.log('2. Tipo:', typeof window.supabase);
        console.log('3. Propiedades:', Object.keys(window.supabase));
        
        // Verificar auth
        console.log('4. window.supabase.auth:', window.supabase.auth ? '✅ Disponible' : '❌ No disponible');
        
        if (window.supabase.auth) {
            console.log('5. Métodos de auth:', Object.keys(window.supabase.auth));
        }
        
        // Verificar otras propiedades importantes
        console.log('6. window.supabase.from:', window.supabase.from ? '✅ Disponible' : '❌ No disponible');
        console.log('7. window.supabase.storage:', window.supabase.storage ? '✅ Disponible' : '❌ No disponible');
    }
    
    console.log('8. Variable global supabase:', typeof supabase !== 'undefined' ? '✅ Disponible' : '❌ No disponible');
    
    // Verificar credenciales en localStorage
    const supabaseUrl = localStorage.getItem('supabaseUrl');
    const supabaseKey = localStorage.getItem('supabaseKey');
    console.log('9. Credenciales en localStorage:', supabaseUrl ? '✅ URL encontrada' : '❌ No URL', supabaseKey ? '✅ Key encontrada' : '❌ No key');
    
    console.log('=== FIN DE VERIFICACIÓN ===');
};

// También actualiza el archivo redes-sociales.js para usar la misma lógica
if (typeof window !== 'undefined') {
    window.initRedesSocialesMejorado = async function() {
        try {
            // Usar la misma lógica de inicialización
            await initConfiguracionMejorado();
        } catch (error) {
            console.error('Error inicializando redes sociales:', error);
        }
    };
}