// Cerrar sesión para página de logros
document.addEventListener('DOMContentLoaded', function() {
    const btnLogout = document.getElementById('btn-logout');
    
    if (btnLogout) {
        btnLogout.addEventListener('click', async function() {
            const { value: confirmar } = await Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas salir de tu cuenta?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar',
                background: '#ffffff',
                color: '#333'
            });
            
            if (confirmar) {
                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    
                    await Swal.fire({
                        title: '¡Sesión cerrada!',
                        text: 'Has cerrado sesión exitosamente.',
                        icon: 'success',
                        confirmButtonColor: '#667eea',
                        timer: 2000
                    });
                    
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo cerrar la sesión. Intenta de nuevo.',
                        icon: 'error',
                        confirmButtonColor: '#667eea'
                    });
                }
            }
        });
    }
});