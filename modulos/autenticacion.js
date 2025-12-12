// modulos/autenticacion.js
const Autenticacion = {
    async verificarSesion() {
        try {
            console.log("🔍 Verificando sesión...");
            
            // Obtener sesión actual
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Error al obtener sesión:', error);
                window.location.href = 'index.html';
                return null;
            }
            
            if (!session) {
                console.log('⚠️ No hay sesión activa');
                window.location.href = 'index.html';
                return null;
            }
            
            console.log("✅ Sesión válida encontrada:", session.user.email);
            return session.user;
            
        } catch (error) {
            console.error('❌ Error al verificar sesión:', error);
            window.location.href = 'index.html';
            return null;
        }
    },

    async cerrarSesion() {
        try {
            console.log("🚪 Cerrando sesión...");
            
            const { error } = await window.supabase.auth.signOut();
            
            if (error) {
                console.error('❌ Error al cerrar sesión:', error);
                throw error;
            }
            
            console.log("✅ Sesión cerrada correctamente");
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('❌ Error en cerrarSesion:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cerrar sesión', 'error');
        }
    },

    async loginConGitHub() {
        try {
            console.log("🔐 Iniciando login con GitHub...");
            
            // URL completa de redirección
            const redirectUrl = window.location.origin + '/principal.html';
            console.log("🔄 URL de redirección:", redirectUrl);
            
            const { error } = await window.supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                console.error('❌ Error en login con GitHub:', error);
                throw error;
            }

            console.log("✅ Login con GitHub iniciado, redirigiendo...");
            // La redirección la maneja Supabase automáticamente
            
        } catch (error) {
            console.error('❌ Error en login con GitHub:', error);
            
            // Mostrar mensaje de error más detallado
            let mensajeError = error.message;
            if (error.message.includes('provider is disabled')) {
                mensajeError = 'El login con GitHub no está habilitado en la configuración de Supabase';
            } else if (error.message.includes('redirect_uri')) {
                mensajeError = 'Error en la configuración de redirección. Verifica las URLs en Supabase Dashboard';
            }
            
            if (window.Utilidades && window.Utilidades.mostrarAlerta) {
                window.Utilidades.mostrarAlerta('Error', mensajeError, 'error');
            } else {
                alert('Error: ' + mensajeError);
            }
        }
    },

    async obtenerSesionActual() {
        try {
            console.log("🔄 Obteniendo sesión actual...");
            
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Error al obtener sesión actual:', error);
                return null;
            }
            
            if (session) {
                console.log("✅ Sesión obtenida:", session.user.email);
                return {
                    user: session.user,
                    session: session
                };
            }
            
            console.log("ℹ️ No hay sesión activa");
            return null;
            
        } catch (error) {
            console.error('❌ Error en obtenerSesionActual:', error);
            return null;
        }
    },

    async verificarYRegistrarUsuario() {
        try {
            console.log("🔄 Verificando y registrando usuario...");
            
            // 1. Obtener sesión actual
            const sessionData = await this.obtenerSesionActual();
            if (!sessionData) {
                console.log("⚠️ No hay sesión, no se puede verificar usuario");
                return null;
            }
            
            const user = sessionData.user;
            console.log("👤 Usuario autenticado:", user.email);
            
            // 2. Verificar si existe en tabla usuarios
            const { data: usuarioExistente, error: errorVerificar } = await window.supabase
                .from('usuarios')
                .select('id, nombre, apellidos, email')
                .eq('email', user.email)
                .maybeSingle();
            
            if (errorVerificar) {
                console.error('❌ Error al verificar usuario en DB:', errorVerificar);
                return null;
            }
            
            // 3. Si no existe, crearlo
            if (!usuarioExistente) {
                console.log("🆕 Usuario no encontrado en DB, creando registro...");
                
                // Extraer nombre y apellidos de metadata de GitHub
                let nombre = "Usuario";
                let apellidos = "GitHub";
                
                if (user.user_metadata?.full_name) {
                    const partesNombre = user.user_metadata.full_name.split(' ');
                    nombre = partesNombre[0] || "Usuario";
                    apellidos = partesNombre.slice(1).join(' ') || "GitHub";
                }
                
                const nuevoUsuario = {
                    id: user.id,
                    email: user.email,
                    password_hash: "", // Vacío para OAuth
                    nombre: nombre,
                    apellidos: apellidos,
                    fecha_nacimiento: "2000-01-01",
                    pais: "Desconocido",
                    ciudad: "Desconocida",
                    genero: "otro",
                    tipo_cuenta: "personal",
                    confirmado: true,
                    avatar_url: user.user_metadata?.avatar_url || null,
                    created_at: new Date().toISOString()
                };
                
                console.log("📝 Creando usuario:", nuevoUsuario);
                
                const { error: errorCrear } = await window.supabase
                    .from('usuarios')
                    .insert([nuevoUsuario]);
                
                if (errorCrear) {
                    console.error('❌ Error al crear usuario:', errorCrear);
                    
                    // Intentar con upsert por si el id ya existe
                    const { error: errorUpsert } = await window.supabase
                        .from('usuarios')
                        .upsert([nuevoUsuario], {
                            onConflict: 'id'
                        });
                    
                    if (errorUpsert) {
                        console.error('❌ Error en upsert también:', errorUpsert);
                        return null;
                    }
                    
                    console.log("✅ Usuario creado con upsert");
                    return nuevoUsuario;
                }
                
                console.log("✅ Usuario creado exitosamente");
                return nuevoUsuario;
            }
            
            console.log("✅ Usuario ya existe en DB:", usuarioExistente.nombre);
            return usuarioExistente;
            
        } catch (error) {
            console.error('❌ Error en verificarYRegistrarUsuario:', error);
            return null;
        }
    },

    async suscribirCambiosSesion() {
        // Suscribirse a cambios en la autenticación
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log("🔄 Cambio en estado de autenticación:", event);
            
            switch (event) {
                case 'SIGNED_IN':
                    console.log('✅ Usuario inició sesión:', session?.user?.email);
                    break;
                case 'SIGNED_OUT':
                    console.log('🚪 Usuario cerró sesión');
                    // Redirigir a login si estamos en principal
                    if (window.location.pathname.includes('principal')) {
                        window.location.href = 'index.html';
                    }
                    break;
                case 'TOKEN_REFRESHED':
                    console.log('🔄 Token refrescado');
                    break;
                case 'USER_UPDATED':
                    console.log('👤 Usuario actualizado');
                    break;
            }
        });
    }
};

// Hacer disponible globalmente
window.Autenticacion = Autenticacion;

// Inicializar suscripción a cambios de sesión cuando se carga el módulo
document.addEventListener('DOMContentLoaded', () => {
    if (window.Autenticacion && window.Autenticacion.suscribirCambiosSesion) {
        setTimeout(() => {
            window.Autenticacion.suscribirCambiosSesion();
        }, 1000);
    }
});