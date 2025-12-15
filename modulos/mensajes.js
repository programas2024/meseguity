// modulos/mensajes.js
const Mensajes = {
    // Variable para almacenar datos del mensaje que se está respondiendo
    mensajeRespondiendo: null,

    async cargarBandejaEntrada() {
        try {
            console.log("📥 Cargando bandeja de entrada...");
            
            const { data: mensajes, error } = await window.supabase
                .from('mensajes')
                .select('*')
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
        
        const procesarMensajes = async () => {
            for (const msg of mensajes) {
                let nombreRemitente = 'Usuario';
                let emailRemitente = '';
                
                if (msg.remitente_id) {
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
                const esNoLeido = !msg.leido;
                
                // Determinar si es un mensaje de respuesta
                const esRespuesta = asunto.toLowerCase().startsWith('re:');
                
                html += `
                    <div class="message-item ${esNoLeido ? 'unread' : ''}" 
                         data-msg-id="${msg.id}">
                        <div class="message-avatar" style="background: ${esRespuesta ? 'linear-gradient(135deg, #4CAF50, #2E7D32)' : 'linear-gradient(135deg, #1a73e8, #0d47a1)'}">
                            ${iniciales}
                        </div>
                        <div class="message-content">
                            <div class="message-header">
                                <div class="message-sender-info">
                                    <div class="message-sender">${nombreRemitente}</div>
                                    ${esRespuesta ? '<span class="message-tag reply-tag">Respuesta</span>' : ''}
                                </div>
                                <div class="message-time">${fechaFormateada}</div>
                            </div>
                            <div class="message-subject">${asunto}</div>
                            <div class="message-preview">${contenido.substring(0, 150)}${contenido.length > 150 ? '...' : ''}</div>
                        </div>
                        <div class="message-actions">
                            <button class="message-action-btn" onclick="event.stopPropagation(); Mensajes.verDetalleMensaje('${msg.id}')" title="Ver mensaje">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="message-action-btn reply-btn" onclick="event.stopPropagation(); Mensajes.prepararRespuesta('${msg.id}')" title="Responder">
                                <i class="fas fa-reply"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
            
            lista.innerHTML = html;
            
            // Agregar evento de clic a los mensajes
            document.querySelectorAll('.message-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.message-actions')) {
                        const msgId = item.dataset.msgId;
                        Mensajes.verDetalleMensaje(msgId);
                    }
                });
            });
        };
        
        procesarMensajes();
    },

    async verDetalleMensaje(mensajeId) {
        try {
            console.log(`📄 Viendo detalle del mensaje: ${mensajeId}`);
            
            const { data: mensaje, error } = await window.supabase
                .from('mensajes')
                .select('*')
                .eq('id', mensajeId)
                .single();
            
            if (error) throw error;
            
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
        const esRespuesta = asunto.toLowerCase().startsWith('re:');
        
        let modal = document.getElementById('modalDetalleMensaje');
        if (!modal) {
            this.crearModal();
            modal = document.getElementById('modalDetalleMensaje');
        }
        
        const cuerpo = document.getElementById('modalDetalleCuerpo');
        cuerpo.innerHTML = `
            <div class="message-detail-header">
                <div class="detail-avatar" style="background: ${esRespuesta ? 'linear-gradient(135deg, #4CAF50, #2E7D32)' : 'linear-gradient(135deg, #1a73e8, #0d47a1)'}">
                    ${iniciales}
                </div>
                <div class="detail-info">
                    <div class="detail-sender-info">
                        <div class="detail-sender">${nombreRemitente}</div>
                        ${esRespuesta ? '<span class="detail-tag reply-tag">Respuesta</span>' : ''}
                    </div>
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
        
        // Guardar información para respuesta
        modal.dataset.mensajeId = mensaje.id;
        modal.dataset.remitenteEmail = emailRemitente;
        modal.dataset.asuntoOriginal = asunto;
        modal.dataset.contenidoOriginal = contenido;
        
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
                    <h3><i class="fas fa-envelope"></i> Detalle del Mensaje</h3>
                    <button class="modal-close" onclick="Mensajes.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="modalDetalleCuerpo"></div>
                <div class="modal-actions">
                    <button class="btn-action btn-reply" onclick="Mensajes.responderDesdeModal()">
                        <i class="fas fa-reply"></i> Responder
                    </button>
                    <button class="btn-action btn-delete" onclick="Mensajes.eliminarMensajeDesdeModal()">
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
            delete modal.dataset.mensajeId;
            delete modal.dataset.remitenteEmail;
            delete modal.dataset.asuntoOriginal;
            delete modal.dataset.contenidoOriginal;
        }
    },

    // FUNCIÓN NUEVA: Preparar respuesta desde la bandeja
    async prepararRespuesta(mensajeId) {
        try {
            console.log(`📨 Preparando respuesta para mensaje: ${mensajeId}`);
            
            const { data: mensaje, error } = await window.supabase
                .from('mensajes')
                .select('*')
                .eq('id', mensajeId)
                .single();
            
            if (error) throw error;
            
            // Obtener datos del remitente
            let emailRemitente = '';
            if (mensaje.remitente_id) {
                const { data: remitente } = await window.supabase
                    .from('usuarios')
                    .select('email')
                    .eq('id', mensaje.remitente_id)
                    .single();
                
                if (remitente) {
                    emailRemitente = remitente.email;
                }
            }
            
            // Guardar datos para respuesta
            this.mensajeRespondiendo = {
                id: mensaje.id,
                remitenteEmail: emailRemitente,
                asuntoOriginal: mensaje.asunto,
                contenidoOriginal: mensaje.contenido,
                fechaOriginal: mensaje.created_at
            };
            
            // Navegar a nueva sección
            if (window.Interfaz && window.Interfaz.mostrarSeccion) {
                window.Interfaz.mostrarSeccion('seccionNuevoMensaje');
            }
            
            // Rellenar formulario
            setTimeout(() => {
                this.rellenarFormularioRespuesta();
            }, 100);
            
        } catch (error) {
            console.error('Error al preparar respuesta:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cargar el mensaje para responder', 'error');
        }
    },

    // FUNCIÓN NUEVA: Rellenar formulario de respuesta
    rellenarFormularioRespuesta() {
        if (!this.mensajeRespondiendo) return;
        
        const destinatarioInput = document.getElementById('destinatario');
        const asuntoInput = document.getElementById('asunto');
        const contenidoInput = document.getElementById('contenido');
        
        if (!destinatarioInput || !asuntoInput || !contenidoInput) {
            console.error('No se encontraron los campos del formulario');
            return;
        }
        
        // 1. Rellenar destinatario
        destinatarioInput.value = this.mensajeRespondiendo.remitenteEmail || '';
        
        // 2. Rellenar asunto (agregar Re: si no lo tiene)
        let asuntoRespuesta = this.mensajeRespondiendo.asuntoOriginal || 'Sin asunto';
        if (!asuntoRespuesta.toLowerCase().startsWith('re:')) {
            asuntoRespuesta = 'Re: ' + asuntoRespuesta;
        }
        asuntoInput.value = asuntoRespuesta;
        
        // 3. Preparar contenido con cita del mensaje original
        if (this.mensajeRespondiendo.contenidoOriginal) {
            const fechaOriginal = window.Utilidades.formatearFecha(this.mensajeRespondiendo.fechaOriginal);
            const cita = `\n\n---\n*El ${fechaOriginal}, ${this.mensajeRespondiendo.remitenteEmail} escribió:*\n`;
            
            // Formatear contenido original con sangría
            const contenidoConSangria = this.mensajeRespondiendo.contenidoOriginal
                .split('\n')
                .map(linea => `> ${linea}`)
                .join('\n');
            
            contenidoInput.value = cita + contenidoConSangria + '\n\n';
            
            // Enfocar y ajustar altura
            contenidoInput.focus();
            contenidoInput.style.height = 'auto';
            contenidoInput.style.height = (contenidoInput.scrollHeight) + 'px';
        }
        
        // Mostrar notificación
        window.Utilidades.mostrarNotificacion(
            'Respondiendo mensaje',
            'Preparando respuesta...',
            'info',
            2000
        );
    },

    // FUNCIÓN NUEVA: Responder desde modal
    responderDesdeModal() {
        const modal = document.getElementById('modalDetalleMensaje');
        if (!modal) return;
        
        this.mensajeRespondiendo = {
            id: modal.dataset.mensajeId,
            remitenteEmail: modal.dataset.remitenteEmail,
            asuntoOriginal: modal.dataset.asuntoOriginal,
            contenidoOriginal: modal.dataset.contenidoOriginal,
            fechaOriginal: new Date().toISOString()
        };
        
        this.cerrarModal();
        
        if (window.Interfaz && window.Interfaz.mostrarSeccion) {
            window.Interfaz.mostrarSeccion('seccionNuevoMensaje');
        }
        
        setTimeout(() => {
            this.rellenarFormularioRespuesta();
        }, 100);
    },

    // FUNCIÓN NUEVA: Enviar mensaje de respuesta
    async enviarMensajeRespuesta(destinatarioEmail, asunto, contenido) {
        try {
            const usuario = window.usuarioActual;
            if (!usuario) {
                throw new Error('No hay usuario autenticado');
            }

            console.log(`✉️ Enviando respuesta a: ${destinatarioEmail}`);
            
            const { data, error } = await window.supabase
                .from('mensajes')
                .insert({
                    remitente_id: usuario.id,
                    destinatario_email: destinatarioEmail,
                    asunto: asunto,
                    contenido: contenido,
                    leido: false,
                    created_at: new Date().toISOString(),
                    es_respuesta: true,
                    mensaje_respondido_id: this.mensajeRespondiendo?.id || null
                })
                .select()
                .single();

            if (error) throw error;

            // Limpiar datos de respuesta
            this.mensajeRespondiendo = null;
            
            // Mostrar confirmación
            window.Utilidades.mostrarAlerta(
                '¡Respuesta enviada!',
                'Tu respuesta ha sido enviada correctamente y aparecerá en "Enviados"',
                'success'
            );
            
            // Cargar mensajes enviados para mostrar la respuesta
            await this.cargarMensajesEnviados();
            
            return { success: true, data };

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo enviar la respuesta', 'error');
            return { success: false, error };
        }
    },

    // FUNCIÓN MODIFICADA: Enviar mensaje (ahora funciona para nuevos mensajes y respuestas)
    async enviarMensaje(destinatarioEmail, asunto, contenido) {
        try {
            const usuario = window.usuarioActual;
            if (!usuario) {
                throw new Error('No hay usuario autenticado');
            }

            console.log(`✉️ Enviando mensaje a: ${destinatarioEmail}`);
            
            // Si estamos respondiendo un mensaje, usar función especial
            if (this.mensajeRespondiendo) {
                return await this.enviarMensajeRespuesta(destinatarioEmail, asunto, contenido);
            }
            
            // Si es un mensaje nuevo
            const { data, error } = await window.supabase
                .from('mensajes')
                .insert({
                    remitente_id: usuario.id,
                    destinatario_email: destinatarioEmail,
                    asunto: asunto,
                    contenido: contenido,
                    leido: false,
                    created_at: new Date().toISOString(),
                    es_respuesta: false
                })
                .select()
                .single();

            if (error) throw error;

            window.Utilidades.mostrarAlerta('¡Mensaje enviado!', 'Tu mensaje ha sido enviado correctamente', 'success');
            
            // Cargar mensajes enviados
            await this.cargarMensajesEnviados();
            
            return { success: true, data };

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo enviar el mensaje', 'error');
            return { success: false, error };
        }
    },

    // FUNCIÓN NUEVA: Cargar mensajes enviados
    async cargarMensajesEnviados() {
        try {
            console.log("📤 Cargando mensajes enviados...");
            
            const { data: mensajes, error } = await window.supabase
                .from('mensajes')
                .select('*')
                .eq('remitente_id', window.usuarioActual.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.mostrarMensajesEnviados(mensajes);
            return mensajes || [];
        } catch (error) {
            console.error('Error al cargar mensajes enviados:', error);
            return [];
        }
    },

    mostrarMensajesEnviados(mensajes) {
        const lista = document.getElementById('listaEnviados');
        if (!lista) return;
        
        if (!mensajes || mensajes.length === 0) {
            lista.innerHTML = window.Utilidades.plantillaEstadoVacio('paper-plane', 'No has enviado mensajes', 'Envía tu primer mensaje');
            return;
        }
        
        let html = '';
        
        mensajes.forEach((msg) => {
            const fechaFormateada = window.Utilidades.formatearFecha(msg.created_at);
            const asunto = msg.asunto || 'Sin asunto';
            const contenido = msg.contenido || '';
            const destinatario = msg.destinatario_email || 'Desconocido';
            const esRespuesta = msg.asunto?.toLowerCase().startsWith('re:') || msg.es_respuesta;
            
            html += `
                <div class="message-item sent-item" data-msg-id="${msg.id}">
                    <div class="message-avatar" style="background: ${esRespuesta ? 'linear-gradient(135deg, #4CAF50, #2E7D32)' : 'linear-gradient(135deg, #9C27B0, #673AB7)'}">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <div class="message-sender-info">
                                <div class="message-sender">Para: ${destinatario}</div>
                                ${esRespuesta ? '<span class="message-tag reply-tag">Respuesta enviada</span>' : ''}
                            </div>
                            <div class="message-time">${fechaFormateada}</div>
                        </div>
                        <div class="message-subject">${asunto}</div>
                        <div class="message-preview">${contenido.substring(0, 120)}${contenido.length > 120 ? '...' : ''}</div>
                    </div>
                    <div class="message-status">
                        ${msg.leido ? 
                            '<span class="status-read"><i class="fas fa-check-double"></i> Leído</span>' : 
                            '<span class="status-unread"><i class="fas fa-check"></i> Enviado</span>'
                        }
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    },

    // FUNCIÓN NUEVA: Eliminar mensaje desde modal
    eliminarMensajeDesdeModal() {
        const modal = document.getElementById('modalDetalleMensaje');
        if (!modal) return;
        
        const mensajeId = modal.dataset.mensajeId;
        
        window.Utilidades.mostrarConfirmacion(
            'Eliminar mensaje',
            '¿Estás seguro de que quieres eliminar este mensaje?',
            'warning'
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.eliminarMensaje(mensajeId);
                    this.cerrarModal();
                    await this.cargarBandejaEntrada();
                } catch (error) {
                    console.error('Error al eliminar mensaje:', error);
                }
            }
        });
    },

    // FUNCIÓN NUEVA: Eliminar mensaje
    async eliminarMensaje(mensajeId) {
        try {
            const { error } = await window.supabase
                .from('mensajes')
                .delete()
                .eq('id', mensajeId);
            
            if (error) throw error;
            
            window.Utilidades.mostrarNotificacion(
                'Mensaje eliminado',
                'El mensaje ha sido eliminado correctamente',
                'success',
                2000
            );
            
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo eliminar el mensaje', 'error');
            throw error;
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
                contador.style.display = count > 0 ? 'flex' : 'none';
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

    // Inicialización
    inicializar() {
        console.log("🔄 Inicializando módulo de mensajes...");
        
        // Configurar formulario de nuevo mensaje
        const formNuevoMensaje = document.getElementById('formNuevoMensaje');
        if (formNuevoMensaje) {
            formNuevoMensaje.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const destinatario = document.getElementById('destinatario').value.trim();
                const asunto = document.getElementById('asunto').value.trim();
                const contenido = document.getElementById('contenido').value.trim();
                
                if (!destinatario || !asunto || !contenido) {
                    window.Utilidades.mostrarAlerta('Campos requeridos', 'Por favor completa todos los campos', 'warning');
                    return;
                }
                
                // Validar email
                if (!window.Utilidades.validarEmail(destinatario)) {
                    window.Utilidades.mostrarAlerta('Email inválido', 'Por favor ingresa un email válido', 'error');
                    return;
                }
                
                // Enviar mensaje
                const resultado = await this.enviarMensaje(destinatario, asunto, contenido);
                
                if (resultado.success) {
                    // Limpiar formulario
                    formNuevoMensaje.reset();
                    
                    // Regresar a bandeja de entrada
                    if (window.Interfaz && window.Interfaz.mostrarSeccion) {
                        window.Interfaz.mostrarSeccion('seccionBandeja');
                    }
                    
                    // Recargar bandeja
                    await this.cargarBandejaEntrada();
                }
            });
        }
        
        // Configurar botón cancelar
        const btnCancelar = document.getElementById('btnCancelarMensaje');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                this.mensajeRespondiendo = null; // Limpiar datos de respuesta
                if (window.Interfaz && window.Interfaz.mostrarSeccion) {
                    window.Interfaz.mostrarSeccion('seccionBandeja');
                }
            });
        }
        
        console.log("✅ Módulo de mensajes inicializado");
    }
};

// Hacer disponible globalmente
window.Mensajes = Mensajes;