// redes-sociales.js
// Manejo de redes sociales

// Función para alternar red social
function toggleRedSocial(red) {
    const toggleBtn = document.querySelector(`#redes${red.charAt(0).toUpperCase() + red.slice(1)} .btn-toggle-red`);
    const redesItem = document.getElementById(`redes${red.charAt(0).toUpperCase() + red.slice(1)}`);
    
    redesSociales[red].activa = !redesSociales[red].activa;
    
    if (redesSociales[red].activa) {
        toggleBtn.classList.add('active');
        redesItem.classList.add('active');
    } else {
        toggleBtn.classList.remove('active');
        redesItem.classList.remove('active');
    }
    
    actualizarEstadoRed(red, redesSociales[red].url);
}

// Función para actualizar estado de red social
function actualizarEstadoRed(red, url) {
    redesSociales[red].url = url.trim();
    const tieneUrl = url.trim().length > 0;
    const estaActiva = redesSociales[red].activa;
    
    const statusIndicator = document.getElementById(`status${red.charAt(0).toUpperCase() + red.slice(1)}`);
    const statusText = document.getElementById(`statusText${red.charAt(0).toUpperCase() + red.slice(1)}`);
    
    if (estaActiva && tieneUrl) {
        statusIndicator.className = 'status-indicator active';
        statusText.textContent = 'Conectado';
        statusText.style.color = '#10b981';
    } else if (estaActiva && !tieneUrl) {
        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'URL requerida';
        statusText.style.color = '#f59e0b';
    } else {
        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'No conectado';
        statusText.style.color = '#666';
    }
}

// Función para limpiar todas las redes
function limpiarRedes() {
    Swal.fire({
        title: '🧹 Limpiar Todas las Redes',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #d97706); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                    <i class="fas fa-broom" style="color: white; font-size: 40px;"></i>
                </div>
                <h3 style="color: #92400e; margin-bottom: 10px;">¿Limpiar todas las redes sociales?</h3>
                <p style="color: #4b5563; margin-bottom: 15px;">
                    Esta acción eliminará todas las URLs de tus redes sociales conectadas.
                </p>
                <div style="background: #fffbeb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; display: flex; align-items: flex-start; gap: 10px;">
                        <i class="fas fa-exclamation-circle" style="color: #f59e0b; flex-shrink: 0; margin-top: 2px;"></i>
                        <span>No se eliminarán tus datos de perfil, solo las conexiones a redes sociales.</span>
                    </p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar todo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        background: '#ffffff',
        width: 500
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar todas las redes
            for (const red in redesSociales) {
                redesSociales[red] = { activa: false, url: '' };
                const input = document.getElementById(`input${red.charAt(0).toUpperCase() + red.slice(1)}`);
                if (input) input.value = '';
                
                const toggleBtn = document.querySelector(`#redes${red.charAt(0).toUpperCase() + red.slice(1)} .btn-toggle-red`);
                if (toggleBtn) toggleBtn.classList.remove('active');
                
                const redesItem = document.getElementById(`redes${red.charAt(0).toUpperCase() + red.slice(1)}`);
                if (redesItem) redesItem.classList.remove('active');
                
                actualizarEstadoRed(red, '');
            }
            
            mostrarAlerta('success', 'Todas las redes han sido limpiadas');
            
            // Mostrar confirmación
            Swal.fire({
                title: '✅ Redes Limpiadas',
                text: 'Todas tus redes sociales han sido desconectadas.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#10b981',
                background: '#ffffff',
                timer: 2000,
                timerProgressBar: true
            });
        }
    });
}

