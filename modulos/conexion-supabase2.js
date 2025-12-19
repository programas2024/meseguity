// conexion-supabase.js - VERSIÓN CORREGIDA
// Configuración y funciones de Supabase

// Configuración Supabase
const SUPABASE_URL = 'https://enmiomqkkdlmodrjmfak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubWlvbXFra2RsbW9kcmptZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA0OTEsImV4cCI6MjA4MDk3NjQ5MX0.HeiJGnnkUjutlZkMTopFK7AIRZzRLxBTXvWk96OcAxg';

// Crear cliente Supabase - SOLO SI NO EXISTE
if (!window.supabase) {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    });
}

// Función para verificar sesión
async function verificarSesion() {
    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('Error al verificar sesión:', error);
            return null;
        }
        
        if (!session) {
            console.log('No hay sesión activa');
            return null;
        }
        
        return session;
    } catch (error) {
        console.error('Error en verificarSesion:', error);
        return null;
    }
}

// Función para verificar y obtener usuario de la DB
async function verificarYRegistrarUsuario() {
    try {
        const session = await verificarSesion();
        if (!session) {
            return null;
        }

        const { user } = session;
        console.log('Usuario Auth:', user);

        // Verificar si el usuario ya existe en la tabla usuarios
        const { data: usuarioExistente, error: errorConsulta } = await window.supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();

        if (errorConsulta && errorConsulta.code !== 'PGRST116') {
            console.warn('Error al consultar usuario:', errorConsulta.message);
            // Continuar aunque haya error
        }

        let usuarioDB = usuarioExistente;

        // Si no existe, crear el usuario en la tabla
        if (!usuarioExistente) {
            console.log('Usuario no encontrado en DB, creando nuevo registro...');
            
            const datosUsuario = {
                id: user.id,
                email: user.email,
                nombre: user.user_metadata?.full_name?.split(' ')[0] || 'Usuario',
                apellidos: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                avatar_url: user.user_metadata?.avatar_url || null,
                fecha_creacion: new Date().toISOString()
            };

            const { data: nuevoUsuario, error: errorCreacion } = await window.supabase
                .from('usuarios')
                .insert([datosUsuario])
                .select()
                .single();

            if (errorCreacion) {
                console.error('Error al crear usuario:', errorCreacion);
                // En caso de error, usar datos básicos del usuario auth
                usuarioDB = {
                    id: user.id,
                    email: user.email,
                    nombre: user.user_metadata?.full_name?.split(' ')[0] || 'Usuario',
                    avatar_url: user.user_metadata?.avatar_url
                };
            } else {
                usuarioDB = nuevoUsuario;
                console.log('✅ Usuario creado en DB:', nuevoUsuario);
            }
        }

        return usuarioDB;

    } catch (error) {
        console.error('❌ Error en verificarYRegistrarUsuario:', error);
        return null;
    }
}

// Hacer funciones disponibles globalmente
window.verificarSesion = verificarSesion;
window.verificarYRegistrarUsuario = verificarYRegistrarUsuario;