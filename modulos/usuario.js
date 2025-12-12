// modulos/usuario.js
const Usuario = {
    async cargarInformacion(usuarioAuth) {
        try {
            const { data: usuarioData, error } = await window.supabase
                .from('usuarios')
                .select('*')
                .eq('email', usuarioAuth.email)
                .single();
            
            if (error) throw error;
            
            window.usuarioActual = usuarioAuth;
            window.usuarioIdActual = usuarioData.id;
            
            this.actualizarUI(usuarioData);
            await this.enviarMensajeBienvenida(usuarioData);
            
            return usuarioData;
        } catch (error) {
            console.error('Error al cargar información:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cargar la información', 'error');
            return null;
        }
    },

    actualizarUI(usuarioData) {
        const nombreCompleto = `${usuarioData.nombre} ${usuarioData.apellidos}`;
        const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
        
        document.getElementById('userName').textContent = nombreCompleto;
        document.getElementById('userEmail').textContent = window.usuarioActual.email;
        document.getElementById('userAvatar').innerHTML = iniciales;
        document.getElementById('welcomeTitle').textContent = `¡Bienvenido, ${usuarioData.nombre}!`;
    },

    async enviarMensajeBienvenida(usuarioData) {
        const firstLogin = localStorage.getItem('messery_first_login');
        if (firstLogin) return;
        
        localStorage.setItem('messery_first_login', 'true');
        
        try {
            const mensajeBienvenida = {
                remitente_id: '00000000-0000-0000-0000-000000000000',
                destinatario_email: usuarioData.email,
                asunto: '¡Bienvenido a Messery! 🎉',
                contenido: `Hola ${usuarioData.nombre},\n\n¡Bienvenido a Messery!`,
                leido: false
            };
            
            const { error } = await window.supabase
                .from('mensajes')
                .insert([mensajeBienvenida]);
            
            if (error) throw error;
            
        } catch (error) {
            console.error('Error al enviar mensaje de bienvenida:', error);
        }
    }
};

// Hacer disponible globalmente
window.Usuario = Usuario;