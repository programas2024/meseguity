// Cerrar sesión simple y directo - CON BOTONES MÁS ARRIBA
document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const { isConfirmed } = await Swal.fire({
        title: '<div style="width: 80px; height: 80px; background: white; border: 4px solid #4FC3F7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4FC3F7; font-size: 40px; margin: 0 auto 15px;"><i class="fas fa-question"></i></div>',
        html: `
            <div style="padding-bottom: 10px;">
                <h3 style="color: #333; font-size: 24px; margin-bottom: 8px; font-weight: 600;">¿Cerrar Sesión?</h3>
                <p style="color: #666; font-size: 16px;">Vas a salir del Panel de Administración</p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, Cerrar Sesión',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#6c757d',
        background: 'white',
        width: '470px',
        padding: '25px 30px 20px 30px', // Menos padding abajo (20px) para subir botones
        reverseButtons: false,
        allowOutsideClick: false,
        customClass: {
            popup: 'swal-compact-popup'
        }
    });
    
    if (isConfirmed) {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    }
});

// Agregar estilo CSS para compactar y subir botones
const style = document.createElement('style');
style.textContent = `
    .swal-compact-popup {
        border-radius: 16px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid #e0e0e0 !important;
        height: auto !important;
        min-height: 280px !important; /* Altura compacta */
    }
    
    /* SUBIR LOS BOTONES MÁS ARRIBA */
    .swal2-actions {
        margin-top: 15px !important; /* Reducido de 30px a 15px */
        margin-bottom: 0 !important;
        padding-top: 10px !important;
    }
    
    /* Reducir espacio entre contenido y botones */
    .swal2-html-container {
        margin-bottom: 10px !important; /* Reducido */
        padding-bottom: 0 !important;
    }
    
    .swal2-confirm {
        font-size: 16px !important;
        padding: 12px 30px !important;
        font-weight: 600 !important;
        border-radius: 10px !important;
        margin-top: 5px !important;
    }
    
    .swal2-cancel {
        font-size: 16px !important;
        padding: 12px 30px !important;
        font-weight: 600 !important;
        border-radius: 10px !important;
        margin-top: 5px !important;
    }
    
    /* Asegurar que no haya espacio extra abajo */
    .swal2-footer {
        margin-top: 0 !important;
        padding-top: 0 !important;
    }
`;
document.head.appendChild(style);

// Función para inicializar (versión minimalista)
function inicializarCerrarSesion() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesionConEstilo();
        });
        
        // Agregar estilos mínimos
        const style = document.createElement('style');
        style.textContent = `
            .swal2-timer-progress-bar {
                background: linear-gradient(90deg, #667eea, #764ba2) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar automáticamente
if (typeof Swal !== 'undefined') {
    document.addEventListener('DOMContentLoaded', inicializarCerrarSesion);
}