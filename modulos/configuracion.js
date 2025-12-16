// configuracion.js
// Archivo principal de configuración

// Variables globales
let usuarioActual = null;
let seccionActual = 'perfil';
let redesSociales = {
    facebook: { activa: false, url: '' },
    instagram: { activa: false, url: '' },
    twitter: { activa: false, url: '' },
    tiktok: { activa: false, url: '' },
    youtube: { activa: false, url: '' },
    linkedin: { activa: false, url: '' },
    github: { activa: false, url: '' }
};

// Función para mostrar alertas
function mostrarAlerta(tipo, mensaje, tiempo = 3000) {
    Swal.fire({
        icon: tipo,
        title: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: tiempo,
        timerProgressBar: true,
        background: '#f8fafd',
        color: '#333'
    });
}

// Función para cambiar entre secciones
function mostrarSeccion(seccion) {
    seccionActual = seccion;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.config-content').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const seccionId = 'seccion' + seccion.charAt(0).toUpperCase() + seccion.slice(1);
    const seccionElemento = document.getElementById(seccionId);
    if (seccionElemento) {
        seccionElemento.classList.add('active');
    }
    
    // Activar el botón correspondiente
    const botonId = 'btn' + seccion.charAt(0).toUpperCase() + seccion.slice(1);
    const botonElemento = document.getElementById(botonId);
    if (botonElemento) {
        botonElemento.classList.add('active');
    }
    
    // Actualizar título de la página
    const titulos = {
        'perfil': 'Configuración de Perfil',
        'redes': 'Redes Sociales',
        'seguridad': 'Seguridad de la Cuenta'
    };
    
    const tituloPagina = document.getElementById('tituloPagina');
    if (tituloPagina && titulos[seccion]) {
        tituloPagina.textContent = titulos[seccion];
    }
    
    // Cargar datos específicos de la sección
    if (seccion === 'redes') {
        cargarRedesSociales();
    }
}

// Configurar funciones básicas de la página
function configurarEventosBasicos() {
    console.log("⚙️ Configurando eventos básicos...");
    
    // Botón de ayuda (contextual según sección)
    const btnAyuda = document.getElementById('btnAyuda');
    if (btnAyuda) {
        btnAyuda.addEventListener('click', mostrarAyuda);
    }

    // Botón de soporte (contacto)
    const btnSoporte = document.getElementById('btnSoporte');
    if (btnSoporte) {
        btnSoporte.addEventListener('click', mostrarSoporte);
    }

    // Configurar logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            const confirmacion = await Swal.fire({
                title: '🚪 Cerrar Sesión',
                text: '¿Estás seguro de que quieres cerrar sesión?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            });
            
            if (confirmacion.isConfirmed) {
                try {
                    await cerrarSesion();
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                }
            }
        });
    }

    // Cambiar avatar
    const btnChangeAvatar = document.getElementById('btnChangeAvatar');
    if (btnChangeAvatar) {
        btnChangeAvatar.addEventListener('click', mostrarModalCambiarAvatar);
    }

    console.log("✅ Eventos básicos configurados");
}

// Función para cerrar sesión
async function cerrarSesion() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Redirigir a login
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mostrarAlerta('error', 'Error al cerrar sesión: ' + error.message);
    }
}

// Función para mostrar modal de cambiar avatar
function mostrarModalCambiarAvatar() {
    Swal.fire({
        title: '📸 Cambiar Foto de Perfil',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                        margin: 0 auto 20px auto; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                    <i class="fas fa-user-circle" style="color: white; font-size: 60px;"></i>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: #4b5563; margin-bottom: 10px; font-weight: 500;">Opciones disponibles:</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <button id="btnSubirImagen" style="background: #3b82f6; color: white; border: none; padding: 10px; 
                                border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                            <i class="fas fa-upload"></i> Subir Imagen
                        </button>
                        <button id="btnSeleccionarAvatar" style="background: #8b5cf6; color: white; border: none; padding: 10px; 
                                border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                            <i class="fas fa-user-tie"></i> Avatar Predefinido
                        </button>
                    </div>
                    
                    <div style="display: none;" id="avatarOptions">
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                            <div class="avatar-option" data-avatar="A" style="width: 40px; height: 40px; background: #3b82f6; 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                    color: white; font-weight: bold; cursor: pointer;">A</div>
                            <div class="avatar-option" data-avatar="B" style="width: 40px; height: 40px; background: #10b981; 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                    color: white; font-weight: bold; cursor: pointer;">B</div>
                            <div class="avatar-option" data-avatar="C" style="width: 40px; height: 40px; background: #f59e0b; 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                    color: white; font-weight: bold; cursor: pointer;">C</div>
                            <div class="avatar-option" data-avatar="D" style="width: 40px; height: 40px; background: #ef4444; 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                    color: white; font-weight: bold; cursor: pointer;">D</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #ecfdf5; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
                    <p style="color: #065f46; margin: 0; font-size: 13px; text-align: left;">
                        <i class="fas fa-info-circle"></i> Formatos soportados: JPG, PNG, GIF (máx. 5MB)
                    </p>
                </div>
            </div>
        `,
        width: 500,
        showConfirmButton: false,
        showCloseButton: true,
        background: '#ffffff'
    });

    // Configurar eventos de los botones del modal
    setTimeout(() => {
        const btnSubirImagen = document.getElementById('btnSubirImagen');
        const btnSeleccionarAvatar = document.getElementById('btnSeleccionarAvatar');
        const avatarOptions = document.getElementById('avatarOptions');
        
        if (btnSubirImagen) {
            btnSubirImagen.addEventListener('click', function() {
                mostrarAlerta('info', 'Función de subir imagen disponible próximamente');
            });
        }
        
        if (btnSeleccionarAvatar) {
            btnSeleccionarAvatar.addEventListener('click', function() {
                avatarOptions.style.display = 'block';
            });
        }
        
        // Configurar opciones de avatar predefinido
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', function() {
                const letra = this.getAttribute('data-avatar');
                // Aquí guardaríamos el avatar seleccionado
                mostrarAlerta('success', `Avatar ${letra} seleccionado`);
                Swal.close();
            });
        });
    }, 100);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("🚀 Inicializando página de configuración...");
        
        // 1. Cargar datos del usuario
        await cargarDatosUsuario();
        
        // 2. Verificar/crear tabla de redes sociales
        await crearTablaRedesSociales();
        
        // 3. Configurar eventos básicos
        configurarEventosBasicos();
        
        // 4. Configurar eventos específicos
        configurarEventosPerfil();
        configurarEventosRedesSociales();
        configurarEventosSeguridad();
        
        console.log("✅ Página de configuración inicializada correctamente");
        
    } catch (error) {
        console.error('❌ Error al inicializar configuración:', error);
        mostrarAlerta('error', 'Error al inicializar la configuración');
    }
});