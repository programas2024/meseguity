// modulos/autenticacion.js
const Autenticacion = {
    // ===============================
    // CONFIGURACIÓN
    // ===============================
    
    config: {
        paginaLogin: 'index.html',
        paginaPrincipal: 'principal.html',
        redireccionarAutomaticamente: true,
        tiempoEsperaRedireccion: 3000, // ms
        debug: true
    },

    // ===============================
    // FUNCIONES PRINCIPALES
    // ===============================

    async verificarSesion(redirigir = true) {
        try {
            Utilidades.debug('🔍 Verificando sesión...');
            
            if (!window.supabase || !window.supabase.auth) {
                Utilidades.debug('❌ Supabase no está disponible');
                if (redirigir && this.config.redireccionarAutomaticamente) {
                    this.redirigirALogin('Supabase no configurado');
                }
                return null;
            }
            
            // Obtener sesión actual
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
                Utilidades.debug('❌ Error al obtener sesión:', error);
                if (redirigir && this.config.redireccionarAutomaticamente) {
                    this.redirigirALogin('Error de autenticación');
                }
                return null;
            }
            
            if (!session) {
                Utilidades.debug('⚠️ No hay sesión activa');
                if (redirigir && this.config.redireccionarAutomaticamente) {
                    this.redirigirALogin('Sesión no encontrada');
                }
                return null;
            }
            
            Utilidades.debug('✅ Sesión válida encontrada:', session.user.email);
            
            // Verificar si el usuario está verificado
            if (session.user.email_confirmed_at === null && session.user.confirmed_at === null) {
                Utilidades.debug('⚠️ Email no verificado');
                
                if (!window.location.pathname.includes('verificar-email')) {
                    Utilidades.mostrarAlerta(
                        'Email no verificado',
                        'Por favor verifica tu email antes de continuar.',
                        'warning'
                    );
                }
            }
            
            return {
                user: session.user,
                session: session,
                isVerified: !!(session.user.email_confirmed_at || session.user.confirmed_at)
            };
            
        } catch (error) {
            Utilidades.debug('❌ Error en verificarSesion:', error);
            if (redirigir && this.config.redireccionarAutomaticamente) {
                this.redirigirALogin('Error inesperado');
            }
            return null;
        }
    },

    async cerrarSesion(redirigir = true) {
        try {
            Utilidades.debug('🚪 Cerrando sesión...');
            
            const alertaCierre = await Utilidades.mostrarConfirmacion(
                'Cerrar sesión',
                '¿Estás seguro de que quieres cerrar sesión?',
                'Sí, cerrar sesión',
                'Cancelar'
            );
            
            if (!alertaCierre.isConfirmed) {
                Utilidades.debug('❌ Cierre de sesión cancelado por el usuario');
                return false;
            }
            
            const loading = Utilidades.mostrarCargando('Cerrando sesión...');
            
            const { error } = await window.supabase.auth.signOut();
            
            loading.close();
            
            if (error) {
                Utilidades.debug('❌ Error al cerrar sesión:', error);
                throw error;
            }
            
            // Limpiar almacenamiento local
            Utilidades.eliminarDeLocalStorage('usuario_actual');
            Utilidades.eliminarDeLocalStorage('ultima_sesion');
            
            Utilidades.debug('✅ Sesión cerrada correctamente');
            
            Utilidades.mostrarAlerta(
                'Sesión cerrada',
                'Has cerrado sesión correctamente.',
                'success'
            );
            
            if (redirigir) {
                setTimeout(() => {
                    window.location.href = this.config.paginaLogin;
                }, 1500);
            }
            
            return true;
            
        } catch (error) {
            Utilidades.debug('❌ Error en cerrarSesion:', error);
            
            let mensajeError = 'No se pudo cerrar sesión';
            if (error.message?.includes('network')) {
                mensajeError = 'Error de conexión. Verifica tu internet.';
            }
            
            Utilidades.mostrarAlerta('Error', mensajeError, 'error');
            return false;
        }
    },

    async loginConGitHub() {
        try {
            Utilidades.debug('🔐 Iniciando login con GitHub...');
            
            const loading = Utilidades.mostrarCargando('Conectando con GitHub...');
            
            // URL de redirección
            const redirectUrl = window.location.origin + '/' + this.config.paginaPrincipal;
            Utilidades.debug('🔄 URL de redirección:', redirectUrl);
            
            const { error } = await window.supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: redirectUrl,
                    scopes: 'read:user user:email',
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
            
            loading.close();
            
            if (error) {
                Utilidades.debug('❌ Error en login con GitHub:', error);
                throw error;
            }
            
            Utilidades.debug('✅ Login con GitHub iniciado, redirigiendo...');
            
        } catch (error) {
            Utilidades.debug('❌ Error en loginConGitHub:', error);
            
            let mensajeError = error.message;
            let tituloError = 'Error de autenticación';
            
            if (error.message?.includes('provider is disabled')) {
                tituloError = 'GitHub no configurado';
                mensajeError = 'El login con GitHub no está habilitado. Contacta al administrador.';
            } else if (error.message?.includes('redirect_uri') || error.message?.includes('redirect')) {
                tituloError = 'Error de configuración';
                mensajeError = 'Error en la configuración de redirección. Verifica las URLs en Supabase.';
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                tituloError = 'Error de conexión';
                mensajeError = 'No se pudo conectar con GitHub. Verifica tu conexión a internet.';
            }
            
            Utilidades.mostrarAlerta(tituloError, mensajeError, 'error');
        }
    },

    async loginConEmail(email, password) {
        try {
            Utilidades.debug('📧 Iniciando login con email:', email);
            
            const loading = Utilidades.mostrarCargando('Iniciando sesión...');
            
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password
            });
            
            loading.close();
            
            if (error) {
                Utilidades.debug('❌ Error en login con email:', error);
                throw error;
            }
            
            Utilidades.debug('✅ Login exitoso:', data.user.email);
            
            // Guardar información de sesión
            Utilidades.guardarEnLocalStorage('ultima_sesion', {
                email: data.user.email,
                timestamp: new Date().toISOString()
            });
            
            return {
                success: true,
                user: data.user,
                session: data.session,
                requiresConfirmation: !data.user.email_confirmed_at
            };
            
        } catch (error) {
            Utilidades.debug('❌ Error en loginConEmail:', error);
            
            let mensajeError = 'Credenciales incorrectas';
            if (error.message?.includes('Invalid login credentials')) {
                mensajeError = 'Email o contraseña incorrectos';
            } else if (error.message?.includes('Email not confirmed')) {
                mensajeError = 'Confirma tu email antes de iniciar sesión';
            } else if (error.message?.includes('network')) {
                mensajeError = 'Error de conexión. Verifica tu internet.';
            }
            
            return {
                success: false,
                error: mensajeError,
                originalError: error
            };
        }
    },

    async registrarConEmail(usuarioData) {
    try {
        Utilidades.debug('📝 Registrando nuevo usuario:', usuarioData.email);
        
        const loading = Utilidades.mostrarCargando('Creando cuenta...');
        
        // 1. Registrar en Auth
        const { data: authData, error: authError } = await window.supabase.auth.signUp({
            email: usuarioData.email.trim().toLowerCase(),
            password: usuarioData.password,
            options: {
                data: {
                    nombre: usuarioData.nombre,
                    apellidos: usuarioData.apellidos
                }
            }
        });
        
        if (authError) {
            loading.close();
            throw authError;
        }
        
        const userId = authData.user.id;
        
        // 2. Crear perfil en usuarios CON LOS DATOS DEL FORMULARIO
        const nuevoUsuario = {
            id: userId,
            email: usuarioData.email,
            nombre: usuarioData.nombre,
            apellidos: usuarioData.apellidos,
            fecha_nacimiento: usuarioData.fecha_nacimiento,
            pais: usuarioData.pais,
            ciudad: usuarioData.ciudad,
            genero: usuarioData.genero,
            tipo_cuenta: usuarioData.tipo_cuenta,
            password_hash: '', // Para OAuth es vacío, para email/password podrías guardar hash
            confirmado: false, // Email no confirmado aún
            avatar_url: usuarioData.avatar_url || null,
            created_at: new Date().toISOString()
        };
        
        const { error: profileError } = await window.supabase
            .from('usuarios')
            .upsert([nuevoUsuario], {
                onConflict: 'id'
            });
        
        loading.close();
        
        if (profileError) {
            Utilidades.debug('⚠️ Error creando perfil:', profileError);
            // Aún así retornamos éxito porque el usuario se creó en Auth
        }
        
        // IMPORTANTE: NO llamar a verificarYRegistrarUsuario() aquí
        // porque ya creamos el perfil manualmente
        
        return {
            success: true,
            userId: userId,
            email: usuarioData.email,
            requiresConfirmation: true,
            message: 'Usuario registrado correctamente. Revisa tu email para confirmar.'
        };
        
    } catch (error) {
        Utilidades.debug('❌ Error en registrarConEmail:', error);
        
        let mensajeError = 'Error al registrar usuario';
        if (error.message?.includes('User already registered')) {
            mensajeError = 'Este email ya está registrado';
        } else if (error.message?.includes('password')) {
            mensajeError = 'La contraseña debe tener al menos 6 caracteres';
        } else if (error.message?.includes('network')) {
            mensajeError = 'Error de conexión. Verifica tu internet.';
        }
        
        return {
            success: false,
            error: mensajeError,
            originalError: error
        };
    }
},

    // ===============================
    // FUNCIONES AUXILIARES
    // ===============================

    async obtenerSesionActual() {
        try {
            Utilidades.debug('🔄 Obteniendo sesión actual...');
            
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
                Utilidades.debug('❌ Error al obtener sesión actual:', error);
                return null;
            }
            
            if (!session) {
                Utilidades.debug('ℹ️ No hay sesión activa');
                return null;
            }
            
            Utilidades.debug('✅ Sesión obtenida:', session.user.email);
            
            return {
                user: session.user,
                session: session,
                metadata: session.user.user_metadata || {}
            };
            
        } catch (error) {
            Utilidades.debug('❌ Error en obtenerSesionActual:', error);
            return null;
        }
    },

    async obtenerUsuarioActual() {
        try {
            const sessionData = await this.obtenerSesionActual();
            if (!sessionData) return null;
            
            // Intentar obtener de cache primero
            const usuarioCache = Utilidades.obtenerDeLocalStorage('usuario_actual');
            if (usuarioCache && usuarioCache.id === sessionData.user.id) {
                Utilidades.debug('✅ Usuario obtenido de cache');
                return usuarioCache;
            }
            
            // Obtener de la base de datos
            const { data: usuarioDB, error } = await window.supabase
                .from('usuarios')
                .select('*')
                .eq('id', sessionData.user.id)
                .single();
            
            if (error) {
                Utilidades.debug('⚠️ Error al obtener usuario de DB, usando datos de sesión:', error);
                return {
                    id: sessionData.user.id,
                    email: sessionData.user.email,
                    nombre: sessionData.metadata.nombre || 'Usuario',
                    apellidos: sessionData.metadata.apellidos || '',
                    avatar_url: sessionData.metadata.avatar_url || null
                };
            }
            
            // Guardar en cache
            Utilidades.guardarEnLocalStorage('usuario_actual', usuarioDB);
            Utilidades.debug('✅ Usuario obtenido de DB');
            
            return usuarioDB;
            
        } catch (error) {
            Utilidades.debug('❌ Error en obtenerUsuarioActual:', error);
            return null;
        }
    },

    async verificarYRegistrarUsuario() {
    try {
        Utilidades.debug('🔄 Verificando y registrando usuario...');
        
        // 1. Obtener sesión actual
        const sessionData = await this.obtenerSesionActual();
        if (!sessionData) {
            Utilidades.debug('⚠️ No hay sesión, no se puede verificar usuario');
            return null;
        }
        
        const user = sessionData.user;
        Utilidades.debug('👤 Usuario autenticado:', user.email);
        
        // 2. Verificar si existe en tabla usuarios
        const { data: usuarioExistente, error: errorVerificar } = await window.supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        
        if (errorVerificar) {
            Utilidades.debug('❌ Error al verificar usuario en DB:', errorVerificar);
            return null;
        }
        
        // 3. Si no existe, crearlo
        if (!usuarioExistente) {
            Utilidades.debug('🆕 Usuario no encontrado en DB, creando registro...');
            
            // Extraer datos del usuario
            const metadata = user.user_metadata || {};
            const nombreCompleto = metadata.full_name || metadata.name || 'Usuario GitHub';
            const partesNombre = nombreCompleto.split(' ');
            
            const nuevoUsuario = {
                id: user.id,
                email: user.email,
                nombre: partesNombre[0] || "Usuario",
                apellidos: partesNombre.slice(1).join(' ') || "GitHub",
                fecha_nacimiento: metadata.fecha_nacimiento || "2000-01-01",
                pais: metadata.pais || "Desconocido",
                ciudad: metadata.ciudad || "Desconocida",
                genero: metadata.genero || "otro",
                tipo_cuenta: metadata.tipo_cuenta || "personal",
                confirmado: true,
                avatar_url: metadata.avatar_url || metadata.picture || null,
                created_at: new Date().toISOString()
            };
            
            Utilidades.debug('📝 Creando usuario:', nuevoUsuario);
            
            // LISTA DE COLUMNAS que SÍ existen en tu tabla (basado en tu SQL)
            const columnasPermitidas = 'id, email, nombre, apellidos, fecha_nacimiento, pais, ciudad, genero, tipo_cuenta, confirmado, avatar_url, created_at';
            
            // PRIMER INTENTO: insert con columnas explícitas
            const { error: errorCrear } = await window.supabase
                .from('usuarios')
                .insert([nuevoUsuario], {
                    returning: 'minimal',
                    select: columnasPermitidas
                });
            
            if (errorCrear) {
                Utilidades.debug('❌ Error al crear usuario, intentando upsert:', errorCrear);
                
                // SEGUNDO INTENTO: upsert con columnas explícitas
                const { error: errorUpsert } = await window.supabase
                    .from('usuarios')
                    .upsert([nuevoUsuario], {
                        onConflict: 'id',
                        returning: 'minimal',
                        select: columnasPermitidas
                    });
                
                if (errorUpsert) {
                    Utilidades.debug('❌ Error en upsert:', errorUpsert);
                    return null;
                }
                
                Utilidades.debug('✅ Usuario creado con upsert');
                return nuevoUsuario;
            }
            
            Utilidades.debug('✅ Usuario creado exitosamente');
            return nuevoUsuario;
        }
        
        Utilidades.debug('✅ Usuario ya existe en DB:', usuarioExistente.nombre);
        
        // Actualizar cache
        Utilidades.guardarEnLocalStorage('usuario_actual', usuarioExistente);
        
        return usuarioExistente;
        
    } catch (error) {
        Utilidades.debug('❌ Error en verificarYRegistrarUsuario:', error);
        return null;
    }
},

    async actualizarPerfil(perfilData) {
        try {
            Utilidades.debug('🔄 Actualizando perfil...');
            
            const usuarioActual = await this.obtenerUsuarioActual();
            if (!usuarioActual) {
                throw new Error('No hay usuario autenticado');
            }
            
            const loading = Utilidades.mostrarCargando('Actualizando perfil...');
            
            // Actualizar en tabla usuarios
            const { error: errorPerfil } = await window.supabase
                .from('usuarios')
                .update({
                    ...perfilData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', usuarioActual.id);
            
            if (errorPerfil) {
                loading.close();
                throw errorPerfil;
            }
            
            // Actualizar metadata de auth si es necesario
            if (perfilData.nombre || perfilData.apellidos) {
                const { error: errorAuth } = await window.supabase.auth.updateUser({
                    data: {
                        nombre: perfilData.nombre || usuarioActual.nombre,
                        apellidos: perfilData.apellidos || usuarioActual.apellidos
                    }
                });
                
                if (errorAuth) {
                    Utilidades.debug('⚠️ Error actualizando metadata de auth:', errorAuth);
                }
            }
            
            loading.close();
            
            // Limpiar cache
            Utilidades.eliminarDeLocalStorage('usuario_actual');
            
            Utilidades.debug('✅ Perfil actualizado correctamente');
            
            return {
                success: true,
                message: 'Perfil actualizado correctamente'
            };
            
        } catch (error) {
            Utilidades.debug('❌ Error en actualizarPerfil:', error);
            
            return {
                success: false,
                error: 'Error al actualizar perfil'
            };
        }
    },

    // ===============================
    // MANEJO DE SESIONES
    // ===============================

    suscribirCambiosSesion() {
        try {
            Utilidades.debug('🔔 Suscribiendo a cambios de sesión...');
            
            if (!window.supabase || !window.supabase.auth) {
                Utilidades.debug('❌ Supabase no disponible para suscripción');
                return;
            }
            
            const { data: { subscription } } = window.supabase.auth.onAuthStateChange(
                async (event, session) => {
                    Utilidades.debug(`🔄 Evento de autenticación: ${event}`);
                    
                    switch (event) {
                        case 'SIGNED_IN':
                            Utilidades.debug('✅ Usuario inició sesión:', session?.user?.email);
                            
                            // Registrar/verificar usuario en DB
                            await this.verificarYRegistrarUsuario();
                            
                            // Guardar última sesión
                            Utilidades.guardarEnLocalStorage('ultima_sesion', {
                                email: session.user.email,
                                timestamp: new Date().toISOString(),
                                event: 'SIGNED_IN'
                            });
                            
                            break;
                            
                        case 'SIGNED_OUT':
                            Utilidades.debug('🚪 Usuario cerró sesión');
                            
                            // Limpiar cache
                            Utilidades.eliminarDeLocalStorage('usuario_actual');
                            
                            // Redirigir si estamos en página protegida
                            const paginaActual = window.location.pathname;
                            const paginasProtegidas = ['principal', 'perfil', 'configuracion'];
                            
                            if (paginasProtegidas.some(pagina => paginaActual.includes(pagina))) {
                                setTimeout(() => {
                                    window.location.href = this.config.paginaLogin;
                                }, 1000);
                            }
                            
                            break;
                            
                        case 'TOKEN_REFRESHED':
                            Utilidades.debug('🔄 Token refrescado');
                            break;
                            
                        case 'USER_UPDATED':
                            Utilidades.debug('👤 Usuario actualizado');
                            // Limpiar cache para forzar recarga
                            Utilidades.eliminarDeLocalStorage('usuario_actual');
                            break;
                            
                        case 'PASSWORD_RECOVERY':
                            Utilidades.debug('🔑 Recuperación de contraseña iniciada');
                            break;
                    }
                }
            );
            
            // Guardar referencia para poder cancelar
            this._authSubscription = subscription;
            
            Utilidades.debug('✅ Suscripción a cambios de sesión activada');
            
        } catch (error) {
            Utilidades.debug('❌ Error en suscribirCambiosSesion:', error);
        }
    },

    cancelarSuscripcionSesion() {
        if (this._authSubscription) {
            this._authSubscription.unsubscribe();
            Utilidades.debug('🔕 Suscripción a cambios de sesión cancelada');
        }
    },

    // ===============================
    // UTILIDADES
    // ===============================

    redirigirALogin(motivo = '') {
        Utilidades.debug(`🔀 Redirigiendo a login. Motivo: ${motivo}`);
        
        if (motivo && !window.location.pathname.includes(this.config.paginaLogin)) {
            Utilidades.mostrarAlerta(
                'Sesión expirada',
                motivo + '. Serás redirigido al login.',
                'warning'
            );
        }
        
        setTimeout(() => {
            window.location.href = this.config.paginaLogin;
        }, this.config.tiempoEsperaRedireccion);
    },

    estaAutenticado() {
        return new Promise(async (resolve) => {
            const session = await this.verificarSesion(false);
            resolve(!!session);
        });
    },

    getUsuarioId() {
        return new Promise(async (resolve) => {
            const session = await this.obtenerSesionActual();
            resolve(session?.user?.id || null);
        });
    },

    // ===============================
    // INICIALIZACIÓN
    // ===============================

    inicializar(config = {}) {
        try {
            // Combinar configuraciones
            this.config = { ...this.config, ...config };
            
            Utilidades.debug('🚀 Inicializando módulo de autenticación...');
            
            // Verificar dependencias
            if (!window.supabase) {
                console.error('❌ ERROR: Supabase no está definido globalmente');
                Utilidades.mostrarErrorConexion();
                return false;
            }
            
            if (!window.Utilidades) {
                console.error('❌ ERROR: Módulo Utilidades no cargado');
                return false;
            }
            
            // Configurar Supabase para persistencia de sesión
            window.supabase.auth.onAuthStateChange((event, session) => {
                if (session) {
                    // La sesión se persiste automáticamente
                    Utilidades.debug('🔐 Sesión persistida');
                }
            });
            
            // Iniciar suscripción
            this.suscribirCambiosSesion();
            
            Utilidades.debug('✅ Módulo de autenticación inicializado correctamente');
            return true;
            
        } catch (error) {
            Utilidades.debug('❌ Error inicializando autenticación:', error);
            return false;
        }
    }
};

// Inicialización automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Pequeño delay para asegurar que supabase esté listo
        setTimeout(() => {
            if (window.Autenticacion) {
                window.Autenticacion.inicializar();
            }
        }, 500);
    });
} else {
    setTimeout(() => {
        if (window.Autenticacion) {
            window.Autenticacion.inicializar();
        }
    }, 500);
}

// Hacer disponible globalmente
window.Autenticacion = Autenticacion;

// Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Autenticacion;
}