// usuario-perfil.js
// Manejo del perfil de usuario

// Cargar datos del usuario
async function cargarDatosUsuario() {
    try {
        console.log("🔍 Cargando datos del usuario...");
        
        // Verificar sesión
        const usuarioAuth = await verificarSesion();
        if (!usuarioAuth) {
            console.log("⚠️ No hay sesión, redirigiendo...");
            window.location.href = 'index.html';
            return;
        }

        console.log("✅ Sesión encontrada:", usuarioAuth.user.email);

        // Obtener datos del usuario desde la tabla usuarios
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', usuarioAuth.user.id)
            .single();

        if (error) {
            console.error("❌ Error al cargar usuario:", error);
            throw error;
        }

        usuarioActual = usuario;
        console.log("✅ Usuario cargado:", usuario);

        // Actualizar interfaz
        actualizarInterfazPerfil(usuario);
        
        // Cargar estadísticas
        await cargarEstadisticas(usuario.id);

        console.log("✅ Datos del usuario cargados exitosamente");

    } catch (error) {
        console.error('❌ Error al cargar datos del usuario:', error);
        mostrarAlerta('error', 'No se pudieron cargar los datos del usuario');
    }
}

// Actualizar interfaz del perfil
function actualizarInterfazPerfil(usuario) {
    // Nombre y email
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || 'Usuario';
    document.getElementById('configUserName').textContent = nombreCompleto;
    document.getElementById('configUserEmail').textContent = usuario.email || 'Sin email';
    
    // Avatar
    const avatar = document.getElementById('configAvatar');
    if (usuario.avatar_url) {
        avatar.innerHTML = `<img src="${usuario.avatar_url}" alt="${usuario.nombre}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                           <button class="btn-change-avatar" id="btnChangeAvatar">
                               <i class="fas fa-camera"></i>
                           </button>`;
    } else {
        const inicial = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
        avatar.innerHTML = `<span style="font-size: 36px; font-weight: bold;">${inicial}</span>
                           <button class="btn-change-avatar" id="btnChangeAvatar">
                               <i class="fas fa-camera"></i>
                           </button>`;
    }

    // Llenar formulario
    document.getElementById('configNombre').value = usuario.nombre || '';
    document.getElementById('configApellidos').value = usuario.apellidos || '';
    document.getElementById('configEmail').value = usuario.email || '';
    document.getElementById('configTelefono').value = usuario.telefono || '';
    document.getElementById('configFechaNacimiento').value = usuario.fecha_nacimiento || '';
    document.getElementById('configGenero').value = usuario.genero || '';
    document.getElementById('configPais').value = usuario.pais || '';
    document.getElementById('configCiudad').value = usuario.ciudad || '';
    document.getElementById('configTipoCuenta').value = usuario.tipo_cuenta || '';
    document.getElementById('configBiografia').value = usuario.biografia || '';
    
    // Checkboxes
    document.getElementById('configRecibirNotificaciones').checked = usuario.recibir_notificaciones !== false;
    document.getElementById('configMostrarEnLinea').checked = usuario.mostrar_en_linea !== false;
    document.getElementById('configPerfilPublico').checked = usuario.perfil_publico === true;
}

