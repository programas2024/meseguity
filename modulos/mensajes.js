// modulos/mensajes.js
const Mensajes = {
    async cargarBandejaEntrada() {
        try {
            const { data: mensajes, error } = await window.supabase
                .from('mensajes')
                .select(`
                    *,
                    remitente:usuarios!mensajes_remitente_id_fkey(id, nombre, apellidos, email)
                `)
                .eq('destinatario_email', window.usuarioActual.email)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
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
        mensajes.forEach(msg => {
            const nombreRemitente = msg.remitente 
                ? `${msg.remitente.nombre} ${msg.remitente.apellidos}`
                : 'Sistema Messery';
            const iniciales = window.Utilidades.obtenerIniciales(nombreRemitente);
            const fechaFormateada = window.Utilidades.formatearFecha(msg.created_at);
            
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
                        <div class="message-subject">${msg.asunto}</div>
                        <div class="message-preview">${msg.contenido.substring(0, 150)}...</div>
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    },

    async verDetalleMensaje(mensajeId) {
        try {
            const { data: mensaje, error } = await window.supabase
                .from('mensajes')
                .select(`
                    *,
                    remitente:usuarios!mensajes_remitente_id_fkey(nombre, apellidos, email)
                `)
                .eq('id', mensajeId)
                .single();
            
            if (error) throw error;
            
            if (!mensaje.leido) {
                await this.marcarComoLeido(mensajeId);
            }
            
            this.mostrarModalDetalle(mensaje);
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

    mostrarModalDetalle(mensaje) {
        const nombreRemitente = mensaje.remitente 
            ? `${mensaje.remitente.nombre} ${mensaje.remitente.apellidos}`
            : 'Sistema Messery';
        const emailRemitente = mensaje.remitente?.email || 'sistema@messery.com';
        const iniciales = window.Utilidades.obtenerIniciales(nombreRemitente);
        const fechaFormateada = window.Utilidades.formatearFecha(mensaje.created_at);
        
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
                    <div class="detail-subject">${mensaje.asunto}</div>
                    <div class="detail-meta">
                        <span><i class="far fa-clock"></i> ${fechaFormateada}</span>
                        <span><i class="far fa-envelope"></i> ${mensaje.leido ? 'Leído' : 'No leído'}</span>
                    </div>
                </div>
            </div>
            <div class="detail-content">
                ${mensaje.contenido.replace(/\n/g, '<br>')}
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
            
            document.getElementById('contadorMensajes').textContent = count || 0;
            
        } catch (error) {
            console.error('Error al cargar contador:', error);
            document.getElementById('contadorMensajes').textContent = '0';
        }
    },

    mostrarErrorBandeja() {
        const lista = document.getElementById('listaMensajes');
        lista.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'Intenta recargar la página');
    }
};

// Hacer disponible globalmente
window.Mensajes = Mensajes;