// Función para guardar redes sociales en Supabase
async function guardarRedesSociales(event) {
    event.preventDefault();
    
    try {
        console.log("💾 Guardando redes sociales...");
        
        // Validar que al menos una red esté activa
        const redesActivas = Object.values(redesSociales).filter(red => red.activa);
        if (redesActivas.length === 0) {
            mostrarModalSinRedesActivas();
            return;
        }
        
        // Validar URLs de redes activas
        for (const [red, datos] of Object.entries(redesSociales)) {
            if (datos.activa && !datos.url.trim()) {
                mostrarAlerta('error', `Por favor ingresa la URL para ${red}`);
                return;
            }
            
            if (datos.activa && datos.url.trim()) {
                // Validar formato básico de URL
                try {
                    new URL(datos.url);
                } catch (error) {
                    mostrarAlerta('error', `La URL de ${red} no tiene un formato válido`);
                    return;
                }
            }
        }
        
        // Mostrar loading
        const loadingAlert = Swal.fire({
            title: '⏳ Guardando redes sociales',
            html: `
                <div style="text-align: center;">
                    <div class="swal2-loader"></div>
                    <p style="margin-top: 20px; color: #4b5563;">Guardando tus conexiones...</p>
                    <div style="background: #f8fafc; padding: 10px; border-radius: 8px; margin-top: 15px;">
                        <p style="color: #6b7280; margin: 0; font-size: 13px;">
                            <i class="fas fa-sync-alt" style="color: #3b82f6; margin-right: 5px;"></i>
                            Procesando ${redesActivas.length} red(es) social(es)
                        </p>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            background: '#ffffff'
        });
        
        // Preparar datos para la tabla 'redes_sociales'
        const datosRedes = Object.entries(redesSociales).map(([red, datos]) => ({
            usuario_id: usuarioActual.id,
            plataforma: red,
            url: datos.url.trim() || null,
            activa: datos.activa,
            fecha_actualizacion: new Date().toISOString()
        })).filter(red => red.activa); // Solo guardar redes activas
        
        // Primero eliminar las redes existentes del usuario
        const { error: errorEliminar } = await supabase
            .from('redes_sociales')
            .delete()
            .eq('usuario_id', usuarioActual.id);
        
        if (errorEliminar) throw errorEliminar;
        
        // Insertar las nuevas redes (solo si hay redes activas)
        if (datosRedes.length > 0) {
            const { error: errorInsertar } = await supabase
                .from('redes_sociales')
                .insert(datosRedes);
            
            if (errorInsertar) throw errorInsertar;
        }
        
        // Cerrar loading
        await loadingAlert.close();
        
        // Mostrar éxito
        mostrarAlerta('success', `${datosRedes.length} red(es) social(es) guardada(s) correctamente`);
        console.log("✅ Redes sociales guardadas exitosamente");
        
    } catch (error) {
        console.error('❌ Error al guardar redes sociales:', error);
        mostrarAlerta('error', 'Error al guardar las redes sociales: ' + error.message);
    }
}

// Modal cuando no hay redes activas
function mostrarModalSinRedesActivas() {
    Swal.fire({
        title: '📱 Sin Redes Activas',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #9ca3af, #6b7280); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                    <i class="fas fa-slash" style="color: white; font-size: 40px;"></i>
                </div>
                <h3 style="color: #4b5563; margin-bottom: 10px;">No hay redes activas</h3>
                <p style="color: #6b7280; margin-bottom: 15px;">
                    Para guardar, necesitas activar al menos una red social e ingresar su URL.
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: #374151; margin: 0 0 10px 0; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-lightbulb" style="color: #f59e0b;"></i>
                        ¿Cómo activar una red?
                    </p>
                    <ol style="color: #6b7280; padding-left: 20px; margin: 0; text-align: left; font-size: 14px;">
                        <li>Haz clic en el interruptor de una red social</li>
                        <li>Ingresa la URL completa de tu perfil</li>
                        <li>El estado cambiará a "Conectado" (verde)</li>
                        <li>Haz clic en "Guardar Redes"</li>
                    </ol>
                </div>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button id="btnActivarFacebook" style="background: #3b5998; color: white; border: none; padding: 10px 20px; 
                            border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fab fa-facebook-f"></i> Activar Facebook
                    </button>
                    <button id="btnActivarInstagram" style="background: #e4405f; color: white; border: none; padding: 10px 20px; 
                            border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fab fa-instagram"></i> Activar Instagram
                    </button>
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        width: 500,
        showCloseButton: true
    }).then(() => {
        // Configurar eventos de los botones del modal
        const btnActivarFacebook = document.getElementById('btnActivarFacebook');
        const btnActivarInstagram = document.getElementById('btnActivarInstagram');
        
        if (btnActivarFacebook) {
            btnActivarFacebook.addEventListener('click', () => {
                Swal.close();
                toggleRedSocial('facebook');
                document.getElementById('inputFacebook').focus();
            });
        }
        
        if (btnActivarInstagram) {
            btnActivarInstagram.addEventListener('click', () => {
                Swal.close();
                toggleRedSocial('instagram');
                document.getElementById('inputInstagram').focus();
            });
        }
    });
}

// Función para cargar redes sociales desde Supabase
async function cargarRedesSociales() {
    try {
        if (!usuarioActual) return;
        
        console.log("📱 Cargando redes sociales...");
        
        // Mostrar loading
        const loadingAlert = Swal.fire({
            title: '⏳ Cargando redes sociales',
            html: `
                <div style="text-align: center;">
                    <div class="swal2-loader"></div>
                    <p style="margin-top: 20px; color: #4b5563;">Recuperando tus conexiones...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            background: '#ffffff'
        });
        
        // Obtener redes sociales del usuario
        const { data: redesDB, error } = await supabase
            .from('redes_sociales')
            .select('*')
            .eq('usuario_id', usuarioActual.id);
        
        if (error) throw error;
        
        // Cerrar loading
        await loadingAlert.close();
        
        // Reiniciar estado local
        for (const red in redesSociales) {
            redesSociales[red] = { activa: false, url: '' };
        }
        
        // Actualizar estado local con datos de la BD
        if (redesDB && redesDB.length > 0) {
            redesDB.forEach(redDB => {
                const red = redDB.plataforma.toLowerCase();
                if (redesSociales[red] !== undefined) {
                    redesSociales[red] = {
                        activa: redDB.activa,
                        url: redDB.url || ''
                    };
                }
            });
        }
        
        // Actualizar interfaz
        actualizarInterfazRedesSociales();
        
        console.log("✅ Redes sociales cargadas exitosamente");
        
    } catch (error) {
        console.error('❌ Error al cargar redes sociales:', error);
        mostrarAlerta('error', 'Error al cargar redes sociales');
    }
}

