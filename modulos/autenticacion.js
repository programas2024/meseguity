// modulos/autenticacion.js
const Autenticacion = {
    async verificarSesion() {
        try {
            const { data: { session }, error } = await window.supabase.auth.getSession();
            
            if (error || !session) {
                window.location.href = 'index.html';
                return null;
            }
            
            return session.user;
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            window.location.href = 'index.html';
            return null;
        }
    },

    async cerrarSesion() {
        try {
            const { error } = await window.supabase.auth.signOut();
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cerrar sesión', 'error');
        }
    }
};

// Hacer disponible globalmente
window.Autenticacion = Autenticacion;