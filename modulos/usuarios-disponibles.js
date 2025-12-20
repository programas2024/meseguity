// modulos/usuarios-disponibles.js
const UsuariosDisponibles = {
    async cargarUsuariosDisponibles() {
        try {
            const { data: usuarios, error } = await window.supabase
                .from('usuarios')
                .select(`
                    id,
                    nombre,
                    apellidos,
                    email,
                    ciudad,
                    pais,
                    avatar_url,
                    created_at,
                    biografia,
                    fecha_nacimiento,
                    genero,
                    tipo_cuenta
                `)
                .neq('id', window.usuarioIdActual)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            window.listaUsuarios = usuarios || [];
            this.mostrarUsuariosDisponibles();
            return window.listaUsuarios;
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            window.listaUsuarios = [];
            this.mostrarErrorUsuarios();
            return [];
        }
    },

    mostrarUsuariosDisponibles() {
        const lista = document.getElementById('listaAmigos');
        const contador = document.getElementById('contadorAmigos');
        
        if (!lista) return;
        
        const usuariosFiltrados = this.filtrarUsuarios();
        contador.textContent = usuariosFiltrados.length;
        
        // Header simple y limpio
        const headerHTML = `
            <div class="users-discovery-header">
                <div class="discovery-title-section">
                    <h1 class="discovery-main-title">Nuevos Amigos</h1>
                    <p class="discovery-subtitle">Conecta con personas increíbles y expande tu red social</p>
                </div>
                <button class="btn-help-simple" onclick="UsuariosDisponibles.mostrarTutorial()" title="Cómo funciona">
                    <i class="fas fa-question-circle"></i>
                </button>
            </div>
            
            <div class="stats-container">
                <div class="stat-item">
                    <span class="stat-number">${usuariosFiltrados.length}</span>
                    <span class="stat-label">Disponibles</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.contarPaisesUnicos(usuariosFiltrados)}</span>
                    <span class="stat-label">Países</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.contarUsuariosNuevos(usuariosFiltrados)}</span>
                    <span class="stat-label">Nuevos</span>
                </div>
            </div>
        `;
        
        if (usuariosFiltrados.length === 0) {
            lista.innerHTML = headerHTML + this.plantillaEstadoVacio();
            return;
        }
        
        let html = headerHTML + '<div class="users-grid-container">';
        usuariosFiltrados.forEach(usuario => {
            const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`;
            const tieneSolicitud = window.solicitudesPendientes?.some(
                solicitud => solicitud.usuario_id === window.usuarioIdActual && solicitud.amigo_id === usuario.id
            );
            
            html += this.crearTarjetaUsuario(usuario, nombreCompleto, tieneSolicitud);
        });
        
        html += '</div>';
        lista.innerHTML = html;
        
        this.configurarEventosTarjetas();
    },

    crearTarjetaUsuario(usuario, nombreCompleto, tieneSolicitud) {
        const ubicacion = this.formatearUbicacion(usuario.ciudad, usuario.pais);
        const esNuevo = this.esUsuarioNuevo(usuario.created_at);
        const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
        const esUsuarioGitHub = usuario.email.includes('@users.noreply.github.com') || 
                               usuario.tipo_cuenta === 'github';
        const edad = this.calcularEdad(usuario.fecha_nacimiento);
        
        return `
            <div class="user-discovery-card ${esNuevo ? 'highlight-new' : ''}" data-user-id="${usuario.id}">
                <div class="user-card-top">
                    <div class="user-avatar-section">
                        ${this.obtenerAvatarHTML(usuario, nombreCompleto)}
                        <div class="user-badges-container">
                            ${esNuevo ? `
                                <div class="badge-new-user">
                                    <i class="fas fa-star"></i>
                                    <span>Nuevo</span>
                                </div>
                            ` : ''}
                            
                            ${esUsuarioGitHub ? `
                                <div class="badge-github-user">
                                    <i class="fab fa-github"></i>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="user-main-info">
                        <h3 class="user-display-name">${nombreCompleto}</h3>
                        <div class="user-details">
                            <span class="user-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${this.acortarTexto(ubicacion, 20)}
                            </span>
                            <span class="user-type">
                                <i class="fas fa-user-tag"></i>
                                ${usuario.tipo_cuenta === 'premium' ? 'Premium' : 'Usuario'}
                            </span>
                            ${edad !== 'No especificada' ? `
                            <span class="user-age">
                                <i class="fas fa-birthday-cake"></i>
                                ${edad}
                            </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                ${usuario.biografia ? `
                <div class="user-bio-section">
                    <p class="bio-text">"${this.acortarTexto(usuario.biografia, 80)}"</p>
                </div>
                ` : ''}
                
                <div class="user-contact-section">
                    <div class="contact-info">
                        <i class="fas fa-envelope"></i>
                        <span title="${usuario.email}">${this.acortarTexto(usuario.email, 25)}</span>
                    </div>
                </div>
                
                <div class="user-actions-section">
                    <div class="action-buttons">
                        ${tieneSolicitud ? `
                            <button class="btn-sent" disabled>
                                <i class="fas fa-clock"></i>
                                <span>Solicitud enviada</span>
                            </button>
                        ` : `
                            <button class="btn-add-friend" onclick="UsuariosDisponibles.enviarSolicitud('${usuario.id}')">
                                <i class="fas fa-user-plus"></i>
                                <span>Agregar amigo</span>
                            </button>
                        `}
                        
                        <button class="btn-view-profile" onclick="UsuariosDisponibles.mostrarPerfilCompleto('${usuario.id}')">
                            <i class="fas fa-eye"></i>
                            <span>Ver perfil</span>
                        </button>
                        
                        <button class="btn-send-message" onclick="UsuariosDisponibles.enviarMensajeDirecto('${usuario.id}')">
                            <i class="fas fa-comment"></i>
                            <span>Mensaje</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    obtenerAvatarHTML(usuario, nombreCompleto) {
        const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
        const colorFondo = this.obtenerColorAvatar(nombreCompleto);
        
        if (usuario.avatar_url) {
            return `
                <div class="user-avatar-discovery" 
                     onclick="UsuariosDisponibles.mostrarPerfilCompleto('${usuario.id}')"
                     title="Ver perfil de ${nombreCompleto}">
                    <img src="${usuario.avatar_url}" alt="${nombreCompleto}" 
                         onerror="this.onerror=null; this.parentElement.innerHTML='<span>${iniciales}</span>'; this.parentElement.style.background='${colorFondo}';">
                </div>
            `;
        }
        
        return `
            <div class="user-avatar-discovery" style="background: ${colorFondo};"
                 onclick="UsuariosDisponibles.mostrarPerfilCompleto('${usuario.id}')"
                 title="Ver perfil de ${nombreCompleto}">
                <span>${iniciales}</span>
            </div>
        `;
    },

    obtenerColorAvatar(nombreCompleto) {
        const colores = ['#667eea', '#764ba2', '#9b59b6', '#3498db', '#2ecc71', '#f39c12', '#e74c3c'];
        const colorIndex = nombreCompleto.length % colores.length;
        return colores[colorIndex];
    },

    formatearUbicacion(ciudad, pais) {
        if (!ciudad && !pais) return 'Ubicación no especificada';
        if (ciudad && pais) return `${ciudad}, ${pais}`;
        return ciudad || pais;
    },

    esUsuarioNuevo(fechaCreacion) {
        if (!fechaCreacion) return false;
        const fechaUsuario = new Date(fechaCreacion);
        const fechaActual = new Date();
        const diferenciaDias = (fechaActual - fechaUsuario) / (1000 * 60 * 60 * 24);
        return diferenciaDias <= 7;
    },

    acortarTexto(texto, maxLength) {
        if (!texto || texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    },

    calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return 'No especificada';
        const fechaNac = new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        return `${edad} años`;
    },

    contarPaisesUnicos(usuarios) {
        const paises = usuarios.map(u => u.pais).filter(Boolean);
        return [...new Set(paises)].length;
    },

    contarUsuariosNuevos(usuarios) {
        return usuarios.filter(u => this.esUsuarioNuevo(u.created_at)).length;
    },

    filtrarUsuarios() {
        return window.listaUsuarios.filter(usuario => 
            !window.listaAmigos?.some(amigo => amigo.id === usuario.id)
        );
    },

    configurarEventosTarjetas() {
        const tarjetas = document.querySelectorAll('.user-discovery-card');
        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener('mouseenter', () => {
                tarjeta.style.transform = 'translateY(-5px)';
                tarjeta.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.15)';
            });
            
            tarjeta.addEventListener('mouseleave', () => {
                tarjeta.style.transform = 'translateY(0)';
                tarjeta.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.08)';
            });
        });
    },

    async mostrarPerfilCompleto(usuarioId) {
        try {
            // Obtener datos completos del usuario
            const { data: usuario, error } = await window.supabase
                .from('usuarios')
                .select('*')
                .eq('id', usuarioId)
                .single();
            
            if (error) throw error;
            
            const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`;
            const ubicacion = this.formatearUbicacion(usuario.ciudad, usuario.pais);
            const edad = this.calcularEdad(usuario.fecha_nacimiento);
            const fechaRegistro = new Date(usuario.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Crear HTML del perfil
            const profileHTML = `
                <div class="profile-modal-content">
                    <div class="profile-header">
                        <div class="profile-avatar-large">
                            ${usuario.avatar_url ? 
                                `<img src="${usuario.avatar_url}" alt="${nombreCompleto}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${window.Utilidades.obtenerIniciales(nombreCompleto)}</text></svg>'; this.style.background='${this.obtenerColorAvatar(nombreCompleto)}';">` :
                                `<div style="background: ${this.obtenerColorAvatar(nombreCompleto)}; color: white; font-size: 36px; border-radius: 20px; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                    ${window.Utilidades.obtenerIniciales(nombreCompleto)}
                                </div>`
                            }
                        </div>
                        <div class="profile-title">
                            <h2>${nombreCompleto}</h2>
                            <p class="profile-subtitle">Perfil completo</p>
                        </div>
                    </div>
                    
                    <div class="profile-info-grid">
                        <div class="info-item">
                            <div class="info-label">
                                <i class="fas fa-envelope"></i>
                                <span>Email</span>
                            </div>
                            <div class="info-value">${usuario.email}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Ubicación</span>
                            </div>
                            <div class="info-value">${ubicacion}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">
                                <i class="fas fa-user-tag"></i>
                                <span>Tipo de cuenta</span>
                            </div>
                            <div class="info-value">
                                
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">
                                <i class="fas fa-birthday-cake"></i>
                                <span>Edad</span>
                            </div>
                            <div class="info-value">${edad}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">
                                <i class="fas fa-calendar-plus"></i>
                                <span>Se unió</span>
                            </div>
                            <div class="info-value">${fechaRegistro}</div>
                        </div>
                        
                        ${usuario.genero ? `
                        <div class="info-item">
                            <div class="info-label">
                                <i class="fas fa-venus-mars"></i>
                                <span>Género</span>
                            </div>
                            <div class="info-value">${usuario.genero}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${usuario.biografia ? `
                    <div class="profile-bio-section">
                        <h3><i class="fas fa-quote-left"></i> Biografía</h3>
                        <div class="bio-content">
                            <p>${usuario.biografia}</p>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="profile-actions">
                        <button class="btn-profile-action btn-send-request" onclick="UsuariosDisponibles.enviarSolicitud('${usuario.id}')">
                            <i class="fas fa-user-plus"></i>
                            <span>Enviar solicitud de amistad</span>
                        </button>
                        
                        <button class="btn-profile-action btn-send-message" onclick="UsuariosDisponibles.enviarMensajeDesdePerfil('${usuario.id}', '${usuario.email}', '${usuario.nombre}')">
                            <i class="fas fa-comment-dots"></i>
                            <span>Enviar mensaje</span>
                        </button>
                    </div>
                </div>
            `;
            
            // Mostrar SweetAlert con el perfil
            Swal.fire({
                html: profileHTML,
                showCloseButton: true,
                showConfirmButton: false,
                width: '600px',
                customClass: {
                    popup: 'profile-modal'
                }
            });
            
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            Swal.fire('Error', 'No se pudo cargar el perfil del usuario', 'error');
        }
    },

    enviarMensajeDesdePerfil(usuarioId, email, nombre) {
    Swal.fire({
        title: `<div class="message-modal-header">
                    <div class="message-icon">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <h3>Enviar Mensaje</h3>
                </div>`,
        html: `
            <div class="message-modal-body">
                <div class="recipient-card">
                    <div class="recipient-avatar">
                        ${nombre.charAt(0).toUpperCase()}
                    </div>
                    <div class="recipient-info">
                        <h4 class="recipient-name">${nombre}</h4>
                        <p class="recipient-email">${email}</p>
                    </div>
                </div>
                
                <div class="message-form">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-tag"></i>
                            Asunto
                        </label>
                        <div class="subject-preview">
                            <span class="subject-text">¡Hola! 👋 Conectemos</span>
                            <button type="button" class="btn-change-subject" onclick="UsuariosDisponibles.cambiarAsunto()">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                        <div class="subject-options" id="subjectOptions" style="display: none;">
                            <div class="subject-option" onclick="UsuariosDisponibles.seleccionarAsunto('¡Hola! 👋 Conectemos')">
                                ¡Hola! 👋 Conectemos
                            </div>
                            <div class="subject-option" onclick="UsuariosDisponibles.seleccionarAsunto('Conocer gente nueva')">
                                Conocer gente nueva
                            </div>
                            <div class="subject-option" onclick="UsuariosDisponibles.seleccionarAsunto('Intereses en común')">
                                Intereses en común
                            </div>
                            <div class="subject-option" onclick="UsuariosDisponibles.seleccionarAsunto('Conversar un rato')">
                                Conversar un rato
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-comment-dots"></i>
                            Tu mensaje
                        </label>
                        <div class="message-container">
                            <textarea 
                                id="mensajeTexto" 
                                class="message-textarea" 
                                placeholder="Escribe un mensaje cordial...
Ejemplo: 'Hola, vi tu perfil y me pareció interesante. ¿Te gustaría conversar un rato?'"
                                rows="6"></textarea>
                            <div class="message-tips">
                                <i class="fas fa-lightbulb"></i>
                                <span>Sé amable y auténtico. Las mejores conversaciones empiezan con un simple "hola".</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="message-char-count">
                        <span id="charCount">0</span> / 500 caracteres
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-paper-plane"></i> Enviar Mensaje',
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            const mensaje = document.getElementById('mensajeTexto').value;
            const asunto = document.querySelector('.subject-text').textContent;
            
            if (!mensaje.trim()) {
                Swal.showValidationMessage('Por favor escribe un mensaje');
                return false;
            }
            
            if (mensaje.trim().length < 10) {
                Swal.showValidationMessage('Tu mensaje es muy corto. Escribe al menos 10 caracteres.');
                return false;
            }
            
            if (mensaje.trim().length > 500) {
                Swal.showValidationMessage('Tu mensaje es muy largo. Máximo 500 caracteres.');
                return false;
            }
            
            try {
                const response = await window.supabase
                    .from('mensajes')
                    .insert({
                        remitente_id: window.usuarioIdActual,
                        destinatario_email: email,
                        asunto: asunto,
                        contenido: mensaje,
                        leido: false
                        // NOTA: No incluyas 'tipo' porque no existe en tu tabla
                    });
                
                if (response.error) throw response.error;
                
                return true;
            } catch (error) {
                console.error('Error al enviar mensaje:', error);
                Swal.showValidationMessage(`Error al enviar: ${error.message}`);
                return false;
            }
        },
        allowOutsideClick: () => !Swal.isLoading(),
        width: '700px',
        customClass: {
            popup: 'premium-message-modal',
            confirmButton: 'btn-send-premium',
            cancelButton: 'btn-cancel-premium',
            actions: 'modal-actions-premium'
        },
        didOpen: () => {
            // Contador de caracteres
            const textarea = document.getElementById('mensajeTexto');
            const charCount = document.getElementById('charCount');
            
            textarea.addEventListener('input', function() {
                const length = this.value.length;
                charCount.textContent = length;
                
                if (length > 450) {
                    charCount.style.color = '#e74c3c';
                } else if (length > 300) {
                    charCount.style.color = '#f39c12';
                } else {
                    charCount.style.color = '#2ecc71';
                }
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: '<div class="success-animation"><i class="fas fa-check-circle"></i></div>',
                html: '<div class="success-message">¡Mensaje enviado exitosamente!<br><small>Será notificado cuando responda.</small></div>',
                icon: null,
                showConfirmButton: true,
                confirmButtonText: '<i class="fas fa-check"></i> ¡Genial!',
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    popup: 'success-modal',
                    confirmButton: 'btn-success-ok'
                }
            });
        }
    });
},

    async enviarSolicitud(amigoId) {
    try {
        // Primero verifica si ya existe una solicitud pendiente
        const { data: solicitudExistente, error: errorExistente } = await window.supabase
            .from('amistades')
            .select('*')
            .eq('usuario_id', window.usuarioIdActual)
            .eq('amigo_id', amigoId)
            .in('estado', ['pendiente', 'aceptada'])
            .single();
        
        if (solicitudExistente) {
            if (solicitudExistente.estado === 'pendiente') {
                Swal.fire('¡Ya enviada!', 'Ya has enviado una solicitud de amistad a este usuario', 'info');
                return;
            } else if (solicitudExistente.estado === 'aceptada') {
                Swal.fire('¡Ya son amigos!', 'Ya eres amigo de este usuario', 'info');
                return;
            }
        }
        
        // Verifica también si hay solicitud inversa
        const { data: solicitudInversa, error: errorInversa } = await window.supabase
            .from('amistades')
            .select('*')
            .eq('usuario_id', amigoId)
            .eq('amigo_id', window.usuarioIdActual)
            .in('estado', ['pendiente', 'aceptada'])
            .single();
        
        if (solicitudInversa) {
            if (solicitudInversa.estado === 'pendiente') {
                // El otro usuario ya envió solicitud, podemos aceptarla automáticamente
                const { error: errorAceptar } = await window.supabase
                    .from('amistades')
                    .update({ 
                        estado: 'aceptada',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', solicitudInversa.id);
                
                if (errorAceptar) throw errorAceptar;
                
                Swal.fire('¡Amistad aceptada!', 'Has aceptado la solicitud de amistad', 'success');
                this.cargarUsuariosDisponibles();
                return;
            } else if (solicitudInversa.estado === 'aceptada') {
                Swal.fire('¡Ya son amigos!', 'Ya eres amigo de este usuario', 'info');
                return;
            }
        }
        
        // Si no existe solicitud, crear una nueva
        const { error } = await window.supabase
            .from('amistades')
            .insert({
                usuario_id: window.usuarioIdActual,
                amigo_id: amigoId,
                estado: 'pendiente'
                // created_at y updated_at se generan automáticamente
            });
        
        if (error) throw error;
        
        // Actualizar interfaz
        Swal.fire({
            title: '¡Solicitud enviada!',
            text: 'Espera a que acepten tu solicitud de amistad',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
        
        // Recargar usuarios para actualizar estado
        this.cargarUsuariosDisponibles();
        
    } catch (error) {
        console.error('Error al enviar solicitud:', error);
        Swal.fire('Error', 'No se pudo enviar la solicitud: ' + error.message, 'error');
    }
},
    enviarMensajeDirecto(usuarioId) {
    // Obtener datos del usuario para el modal
    const usuario = window.listaUsuarios.find(u => u.id === usuarioId);
    if (usuario) {
        this.enviarMensajeDesdePerfil(usuarioId, usuario.email, usuario.nombre);
    }
},

    mostrarTutorial() {
        Swal.fire({
            title: '🎯 Cómo conectar con nuevos amigos',
            html: `
                <div class="tutorial-simple">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Explora perfiles</h4>
                            <p>Haz clic en "Ver perfil" para conocer más detalles de cada usuario</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Envía solicitudes</h4>
                            <p>Usa "Agregar amigo" para enviar solicitudes de amistad</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Chatea directamente</h4>
                            <p>Envía mensajes incluso antes de ser amigos</p>
                        </div>
                    </div>
                    <div class="tutorial-tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Los usuarios marcados con <span class="badge-example">★ Nuevo</span> se registraron hace menos de una semana</span>
                    </div>
                </div>
            `,
            confirmButtonText: 'Entendido',
            width: '500px'
        });
    },

    plantillaEstadoVacio() {
        return `
            <div class="empty-state-simple">
                <div class="empty-icon">
                    <i class="fas fa-user-friends"></i>
                </div>
                <h3>¡Excelente trabajo!</h3>
                <p>Todos los usuarios disponibles ya son tus amigos.</p>
                <div class="empty-actions">
                    <button class="btn-refresh" onclick="UsuariosDisponibles.cargarUsuariosDisponibles()">
                        <i class="fas fa-redo"></i>
                        Refrescar
                    </button>
                </div>
            </div>
        `;
    },

    mostrarErrorUsuarios() {
        const lista = document.getElementById('listaAmigos');
        if (lista) {
            lista.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error al cargar usuarios</h3>
                    <p>Intenta de nuevo más tarde</p>
                    <button class="btn-retry" onclick="UsuariosDisponibles.cargarUsuariosDisponibles()">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
};

// Añadir estilos CSS
document.addEventListener('DOMContentLoaded', function() {
    const estilos = document.createElement('style');
    estilos.textContent = `
        /* Header simple */
        .users-discovery-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #667eea;
        }
        
        .discovery-title-section {
            flex: 1;
        }
        
        .discovery-main-title {
            margin: 0;
            color: #2C3E50;
            font-size: 28px;
            font-weight: 700;
        }
        
        .discovery-subtitle {
            margin: 5px 0 0 0;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .btn-help-simple {
            background: transparent;
            border: 2px solid #667eea;
            color: #667eea;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s ease;
        }
        
        .btn-help-simple:hover {
            background: #667eea;
            color: white;
            transform: rotate(15deg);
        }
        
        /* Estadísticas simples */
        .stats-container {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
        }
        
        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            line-height: 1;
        }
        
        .stat-label {
            margin-top: 8px;
            color: #7f8c8d;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Grid de usuarios */
        .users-grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }
        
        /* Tarjeta de usuario simplificada */
        .user-discovery-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid #e8edf2;
        }
        
        .user-discovery-card.highlight-new {
            border: 2px solid #667eea;
        }
        
        .user-card-top {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .user-avatar-section {
            position: relative;
        }
        
        .user-avatar-discovery {
            width: 70px;
            height: 70px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .user-avatar-discovery img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .user-badges-container {
            position: absolute;
            top: -8px;
            right: -8px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .badge-new-user, .badge-github-user {
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 3px;
            color: white;
        }
        
        .badge-new-user {
            background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
        }
        
        .badge-github-user {
            background: #24292e;
            padding: 4px;
            width: 24px;
            height: 24px;
            justify-content: center;
        }
        
        .user-main-info {
            flex: 1;
        }
        
        .user-display-name {
            margin: 0 0 8px 0;
            color: #2C3E50;
            font-size: 18px;
            font-weight: 600;
        }
        
        .user-details {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 12px;
            color: #7f8c8d;
        }
        
        .user-details span {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .user-bio-section {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 10px;
            font-size: 13px;
            color: #5d6d7e;
            line-height: 1.5;
        }
        
        .user-contact-section {
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }
        
        .contact-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: #667eea;
        }
        
        /* Sección de acciones */
        .user-actions-section {
            margin-top: 15px;
        }
        
        .action-buttons {
            display: flex;
            gap: 10px;
        }
        
        .action-buttons button {
            flex: 1;
            padding: 10px 15px;
            border: none;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .btn-add-friend {
            background: #667eea;
            color: white;
        }
        
        .btn-add-friend:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        
        .btn-view-profile {
            background: #f8f9fa;
            color: #2C3E50;
            border: 1px solid #ddd;
        }
        
        .btn-view-profile:hover {
            background: #e9ecef;
            transform: translateY(-2px);
        }
        
        .btn-send-message {
            background: #48bb78;
            color: white;
        }
        
        .btn-send-message:hover {
            background: #38a169;
            transform: translateY(-2px);
        }
        
        .btn-sent {
            background: #cbd5e0;
            color: #718096;
            cursor: not-allowed;
        }
        
        /* Estados vacío y error */
        .empty-state-simple, .error-state {
            text-align: center;
            padding: 40px 20px;
            background: white;
            border-radius: 15px;
            margin-top: 20px;
        }
        
        .empty-icon, .error-icon {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 20px;
        }
        
        .error-icon {
            color: #e74c3c;
        }
        
        .empty-state-simple h3, .error-state h3 {
            margin: 0 0 10px 0;
            color: #2C3E50;
        }
        
        .empty-state-simple p, .error-state p {
            color: #7f8c8d;
            margin-bottom: 20px;
        }
        
        .btn-refresh, .btn-retry {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .btn-refresh:hover, .btn-retry:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        
        /* Estilos para el modal de perfil */
        .profile-modal .swal2-popup {
            padding: 0;
            border-radius: 20px;
        }
        
        .profile-modal-content {
            padding: 30px;
        }
        
        .profile-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .profile-avatar-large {
            width: 120px;
            height: 120px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .profile-avatar-large img, 
        .profile-avatar-large div {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .profile-title h2 {
            margin: 0 0 5px 0;
            color: #2C3E50;
            font-size: 24px;
        }
        
        .profile-subtitle {
            margin: 0;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .profile-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #667eea;
            font-size: 13px;
            font-weight: 600;
        }
        
        .info-value {
            color: #2C3E50;
            font-size: 15px;
        }
        
        .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .badge-premium {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
        }
        
        .badge-normal {
            background: #f8f9fa;
            color: #5d6d7e;
            border: 1px solid #ddd;
        }
        
        .profile-bio-section {
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
        }
        
        .profile-bio-section h3 {
            margin: 0 0 15px 0;
            color: #2C3E50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .bio-content p {
            margin: 0;
            color: #5d6d7e;
            line-height: 1.6;
        }
        
        .profile-actions {
            display: flex;
            gap: 15px;
            margin-top: 25px;
        }
        
        .btn-profile-action {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s ease;
        }
        
        .btn-send-request {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-send-request:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-send-message {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }
        
        .btn-send-message:hover {
            background: #667eea;
            color: white;
        }
        
        /* Tutorial simple */
        .tutorial-simple .tutorial-step {
            display: flex;
            gap: 15px;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .tutorial-simple .tutorial-step:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .tutorial-simple .step-number {
            width: 30px;
            height: 30px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .tutorial-simple .step-content h4 {
            margin: 0 0 5px 0;
            color: #2C3E50;
            font-size: 16px;
        }
        
        .tutorial-simple .step-content p {
            margin: 0;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .tutorial-simple .tutorial-tip {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f0f7ff;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            color: #2C3E50;
            font-size: 14px;
        }
        
        .badge-example {
            display: inline-block;
            background: #FF6B6B;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            margin: 0 4px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .users-grid-container {
                grid-template-columns: 1fr;
            }
            
            .stats-container {
                flex-direction: column;
                gap: 15px;
            }
            
            .stat-item {
                flex-direction: row;
                justify-content: space-between;
            }
            
            .profile-info-grid {
                grid-template-columns: 1fr;
            }
            
            .profile-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(estilos);
});

// Hacer disponible globalmente
window.UsuariosDisponibles = UsuariosDisponibles;