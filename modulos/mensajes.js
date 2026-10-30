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
                    .select('nombre, apellidos, email, avatar_url')
                    .eq('id', mensaje.remitente_id)
                    .single();
                
                datosRemitente = remitente;
            }
            
            if (!mensaje.leido) {
                await this.marcarComoLeido(mensajeId);
            }
            
            this.mostrarModalDetalleElegante(mensaje, datosRemitente);
        } catch (error) {
            console.error('Error al cargar detalle:', error);
            this.mostrarAlertaElegante('Error', 'No se pudo cargar el mensaje', 'error');
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

    mostrarModalDetalleElegante(mensaje, remitente = null) {
        const nombreRemitente = remitente 
            ? `${remitente.nombre || ''} ${remitente.apellidos || ''}`.trim() || 'Usuario'
            : 'Sistema Messery';
        const emailRemitente = remitente?.email || 'sistema@messery.com';
        const avatarUrl = remitente?.avatar_url;
        const iniciales = window.Utilidades.obtenerIniciales(nombreRemitente);
        const fechaFormateada = window.Utilidades.formatearFecha(mensaje.created_at, true);
        const asunto = mensaje.asunto || 'Sin asunto';
        const contenido = mensaje.contenido || '';
        const esRespuesta = asunto.toLowerCase().startsWith('re:');
        
        const avatarHTML = avatarUrl 
            ? `<img src="${avatarUrl}" alt="${nombreRemitente}" onerror="this.onerror=null; this.parentElement.innerHTML='<span>${iniciales}</span>';">`
            : `<span>${iniciales}</span>`;
        
        const profileHTML = `
            <div class="message-detail-modal-content">
                <div class="message-detail-header">
                    <div class="detail-avatar ${avatarUrl ? 'has-image' : ''}" 
                         style="${!avatarUrl ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : ''}">
                        ${avatarHTML}
                    </div>
                    <div class="detail-info">
                        <div class="detail-sender-info">
                            <h3 class="detail-sender">${nombreRemitente}</h3>
                            ${esRespuesta ? '<span class="detail-tag reply-tag"><i class="fas fa-reply"></i> Respuesta</span>' : ''}
                        </div>
                        <div class="detail-email">
                            <i class="fas fa-envelope"></i>
                            <span>${emailRemitente}</span>
                        </div>
                        <div class="detail-subject">
                            <i class="fas fa-tag"></i>
                            <span>${asunto}</span>
                        </div>
                        <div class="detail-meta">
                            <div class="meta-item">
                                <i class="far fa-clock"></i>
                                <span>${fechaFormateada}</span>
                            </div>
                            <div class="meta-item">
                                <i class="far fa-envelope"></i>
                                <span class="${mensaje.leido ? 'status-read' : 'status-unread'}">
                                    ${mensaje.leido ? 'Leído' : 'No leído'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-content-section">
                    <div class="content-header">
                        <i class="fas fa-align-left"></i>
                        <span>Contenido del mensaje</span>
                    </div>
                    <div class="detail-content">
                        ${contenido.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;
        
        Swal.fire({
            html: profileHTML,
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: '<i class="fas fa-reply"></i> Responder',
            showCancelButton: true,
            cancelButtonText: '<i class="fas fa-times"></i> Cerrar',
            showDenyButton: true,
            denyButtonText: '<i class="fas fa-trash"></i> Eliminar',
            width: '800px',
            customClass: {
                popup: 'message-detail-modal',
                confirmButton: 'btn-sweet-reply',
                cancelButton: 'btn-sweet-close',
                denyButton: 'btn-sweet-delete',
                closeButton: 'btn-sweet-close-icon'
            },
            didOpen: () => {
                // Guardar información para respuesta
                Swal.getPopup().dataset.mensajeId = mensaje.id;
                Swal.getPopup().dataset.remitenteEmail = emailRemitente;
                Swal.getPopup().dataset.asuntoOriginal = asunto;
                Swal.getPopup().dataset.contenidoOriginal = contenido;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Responder
                this.mensajeRespondiendo = {
                    id: mensaje.id,
                    remitenteEmail: emailRemitente,
                    asuntoOriginal: asunto,
                    contenidoOriginal: contenido,
                    fechaOriginal: new Date().toISOString()
                };
                
                if (window.Interfaz && window.Interfaz.mostrarSeccion) {
                    window.Interfaz.mostrarSeccion('seccionNuevoMensaje');
                }
                
                setTimeout(() => {
                    this.rellenarFormularioRespuesta();
                }, 100);
                
            } else if (result.isDenied) {
                // Eliminar
                await this.eliminarMensajeConConfirmacion(mensaje.id);
            }
        });
    },

    async eliminarMensajeConConfirmacion(mensajeId) {
        const { value: confirmar } = await Swal.fire({
            title: '<div class="delete-header"><i class="fas fa-exclamation-triangle"></i></div>',
            html: `<div class="delete-confirm-content">
                      <h3>¿Eliminar mensaje?</h3>
                      <p>Esta acción no se puede deshacer. El mensaje será eliminado permanentemente.</p>
                  </div>`,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
            cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
            reverseButtons: true,
            customClass: {
                popup: 'delete-confirm-modal',
                confirmButton: 'btn-delete-confirm',
                cancelButton: 'btn-delete-cancel'
            }
        });

        if (confirmar) {
            try {
                const { error } = await window.supabase
                    .from('mensajes')
                    .delete()
                    .eq('id', mensajeId);
                
                if (error) throw error;
                
                this.mostrarAlertaElegante(
                    '¡Eliminado!',
                    'El mensaje ha sido eliminado correctamente',
                    'success'
                );
                
                await this.cargarBandejaEntrada();
                
            } catch (error) {
                console.error('Error al eliminar mensaje:', error);
                this.mostrarAlertaElegante('Error', 'No se pudo eliminar el mensaje', 'error');
            }
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
            this.mostrarAlertaElegante('Error', 'No se pudo cargar el mensaje para responder', 'error');
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
            const fechaOriginal = window.Utilidades.formatearFecha(this.mensajeRespondiendo.fechaOriginal, true);
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
        
        // Mostrar notificación elegante
        this.mostrarNotificacionElegante(
            'Respondiendo mensaje',
            'Preparando respuesta...',
            'info'
        );
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
                    leido: false
                })
                .select()
                .single();

            if (error) throw error;

            // Limpiar datos de respuesta
            this.mensajeRespondiendo = null;
            
            // Mostrar confirmación elegante
            this.mostrarAlertaElegante(
                '¡Respuesta enviada!',
                'Tu respuesta ha sido enviada correctamente y aparecerá en "Enviados"',
                'success'
            );
            
            // Cargar mensajes enviados para mostrar la respuesta
            await this.cargarMensajesEnviados();
            
            return { success: true, data };

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            this.mostrarAlertaElegante('Error', 'No se pudo enviar la respuesta', 'error');
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
                    leido: false
                })
                .select()
                .single();

            if (error) throw error;

            this.mostrarAlertaElegante('¡Mensaje enviado!', 'Tu mensaje ha sido enviado correctamente', 'success');
            
            // Cargar mensajes enviados
            await this.cargarMensajesEnviados();
            
            return { success: true, data };

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            this.mostrarAlertaElegante('Error', 'No se pudo enviar el mensaje', 'error');
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
            const esRespuesta = msg.asunto?.toLowerCase().startsWith('re:');
            
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

    // Funciones elegantes de SweetAlert
    mostrarAlertaElegante(titulo, mensaje, tipo = 'info') {
        const iconos = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const colores = {
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        Swal.fire({
            title: `<div class="sweet-header">
                        <div class="sweet-icon" style="color: ${colores[tipo]}">
                            <i class="${iconos[tipo]}"></i>
                        </div>
                        <h3>${titulo}</h3>
                    </div>`,
            html: `<div class="sweet-content">
                      <p>${mensaje}</p>
                   </div>`,
            confirmButtonText: '<i class="fas fa-check"></i> Aceptar',
            customClass: {
                popup: 'sweet-alert-elegant',
                confirmButton: 'btn-sweet-confirm'
            }
        });
    },

    mostrarNotificacionElegante(titulo, mensaje, tipo = 'info', timer = 3000) {
        const iconos = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        Swal.fire({
            title: `<div class="sweet-notification-header">
                        <i class="${iconos[tipo]}"></i>
                        <span>${titulo}</span>
                    </div>`,
            text: mensaje,
            timer: timer,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            customClass: {
                popup: 'sweet-notification-elegant'
            }
        });
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
                    this.mostrarAlertaElegante('Campos requeridos', 'Por favor completa todos los campos', 'warning');
                    return;
                }
                
                // Validar email
                if (!window.Utilidades.validarEmail(destinatario)) {
                    this.mostrarAlertaElegante('Email inválido', 'Por favor ingresa un email válido', 'error');
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
        
        // Agregar estilos CSS
        this.agregarEstilosElegantes();
        
        console.log("✅ Módulo de mensajes inicializado");
    },

    agregarEstilosElegantes() {
        const estilos = document.createElement('style');
        estilos.textContent = `
            /* SweetAlert Elegante */
            .sweet-alert-elegant {
                border-radius: 20px !important;
                padding: 30px !important;
                border: none !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            }
            
            .sweet-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .sweet-icon {
                font-size: 40px;
            }
            
            .sweet-header h3 {
                margin: 0;
                color: #2C3E50;
                font-size: 24px;
                font-weight: 700;
            }
            
            .sweet-content {
                color: #5d6d7e;
                font-size: 16px;
                line-height: 1.6;
                padding: 0 10px;
            }
            
            .btn-sweet-confirm {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                border: none !important;
                padding: 12px 30px !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
                font-size: 15px !important;
                margin-top: 20px !important;
                transition: all 0.3s ease !important;
            }
            
            .btn-sweet-confirm:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3) !important;
            }
            
            /* Notificaciones Toast */
            .sweet-notification-elegant {
                border-radius: 15px !important;
                padding: 15px 20px !important;
                border-left: 4px solid #667eea;
                background: white !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
            }
            
            .sweet-notification-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 5px;
                color: #2C3E50;
                font-weight: 600;
            }
            
            /* Modal de Detalle de Mensaje */
            .message-detail-modal {
                border-radius: 20px !important;
                padding: 0 !important;
                overflow: hidden !important;
                border: none !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
            }
            
            .message-detail-modal-content {
                padding: 30px;
            }
            
            .message-detail-header {
                display: flex;
                gap: 25px;
                margin-bottom: 30px;
                padding-bottom: 25px;
                border-bottom: 1px solid #e8edf2;
            }
            
            .detail-avatar {
                width: 80px;
                height: 80px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                flex-shrink: 0;
                color: white;
                font-size: 28px;
                font-weight: bold;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .detail-avatar.has-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .detail-info {
                flex: 1;
            }
            
            .detail-sender-info {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 10px;
            }
            
            .detail-sender {
                margin: 0;
                color: #2C3E50;
                font-size: 22px;
                font-weight: 700;
            }
            
            .detail-tag {
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .reply-tag {
                background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                color: white;
            }
            
            .detail-email, .detail-subject {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #667eea;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .detail-meta {
                display: flex;
                gap: 20px;
                margin-top: 15px;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #7f8c8d;
                font-size: 13px;
            }
            
            .status-read {
                color: #2ecc71;
                font-weight: 600;
            }
            
            .status-unread {
                color: #e74c3c;
                font-weight: 600;
            }
            
            .content-header {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #667eea;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .detail-content-section {
                background: #f8f9fa;
                border-radius: 15px;
                padding: 25px;
                border-left: 4px solid #667eea;
            }
            
            .detail-content {
                color: #2C3E50;
                font-size: 15px;
                line-height: 1.8;
                white-space: pre-wrap;
            }
            
            /* Botones del modal de detalle */
            .btn-sweet-reply {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                border: none !important;
                padding: 12px 25px !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
                font-size: 14px !important;
            }
            
            .btn-sweet-close {
                background: white !important;
                color: #5d6d7e !important;
                border: 2px solid #e8edf2 !important;
                padding: 12px 25px !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
                font-size: 14px !important;
            }
            
            .btn-sweet-delete {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
                border: none !important;
                padding: 12px 25px !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
                font-size: 14px !important;
            }
            
            .btn-sweet-close-icon {
                color: #95a5a6 !important;
            }
            
            /* Modal de confirmación de eliminación */
            .delete-confirm-modal {
                border-radius: 20px !important;
                padding: 30px !important;
            }
            
            .delete-header {
                font-size: 60px;
                color: #e74c3c;
                text-align: center;
                margin-bottom: 20px;
            }
            
            .delete-confirm-content h3 {
                margin: 0 0 15px 0;
                color: #2C3E50;
                font-size: 22px;
                text-align: center;
            }
            
            .delete-confirm-content p {
                color: #7f8c8d;
                text-align: center;
                line-height: 1.6;
                margin-bottom: 0;
            }
            
            .btn-delete-confirm {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
                border: none !important;
                padding: 12px 30px !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
            }
            
            .btn-delete-cancel {
                background: white !important;
                color: #5d6d7e !important;
                border: 2px solid #e8edf2 !important;
                padding: 12px 30px !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .message-detail-modal {
                    width: 95% !important;
                    margin: 10px !important;
                }
                
                .message-detail-header {
                    flex-direction: column;
                    text-align: center;
                }
                
                .detail-avatar {
                    margin: 0 auto;
                }
                
                .detail-meta {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;
        document.head.appendChild(estilos);
    }
};

// Hacer disponible globalmente
window.Mensajes = Mensajes;