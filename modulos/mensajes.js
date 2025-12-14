// modulos/mensajes.js
const Mensajes = {
    async cargarBandejaEntrada() {
        try {
            // OPCIÓN 1: Sin JOIN - más simple y seguro
            const { data: mensajes, error } = await window.supabase
                .from('mensajes')
                .select('*')  // Solo datos básicos primero
                .eq('destinatario_email', window.usuarioActual.email)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // OPCIÓN 2: Con JOIN simplificado (si necesitas datos del remitente)
            // Descomenta esto si necesitas los datos del remitente:
            /*
            const { data: mensajes, error } = await window.supabase
                .from('mensajes')
                .select(`
                    *,
                    usuarios!inner(nombre, apellidos, email)
                `)
                .eq('destinatario_email', window.usuarioActual.email)
                .order('created_at', { ascending: false });
            */
            
            this.mostrarMensajesBandeja(mensajes);
            return mensajes || [];
        } catch (error) {
            console.error('Error al cargar bandeja:', error);
            this.mostrarErrorBandeja();
            return [];
        }
    },

    mostrarMensajesBandeja(mensajes) {
        const lista = document.getElementById('listaMensajes');
        
        if (!mensajes || mensajes.length === 0) {
            lista.innerHTML = window.Utilidades.plantillaEstadoVacio('inbox', 'No hay mensajes', 'Tu bandeja está vacía');
            return;
        }
        
        let html = '';
        
        // Para cada mensaje, cargamos los datos del remitente por separado si es necesario
        const procesarMensajes = async () => {
            for (const msg of mensajes) {
                let nombreRemitente = 'Usuario';
                let emailRemitente = '';
                
                // Si el mensaje ya trae datos del remitente (JOIN)
                if (msg.usuarios) {
                    nombreRemitente = `${msg.usuarios.nombre || ''} ${msg.usuarios.apellidos || ''}`.trim() || 'Usuario';
                    emailRemitente = msg.usuarios.email || '';
                } 
                // Si no trae datos, los obtenemos por separado
                else if (msg.remitente_id) {
                    try {
                        const { data: remitente } = await window.supabase
                            .from('usuarios')
                            .select('nombre, apellidos, email')
                            .eq('id', msg.remitente_id)
                            .single();
                        
                        if (remitente) {
                            nombreRemitente = `${remitente.nombre || ''} ${remitente.apellidos || ''}`.trim() || 'Usuario';
                            emailRemitente = remitente.email || '';
                        }
                    } catch (err) {
                        console.warn('No se pudo cargar datos del remitente:', err);
                    }
                }
                
                const iniciales = window.Utilidades.obtenerIniciales(nombreRemitente);
                const fechaFormateada = window.Utilidades.formatearFecha(msg.created_at);
                const asunto = msg.asunto || 'Sin asunto';
                const contenido = msg.contenido || '';
                
                html += `
                    <div class="message-item ${msg.leido ? '' : 'unread'}" 
                         data-msg-id="${msg.id}"
                         onclick="Mensajes.verDetalleMensaje('${msg.id}')">
                        <div class="message-avatar">${iniciales}</div>
                        <div class="message-content">
                            <div class="message-header">
                                <div class="message-sender">${nombreRemitente}</div>
                                <div class="message-time">${fechaFormateada}</div>
                            </div>
                            <div class="message-subject">${asunto}</div>
                            <div class="message-preview">${contenido.substring(0, 150)}${contenido.length > 150 ? '...' : ''}</div>
                        </div>
                    </div>
                `;
            }
            
            lista.innerHTML = html;
        };
        
        procesarMensajes();
    },

    async verDetalleMensaje(mensajeId) {
        try {
            // PRIMERO: Obtener el mensaje básico
            const { data: mensaje, error } = await window.supabase
                .from('mensajes')
                .select('*')
                .eq('id', mensajeId)
                .single();
            
            if (error) throw error;
            
            // SEGUNDO: Obtener datos del remitente por separado
            let datosRemitente = null;
            if (mensaje.remitente_id) {
                const { data: remitente } = await window.supabase
                    .from('usuarios')
                    .select('nombre, apellidos, email')
                    .eq('id', mensaje.remitente_id)
                    .single();
                
                datosRemitente = remitente;
            }
            
            if (!mensaje.leido) {
                await this.marcarComoLeido(mensajeId);
            }
            
            this.mostrarModalDetalle(mensaje, datosRemitente);
        } catch (error) {
            console.error('Error al cargar detalle:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cargar el mensaje', 'error');
        }
    },

    async marcarComoLeido(mensajeId) {
        try {
            const { error } = await window.supabase
                .from('mensajes')
                .update({ leido: true })
                .eq('id', mensajeId);
            
            if (error) throw error;
            
            await this.actualizarContadorNoLeidos();
            
        } catch (error) {
            console.error('Error al marcar como leído:', error);
        }
    },

    mostrarModalDetalle(mensaje, remitente = null) {
        const nombreRemitente = remitente 
            ? `${remitente.nombre || ''} ${remitente.apellidos || ''}`.trim() || 'Usuario'
            : 'Sistema Messery';
        const emailRemitente = remitente?.email || 'sistema@messery.com';
        const iniciales = window.Utilidades.obtenerIniciales(nombreRemitente);
        const fechaFormateada = window.Utilidades.formatearFecha(mensaje.created_at);
        const asunto = mensaje.asunto || 'Sin asunto';
        const contenido = mensaje.contenido || '';
        
        let modal = document.getElementById('modalDetalleMensaje');
        if (!modal) {
            this.crearModal();
            modal = document.getElementById('modalDetalleMensaje');
        }
        
        const cuerpo = document.getElementById('modalDetalleCuerpo');
        cuerpo.innerHTML = `
            <div class="message-detail-header">
                <div class="detail-avatar" style="background: linear-gradient(135deg, #1a73e8, #0d47a1);">
                    ${iniciales}
                </div>
                <div class="detail-info">
                    <div class="detail-sender">${nombreRemitente}</div>
                    <div class="detail-email">${emailRemitente}</div>
                    <div class="detail-subject">${asunto}</div>
                    <div class="detail-meta">
                        <span><i class="far fa-clock"></i> ${fechaFormateada}</span>
                        <span><i class="far fa-envelope"></i> ${mensaje.leido ? 'Leído' : 'No leído'}</span>
                    </div>
                </div>
            </div>
            <div class="detail-content">
                ${contenido.replace(/\n/g, '<br>')}
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    crearModal() {
        const modal = document.createElement('div');
        modal.id = 'modalDetalleMensaje';
        modal.className = 'message-modal';
        modal.innerHTML = `
            <div class="message-modal-content">
                <div class="modal-header">
                    <h3>Detalle del Mensaje</h3>
                    <button class="modal-close" onclick="Mensajes.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="modalDetalleCuerpo"></div>
                <div class="modal-actions">
                    <button class="btn-reply" onclick="Mensajes.responderMensaje()">
                        <i class="fas fa-reply"></i> Responder
                    </button>
                    <button class="btn-delete-msg" onclick="Mensajes.eliminarMensaje()">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    cerrarModal() {
        const modal = document.getElementById('modalDetalleMensaje');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    async actualizarContadorNoLeidos() {
        try {
            const { count, error } = await window.supabase
                .from('mensajes')
                .select('*', { count: 'exact', head: true })
                .eq('destinatario_email', window.usuarioActual.email)
                .eq('leido', false);
            
            if (error) throw error;
            
            const contador = document.getElementById('contadorMensajes');
            if (contador) {
                contador.textContent = count || 0;
            }
            
        } catch (error) {
            console.error('Error al cargar contador:', error);
            const contador = document.getElementById('contadorMensajes');
            if (contador) {
                contador.textContent = '0';
            }
        }
    },

    mostrarErrorBandeja() {
        const lista = document.getElementById('listaMensajes');
        if (lista) {
            lista.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'Intenta recargar la página');
        }
    },

    // Nueva función para enviar mensajes
    async enviarMensaje(destinatarioEmail, asunto, contenido) {
        try {
            const usuario = window.usuarioActual;
            if (!usuario) {
                throw new Error('No hay usuario autenticado');
            }

            const { error } = await window.supabase
                .from('mensajes')
                .insert({
                    remitente_id: usuario.id,
                    destinatario_email: destinatarioEmail,
                    asunto: asunto,
                    contenido: contenido,
                    leido: false,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            window.Utilidades.mostrarAlerta('Éxito', 'Mensaje enviado correctamente', 'success');
            return true;

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo enviar el mensaje', 'error');
            return false;
        }
    },

    // Funciones placeholder para los botones del modal
    responderMensaje() {
        window.Utilidades.mostrarAlerta('Info', 'Función de respuesta en desarrollo', 'info');
    },

    eliminarMensaje() {
        window.Utilidades.mostrarConfirmacion(
            'Eliminar mensaje',
            '¿Estás seguro de que quieres eliminar este mensaje?',
            'Sí, eliminar',
            'Cancelar'
        ).then(result => {
            if (result.isConfirmed) {
                window.Utilidades.mostrarAlerta('Info', 'Función de eliminación en desarrollo', 'info');
            }
        });
    }
};

// Hacer disponible globalmente
window.Mensajes = Mensajes;