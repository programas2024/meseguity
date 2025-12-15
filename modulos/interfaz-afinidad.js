// Módulo de Interfaz para Afinidad
class InterfazAfinidad {
    constructor() {
        this.afinidadModule = window.Afinidad;
    }

    // Renderizar lista de amigos para seleccionar afinidad
    renderizarListaAmigosParaAfinidad(amigos) {
        const contenedor = document.getElementById('listaAmigosAfinidad');
        if (!contenedor) return;
        
        if (!amigos || amigos.length === 0) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends fa-3x"></i>
                    <h3>No tienes amigos</h3>
                    <p>Agrega amigos primero para poder establecer afinidades</p>
                    <button class="btn-primary" onclick="Interfaz.mostrarSeccion('seccionNuevosAmigos')">
                        <i class="fas fa-user-plus"></i> Explorar amigos
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '';
        amigos.forEach((amigo, index) => {
            const iniciales = window.Utilidades.obtenerIniciales(`${amigo.nombre || ''} ${amigo.apellidos || ''}`);
            
            html += `
                <div class="amigo-item" data-amigo-id="${amigo.id}" style="--item-index: ${index};">
                    <div class="amigo-avatar">
                        ${amigo.avatar_url ? 
                            `<img src="${amigo.avatar_url}" alt="${amigo.nombre}" loading="lazy">` : 
                            `<span>${iniciales}</span>`
                        }
                    </div>
                    <div class="amigo-info">
                        <h3 class="amigo-nombre">${amigo.nombre || ''} ${amigo.apellidos || ''}</h3>
                        <p class="amigo-email">${amigo.email}</p>
                    </div>
                    <div class="amigo-acciones">
                        <button class="btn-afinidad-select" onclick="seleccionarAmigoParaAfinidad('${amigo.id}')">
                            <i class="fas fa-handshake"></i> Establecer Afinidad
                        </button>
                    </div>
                </div>
            `;
        });
        
        contenedor.innerHTML = html;
    }

