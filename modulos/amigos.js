// modulos/amigos.js
const Amigos = {
    async cargarAmigos() {
        try {
            const { data: amistades, error } = await window.supabase
                .from('amistades')
                .select(`
                    id,
                    usuario_id,
                    amigo_id,
                    estado,
                    usuario:usuarios!amistades_usuario_id_fkey(id, nombre, apellidos, email, ciudad, pais),
                    amigo:usuarios!amistades_amigo_id_fkey(id, nombre, apellidos, email, ciudad, pais)
                `)
                .or(`usuario_id.eq.${window.usuarioIdActual},amigo_id.eq.${window.usuarioIdActual}`)
                .eq('estado', 'aceptada');
            
            if (error) throw error;
            
            this.procesarAmistades(amistades);
            this.mostrarListaAmigos();
            return window.listaAmigos;
            
        } catch (error) {
            console.error('Error al cargar amigos:', error);
            window.listaAmigos = [];
            this.mostrarErrorAmigos();
            return [];
        }
    },

    procesarAmistades(amistades) {
        window.listaAmigos = [];
        amistades.forEach(amistad => {
            let amigoData;
            if (amistad.usuario_id === window.usuarioIdActual) {
                amigoData = {
                    id: amistad.amigo_id,
                    nombre: amistad.amigo.nombre,
                    apellidos: amistad.amigo.apellidos,
                    email: amistad.amigo.email,
                    ciudad: amistad.amigo.ciudad,
                    pais: amistad.amigo.pais,
                    amistad_id: amistad.id
                };
            } else {
                amigoData = {
                    id: amistad.usuario_id,
                    nombre: amistad.usuario.nombre,
                    apellidos: amistad.usuario.apellidos,
                    email: amistad.usuario.email,
                    ciudad: amistad.usuario.ciudad,
                    pais: amistad.usuario.pais,
                    amistad_id: amistad.id
                };
            }
            window.listaAmigos.push(amigoData);
        });
    },

    mostrarListaAmigos() {
        const seccionAmigos = document.getElementById('seccionAmigosLista');
        if (!seccionAmigos) return;
        
        if (window.listaAmigos.length === 0) {
            seccionAmigos.innerHTML = window.Utilidades.plantillaEstadoVacio('user-friends', 'No tienes amigos', 'Agrega amigos para chatear');
            return;
        }
        
        // Siempre usar nuestra propia función de renderizado
        this.mostrarListaAmigosFallback();
    },

    // Versión de fallback que muestra 3 botones
    mostrarListaAmigosFallback() {
        const seccionAmigos = document.getElementById('seccionAmigosLista');
        let html = '';
        
        window.listaAmigos.forEach(amigo => {
            const nombreCompleto = `${amigo.nombre} ${amigo.apellidos}`;
            const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
            const ubicacion = amigo.ciudad && amigo.pais 
                ? `${amigo.ciudad}, ${amigo.pais}` 
                : 'Ubicación no especificada';
            
            // Escapar comillas simples en las cadenas para evitar errores de JavaScript
            const emailEscapado = amigo.email.replace(/'/g, "\\'");
            const nombreEscapado = amigo.nombre.replace(/'/g, "\\'");
            
            html += `
                <div class="friend-item" data-amigo-id="${amigo.id}">
                    <div class="friend-avatar">
                        <span>${iniciales}</span>
                    </div>
                    <div class="friend-content">
                        <div class="friend-header">
                            <h3 class="friend-name">${nombreCompleto}</h3>
                            <span class="friend-info">${amigo.email}</span>
                        </div>
                        <p class="friend-description">${ubicacion}</p>
                        <div class="friend-actions">
                            <button class="friend-btn friend-btn-chat" onclick="window.Amigos.enviarMensajeAAmigo('${emailEscapado}', '${nombreEscapado}')">
                                <i class="fas fa-paper-plane"></i> Mensaje
                            </button>
                            <button class="friend-btn friend-btn-info" onclick="window.Amigos.mostrarPerfilAmigo('${amigo.id}')">
                                <i class="fas fa-user-circle"></i> Ver Perfil
                            </button>
                            <button class="friend-btn friend-btn-remove" onclick="window.Amigos.eliminarAmigo('${amigo.amistad_id}')">
                                <i class="fas fa-user-times"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        seccionAmigos.innerHTML = html;
    },

    enviarMensajeAAmigo(email, nombre) {
        if (window.Interfaz && window.Interfaz.mostrarSeccion) {
            window.Interfaz.mostrarSeccion('seccionNuevoMensaje');
        }
        
        const destinatarioInput = document.getElementById('destinatario');
        const asuntoInput = document.getElementById('asunto');
        const contenidoInput = document.getElementById('contenido');
        
        if (destinatarioInput) destinatarioInput.value = email;
        if (asuntoInput) asuntoInput.value = `Hola ${nombre}`;
        if (contenidoInput) {
            contenidoInput.value = `Hola ${nombre},\n\n`;
            contenidoInput.focus();
        }
    },

    async eliminarAmigo(amistadId) {
        const confirmacion = await window.Utilidades.mostrarConfirmacion(
            '¿Eliminar amigo?',
            'Esta acción no se puede deshacer',
            'Sí, eliminar'
        );
        
        if (confirmacion.isConfirmed) {
            try {
                const { error } = await window.supabase
                    .from('amistades')
                    .delete()
                    .eq('id', amistadId);
                
                if (error) throw error;
                
                await this.cargarAmigos();
                window.Utilidades.mostrarAlerta('Amigo eliminado', 'El amigo ha sido eliminado', 'success');
                
            } catch (error) {
                console.error('Error al eliminar amigo:', error);
                window.Utilidades.mostrarAlerta('Error', 'No se pudo eliminar el amigo', 'error');
            }
        }
    },

    async cargarSolicitudesPendientes() {
        try {
            // Cargar solicitudes de amistad
            const { data: solicitudesAmistad, error: errorAmistad } = await window.supabase
                .from('amistades')
                .select(`
                    id,
                    usuario_id,
                    amigo_id,
                    estado,
                    usuario:usuarios!amistades_usuario_id_fkey(nombre, apellidos, email)
                `)
                .eq('amigo_id', window.usuarioIdActual)
                .eq('estado', 'pendiente');
            
            if (errorAmistad) throw errorAmistad;
            
            // Cargar invitaciones a grupos
            const { data: invitacionesGrupo, error: errorGrupo } = await window.supabase
                .from('miembros_grupo')
                .select(`
                    id,
                    grupo_id,
                    usuario_id,
                    estado,
                    grupo:grupos!inner(nombre, creador_id),
                    usuario:usuarios!miembros_grupo_usuario_id_fkey(nombre, apellidos)
                `)
                .eq('usuario_id', window.usuarioIdActual)
                .eq('estado', 'pendiente');
            
            if (errorGrupo) throw errorGrupo;
            
            // Combinar ambas listas
            window.solicitudesPendientes = [
                ...(solicitudesAmistad || []).map(s => ({
                    ...s,
                    tipo: 'amistad'
                })),
                ...(invitacionesGrupo || []).map(i => ({
                    ...i,
                    tipo: 'grupo'
                }))
            ];
            
            this.actualizarContadorSolicitudes();
            this.mostrarNotificaciones();
            
            return window.solicitudesPendientes;
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            window.solicitudesPendientes = [];
            this.actualizarContadorSolicitudes();
            return [];
        }
    },

    actualizarContadorSolicitudes() {
        const totalSolicitudes = window.solicitudesPendientes ? window.solicitudesPendientes.length : 0;
        const badge = document.querySelector('#btnNotificaciones .badge');
        if (badge) {
            badge.textContent = totalSolicitudes > 0 ? totalSolicitudes : '';
            badge.style.display = totalSolicitudes > 0 ? 'flex' : 'none';
        }
    },

    mostrarNotificaciones() {
        // Crear dropdown si no existe
        if (!document.getElementById('dropdownNotificaciones')) {
            this.crearDropdownNotificaciones();
        }
        
        const lista = document.getElementById('listaNotificaciones');
        if (!lista) return;
        
        if (!window.solicitudesPendientes || window.solicitudesPendientes.length === 0) {
            lista.innerHTML = `
                <div class="notification-item">
                    <div class="notification-text">No hay notificaciones</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        window.solicitudesPendientes.forEach(notificacion => {
            if (notificacion.tipo === 'amistad') {
                const nombreUsuario = `${notificacion.usuario.nombre} ${notificacion.usuario.apellidos}`;
                const nombreEscapado = nombreUsuario.replace(/'/g, "\\'");
                html += `
                    <div class="notification-item unread">
                        <div class="notification-text">
                            <strong>${nombreUsuario}</strong> quiere ser tu amigo
                        </div>
                        <div class="notification-time">Ahora</div>
                        <div class="notification-actions">
                            <button class="btn-notification-accept" onclick="window.Amigos.aceptarSolicitudAmistad('${notificacion.id}')">
                                Aceptar
                            </button>
                            <button class="btn-notification-decline" onclick="window.Amigos.rechazarSolicitudAmistad('${notificacion.id}')">
                                Rechazar
                            </button>
                        </div>
                    </div>
                `;
            } else if (notificacion.tipo === 'grupo') {
                const esCreador = notificacion.grupo.creador_id === notificacion.usuario_id;
                const nombreInvitador = esCreador ? 'Creador del grupo' : 
                    (notificacion.usuario ? `${notificacion.usuario.nombre} ${notificacion.usuario.apellidos}` : 'Usuario');
                const nombreInvitadorEscapado = nombreInvitador.replace(/'/g, "\\'");
                const nombreGrupoEscapado = notificacion.grupo.nombre.replace(/'/g, "\\'");
                
                html += `
                    <div class="notification-item unread">
                        <div class="notification-text">
                            <strong>${nombreInvitador}</strong> te ha invitado al grupo <strong>${notificacion.grupo.nombre}</strong>
                        </div>
                        <div class="notification-time">Ahora</div>
                        <div class="notification-actions">
                            <button class="btn-notification-accept" onclick="window.Amigos.verInvitacionGrupo('${notificacion.grupo_id}')">
                                Ver grupo
                            </button>
                            <button class="btn-notification-decline" onclick="window.Amigos.rechazarInvitacionGrupo('${notificacion.id}')">
                                Rechazar
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        
        lista.innerHTML = html;
    },

    crearDropdownNotificaciones() {
        const dropdownHTML = `
            <div class="notification-dropdown" id="dropdownNotificaciones" style="display: none;">
                <div class="notification-header">
                    <h4>Notificaciones</h4>
                    <button class="btn-icon" onclick="document.getElementById('dropdownNotificaciones').style.display = 'none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-list" id="listaNotificaciones">
                    <!-- Notificaciones se cargarán aquí -->
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dropdownHTML);
        
        // Configurar toggle del dropdown
        const btnNotificaciones = document.getElementById('btnNotificaciones');
        if (btnNotificaciones) {
            btnNotificaciones.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('dropdownNotificaciones');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    // Actualizar notificaciones cuando se abre
                    if (dropdown.style.display === 'block') {
                        this.mostrarNotificaciones();
                    }
                }
            });
        }
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('dropdownNotificaciones');
            if (dropdown && !dropdown.contains(e.target) && e.target.id !== 'btnNotificaciones') {
                dropdown.style.display = 'none';
            }
        });
    },

    verInvitacionGrupo(grupoId) {
        const dropdown = document.getElementById('dropdownNotificaciones');
        if (dropdown) dropdown.style.display = 'none';
        
        if (window.Grupos && window.Grupos.verDetalleGrupo) {
            window.Grupos.verDetalleGrupo(grupoId);
        }
    },

    async rechazarInvitacionGrupo(miembroId) {
        try {
            const { error } = await window.supabase
                .from('miembros_grupo')
                .update({ estado: 'rechazado' })
                .eq('id', miembroId)
                .eq('usuario_id', window.usuarioIdActual);
            
            if (error) throw error;
            
            // Eliminar de la lista local
            if (window.solicitudesPendientes) {
                window.solicitudesPendientes = window.solicitudesPendientes.filter(n => n.id !== miembroId);
            }
            
            this.mostrarNotificaciones();
            this.actualizarContadorSolicitudes();
            
            window.Utilidades.mostrarAlerta('Invitación rechazada', 'Has rechazado la invitación al grupo', 'info');
            
        } catch (error) {
            console.error('Error al rechazar invitación:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo rechazar la invitación', 'error');
        }
    },

    async aceptarSolicitudAmistad(solicitudId) {
        try {
            const { error } = await window.supabase
                .from('amistades')
                .update({ estado: 'aceptada' })
                .eq('id', solicitudId);
            
            if (error) throw error;
            
            // Eliminar de la lista local
            if (window.solicitudesPendientes) {
                window.solicitudesPendientes = window.solicitudesPendientes.filter(n => n.id !== solicitudId);
            }
            
            // Recargar amigos
            await this.cargarAmigos();
            this.mostrarNotificaciones();
            this.actualizarContadorSolicitudes();
            
            window.Utilidades.mostrarAlerta('Solicitud aceptada', 'Ahora son amigos', 'success');
            
        } catch (error) {
            console.error('Error al aceptar solicitud:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo aceptar la solicitud', 'error');
        }
    },

    async rechazarSolicitudAmistad(solicitudId) {
        try {
            const { error } = await window.supabase
                .from('amistades')
                .delete()
                .eq('id', solicitudId);
            
            if (error) throw error;
            
            // Eliminar de la lista local
            if (window.solicitudesPendientes) {
                window.solicitudesPendientes = window.solicitudesPendientes.filter(n => n.id !== solicitudId);
            }
            
            this.mostrarNotificaciones();
            this.actualizarContadorSolicitudes();
            
            window.Utilidades.mostrarAlerta('Solicitud rechazada', 'Has rechazado la solicitud de amistad', 'info');
            
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo rechazar la solicitud', 'error');
        }
    },

    mostrarErrorAmigos() {
        const seccionAmigos = document.getElementById('seccionAmigosLista');
        if (seccionAmigos) {
            seccionAmigos.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'Intenta recargar la página');
        }
    },

    // Función auxiliar para mostrar perfil (si no existe en otro lugar)
    mostrarPerfilAmigo(usuarioId) {
        console.log('Mostrar perfil del usuario:', usuarioId);
        // Aquí puedes implementar la lógica para mostrar el perfil del usuario
        // Por ejemplo, abrir un modal o redirigir a una sección específica
        if (window.Utilidades && window.Utilidades.mostrarAlerta) {
            window.Utilidades.mostrarAlerta('Perfil de amigo', `Funcionalidad de perfil para usuario ${usuarioId}`, 'info');
        }
    }
};

// Hacer disponible globalmente
window.Amigos = Amigos;