// Actualizar interfaz de redes sociales
function actualizarInterfazRedesSociales() {
    for (const red in redesSociales) {
        const input = document.getElementById(`input${red.charAt(0).toUpperCase() + red.slice(1)}`);
        const toggleBtn = document.querySelector(`#redes${red.charAt(0).toUpperCase() + red.slice(1)} .btn-toggle-red`);
        const redesItem = document.getElementById(`redes${red.charAt(0).toUpperCase() + red.slice(1)}`);
        
        if (input) {
            input.value = redesSociales[red].url;
        }
        
        if (toggleBtn) {
            if (redesSociales[red].activa) {
                toggleBtn.classList.add('active');
                redesItem.classList.add('active');
            } else {
                toggleBtn.classList.remove('active');
                redesItem.classList.remove('active');
            }
        }
        
        actualizarEstadoRed(red, redesSociales[red].url);
    }
}

// Función para crear la tabla de redes sociales (si no existe)
async function crearTablaRedesSociales() {
    try {
        console.log("🛠️ Verificando tabla de redes sociales...");
        
        // Verificar si la tabla existe intentando hacer una consulta simple
        const { error } = await supabase
            .from('redes_sociales')
            .select('*')
            .limit(1);
        
        if (error && error.code === '42P01') { // Tabla no existe
            console.log("📊 La tabla 'redes_sociales' no existe. Debes crearla en Supabase.");
            
            // Mostrar instrucciones al usuario
            Swal.fire({
                title: '🛠️ Configuración Requerida',
                html: `
                    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                        <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                            <h4 style="color: #d97706; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-database"></i> Tabla de Redes Sociales
                            </h4>
                            <p style="color: #92400e; margin: 0;">
                                La tabla para guardar redes sociales necesita ser creada en Supabase.
                            </p>
                        </div>
                        
                        <h5 style="color: #374151; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-code" style="color: #3b82f6;"></i> SQL para crear la tabla:
                        </h5>
                        
                        <div style="background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; font-family: 'Monaco', 'Consolas', monospace; 
                                font-size: 12px; line-height: 1.5; margin-bottom: 20px; max-height: 200px; overflow-y: auto;">
<pre>CREATE TABLE redes_sociales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plataforma VARCHAR(50) NOT NULL,
    url TEXT,
    activa BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT now(),
    fecha_actualizacion TIMESTAMP DEFAULT now(),
    UNIQUE(usuario_id, plataforma)
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_redes_sociales_usuario_id ON redes_sociales(usuario_id);
CREATE INDEX idx_redes_sociales_plataforma ON redes_sociales(plataforma);
CREATE INDEX idx_redes_sociales_activas ON redes_sociales(usuario_id) WHERE activa = true;</pre>
                        </div>
                        
                        <div style="background: #ecfdf5; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
                            <p style="color: #065f46; margin: 0; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-info-circle"></i>
                                <span>Puedes continuar usando la página, pero las redes sociales no se guardarán hasta que crees la tabla.</span>
                            </p>
                        </div>
                    </div>
                `,
                width: 700,
                showConfirmButton: true,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3b82f6',
                background: '#ffffff'
            });
        } else if (!error) {
            console.log("✅ La tabla 'redes_sociales' existe");
        }
        
    } catch (error) {
        console.error('❌ Error al verificar tabla de redes sociales:', error);
    }
}

// Configurar eventos de redes sociales
function configurarEventosRedesSociales() {
    console.log("⚙️ Configurando eventos de redes sociales...");
    
    // Formulario de redes sociales
    const formRedes = document.getElementById('formRedesSociales');
    if (formRedes) {
        formRedes.addEventListener('submit', guardarRedesSociales);
        console.log("✅ Formulario de redes sociales configurado");
    }

    // Botón Limpiar Todo
    const btnLimpiarTodo = document.querySelector('button[onclick="limpiarRedes()"]');
    if (btnLimpiarTodo) {
        btnLimpiarTodo.addEventListener('click', limpiarRedes);
    }

    // Configurar eventos de las redes sociales individuales
    const redes = ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'github'];
    redes.forEach(red => {
        const input = document.getElementById(`input${red.charAt(0).toUpperCase() + red.slice(1)}`);
        if (input) {
            input.addEventListener('input', function() {
                actualizarEstadoRed(red, this.value);
            });
            
            // Validación en tiempo real
            input.addEventListener('blur', function() {
                const url = this.value.trim();
                if (url && !url.startsWith('http')) {
                    mostrarAlerta('warning', `Recuerda usar https:// en la URL de ${red}`);
                }
            });
        }
    });

    console.log("✅ Eventos de redes sociales configurados");
}