    // Mostrar modal para seleccionar tipo de afinidad
    async mostrarModalSeleccionAfinidad(amigoId) {
        try {
            // Obtener datos del amigo
            const { data: amigo, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', amigoId)
                .single();
            
            if (error) throw error;
            
            // Verificar si ya existe afinidad
            const afinidadExistente = await this.afinidadModule.obtenerAfinidadEntreUsuarios(amigoId);
            
            // Crear modal
            const modalHtml = `
                <div class="modal-afinidad-overlay" id="modalAfinidad">
                    <div class="modal-afinidad-content">
                        <div class="modal-afinidad-header">
                            <h2>
                                <i class="fas fa-handshake"></i>
                                ${afinidadExistente ? 'Cambiar Afinidad' : 'Establecer Afinidad'}
                            </h2>
                            <button class="modal-close" onclick="cerrarModalAfinidad()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-afinidad-body">
                            <div class="amigo-info-modal">
                                <div class="amigo-avatar-modal">
                                    ${amigo.avatar_url ? 
                                        `<img src="${amigo.avatar_url}" alt="${amigo.nombre}">` : 
                                        `<span>${amigo.nombre ? amigo.nombre.charAt(0).toUpperCase() : 'A'}</span>`
                                    }
                                </div>
                                <div class="amigo-details-modal">
                                    <h3>${amigo.nombre || ''} ${amigo.apellidos || ''}</h3>
                                    <p>${amigo.email}</p>
                                    ${afinidadExistente ? 
                                        `<div class="current-affinity">
                                            <i class="fas fa-tag"></i>
                                            Afinidad actual: <strong>${this.getTipoAfinidadLabel(afinidadExistente.tipo_afinidad)}</strong>
                                            (${afinidadExistente.estado === 'aceptada' ? 'Aceptada' : 'Pendiente'})
                                        </div>` : ''
                                    }
                                </div>
                            </div>
                            
                            <div class="afinidad-options">
                                <h4>Selecciona el tipo de afinidad:</h4>
                                <div class="options-grid">
                                    ${this.afinidadModule.tiposAfinidad.map(tipo => `
                                        <div class="afinidad-option" data-tipo="${tipo.value}" 
                                             onclick="seleccionarTipoAfinidad('${tipo.value}')"
                                             style="border-color: ${tipo.color};">
                                            <div class="option-icon" style="background: ${tipo.color};">
                                                <i class="${tipo.icon}"></i>
                                            </div>
                                            <div class="option-content">
                                                <h5>${tipo.label}</h5>
                                                <p>${tipo.description}</p>
                                            </div>
                                            <div class="option-select">
                                                <i class="fas fa-check"></i>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="afinidad-nota">
                                <label for="notaAfinidad">
                                    <i class="fas fa-sticky-note"></i> Nota (opcional):
                                </label>
                                <textarea id="notaAfinidad" 
                                          placeholder="Agrega un mensaje personal para tu amigo..."
                                          rows="3">${afinidadExistente ? afinidadExistente.nota || '' : ''}</textarea>
                            </div>
                            
                            <div class="modal-afinidad-actions">
                                <button class="btn-primary" onclick="enviarSolicitudAfinidad('${amigoId}')">
                                    <i class="fas fa-paper-plane"></i>
                                    ${afinidadExistente ? 'Actualizar Solicitud' : 'Enviar Solicitud'}
                                </button>
                                <button class="btn-secondary" onclick="cerrarModalAfinidad()">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                                ${afinidadExistente ? `
                                    <button class="btn-danger" onclick="eliminarAfinidadExistente('${afinidadExistente.id}')">
                                        <i class="fas fa-trash"></i> Eliminar Afinidad
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Configurar eventos
            setTimeout(() => {
                const modal = document.getElementById('modalAfinidad');
                if (modal) {
                    // Seleccionar tipo actual si existe
                    if (afinidadExistente) {
                        this.seleccionarTipoAfinidad(afinidadExistente.tipo_afinidad);
                    }
                    
                    // Cerrar al hacer clic fuera
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            cerrarModalAfinidad();
                        }
                    });
                    
                    // Cerrar con Escape
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                            cerrarModalAfinidad();
                        }
                    });
                }
            }, 100);
            
        } catch (error) {
            console.error('Error al mostrar modal de afinidad:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cargar la información del amigo', 'error');
        }
    }

    // Seleccionar tipo de afinidad en el modal
    seleccionarTipoAfinidad(tipo) {
        document.querySelectorAll('.afinidad-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.tipo === tipo) {
                option.classList.add('selected');
            }
        });
    }

    // Renderizar lista de afinidades
    async renderizarListaAfinidades() {
        try {
            const afinidades = await this.afinidadModule.obtenerAfinidadesUsuario();
            const contenedor = document.getElementById('listaAfinidades');
            
            if (!contenedor) return;
            
            if (!afinidades || afinidades.length === 0) {
                contenedor.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-handshake fa-3x"></i>
                        <h3>No tienes afinidades</h3>
                        <p>Establece afinidades con tus amigos para verlas aquí</p>
                        <button class="btn-primary" onclick="Interfaz.mostrarSeccion('seccionAfinidad')">
                            <i class="fas fa-handshake"></i> Establecer Afinidades
                        </button>
                    </div>
                `;
                return;
            }
            
            let html = '';
            
            // Separar por estado
            const afinidadesAceptadas = afinidades.filter(a => a.estado === 'aceptada');
            const afinidadesPendientes = afinidades.filter(a => a.estado === 'pendiente');
            const afinidadesOtras = afinidades.filter(a => !['aceptada', 'pendiente'].includes(a.estado));
            
            // Afinidades aceptadas
            if (afinidadesAceptadas.length > 0) {
                html += `
                    <div class="afinidad-section">
                        <h3 class="section-subtitle">
                            <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                            Afinidades Aceptadas (${afinidadesAceptadas.length})
                        </h3>
                        <div class="afinidades-grid">
                            ${afinidadesAceptadas.map(afinidad => this.renderizarItemAfinidad(afinidad)).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Solicitudes pendientes (recibidas)
            if (afinidadesPendientes.length > 0) {
                html += `
                    <div class="afinidad-section">
                        <h3 class="section-subtitle">
                            <i class="fas fa-clock" style="color: #FF9800;"></i>
                            Solicitudes Pendientes (${afinidadesPendientes.length})
                        </h3>
                        <div class="afinidades-grid">
                            ${afinidadesPendientes.map(afinidad => this.renderizarItemAfinidad(afinidad)).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Otras afinidades
            if (afinidadesOtras.length > 0) {
                html += `
                    <div class="afinidad-section">
                        <h3 class="section-subtitle">
                            <i class="fas fa-history" style="color: #9E9E9E;"></i>
                            Otras Afinidades (${afinidadesOtras.length})
                        </h3>
                        <div class="afinidades-grid">
                            ${afinidadesOtras.map(afinidad => this.renderizarItemAfinidad(afinidad)).join('')}
                        </div>
                    </div>
                `;
            }
            
            contenedor.innerHTML = html;
            
        } catch (error) {
            console.error('Error al renderizar lista de afinidades:', error);
        }
    }

    // Renderizar un ítem de afinidad
    renderizarItemAfinidad(afinidad) {
        const esUsuarioSolicitante = afinidad.usuario_id === window.usuarioIdActual;
        const amigo = esUsuarioSolicitante ? afinidad.amigo : afinidad.usuario;
        const tipoAfinidad = this.getTipoAfinidadInfo(afinidad.tipo_afinidad);
        const fecha = new Date(afinidad.creado_en).toLocaleDateString('es-ES');
        
        let estadoBadge = '';
        switch (afinidad.estado) {
            case 'aceptada':
                estadoBadge = '<span class="badge badge-success">Aceptada</span>';
                break;
            case 'pendiente':
                estadoBadge = esUsuarioSolicitante 
                    ? '<span class="badge badge-warning">Esperando respuesta</span>'
                    : '<span class="badge badge-info">¡Nueva solicitud!</span>';
                break;
            case 'rechazada':
                estadoBadge = '<span class="badge badge-danger">Rechazada</span>';
                break;
            case 'cancelada':
                estadoBadge = '<span class="badge badge-secondary">Cancelada</span>';
                break;
        }
        
        return `
            <div class="afinidad-item" data-afinidad-id="${afinidad.id}">
                <div class="afinidad-header">
                    <div class="afinidad-avatar">
                        ${amigo.avatar_url ? 
                            `<img src="${amigo.avatar_url}" alt="${amigo.nombre}">` : 
                            `<span>${amigo.nombre ? amigo.nombre.charAt(0).toUpperCase() : 'A'}</span>`
                        }
                    </div>
                    <div class="afinidad-info">
                        <h4>${amigo.nombre || ''} ${amigo.apellidos || ''}</h4>
                        <div class="afinidad-meta">
                            <span class="afinidad-tipo" style="color: ${tipoAfinidad.color};">
                                <i class="${tipoAfinidad.icon}"></i> ${tipoAfinidad.label}
                            </span>
                            <span class="afinidad-fecha">
                                <i class="fas fa-calendar"></i> ${fecha}
                            </span>
                            ${estadoBadge}
                        </div>
                    </div>
                </div>
                
                ${afinidad.nota ? `
                    <div class="afinidad-nota-preview">
                        <i class="fas fa-sticky-note"></i> ${afinidad.nota}
                    </div>
                ` : ''}
                
                <div class="afinidad-actions">
                    ${afinidad.estado === 'pendiente' && !esUsuarioSolicitante ? `
                        <button class="btn-success btn-sm" onclick="responderSolicitudAfinidad('${afinidad.id}', 'aceptada')">
                            <i class="fas fa-check"></i> Aceptar
                        </button>
                        <button class="btn-danger btn-sm" onclick="responderSolicitudAfinidad('${afinidad.id}', 'rechazada')">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : ''}
                    
                    ${afinidad.estado === 'pendiente' && esUsuarioSolicitante ? `
                        <button class="btn-warning btn-sm" onclick="cancelarSolicitudAfinidad('${afinidad.id}')">
                            <i class="fas fa-ban"></i> Cancelar
                        </button>
                    ` : ''}
                    
                    <button class="btn-info btn-sm" onclick="verDetalleAfinidad('${afinidad.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    
                    <button class="btn-danger btn-sm" onclick="eliminarAfinidad('${afinidad.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    // Renderizar estadísticas
    async renderizarEstadisticasAfinidad() {
        try {
            const estadisticas = await this.afinidadModule.obtenerEstadisticasAfinidad();
            const contenedor = document.getElementById('estadisticasAfinidad');
            
            if (!contenedor) return;
            
            contenedor.innerHTML = `
                <div class="estadisticas-grid">
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.total}</h3>
                            <p>Total Afinidades</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.confidentes}</h3>
                            <p>Confidentes</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <i class="fas fa-user-friends"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.amigos}</h3>
                            <p>Amigos</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.hermanos}</h3>
                            <p>Hermanos</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.pendientes}</h3>
                            <p>Pendientes</p>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error al renderizar estadísticas:', error);
        }
    }

    // Obtener información del tipo de afinidad
    getTipoAfinidadInfo(tipo) {
        return this.afinidadModule.tiposAfinidad.find(t => t.value === tipo) || 
               { label: tipo, icon: 'fas fa-question', color: '#999' };
    }

    // Obtener etiqueta del tipo de afinidad
    getTipoAfinidadLabel(tipo) {
        const info = this.getTipoAfinidadInfo(tipo);
        return info.label || tipo;
    }
}

// Exportar módulo
window.InterfazAfinidad = new InterfazAfinidad();