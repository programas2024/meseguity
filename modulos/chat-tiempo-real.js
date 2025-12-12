// modulos/chat-tiempo-real.js
const ChatTiempoReal = {
    intervaloChat: null,
    ultimoMensajeId: null,

    iniciarChatGrupo(grupoId) {
        // Detener intervalo anterior si existe
        if (this.intervaloChat) {
            clearInterval(this.intervaloChat);
        }
        
        // Guardar referencia al grupo
        this.grupoActual = grupoId;
        this.ultimoMensajeId = null;
        
        // Iniciar intervalo para actualizar mensajes cada segundo
        this.intervaloChat = setInterval(async () => {
            await this.actualizarMensajesGrupo(grupoId);
        }, 1000);
        
        console.log(`Chat en tiempo real iniciado para grupo: ${grupoId}`);
    },

    detenerChatGrupo() {
        if (this.intervaloChat) {
            clearInterval(this.intervaloChat);
            this.intervaloChat = null;
            this.grupoActual = null;
            console.log('Chat en tiempo real detenido');
        }
    },

    async actualizarMensajesGrupo(grupoId) {
        try {
            // Obtener el último mensaje del DOM para comparar
            const chatContainer = document.getElementById('chatGrupo');
            if (!chatContainer) {
                this.detenerChatGrupo();
                return;
            }
            
            // Obtener mensajes desde la base de datos
            const { data: mensajes, error } = await window.supabase
                .from('mensajes_grupo')
                .select(`
                    *,
                    usuario:usuarios!inner(nombre, apellidos)
                `)
                .eq('grupo_id', grupoId)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            // Verificar si hay nuevos mensajes
            if (mensajes.length > 0) {
                const ultimoMensajeBD = mensajes[mensajes.length - 1];
                
                // Si es el primer ciclo o hay nuevo mensaje
                if (!this.ultimoMensajeId || this.ultimoMensajeId !== ultimoMensajeBD.id) {
                    this.ultimoMensajeId = ultimoMensajeBD.id;
                    
                    // Verificar si ya mostramos este mensaje
                    const mensajeExistente = chatContainer.querySelector(`[data-mensaje-id="${ultimoMensajeBD.id}"]`);
                    if (!mensajeExistente) {
                        // Actualizar toda la lista de mensajes
                        this.mostrarMensajesEnTiempoReal(mensajes, chatContainer);
                    }
                }
            }
            
        } catch (error) {
            console.error('Error al actualizar mensajes en tiempo real:', error);
        }
    },

    mostrarMensajesEnTiempoReal(mensajes, chatContainer) {
        if (mensajes.length === 0) {
            chatContainer.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <i class="fas fa-comments fa-3x"></i>
                    <h3>No hay mensajes</h3>
                    <p>Sé el primero en escribir en el grupo</p>
                </div>
            `;
            return;
        }
        
        let htmlMensajes = '';
        mensajes.forEach(msg => {
            const nombreUsuario = `${msg.usuario.nombre} ${msg.usuario.apellidos}`;
            const hora = window.Utilidades.formatearFecha(msg.created_at);
            const esMio = msg.usuario_id === window.usuarioIdActual;
            const esNuevo = this.ultimoMensajeId === msg.id;
            
            htmlMensajes += `
                <div class="mensaje-grupo-item" data-mensaje-id="${msg.id}" style="
                    ${esMio ? 'background: #e8f0fe;' : ''}
                    ${esNuevo ? 'animation: mensajeNuevo 0.5s ease;' : ''}
                ">
                    <div class="mensaje-grupo-header">
                        <div class="mensaje-grupo-usuario">
                            ${nombreUsuario}
                            ${esMio ? '<span style="font-size: 10px; color: #666; margin-left: 5px;">(Tú)</span>' : ''}
                        </div>
                        <div class="mensaje-grupo-hora">
                            ${hora}
                            ${esNuevo ? '<span style="color: #34a853; margin-left: 5px;"><i class="fas fa-circle"></i> Nuevo</span>' : ''}
                        </div>
                    </div>
                    <div class="mensaje-grupo-contenido">${msg.contenido}</div>
                </div>
            `;
        });
        
        chatContainer.innerHTML = htmlMensajes;
        
        // Scroll suave al final
        this.scrollSuaveAlFinal(chatContainer);
    },

    scrollSuaveAlFinal(elemento) {
        const scrollOptions = {
            top: elemento.scrollHeight,
            behavior: 'smooth'
        };
        elemento.scrollTo(scrollOptions);
    },

    // Enviar mensaje con optimización
    async enviarMensajeInstantaneo(grupoId, contenido) {
        try {
            // Mostrar mensaje localmente inmediatamente
            this.mostrarMensajeLocal(grupoId, contenido);
            
            // Enviar a la base de datos
            const { data: mensajeEnviado, error } = await window.supabase
                .from('mensajes_grupo')
                .insert([{
                    grupo_id: grupoId,
                    usuario_id: window.usuarioIdActual,
                    contenido: contenido
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Actualizar el mensaje local con el ID real
            this.actualizarMensajeLocal(mensajeEnviado.id);
            
            return true;
        } catch (error) {
            console.error('Error al enviar mensaje instantáneo:', error);
            this.mostrarErrorMensaje();
            return false;
        }
    },

    mostrarMensajeLocal(grupoId, contenido) {
        const chatContainer = document.getElementById('chatGrupo');
        if (!chatContainer) return;
        
        const horaActual = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const mensajeLocalHTML = `
            <div class="mensaje-grupo-item mensaje-local" data-mensaje-id="local-${Date.now()}" style="
                background: #e8f0fe;
                opacity: 0.8;
                animation: mensajeNuevo 0.5s ease;
            ">
                <div class="mensaje-grupo-header">
                    <div class="mensaje-grupo-usuario">
                        Tú <span style="font-size: 10px; color: #666; margin-left: 5px;">(Enviando...)</span>
                    </div>
                    <div class="mensaje-grupo-hora">${horaActual}</div>
                </div>
                <div class="mensaje-grupo-contenido">${contenido}</div>
            </div>
        `;
        
        chatContainer.insertAdjacentHTML('beforeend', mensajeLocalHTML);
        this.scrollSuaveAlFinal(chatContainer);
    },

    actualizarMensajeLocal(mensajeId) {
        const mensajeLocal = document.querySelector('.mensaje-local');
        if (mensajeLocal) {
            mensajeLocal.classList.remove('mensaje-local');
            mensajeLocal.setAttribute('data-mensaje-id', mensajeId);
            
            // Actualizar estado
            const estadoSpan = mensajeLocal.querySelector('.mensaje-grupo-usuario span');
            if (estadoSpan) {
                estadoSpan.innerHTML = '(Enviado ✓)';
                estadoSpan.style.color = '#34a853';
            }
        }
    },

    mostrarErrorMensaje() {
        const mensajeLocal = document.querySelector('.mensaje-local');
        if (mensajeLocal) {
            const estadoSpan = mensajeLocal.querySelector('.mensaje-grupo-usuario span');
            if (estadoSpan) {
                estadoSpan.innerHTML = '(Error ❌)';
                estadoSpan.style.color = '#f44336';
            }
            
            // Quitar después de 3 segundos
            setTimeout(() => {
                mensajeLocal.remove();
            }, 3000);
        }
    }
};

// Hacer disponible globalmente
window.ChatTiempoReal = ChatTiempoReal;