// modulos/grupos.js
const Grupos = {
    grupoActual: null,

    async cargarMisGrupos() {
        try {
            // Cargar grupos donde el usuario es miembro activo o pendiente
            const { data: miembros, error } = await window.supabase
                .from('miembros_grupo')
                .select(`
                    grupo_id,
                    estado,
                    grupo:grupos!inner(*, creador:usuarios!grupos_creador_id_fkey(nombre, apellidos))
                `)
                .eq('usuario_id', window.usuarioIdActual)
                .in('estado', ['activo', 'pendiente']);
            
            if (error) throw error;
            
            // Extraer los grupos
            const grupos = miembros.map(miembro => ({
                ...miembro.grupo,
                miEstado: miembro.estado
            }));
            
            this.mostrarListaGrupos(grupos);
            
            // Actualizar contador (solo grupos activos)
            const gruposActivos = grupos.filter(g => g.miEstado === 'activo').length;
            document.getElementById('contadorGrupos').textContent = gruposActivos;
            
            return grupos;
        } catch (error) {
            console.error('Error al cargar grupos:', error);
            this.mostrarErrorGrupos();
            return [];
        }
    },

    mostrarListaGrupos(grupos) {
        const lista = document.getElementById('listaGrupos');
        
        if (!grupos || grupos.length === 0) {
            lista.innerHTML = window.Utilidades.plantillaEstadoVacio('users', 'No tienes grupos', 'Crea tu primer grupo para empezar a chatear');
            return;
        }
        
        let html = '';
        grupos.forEach(grupo => {
            const iniciales = grupo.nombre.substring(0, 2).toUpperCase();
            const fechaFormateada = window.Utilidades.formatearFecha(grupo.created_at);
            const esCreador = grupo.creador_id === window.usuarioIdActual;
            const esPendiente = grupo.miEstado === 'pendiente';
            const nombreCreador = grupo.creador ? `${grupo.creador.nombre} ${grupo.creador.apellidos}` : 'Usuario';
            
            html += `
                <div class="grupo-card" data-grupo-id="${grupo.id}" onclick="Grupos.verDetalleGrupo('${grupo.id}')">
                    <div class="grupo-header">
                        <div class="grupo-avatar" style="${esPendiente ? 'background: linear-gradient(135deg, #ff9800, #f57c00);' : ''}">
                            ${iniciales}
                        </div>
                        <div class="grupo-info-card">
                            <div class="grupo-nombre">
                                ${grupo.nombre}
                                ${esPendiente ? '<span style="font-size: 12px; background: #ff9800; color: white; padding: 2px 8px; border-radius: 10px; margin-left: 10px;">Pendiente</span>' : ''}
                            </div>
                            <div class="grupo-descripcion">${grupo.descripcion || 'Sin descripción'}</div>
                            <div class="grupo-meta">
                                <span><i class="fas fa-user"></i> ${esCreador ? 'Creador' : 'Miembro'}</span>
                                <span><i class="fas fa-crown"></i> ${nombreCreador}</span>
                                <span><i class="far fa-calendar"></i> ${fechaFormateada}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    },

    async verDetalleGrupo(grupoId) {
    try {
        // Detener chat anterior si existe
        if (window.ChatTiempoReal) {
            window.ChatTiempoReal.detenerChatGrupo();
        }
        
        // Cargar información del grupo
        const { data: grupo, error: grupoError } = await window.supabase
            .from('grupos')
            .select('*, creador:usuarios!grupos_creador_id_fkey(nombre, apellidos)')
            .eq('id', grupoId)
            .single();
        
        if (grupoError) throw grupoError;
        
        this.grupoActual = grupo;
        
        // Cargar estado del usuario en el grupo
        const { data: miMiembro, error: miError } = await window.supabase
            .from('miembros_grupo')
            .select('estado')
            .eq('grupo_id', grupoId)
            .eq('usuario_id', window.usuarioIdActual)
            .single();
        
        if (miError) throw miError;
        
        // Solo cargar detalles completos si el usuario es miembro activo
        if (miMiembro.estado !== 'activo') {
            this.mostrarSolicitudPendiente(grupo, miMiembro.estado);
            return;
        }
        
        // Cargar miembros del grupo
        const { data: miembros, error: miembrosError } = await window.supabase
            .from('miembros_grupo')
            .select(`
                *,
                usuario:usuarios!inner(nombre, apellidos, email)
            `)
            .eq('grupo_id', grupoId)
            .in('estado', ['activo', 'pendiente']);
        
        if (miembrosError) throw miembrosError;
        
        // Cargar mensajes iniciales del grupo
        const { data: mensajes, error: mensajesError } = await window.supabase
            .from('mensajes_grupo')
            .select(`
                *,
                usuario:usuarios!inner(nombre, apellidos)
            `)
            .eq('grupo_id', grupoId)
            .order('created_at', { ascending: true });
        
        if (mensajesError) throw mensajesError;
        
        this.mostrarDetalleGrupo(grupo, miembros, mensajes);
        window.Interfaz.mostrarSeccion('seccionDetalleGrupo');
        
        // Iniciar chat en tiempo real
        if (window.ChatTiempoReal && miMiembro.estado === 'activo') {
            window.ChatTiempoReal.iniciarChatGrupo(grupoId);
        }
        
    } catch (error) {
        console.error('Error al cargar detalle del grupo:', error);
        window.Utilidades.mostrarAlerta('Error', 'No se pudo cargar el grupo', 'error');
    }
},


mostrarDetalleGrupo(grupo, miembros, mensajes) {
    const iniciales = grupo.nombre.substring(0, 2).toUpperCase();
    const esCreador = grupo.creador_id === window.usuarioIdActual;
    
    // Actualizar título
    document.getElementById('tituloGrupo').innerHTML = `
        <i class="fas fa-users"></i> ${grupo.nombre}
        ${esCreador ? '<span style="font-size: 12px; background: #ff9800; color: white; padding: 2px 8px; border-radius: 10px; margin-left: 10px;">Creador</span>' : ''}
    `;
    
    // Mostrar información del grupo
    const infoGrupo = document.getElementById('infoGrupo');
    infoGrupo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <div class="grupo-avatar" style="width: 80px; height: 80px; font-size: 32px;">
                ${iniciales}
            </div>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 5px 0;">${grupo.nombre}</h3>
                <p style="color: #666; margin: 0 0 10px 0;">${grupo.descripcion || 'Sin descripción'}</p>
                <div class="grupo-meta">
                    <span><i class="fas fa-users"></i> ${miembros.filter(m => m.estado === 'activo').length} miembros</span>
                    <span><i class="fas fa-crown"></i> ${grupo.creador ? `${grupo.creador.nombre} ${grupo.creador.apellidos}` : 'Usuario'}</span>
                    <span><i class="far fa-calendar"></i> Creado ${window.Utilidades.formatearFecha(grupo.created_at)}</span>
                </div>
            </div>
            ${esCreador ? `
                <div>
                    <button class="btn-secondary" onclick="Grupos.invitarAmigosAlGrupo('${grupo.id}')">
                        <i class="fas fa-user-plus"></i> Invitar amigos
                    </button>
                </div>
            ` : ''}
        </div>
        <div class="miembros-grupo">
            <div class="miembros-titulo">Miembros del grupo:</div>
            <div class="miembros-lista" id="listaMiembrosGrupo">
                ${this.generarHTMLMiembros(miembros)}
            </div>
        </div>
    `;
    
    // Mostrar mensajes del grupo
    const chatGrupo = document.getElementById('chatGrupo');
    if (mensajes.length === 0) {
        chatGrupo.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <i class="fas fa-comments fa-3x"></i>
                <h3>No hay mensajes</h3>
                <p>Sé el primero en escribir en el grupo</p>
            </div>
        `;
    } else {
        let htmlMensajes = '';
        mensajes.forEach(msg => {
            const nombreUsuario = `${msg.usuario.nombre} ${msg.usuario.apellidos}`;
            const hora = window.Utilidades.formatearFecha(msg.created_at);
            const esMio = msg.usuario_id === window.usuarioIdActual;
            
            // Procesar contenido para mostrar archivos HTML
            let contenidoProcesado = msg.contenido;
            
            // Reemplazar marcadores [ARCHIVO_HTML:id] con HTML real si existe
            const regexArchivoHTML = /\[ARCHIVO_HTML:([^\]]+)\]/g;
            contenidoProcesado = contenidoProcesado.replace(regexArchivoHTML, (match, idArchivo) => {
                // Aquí podrías almacenar el HTML en una variable global o en metadata
                // Por ahora, mostramos un marcador simple
                return `<div class="archivo-placeholder" style="
                    background: #f5f5f5;
                    padding: 10px;
                    border-radius: 8px;
                    margin: 5px 0;
                    border-left: 4px solid #1a73e8;
                ">
                    <i class="fas fa-paperclip"></i> Archivo adjunto
                </div>`;
            });
            
            // Verificar si el mensaje contiene HTML de archivo directamente
            if (msg.contenido.includes('<div class="archivo-adjunto"') || 
                msg.contenido.includes('<div class="mensaje-archivo-chat"')) {
                // El mensaje ya contiene HTML de archivo, usarlo directamente
                contenidoProcesado = msg.contenido;
            }
            
            htmlMensajes += `
                <div class="mensaje-grupo-item" style="${esMio ? 'background: #e8f0fe;' : ''}">
                    <div class="mensaje-grupo-header">
                        <div class="mensaje-grupo-usuario">${nombreUsuario}</div>
                        <div class="mensaje-grupo-hora">${hora}</div>
                    </div>
                    <div class="mensaje-grupo-contenido">${contenidoProcesado}</div>
                </div>
            `;
        });
        chatGrupo.innerHTML = htmlMensajes;
        
        // Agregar eventos a las imágenes para que se puedan ver en grande
        this.configurarEventosArchivosChat();
        
        // Scroll al final
        chatGrupo.scrollTop = chatGrupo.scrollHeight;
    }
    
    // Mostrar formulario de mensajes
    const formMensaje = document.querySelector('.grupo-form-mensaje');
    if (formMensaje) formMensaje.style.display = 'block';
    
    // Agregar botón de archivos usando Archivos.agregarBotonArchivosAGrupo
    setTimeout(() => {
        if (window.Archivos && typeof window.Archivos.agregarBotonArchivosAGrupo === 'function') {
            window.Archivos.agregarBotonArchivosAGrupo(grupo.id);
        }
    }, 100);
},

// Agrega esta función para configurar eventos en los archivos del chat
configurarEventosArchivosChat() {
    // Configurar clic en imágenes para ver en grande
    const imagenes = document.querySelectorAll('.imagen-contenedor, .imagen-miniatura');
    imagenes.forEach(img => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            const imgElement = img.querySelector('img');
            if (imgElement) {
                const url = imgElement.src;
                const nombre = imgElement.alt || 'Imagen';
                
                // Usar la función de Archivos para mostrar imagen grande
                if (window.Archivos && window.Archivos.mostrarImagenGrande) {
                    window.Archivos.mostrarImagenGrande(url, nombre);
                } else {
                    // Fallback: abrir en nueva pestaña
                    window.open(url, '_blank');
                }
            }
        });
    });
    
    // Configurar botones de descarga
    const botonesDescarga = document.querySelectorAll('[onclick*="descargarArchivo"]');
    botonesDescarga.forEach(boton => {
        const onclick = boton.getAttribute('onclick');
        if (onclick) {
            // Extraer URL y nombre del onclick
            const match = onclick.match(/descargarArchivo\('([^']+)',\s*'([^']+)'\)/);
            if (match) {
                const url = match[1];
                const nombre = match[2];
                boton.onclick = (e) => {
                    e.preventDefault();
                    if (window.Archivos && window.Archivos.descargarArchivo) {
                        window.Archivos.descargarArchivo(url, nombre);
                    } else {
                        // Fallback: crear enlace de descarga
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = nombre;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                };
            }
        }
    });
},
    mostrarSolicitudPendiente(grupo, estado) {
    const infoGrupo = document.getElementById('infoGrupo');
    const chatGrupo = document.getElementById('chatGrupo');
    const formMensaje = document.querySelector('.grupo-form-mensaje');
    
    // Ocultar formulario de mensajes
    if (formMensaje) formMensaje.style.display = 'none';
    
    // Colores según estado
    const estadosConfig = {
        'pendiente': {
            color: '#FF9800',
            bgColor: '#FFF3E0',
            icon: '📨',
            title: 'Invitación Pendiente',
            message: 'Has sido invitado a este grupo. ¿Deseas unirte?'
        },
        'rechazado': {
            color: '#F44336',
            bgColor: '#FFEBEE',
            icon: '❌',
            title: 'Invitación Rechazada',
            message: 'Has rechazado la invitación a este grupo.'
        },
        'aceptado': {
            color: '#4CAF50',
            bgColor: '#E8F5E9',
            icon: '✅',
            title: 'Invitación Aceptada',
            message: '¡Bienvenido al grupo! Ya puedes participar.'
        }
    };
    
    const config = estadosConfig[estado] || estadosConfig.pendiente;
    
    infoGrupo.innerHTML = `
        <div class="grupo-solicitud-container">
            <!-- Header del Grupo -->
            <div class="grupo-solicitud-header">
                <div class="grupo-avatar-solicitud">
                    ${grupo.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div class="grupo-solicitud-info">
                    <h1 class="grupo-solicitud-nombre">${grupo.nombre}</h1>
                    <p class="grupo-solicitud-descripcion">
                        ${grupo.descripcion || 'Sin descripción'}
                    </p>
                    <div class="grupo-solicitud-metadata">
                        <span class="grupo-metadata-item">
                            <i class="fas fa-users"></i> ${grupo.miembros || 0} miembros
                        </span>
                        <span class="grupo-metadata-item">
                            <i class="fas fa-calendar-alt"></i> Invitación enviada
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Tarjeta de Estado -->
            <div class="grupo-solicitud-card" style="--estado-color: ${config.color}; --estado-bg: ${config.bgColor};">
                <div class="solicitud-card-icon">
                    ${config.icon}
                </div>
                <div class="solicitud-card-content">
                    <h3 class="solicitud-card-title">${config.title}</h3>
                    <p class="solicitud-card-message">${config.message}</p>
                    
                    <!-- Acciones según estado -->
                    ${estado === 'pendiente' ? `
                        <div class="solicitud-acciones">
                            <button class="btn btn-aceptar-destacado" 
                                    onclick="Grupos.aceptarInvitacionGrupo('${grupo.id}')">
                                <i class="fas fa-check-circle"></i>
                                <span>Aceptar Invitación</span>
                            </button>
                            <button class="btn btn-rechazar" 
                                    onclick="Grupos.mostrarConfirmacionRechazo('${grupo.id}', '${grupo.nombre}')">
                                <i class="fas fa-times-circle"></i>
                                <span>Rechazar</span>
                            </button>
                        </div>
                        <p class="solicitud-advertencia">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Nota:</strong> Al rechazar, perderás el acceso a esta invitación
                        </p>
                    ` : ''}
                    
                    ${estado === 'rechazado' ? `
                        <div class="solicitud-acciones">
                            <button class="btn btn-reconsiderar" 
                                    onclick="Grupos.reconsiderarInvitacion('${grupo.id}')">
                                <i class="fas fa-redo"></i>
                                <span>Reconsiderar Decisión</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Botón de regreso -->
            <div class="grupo-solicitud-footer">
                <button class="btn btn-back" onclick="window.Interfaz.mostrarSeccion('seccionMisGrupos')">
                    <i class="fas fa-arrow-left"></i>
                    <span>Volver a Mis Grupos</span>
                </button>
            </div>
        </div>
    `;
    
    chatGrupo.innerHTML = '';
    window.Interfaz.mostrarSeccion('seccionDetalleGrupo');
},

// Nueva función para mostrar confirmación de rechazo
mostrarConfirmacionRechazo(grupoId, grupoNombre) {
    Swal.fire({
        title: '¿Estás seguro?',
        html: `
            <div style="text-align: center; padding: 15px;">
                <div style="font-size: 60px; color: #f44336; margin-bottom: 15px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <p style="font-size: 16px; color: #555;">
                    Estás a punto de rechazar la invitación al grupo:<br>
                    <strong style="color: #333;">${grupoNombre}</strong>
                </p>
                <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 12px; margin: 15px 0; text-align: left; border-radius: 4px;">
                    <i class="fas fa-info-circle" style="color: #f44336;"></i>
                    <span style="font-size: 14px; color: #666;">
                        Podrás reconsiderar tu decisión más tarde
                    </span>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, rechazar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f44336',
        cancelButtonColor: '#6c757d',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
            confirmButton: 'btn-rechazar-swal',
            cancelButton: 'btn-cancelar-swal'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Grupos.rechazarInvitacionGrupo(grupoId);
        }
    });
},
    async aceptarInvitacionGrupo(grupoId) {
        try {
            const { error } = await window.supabase
                .from('miembros_grupo')
                .update({ estado: 'activo' })
                .eq('grupo_id', grupoId)
                .eq('usuario_id', window.usuarioIdActual);
            
            if (error) throw error;
            
            // Enviar mensaje de bienvenida
            const mensajeBienvenida = {
                grupo_id: grupoId,
                usuario_id: window.usuarioIdActual,
                contenido: 'Se ha unido al grupo.'
            };
            
            await window.supabase
                .from('mensajes_grupo')
                .insert([mensajeBienvenida]);
            
            window.Utilidades.mostrarAlerta('Invitación aceptada', 'Te has unido al grupo', 'success');
            
            // Recargar el detalle del grupo
            await this.verDetalleGrupo(grupoId);
            
            // Actualizar notificaciones
            if (window.Amigos && window.Amigos.cargarSolicitudesPendientes) {
                await window.Amigos.cargarSolicitudesPendientes();
            }
            
        } catch (error) {
            console.error('Error al aceptar invitación:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo aceptar la invitación', 'error');
        }
    },

    async rechazarInvitacionGrupo(grupoId) {
        const confirmacion = await window.Utilidades.mostrarConfirmacion(
            '¿Rechazar invitación?',
            'No podrás unirte a este grupo a menos que te inviten nuevamente',
            'Sí, rechazar'
        );
        
        if (confirmacion.isConfirmed) {
            try {
                const { error } = await window.supabase
                    .from('miembros_grupo')
                    .update({ estado: 'rechazado' })
                    .eq('grupo_id', grupoId)
                    .eq('usuario_id', window.usuarioIdActual);
                
                if (error) throw error;
                
                window.Utilidades.mostrarAlerta('Invitación rechazada', 'Has rechazado la invitación al grupo', 'info');
                window.Interfaz.mostrarSeccion('seccionMisGrupos');
                
                // Actualizar notificaciones
                if (window.Amigos && window.Amigos.cargarSolicitudesPendientes) {
                    await window.Amigos.cargarSolicitudesPendientes();
                }
                
            } catch (error) {
                console.error('Error al rechazar invitación:', error);
                window.Utilidades.mostrarAlerta('Error', 'No se pudo rechazar la invitación', 'error');
            }
        }
    },

   

    generarHTMLMiembros(miembros) {
        return miembros.map(miembro => {
            const nombreCompleto = `${miembro.usuario.nombre} ${miembro.usuario.apellidos}`;
            const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
            const esYo = miembro.usuario_id === window.usuarioIdActual;
            const esPendiente = miembro.estado === 'pendiente';
            
            return `
                <div class="miembro-item" style="${esPendiente ? 'opacity: 0.7;' : ''}">
                    <div style="width: 30px; height: 30px; background: ${esPendiente ? 'linear-gradient(135deg, #ff9800, #f57c00)' : 'linear-gradient(135deg, #1a73e8, #0d47a1)'}; 
                          border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                          color: white; font-size: 12px; font-weight: 600;">
                        ${iniciales}
                    </div>
                    <span>${esYo ? 'Tú' : miembro.usuario.nombre} ${esPendiente ? '(pendiente)' : ''}</span>
                </div>
            `;
        }).join('');
    },

    async cargarAmigosParaGrupo() {
        try {
            if (window.listaAmigos.length === 0) {
                await window.Amigos.cargarAmigos();
            }
            
            const lista = document.getElementById('listaAmigosGrupo');
            
            if (window.listaAmigos.length === 0) {
                lista.innerHTML = window.Utilidades.plantillaEstadoVacio('user-friends', 'No tienes amigos', 'Agrega amigos primero para poder crear un grupo');
                return;
            }
            
            let html = '';
            window.listaAmigos.forEach(amigo => {
                const nombreCompleto = `${amigo.nombre} ${amigo.apellidos}`;
                const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
                
                html += `
                    <div class="amigo-seleccion-item" data-amigo-id="${amigo.id}">
                        <div class="amigo-seleccion-avatar">${iniciales}</div>
                        <div class="amigo-seleccion-info">
                            <div class="amigo-seleccion-nombre">${nombreCompleto}</div>
                            <div class="amigo-seleccion-email">${amigo.email}</div>
                        </div>
                    </div>
                `;
            });
            
            lista.innerHTML = html;
            
            // Configurar selección de amigos
            this.configurarSeleccionAmigos();
            
        } catch (error) {
            console.error('Error al cargar amigos para grupo:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cargar la lista de amigos', 'error');
        }
    },

    configurarSeleccionAmigos() {
        const items = document.querySelectorAll('.amigo-seleccion-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
    },

    async crearGrupo(nombre, descripcion) {
        try {
            // Crear el grupo
            const { data: nuevoGrupo, error: grupoError } = await window.supabase
                .from('grupos')
                .insert([{
                    nombre: nombre,
                    descripcion: descripcion,
                    creador_id: window.usuarioIdActual
                }])
                .select()
                .single();
            
            if (grupoError) throw grupoError;
            
            // Obtener amigos seleccionados
            const amigosSeleccionados = [];
            document.querySelectorAll('.amigo-seleccion-item.selected').forEach(item => {
                const amigoId = item.getAttribute('data-amigo-id');
                amigosSeleccionados.push(amigoId);
            });
            
            // Crear array de miembros
            const miembros = [
                {
                    grupo_id: nuevoGrupo.id,
                    usuario_id: window.usuarioIdActual,
                    estado: 'activo'
                },
                ...amigosSeleccionados.map(amigoId => ({
                    grupo_id: nuevoGrupo.id,
                    usuario_id: amigoId,
                    estado: 'pendiente'
                }))
            ];
            
            // Insertar miembros
            const { error: miembrosError } = await window.supabase
                .from('miembros_grupo')
                .insert(miembros);
            
            if (miembrosError) throw miembrosError;
            
            // Enviar mensaje de bienvenida automático
            const mensajeBienvenida = {
                grupo_id: nuevoGrupo.id,
                usuario_id: window.usuarioIdActual,
                contenido: `¡Grupo "${nombre}" creado! El creador ha iniciado el chat.`
            };
            
            await window.supabase
                .from('mensajes_grupo')
                .insert([mensajeBienvenida]);
            
            // Actualizar notificaciones para los amigos invitados
            if (window.Amigos && window.Amigos.cargarSolicitudesPendientes) {
                // Esto hará que los amigos reciban notificaciones
                // Nota: Cada amigo tendrá que recargar su página para ver la notificación
            }
            
            return nuevoGrupo;
            
        } catch (error) {
            console.error('Error al crear grupo:', error);
            throw error;
        }
    },

    async invitarAmigosAlGrupo(grupoId) {
        try {
            // Cargar amigos que NO están en el grupo
            const { data: miembrosActuales, error: miembrosError } = await window.supabase
                .from('miembros_grupo')
                .select('usuario_id')
                .eq('grupo_id', grupoId);
            
            if (miembrosError) throw miembrosError;
            
            const idsMiembros = miembrosActuales.map(m => m.usuario_id);
            const amigosNoEnGrupo = window.listaAmigos.filter(amigo => 
                !idsMiembros.includes(amigo.id)
            );
            
            if (amigosNoEnGrupo.length === 0) {
                window.Utilidades.mostrarAlerta('Info', 'Todos tus amigos ya están en el grupo', 'info');
                return;
            }
            
            // Mostrar modal para seleccionar amigos
            this.mostrarModalInvitarAmigos(grupoId, amigosNoEnGrupo);
            
        } catch (error) {
            console.error('Error al cargar amigos para invitar:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cargar la lista de amigos', 'error');
        }
    },

    mostrarModalInvitarAmigos(grupoId, amigos) {
        let html = '';
        amigos.forEach(amigo => {
            const nombreCompleto = `${amigo.nombre} ${amigo.apellidos}`;
            const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
            
            html += `
                <div class="amigo-seleccion-item" data-amigo-id="${amigo.id}">
                    <div class="amigo-seleccion-avatar">${iniciales}</div>
                    <div class="amigo-seleccion-info">
                        <div class="amigo-seleccion-nombre">${nombreCompleto}</div>
                        <div class="amigo-seleccion-email">${amigo.email}</div>
                    </div>
                </div>
            `;
        });
        
        const modalHTML = `
            <div id="modalInvitarAmigos" class="message-modal" style="display: flex;">
                <div class="message-modal-content">
                    <div class="modal-header">
                        <h3>Invitar amigos al grupo</h3>
                        <button class="modal-close" onclick="document.getElementById('modalInvitarAmigos').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Selecciona los amigos que deseas invitar:</p>
                        <div class="amigos-seleccion" style="max-height: 300px;">
                            ${html}
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="Grupos.enviarInvitacionesGrupo('${grupoId}')">
                            <i class="fas fa-paper-plane"></i> Enviar invitaciones
                        </button>
                        <button class="btn-secondary" onclick="document.getElementById('modalInvitarAmigos').remove()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal existente si hay
        const modalExistente = document.getElementById('modalInvitarAmigos');
        if (modalExistente) modalExistente.remove();
        
        // Añadir nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar selección
        this.configurarSeleccionAmigosModal();
    },

    configurarSeleccionAmigosModal() {
        const items = document.querySelectorAll('#modalInvitarAmigos .amigo-seleccion-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
    },

    async enviarInvitacionesGrupo(grupoId) {
        try {
            const amigosSeleccionados = [];
            document.querySelectorAll('#modalInvitarAmigos .amigo-seleccion-item.selected').forEach(item => {
                const amigoId = item.getAttribute('data-amigo-id');
                amigosSeleccionados.push(amigoId);
            });
            
            if (amigosSeleccionados.length === 0) {
                window.Utilidades.mostrarAlerta('Error', 'Selecciona al menos un amigo', 'error');
                return;
            }
            
            // Crear array de invitaciones
            const invitaciones = amigosSeleccionados.map(amigoId => ({
                grupo_id: grupoId,
                usuario_id: amigoId,
                estado: 'pendiente'
            }));
            
            // Insertar invitaciones
            const { error } = await window.supabase
                .from('miembros_grupo')
                .insert(invitaciones);
            
            if (error) throw error;
            
            // Cerrar modal
            document.getElementById('modalInvitarAmigos').remove();
            
            // Enviar mensaje de notificación al grupo
            const mensajeNotificacion = {
                grupo_id: grupoId,
                usuario_id: window.usuarioIdActual,
                contenido: `Se han enviado ${invitaciones.length} invitaciones a nuevos miembros.`
            };
            
            await window.supabase
                .from('mensajes_grupo')
                .insert([mensajeNotificacion]);
            
            window.Utilidades.mostrarAlerta('Invitaciones enviadas', `Se han enviado ${invitaciones.length} invitaciones`, 'success');
            
            // Recargar detalle del grupo
            await this.verDetalleGrupo(grupoId);
            
        } catch (error) {
            console.error('Error al enviar invitaciones:', error);
            if (error.code === '23505') {
                window.Utilidades.mostrarAlerta('Info', 'Algunos amigos ya fueron invitados', 'info');
            } else {
                window.Utilidades.mostrarAlerta('Error', 'No se pudieron enviar las invitaciones', 'error');
            }
        }
    },

async enviarMensajeGrupo(grupoId, contenido) {
    try {
        // Verificar si el contenido tiene marcadores de archivo [ARCHIVO:id]
        const regexArchivo = /\[ARCHIVO:([^\]]+)\]/g;
        let contenidoFinal = contenido;
        const archivosEnMensaje = [];
        
        // Buscar y reemplazar marcadores de archivo
        contenidoFinal = contenido.replace(regexArchivo, (match, idArchivo) => {
            // Buscar el HTML del archivo en el textarea
            const textarea = document.getElementById('mensajeGrupo');
            if (textarea && textarea.dataset[`archivo_${idArchivo}`]) {
                archivosEnMensaje.push({
                    id: idArchivo,
                    html: textarea.dataset[`archivo_${idArchivo}`]
                });
                // Reemplazar con marcador especial que el chat entenderá
                return `[ARCHIVO_HTML:${idArchivo}]`;
            }
            return match;
        });
        
        // Enviar mensaje
        const { error } = await window.supabase
            .from('mensajes_grupo')
            .insert([{
                grupo_id: grupoId,
                usuario_id: window.usuarioIdActual,
                contenido: contenidoFinal,
                metadata: archivosEnMensaje.length > 0 ? { 
                    tieneArchivos: true,
                    archivos: archivosEnMensaje.map(a => a.id)
                } : null
            }]);
        
        if (error) throw error;
        
        // Si hay chat en tiempo real, también enviar allí
        if (window.ChatTiempoReal && typeof window.ChatTiempoReal.enviarMensajeInstantaneo === 'function') {
            await window.ChatTiempoReal.enviarMensajeInstantaneo(grupoId, contenidoFinal);
        }
        
        // Limpiar data attributes del textarea
        const textarea = document.getElementById('mensajeGrupo');
        if (textarea) {
            archivosEnMensaje.forEach(archivo => {
                delete textarea.dataset[`archivo_${archivo.id}`];
            });
        }
        
        return true;
    } catch (error) {
        console.error('Error al enviar mensaje al grupo:', error);
        return false;
    }
},
    // Agregar también el método para abandonar grupo que maneje el chat
async abandonarGrupo(grupoId) {
    const confirmacion = await window.Utilidades.mostrarConfirmacion(
        '¿Abandonar grupo?',
        'Ya no podrás ver los mensajes del grupo',
        'Sí, abandonar'
    );
    
    if (confirmacion.isConfirmed) {
        try {
            // Detener el chat en tiempo real si está activo
            if (window.ChatTiempoReal) {
                window.ChatTiempoReal.detenerChatGrupo();
            }
            
            const { error } = await window.supabase
                .from('miembros_grupo')
                .update({ estado: 'inactivo' })
                .eq('grupo_id', grupoId)
                .eq('usuario_id', window.usuarioIdActual);
            
            if (error) throw error;
            
            window.Utilidades.mostrarAlerta('Grupo abandonado', 'Has abandonado el grupo', 'success');
            window.Interfaz.mostrarSeccion('seccionMisGrupos');
            await this.cargarMisGrupos();
            
        } catch (error) {
            console.error('Error al abandonar grupo:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo abandonar el grupo', 'error');
        }
    }
},

    mostrarErrorGrupos() {
        const lista = document.getElementById('listaGrupos');
        lista.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'Intenta recargar la página');
    }
};

// Hacer disponible globalmente
window.Grupos = Grupos;