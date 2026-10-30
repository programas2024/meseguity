// conexion-supabase.js - VERSIÓN SIMPLIFICADA
console.log('Cargando módulo de conexión Supabase...');

// Configuración Supabase
const SUPABASE_URL = 'https://enmiomqkkdlmodrjmfak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubWlvbXFra2RsbW9kcmptZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA0OTEsImV4cCI6MjA4MDk3NjQ5MX0.HeiJGnnkUjutlZkMTopFK7AIRZzRLxBTXvWk96OcAxg';

// Verificar que Supabase JS esté cargado
if (typeof supabase === 'undefined') {
    console.error('Error: La biblioteca de Supabase no está cargada');
} else {
    // Crear cliente Supabase
    try {
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                storage: localStorage
            }
        });
        
        // Hacerlo disponible globalmente
        window.supabaseClient = supabaseClient;
        console.log('Cliente Supabase creado exitosamente');
        
    } catch (error) {
        console.error('Error al crear cliente Supabase:', error);
    }
}

// Función para verificar y registrar usuario (para usar en otras páginas)
async function verificarYRegistrarUsuario() {
    try {
        // Verificar que el cliente esté disponible
        if (!window.supabaseClient) {
            console.error('Cliente Supabase no disponible');
            return null;
        }

        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (error || !session) {
            console.log('No hay sesión activa');
            return null;
        }

        const { user } = session;
        console.log('Usuario Auth encontrado:', user.email);

        // Verificar si existe en la tabla usuarios
        const { data: usuarioExistente, error: errorConsulta } = await window.supabaseClient
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();

        // Si no existe, crearlo
        if (!usuarioExistente && (!errorConsulta || errorConsulta.code === 'PGRST116')) {
            console.log('Creando nuevo usuario en DB...');
            
            const datosUsuario = {
                id: user.id,
                email: user.email,
                nombre: user.user_metadata?.full_name?.split(' ')[0] || 'Usuario',
                apellidos: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                avatar_url: user.user_metadata?.avatar_url || null,
                fecha_creacion: new Date().toISOString()
            };

            const { data: nuevoUsuario, error: errorCreacion } = await window.supabaseClient
                .from('usuarios')
                .insert([datosUsuario])
                .select()
                .single();

            if (errorCreacion) {
                console.error('Error al crear usuario en DB:', errorCreacion);
                // Usar datos básicos del auth
                return {
                    id: user.id,
                    email: user.email,
                    nombre: user.user_metadata?.full_name?.split(' ')[0] || 'Usuario',
                    avatar_url: user.user_metadata?.avatar_url
                };
            }

            console.log('Usuario creado en DB:', nuevoUsuario);
            return nuevoUsuario;
        }

        // Si hubo otro error en la consulta
        if (errorConsulta && errorConsulta.code !== 'PGRST116') {
            console.error('Error consultando usuario:', errorConsulta);
            // Retornar datos del auth como fallback
            return {
                id: user.id,
                email: user.email,
                nombre: user.user_metadata?.full_name?.split(' ')[0] || 'Usuario'
            };
        }

        // Si ya existe, retornarlo
        return usuarioExistente;

    } catch (error) {
        console.error('Error en verificarYRegistrarUsuario:', error);
        return null;
    }
}

// Hacer función disponible globalmente
window.verificarYRegistrarUsuario = verificarYRegistrarUsuario;
console.log('Módulo de conexión cargado');