// Cargar estadísticas
async function cargarEstadisticas(usuarioId) {
    try {
        console.log("📊 Cargando estadísticas para usuario:", usuarioId);
        
        // Mensajes recibidos
        const { count: mensajesCount, error: errorMensajes } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('destinatario_email', usuarioActual.email);

        if (errorMensajes) console.error("Error al contar mensajes:", errorMensajes);

        // Amigos
        const { count: amigosCount, error: errorAmigos } = await supabase
            .from('amistades')
            .select('*', { count: 'exact', head: true })
            .or(`usuario_id.eq.${usuarioId},amigo_id.eq.${usuarioId}`)
            .eq('estado', 'aceptada');

        if (errorAmigos) console.error("Error al contar amigos:", errorAmigos);

        // Grupos
        const { count: gruposCount, error: errorGrupos } = await supabase
            .from('miembros_grupo')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', usuarioId)
            .eq('estado', 'activo');

        if (errorGrupos) console.error("Error al contar grupos:", errorGrupos);

        // Actualizar UI
        document.getElementById('statMensajes').textContent = mensajesCount || 0;
        document.getElementById('statAmigos').textContent = amigosCount || 0;
        document.getElementById('statGrupos').textContent = gruposCount || 0;

        console.log("✅ Estadísticas cargadas:", { mensajesCount, amigosCount, gruposCount });

    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

// Guardar cambios del perfil
async function guardarCambiosPerfil(event) {
    event.preventDefault();
    
    try {
        const datosActualizados = {
            nombre: document.getElementById('configNombre').value.trim(),
            apellidos: document.getElementById('configApellidos').value.trim(),
            telefono: document.getElementById('configTelefono').value.trim() || null,
            fecha_nacimiento: document.getElementById('configFechaNacimiento').value,
            genero: document.getElementById('configGenero').value,
            pais: document.getElementById('configPais').value.trim(),
            ciudad: document.getElementById('configCiudad').value.trim(),
            tipo_cuenta: document.getElementById('configTipoCuenta').value,
            biografia: document.getElementById('configBiografia').value.trim().substring(0, 500) || null,
            recibir_notificaciones: document.getElementById('configRecibirNotificaciones').checked,
            mostrar_en_linea: document.getElementById('configMostrarEnLinea').checked,
            perfil_publico: document.getElementById('configPerfilPublico').checked,
            updated_at: new Date().toISOString()
        };

        console.log("💾 Guardando cambios:", datosActualizados);

        // Validar campos requeridos
        if (!datosActualizados.nombre || !datosActualizados.apellidos || !datosActualizados.fecha_nacimiento || 
            !datosActualizados.genero || !datosActualizados.pais || !datosActualizados.ciudad || 
            !datosActualizados.tipo_cuenta) {
            mostrarAlerta('error', 'Por favor completa todos los campos obligatorios');
            return;
        }

        // Actualizar en Supabase
        const { error } = await supabase
            .from('usuarios')
            .update(datosActualizados)
            .eq('id', usuarioActual.id);

        if (error) throw error;

        // Actualizar metadata de auth si es necesario
        await supabase.auth.updateUser({
            data: {
                nombre: datosActualizados.nombre,
                apellidos: datosActualizados.apellidos
            }
        });

        mostrarAlerta('success', 'Cambios guardados correctamente');
        
        // Actualizar datos locales
        usuarioActual = { ...usuarioActual, ...datosActualizados };
        
        // Actualizar estadísticas
        await cargarEstadisticas(usuarioActual.id);

        console.log("✅ Cambios guardados exitosamente");

    } catch (error) {
        console.error('❌ Error al guardar cambios:', error);
        mostrarAlerta('error', 'Error al guardar los cambios: ' + error.message);
    }
}

// Configurar eventos del perfil
function configurarEventosPerfil() {
    console.log("⚙️ Configurando eventos del perfil...");
    
    // Formulario de perfil
    const formPerfil = document.getElementById('formConfiguracion');
    if (formPerfil) {
        formPerfil.addEventListener('submit', guardarCambiosPerfil);
        console.log("✅ Formulario de perfil configurado");
    }

    // Eliminar cuenta (desde perfil)
    const btnEliminarCuenta = document.getElementById('btnEliminarCuenta');
    if (btnEliminarCuenta) {
        btnEliminarCuenta.addEventListener('click', mostrarModalEliminarCuenta);
    }

    console.log("✅ Eventos del perfil configurados");
}

// Modal para eliminar cuenta
function mostrarModalEliminarCuenta() {
    Swal.fire({
        title: '🗑️ Eliminar Cuenta Permanente',
        html: `
            <div style="text-align: left; color: #333; max-width: 500px;">
                <div style="background: linear-gradient(135deg, #fff5f5, #fed7d7); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="width: 60px; height: 60px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-exclamation-triangle" style="color: white; font-size: 30px;"></i>
                        </div>
                        <div>
                            <h3 style="color: #b91c1c; margin: 0;">¡Atención! Acción Irreversible</h3>
                            <p style="color: #dc2626; margin: 5px 0 0 0; font-size: 14px;">Esta acción no se puede deshacer</p>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">
                            <i class="fas fa-trash-alt"></i> Se eliminará permanentemente:
                        </h4>
                        <ul style="color: #4b5563; padding-left: 20px; margin: 0; font-size: 14px;">
                            <li>Tu cuenta de Messery y todos tus datos</li>
                            <li>Todos tus mensajes enviados y recibidos</li>
                            <li>Tus amistades y conexiones</li>
                            <li>Tu participación en todos los grupos</li>
                            <li>Tus redes sociales conectadas</li>
                            <li>Tus configuraciones y preferencias</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #d97706;">
                        <p style="color: #92400e; margin: 0; font-size: 13px; display: flex; align-items: flex-start; gap: 8px;">
                            <i class="fas fa-lightbulb" style="color: #f59e0b; flex-shrink: 0; margin-top: 2px;"></i>
                            <span><strong>Alternativa:</strong> Considera desactivar temporalmente tu cuenta en lugar de eliminarla permanentemente.</span>
                        </p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <label for="confirmarEliminacion" style="color: #374151; font-weight: 500; display: block; margin-bottom: 10px;">
                        <i class="fas fa-check-circle" style="color: #10b981; margin-right: 8px;"></i>
                        Confirmación requerida
                    </label>
                    <textarea id="confirmarEliminacion" 
                              placeholder="Escribe 'ELIMINAR MI CUENTA' para confirmar" 
                              style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 80px;"></textarea>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">
                        Esta verificación evita eliminaciones accidentales.
                    </p>
                </div>
            </div>
        `,
        width: 600,
        showCancelButton: true,
        confirmButtonText: 'Eliminar Cuenta',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        background: '#ffffff',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: true,
        preConfirm: () => {
            const confirmacion = document.getElementById('confirmarEliminacion').value;
            if (confirmacion !== 'ELIMINAR MI CUENTA') {
                Swal.showValidationMessage('Debes escribir exactamente: ELIMINAR MI CUENTA');
                return false;
            }
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Aquí iría la lógica para eliminar la cuenta
            Swal.fire({
                title: '⏳ Procesando solicitud',
                html: `
                    <div style="text-align: center; padding: 20px;">
                        <div style="width: 80px; height: 80px; border: 3px solid #e5e7eb; border-top: 3px solid #3b82f6; 
                                border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
                        <p style="color: #4b5563;">Procesando tu solicitud de eliminación de cuenta...</p>
                        <p style="color: #9ca3af; font-size: 13px; margin-top: 10px;">
                            Esto puede tomar unos segundos. No cierres esta ventana.
                        </p>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: '#ffffff'
            });

            // Simular procesamiento
            setTimeout(() => {
                Swal.fire({
                    title: '✅ Solicitud Recibida',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #047857); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                                <i class="fas fa-check" style="color: white; font-size: 40px;"></i>
                            </div>
                            <p style="color: #065f46; font-weight: 500; margin-bottom: 10px;">
                                Tu solicitud de eliminación ha sido recibida
                            </p>
                            <p style="color: #4b5563; font-size: 14px;">
                                Enviaremos un email de confirmación a <strong>${usuarioActual?.email || 'tu correo'}</strong>. 
                                Debes hacer clic en el enlace del email para completar la eliminación.
                            </p>
                            <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-top: 15px;">
                                <p style="color: #0369a1; margin: 0; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-info-circle"></i>
                                    <span>Si cambias de opinión, tienes 24 horas para cancelar la eliminación.</span>
                                </p>
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#1a73e8',
                    background: '#ffffff'
                }).then(() => {
                    // Cerrar sesión después de confirmar
                    cerrarSesion();
                });
            }, 2000);
        }
    });
}